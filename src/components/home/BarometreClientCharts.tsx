"use client";

import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

export function BarometreClientCharts({ radarData, lineData, profilsData }: { radarData: any[], lineData: any[], profilsData: any[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
      {/* Radar Chart */}
      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: "0.05em" }}>Équilibre des dimensions</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-2)', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score National" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.25} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendance */}
      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tendance (12 mois)</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-3)" fontSize={11} tickMargin={8} />
              <YAxis stroke="var(--text-3)" fontSize={11} tickMargin={8} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} 
                itemStyle={{ color: "var(--primary)" }}
              />
              <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3, fill: "var(--primary)", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profils Relationnels */}
      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: "0.05em" }}>Profils Relationnels</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
          <div style={{ width: "50%", height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={profilsData} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {profilsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 8 }}>
            {profilsData.slice(0, 4).map(p => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                  <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
