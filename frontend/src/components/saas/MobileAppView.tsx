import React, { useState } from 'react';
import { Logo } from '../brand/Logo';
import { TrajectoryGraphic } from '../brand/GraphicElements';
import { IconMoiNous, IconObservation, IconAction, IconBienveillance } from '../brand/Icons';

export const MobileAppView: React.FC = () => {
  const [pulseScore, setPulseScore] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<'index' | 'equipe' | 'actions'>('index');

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Phone Mockup Frame */}
      <div className="w-[340px] h-[680px] bg-[#123D46] p-3 rounded-[44px] shadow-2xl border-4 border-[#2A525B] relative flex flex-col overflow-hidden">
        {/* Notch / Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#0D292F] rounded-full z-30 flex items-center justify-center">
          <div className="w-12 h-1.5 bg-[#1B3F47] rounded-full mr-2" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1B3F47]" />
        </div>

        {/* Screen container */}
        <div className="w-full h-full bg-[#F8F9FA] rounded-[34px] overflow-y-auto flex flex-col pt-7 pb-4 text-[#123D46] select-none scrollbar-none">
          {/* Top Status Bar */}
          <div className="px-6 py-2 flex items-center justify-between text-[11px] font-semibold text-[#123D46]/70">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-[#123D46] rounded-xs p-0.5 flex">
                <div className="w-full h-full bg-[#00A99D] rounded-2xs" />
              </div>
            </div>
          </div>

          {/* App Top Bar */}
          <div className="px-5 py-2 flex items-center justify-between border-b border-[#E3EBE6]/60">
            <div className="flex items-center gap-2">
              <Logo size="sm" variant="light" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-jakarta font-bold px-2 py-0.5 bg-[#E3EBE6] text-[#00A99D] rounded-full">
                IQRH
              </span>
              <div className="w-7 h-7 rounded-full bg-[#00A99D]/15 text-[#00A99D] flex items-center justify-center font-bold text-xs">
                JD
              </div>
            </div>
          </div>

          {/* Main Mobile Content */}
          <div className="px-5 py-4 space-y-4 flex-1">
            {/* Greeting */}
            <div>
              <span className="text-[11px] text-[#123D46]/60 font-medium">Bonjour Julien,</span>
              <h2 className="font-jakarta font-extrabold text-base leading-tight text-[#123D46]">
                Votre indice de qualité des relations humaines
              </h2>
            </div>

            {/* Circular Gauge Card - Exact 72/100 as shown in the reference image */}
            <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] shadow-sm flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00A99D]/5 rounded-bl-full pointer-events-none" />
              
              <span className="text-[10px] uppercase font-semibold text-[#00A99D] tracking-wider mb-2">
                Score Global d'Équipe
              </span>

              {/* Central Circular Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#E3EBE6"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#00A99D"
                    strokeWidth="8.5"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * 72) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-jakarta font-extrabold text-3xl text-[#123D46] tracking-tight">
                    72
                  </span>
                  <span className="text-xs text-[#123D46]/60 font-semibold font-jakarta -mt-1">
                    /100
                  </span>
                </div>
              </div>

              {/* Status and trajectory note */}
              <div className="mt-2 text-center">
                <span className="font-jakarta font-bold text-xs text-[#00A99D] block">
                  Votre équilibre relationnel
                </span>
                <span className="text-[10px] text-[#123D46]/70 mt-0.5 block">
                  Confiance solide · Progrès sur les coopérations
                </span>
              </div>

              {/* Trajectory sparkline */}
              <div className="w-full mt-3 pt-2 border-t border-[#E3EBE6]">
                <TrajectoryGraphic className="p-1 border-none shadow-none bg-transparent" />
              </div>
            </div>

            {/* Quick Daily Pulse */}
            <div className="bg-[#F4F1E8] p-4 rounded-xl border border-[#E3EBE6]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-jakarta font-bold text-[#123D46]">
                  Baromètre du jour
                </span>
                <span className="text-[10px] text-[#00A99D] font-semibold">1 min</span>
              </div>
              <p className="text-[11px] text-[#123D46]/80 mb-3">
                Quel est votre niveau d’énergie partagée aujourd’hui ?
              </p>
              <div className="flex justify-between items-center gap-1">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => setPulseScore(val)}
                    className={`w-9 h-9 rounded-lg font-jakarta font-bold text-xs transition-all ${
                      pulseScore === val
                        ? 'bg-[#00A99D] text-white shadow-xs'
                        : 'bg-white text-[#123D46]/70 border border-[#E3EBE6]'
                    }`}
                  >
                    {val === 1 ? '🌧️' : val === 2 ? '⛅' : val === 3 ? '🌤️' : val === 4 ? '☀️' : '✨'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action pill recommendation */}
            <div className="p-3 bg-white rounded-xl border border-[#E3EBE6] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center shrink-0">
                <IconAction size={18} color="#5965E8" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-jakarta font-bold text-[#123D46] block truncate">
                  Rituel d'écoute active
                </span>
                <span className="text-[10px] text-[#123D46]/70 block">
                  3 min avant votre réunion de 14h
                </span>
              </div>
              <button className="text-[10px] font-jakarta font-bold text-[#00A99D] shrink-0">
                Lancer
              </button>
            </div>
          </div>

          {/* Bottom App Navigation */}
          <div className="px-6 py-2 bg-white border-t border-[#E3EBE6] flex items-center justify-around">
            <button
              onClick={() => setActiveTab('index')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'index' ? 'text-[#00A99D]' : 'text-[#123D46]/40'}`}
            >
              <IconMoiNous size={18} />
              <span className="text-[9px] font-semibold">Indice</span>
            </button>
            <button
              onClick={() => setActiveTab('equipe')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'equipe' ? 'text-[#00A99D]' : 'text-[#123D46]/40'}`}
            >
              <IconObservation size={18} />
              <span className="text-[9px] font-semibold">Équipe</span>
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'actions' ? 'text-[#00A99D]' : 'text-[#123D46]/40'}`}
            >
              <IconAction size={18} />
              <span className="text-[9px] font-semibold">Actions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
