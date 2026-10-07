import React, { useState } from 'react';
import { Logo } from '../brand/Logo';

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess?: (user: { name: string; email: string }) => void;
  onSelectSpace?: (space: 'employee' | 'rh_admin' | 'super_admin') => void;
}> = ({ isOpen, onClose, initialMode = 'login', onLoginSuccess, onSelectSpace }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Connexion réussie ! Chargement de votre espace...');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setSuccessMsg('Connexion réussie ! Chargement de votre espace...');
    setTimeout(() => {
      setSuccess(false);
      onClose();
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('super')) {
        if (onSelectSpace) onSelectSpace('super_admin');
      } else if (email.toLowerCase().includes('rh') || email.toLowerCase().includes('drh')) {
        if (onSelectSpace) onSelectSpace('rh_admin');
      } else {
        if (onLoginSuccess) {
          onLoginSuccess({
            name: 'Camille Demo',
            email: email || 'camille.demo@linkoffice.fr'
          });
        }
        if (onSelectSpace) onSelectSpace('employee');
      }
    }, 800);
  };

  const handleQuickLogin = (space: 'employee' | 'rh_admin' | 'super_admin', label: string) => {
    setSuccess(true);
    setSuccessMsg(`Connexion réussie ! Accès à l'espace ${label}...`);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      if (onSelectSpace) {
        onSelectSpace(space);
      } else if (onLoginSuccess) {
        onLoginSuccess({ name: 'Camille Demo', email: 'camille.demo@linkoffice.fr' });
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E3EBE6] relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#123D46]/40 hover:text-[#123D46] w-8 h-8 rounded-full flex items-center justify-center"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="sm" variant="light" />
          </div>
          <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
            {mode === 'login' ? 'Connexion à votre espace' : 'Créer votre compte'}
          </h3>
          <p className="text-xs text-[#123D46]/70 mt-1">
            Sélectionnez votre profil ou entrez vos identifiants professionnels.
          </p>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-semibold animate-pulse">
            ✨ {successMsg}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 3 Quick Profiles Access */}
            <div className="space-y-2">
              <span className="text-[10px] font-jakarta font-bold uppercase tracking-wider text-[#123D46]/60 block mb-1">
                Accès Immédiat par Rôle
              </span>

              {/* 1. Salarié */}
              <div
                onClick={() => handleQuickLogin('employee', 'Salarié')}
                className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E3EBE6] hover:border-[#00A99D] hover:bg-[#00A99D]/5 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#00A99D] text-white font-jakarta font-bold text-xs flex items-center justify-center">
                    C
                  </div>
                  <div>
                    <div className="text-xs font-jakarta font-bold text-[#123D46]">
                      Espace Collaborateur (Salarié)
                    </div>
                    <div className="text-[10px] text-[#00A99D]">
                      Camille Demo · Score 83/100 · IRIS Coach
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#00A99D] font-bold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>

              {/* 2. Admin B2B / B2B2C / B2G */}
              <div
                onClick={() => handleQuickLogin('rh_admin', 'Admin Partenaire (B2B / B2B2C / B2G)')}
                className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E3EBE6] hover:border-[#00A99D] hover:bg-[#00A99D]/5 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#5965E8] text-white font-jakarta font-bold text-xs flex items-center justify-center">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-jakarta font-bold text-[#123D46]">
                      Admin Partenaire (B2B / B2B2C / B2G)
                    </div>
                    <div className="text-[10px] text-[#5965E8]">
                      Sophie Laurent (DRH) · Observatoire & Campagnes
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#5965E8] font-bold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>

              {/* 3. Super Admin */}
              <div
                onClick={() => handleQuickLogin('super_admin', 'Super Admin')}
                className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E3EBE6] hover:border-[#FFC629] hover:bg-[#FFC629]/5 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#123D46] text-[#FFC629] font-jakarta font-bold text-xs flex items-center justify-center">
                    SA
                  </div>
                  <div>
                    <div className="text-xs font-jakarta font-bold text-[#123D46]">
                      Console Super Administrateur
                    </div>
                    <div className="text-[10px] text-[#123D46]/70">
                      Gouvernance plateforme · 9 Modules & Audit
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#123D46] font-bold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E3EBE6]"></div>
              <span className="flex-shrink mx-3 text-[11px] text-[#123D46]/50 uppercase font-bold">
                ou par identifiants
              </span>
              <div className="flex-grow border-t border-[#E3EBE6]"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#123D46] block mb-1">
                  Adresse email professionnelle
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  placeholder="••••••••••••"
                  defaultValue="demo1234"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-xs focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all text-[#123D46]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-all shadow-xs"
              >
                {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs text-[#00A99D] hover:underline font-semibold"
              >
                {mode === 'login'
                  ? "Vous n'avez pas encore de compte ? S'inscrire"
                  : 'Déjà un compte ? Se connecter'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
