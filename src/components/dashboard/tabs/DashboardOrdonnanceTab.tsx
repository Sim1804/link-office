"use client";

import { PrescriptionItemCard } from "@/components/dashboard/PrescriptionItemCard";
import { ListChecks, Lock, Sparkles, Target } from "lucide-react";
import Link from "next/link";

export function DashboardOrdonnanceTab({ iqrh, isPremium, DIMENSIONS_LABELS }: { iqrh: any, isPremium: boolean, DIMENSIONS_LABELS: any }) {
  const allItems = iqrh?.prescription?.items || [];
  const recommendations = allItems.filter((i: any) => i.kind === "RECOMMENDATION");
  const challenges = allItems.filter((i: any) => i.kind === "MICRO_CHALLENGE");

  const shownReco = isPremium ? recommendations : recommendations.slice(0, 3);
  const shownChallenges = isPremium ? challenges : challenges.slice(0, 3);
  const hiddenCount = (recommendations.length - shownReco.length) + (challenges.length - shownChallenges.length);

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      {iqrh?.prescription ? (
        <>
          {/* Header card */}
          <div style={{
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.06) 100%)",
            border: "1px solid rgba(124,58,237,0.2)",
            padding: "24px 28px",
            marginBottom: 28,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ListChecks size={24} style={{ color: "#c084fc" }} />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 18, color: "#f8fafc" }}>
                  {iqrh.prescription.title}
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{iqrh.prescription.summary}</p>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
              padding: "6px 14px", borderRadius: 999,
            }}>
              <Target size={13} style={{ color: "#c084fc" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#c084fc" }}>
                Priorité — {iqrh.priority_dimension ? (DIMENSIONS_LABELS[iqrh.priority_dimension] || iqrh.priority_dimension) : "—"}
              </span>
            </div>
          </div>

          {/* Recommandations Section */}
          {shownReco.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#7c3aed",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  background: "rgba(124,58,237,0.08)", padding: "4px 12px",
                  borderRadius: 999, border: "1px solid rgba(124,58,237,0.15)",
                }}>
                  Recommandations
                </span>
                <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {shownReco.map((item: any) => (
                  <PrescriptionItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Micro-défis Section */}
          {shownChallenges.length > 0 && (
            <div style={{ marginBottom: hiddenCount > 0 ? 0 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#0891b2",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  background: "rgba(6,182,212,0.08)", padding: "4px 12px",
                  borderRadius: 999, border: "1px solid rgba(6,182,212,0.15)",
                }}>
                  Micro-défis
                </span>
                <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {shownChallenges.map((item: any) => (
                  <PrescriptionItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Premium Upsell Blur Gate */}
          {!isPremium && hiddenCount > 0 && (
            <div style={{
              marginTop: 24,
              borderRadius: 24,
              border: "1px solid rgba(124,58,237,0.2)",
              overflow: "hidden",
              position: "relative",
            }}>
              {/* Blurred preview cards */}
              <div style={{ filter: "blur(6px)", opacity: 0.4, padding: "20px 20px 0", pointerEvents: "none" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {[...Array(Math.min(hiddenCount, 3))].map((_, i) => (
                    <div key={i} style={{
                      height: 120, borderRadius: 16,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }} />
                  ))}
                </div>
              </div>
              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(11,15,25,0) 0%, rgba(11,15,25,0.97) 60%)",
              }} />
              {/* CTA */}
              <div style={{
                position: "relative", zIndex: 2,
                padding: "40px 32px 32px",
                textAlign: "center",
              }}>
                <div style={{
                  width: 52, height: 52, margin: "0 auto 16px",
                  borderRadius: 16, background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Lock size={24} style={{ color: "#a78bfa" }} />
                </div>
                <h4 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", color: "#f8fafc", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  {hiddenCount} contenu{hiddenCount > 1 ? "s" : ""} Premium restant{hiddenCount > 1 ? "s" : ""}
                </h4>
                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px" }}>
                  Débloquez l'intégralité de votre ordonnance, cochez vos défis terminés et discutez avec IRIS.
                </p>
                <Link href="/premium" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  color: "#fff", fontWeight: 600, padding: "12px 28px", borderRadius: 14,
                  border: "none", cursor: "pointer", fontSize: 14,
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)", textDecoration: "none"
                }}>
                  <Sparkles size={16} />
                  Passer à Premium
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{
          borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(17,24,39,0.98)", padding: "60px 40px", textAlign: "center",
        }}>
          <p style={{ color: "#64748b" }}>Aucune ordonnance relationnelle disponible.</p>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
