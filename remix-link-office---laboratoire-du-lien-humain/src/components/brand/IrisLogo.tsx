import React from 'react';

interface IrisLogoProps {
  variant?: 'horizontal' | 'badge' | 'avatar' | 'symbol-only' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  isAnimated?: boolean;
}

export const IrisMark: React.FC<{ size?: number; className?: string; isAnimated?: boolean }> = ({
  size = 48,
  className = '',
  isAnimated = false
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
      <defs>
        {/* Iris gradient: violet action to teal clarity */}
        <linearGradient id="irisRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5965E8" />
          <stop offset="50%" stopColor="#00A99D" />
          <stop offset="100%" stopColor="#199E9A" />
        </linearGradient>

        <radialGradient id="irisCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="40%" stopColor="#FFC629" />
          <stop offset="85%" stopColor="#FF9E00" />
          <stop offset="100%" stopColor="#5965E8" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="irisAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00A99D" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5965E8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background aura */}
      <circle cx="50" cy="50" r="46" fill="url(#irisAura)" />

      {/* Outer orbital guide / Petals representing the human group */}
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke="#5965E8"
        strokeWidth="1.2"
        strokeDasharray="4 6"
        strokeOpacity="0.45"
      />

      {/* Concentric Iris Petals / Aperture blades */}
      {/* Blade 1 - Top Left */}
      <path
        d="M 50 14 C 68 14, 82 28, 84 46 C 72 38, 58 36, 44 42 C 40 30, 44 18, 50 14 Z"
        fill="#5965E8"
        fillOpacity="0.25"
      />
      {/* Blade 2 - Right */}
      <path
        d="M 86 50 C 86 68, 72 82, 54 84 C 62 72, 64 58, 58 44 C 70 40, 82 44, 86 50 Z"
        fill="#00A99D"
        fillOpacity="0.28"
      />
      {/* Blade 3 - Bottom Left */}
      <path
        d="M 50 86 C 32 86, 18 72, 16 54 C 28 62, 42 64, 56 58 C 60 70, 56 82, 50 86 Z"
        fill="#199E9A"
        fillOpacity="0.3"
      />
      {/* Blade 4 - Top Left / Entrance */}
      <path
        d="M 14 50 C 14 32, 28 18, 46 16 C 38 28, 36 42, 42 56 C 30 60, 18 56, 14 50 Z"
        fill="#4DBDB2"
        fillOpacity="0.25"
      />

      {/* Main Optical Iris Ring */}
      <circle
        cx="50"
        cy="50"
        r="28"
        stroke="url(#irisRingGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={isAnimated ? 'animate-spin origin-center' : ''}
        style={{ animationDuration: '18s' }}
      />

      {/* Network Connection Lines (Constellation inside the Iris) */}
      <line x1="28" y1="36" x2="68" y2="34" stroke="#00A99D" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="68" y1="34" x2="64" y2="68" stroke="#5965E8" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="64" y1="68" x2="32" y2="62" stroke="#199E9A" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="32" y1="62" x2="28" y2="36" stroke="#4DBDB2" strokeWidth="1.2" strokeOpacity="0.7" />
      <line x1="28" y1="36" x2="50" y2="50" stroke="#FFC629" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />
      <line x1="68" y1="34" x2="50" y2="50" stroke="#FFC629" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />
      <line x1="64" y1="68" x2="50" y2="50" stroke="#FFC629" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />
      <line x1="32" y1="62" x2="50" y2="50" stroke="#FFC629" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />

      {/* Satellite Peripheral AI Nodes */}
      <circle cx="28" cy="36" r="3.5" fill="#00A99D" stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="68" cy="34" r="3.5" fill="#5965E8" stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="64" cy="68" r="4" fill="#00A99D" stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="32" cy="62" r="3" fill="#4DBDB2" stroke="#FFFFFF" strokeWidth="1" />

      {/* Outer Orbit Spark Nodes */}
      <circle cx="50" cy="10" r="2.5" fill="#FFC629" />
      <circle cx="90" cy="50" r="2.5" fill="#5965E8" />
      <circle cx="50" cy="90" r="2.5" fill="#00A99D" />
      <circle cx="10" cy="50" r="2" fill="#4DBDB2" />

      {/* Golden Pupil / Conscious Core */}
      <circle cx="50" cy="50" r="10" fill="url(#irisCoreGrad)" />
      <circle cx="50" cy="50" r="3.5" fill="#FFFFFF" />

      {/* Cross-star luminous sparkle */}
      <line x1="50" y1="42" x2="50" y2="58" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
      <line x1="42" y1="50" x2="58" y2="50" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
};

export const IrisLogo: React.FC<IrisLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  className = '',
  isAnimated = false
}) => {
  const markSizes = {
    sm: 32,
    md: 44,
    lg: 56,
    xl: 72
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  if (variant === 'symbol-only') {
    return <IrisMark size={markSizes[size]} className={className} isAnimated={isAnimated} />;
  }

  if (variant === 'avatar') {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#123D46] via-[#1E3048] to-[#123D46] p-2 border border-[#5965E8]/30 shadow-md ${className}`}>
        <IrisMark size={markSizes[size]} isAnimated={true} />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A99D] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00A99D]" />
        </span>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`px-4 py-2.5 rounded-2xl bg-[#123D46] border border-[#5965E8]/30 text-white shadow-md inline-flex items-center gap-3 ${className}`}>
        <IrisMark size={markSizes[size]} isAnimated={isAnimated} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-jakarta font-extrabold tracking-tight ${textSizes[size]} text-white leading-none`}>
              IRIS
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#5965E8] text-white">
              IA
            </span>
          </div>
          {showTagline && (
            <span className="text-[10px] font-jakarta font-medium text-[#4DBDB2] tracking-wider uppercase mt-0.5">
              Intelligence Relationnelle
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <IrisMark size={markSizes[size]} isAnimated={isAnimated} />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className={`font-jakarta font-black tracking-tight ${textSizes[size]} text-[#123D46] leading-none`}>
              IRIS
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#5965E8]/15 text-[#5965E8]">
              IA
            </span>
          </div>
          {showTagline && (
            <span className="text-[10px] font-jakarta font-semibold text-[#00A99D] tracking-wide mt-1">
              Intelligence Relationnelle
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default horizontal
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <IrisMark size={markSizes[size]} isAnimated={isAnimated} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-jakarta font-black tracking-tight ${textSizes[size]} text-[#123D46] leading-none`}>
            IRIS
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-jakarta font-bold bg-[#5965E8]/10 text-[#5965E8] border border-[#5965E8]/20">
            IA
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-jakarta font-semibold text-[#00A99D] tracking-wider uppercase mt-1">
            Intelligence Relationnelle
          </span>
        )}
      </div>
    </div>
  );
};
