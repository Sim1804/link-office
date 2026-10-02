import React, { useState } from 'react';

// 1. Constellation Graphic Component
export const ConstellationGraphic: React.FC<{
  interactive?: boolean;
  className?: string;
}> = ({ interactive = true, className = '' }) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const nodes = [
    { id: 1, x: 50, y: 70, r: 6, color: '#00A99D', label: 'Écoute' },
    { id: 2, x: 110, y: 35, r: 5, color: '#199E9A', label: 'Transparence' },
    { id: 3, x: 180, y: 65, r: 7, color: '#5965E8', label: 'Action' },
    { id: 4, x: 230, y: 30, r: 5.5, color: '#4DBDB2', label: 'Sécurité' },
    { id: 5, x: 280, y: 75, r: 8, color: '#FFC629', label: 'Révélation' },
    { id: 6, x: 140, y: 110, r: 5, color: '#123D46', label: 'Ancrage' },
    { id: 7, x: 210, y: 115, r: 6, color: '#00A99D', label: 'Coopération' },
  ];

  const links = [
    { from: 1, to: 2, color: '#199E9A' },
    { from: 2, to: 3, color: '#5965E8' },
    { from: 3, to: 4, color: '#4DBDB2' },
    { from: 4, to: 5, color: '#FFC629' },
    { from: 1, to: 6, color: '#123D46' },
    { from: 6, to: 7, color: '#00A99D' },
    { from: 7, to: 3, color: '#5965E8' },
    { from: 2, to: 6, color: '#4DBDB2' },
    { from: 7, to: 5, color: '#FFC629' }
  ];

  return (
    <div className={`relative flex flex-col items-center justify-center p-4 bg-white/70 backdrop-blur-xs rounded-xl border border-[#E3EBE6] shadow-xs ${className}`}>
      <svg viewBox="0 0 320 150" className="w-full h-auto max-h-48 overflow-visible">
        {/* Connection links */}
        {links.map((link, idx) => {
          const fromNode = nodes.find(n => n.id === link.from)!;
          const toNode = nodes.find(n => n.id === link.to)!;
          const isHighlighted = activeNode === link.from || activeNode === link.to;

          return (
            <line
              key={idx}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={link.color}
              strokeWidth={isHighlighted ? 2.5 : 1.25}
              strokeOpacity={isHighlighted ? 0.95 : 0.45}
              strokeDasharray={idx % 3 === 0 ? '3 3' : 'none'}
              className="transition-all duration-300"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isCurrent = activeNode === node.id;
          return (
            <g
              key={node.id}
              className={interactive ? 'cursor-pointer' : ''}
              onMouseEnter={() => interactive && setActiveNode(node.id)}
              onMouseLeave={() => interactive && setActiveNode(null)}
            >
              {isCurrent && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r * 2}
                  fill={node.color}
                  fillOpacity="0.25"
                  className="animate-ping"
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={isCurrent ? node.r + 2 : node.r}
                fill={node.color}
                stroke="#FFFFFF"
                strokeWidth={isCurrent ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              {node.color === '#FFC629' && (
                <circle cx={node.x} cy={node.y} r={node.r + 4} stroke="#FFC629" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
              )}
            </g>
          );
        })}
      </svg>
      {interactive && (
        <div className="text-[11px] text-[#123D46]/70 mt-1 font-medium text-center">
          {activeNode ? (
            <span className="text-[#00A99D] font-semibold">
              Nœud : {nodes.find(n => n.id === activeNode)?.label}
            </span>
          ) : (
            'Survolez les nœuds du lien humain'
          )}
        </div>
      )}
    </div>
  );
};

// 2. Trajectoire Graphic Component (Wavy dynamic progression)
export const TrajectoryGraphic: React.FC<{
  className?: string;
  withLabels?: boolean;
}> = ({ className = '', withLabels = false }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center p-4 bg-white/70 backdrop-blur-xs rounded-xl border border-[#E3EBE6] shadow-xs ${className}`}>
      <svg viewBox="0 0 340 100" className="w-full h-auto max-h-36 overflow-visible">
        <defs>
          <linearGradient id="trajGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A99D" />
            <stop offset="35%" stopColor="#199E9A" />
            <stop offset="65%" stopColor="#5965E8" />
            <stop offset="100%" stopColor="#FFC629" />
          </linearGradient>
        </defs>

        {/* Curved Path */}
        <path
          d="M 20 60 C 60 75, 90 35, 130 55 C 170 75, 210 25, 260 45 C 285 55, 305 40, 315 32"
          fill="none"
          stroke="url(#trajGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Progression Nodes along the curve */}
        <circle cx="20" cy="60" r="4" fill="#00A99D" stroke="#fff" strokeWidth="1.5" />
        <circle cx="75" cy="55" r="4.5" fill="#199E9A" stroke="#fff" strokeWidth="1.5" />
        <circle cx="130" cy="55" r="5" fill="#4DBDB2" stroke="#fff" strokeWidth="1.5" />
        <circle cx="190" cy="50" r="5.5" fill="#5965E8" stroke="#fff" strokeWidth="1.5" />
        <circle cx="250" cy="42" r="5" fill="#123D46" stroke="#fff" strokeWidth="1.5" />

        {/* Luminous sun starburst at destination */}
        <g transform="translate(315, 32)">
          {/* Radiant spikes */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <line
              key={deg}
              x1="0"
              y1="0"
              x2="14"
              y2="0"
              transform={`rotate(${deg})`}
              stroke="#FFC629"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
          ))}
          <circle cx="0" cy="0" r="6" fill="#FFC629" />
          <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
        </g>
      </svg>
      {withLabels && (
        <div className="flex justify-between w-full text-[10px] text-[#123D46]/60 font-medium px-2 mt-1">
          <span>01. Conscience</span>
          <span>02. Observation</span>
          <span>03. Mesure</span>
          <span className="text-[#00A99D] font-semibold">04. Transformation</span>
        </div>
      )}
    </div>
  );
};

