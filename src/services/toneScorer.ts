/**
 * toneScorer.ts
 * Chinese 4 Tones Chao Model (五度标记法), Gender-Neutral Semitone Normalizer & Pedagogical Scorer.
 *
 * Implements:
 * 1. Chao 5-Level Target Pitch Curves (100 normalized time steps t in [0, 1]):
 *    - Tone 1 (55): Constant y(t) = 5.0
 *    - Tone 2 (35): Rising y(t) = 3.0 + 2.0 * t^0.9
 *    - Tone 3 (214): Dipping y(t) = drops from 2.14 to 1.0 at t ≈ 0.45, then rises to 4.0 at t = 1.0
 *    - Tone 4 (51): Falling sharply y(t) = 5.0 - 4.0 * t^0.8
 * 2. Semitone Normalization relative to dynamic median frequency (Fmedian):
 *    S = 12 * log2(F0 / Fmedian)
 *    Chao = 3.0 + (S / 6.0) * 2.0
 * 3. Tone Scoring:
 *    - Slope trend correlation + Mean distance error
 *    - Pedagogical Vietnamese coaching advice
 */

export type MandarinTone = 1 | 2 | 3 | 4;

export interface ChaoPoint {
  t: number;      // 0.0 -> 1.0 (normalized time)
  chao: number;   // 1.0 -> 5.0 (Chao level)
}

export interface PitchRecordPoint {
  timeMs: number;
  f0: number;         // Hz
  chaoLevel: number;  // 1.0 -> 5.0
  rms: number;
  clarity: number;
  isVoiced: boolean;
}

export interface ToneScoreResult {
  matchScore: number;                 // 0 -> 100 (%)
  detectedTone: MandarinTone | null;
  targetTone: MandarinTone;
  feedbackVi: string;
  meanChaoError: number;
  slopeCorrelation: number;
  userMedianHz: number;
}

export interface ToneMetadata {
  tone: MandarinTone;
  nameVi: string;
  nameZh: string;
  pinyinName: string;
  chaoCode: string;
  descriptionVi: string;
  colorHex: string;
}

export const TONE_METADATA: Record<MandarinTone, ToneMetadata> = {
  1: {
    tone: 1,
    nameVi: 'Thanh 1 (Âm Bình)',
    nameZh: '阴平',
    pinyinName: 'Yīnpíng',
    chaoCode: '55',
    descriptionVi: 'Cao bằng, giữ hơi đều ở đỉnh cao nhất',
    colorHex: '#06B6D4', // Cyan
  },
  2: {
    tone: 2,
    nameVi: 'Thanh 2 (Dương Bình)',
    nameZh: '阳平',
    pinyinName: 'Yángpíng',
    chaoCode: '35',
    descriptionVi: 'Lên bổng, vút nhanh từ bậc 3 lên bậc 5',
    colorHex: '#F59E0B', // Amber
  },
  3: {
    tone: 3,
    nameVi: 'Thanh 3 (Thượng Thanh)',
    nameZh: '上声',
    pinyinName: 'Shǎngshēng',
    chaoCode: '214',
    descriptionVi: 'Uốn trầm, hạ sâu đáy bậc 1 rồi vuốt nhẹ lên bậc 4',
    colorHex: '#10B981', // Emerald
  },
  4: {
    tone: 4,
    nameVi: 'Thanh 4 (Khứ Thanh)',
    nameZh: '去声',
    pinyinName: 'Qùshēng',
    chaoCode: '51',
    descriptionVi: 'Rơi dốc dứt khoát từ bậc 5 xuống bậc 1',
    colorHex: '#EF4444', // Red
  },
};

/**
 * Tính giá trị Chao lý thuyết y(t) tại thời điểm chuẩn hóa t in [0, 1]
 */
