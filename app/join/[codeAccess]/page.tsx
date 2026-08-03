/**
 * app/join/[codeAccess]/page.tsx — Page d'inscription contextuelle
 * ─────────────────────────────────────────────────────────────────
 * Affiche une page d'inscription personnalisée avec le branding
 * de l'organisation (logo, nom) quand un utilisateur arrive via
 * un lien d'invitation ou un QR code.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Brain, Mail, Lock, User, ArrowRight, AlertCircle, Building2, CheckCircle2 } from "lucide-react";

interface OrgInfo {
  name: string;
  type: string;
  logoUrl?: string;
}

function getRoleLabel(type: string) {
  if (type === "B2B") return "collaborateur";
  if (type === "B2B2C") return "adhérent";
  if (type === "COLLECTIVITE") return "habitant";
  return "membre";
}

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const codeAccess = params.codeAccess as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", password: "" });

  useEffect(() => {
    if (!codeAccess) return;
    fetch(`/api/b2b/organization/by-code/${encodeURIComponent(codeAccess)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setOrg(data);
        else setOrgError(true);
      })
      .catch(() => setOrgError(true))
      .finally(() => setOrgLoading(false));
  }, [codeAccess]);

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
        body: JSON.stringify({ ...form, codeAccess }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erreur lors de l'inscription");
      }
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      router.push("/consentement");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "12px 16px 12px 44px",
    color: "var(--text-1)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480 }}>

        {/* Logo LinkOffice */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, background: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
              <Brain size={20} color="white" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text-1)" }}>
              Link<span className="gradient-text">Office</span>
            </span>
          </Link>

          {/* Branding Organisation */}
          {orgLoading ? (
            <div style={{ height: 60 }} />
          ) : orgError ? (
            <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
              <p style={{ color: "#f43f5e", fontSize: 14 }}>
                Ce code d&apos;invitation est invalide ou a expiré.
              </p>
            </div>
          ) : org ? (
            <div style={{
              background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: 14, padding: "14px 20px", marginBottom: 8,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 40, height: 40, background: "rgba(124,58,237,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Building2 size={20} style={{ color: "#a78bfa" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Invitation de
                </p>
                <p style={{ color: "var(--text-1)", fontSize: 15, fontWeight: 700 }}>{org.name}</p>
                <p style={{ color: "var(--text-2)", fontSize: 12, marginTop: 2 }}>
                  Vous rejoignez en tant que {getRoleLabel(org.type)}
                </p>
              </div>
              <CheckCircle2 size={18} style={{ color: "#34d399", flexShrink: 0, marginLeft: "auto" }} />
            </div>
          ) : null}

          <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 24, color: "var(--text-1)", marginBottom: 6 }}>
            Créer mon compte
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Rejoignez Link-Office et découvrez votre profil relationnel
          </p>
        </div>

        {/* Formulaire */}
        <div style={{ background: "rgba(17,24,39,0.75)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { field: "prenom", label: "Prénom", placeholder: "Marie" },
                { field: "nom", label: "Nom", placeholder: "Dupont" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
                    <input type="text" value={form[field as "prenom" | "nom"]} onChange={set(field)} placeholder={placeholder} required style={inputStyle} />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
                <input type="email" value={form.email} onChange={set("email")} placeholder="marie@exemple.fr" required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
                <input type="password" value={form.password} onChange={set("password")} placeholder="8 caractères min, 1 majuscule, 1 chiffre" required style={inputStyle} />
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                <AlertCircle size={15} style={{ color: "#f43f5e", flexShrink: 0 }} />
                <span style={{ color: "#f43f5e", fontSize: 13 }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || orgError || orgLoading}
              className="btn btn-primary btn-md"
              style={{ marginTop: 4, width: "100%", fontSize: 15 }}
            >
              {loading ? "Création du compte…" : <>Créer mon compte <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, color: "var(--text-3)", fontSize: 13 }}>
            Déjà un compte ?{" "}
            <Link href="/auth/login" style={{ color: "var(--primary-light)", textDecoration: "none", fontWeight: 500 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