// 3. Point Lumineux (Burst of Light)
export const PointLumineux: React.FC<{ size?: number; className?: string }> = ({
  size = 90,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center ${className}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible animate-pulse-glow">
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFC629" stopOpacity="1" />
            <stop offset="50%" stopColor="#FFC629" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFC629" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Halo circle */}
        <circle cx="50" cy="50" r="42" fill="url(#sunGlow)" />

        {/* Long and short radiant rays */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const isLong = i % 2 === 0;
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + (isLong ? 36 : 24) * Math.cos((angle * Math.PI) / 180)}
              y2={50 + (isLong ? 36 : 24) * Math.sin((angle * Math.PI) / 180)}
              stroke="#FFC629"
              strokeWidth={isLong ? 1.5 : 1}
              strokeOpacity={isLong ? 0.9 : 0.6}
            />
          );
        })}

        {/* Core star */}
        <circle cx="50" cy="50" r="10" fill="#FFC629" />
        <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

// 4. Réseaux & Maillage (Mesh)
export const NetworkMesh: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 bg-white/70 backdrop-blur-xs rounded-xl border border-[#E3EBE6] shadow-xs flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 240 100" className="w-full h-24 overflow-visible">
        <path
          d="M 20 50 L 60 20 L 100 50 L 60 80 Z"
          fill="none"
          stroke="#4DBDB2"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
        <path
          d="M 100 50 L 140 20 L 180 50 L 140 80 Z"
          fill="none"
          stroke="#00A99D"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
        <path
          d="M 180 50 L 220 30"
          fill="none"
          stroke="#5965E8"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
        <line x1="60" y1="20" x2="140" y2="20" stroke="#199E9A" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
        <line x1="60" y1="80" x2="140" y2="80" stroke="#199E9A" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
        
        {/* Nodes */}
        <circle cx="20" cy="50" r="3.5" fill="#00A99D" />
        <circle cx="60" cy="20" r="3.5" fill="#4DBDB2" />
        <circle cx="60" cy="80" r="3.5" fill="#123D46" />
        <circle cx="100" cy="50" r="4.5" fill="#00A99D" />
        <circle cx="140" cy="20" r="4" fill="#5965E8" />
        <circle cx="140" cy="80" r="3.5" fill="#4DBDB2" />
        <circle cx="180" cy="50" r="4.5" fill="#FFC629" />
        <circle cx="220" cy="30" r="3.5" fill="#5965E8" />
      </svg>
    </div>
  );
};

