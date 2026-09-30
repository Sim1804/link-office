import React, { useState } from 'react';
import { Logo } from '../brand/Logo';

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}> = ({ isOpen, onClose, initialMode = 'register' }) => {
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
    }, 1800);
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
            {mode === 'login' ? 'Connexion à votre espace' : 'Commencer gratuitement'}
          </h3>
          <p className="text-xs text-[#123D46]/70 mt-1">
            {mode === 'login'
              ? 'Accédez à vos tableaux de bord et diagnostics'
              : 'Évaluez la qualité relationnelle de votre collectif en 3 minutes'}
          </p>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-semibold">
            ✨ Bienvenue dans l'univers LinkOffice ! Connexion en cours...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#123D46] block mb-1">
                Adresse email professionnelle
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="julien.dupont@entreprise.fr"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-sm focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all"
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
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-sm focus:outline-none focus:border-[#00A99D] focus:ring-2 focus:ring-[#00A99D]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-all shadow-md"
            >
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte gratuit'}
            </button>

            <div className="text-center pt-2">
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
          </form>
        )}
      </div>
    </div>
  );
};
