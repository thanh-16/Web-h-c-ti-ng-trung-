'use client';

import React from 'react';

export interface CalligraphyGridProps {
  /** Dimension in pixels (width & height). If omitted, scales to container (100%) */
  size?: number;
  /** Grid guideline pattern: 'tian' (田字格) or 'mi' (米字格) */
  type?: 'tian' | 'mi';
  /** Base guideline color (authentic vermilion/crimson #EF4444) */
  gridColor?: string;
  /** Outer frame border color */
  borderColor?: string;
  /** Guideline opacity (0.0 to 1.0) */
  gridOpacity?: number;
  /** Outer border opacity (0.0 to 1.0) */
  borderOpacity?: number;
  /** Optional custom class name */
  className?: string;
  /** Optional custom style */
  style?: React.CSSProperties;
}

/**
 * CalligraphyGrid (田字格 / 米字格)
 * Authentic Chinese Calligraphy guidelines with scalable vector SVG rendering.
 * Features traditional vermilion/crimson tones for balanced stroke alignment.
 */
export const CalligraphyGrid: React.FC<CalligraphyGridProps> = ({
  size,
  type = 'mi',
  gridColor = '#EF4444',
  borderColor = '#EF4444',
  gridOpacity = 0.22,
  borderOpacity = 0.45,
  className = '',
  style = {},
}) => {
  // Use a normalized 1000x1000 coordinate space for crisp vector fidelity at any resolution
  const viewBoxSize = 1000;
  const center = viewBoxSize / 2;
  const borderOffset = 4;
  const innerSize = viewBoxSize - borderOffset * 2;

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size ?? '100%'}
      height={size ?? '100%'}
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 pointer-events-none select-none ${className}`}
      style={{
        ...style,
        ...(size ? { width: `${size}px`, height: `${size}px` } : {}),
      }}
      aria-hidden="true"
      data-testid="calligraphy-grid"
      data-grid-type={type}
    >
      <defs>
        {/* Subtle inner grid pattern glow */}
        <filter id="gridGlow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor={gridColor} floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Outer Border (Khung viền chu sa) */}
      <rect
        x={borderOffset}
        y={borderOffset}
        width={innerSize}
        height={innerSize}
        fill="none"
        stroke={borderColor}
        strokeWidth="6"
        strokeOpacity={borderOpacity}
        rx="8"
      />

      {/* Inner Decorative Double Border (Traditional Paper Border) */}
      <rect
        x={borderOffset + 12}
        y={borderOffset + 12}
        width={innerSize - 24}
        height={innerSize - 24}
        fill="none"
        stroke={borderColor}
        strokeWidth="1.5"
        strokeOpacity={borderOpacity * 0.5}
      />

      {/* Group of internal guidelines */}
      <g stroke={gridColor} strokeOpacity={gridOpacity} filter="url(#gridGlow)">
        {/* Horizontal Center Axis (Trục hoành) */}
        <line
          x1={borderOffset + 12}
          y1={center}
          x2={viewBoxSize - borderOffset - 12}
          y2={center}
          strokeWidth="3.5"
          strokeDasharray="14 10"
          strokeLinecap="round"
          data-testid="grid-cross-horizontal"
        />

        {/* Vertical Center Axis (Trục tung) */}
        <line
          x1={center}
          y1={borderOffset + 12}
          x2={center}
          y2={viewBoxSize - borderOffset - 12}
          strokeWidth="3.5"
          strokeDasharray="14 10"
          strokeLinecap="round"
          data-testid="grid-cross-vertical"
        />

        {/* Diagonals for Mi Zi Ge (Đường chéo chữ Mễ) */}
        {type === 'mi' && (
          <>
            {/* Top-Left to Bottom-Right Diagonal */}
            <line
              x1={borderOffset + 12}
              y1={borderOffset + 12}
              x2={viewBoxSize - borderOffset - 12}
              y2={viewBoxSize - borderOffset - 12}
              strokeWidth="2.5"
              strokeDasharray="10 10"
              strokeLinecap="round"
              data-testid="grid-diagonal-tl-br"
            />
            {/* Top-Right to Bottom-Left Diagonal */}
            <line
              x1={viewBoxSize - borderOffset - 12}
              y1={borderOffset + 12}
              x2={borderOffset + 12}
              y2={viewBoxSize - borderOffset - 12}
              strokeWidth="2.5"
              strokeDasharray="10 10"
              strokeLinecap="round"
              data-testid="grid-diagonal-tr-bl"
            />
          </>
        )}
      </g>

      {/* Traditional Corner Accents (Góc hoa văn thư pháp) */}
      <g stroke={borderColor} strokeOpacity={borderOpacity * 0.75} strokeWidth="3" fill="none">
        {/* Top-Left */}
        <path d={`M ${borderOffset + 24} ${borderOffset + 36} L ${borderOffset + 36} ${borderOffset + 36} L ${borderOffset + 36} ${borderOffset + 24}`} />
        {/* Top-Right */}
        <path d={`M ${viewBoxSize - borderOffset - 24} ${borderOffset + 36} L ${viewBoxSize - borderOffset - 36} ${borderOffset + 36} L ${viewBoxSize - borderOffset - 36} ${borderOffset + 24}`} />
        {/* Bottom-Left */}
        <path d={`M ${borderOffset + 24} ${viewBoxSize - borderOffset - 36} L ${borderOffset + 36} ${viewBoxSize - borderOffset - 36} L ${borderOffset + 36} ${viewBoxSize - borderOffset - 24}`} />
        {/* Bottom-Right */}
        <path d={`M ${viewBoxSize - borderOffset - 24} ${viewBoxSize - borderOffset - 36} L ${viewBoxSize - borderOffset - 36} ${viewBoxSize - borderOffset - 36} L ${viewBoxSize - borderOffset - 36} ${viewBoxSize - borderOffset - 24}`} />
      </g>
    </svg>
  );
};

export default CalligraphyGrid;
