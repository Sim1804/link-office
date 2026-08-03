"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Brain, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", password: "" });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erreur lors de l'inscription");
      }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/consentement");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", position: "relative", overflow: "hidden",
    }}>
      {/* Glow blobs */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 460 }}>

        {/* Logo + titre */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, background: "var(--primary)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
              <Brain size={22} color="white" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--text-1)" }}>
              Link<span className="gradient-text">Office</span>
            </span>
          </Link>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "var(--text-1)", marginBottom: 8 }}>
            Créez votre compte
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Commencez votre évaluation relationnelle gratuitement
          </p>
        </div>

        {/* Formulaire */}
        <div className="glass-strong" style={{ borderRadius: 20, padding: 36 }}>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 16px", marginBottom: 24,
              background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)",
              borderRadius: 10, color: "var(--rose)", fontSize: 14,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Prénom + Nom côte à côte */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Prénom */}
              <div>
                <label htmlFor="prenom" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>
                  Prénom
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
                    <User size={15} />
                  </span>
                  <input
                    id="prenom" type="text" required
                    placeholder="Marie"
                    value={form.prenom}
                    onChange={set("prenom")}
                    className="input-field has-icon"
                  />
                </div>
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="nom" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>
                  Nom
                </label>
                <input
                  id="nom" type="text" required
                  placeholder="Dupont"
                  value={form.nom}
                  onChange={set("nom")}
                  className="input-field"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
                  <Mail size={15} />
                </span>
                <input
                  id="email" type="email" required
                  placeholder="vous@exemple.com"
                  value={form.email}
                  onChange={set("email")}
                  className="input-field has-icon"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
                  <Lock size={15} />
                </span>
                <input
                  id="password" type="password" required
                  placeholder="8 caractères minimum"
                  value={form.password}
                  onChange={set("password")}
                  className="input-field has-icon"
                  minLength={8}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                width: "100%", padding: "16px 24px",
                background: "var(--primary)", color: "white",
                border: "none", borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 0 24px rgba(124,58,237,0.35)",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Création du compte…
                </>
              ) : (
                <>Créer mon compte <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Légal */}
          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)", marginTop: 20 }}>
            En vous inscrivant, vous acceptez nos{" "}
            <a href="#" style={{ color: "var(--primary-light)", textDecoration: "none" }}>conditions d'utilisation</a>
          </p>

          {/* Lien login */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              Déjà un compte ?{" "}
              <Link href="/auth/login" style={{ color: "var(--primary-light)", fontWeight: 500, textDecoration: "none" }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
