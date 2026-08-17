/**
 * @file RadarChart.tsx
 * @module src/components/dashboard
 * @description Graphique Radar des 5 dimensions IQRH — design premium avec gradient fill et tooltip custom.
 */

"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarData {
  relations_sociales: number;
  relations_affectives: number;
  vie_sentimentale: number;
  vie_professionnelle_engagement: number;
  relation_a_soi_sens: number;
}

interface IQRHRadarChartProps {
  data: RadarData;
  priorityDimension?: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  relations_sociales: "Social",
  relations_affectives: "Affectif",
  vie_sentimentale: "Sentimental",
  vie_professionnelle_engagement: "Professionnel",
  relation_a_soi_sens: "Soi & Sens",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(17,24,39,0.95)",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 12, padding: "10px 14px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        <p style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{payload[0].subject}</p>
        <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 800 }}>{payload[0].value}<span style={{ color: "#475569", fontSize: 12, fontWeight: 400 }}>/100</span></p>
      </div>
    );
  }
  return null;
};

const CustomAngleAxis = ({ x, y, payload, cx, cy }: any) => {
  const score = payload?.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="#64748b"
        fontSize={11}
        fontWeight={500}
        fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
      >
        {payload.value}
      </text>
    </g>
  );
};

export function IQRHRadarChart({ data }: IQRHRadarChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    subject: DIMENSION_LABELS[key] || key,
    A: value,
    fullMark: 100,
  }));

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <defs>
            <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <PolarGrid
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="2 4"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#a78bfa"
            fill="url(#radarGrad)"
            strokeWidth={2}
            dot={{ fill: "#a78bfa", strokeWidth: 0, r: 4 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
