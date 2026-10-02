import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'badge' | 'circle' | 'mark-only' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const ConstellationMark: React.FC<{ size?: number; className?: string }> = ({
  size = 54,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      {/* Outer subtle circular boundary ring - exactly as in LOGO_LINK_OFFICE.png */}
      <circle cx="50" cy="50" r="44" stroke="#C5D3D1" strokeWidth="1.2" strokeOpacity="0.8" />

      {/* Network connection lines */}
      <line x1="16" y1="28" x2="35" y2="52" stroke="#B0C4DE" strokeWidth="1" strokeOpacity="0.85" />
      <line x1="16" y1="28" x2="58" y2="48" stroke="#D1D5DB" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.7" />
      <line x1="35" y1="52" x2="58" y2="48" stroke="#123D46" strokeWidth="1.4" strokeOpacity="0.75" />
      <line x1="35" y1="52" x2="18" y2="76" stroke="#4DBDB2" strokeWidth="1.1" strokeOpacity="0.8" />
      <line x1="58" y1="48" x2="18" y2="76" stroke="#C5D3D1" strokeWidth="0.8" strokeOpacity="0.6" />
      <line x1="58" y1="48" x2="82" y2="78" stroke="#5965E8" strokeWidth="1.2" strokeOpacity="0.8" />
      <line x1="58" y1="48" x2="78" y2="28" stroke="#123D46" strokeWidth="1.1" strokeOpacity="0.7" />
      <line x1="18" y1="76" x2="82" y2="78" stroke="#C5D3D1" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.5" />
      <line x1="78" y1="28" x2="82" y2="78" stroke="#C5D3D1" strokeWidth="0.8" strokeOpacity="0.5" />

      {/* Nodes matching LOGO_LINK_OFFICE.png */}
      {/* 1. Top-left Orange / Coral Node */}
      <circle cx="16" cy="28" r="4" fill="#F26D35" />

      {/* 2. Center-left Royal Blue Node */}
      <circle cx="35" cy="52" r="7.5" fill="#1D70B8" />
      <circle cx="35" cy="52" r="2.8" fill="#FFFFFF" opacity="0.9" />

      {/* 3. Center-right Deep Navy Primary Node */}
      <circle cx="58" cy="48" r="7" fill="#0D2530" />
      <circle cx="58" cy="48" r="2.4" fill="#FFFFFF" opacity="0.9" />

      {/* 4. Bottom-left Mint / Teal Node */}
      <circle cx="18" cy="76" r="4.5" fill="#00A99D" />

      {/* 5. Bottom-right Periwinkle / Purple Node */}
      <circle cx="82" cy="78" r="5" fill="#7B7FE8" />

      {/* 6. Top-right Small Satellite Node */}
      <circle cx="78" cy="28" r="3" fill="#6B7280" />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = false,
  className = ''
}) => {
  const isDark = variant === 'dark' || variant === 'badge';
  const isWhite = variant === 'white';

  const markSizes = {
    sm: 38,
    md: 50,
    lg: 64,
    xl: 84
  };

  const textSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const subSizes = {
    sm: 'text-[9px] tracking-[0.38em]',
    md: 'text-[11px] tracking-[0.42em]',
    lg: 'text-[13px] tracking-[0.46em]',
    xl: 'text-[16px] tracking-[0.52em]'
  };

  if (variant === 'circle') {
    return (
      <div className={`flex flex-col items-center justify-center p-5 rounded-full bg-[#123D46] shadow-md border border-[#199E9A]/30 aspect-square w-32 h-32 ${className}`}>
        <ConstellationMark size={44} />
        <div className="mt-2 text-center">
          <span className="font-jakarta font-black text-white tracking-tight text-xs block">
            L<span className="text-[#00A99D]">i</span>NK
          </span>
          <span className="font-jakarta font-medium text-[#4DBDB2] text-[7px] tracking-[0.35em] block">
            OFFICE
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'mark-only') {
    return <ConstellationMark size={markSizes[size]} className={className} />;
  }

  const textColor = isWhite ? 'text-white' : isDark ? 'text-white' : 'text-[#0D2530]';
  const subColor = isWhite ? 'text-[#4DBDB2]' : isDark ? 'text-[#4DBDB2]' : 'text-[#0D2530]/85';

  const content = (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      <ConstellationMark size={markSizes[size]} />
      <div className="flex flex-col">
        {/* Exact LiNK typography matching LOGO_LINK_OFFICE.png */}
        <div className={`font-jakarta font-black tracking-tight ${textSizes[size]} leading-none ${textColor} flex items-center`}>
          <span>L</span>
          {/* Lowercase 'i' with vibrant turquoise/teal dot */}
          <span className="relative inline-flex flex-col items-center mx-[1px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#00A99D] mb-[2px] shadow-2xs" />
            <span className="leading-none text-[0.88em]">ı</span>
          </span>
          <span>NK</span>
        </div>
        {/* Tracked O F F I C E */}
        <span className={`font-jakarta font-semibold uppercase ${subSizes[size]} leading-tight mt-1 ${subColor}`}>
          O F F I C E
        </span>
        {showTagline && (
          <span className="text-[10px] text-[#00A99D] font-medium tracking-normal mt-0.5">
            Laboratoire du lien humain
          </span>
        )}
      </div>
    </div>
  );

  if (variant === 'badge') {
    return (
      <div className="px-6 py-4 rounded-2xl bg-[#123D46] text-white shadow-lg border border-[#199E9A]/20 inline-block">
        {content}
      </div>
    );
  }

  return content;
};