export function getChaoTargetValue(tone: MandarinTone, t: number): number {
  const clampedT = Math.max(0.0, Math.min(1.0, t));

  switch (tone) {
    case 1:
      // Tone 1 (55): Constant y(t) = 5.0
      return 5.0;

    case 2:
      // Tone 2 (35): Rising y(t) = 3.0 + 2.0 * t^0.9
      return Math.min(5.0, 3.0 + 2.0 * Math.pow(clampedT, 0.9));

    case 3:
      // Tone 3 (214): Dipping curve
      // drops from 2.14 to 1.0 at t ≈ 0.45, then rises to 4.0 at t = 1.0
      if (clampedT <= 0.45) {
        const p = clampedT / 0.45;
        // Smooth drop from 2.14 to 1.0
        return 2.14 - 1.14 * Math.sin(p * (Math.PI / 2));
      } else {
        const p = (clampedT - 0.45) / 0.55;
        // Smooth rise from 1.0 to 4.0
        return 1.0 + 3.0 * Math.pow(p, 1.15);
      }

    case 4:
      // Tone 4 (51): Falling sharply y(t) = 5.0 - 4.0 * t^0.8
      return Math.max(1.0, 5.0 - 4.0 * Math.pow(clampedT, 0.8));

    default:
      return 3.0;
  }
}

/**
 * Sinh ra 100 điểm mẫu đường cong Chao chuẩn cho thanh điệu tương ứng
 */
export function generateChaoCurve(tone: MandarinTone, steps: number = 100): ChaoPoint[] {
  const points: ChaoPoint[] = new Array(steps);
  const denominator = Math.max(1, steps - 1);

  for (let i = 0; i < steps; i++) {
    const t = i / denominator;
    const chao = Math.round(getChaoTargetValue(tone, t) * 100) / 100;
    points[i] = { t, chao };
  }

  return points;
}

/**
 * Chuẩn hóa bán cung (Semitone Normalization) relative to dynamic median Fmedian:
 * S = 12 * log2(F0 / Fmedian)
 * Chao = 3.0 + (S / 6.0) * 2.0
 * Triệt tiêu hoàn toàn sự khác biệt giữa giọng nam trầm (120Hz) và giọng nữ cao (240Hz).
 */
export function semitoneNormalize(f0: number, medianF0: number): number {
  if (f0 <= 0 || medianF0 <= 0) {
    return 1.0;
  }

  // Bán cung lệch so với trung vị cá nhân
  const semitones = 12.0 * Math.log2(f0 / medianF0);

  // Ánh xạ dải [-6 bán cung, +6 bán cung] vào thang Chao [1.0, 5.0]
  const chao = 3.0 + (semitones / 6.0) * 2.0;

  // Giới hạn trong khoảng thang điểm Chao 1.0 đến 5.0
  return Math.max(1.0, Math.min(5.0, Math.round(chao * 100) / 100));
}

/**
 * Tính toán trung vị F0 động (dynamic median) từ danh sách tần số thu âm được
 */
export function calculateMedianF0(f0Values: number[], defaultBaseline: number = 180): number {
  const validPitches = f0Values
    .filter((f) => f >= 75 && f <= 480)
    .sort((a, b) => a - b);

  if (validPitches.length === 0) {
    return defaultBaseline;
  }

  const mid = Math.floor(validPitches.length / 2);
  if (validPitches.length % 2 === 1) {
    return validPitches[mid];
  }
  return (validPitches[mid - 1] + validPitches[mid]) / 2;
}

/**
 * Nội suy lại một chuỗi điểm cao độ thành N bước thời gian chuẩn hóa [0, 1]
 */
export function resampleContour(
  rawPoints: Array<{ timeMs?: number; chaoLevel: number }>,
  targetSteps: number = 50
): number[] {
  if (rawPoints.length === 0) {
    return new Array(targetSteps).fill(3.0);
  }
  if (rawPoints.length === 1) {
    return new Array(targetSteps).fill(rawPoints[0].chaoLevel);
  }

  const result: number[] = new Array(targetSteps);
  const srcLen = rawPoints.length;

  for (let i = 0; i < targetSteps; i++) {
    const normT = i / (targetSteps - 1);
    const srcIndex = normT * (srcLen - 1);
    const low = Math.floor(srcIndex);
    const high = Math.min(srcLen - 1, Math.ceil(srcIndex));
    const fraction = srcIndex - low;

    const valLow = rawPoints[low].chaoLevel;
    const valHigh = rawPoints[high].chaoLevel;
    result[i] = valLow + fraction * (valHigh - valLow);
  }

  return result;
}

