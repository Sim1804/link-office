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
            borderRadius: 16,
            background: "linear-gradient(135deg, var(--primary-glow) 0%, rgba(6,182,212,0.06) 100%)",
            border: "1px solid var(--border-strong)",
            padding: "20px",
            marginBottom: 28,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "var(--border-strong)", border: "1px solid rgba(124,58,237,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ListChecks size={24} style={{ color: "#c084fc" }} />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-1)" }}>
                  {iqrh.prescription.title}
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>{iqrh.prescription.summary}</p>
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
                <div style={{ height: 1, flex: 1, background: "var(--surface-2)" }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "var(--primary)",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  background: "rgba(124,58,237,0.08)", padding: "4px 12px",
                  borderRadius: 999, border: "1px solid rgba(124,58,237,0.15)",
                }}>
                  Recommandations
                </span>
                <div style={{ height: 1, flex: 1, background: "var(--surface-2)" }} />
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
                <div style={{ height: 1, flex: 1, background: "var(--surface-2)" }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#0891b2",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  background: "rgba(6,182,212,0.08)", padding: "4px 12px",
                  borderRadius: 999, border: "1px solid rgba(6,182,212,0.15)",
                }}>
                  Micro-défis
                </span>
                <div style={{ height: 1, flex: 1, background: "var(--surface-2)" }} />
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
              borderRadius: 16,
              border: "1px solid var(--border-strong)",
              overflow: "hidden",
              position: "relative",
            }}>
              {/* Blurred preview cards */}
              <div style={{ filter: "blur(6px)", opacity: 0.4, padding: "20px 20px 0", pointerEvents: "none" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {[...Array(Math.min(hiddenCount, 3))].map((_, i) => (
                    <div key={i} style={{
                      height: 120, borderRadius: 16,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
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
                  width: 48, height: 48, margin: "0 auto 16px",
                  borderRadius: 12, background: "rgba(18,61,70,0.05)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Lock size={20} color="var(--text-3)" />
                </div>
                <h4 style={{ fontFamily: "Inter, sans-serif", color: "var(--text-1)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  {hiddenCount} contenu{hiddenCount > 1 ? "s" : ""} Premium restant{hiddenCount > 1 ? "s" : ""}
                </h4>
                <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px" }}>
                  Débloquez l'intégralité de votre ordonnance, cochez vos défis terminés et discutez avec IRIS.
                </p>
                <Link href="/premium" className="btn btn-primary btn-md" style={{ textDecoration: "none" }}>
                  <Sparkles size={16} />
                  Passer à Premium
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{
          borderRadius: 16, border: "1px solid var(--border)",
          background: "var(--surface)", padding: "60px 40px", textAlign: "center",
        }}>
          <p style={{ color: "var(--text-3)" }}>Aucune ordonnance relationnelle disponible.</p>
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