// 5. Cercles & Données (Concentric circular data dials)
export const DataCircles: React.FC<{ score?: number; className?: string }> = ({
  score = 72,
  className = ''
}) => {
  return (
    <div className={`p-4 bg-white/70 backdrop-blur-xs rounded-xl border border-[#E3EBE6] shadow-xs flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 120" className="w-28 h-28 overflow-visible">
        {/* Ring 1 - Outer dotted */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="#4DBDB2" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.6" />
        {/* Ring 2 - Mid line with offset */}
        <circle cx="60" cy="60" r="38" fill="none" stroke="#5965E8" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.7" />
        {/* Ring 3 - Inner progress arc */}
        <circle cx="60" cy="60" r="26" fill="none" stroke="#00A99D" strokeWidth="2.5" strokeDasharray="120 40" strokeLinecap="round" />
        
        {/* Orbiting data points */}
        <circle cx="60" cy="10" r="3" fill="#00A99D" />
        <circle cx="98" cy="60" r="3" fill="#5965E8" />
        <circle cx="60" cy="98" r="3.5" fill="#FFC629" />
        <circle cx="34" cy="60" r="2.5" fill="#123D46" />

        {/* Center score */}
        <text x="60" y="64" textAnchor="middle" className="font-jakarta font-bold text-xs" fill="#123D46">
          {score}%
        </text>
      </svg>
      <span className="text-[10px] text-[#123D46]/70 mt-1 font-medium">Métriques & Cohésion</span>
    </div>
  );
};

// 6. Motifs (Color dot matrix)
export const DotPatternGrid: React.FC<{ className?: string }> = ({ className = '' }) => {
  const rows = 4;
  const cols = 7;
  const colors = ['#00A99D', '#199E9A', '#4DBDB2', '#5965E8', '#FFC629', '#123D46', '#E3EBE6'];

  return (
    <div className={`p-4 bg-white/70 backdrop-blur-xs rounded-xl border border-[#E3EBE6] shadow-xs flex items-center justify-center ${className}`}>
      <div className="grid grid-cols-7 gap-2.5">
        {Array.from({ length: rows * cols }).map((_, i) => {
          const colIdx = i % cols;
          const color = colors[colIdx];
          return (
            <div
              key={i}
              style={{ backgroundColor: color }}
              className="w-2.5 h-2.5 rounded-full transition-transform hover:scale-125 shadow-2xs"
            />
          );
        })}
      </div>
    </div>
  );
};

// 7. Iconic Luminous Banner (Section 12: Utilisation du dégradé et de la lumière)
export const LuminousTunnelBanner: React.FC<{
  className?: string;
  showText?: boolean;
}> = ({ className = '', showText = true }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#00A99D]/20 shadow-md ${className}`}>
      {/* Background panoramic gradient */}
      <div
        className="w-full h-44 sm:h-56 relative flex items-center justify-center"
        style={{
          background: 'linear-gradient(90deg, #123D46 0%, #00A99D 28%, #199E9A 52%, #4DBDB2 72%, #F4F1E8 92%, #FFFBEA 100%)'
        }}
      >
        {/* Subtle grid and perspective lines leading to the right */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Horizon line */}
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.4" />
          
          {/* Converging rays towards the light on the right */}
          <line x1="0" y1="10%" x2="88%" y2="50%" stroke="#E3EBE6" strokeWidth="0.75" />
          <line x1="0" y1="30%" x2="88%" y2="50%" stroke="#E3EBE6" strokeWidth="0.75" />
          <line x1="0" y1="70%" x2="88%" y2="50%" stroke="#E3EBE6" strokeWidth="0.75" />
          <line x1="0" y1="90%" x2="88%" y2="50%" stroke="#E3EBE6" strokeWidth="0.75" />

          {/* Constellation web across the gradient */}
          <circle cx="12%" cy="40%" r="4" fill="#FFFFFF" opacity="0.9" />
          <circle cx="28%" cy="60%" r="5" fill="#FFC629" opacity="0.9" />
          <circle cx="45%" cy="35%" r="4.5" fill="#5965E8" opacity="0.9" />
          <circle cx="65%" cy="55%" r="5.5" fill="#FFFFFF" opacity="0.95" />
          
          <line x1="12%" y1="40%" x2="28%" y2="60%" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
          <line x1="28%" y1="60%" x2="45%" y2="35%" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
          <line x1="45%" y1="35%" x2="65%" y2="55%" stroke="#FFC629" strokeWidth="1.2" opacity="0.7" />
          <line x1="65%" y1="55%" x2="88%" y2="50%" stroke="#FFC629" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.9" />
        </svg>

        {/* Radiant luminous portal on the right */}
        <div className="absolute right-[8%] top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-radial from-amber-100 via-[#FFC629]/60 to-transparent blur-md opacity-90 animate-pulse-glow" />
          <div className="absolute w-12 h-12 rounded-full bg-white shadow-[0_0_30px_#FFC629]" />
          
          {/* Walking human silhouette stepping into the light */}
          <svg
            className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-6 w-8 h-14 sm:w-10 sm:h-18 text-[#123D46] drop-shadow-md z-10"
            viewBox="0 0 24 48"
            fill="currentColor"
          >
            {/* Head */}
            <circle cx="12" cy="7" r="4.5" />
            {/* Torso */}
            <path d="M7 14h10c1.5 0 2.5 1.5 2.5 3.5v9h-3v-7h-2v18h-2.5l-1-10-1 10H7.5V17.5C7.5 15.5 8.5 14 7 14z" />
          </svg>
        </div>

        {/* Overlay quote / philosophical text */}
        {showText && (
          <div className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 max-w-sm sm:max-w-md text-white drop-shadow-sm z-10">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#FFC629] block mb-1">
              Symbolique du cheminement
            </span>
            <p className="font-jakarta font-bold text-base sm:text-xl leading-snug">
              Du point de départ <span className="text-[#4DBDB2] font-medium">(la conscience)</span> vers la lumière <span className="text-[#FFC629] font-medium">(le changement)</span>.
            </p>
            <p className="text-xs text-white/80 mt-1 font-inter hidden sm:block">
              Comprendre. Observer. Mesurer. Agir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
