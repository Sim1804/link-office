import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const IconMoiNous: React.FC<IconProps> = ({ size = 28, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="4.5" />
    <circle cx="21" cy="12" r="3.5" />
    <path d="M4 25c0-4 3.5-7 7-7s7 3 7 7" />
    <path d="M18 19.5c1-.8 2.5-1.5 4-1.5s5 2 5 6" />
    <line x1="14" y1="12" x2="18" y2="12" stroke="#00A99D" strokeWidth="2" />
  </svg>
);

export const IconObservation: React.FC<IconProps> = ({ size = 28, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 16C5.5 9 10.5 5 16 5s10.5 4 13 11c-2.5 7-7.5 11-13 11S5.5 23 3 16z" />
    <circle cx="16" cy="16" r="5" />
    <circle cx="16" cy="16" r="2" fill={color} />
  </svg>
);

export const IconMesure: React.FC<IconProps> = ({ size = 28, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="16" cy="16" r="12" />
    <path d="M16 4v12l8.5 8.5" />
    <path d="M16 16l8.5-8.5" stroke="#00A99D" strokeWidth="2" />
    <circle cx="16" cy="16" r="2.5" fill={color} />
  </svg>
);

export const IconAction: React.FC<IconProps> = ({ size = 28, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 26l4-1 1-4c1-4 4.5-9.5 9.5-13.5l1.5-1.5 2 2-1.5 1.5C18.5 14 13 17.5 9 18.5l-4 1-1 4" />
    <path d="M22 6c3 0 4 1 4 4 0 5-6 12-10 14" stroke="#5965E8" strokeWidth="2" />
    <circle cx="19" cy="10" r="1.5" fill={color} />
    <path d="M5 27l-2 2" stroke="#FFC629" strokeWidth="2" />
  </svg>
);

export const IconBienveillance: React.FC<IconProps> = ({ size = 28, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 27s-10-6.5-10-14a6 6 0 0 1 10-4.24A6 6 0 0 1 26 13c0 7.5-10 14-10 14z" />
    <path d="M12 13a4 4 0 0 0 4 4" stroke="#00A99D" strokeWidth="1.5" />
  </svg>
);

export const IconOuverture: React.FC<IconProps> = ({ size = 28, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="16" cy="16" r="12" />
    <ellipse cx="16" cy="16" rx="6" ry="12" />
    <line x1="4" y1="16" x2="28" y2="16" />
  </svg>
);

export const IconSecurite: React.FC<IconProps> = ({ size = 28, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 4l10 4.5v7.5c0 6.5-4.5 12-10 14-5.5-2-10-7.5-10-14V8.5L16 4z" />
    <path d="M12 16l3 3 5-5" stroke="#00A99D" strokeWidth="2" />
  </svg>
);

export const ValueBadge: React.FC<{
  type: 'humain' | 'clarte' | 'fiabilite' | 'action';
  size?: number;
}> = ({ type, size = 68 }) => {
  const configs = {
    humain: {
      bg: 'bg-[#00A99D]',
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    clarte: {
      bg: 'bg-[#199E9A]',
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    },
    fiabilite: {
      bg: 'bg-[#FFC629]',
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#123D46" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    },
    action: {
      bg: 'bg-[#5965E8]',
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      )
    }
  };

  const current = configs[type];

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105 shrink-0 ${current.bg}`}
    >
      {current.icon}
    </div>
  );
};
