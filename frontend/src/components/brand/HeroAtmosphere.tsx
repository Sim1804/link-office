import React from 'react';

export const HeroAtmosphere: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none ${className}`}>
      {/* 1. Panoramic Base Sky Gradient matching Hero.png */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            'linear-gradient(90deg, #06232B 0%, #083742 22%, #0A5360 42%, #0E7787 62%, #389FA8 78%, #E7C97F 92%, #FFF4D0 100%)'
        }}
      />

      {/* 2. Ground reflection plane (Lower 38% of the image) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[38%]"
        style={{
          background:
            'linear-gradient(90deg, #041B22 0%, #062A34 25%, #0B4F5C 50%, #157989 72%, #799A8D 85%, #E5BE72 96%, #FFE8AA 100%)',
          opacity: 0.95
        }}
      />

      {/* Subtle horizon divider line with glow */}
      <div
        className="absolute bottom-[38%] left-0 right-0 h-[1.5px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,242,254,0.1) 0%, rgba(0,242,254,0.4) 30%, rgba(255,255,255,0.7) 70%, rgba(255,230,150,0.9) 100%)'
        }}
      />

      {/* 3. SVG Artwork: Neural Network on Left + Distant City Skyline + Sunrise & Silhouette on Right */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1600 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyan Glow for nodes */}
          <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Deep Sun Glow */}
          <radialGradient id="sunBurstGrad" cx="90%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="15%" stopColor="#FFF2B2" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FFC629" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#E29227" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0E7787" stopOpacity="0" />
          </radialGradient>

          {/* Line network gradients */}
          <linearGradient id="netLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00A99D" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="floorReflectionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE8A3" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#FFC629" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#157989" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ================= LEFT SIDE: LUMINOUS NEURAL NETWORK CONSTELLATION ================= */}
        {/* Out-of-focus background bokeh circles */}
        <circle cx="90" cy="340" r="18" fill="#00C4D4" opacity="0.18" />
        <circle cx="160" cy="380" r="22" fill="#00C4D4" opacity="0.14" />
        <circle cx="240" cy="360" r="16" fill="#00C4D4" opacity="0.12" />
        <circle cx="70" cy="180" r="14" fill="#00F2FE" opacity="0.16" />

        {/* 3D Network Interconnecting Lines */}
        <line x1="0" y1="220" x2="110" y2="190" stroke="url(#netLineGrad)" strokeWidth="2.5" />
        <line x1="0" y1="380" x2="110" y2="190" stroke="url(#netLineGrad)" strokeWidth="1.8" />
        <line x1="110" y1="190" x2="280" y2="160" stroke="#00F2FE" strokeWidth="2.8" opacity="0.9" />
        <line x1="110" y1="190" x2="170" y2="340" stroke="#00F2FE" strokeWidth="2.2" opacity="0.85" />
        <line x1="170" y1="340" x2="0" y2="440" stroke="#00C4D4" strokeWidth="2" opacity="0.6" />
        <line x1="170" y1="340" x2="100" y2="480" stroke="#00F2FE" strokeWidth="2" opacity="0.75" />
        <line x1="170" y1="340" x2="230" y2="480" stroke="#00F2FE" strokeWidth="2" opacity="0.75" />
        <line x1="170" y1="340" x2="380" y2="430" stroke="#00F2FE" strokeWidth="1.8" opacity="0.8" />
        <line x1="170" y1="340" x2="280" y2="160" stroke="#00F2FE" strokeWidth="2.5" opacity="0.85" />

        {/* Mid-Depth Connections extending rightward */}
        <line x1="280" y1="160" x2="340" y2="260" stroke="#00E5FF" strokeWidth="2" opacity="0.8" />
        <line x1="280" y1="160" x2="540" y2="210" stroke="#00C4D4" strokeWidth="1.5" opacity="0.6" />
        <line x1="340" y1="260" x2="380" y2="430" stroke="#00C4D4" strokeWidth="1.5" opacity="0.65" />
        <line x1="340" y1="260" x2="490" y2="275" stroke="#00E5FF" strokeWidth="2" opacity="0.85" />
        <line x1="490" y1="275" x2="380" y2="430" stroke="#00C4D4" strokeWidth="1.4" opacity="0.6" />
        <line x1="490" y1="275" x2="540" y2="210" stroke="#00C4D4" strokeWidth="1.6" opacity="0.7" />
        <line x1="490" y1="275" x2="620" y2="285" stroke="#00E5FF" strokeWidth="1.6" opacity="0.8" />
        <line x1="490" y1="275" x2="430" y2="390" stroke="#00C4D4" strokeWidth="1.2" opacity="0.5" />
        <line x1="620" y1="285" x2="540" y2="210" stroke="#00C4D4" strokeWidth="1.4" opacity="0.6" />
        <line x1="620" y1="285" x2="650" y2="345" stroke="#00C4D4" strokeWidth="1.2" opacity="0.5" />
        <line x1="620" y1="285" x2="780" y2="375" stroke="#00C4D4" strokeWidth="1.2" opacity="0.45" />

        {/* Faint distant web nodes dissolving into the center */}
        <line x1="650" y1="345" x2="780" y2="375" stroke="#00C4D4" strokeWidth="1" strokeDasharray="3 4" opacity="0.35" />

        {/* Primary Glowing Nodes */}
        {/* Node 1: Left Top */}
        <circle cx="110" cy="190" r="9" fill="#00F2FE" filter="url(#cyanGlow)" />
        <circle cx="110" cy="190" r="4.5" fill="#FFFFFF" />

        {/* Node 2: Main Focal Glow Node (Dominant radiant light) */}
        <circle cx="170" cy="340" r="16" fill="#00F2FE" filter="url(#cyanGlow)" />
        <circle cx="170" cy="340" r="7" fill="#FFFFFF" />

        {/* Node 3: Top Right of cluster */}
        <circle cx="280" cy="160" r="11" fill="#00F2FE" filter="url(#cyanGlow)" />
        <circle cx="280" cy="160" r="5" fill="#FFFFFF" />

        {/* Node 4: Mid connector */}
        <circle cx="340" cy="260" r="7.5" fill="#00E5FF" filter="url(#cyanGlow)" />
        <circle cx="340" cy="260" r="3.5" fill="#FFFFFF" />

        {/* Node 5: Distant Top */}
        <circle cx="540" cy="210" r="8" fill="#00C4D4" filter="url(#cyanGlow)" opacity="0.85" />
        <circle cx="540" cy="210" r="3.5" fill="#FFFFFF" />

        {/* Node 6: Center Bridge Node */}
        <circle cx="490" cy="275" r="9" fill="#00F2FE" filter="url(#cyanGlow)" />
        <circle cx="490" cy="275" r="4" fill="#FFFFFF" />

        {/* Node 7: Floor Anchor Left */}
        <circle cx="100" cy="480" r="7" fill="#00F2FE" filter="url(#cyanGlow)" opacity="0.8" />
        <circle cx="100" cy="480" r="3" fill="#FFFFFF" />

        {/* Node 8: Floor Anchor Right */}
        <circle cx="230" cy="480" r="7" fill="#00F2FE" filter="url(#cyanGlow)" opacity="0.8" />
        <circle cx="230" cy="480" r="3" fill="#FFFFFF" />

        {/* Node 9: Lower Middle */}
        <circle cx="380" cy="430" r="7.5" fill="#00C4D4" filter="url(#cyanGlow)" opacity="0.75" />
        <circle cx="380" cy="430" r="3" fill="#FFFFFF" />

        {/* Dissolving Nodes */}
        <circle cx="620" cy="285" r="6" fill="#00C4D4" opacity="0.8" />
        <circle cx="620" cy="285" r="2.5" fill="#FFFFFF" />
        <circle cx="650" cy="345" r="4.5" fill="#00C4D4" opacity="0.6" />
        <circle cx="780" cy="375" r="3.5" fill="#00C4D4" opacity="0.5" />

        {/* ================= RIGHT SIDE: RADIANT SUNRISE, CITYLINE & SILHOUETTE ================= */}
        {/* Distant city skyline on the horizon (around y=372) */}
        <g opacity="0.32" fill="#D3A962">
          {/* Subtle building blocks along the horizon */}
          <rect x="1100" y="358" width="16" height="14" />
          <rect x="1120" y="348" width="12" height="24" />
          <rect x="1136" y="354" width="22" height="18" />
          <rect x="1162" y="340" width="18" height="32" />
          <rect x="1184" y="350" width="25" height="22" />
          <rect x="1214" y="335" width="15" height="37" />
          <rect x="1233" y="345" width="20" height="27" />
          <rect x="1257" y="352" width="28" height="20" />
          <rect x="1290" y="342" width="14" height="30" />
          <rect x="1308" y="338" width="24" height="34" />
          <rect x="1336" y="348" width="18" height="24" />
          <rect x="1358" y="355" width="30" height="17" />
          <rect x="1392" y="344" width="16" height="28" />
          <rect x="1412" y="350" width="22" height="22" />
          <rect x="1438" y="342" width="15" height="30" />
          <rect x="1457" y="356" width="35" height="16" />
        </g>

        {/* Radiant Sunrise Aura Burst on the Right */}
        <circle cx="1480" cy="360" r="260" fill="url(#sunBurstGrad)" />
        <circle cx="1480" cy="360" r="90" fill="#FFFFFF" opacity="0.75" />
        <circle cx="1480" cy="360" r="35" fill="#FFFFFF" />

        {/* Sunrise light rays breaking upward into the sky */}
        <line x1="1480" y1="360" x2="1320" y2="120" stroke="#FFF5D6" strokeWidth="2" strokeOpacity="0.4" />
        <line x1="1480" y1="360" x2="1380" y2="80" stroke="#FFF5D6" strokeWidth="3" strokeOpacity="0.5" />
        <line x1="1480" y1="360" x2="1450" y2="40" stroke="#FFF5D6" strokeWidth="2.5" strokeOpacity="0.4" />
        <line x1="1480" y1="360" x2="1520" y2="50" stroke="#FFF5D6" strokeWidth="3.5" strokeOpacity="0.5" />
        <line x1="1480" y1="360" x2="1600" y2="100" stroke="#FFF5D6" strokeWidth="2" strokeOpacity="0.4" />

        {/* Specular Floor Reflection from the Sun & Figure */}
        <polygon
          points="1465,372 1495,372 1530,600 1430,600"
          fill="url(#floorReflectionGrad)"
          opacity="0.8"
        />

        {/* Walking Silhouette Reflection (mirrored below horizon) */}
        <g transform="translate(1425, 372) scale(1, -0.65)" opacity="0.35">
          <ellipse cx="12" cy="7" rx="3.5" ry="4.5" fill="#5A4723" />
          <path d="M7 14h10c1.5 0 2 1.5 2 3v12h-2.5v-7h-1.5v18h-2.5l-1-10-1 10H8V17c0-1.5 0.5-3 2-3z" fill="#5A4723" />
          <rect x="18" y="22" width="4" height="6.5" rx="1" fill="#5A4723" />
        </g>

        {/* THE WALKING PROFESSIONAL SILHOUETTE (Standing at x=1425, y=372) */}
        <g transform="translate(1425, 305)" className="drop-shadow-sm">
          {/* Head */}
          <circle cx="12" cy="7" r="4.5" fill="#1C1814" />
          {/* Neck & Suit Collar */}
          <path d="M10 11.5h4v3h-4z" fill="#1C1814" />
          {/* Torso & Suit Jacket */}
          <path
            d="M6 14.5 C6 13, 8 13.5, 12 13.5 C16 13.5, 18 13, 18 14.5 L19.5 28 L16.5 28 L15.5 24 L14 43 L11.5 43 L10.5 29 L9.5 43 L7 43 L8.5 24 L7.5 28 L4.5 28 Z"
            fill="#1C1814"
          />
          {/* Left Arm holding Briefcase */}
          <path d="M18 16 L20.5 26 L19.5 27 L17 17 Z" fill="#1C1814" />
          {/* Briefcase */}
          <rect x="18.5" y="27" width="5.5" height="9" rx="1" fill="#1C1814" />
          <path d="M20 27v-2h2.5v2" stroke="#1C1814" strokeWidth="1" fill="none" />
        </g>
      </svg>
    </div>
  );
};
