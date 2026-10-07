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
      if (!res.ok) throw new Error("Erreur lors de la génération du secret.");
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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-[#00A99D]" />
          Sécurité & Accès
        </h1>
        <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
          Gérez les paramètres de sécurité avancés et l&apos;authentification à double facteur (2FA).
        </p>
      </div>

      {/* 2FA Card */}
      <div className="bg-white rounded-2xl border border-[#E3EBE6] p-8 shadow-xs max-w-[800px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#00A99D]/10 flex items-center justify-center">
            <Key className="w-6 h-6 text-[#00A99D]" />
          </div>
          <div>
            <h2 className="text-xl font-jakarta font-bold text-[#123D46]">Authentification à double facteur (2FA)</h2>
            <p className="text-[#123D46]/60 text-sm mt-0.5">
              Ajoutez une couche de sécurité supplémentaire lors de la connexion.
            </p>
          </div>
        </div>

        {success ? (
          <div className="px-6 py-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-semibold text-emerald-600 mb-1">2FA activé avec succès !</p>
              <p className="text-sm text-emerald-700/80 leading-relaxed">
                Votre compte est désormais protégé. À votre prochaine connexion, il vous sera demandé
                d&apos;entrer le code généré par votre application d&apos;authentification.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <p className="text-[15px] text-[#123D46]/70 leading-relaxed">
              L&apos;authentification à double facteur nécessite une application d&apos;authentification comme
              Google Authenticator, Authy ou Microsoft Authenticator sur votre appareil mobile.
            </p>

            {error && (
              <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span className="text-sm font-medium text-rose-500">{error}</span>
              </div>
            )}

            {!qrData ? (
              <div>
                <button
                  onClick={generate2FA}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm transition-colors disabled:opacity-60 flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  {loading ? "Génération..." : "Configurer le 2FA"}
                </button>
              </div>
            ) : (
              <div className="p-6 bg-[#F8F9FA] border border-[#E3EBE6] rounded-xl">
                <div className="mb-8">
                  <h3 className="text-base font-jakarta font-semibold text-[#123D46] mb-2">
                    1. Scannez ce QR Code
                  </h3>
                  <p className="text-sm text-[#123D46]/70 mb-4">
                    Ouvrez votre application d&apos;authentification et scannez le QR code ci-dessous.
                  </p>
                  <div className="bg-white p-4 rounded-xl inline-block border border-[#E3EBE6]">
                    <QRCodeSVG value={qrData.otpauthUrl} size={160} />
                  </div>
                  <div className="mt-4 text-[13px] text-[#123D46]/50">
                    Ou saisissez manuellement cette clé secrète :
                    <code className="bg-[#FAF9F5] px-2 py-1 rounded-md text-[#123D46] ml-2 font-semibold select-all border border-[#E3EBE6]">
                      {qrData.secret}
                    </code>
                  </div>
                </div>

                <div className="h-px bg-[#E3EBE6] my-6" />

                <div>
                  <h3 className="text-base font-jakarta font-semibold text-[#123D46] mb-2">
                    2. Validez l&apos;activation
                  </h3>
                  <p className="text-sm text-[#123D46]/70 mb-4">
                    Saisissez le code à 6 chiffres affiché sur votre application pour finaliser.
                  </p>
                  <div className="flex gap-3 max-w-[320px]">
                    <input
                      type="text"
                      placeholder="Ex: 123456"
                      maxLength={6}
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 text-center tracking-widest text-base font-semibold px-3 py-2.5 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none"
                    />
                    <button
                      onClick={enable2FA}
                      disabled={loading || code.length !== 6}
                      className="px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
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
    </div>
  );
}
