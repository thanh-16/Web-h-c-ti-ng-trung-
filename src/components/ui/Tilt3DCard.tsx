'use client';

import React, { useRef, useState, useEffect } from 'react';

export interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTiltAngle?: number; // Góc nghiêng 3D tối đa (độ, mặc định 12)
  glareEffect?: boolean;  // Có bật vệt sáng phản chiếu ánh sáng specular không
  depth?: number;         // Chiều sâu lớp con translateZ (px, mặc định 24)
  onClick?: () => void;
}

/**
 * Tilt3DCard — Thẻ nghiêng 3D Parallax mượt mà 60-120 FPS theo cử chỉ di chuột hoặc ngón tay.
 * Mô phỏng chiều sâu không gian 3D (Three UI / Parallax Depth) kết hợp vệt sáng lướt qua.
 * Tối ưu hóa GPU bằng CSS preserve-3d và requestAnimationFrame.
 */
export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  maxTiltAngle = 12,
  glareEffect = true,
  depth = 24,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Kiểm tra cấu hình prefers-reduced-motion của học viên
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
    }
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const percentX = (mouseX / rect.width - 0.5) * 2; // Từ -1 đến 1
    const percentY = (mouseY / rect.height - 0.5) * 2;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      setTilt({
        rotateX: -percentY * maxTiltAngle,
        rotateY: percentX * maxTiltAngle,
        scale: 1.02,
      });

      if (glareEffect) {
        setGlare({
          x: (mouseX / rect.width) * 100,
          y: (mouseY / rect.height) * 100,
          opacity: 0.28,
        });
      }
    });
  };

  const handlePointerLeave = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
    if (glareEffect) {
      setGlare((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
      className={`relative transition-transform duration-200 ease-out select-none cursor-pointer ${className}`}
    >
      <div
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${tilt.scale}, ${tilt.scale}, 1)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.4, 1)',
        }}
        className="w-full h-full relative"
      >
        <div style={{ transform: `translateZ(${depth}px)`, transformStyle: 'preserve-3d' }}>
          {children}
        </div>

        {glareEffect && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.35) 0%, transparent 65%)`,
              borderRadius: 'inherit',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Tilt3DCard;
