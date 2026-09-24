'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioContextManager } from '@/services/audioContext';
import { YinPitchDetector, PitchResult } from '@/services/yinPitchDetector';
import {
  MandarinTone,
  PitchRecordPoint,
  ToneScoreResult,
  semitoneNormalize,
  calculateMedianF0,
  scorePitchContour,
} from '@/services/toneScorer';

export interface UsePitchDetectorOptions {
  initialTargetTone?: MandarinTone;
  maxDurationMs?: number; // Thời lượng tối đa 1 lượt ghi âm (mặc định 1800ms)
  onPitchSample?: (result: PitchResult, chao: number) => void;
  onAnalysisComplete?: (result: ToneScoreResult) => void;
}

export function usePitchDetector(options: UsePitchDetectorOptions = {}) {
  const {
    initialTargetTone = 1,
    maxDurationMs = 1800,
    onPitchSample,
    onAnalysisComplete,
  } = options;

  const [targetTone, setTargetTone] = useState<MandarinTone>(initialTargetTone);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentPitch, setCurrentPitch] = useState<number>(0);
  const [currentClarity, setCurrentClarity] = useState<number>(0);
  const [currentRms, setCurrentRms] = useState<number>(0);
  const [isVoiced, setIsVoiced] = useState<boolean>(false);
  const [pitchHistory, setPitchHistory] = useState<PitchRecordPoint[]>([]);
  const [toneResult, setToneResult] = useState<ToneScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMicrophoneAllowed, setIsMicrophoneAllowed] = useState<boolean>(true);

  // Audio nodes and references
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const yinDetectorRef = useRef<YinPitchDetector | null>(null);

  // Static buffers to prevent Garbage Collection pauses
  const timeDomainBufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const livePitchesRef = useRef<PitchRecordPoint[]>([]);

  // Baseline median pitch tracking
  const runningF0ValuesRef = useRef<number[]>([]);

  // Asynchronous request sequence counter to prevent race conditions on rapid start/stop
  const requestSeqRef = useRef<number>(0);

  /**
   * Dọn dẹp tài nguyên microphone và audio loop
   */
  const cleanupStream = useCallback(() => {
    requestSeqRef.current += 1;

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // Safe ignore on already disconnected node
      }
      sourceNodeRef.current = null;
    }

    analyserRef.current = null;
  }, []);

  /**
   * Dừng thu âm và tính toán điểm khớp thanh điệu
   */
  const stopRecording = useCallback(() => {
    requestSeqRef.current += 1;
    cleanupStream();
    setIsRecording(false);

    // Chấm điểm lượt thu âm vừa hoàn thành
    const recordedPoints = livePitchesRef.current;
    if (recordedPoints.length > 0) {
      const median = calculateMedianF0(runningF0ValuesRef.current, 180);
      const finalResult = scorePitchContour(recordedPoints, targetTone, median);
      setToneResult(finalResult);
      onAnalysisComplete?.(finalResult);
    }
  }, [cleanupStream, targetTone, onAnalysisComplete]);

  /**
   * Bắt đầu thu âm với Web Audio API và YIN 60 FPS loop
   */
  const startRecording = useCallback(async () => {
    const currentSeq = ++requestSeqRef.current;
    setError(null);
    setToneResult(null);
    setPitchHistory([]);
    livePitchesRef.current = [];
    runningF0ValuesRef.current = [];

    try {
      // 1. Mở khóa AudioContext bằng Singleton AudioContextManager
      const manager = AudioContextManager.getInstance();
      const audioCtx = await manager.getOrCreateContext();
      audioContextRef.current = audioCtx;

      // 2. Yêu cầu microphone stream với constraints tối ưu cho phân tích F0
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Giữ chi tiết sóng âm để YIN dò tìm chính xác
          autoGainControl: true,   // Ổn định biên độ cho micro
        },
        video: false,
      };

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ WebRTC / MediaDevices.');
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Kiểm tra nếu người dùng đã bấm stop hoặc component unmount trong lúc chờ cấp quyền
      if (currentSeq !== requestSeqRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setIsMicrophoneAllowed(true);

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserNode.smoothingTimeConstant = 0.0; // Raw real-time frame
      analyserRef.current = analyserNode;

      // QUAN TRỌNG: Nối source -> analyser. KHÔNG NỐI vào audioCtx.destination để tránh rú mic!
      sourceNode.connect(analyserNode);

      // 3. Khởi tạo thuật toán YIN DSP với buffer tĩnh
      const bufferSize = analyserNode.fftSize;
      yinDetectorRef.current = new YinPitchDetector(
        audioCtx.sampleRate,
        bufferSize,
        0.12, // theta threshold
        80,   // minFrequency (Hz)
        450,  // maxFrequency (Hz)
        0.015 // rmsThreshold VAD
      );
      timeDomainBufferRef.current = new Float32Array(new ArrayBuffer(bufferSize * Float32Array.BYTES_PER_ELEMENT));

      setIsRecording(true);
      recordingStartTimeRef.current = performance.now();

      // 4. Vòng lặp Real-Time 60 FPS
      const loop = () => {
        if (!analyserRef.current || !yinDetectorRef.current || !timeDomainBufferRef.current) {
          return;
        }

        const now = performance.now();
        const elapsed = now - recordingStartTimeRef.current;

        // Trích xuất buffer miền thời gian
        analyserRef.current.getFloatTimeDomainData(timeDomainBufferRef.current);

        // Chạy thuật toán YIN DSP (<1.0ms)
        const result = yinDetectorRef.current.detectPitch(timeDomainBufferRef.current);

        // Cập nhật thống kê F0 động
        if (result.isVoiced && result.f0 >= 75 && result.f0 <= 480) {
          runningF0ValuesRef.current.push(result.f0);
        }

        // Tính trung vị hiện tại
        const currentMedian = calculateMedianF0(runningF0ValuesRef.current, 180);
        const chaoVal = result.isVoiced ? semitoneNormalize(result.f0, currentMedian) : 1.0;

        setCurrentPitch(result.f0);
        setCurrentClarity(result.clarity);
        setCurrentRms(result.rms);
        setIsVoiced(result.isVoiced);

        const point: PitchRecordPoint = {
          timeMs: Math.round(elapsed),
          f0: result.f0,
          chaoLevel: chaoVal,
          rms: result.rms,
          clarity: result.clarity,
          isVoiced: result.isVoiced,
        };

        livePitchesRef.current.push(point);
        setPitchHistory([...livePitchesRef.current]);

        onPitchSample?.(result, chaoVal);

        // Kiểm tra thời lượng tối đa cho 1 âm tiết
        if (elapsed < maxDurationMs) {
          animFrameIdRef.current = requestAnimationFrame(loop);
        } else {
          stopRecording();
        }
      };

      animFrameIdRef.current = requestAnimationFrame(loop);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      cleanupStream();
      setIsRecording(false);

      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setIsMicrophoneAllowed(false);
        setError('Quyền truy cập Microphone bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt để tiếp tục.');
      } else {
        setError(e.message || 'Lỗi không xác định khi kết nối với Microphone.');
      }
    }
  }, [cleanupStream, maxDurationMs, onPitchSample, stopRecording]);

  const clearHistory = useCallback(() => {
    setPitchHistory([]);
    setToneResult(null);
    setCurrentPitch(0);
    setCurrentClarity(0);
    setCurrentRms(0);
    setIsVoiced(false);
    livePitchesRef.current = [];
    runningF0ValuesRef.current = [];
  }, []);

  // Cleanup khi hook unmount
  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  return {
    startRecording,
    stopRecording,
    isRecording,
    currentPitch,
    currentClarity,
    currentRms,
    isVoiced,
    pitchHistory,
    toneResult,
    error,
    isMicrophoneAllowed,
    targetTone,
    setTargetTone,
    clearHistory,
  };
}
