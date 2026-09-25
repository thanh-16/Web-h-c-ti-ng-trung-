'use client';

import React, { useEffect, useRef } from 'react';

interface ParallaxCalligraphyCanvasProps {
  className?: string;
}

interface FloatingElement {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  speedX: number;
  speedY: number;
  char?: string;
  size: number;
  opacity: number;
  depth: number; // 0.3 (xa) đến 1.2 (gần) cho hiệu ứng Parallax 3D
  rotation: number;
  rotSpeed: number;
}

const CALLIGRAPHY_CHARS = ['韵', '学', '福', '道', '乐', '和', '春', '心', '书', '德'];

/**
 * ParallaxCalligraphyCanvas — Hiệu ứng nền 3D Parallax với các ký tự thư pháp Á Đông
 * và bụi sao phát quang lơ lửng không gian 3 chiều.
 * Tự động biến đổi theo 2 chế độ Sáng (Giấy Tuyên) và Tối (Đêm Mực Tàu).
 * Thích ứng 60-120 FPS, tự ngắt khi ẩn tab để bảo vệ pin thiết bị.
 */
export const ParallaxCalligraphyCanvas: React.FC<ParallaxCalligraphyCanvasProps> = ({
  className = 'absolute inset-0 pointer-events-none z-0 overflow-hidden',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const elements: FloatingElement[] = [];

    // Khởi tạo các ký tự chữ Hán lơ lửng với độ sâu đa tầng
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const depth = Math.random() * 0.8 + 0.4; // 0.4 đến 1.2
      elements.push({
        x,
        y,
        baseX: x,
        baseY: y,
        speedX: (Math.random() - 0.5) * 0.3 * depth,
        speedY: (Math.random() - 0.5) * 0.3 * depth,
        char: CALLIGRAPHY_CHARS[i % CALLIGRAPHY_CHARS.length],
        size: (Math.random() * 32 + 24) * depth,
        opacity: Math.random() * 0.08 + 0.04,
        depth,
        rotation: (Math.random() - 0.5) * 0.2,
        rotSpeed: (Math.random() - 0.5) * 0.002,
      });
    }

    // Khởi tạo bụi sao lấp lánh (Golden/Cyan Stardust)
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const depth = Math.random() * 0.7 + 0.3;
      elements.push({
        x,
        y,
        baseX: x,
        baseY: y,
        speedX: (Math.random() - 0.5) * 0.5 * depth,
        speedY: (Math.random() - 0.5) * 0.5 * depth,
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.4 + 0.2,
        depth,
        rotation: 0,
        rotSpeed: 0,
      });
    }

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      mouseRef.current = {
        x: (clientX / width - 0.5) * 40,
        y: (clientY / height - 0.5) * 40,
      };
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Vòng lặp Render 60 FPS
    let isRunning = true;
    const render = () => {
      if (!isRunning) return;

      const isDark = document.documentElement.classList.contains('dark');
      ctx.clearRect(0, 0, width, height);

      const targetOffsetX = mouseRef.current.x;
      const targetOffsetY = mouseRef.current.y;

      for (const el of elements) {
        // Cập nhật vị trí trôi dạt tự nhiên
        el.baseX += el.speedX;
        el.baseY += el.speedY;

        // Bật tường bao biên tuần hoàn
        if (el.baseX < -50) el.baseX = width + 50;
        if (el.baseX > width + 50) el.baseX = -50;
        if (el.baseY < -50) el.baseY = height + 50;
        if (el.baseY > height + 50) el.baseY = -50;

        // Áp dụng độ lệch Parallax dựa trên chiều sâu Depth
        el.x = el.baseX - targetOffsetX * el.depth;
        el.y = el.baseY - targetOffsetY * el.depth;
        el.rotation += el.rotSpeed;

        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);

        if (el.char) {
          // Vẽ chữ Hán thư pháp mờ ảo
          ctx.font = `bold ${Math.round(el.size)}px "Noto Serif SC", "Songti SC", "SimSun", serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (isDark) {
            ctx.fillStyle = `rgba(245, 158, 11, ${el.opacity * 1.2})`; // Hổ phách mờ ảo
          } else {
            ctx.fillStyle = `rgba(180, 83, 9, ${el.opacity * 0.9})`; // Mực son nâu ấm
          }
          ctx.fillText(el.char, 0, 0);
        } else {
          // Vẽ hạt bụi sao phát quang
          ctx.beginPath();
          ctx.arc(0, 0, el.size, 0, Math.PI * 2);
          if (isDark) {
            ctx.fillStyle = `rgba(6, 182, 212, ${el.opacity * 0.6})`;
          } else {
            ctx.fillStyle = `rgba(245, 158, 11, ${el.opacity * 0.5})`;
          }
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    // Tạm dừng khi tab bị ẩn để tiết kiệm pin
    const handleVisibility = () => {
      if (document.hidden) {
        isRunning = false;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      } else {
        if (!isRunning) {
          isRunning = true;
          render();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default ParallaxCalligraphyCanvas;
