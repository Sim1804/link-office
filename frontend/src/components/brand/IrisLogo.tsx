import React from 'react';

interface IrisLogoProps {
  variant?: 'horizontal' | 'badge' | 'avatar' | 'symbol-only' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  isAnimated?: boolean;
}

/**
 * IrisMark: Sibling mark of Link Office Constellation
 * Fuses the Link Office constellation nodes & network lines
 * with an optical & neural iris aperture (Vision, Insight & Relational Intelligence).
 */
export const IrisMark: React.FC<{
  size?: number;
  className?: string;
  isAnimated?: boolean;
  glow?: boolean;
}> = ({ size = 48, className = '', isAnimated = false, glow = false }) => {
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
        {/* Core neural glow */}
        <radialGradient id="irisNeuralPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC629" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#5965E8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00A99D" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="irisRingGradLink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1D70B8" />
          <stop offset="50%" stopColor="#00A99D" />
          <stop offset="100%" stopColor="#5965E8" />
        </linearGradient>

        <linearGradient id="irisLensArc" x1="15%" y1="50%" x2="85%" y2="50%">
          <stop offset="0%" stopColor="#4DBDB2" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#5965E8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00A99D" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* 1. Subtle Outer Circular Boundary Ring - Exactly matching Link Office's r=44 ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="#C5D3D1"
        strokeWidth="1.2"
        strokeOpacity="0.85"
      />

      {/* 2. Concentric Inner Orbit Guide (Harmonic Iris Ring) */}
      <circle
        cx="50"
        cy="50"
        r="32"
        stroke="#5965E8"
        strokeWidth="1"
        strokeDasharray="3 4"
        strokeOpacity="0.4"
        className={isAnimated ? 'animate-spin origin-center' : ''}
        style={{ animationDuration: '30s' }}
      />

      {/* 3. Optical Lens / Eye Aperture Contour linking the constellation nodes */}
      <path
        d="M 18 50 C 28 32, 72 32, 82 50 C 72 68, 28 68, 18 50 Z"
        stroke="url(#irisLensArc)"
        strokeWidth="1.4"
        fill="url(#irisNeuralPulse)"
        fillOpacity="0.15"
      />

      {/* 4. Network Connection Lines (DNA of Link Office Constellation) */}
      {/* Outer relational link lines */}
      <line x1="16" y1="28" x2="35" y2="52" stroke="#B0C4DE" strokeWidth="1" strokeOpacity="0.85" />
      <line x1="16" y1="28" x2="58" y2="48" stroke="#D1D5DB" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.7" />
      <line x1="35" y1="52" x2="58" y2="48" stroke="#123D46" strokeWidth="1.4" strokeOpacity="0.75" />
      <line x1="35" y1="52" x2="18" y2="76" stroke="#4DBDB2" strokeWidth="1.1" strokeOpacity="0.8" />
      <line x1="58" y1="48" x2="18" y2="76" stroke="#C5D3D1" strokeWidth="0.8" strokeOpacity="0.6" />
      <line x1="58" y1="48" x2="82" y2="78" stroke="#5965E8" strokeWidth="1.2" strokeOpacity="0.8" />
      <line x1="58" y1="48" x2="78" y2="28" stroke="#123D46" strokeWidth="1.1" strokeOpacity="0.7" />
      <line x1="18" y1="76" x2="82" y2="78" stroke="#C5D3D1" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.5" />
      <line x1="78" y1="28" x2="82" y2="78" stroke="#C5D3D1" strokeWidth="0.8" strokeOpacity="0.5" />

      {/* 5. Neural Rays converging to the Focal Iris Pupil (Center 48, 50) */}
      <line x1="16" y1="28" x2="48" y2="50" stroke="#FFC629" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.75" />
      <line x1="82" y1="78" x2="48" y2="50" stroke="#5965E8" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.75" />
      <line x1="18" y1="76" x2="48" y2="50" stroke="#00A99D" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.75" />
      <line x1="78" y1="28" x2="48" y2="50" stroke="#FFC629" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.6" />

      {/* 6. Constellation Nodes (Exact Link Office Heritage Nodes) */}
      {/* Node A: Top-left Coral Node (Emotion & Human) */}
      <circle cx="16" cy="28" r="4.2" fill="#F26D35" />

      {/* Node B: Center-left Royal Blue Node (Dialogue & Coopération) */}
      <circle cx="35" cy="52" r="7.5" fill="#1D70B8" />
      <circle cx="35" cy="52" r="2.8" fill="#FFFFFF" opacity="0.95" />

      {/* Node C: Center-right Deep Navy Primary Node (Structure & Fiabilité) */}
      <circle cx="58" cy="48" r="7" fill="#0D2530" />
      <circle cx="58" cy="48" r="2.4" fill="#FFFFFF" opacity="0.95" />

      {/* Node D: Bottom-left Mint / Teal Node (Observation & Clarté) */}
      <circle cx="18" cy="76" r="4.5" fill="#00A99D" />

      {/* Node E: Bottom-right Periwinkle Violet Node (Action & IA IRIS) */}
      <circle cx="82" cy="78" r="5.2" fill="#7B7FE8" />

      {/* Node F: Top-right Satellite Node */}
      <circle cx="78" cy="28" r="3.2" fill="#6B7280" />

      {/* 7. The Central Luminous Pupil / Neural Core (IRIS Focal Spark) */}
      {/* Ambient glowing circle */}
      <circle cx="48" cy="50" r="11" fill="url(#irisNeuralPulse)" />
      
      {/* Inner Pupil Ring */}
      <circle
        cx="48"
        cy="50"
        r="6.5"
        fill="#123D46"
        stroke="#FFC629"
        strokeWidth="1.5"
      />

      {/* Golden Insight Spark Node */}
      <circle cx="48" cy="50" r="3" fill="#FFC629" />
      <circle cx="49" cy="49" r="1.1" fill="#FFFFFF" />

      {/* Micro-sparkle cross at pupil center */}
      <line x1="48" y1="44" x2="48" y2="56" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
      <line x1="42" y1="50" x2="54" y2="50" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
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
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#123D46] via-[#1E3048] to-[#123D46] p-2 border border-[#5965E8]/40 shadow-md ${className}`}>
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
        <div className="flex flex-col text-left">
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
              Intelligence Relationnelle · Link Office
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
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`font-jakarta font-black tracking-tight ${textSizes[size]} text-[#123D46] leading-none`}>
            IRIS
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-jakarta font-bold bg-[#5965E8]/10 text-[#5965E8] border border-[#5965E8]/20">
            IA
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-jakarta font-semibold text-[#00A99D] tracking-wider uppercase mt-0.5">
            Intelligence Relationnelle · Link Office
          </span>
        )}
      </div>
    </div>
  );
};
