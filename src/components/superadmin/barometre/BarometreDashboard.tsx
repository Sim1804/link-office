"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, MapPin, Activity, Target, Users, TrendingUp, User, PenTool, Calendar, ShieldCheck, ChevronDown
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from "recharts";
import { Select } from "@/components/ui/Select";

interface BarometreData {
  totalPassages: number;
  globalAverage: number;
  dimensions: {
    social: number;
    affective: number;
    sentimental: number;
    professional: number;
    self: number;
  };
  regions: { name: string; count: number; average: number }[];
  timeline: { date: string; passages: number }[];
  profils: { name: string; value: number; color: string; count: number }[];
}

export function BarometreDashboard({ availableRegions }: { availableRegions: string[] }) {
  const [data, setData] = useState<BarometreData | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Filters ──
  const [period, setPeriod] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [age, setAge] = useState("ALL");
  const [gender, setGender] = useState("ALL");

  // ── Editorial (Mock state for V1) ──
  const [editorialComment, setEditorialComment] = useState("La santé relationnelle globale montre une forte amélioration des relations professionnelles suite aux récentes campagnes de sensibilisation, mais le sentiment de solitude reste marqué chez les 18-25 ans.");
  const [highlightNumber, setHighlightNumber] = useState("12%");
  const [highlightText, setHighlightText] = useState("d'augmentation du sentiment d'appartenance");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ period, region, type });
        const res = await fetch(`/api/admin/barometre?${query.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period, region, type, age, gender]);

  const radarData = data ? [
    { subject: "Social", A: data.dimensions.social, fullMark: 100 },
    { subject: "Affectif", A: data.dimensions.affective, fullMark: 100 },
    { subject: "Sentimental", A: data.dimensions.sentimental, fullMark: 100 },
    { subject: "Pro", A: data.dimensions.professional, fullMark: 100 },
    { subject: "Soi", A: data.dimensions.self, fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── ROW 1: EDITORIAL & PARAMÈTRES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gestion Éditoriale (Chiffre à la Une + Commentaire) */}
        <div className="lg:col-span-1 bg-white border border-[#E3EBE6] border-t-4 border-t-[#00A99D] rounded-2xl shadow-sm relative overflow-hidden flex flex-col">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00A99D]/5 to-transparent pointer-events-none" />
          
          <div className="p-5 sm:p-6 relative z-10 flex flex-col flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[15px] font-bold text-[#123D46] flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#00A99D]" /> Gestion Éditoriale
              </h2>
              <span className="text-[10px] font-medium text-[#123D46]/50 flex items-center gap-1 bg-white/60 px-2 py-1 rounded-md border border-[#E3EBE6]">
                <Calendar className="w-3 h-3" /> {new Date().toLocaleDateString('fr-FR')}
              </span>
            </div>

            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-[#123D46]/60 mb-2 uppercase tracking-wider">Chiffre à la Une</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={highlightNumber} 
                    onChange={(e) => setHighlightNumber(e.target.value)}
                    className="w-20 px-3 py-2 bg-white border border-[#E3EBE6] rounded-xl text-base font-black text-[#00A99D] focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] transition-shadow text-center" 
                  />
                  <input 
                    type="text" 
                    value={highlightText} 
                    onChange={(e) => setHighlightText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-[#E3EBE6] rounded-xl text-xs font-medium text-[#123D46] focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] transition-shadow" 
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-[10px] font-bold text-[#123D46]/60 mb-2 uppercase tracking-wider">Commentaire d'analyse</label>
                <textarea 
                  value={editorialComment}
                  onChange={(e) => setEditorialComment(e.target.value)}
                  className="flex-1 w-full p-3 bg-white border border-[#E3EBE6] rounded-xl text-xs text-[#123D46] leading-relaxed resize-none focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] transition-shadow min-h-[100px]" 
                />
              </div>
            </div>
            
            <button className="w-full mt-5 bg-[#00A99D] hover:bg-[#199E9A] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm">
              Publier sur la page d'accueil
            </button>
          </div>
        </div>

        {/* Filtres de Données */}
        <div className="lg:col-span-2 bg-white border border-[#E3EBE6] rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[15px] font-bold text-[#123D46] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00A99D]" /> Filtres de l'Observatoire
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Seuil d'anonymat respecté
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-5 flex-1">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#123D46]/60 uppercase tracking-wider">Période</label>
              <Select value={period} onChange={setPeriod} options={[{ value: "ALL", label: "Depuis toujours" }, { value: "this_year", label: "Cette année" }, { value: "last_30_days", label: "30 derniers jours" }]} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#123D46]/60 uppercase tracking-wider">Structure</label>
              <Select value={type} onChange={setType} options={[{ value: "ALL", label: "Toutes confondues" }, { value: "B2C", label: "Particuliers" }, { value: "B2B", label: "Entreprises" }, { value: "B2B2C", label: "Mutuelles" }, { value: "B2G", label: "Collectivités" }]} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#123D46]/60 uppercase tracking-wider">Département</label>
              <Select value={region} onChange={setRegion} options={[{ value: "ALL", label: "France entière" }, ...availableRegions.map(r => ({ value: r, label: r }))]} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#123D46]/60 uppercase tracking-wider">Âge</label>
              <Select value={age} onChange={setAge} options={[{ value: "ALL", label: "Tous âges" }, { value: "18-25", label: "18-25 ans" }, { value: "26-40", label: "26-40 ans" }, { value: "41+", label: "41 ans et +" }]} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#123D46]/60 uppercase tracking-wider">Sexe</label>
              <Select value={gender} onChange={setGender} options={[{ value: "ALL", label: "Tous" }, { value: "H", label: "Hommes" }, { value: "F", label: "Femmes" }]} />
            </div>
          </div>
        </div>

      </div>

      {/* Loading State — Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white border border-[#E3EBE6] rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-[#E3EBE6] rounded-2xl h-[340px] animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* ── CONTENT GRID ── */}
      {!loading && data && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#123D46]/60 uppercase tracking-wider mb-1">Volume d'évaluations</h3>
                <div className="text-4xl font-jakarta font-black text-[#123D46] font-mono leading-none">
                  {data.totalPassages.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-6 shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#123D46]/60 uppercase tracking-wider mb-1">Moyenne IQRH Globale</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-jakarta font-black text-[#00A99D] font-mono leading-none">{data.globalAverage}</span>
                  <span className="text-lg font-bold text-[#123D46]/40">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timeline */}
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 sm:p-6 shadow-xs lg:col-span-2">
              <h3 className="text-[15px] font-bold text-[#123D46] mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00A99D]" /> Évolution des passages
              </h3>
              <div className="w-full h-[280px]">
                {data.timeline.length > 0 ? (
                  <ResponsiveContainer>
                    <LineChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EBE6" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickMargin={10} minTickGap={20} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickMargin={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: "1px solid #E3EBE6", fontSize: '12px', boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontWeight: 500, color: "#123D46" }} 
                      />
                      <Line type="monotone" dataKey="passages" stroke="#00A99D" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: "#00A99D", stroke: "#fff", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-[#123D46]/50">Aucune donnée pour cette période</div>
                )}
              </div>
            </div>

            {/* Radar Dimensions */}
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-[15px] font-bold text-[#123D46] mb-6 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00A99D]" /> Équilibre des dimensions
              </h3>
              <div className="w-full h-[280px]">
                <ResponsiveContainer>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#E3EBE6" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#123D46', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                    <Radar name="Moyenne" dataKey="A" stroke="#00A99D" strokeWidth={2} fill="#00A99D" fillOpacity={0.15} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: "1px solid #E3EBE6", fontSize: '12px', boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profils Relationnels */}
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 sm:p-6 shadow-xs lg:col-span-1">
              <h3 className="text-[15px] font-bold text-[#123D46] mb-6 flex items-center gap-2">
                <User className="w-4 h-4 text-[#00A99D]" /> Profils Relationnels
              </h3>
              <div className="flex flex-col gap-6">
                <div className="w-full h-[180px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.profils} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                        {data.profils.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: "none", fontSize: '12px', boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontWeight: 600 }} 
                        itemStyle={{ color: "#123D46" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3">
                  {data.profils.map(p => (
                    <div key={p.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F1E8]/40 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-xs font-semibold text-[#123D46]/80">{p.name}</span>
                      </div>
                      <span className="text-xs font-black text-[#123D46]">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Regions */}
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 sm:p-6 shadow-xs lg:col-span-2">
              <h3 className="text-[15px] font-bold text-[#123D46] mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00A99D]" /> Répartition par département (Top 15)
              </h3>
              <div className="w-full h-[320px]">
                {data.regions.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={data.regions} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EBE6" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickMargin={10} tickLine={false} axisLine={false} />
                      <YAxis type="number" stroke="#94a3b8" fontSize={11} tickMargin={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: "1px solid #E3EBE6", fontSize: '12px', boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontWeight: 500, color: "#123D46" }} 
                        cursor={{fill: 'rgba(0,169,157,0.05)'}} 
                      />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Passages" maxBarSize={48}>
                        {data.regions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#00A99D" : "#6366f1"} fillOpacity={index === 0 ? 1 : 0.7} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-[#123D46]/50">Aucune donnée</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
