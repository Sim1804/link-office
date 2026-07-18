/**
 * RadarChart.tsx — Graphique Radar IQRH (D1-D5)
 */
"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  PolarRadiusAxis,
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
  relations_sociales: "D1 - Social",
  relations_affectives: "D2 - Affectif",
  vie_sentimentale: "D3 - Sentimental",
  vie_professionnelle_engagement: "D4 - Professionnel",
  relation_a_soi_sens: "D5 - Soi & Sens",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ subject: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-sm">
        <p className="text-text-primary font-semibold">{payload[0].subject}</p>
        <p className="text-accent-cyan">{payload[0].value}/100</p>
      </div>
    );
  }
  return null;
};

export function IQRHRadarChart({ data }: IQRHRadarChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    subject: DIMENSION_LABELS[key] || key,
    A: value,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#475569", fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#7C3AED"
            fill="#7C3AED"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
