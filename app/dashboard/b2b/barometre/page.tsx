"use client";

import { useEffect, useState } from "react";
import { BarChart3, ShieldAlert, Users, Target, Activity, TrendingUp, TrendingDown, Sparkles, Heart, Briefcase, User, PieChart as PieChartIcon } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Select } from "@/components/ui/Select";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, Legend
} from "recharts";

// ── Mock Data pour la UI V1 (en attendant l'API complète) ──
const MOCK_EVOLUTION = [
  { month: "Jan", score: 56 }, { month: "Fév", score: 58 }, { month: "Mar", score: 59 },
  { month: "Avr", score: 61 }, { month: "Mai", score: 60 }, { month: "Juin", score: 62 },
  { month: "Juil", score: 65 }, { month: "Août", score: 64 }, { month: "Sep", score: 67 }
];

const MOCK_PROFILS = [
  { name: "Connecté", value: 35, color: "#10b981" },
  { name: "Sélectif", value: 25, color: "var(--primary)" },
  { name: "Solitaire", value: 20, color: "#f59e0b" },
  { name: "Isolé", value: 10, color: "#ef4444" },
  { name: "En transition", value: 10, color: "#a855f7" }
];

const MOCK_MOMENTS_VIE = [
  { name: "Onboarding", score: 72 },
  { name: "Promotion", score: 68 },
  { name: "Mobilité", score: 55 },
  { name: "Retour absence", score: 48 },
  { name: "Départ prévu", score: 42 }
];

