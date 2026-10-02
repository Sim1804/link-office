"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E3EBE6] py-12 px-4 sm:px-8 mt-16">
      <div className="max-w-[1440px] mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-[#123D46]/75">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-3 md:pr-4">
            <Link href="/" className="inline-block no-underline">
              <Logo size="md" showTagline={true} />
            </Link>
            <p className="text-xs text-[#123D46]/70 leading-relaxed font-inter">
              Laboratoire du lien humain. Comprendre, observer, mesurer et agir pour valoriser la santé relationnelle des organisations et des collectifs de travail.
            </p>
            <div className="text-[11px] text-[#00A99D] font-bold font-jakarta">
              Comprendre · Observer · Mesurer · Agir
            </div>
          </div>

          {/* Column 2: Navigation Accueil */}
          <div>
            <span className="font-jakarta font-bold text-[#123D46] uppercase tracking-wider block mb-3">
              Plateforme & Outils
            </span>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link href="/#methode" className="hover:text-[#00A99D] transition-colors block">
                  La démarche scientifique en 4 temps
                </Link>
              </li>
              <li>
                <Link href="/#barometre" className="hover:text-[#00A99D] transition-colors flex items-center gap-1.5">
                  <span>Baromètre national en direct</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </Link>
              </li>
              <li>
                <Link href="/#iqrh" className="hover:text-[#00A99D] transition-colors block">
                  Évaluation de l'Indice IQRH
                </Link>
              </li>
              <li>
                <Link href="/#iris" className="hover:text-[#00A99D] transition-colors block">
                  Coach IRIS (Intelligence Relationnelle)
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-[#00A99D] font-bold hover:underline transition-colors flex items-center gap-1">
                  <span>Accéder à l'espace connecté</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Entreprises & Tarifs */}
          <div>
            <span className="font-jakarta font-bold text-[#123D46] uppercase tracking-wider block mb-3">
              Pour les Organisations
            </span>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link href="/#solutions" className="hover:text-[#00A99D] transition-colors block">
                  Audit interne & Baromètre dédié
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="hover:text-[#00A99D] transition-colors block">
                  Accompagnement des directions & DRH
                </Link>
              </li>
              <li>
                <Link href="/#tarifs" className="hover:text-[#00A99D] transition-colors block">
                  Formules & Déploiement d'équipe
                </Link>
              </li>
              <li>
                <Link href="/#partenaires" className="hover:text-[#00A99D] transition-colors block">
                  Partenaires scientifiques & institutionnels
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Déontologie & Contact */}
          <div>
            <span className="font-jakarta font-bold text-[#123D46] uppercase tracking-wider block mb-3">
              Éthique & Contact
            </span>
            <ul className="space-y-2 text-[11px] text-[#123D46]/70">
              <li className="font-medium text-[#123D46]">
                contact@linkoffice.fr
              </li>
              <li>
                Paris 8e · Siège de recherche sociologique
              </li>
              <li className="pt-1 text-[#00A99D] font-medium">
                ✓ Anonymat strict garanti (Protocole RGPD)
              </li>
              <li className="text-[#123D46]/60">
                ✓ Données hébergées en France
              </li>
              <li className="text-[#123D46]/60">
                ✓ Aucun traçage individuel transmis à l'employeur
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#E3EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-[#123D46]/60">
          <div>
            © 2026 LINK OFFICE — Laboratoire du Lien Humain. Tous droits réservés.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/mentions-legales" className="hover:text-[#00A99D] transition-colors">Mentions légales</Link>
            <span>·</span>
            <Link href="/politique-confidentialite" className="hover:text-[#00A99D] transition-colors">Politique de confidentialité</Link>
            <span>·</span>
            <span>Charte déontologique</span>
            <span>·</span>
            <span>Accessibilité</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
