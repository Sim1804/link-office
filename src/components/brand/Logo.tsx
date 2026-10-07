import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'badge' | 'circle' | 'mark-only' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

/**
 * Constellation vectorielle officielle de LINK OFFICE
 * Exportée pour rétro-compatibilité avec les vues spécialisées
 */
export const ConstellationMark: React.FC<{ 
  size?: number; 
  variant?: 'light' | 'dark' | 'white'; 
  className?: string 
}> = ({
  size = 42,
  variant = 'light',
  className = ''
}) => {
  const isDark = variant === 'dark' || variant === 'white';
  const ringColor = isDark ? "rgba(227, 235, 230, 0.4)" : "#C5D3D1";
  const lineMain = isDark ? "rgba(227, 235, 230, 0.7)" : "#123D46";
  const lineSoft = isDark ? "rgba(227, 235, 230, 0.35)" : "#B0C4DE";
  const navyNode = isDark ? "#4DBDB2" : "#0D2530";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      {/* Anneau circulaire orbital extérieur */}
      <circle cx="50" cy="50" r="44" stroke={ringColor} strokeWidth="1.5" strokeOpacity="0.8" />

      {/* Lignes de liaison du réseau humain */}
      <line x1="16" y1="28" x2="35" y2="52" stroke={lineSoft} strokeWidth="1.2" strokeOpacity="0.85" />
      <line x1="16" y1="28" x2="58" y2="48" stroke={lineSoft} strokeWidth="1" strokeDasharray="2 3" strokeOpacity="0.7" />
      <line x1="35" y1="52" x2="58" y2="48" stroke={lineMain} strokeWidth="1.5" strokeOpacity="0.75" />
      <line x1="35" y1="52" x2="18" y2="76" stroke="#4DBDB2" strokeWidth="1.2" strokeOpacity="0.8" />
      <line x1="58" y1="48" x2="18" y2="76" stroke={lineSoft} strokeWidth="1" strokeOpacity="0.6" />
      <line x1="58" y1="48" x2="82" y2="78" stroke="#5965E8" strokeWidth="1.3" strokeOpacity="0.8" />
      <line x1="58" y1="48" x2="78" y2="28" stroke={lineMain} strokeWidth="1.3" strokeOpacity="0.7" />
      <line x1="18" y1="76" x2="82" y2="78" stroke={lineSoft} strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
      <line x1="78" y1="28" x2="82" y2="78" stroke={lineSoft} strokeWidth="1" strokeOpacity="0.5" />

      {/* Nœuds colorés (symboles des polarités relationnelles) */}
      <circle cx="16" cy="28" r="4.5" fill="#FFC629" />
      <circle cx="35" cy="52" r="8" fill="#1D70B8" />
      <circle cx="35" cy="52" r="3" fill="#FFFFFF" opacity="0.9" />
      <circle cx="58" cy="48" r="7.5" fill={navyNode} />
      <circle cx="58" cy="48" r="2.5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="18" cy="76" r="5" fill="#00A99D" />
      <circle cx="82" cy="78" r="5.5" fill="#5965E8" />
      <circle cx="78" cy="28" r="3.5" fill={isDark ? "#E3EBE6" : "#6B7280"} />
    </svg>
  );
};

/**
 * Logo officiel LINK OFFICE
 * Utilise expressément /link_office_logo.svg pour le Header et le Footer
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = false,
  className = ''
}) => {
  const isDark = variant === 'dark' || variant === 'badge';
  const isWhite = variant === 'white';

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-9 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  if (variant === 'circle') {
    return (
      <div className={`flex flex-col items-center justify-center p-3 rounded-full bg-[#123D46] shadow-md border border-[#199E9A]/30 aspect-square w-24 h-24 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/link_office_logo.svg"
          alt="LINK OFFICE"
          className="h-8 w-auto object-contain brightness-0 invert"
        />
      </div>
    );
  }

  if (variant === 'mark-only') {
    return (
      <ConstellationMark 
        size={size === 'sm' ? 34 : size === 'md' ? 44 : size === 'lg' ? 56 : 72} 
        variant={isWhite ? 'white' : isDark ? 'dark' : 'light'} 
        className={className} 
      />
    );
  }

  // Sur fond sombre (footer, mode dark, badge), on applique un filtre blanc pur pour un rendu net et élégant
  const filterClass = (isDark || isWhite)
    ? 'brightness-0 invert opacity-95 hover:opacity-100 transition-opacity'
    : '';

  const content = (
    <div className={`inline-flex flex-col justify-center select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/link_office_logo.svg"
        alt="LINK OFFICE"
        className={`${sizeClasses[size]} w-auto object-contain shrink-0 ${filterClass}`}
      />
      {showTagline && (
        <span className={`text-[9.5px] sm:text-[10px] font-medium tracking-normal mt-0.5 whitespace-nowrap ${isDark ? 'text-[#FFC629]' : 'text-[#00A99D]'}`}>
          Laboratoire du lien humain
        </span>
      )}
    </div>
  );

  if (variant === 'badge') {
    return (
      <div className="px-5 py-3 rounded-2xl bg-[#123D46] text-white shadow-lg border border-[#199E9A]/20 inline-block">
        {content}
      </div>
    );
  }

  return content;
};