/**
 * Tính hệ số tương quan Pearson giữa hai chuỗi số
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return Math.max(-1.0, Math.min(1.0, numerator / denominator));
}

/**
 * Thuật toán chấm điểm đường cong cao độ của học viên so với thanh điệu mục tiêu
 */
export function scorePitchContour(
  userPoints: PitchRecordPoint[],
  targetTone: MandarinTone,
  providedMedian?: number
): ToneScoreResult {
  // Lọc các điểm có tiếng nói và cao độ hợp lệ
  const voicedPoints = userPoints.filter((p) => p.isVoiced && p.f0 >= 75 && p.f0 <= 480);

  if (voicedPoints.length < 5) {
    return {
      matchScore: 0,
      detectedTone: null,
      targetTone,
      feedbackVi: 'Chưa phát hiện đủ âm thanh có cao độ rõ ràng. Vui lòng nói to, rõ và dứt khoát hơn!',
      meanChaoError: 4.0,
      slopeCorrelation: 0,
      userMedianHz: providedMedian || 180,
    };
  }

  // Xác định trung vị cá nhân
  const medianHz = providedMedian && providedMedian > 0
    ? providedMedian
    : calculateMedianF0(voicedPoints.map((p) => p.f0));

  // Chuẩn hóa lại các điểm theo trung vị cá nhân
  const normalizedUserPoints = voicedPoints.map((p) => ({
    timeMs: p.timeMs,
    chaoLevel: semitoneNormalize(p.f0, medianHz),
  }));

  const steps = 50;
  const resampledUser = resampleContour(normalizedUserPoints, steps);

  // Đánh giá với tất cả 4 thanh để tìm detectedTone
  let bestScore = -1;
  let bestTone: MandarinTone = targetTone;
  const candidateScores: Record<MandarinTone, { score: number; mae: number; corr: number }> = {
    1: { score: 0, mae: 0, corr: 0 },
    2: { score: 0, mae: 0, corr: 0 },
    3: { score: 0, mae: 0, corr: 0 },
    4: { score: 0, mae: 0, corr: 0 },
  };

  const tones: MandarinTone[] = [1, 2, 3, 4];
  for (const t of tones) {
    const targetPoints = generateChaoCurve(t, steps).map((p) => p.chao);

    // 1. Mean Absolute Error (MAE)
    let totalAbsDiff = 0;
    for (let i = 0; i < steps; i++) {
      totalAbsDiff += Math.abs(resampledUser[i] - targetPoints[i]);
    }
    const mae = totalAbsDiff / steps;
    // MAE = 0 -> 100%, MAE = 2.0 -> 50%
    const distanceScore = Math.max(0, 100 - mae * 25);

    // 2. Slope / Contour Trend
    let slopeScore = 50;
    let correlation = 0;

    if (t === 1) {
      // Thanh 1: đường chuẩn nằm ngang không đổi. Đo độ dao động (variance/stdDev) của học viên
      let meanUser = 0;
      for (let i = 0; i < steps; i++) meanUser += resampledUser[i];
      meanUser /= steps;

      let variance = 0;
      for (let i = 0; i < steps; i++) {
        const d = resampledUser[i] - meanUser;
        variance += d * d;
      }
      const stdDev = Math.sqrt(variance / steps);
      // StdDev < 0.2 Chao là rất phẳng (100%), > 1.0 Chao là dao động mạnh
      slopeScore = Math.max(0, Math.min(100, 100 - Math.max(0, stdDev - 0.15) * 80));
      correlation = stdDev < 0.35 ? 0.95 : Math.max(0, 1.0 - stdDev);
    } else {
      correlation = calculatePearsonCorrelation(resampledUser, targetPoints);
      // Ánh xạ r in [-1, 1] sang [0, 100]
      slopeScore = Math.max(0, Math.min(100, ((correlation + 1) / 2) * 100));
    }

    // Điểm tổng hợp trọng số: 45% khoảng cách Chao, 55% hướng độ dốc
    const combined = Math.round(0.45 * distanceScore + 0.55 * slopeScore);
    candidateScores[t] = { score: combined, mae, corr: correlation };

    if (combined > bestScore) {
      bestScore = combined;
      bestTone = t;
    }
  }

  const targetResult = candidateScores[targetTone];
  const finalScore = targetResult.score;
  const detectedTone = bestScore >= 55 ? bestTone : null;

  // Tạo lời khuyên sư phạm (pedagogical feedback) bằng tiếng Việt
  const feedbackVi = generatePedagogicalFeedback(
    targetTone,
    finalScore,
    detectedTone,
    resampledUser
  );

  return {
    matchScore: finalScore,
    detectedTone,
    targetTone,
    feedbackVi,
    meanChaoError: Math.round(targetResult.mae * 100) / 100,
    slopeCorrelation: Math.round(targetResult.corr * 100) / 100,
    userMedianHz: Math.round(medianHz * 10) / 10,
  };
}

