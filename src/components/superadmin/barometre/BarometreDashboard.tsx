"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, MapPin, Activity, Target, Users, TrendingUp, User, PenTool, Calendar, ShieldCheck
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from "recharts";
import { Select } from "@/components/ui/Select";

interface BarometreData {
  totalPassages: number;
  globalAverage: number;
  dimensions: {
    social: number;
    affective: number;
    sentimental: number;
    professional: number;
    self: number;
  };
  regions: { name: string; count: number; average: number }[];
  timeline: { date: string; passages: number }[];
  profils: { name: string; value: number; color: string; count: number }[];
}

export function BarometreDashboard({ availableRegions }: { availableRegions: string[] }) {
  const [data, setData] = useState<BarometreData | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Filters ──
  const [period, setPeriod] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [age, setAge] = useState("ALL");
  const [gender, setGender] = useState("ALL");

  // ── Editorial (Mock state for V1) ──
  const [editorialComment, setEditorialComment] = useState("La santé relationnelle globale montre une forte amélioration des relations professionnelles suite aux récentes campagnes de sensibilisation, mais le sentiment de solitude reste marqué chez les 18-25 ans.");
  const [highlightNumber, setHighlightNumber] = useState("12%");
  const [highlightText, setHighlightText] = useState("d'augmentation du sentiment d'appartenance");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ period, region, type });
        const res = await fetch(`/api/admin/barometre?${query.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period, region, type, age, gender]);

  const radarData = data ? [
    { subject: "Social", A: data.dimensions.social, fullMark: 100 },
    { subject: "Affectif", A: data.dimensions.affective, fullMark: 100 },
    { subject: "Sentimental", A: data.dimensions.sentimental, fullMark: 100 },
    { subject: "Pro", A: data.dimensions.professional, fullMark: 100 },
    { subject: "Soi", A: data.dimensions.self, fullMark: 100 },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* ── ROW 1: EDITORIAL & PARAMÈTRES (Section 69 Cahier des charges) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        
        {/* Gestion Éditoriale (Chiffre à la Une + Commentaire) */}
        <div className="card" style={{ padding: 24, borderTop: "3px solid var(--primary)", background: "linear-gradient(135deg, var(--surface) 0%, rgba(0,169,157,0.03) 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
              <PenTool size={18} color="var(--primary)" /> Gestion Éditoriale
            </h2>
            <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={12} /> Mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>Chiffre à la Une</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input 
                type="text" 
                value={highlightNumber} 
                onChange={(e) => setHighlightNumber(e.target.value)}
                className="input" 
                style={{ width: "80px", fontSize: 16, fontWeight: 800, color: "var(--primary)" }} 
              />
              <input 
                type="text" 
                value={highlightText} 
                onChange={(e) => setHighlightText(e.target.value)}
                className="input" 
                style={{ flex: 1, fontSize: 13 }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>Commentaire d'analyse</label>
            <textarea 
              value={editorialComment}
              onChange={(e) => setEditorialComment(e.target.value)}
              className="input" 
              rows={4}
              style={{ width: "100%", fontSize: 13, lineHeight: 1.5, resize: "none" }}
            />
          </div>
          
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }}>
            Publier sur la page d'accueil
          </button>
        </div>

        {/* Filtres de Données */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={18} color="var(--primary)" /> Filtres de l'Observatoire
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(16,185,129,0.1)", borderRadius: 999, color: "#10b981", fontSize: 12, fontWeight: 600 }}>
              <ShieldCheck size={14} /> Seuil d'anonymat respecté
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>Période</label>
              <Select value={period} onChange={setPeriod} options={[{ value: "ALL", label: "Depuis toujours" }, { value: "this_year", label: "Cette année" }, { value: "last_30_days", label: "30 derniers jours" }]} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>Structure</label>
              <Select value={type} onChange={setType} options={[{ value: "ALL", label: "Toutes confondues" }, { value: "B2C", label: "Particuliers" }, { value: "B2B", label: "Entreprises" }, { value: "B2B2C", label: "Mutuelles" }, { value: "B2G", label: "Collectivités" }]} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>Département</label>
              <Select value={region} onChange={setRegion} options={[{ value: "ALL", label: "France entière" }, ...availableRegions.map(r => ({ value: r, label: r }))]} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>Âge</label>
              <Select value={age} onChange={setAge} options={[{ value: "ALL", label: "Tous âges" }, { value: "18-25", label: "18-25 ans" }, { value: "26-40", label: "26-40 ans" }, { value: "41+", label: "41 ans et +" }]} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>Sexe</label>
              <Select value={gender} onChange={setGender} options={[{ value: "ALL", label: "Tous" }, { value: "H", label: "Hommes" }, { value: "F", label: "Femmes" }]} style={{ width: "100%" }} />
            </div>
          </div>
        </div>

      </div>

      {/* Loading State — Skeleton */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            {[1, 2].map(i => (
              <div key={i} className="card skeleton" style={{ height: 120 }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>
            {[1, 2].map(i => (
              <div key={i} className="card skeleton" style={{ height: 300 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── CONTENT GRID ── */}
      {!loading && data && (
        <div style={{ animation: "fadeIn 0.3s ease-out", display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Top KPI Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--indigo)" }}>
                <Users size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Volume d'évaluations</h3>
                <div style={{ fontSize: 36, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>
                  {data.totalPassages.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                <BarChart3 size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Moyenne IQRH Globale</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: "var(--primary)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>{data.globalAverage}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-3)" }}>/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Charts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
            
            {/* Timeline */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={18} color="var(--primary)" /> Évolution des passages
              </h3>
              <div style={{ width: "100%", height: 260 }}>
                {data.timeline.length > 0 ? (
                  <ResponsiveContainer>
                    <LineChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" stroke="var(--text-3)" fontSize={11} tickMargin={8} minTickGap={20} />
                      <YAxis stroke="var(--text-3)" fontSize={11} tickMargin={8} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                      <Line type="monotone" dataKey="passages" stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: 12 }}>Aucune donnée pour cette période</div>
                )}
              </div>
            </div>

            {/* Radar Dimensions */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={18} color="var(--primary)" /> Équilibre des dimensions
              </h3>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-2)', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
                    <Radar name="Moyenne" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                    <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profils Relationnels */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <User size={18} color="var(--primary)" /> Profils Relationnels (Global)
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: "50%", height: 200 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.profils} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {data.profils.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.profils.map(p => (
                    <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                        <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>{p.name}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Regions (Spans full width if odd number of charts) */}
            <div className="card" style={{ padding: 24, gridColumn: "1 / -1" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={18} color="var(--primary)" /> Répartition par département (Top 15)
              </h3>
              <div style={{ width: "100%", height: 300 }}>
                {data.regions.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={data.regions} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" stroke="var(--text-3)" fontSize={11} tickMargin={8} />
                      <YAxis type="number" stroke="var(--text-3)" fontSize={11} tickMargin={8} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} cursor={{fill: 'var(--surface-2)'}} />
                      <Bar dataKey="count" fill="var(--indigo)" radius={[4, 4, 0, 0]} name="Passages" maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: 12 }}>Aucune donnée</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
