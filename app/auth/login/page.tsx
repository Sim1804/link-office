"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brain, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push(callbackUrl);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", position: "relative", overflow: "hidden"
    }}>
      {/* Glow blobs */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440 }}>

        {/* Logo + title */}
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
            Bon retour parmi nous
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        {/* Form card */}
        <div className="glass-strong" style={{ borderRadius: 20, padding: 36 }}>
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 16px", marginBottom: 24,
              background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)",
              borderRadius: 10, color: "var(--rose)", fontSize: 14
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
                  <Mail size={16} />
                </span>
                <input
                  id="email" type="email" required
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field has-icon"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label htmlFor="password" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>
                  Mot de passe
                </label>
                <a href="#" style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "none" }}>Mot de passe oublié ?</a>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
                  <Lock size={16} />
                </span>
                <input
                  id="password" type="password" required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field has-icon"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: 8, position: "relative" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Connexion en cours…
                </span>
              ) : (
                <>Se connecter <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-2)", marginTop: 24 }}>
            Pas encore de compte ?{" "}
            <Link href="/auth/register" style={{ color: "var(--primary-light)", textDecoration: "none", fontWeight: 500 }}>
              Créer un compte gratuitement
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