export default function BarometrePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<string>("ALL");
  const [ageRange, setAgeRange] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (period && period !== "ALL") params.append("period", period);
    if (ageRange) params.append("ageRange", ageRange);
    if (gender) params.append("gender", gender);

    fetch(`/api/b2b/barometre?${params.toString()}`)
      .then(res => res.json())
      .then(res => {
        if (!res.success) {
          setError(res.message || "Erreur lors du chargement des données.");
        } else {
          setData(res);
          setError(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur réseau.");
        setLoading(false);
      });
  }, [period, ageRange, gender]);

  const breadcrumbItems = [
    { label: "Tableau de bord B2B", href: "/dashboard/b2b" },
    { label: "Baromètre" },
  ];

  const radarData = data ? [
    { subject: "Social", score: data.data.socialScore },
    { subject: "Affectif", score: data.data.affectiveScore },
    { subject: "Sentimental", score: data.data.sentimentalScore },
    { subject: "Pro", score: data.data.professionalScore },
    { subject: "Soi", score: data.data.selfScore },
  ] : [];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto", animation: "fadeSlideIn 0.4s ease-out" }}>
      <Breadcrumb items={breadcrumbItems} />
      
      {/* ── HEADER & FILTRES ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", marginBottom: 8, fontFamily: "var(--font-family-display)", display: "flex", alignItems: "center", gap: 12 }}>
            <BarChart3 color="var(--primary)" size={36} /> 
            Observatoire de la santé relationnelle
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 16, margin: 0 }}>
            Visualisez les grandes tendances, les fragilités et les points forts de vos collaborateurs.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", background: "var(--surface)", padding: 12, borderRadius: 16, border: "1px solid var(--border)" }}>
          <Select 
            value={period}
            onChange={setPeriod}
            placeholder="Période"
            options={[
              { value: "ALL", label: "Historique complet" },
              { value: "12M", label: "12 derniers mois" },
              { value: "3M", label: "3 derniers mois" }
            ]}
            style={{ width: 160 }}
          />
          <Select 
            value={ageRange}
            onChange={setAgeRange}
            placeholder="Tous âges"
            options={[
              { value: "", label: "Tous âges" },
              { value: "18-25", label: "18-25 ans" },
              { value: "26-35", label: "26-35 ans" },
              { value: "36-45", label: "36-45 ans" },
              { value: "46+", label: "46 ans et +" }
            ]}
            style={{ width: 140 }}
          />
          <Select 
            value={gender}
            onChange={setGender}
            placeholder="Tous genres"
            options={[
              { value: "", label: "Tous genres" },
              { value: "Homme", label: "Hommes" },
              { value: "Femme", label: "Femmes" }
            ]}
            style={{ width: 140 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
          <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 64, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={32} color="#f43f5e" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)" }}>Seuil de confidentialité non atteint</h2>
          <p style={{ color: "var(--text-2)", fontSize: 16, maxWidth: 500, lineHeight: 1.6 }}>
            {error}
          </p>
          <div style={{ background: "var(--surface-2)", padding: "16px 24px", borderRadius: 12, marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <Users size={20} color="var(--text-3)" />
            <span style={{ color: "var(--text-2)", fontSize: 14 }}>
              Il faut au minimum <strong>5 participants</strong> pour que les données soient agrégées de manière anonyme.
            </span>
          </div>
        </div>
      ) : data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* ── ROW 1: KPIs Principaux ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {/* KPI 1 : Score */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24, background: "linear-gradient(135deg, var(--surface) 0%, rgba(0,169,157,0.05) 100%)", border: "1px solid rgba(0,169,157,0.2)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Activity size={32} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>IQRH Moyen</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>{data.data.globalScore}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-3)" }}>/100</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12, fontWeight: 600, color: "#10b981" }}>
                  <TrendingUp size={14} /> +4 pts ce mois
                </div>
              </div>
            </div>

            {/* KPI 2 : Participants */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={32} color="#6366f1" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>Collaborateurs</p>
                <div style={{ fontSize: 36, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>
                  {data.totalParticipants}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-2)" }}>
                  Taux de participation : <strong>68%</strong>
                </div>
              </div>
            </div>

            {/* KPI 3 : Top Dimension */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Target size={32} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>Point Fort</p>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", lineHeight: 1.2 }}>
                  Relations Pro
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 13, color: "#10b981", fontWeight: 700 }}>
                  <Sparkles size={14} /> 74/100
                </div>
              </div>
            </div>

            {/* KPI 4 : Flop Dimension */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldAlert size={32} color="#f43f5e" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>Fragilité</p>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", lineHeight: 1.2 }}>
                  Relation à soi
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 13, color: "#f43f5e", fontWeight: 700 }}>
                  <TrendingDown size={14} /> 48/100
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 2: Évolution & Radar ── */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            {/* Évolution Line Chart */}
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={20} color="var(--primary)" /> Évolution de l'IQRH (12 derniers mois)
              </h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={MOCK_EVOLUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--text-3)" fontSize={12} tickMargin={10} />
                    <YAxis stroke="var(--text-3)" fontSize={12} tickMargin={10} domain={['dataMin - 5', 'dataMax + 5']} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} 
                      itemStyle={{ color: "var(--primary)" }}
                    />
                    <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dimensions Radar */}
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <PieChartIcon size={20} color="var(--primary)" /> Équilibre
              </h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-2)', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name="Score" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.25} />
                    <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── ROW 3: Profils & Moments de vie ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
            
            {/* Profils Relationnels */}
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <User size={20} color="var(--primary)" /> Répartition des Profils Relationnels
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                <div style={{ width: "50%", height: 220 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={MOCK_PROFILS} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {MOCK_PROFILS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 12 }}>
                  {MOCK_PROFILS.map(p => (
                    <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                        <span style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 500 }}>{p.name}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Moments de vie */}
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <Briefcase size={20} color="var(--primary)" /> IQRH selon les Moments de Vie
              </h3>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={MOCK_MOMENTS_VIE} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-2)', fontSize: 12 }} width={100} />
                    <RechartsTooltip cursor={{fill: 'var(--surface-2)'}} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {MOCK_MOMENTS_VIE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score < 50 ? "#f43f5e" : entry.score < 60 ? "#f59e0b" : "var(--primary)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>
          
        </div>
      )}
    </div>
  );
}
