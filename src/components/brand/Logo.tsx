import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'badge' | 'circle' | 'mark-only' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

/**
 * Constellation vectorielle officielle de LINK OFFICE
 * Rendu SVG pur, net et fluide sur tous supports
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
      {/* 1. Nœud orange / corail en haut à gauche */}
      <circle cx="16" cy="28" r="4.5" fill="#FFC629" />

      {/* 2. Nœud bleu royal au centre gauche */}
      <circle cx="35" cy="52" r="8" fill="#1D70B8" />
      <circle cx="35" cy="52" r="3" fill="#FFFFFF" opacity="0.9" />

      {/* 3. Nœud principal au centre droit */}
      <circle cx="58" cy="48" r="7.5" fill={navyNode} />
      <circle cx="58" cy="48" r="2.5" fill="#FFFFFF" opacity="0.9" />

      {/* 4. Nœud vert canard / menthe en bas à gauche */}
      <circle cx="18" cy="76" r="5" fill="#00A99D" />

      {/* 5. Nœud violet / indigo en bas à droite */}
      <circle cx="82" cy="78" r="5.5" fill="#5965E8" />

      {/* 6. Nœud satellite en haut à droite */}
      <circle cx="78" cy="28" r="3.5" fill={isDark ? "#E3EBE6" : "#6B7280"} />
    </svg>
  );
};

/**
 * Logo officiel LINK OFFICE (Format SVG vectoriel)
 * Affiche la constellation officielle et la typographie exacte LiNK OFFICE
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = false,
  className = ''
}) => {
  const isDark = variant === 'dark' || variant === 'badge';
  const isWhite = variant === 'white';
  const markVariant: 'light' | 'dark' | 'white' = isWhite ? 'white' : isDark ? 'dark' : 'light';

  const markSizes = {
    sm: 34,
    md: 44,
    lg: 56,
    xl: 72
  };

  const textSizes = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl'
  };

  const subSizes = {
    sm: 'text-[8.5px] sm:text-[9.5px] tracking-[0.38em]',
    md: 'text-[10px] sm:text-[11px] tracking-[0.42em]',
    lg: 'text-[12px] sm:text-[13px] tracking-[0.46em]',
    xl: 'text-[15px] sm:text-[16px] tracking-[0.52em]'
  };

  if (variant === 'circle') {
    return (
      <div className={`flex flex-col items-center justify-center p-4 rounded-full bg-[#123D46] shadow-md border border-[#199E9A]/30 aspect-square w-28 h-28 ${className}`}>
        <ConstellationMark size={36} variant="dark" />
        <div className="mt-1 text-center leading-none">
          <span className="font-jakarta font-black text-white tracking-tight text-xs block">
            L<span className="text-[#00A99D]">i</span>NK
          </span>
          <span className="font-jakarta font-semibold text-[#4DBDB2] text-[7px] tracking-[0.35em] block mt-0.5">
            OFFICE
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'mark-only') {
    return <ConstellationMark size={markSizes[size]} variant={markVariant} className={className} />;
  }

  const textColor = isWhite ? 'text-white' : isDark ? 'text-[#F4F1E8]' : 'text-[#123D46]';
  const subColor = isWhite ? 'text-[#4DBDB2]' : isDark ? 'text-[#4DBDB2]' : 'text-[#123D46]/85';

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <ConstellationMark size={markSizes[size]} variant={markVariant} />
      <div className="flex flex-col justify-center">
        {/* Typographie officielle LiNK avec point teal */}
        <div className={`font-jakarta font-black tracking-tight ${textSizes[size]} leading-none ${textColor} flex items-center`}>
          <span>L</span>
          <span className="relative inline-flex flex-col items-center mx-[1px]">
            <span className="w-[5px] h-[5px] rounded-full bg-[#00A99D] mb-[2px] shadow-2xs" />
            <span className="leading-none text-[0.88em]">ı</span>
          </span>
          <span>NK</span>
        </div>
        {/* Typographie espacée O F F I C E */}
        <span className={`font-jakarta font-bold uppercase ${subSizes[size]} leading-tight mt-1 ${subColor} whitespace-nowrap`}>
          O F F I C E
        </span>
        {showTagline && (
          <span className={`text-[9.5px] font-medium tracking-normal mt-0.5 whitespace-nowrap ${isDark ? 'text-[#FFC629]' : 'text-[#00A99D]'}`}>
            Laboratoire du lien humain
          </span>
        )}
      </div>
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
