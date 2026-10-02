import React, { useState } from 'react';
import { Logo } from '../brand/Logo';

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess?: (user: { name: string; email: string }) => void;
}> = ({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess({
          name: 'Camille Demo',
          email: email || 'camille.demo@linkoffice.fr'
        });
      }
    }, 900);
  };

  const handleQuickDemoLogin = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess({
          name: 'Camille Demo',
          email: 'camille.demo@linkoffice.fr'
        });
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
            Accédez à vos tableaux de bord, au carnet de santé et à vos 5 dimensions.
          </p>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-semibold animate-pulse">
            ✨ Connexion réussie ! Chargement de votre espace IQRH...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Demo Access Button */}
            <div className="p-3.5 rounded-2xl bg-[#00A99D]/10 border border-[#00A99D]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#00A99D] text-white font-jakarta font-bold text-xs flex items-center justify-center shrink-0">
                  C
                </div>
                <div className="text-left">
                  <div className="text-xs font-jakarta font-bold text-[#123D46]">
                    Espace Démo (Camille)
                  </div>
                  <div className="text-[10px] text-[#00A99D] font-semibold">
                    Score IQRH 83/100 · Données complètes
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="px-3 py-1.5 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold shadow-xs whitespace-nowrap"
              >
                Ouvrir →
              </button>
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
                className="w-full py-2.5 rounded-xl bg-[#123D46] hover:bg-[#1a4f5a] text-white font-jakarta font-bold text-xs transition-all shadow-md"
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
