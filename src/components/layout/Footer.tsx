"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';

export function Footer() {
  return (
    <footer className="bg-[#123D46] border-t border-[#123D46] py-12 px-4 sm:px-8 mt-16 text-[#E3EBE6]">
      <div className="max-w-[1440px] mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-[#E3EBE6]">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-3 md:pr-4">
            <Link href="/" className="inline-block no-underline">
              <Logo variant="dark" size="sm" showTagline={false} />
            </Link>
            <p className="text-xs text-[#E3EBE6] leading-relaxed font-inter">
              Laboratoire du lien humain. Comprendre, observer, mesurer et agir pour valoriser la santé relationnelle des organisations et des collectifs de travail.
            </p>
            <div className="text-[11px] text-[#FFC629] font-bold font-jakarta">
              Comprendre · Observer · Mesurer · Agir
            </div>
          </div>

          {/* Column 2: Navigation Accueil */}
          <div>
            <span className="font-jakarta font-bold text-[#4DBDB2] uppercase tracking-wider block mb-3">
              Plateforme & Outils
            </span>
            <ul className="space-y-2.5 font-medium text-[#E3EBE6]">
              <li>
                <Link href="/#methode" className="hover:text-[#FFC629] transition-colors block">
                  La démarche scientifique en 4 temps
                </Link>
              </li>
              <li>
                <Link href="/#barometre" className="hover:text-[#FFC629] transition-colors flex items-center gap-1.5">
                  <span>Baromètre national en direct</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4DBDB2] animate-pulse" />
                </Link>
              </li>
              <li>
                <Link href="/#iqrh" className="hover:text-[#FFC629] transition-colors block">
                  Évaluation de l'Indice IQRH
                </Link>
              </li>
              <li>
                <Link href="/#iris" className="hover:text-[#FFC629] transition-colors block">
                  Coach IRIS (Intelligence Relationnelle)
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-[#4DBDB2] font-bold hover:text-[#FFC629] transition-colors flex items-center gap-1">
                  <span>Accéder à l'espace connecté</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Entreprises & Tarifs */}
          <div>
            <span className="font-jakarta font-bold text-[#4DBDB2] uppercase tracking-wider block mb-3">
              Pour les Organisations
            </span>
            <ul className="space-y-2.5 font-medium text-[#E3EBE6]">
              <li>
                <Link href="/#solutions" className="hover:text-[#FFC629] transition-colors block">
                  Audit interne & Baromètre dédié
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="hover:text-[#FFC629] transition-colors block">
                  Accompagnement des directions & DRH
                </Link>
              </li>
              <li>
                <Link href="/#tarifs" className="hover:text-[#FFC629] transition-colors block">
                  Formules & Déploiement d'équipe
                </Link>
              </li>
              <li>
                <Link href="/#partenaires" className="hover:text-[#FFC629] transition-colors block">
                  Partenaires scientifiques & institutionnels
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Déontologie & Contact */}
          <div>
            <span className="font-jakarta font-bold text-[#4DBDB2] uppercase tracking-wider block mb-3">
              Éthique & Contact
            </span>
            <ul className="space-y-2 text-[11px] text-[#E3EBE6]">
              <li className="font-semibold text-[#F4F1E8]">
                contact@linkoffice.fr
              </li>
              <li>
                Paris 8e · Siège de recherche sociologique
              </li>
              <li className="pt-1 text-[#4DBDB2] font-medium">
                ✓ Anonymat strict garanti (Protocole RGPD)
              </li>
              <li className="text-[#E3EBE6]/80">
                ✓ Données hébergées en France
              </li>
              <li className="text-[#E3EBE6]/80">
                ✓ Aucun traçage individuel transmis à l'employeur
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[rgba(227,235,230,0.14)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-[#4DBDB2]">
          <div className="text-[#E3EBE6]/80">
            © 2026 LINK OFFICE — Laboratoire du Lien Humain. Tous droits réservés.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[#E3EBE6]">
            <Link href="/mentions-legales" className="hover:text-[#FFC629] transition-colors">Mentions légales</Link>
            <span>·</span>
            <Link href="/politique-confidentialite" className="hover:text-[#FFC629] transition-colors">Politique de confidentialité</Link>
            <span>·</span>
            <span className="hover:text-[#FFC629] transition-colors cursor-pointer">Charte déontologique</span>
            <span>·</span>
            <span className="hover:text-[#FFC629] transition-colors cursor-pointer">Accessibilité</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
