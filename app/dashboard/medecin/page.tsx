"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Activity, Users, Settings, Plus, Stethoscope } from "lucide-react";

export default function MedecinDashboard() {
  const { data: session } = useSession();

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div className="page-container-wide" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, background: "rgba(124,58,237,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Stethoscope style={{ width: 26, height: 26, color: "#a78bfa" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc" }}>
                Espace Praticien
              </h1>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Suivi individualisé de la santé relationnelle de vos patients.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 40 }}>
            <div className="card">
              <h3 style={{ fontSize: 16, color: "#94a3b8", marginBottom: 8 }}>Patients inscrits</h3>
              <p style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc" }}>0</p>
            </div>
            <div className="card">
              <h3 style={{ fontSize: 16, color: "#94a3b8", marginBottom: 8 }}>Bilans ce mois-ci</h3>
              <p style={{ fontSize: 32, fontWeight: 700, color: "#34d399" }}>0</p>
            </div>
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button style={{ background: "linear-gradient(135deg, #7c3aed, #0ea5e9)", border: "none", color: "white", padding: "12px 24px", borderRadius: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <Plus size={18} /> Nouveau Patient
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun patient pour le moment</h2>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Invitez vos patients à passer le test IQRH pour voir leurs résultats ici.</p>
          </div>
        </div>
      </main>
    </>
  );
}
