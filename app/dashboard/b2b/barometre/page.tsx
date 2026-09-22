"use client";

import { useEffect, useState } from "react";
import { BarChart3, ShieldAlert, Users, Target, Activity } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Select } from "@/components/ui/Select";

export default function BarometrePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [ageRange, setAgeRange] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
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
  }, [ageRange, gender]);

  const breadcrumbItems = [
    { label: "Tableau de bord B2B", href: "/dashboard/b2b" },
    { label: "Baromètre" },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", animation: "fadeSlideIn 0.4s ease-out" }}>
      <Breadcrumb items={breadcrumbItems} />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", marginBottom: 8, fontFamily: "var(--font-family-display)", display: "flex", alignItems: "center", gap: 12 }}>
            <BarChart3 color="var(--primary)" /> Baromètre Relationnel
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 16 }}>
            Consultez la santé relationnelle globale de votre organisation.
          </p>
        </div>
        
        {/* Filtres Démographiques */}
        <div style={{ display: "flex", gap: 12 }}>
          <Select 
            value={ageRange}
            onChange={setAgeRange}
            placeholder="Tous les âges"
            options={[
              { value: "", label: "Tous les âges" },
              { value: "18-25", label: "18-25 ans" },
              { value: "26-35", label: "26-35 ans" },
              { value: "36-45", label: "36-45 ans" },
              { value: "46-55", label: "46-55 ans" },
              { value: "56+", label: "56 ans et +" },
            ]}
            style={{ width: 180 }}
          />
          
          <Select 
            value={gender}
            onChange={setGender}
            placeholder="Tous les genres"
            options={[
              { value: "", label: "Tous les genres" },
              { value: "Homme", label: "Homme" },
              { value: "Femme", label: "Femme" },
              { value: "Autre", label: "Autre" },
            ]}
            style={{ width: 180 }}
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
          {/* Global Score Widget */}
          <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, background: "linear-gradient(135deg, var(--surface) 0%, rgba(124,58,237,0.03) 100%)", border: "1px solid rgba(124,58,237,0.1)" }}>
            <Activity size={32} color="var(--primary)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, color: "var(--text-2)", fontWeight: 600, marginBottom: 16 }}>Score Global Moyen</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 72, fontWeight: 800, color: "var(--primary)", lineHeight: 1, fontFamily: "var(--font-family-display)" }}>
                {data.data.globalScore}
              </span>
              <span style={{ fontSize: 24, color: "var(--text-3)", fontWeight: 700 }}>/100</span>
            </div>
            <div style={{ marginTop: 24, padding: "8px 16px", background: "var(--surface-2)", borderRadius: 999, fontSize: 13, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={14} /> Basé sur {data.totalParticipants} collaborateurs
            </div>
          </div>

          {/* Dimensions Radar / Bars */}
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={20} color="var(--primary)" /> Détail par dimension
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { label: "Relations sociales", score: data.data.socialScore, color: "#5965E8" },
                { label: "Relations affectives", score: data.data.affectiveScore, color: "#00A99D" },
                { label: "Vie sentimentale", score: data.data.sentimentalScore, color: "#f43f5e" },
                { label: "Vie professionnelle", score: data.data.professionalScore, color: "#eab308" },
                { label: "Relation à soi", score: data.data.selfScore, color: "#a855f7" },
              ].map((dim) => (
                <div key={dim.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{dim.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: dim.color }}>{dim.score}/100</span>
                  </div>
                  <div style={{ width: "100%", height: 12, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${dim.score}%`, height: "100%", background: dim.color, borderRadius: 999, transition: "width 1s ease-out" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
