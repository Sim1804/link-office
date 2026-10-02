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
    <img 
      src="/logo_vectorise.svg" 
      alt="LinkOffice Mark" 
      width={size} 
      height={size} 
      className={`shrink-0 select-none object-contain ${className}`}
    />
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

  const imgHeights = {
    sm: 'h-12 sm:h-14', // increased
    md: 'h-16 sm:h-20', // increased
    lg: 'h-24', // increased
    xl: 'h-32' // increased
  };

  const content = (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      <img src="/logo-linkoffice.png" alt="Link Office Logo" className={`${imgHeights[size]} w-auto object-contain ${isWhite ? 'brightness-0 invert' : ''}`} />
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
