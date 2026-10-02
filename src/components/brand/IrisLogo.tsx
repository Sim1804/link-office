import React from 'react';

interface IrisLogoProps {
  variant?: 'horizontal' | 'badge' | 'avatar' | 'symbol-only' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  isAnimated?: boolean;
}

/**
 * IrisMark: Sibling mark of LinkOffice Constellation
 * Fuses the LinkOffice constellation nodes & network lines
 * with an optical & neural iris aperture (Vision, Insight & Relational Intelligence).
 */
export const IrisMark: React.FC<{
  size?: number | string;
  className?: string;
  isAnimated?: boolean;
  glow?: boolean;
  monochrome?: boolean;
}> = ({ size = 48, className = '', isAnimated = false, glow = false, monochrome = false }) => {
  return (
    <img 
      src="/logo-iris.svg"
      alt="IRIS Logo"
      width={size} 
      height={size} 
      className={`shrink-0 select-none object-contain ${className} ${isAnimated ? 'animate-pulse' : ''} ${glow ? 'drop-shadow-[0_0_8px_rgba(89,101,232,0.6)]' : ''} ${monochrome ? 'brightness-0 invert' : ''}`}
      aria-hidden="true"
    />
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
        <IrisMark size={markSizes[size]} isAnimated={true} monochrome className="text-white" />
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
        <IrisMark size={markSizes[size]} isAnimated={isAnimated} monochrome className="text-white" />
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
              Intelligence Relationnelle · LinkOffice
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
            Intelligence Relationnelle · LinkOffice
          </span>
        )}
      </div>
    </div>
  );
};
