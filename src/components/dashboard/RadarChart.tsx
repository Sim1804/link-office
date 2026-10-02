import React, { useState } from 'react';

interface RadarDimension {
  key: string;
  label: string;
  score: number;
}

interface RadarChartProps {
  dimensions: RadarDimension[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ dimensions, size = 320 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!dimensions || !Array.isArray(dimensions) || dimensions.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-[#123D46]/50 italic" style={{ width: size, height: size }}>
        Données insuffisantes
      </div>
    );
  }

  const center = size / 2;
  const radius = size * 0.38;
  const total = dimensions.length;

  // Compute vertices for 5 levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, valPercent: number) => {
    // Start at -90deg (top)
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const x = center + radius * valPercent * Math.cos(angle);
    const y = center + radius * valPercent * Math.sin(angle);
    return { x, y };
  };

  // Polygon points for the actual user score
  const scorePoints = dimensions.map((d, i) => {
    const coords = getCoordinates(i, d.score / 100);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background concentric polygons */}
        {levels.map((level, lvlIdx) => {
          const points = dimensions.map((_, i) => {
            const coords = getCoordinates(i, level);
            return `${coords.x},${coords.y}`;
          }).join(' ');

          return (
            <polygon
              key={lvlIdx}
              points={points}
              fill="none"
              stroke="#E3EBE6"
              strokeWidth={lvlIdx === levels.length - 1 ? '1.5' : '1'}
              strokeDasharray={lvlIdx === levels.length - 1 ? undefined : '3 3'}
            />
          );
        })}

        {/* Axis lines from center to each vertex */}
        {dimensions.map((_, i) => {
          const end = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#E3EBE6"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Data polygon filled with subtle teal brand gradient */}
        <polygon
          points={scorePoints}
          fill="url(#radarGradient)"
          stroke="#00A99D"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00A99D" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4DBDB2" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Data vertex circles */}
        {dimensions.map((d, i) => {
          const coords = getCoordinates(i, d.score / 100);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={coords.x}
                cy={coords.y}
                r={isHovered ? 6.5 : 4.5}
                fill="#00A99D"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="transition-all duration-200"
              />
              {isHovered && (
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="10"
                  fill="#00A99D"
                  opacity="0.25"
                  className="animate-ping"
                />
              )}
            </g>
          );
        })}

        {/* Axis Labels outside */}
        {dimensions.map((d, i) => {
          const labelCoords = getCoordinates(i, 1.22);
          const isHovered = hoveredIdx === i;

          // Adjust text alignment based on angle
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (labelCoords.x < center - 20) textAnchor = 'end';
          else if (labelCoords.x > center + 20) textAnchor = 'start';

          return (
            <text
              key={i}
              x={labelCoords.x}
              y={labelCoords.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className={`text-[11px] font-jakarta font-semibold transition-colors duration-150 cursor-pointer ${
                isHovered ? 'fill-[#00A99D] font-bold' : 'fill-[#123D46]/75'
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Floating tooltip when a vertex is hovered */}
      {hoveredIdx !== null && (
        <div className="absolute bottom-2 bg-[#123D46] text-white px-3 py-1.5 rounded-lg text-xs font-jakarta font-semibold shadow-md flex items-center gap-1.5 animate-fade-in pointer-events-none">
          <span>{dimensions[hoveredIdx].label} :</span>
          <span className="text-[#FFC629] font-mono font-bold tabular-nums">
            {dimensions[hoveredIdx].score} / 100
          </span>
        </div>
      )}
    </div>
  );
};