/**
 * Sinh lời khuyên sư phạm chi tiết và chuẩn ngôn ngữ sư phạm tiếng Việt
 */
function generatePedagogicalFeedback(
  targetTone: MandarinTone,
  score: number,
  detectedTone: MandarinTone | null,
  userCurve: number[]
): string {
  if (score >= 85) {
    switch (targetTone) {
      case 1:
        return 'Rất chuẩn! Cao độ ổn định ở tầng cao (Chao 55), trường độ đều đặn.';
      case 2:
        return 'Rất chuẩn! Độ vút từ tầng trung lên đỉnh cao (Chao 35) rất thanh thoát và dứt khoát.';
      case 3:
        return 'Rất chuẩn! Uốn giọng mượt mà, chạm đáy tầng 1 rồi vút nhẹ lên tầng 4 hoàn hảo.';
      case 4:
        return 'Rất chuẩn! Rơi giọng mạnh mẽ và dứt khoát từ đỉnh 5 xuống đáy 1 (Chao 51).';
    }
  }

  if (score >= 65) {
    switch (targetTone) {
      case 1:
        return 'Khá tốt! Hãy giữ hơi đều hơn để cao độ không bị chùng xuống ở cuối âm.';
      case 2:
        return 'Khá tốt! Cần đẩy cao độ lên bổng hơn về cuối âm để chạm tới bậc 5.';
      case 3:
        return 'Khá tốt! Hãy hạ giọng xuống trầm hơn trước khi vuốt ngược lên.';
      case 4:
        return 'Khá tốt! Rơi giọng dứt khoát hơn một chút nữa và ngắt âm gọn gàng.';
    }
  }

  // Điểm dưới 65: Phân tích lỗi cụ thể
  if (detectedTone !== null && detectedTone !== targetTone) {
    const toneNames: Record<MandarinTone, string> = {
      1: 'Thanh 1 (ngang bằng)',
      2: 'Thanh 2 (lên bổng)',
      3: 'Thanh 3 (uốn trầm)',
      4: 'Thanh 4 (rơi dốc)',
    };
    return `Âm của bạn đang thiên về ${toneNames[detectedTone]}. Hãy lắng nghe lại âm mẫu và điều chỉnh hướng giọng!`;
  }

  // Kiểm tra xu hướng đầu - cuối của userCurve
  const startChao = userCurve[0];
  const endChao = userCurve[userCurve.length - 1];

  switch (targetTone) {
    case 1:
      return 'Thanh 1 cần giữ ngang ở mức cao (bậc 5), tránh uốn lượn hay hạ giọng xuống thấp.';
    case 2:
      if (endChao <= startChao) {
        return 'Giọng chưa có độ nâng! Hãy bắt đầu ở mức 3 rồi vuốt bổng lên như dấu sắc tiếng Việt.';
      }
      return 'Cần đẩy cao độ lên bổng hơn về cuối âm để đạt đỉnh bậc 5.';
    case 3:
      return 'Hạ giọng xuống trầm hơn trước khi vuốt lên, điểm rơi sâu nhất cần chạm đáy bậc 1.';
    case 4:
      if (startChao < 4.0) {
        return 'Xuất phát điểm chưa đủ cao! Bắt đầu từ mức 5 rồi dội thẳng xuống mức 1 dứt khoát.';
      }
      return 'Rơi giọng quá nông, cần dứt khoát hơn từ đỉnh dội thẳng xuống đáy.';
    default:
      return 'Hãy thả lỏng thanh quản, nói to rõ ràng và đối chiếu với đường cong màu vàng.';
  }
}
