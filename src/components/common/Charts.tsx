// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';

interface GradeBarChartProps {
  data: { label: string; score: number }[];
  kkm?: number;
}

export const GradeBarChart: React.FC<GradeBarChartProps> = ({ data, kkm = 75 }) => {
  if (!data || data.length === 0) return null;

  const maxScore = 100;
  const height = 180;
  const barWidth = 32;
  const gap = 20;
  const svgWidth = Math.max(300, data.length * (barWidth + gap) + 40);

  return (
    <div className="w-full overflow-x-auto py-2">
      <svg
        viewBox={`0 0 ${svgWidth} ${height + 40}`}
        className="w-full h-auto min-w-[320px] max-h-[220px]"
      >
        {/* KKM Line */}
        {kkm > 0 && (
          <g>
            <line
              x1="30"
              y1={height - (kkm / maxScore) * height}
              x2={svgWidth - 10}
              y2={height - (kkm / maxScore) * height}
              stroke="#FBBF24"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              opacity="0.8"
            />
            <text
              x="5"
              y={height - (kkm / maxScore) * height + 4}
              fill="#FBBF24"
              fontSize="10"
              fontWeight="bold"
            >
              {kkm}
            </text>
          </g>
        )}

        {/* Bars */}
        {data.map((item, idx) => {
          const x = 40 + idx * (barWidth + gap);
          const barH = (item.score / maxScore) * height;
          const y = height - barH;
          const isTuntas = item.score >= kkm;

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="6"
                fill={isTuntas ? '#2DD4BF' : '#FB923C'}
                opacity={isTuntas ? '0.9' : '0.8'}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fill="#ECFEFF"
                fontSize="11"
                fontWeight="600"
              >
                {item.score}
              </text>
              <text
                x={x + barWidth / 2}
                y={height + 18}
                textAnchor="middle"
                fill="#A5D8D3"
                fontSize="10"
              >
                {item.label.length > 8 ? item.label.slice(0, 7) + '…' : item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const BarChartSimple: React.FC<{
  data: { label: string; value: number }[];
  color?: string;
}> = ({ data, color = '#2DD4BF' }) => {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const height = 150;
  const barWidth = 36;
  const gap = 24;
  const svgWidth = Math.max(280, data.length * (barWidth + gap) + 40);

  return (
    <div className="w-full overflow-x-auto py-2">
      <svg viewBox={`0 0 ${svgWidth} ${height + 36}`} className="w-full h-auto max-h-[190px]">
        {data.map((item, idx) => {
          const x = 30 + idx * (barWidth + gap);
          const barH = (item.value / maxVal) * (height - 20);
          const y = height - barH;

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="6"
                fill={color}
                opacity="0.85"
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fill="#ECFEFF"
                fontSize="11"
                fontWeight="bold"
              >
                {item.value}
              </text>
              <text
                x={x + barWidth / 2}
                y={height + 18}
                textAnchor="middle"
                fill="#A5D8D3"
                fontSize="11"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const DonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
}> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  let cumulativeAngle = 0;
  const radius = 60;
  const strokeWidth = 24;
  const center = 80;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.map((slice, idx) => {
          const angle = (slice.value / total) * 360;
          const startAngle = cumulativeAngle;
          cumulativeAngle += angle;

          const circumference = 2 * Math.PI * radius;
          const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
          const strokeDashoffset = -((startAngle / 360) * circumference);

          return (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${center} ${center})`}
              opacity="0.9"
            />
          );
        })}
      </svg>
      <div className="flex flex-col gap-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[#ECFEFF] font-medium">{item.label}</span>
            <span className="text-[#A5D8D3] font-mono">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
