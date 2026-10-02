"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Logo } from "@/src/components/brand/Logo";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const registered = searchParams.get("registered");
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = session.user.role;
      let target = callbackUrl;

      // Redirection unique vers le traffic controller
      if (role === "SUPER_ADMIN") target = "/admin";
      else if (callbackUrl === "/dashboard" || callbackUrl === "/" || callbackUrl.startsWith("/auth/")) {
        target = "/dashboard";
      }

      router.replace(target);
    }
  }, [status, session, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        twoFactorCode: show2FA ? twoFactorCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("2FA_REQUIRED")) {
          setShow2FA(true);
          setError(null);
          setLoading(false);
          return;
        } else if (result.error.includes("2FA_INVALID")) {
          setError("Code d'authentification invalide.");
        } else if (result.error.includes("RATE_LIMITED")) {
          const seconds = parseInt(result.error.split(":")[1] || "60", 10);
          setError(`Trop de tentatives. Réessayez dans ${Math.ceil(seconds / 60)} minute(s).`);
        } else {
          setError("Email ou mot de passe incorrect.");
        }
        setLoading(false);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const role = sessionData?.user?.role;

        let target = callbackUrl;
        if (role === "SUPER_ADMIN") target = "/admin";
        else if (!searchParams.has("callbackUrl") || callbackUrl === "/dashboard" || callbackUrl === "/" || callbackUrl.startsWith("/auth/")) {
          target = "/dashboard";
        }

        router.replace(target);
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la connexion.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-5 relative overflow-hidden">
      {/* Glow blobs for aesthetic background */}
      <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,169,157,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(18,61,70,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">

        {/* Form card */}
        <div className="bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E3EBE6]">
          
          {/* Logo + title inside card to match AuthModal */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-6">
              <Logo size="md" />
            </Link>
            
            <h1 className="font-jakarta font-extrabold text-[22px] text-[#123D46] mb-2 leading-tight">
              Connexion à votre espace
            </h1>
            <p className="text-[13px] text-[#123D46]/70">
              Accédez à vos tableaux de bord, au carnet de santé et à vos 5 dimensions.
            </p>
          </div>

          {registered === "business" && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-[13px] font-medium">
              <CheckCircle2 size={16} className="shrink-0" />
              Votre espace a été créé avec succès. Veuillez vous connecter.
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px] font-medium animate-shake">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Si 2FA est requis */}
            {show2FA ? (
              <div className="animate-fade-in">
                <label htmlFor="twoFactorCode" className="block text-[13px] font-semibold text-[#123D46] mb-1.5">
                  Code d'authentification (2FA)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#123D46]/40">
                    <Lock size={16} />
                  </span>
                  <input
                    id="twoFactorCode" type="text" required
                    placeholder="123456"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E3EBE6] bg-white text-[13px] text-[#123D46] focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all font-medium"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => { setShow2FA(false); setTwoFactorCode(""); }}
                  className="bg-transparent border-none text-[#00A99D] font-semibold text-[13px] mt-3 cursor-pointer hover:underline"
                >
                  Retour
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[13px] font-semibold text-[#123D46] mb-1.5">
                    Adresse email professionnelle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#123D46]/40">
                      <Mail size={16} />
                    </span>
                    <input
                      id="email" type="email" required
                      placeholder="prenom.nom@entreprise.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E3EBE6] bg-white text-[13px] text-[#123D46] focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="text-[13px] font-semibold text-[#123D46]">
                      Mot de passe
                    </label>
                    <a href="#" className="text-[11px] font-semibold text-[#00A99D] hover:underline no-underline">
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#123D46]/40">
                      <Lock size={16} />
                    </span>
                    <input
                      id="password" type="password" required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E3EBE6] bg-white text-[13px] text-[#123D46] focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-[#123D46] hover:bg-[#1a4f5a] text-white font-jakarta font-bold text-xs transition-all shadow-md mt-2 flex items-center justify-center disabled:opacity-70"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Se connecter <ArrowRight size={16} className="ml-2" /></>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-[#E3EBE6]">
            <p className="text-[13px] text-[#123D46]/70">
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-[#00A99D] font-bold no-underline hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
