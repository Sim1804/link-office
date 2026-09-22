"use client";

import { useState } from "react";
import { Shield, Key, CheckCircle2, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function SecurityPage() {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const generate2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa/generate", { method: "POST" });
      if (!res.ok) {
        throw new Error("Erreur lors de la génération du secret.");
      }
      const data = await res.json();
      setQrData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Code invalide.");
      }
      setSuccess(true);
      setQrData(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 12 }}>
            <Shield size={32} color="var(--primary)" />
            Sécurité & Accès
          </h1>
          <p style={{ color: "var(--text-2)", marginTop: 8 }}>
            Gérez les paramètres de sécurité avancés et l'authentification à double facteur (2FA).
          </p>
        </div>
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", maxWidth: 800 }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Key size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)" }}>Authentification à double facteur (2FA)</h2>
            <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: 4 }}>
              Ajoutez une couche de sécurité supplémentaire lors de la connexion.
            </p>
          </div>
        </div>
        
        {success ? (
          <div style={{ padding: "20px 24px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 16 }}>
            <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#10b981", marginBottom: 4 }}>2FA activé avec succès !</p>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>
                Votre compte est désormais protégé. À votre prochaine connexion, il vous sera demandé d'entrer le code généré par votre application d'authentification.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6 }}>
              L'authentification à double facteur nécessite une application d'authentification comme Google Authenticator, Authy ou Microsoft Authenticator sur votre appareil mobile.
            </p>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, color: "#ef4444" }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {!qrData ? (
              <div>
                <button 
                  onClick={generate2FA}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: "12px 24px", fontSize: 15 }}
                >
                  {loading ? "Génération..." : "Configurer le 2FA"}
                </button>
              </div>
            ) : (
              <div style={{ padding: 24, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12 }}>
                
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>1. Scannez ce QR Code</h3>
                  <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 16 }}>
                    Ouvrez votre application d'authentification et scannez le QR code ci-dessous.
                  </p>
                  <div style={{ background: "white", padding: 16, borderRadius: 12, display: "inline-block", border: "1px solid #e2e8f0" }}>
                    <QRCodeSVG value={qrData.otpauthUrl} size={160} />
                  </div>
                  <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-3)" }}>
                    Ou saisissez manuellement cette clé secrète : 
                    <code style={{ background: "var(--surface)", padding: "4px 8px", borderRadius: 6, color: "var(--text-1)", marginLeft: 8, fontWeight: 600, userSelect: "all" }}>
                      {qrData.secret}
                    </code>
                  </div>
                </div>

                <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>2. Validez l'activation</h3>
                  <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 16 }}>
                    Saisissez le code à 6 chiffres affiché sur votre application pour finaliser.
                  </p>
                  
                  <div style={{ display: "flex", gap: 12, maxWidth: 320 }}>
                    <input 
                      type="text"
                      placeholder="Ex: 123456"
                      maxLength={6}
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      className="input-field"
                      style={{ flex: 1, textAlign: "center", letterSpacing: "0.2em", fontSize: 16, fontWeight: 600 }}
                    />
                    <button 
                      onClick={enable2FA}
                      disabled={loading || code.length !== 6}
                      className="btn btn-primary"
                    >
                      {loading ? "..." : "Activer"}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
