"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Logo } from "@/src/components/brand/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", password: "", confirmPassword: "" });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Erreur lors de l'inscription");
      }
      
      // Auto-login after successful registration
      const loginRes = await signIn("credentials", { 
        email: form.email, 
        password: form.password, 
        redirect: false 
      });
      
      if (loginRes?.error) {
        throw new Error("Compte créé mais erreur de connexion automatique.");
      }
      
      router.push("/consentement");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1E8] flex flex-col items-center justify-center p-4">
      {/* Container matching AuthModal frontend design */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E3EBE6] relative animate-fade-in">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Logo size="sm" variant="light" />
            </Link>
          </div>
          <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
            Créer votre compte
          </h3>
          <p className="text-xs text-[#123D46]/70 mt-1.5 font-inter">
            Rejoignez Link Office et évaluez la santé relationnelle de votre équipe.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-xl text-center text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#123D46] block mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={form.prenom}
                  onChange={set("prenom")}
                  placeholder="Camille"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-xs focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all text-[#123D46]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#123D46] block mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={set("nom")}
                  placeholder="Demo"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-xs focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all text-[#123D46]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#123D46] block mb-1">
                Adresse email professionnelle
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="camille.demo@linkoffice.fr"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-xs focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all text-[#123D46]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#123D46] block mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-xs focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all text-[#123D46]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#123D46] block mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-xs focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all text-[#123D46]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-full bg-[#123D46] hover:bg-[#1a4f5a] text-white font-jakarta font-bold text-xs transition-all shadow-md flex items-center justify-center disabled:opacity-70"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-[10px] text-[#123D46]/50 pt-2">
            En vous inscrivant, vous acceptez nos conditions d'utilisation.
          </p>

          <div className="text-center pt-2 border-t border-[#E3EBE6]">
            <Link href="/auth/login" className="text-xs text-[#00A99D] hover:underline font-semibold font-inter">
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
