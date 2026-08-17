"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key } from "lucide-react";
import { signOut } from "next-auth/react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccess(true);
      // We force re-login to regenerate the JWT without the mustChangePassword flag
      setTimeout(() => {
        signOut({ callbackUrl: "/auth/login?message=password_changed" });
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
      <div style={{ maxWidth: 400, width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: "rgba(124,58,237,0.15)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Key style={{ width: 32, height: 32, color: "#a78bfa" }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8 }}>Mise à jour requise</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>
            Pour des raisons de sécurité, vous devez personnaliser le mot de passe généré automatiquement avant d'accéder à votre espace.
          </p>
        </div>

        {success ? (
          <div style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", padding: 16, borderRadius: 12, textAlign: "center", fontSize: 14, fontWeight: 500 }}>
            Mot de passe mis à jour avec succès ! Redirection vers la page de connexion...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: 12, borderRadius: 8, fontSize: 13 }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: "block", color: "#e2e8f0", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Nouveau mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: "12px 16px", color: "white", outline: "none",
                  transition: "border 0.2s"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", color: "#e2e8f0", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Confirmer le mot de passe</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: "12px 16px", color: "white", outline: "none",
                  transition: "border 0.2s"
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", background: "#7c3aed", color: "white", border: "none",
                borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 600,
                cursor: loading ? "wait" : "pointer", marginTop: 8, transition: "background 0.2s",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Mise à jour..." : "Enregistrer et continuer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
