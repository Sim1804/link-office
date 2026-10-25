"use client";

/**
 * @file page.tsx
 * @module app/dashboard/superadmin/audit
 * @description Journal d'audit des événements LLM et système — SUPER_ADMIN uniquement.
 *
 * Affiche les événements d'inférence IRIS, les dégradations, les appels réussis
 * avec leur latence, provider et modèle utilisé.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Activity, RefreshCw, AlertCircle, Zap,
  Clock, Filter, CheckCircle2,
  XCircle, TrendingDown
} from "lucide-react";
import { IrisMark } from "@/components/brand/IrisLogo";

function IrisEventIcon({ className }: { className?: string; style?: React.CSSProperties }) {
  return <IrisMark size={16} className={className} />;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuditEvent {
  id: string;
  eventType: string;
  eventData: {
    model?: string;
    provider?: string;
    latencyMs?: number;
    degraded?: boolean;
    errorMessage?: string;
    finishReason?: string;
    tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  };
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const EVENT_LABELS: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
  iris_llm_inference: { label: "Inférence IRIS", color: "#5965E8", icon: IrisEventIcon },
  iris_llm_stream_finished: { label: "Stream terminé", color: "#00A99D", icon: CheckCircle2 },
  iris_llm_degraded_fallback: { label: "Mode dégradé", color: "#EF4444", icon: TrendingDown },
};

function LatencyBadge({ ms }: { ms?: number }) {
  if (!ms) return null;
  const color = ms < 1000 ? "#10b981" : ms < 3000 ? "#f59e0b" : "#ef4444";
  return (
    <span
      className="text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums"
      style={{ background: `${color}15`, color }}
    >
      {ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`}
    </span>
  );
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "50" });
      if (filterType) params.set("eventType", filterType);
      const res = await fetch(`/api/superadmin/audit?${params}`);
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setEvents(data.events);
      setPagination(data.pagination);
    } catch {
      setError("Impossible de charger le journal d'audit.");
    } finally {
      setLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5965E8]/10 flex items-center justify-center">
              <IrisMark size={24} />
            </div>
            Journal d'Audit LLM
          </h1>
          <p className="text-sm text-[#123D46]/60 mt-1">
            Historique des inférences IRIS · Latences · Modes dégradés
          </p>
        </div>
        <button
          onClick={loadEvents}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E3EBE6] text-sm font-semibold text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-[#123D46]/40" />
        {[{ value: "", label: "Tous les événements" }, ...Object.entries(EVENT_LABELS).map(([k, v]) => ({ value: k, label: v.label }))].map(
          (opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterType === opt.value
                  ? "bg-[#123D46] text-white"
                  : "bg-white border border-[#E3EBE6] text-[#123D46]/70 hover:text-[#123D46]"
              }`}
            >
              {opt.label}
            </button>
          )
        )}
      </div>

      {/* Contenu */}
      <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
        {error && (
          <div className="flex items-center gap-3 px-6 py-4 bg-rose-50 text-rose-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#5965E8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-[#123D46]/40">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-[#5965E8]/10 flex items-center justify-center opacity-70">
              <IrisMark size={24} />
            </div>
            <p className="text-sm">Aucun événement trouvé</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_140px_100px_80px_120px] gap-4 px-6 py-3 border-b border-[#E3EBE6] bg-[#F4F1E8]">
              {["Événement", "Modèle / Provider", "Latence", "Tokens", "Date"].map((h) => (
                <span key={h} className="text-[11px] font-jakarta font-bold text-[#123D46]/50 uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#E3EBE6]">
              {events.map((ev) => {
                const meta = EVENT_LABELS[ev.eventType] || {
                  label: ev.eventType,
                  color: "#9CA3AF",
                  icon: Activity,
                };
                const Icon = meta.icon;
                const degraded = ev.eventData?.degraded;
                return (
                  <div
                    key={ev.id}
                    className={`grid grid-cols-[1fr_140px_100px_80px_120px] gap-4 px-6 py-3.5 items-center hover:bg-[#F4F1E8]/40 transition-colors ${
                      degraded ? "bg-rose-50/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${meta.color}15` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#123D46] truncate">{meta.label}</p>
                        {ev.user && (
                          <p className="text-[11px] text-[#123D46]/40 truncate">
                            {ev.user.firstName} {ev.user.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-mono text-[#123D46] truncate">{ev.eventData?.model || "—"}</p>
                      <p className="text-[11px] text-[#123D46]/40">{ev.eventData?.provider || "—"}</p>
                    </div>

                    <div>
                      <LatencyBadge ms={ev.eventData?.latencyMs} />
                    </div>

                    <div>
                      {ev.eventData?.tokenUsage ? (
                        <span className="text-xs text-[#123D46]/60 tabular-nums">
                          {ev.eventData.tokenUsage.totalTokens}
                        </span>
                      ) : (
                        <span className="text-[#123D46]/20">—</span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-[#123D46]/60">
                        {new Date(ev.createdAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination — Standard SuperAdmin (Catalogues, Utilisateurs, Médias) */}
        {!loading && pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-[#E3EBE6]">
            <span className="text-[#123D46]/60 text-[13px] font-medium">
              Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} événements
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: pagination.pages }).map((_, i) => {
                const p = i + 1;
                const isActive = p === page;
                if (pagination.pages > 7 && p > 3 && p < pagination.pages - 1 && p !== page) {
                  if (p === 4 || p === pagination.pages - 2) return <span key={p} className="px-1 text-[#123D46]/40">…</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#00A99D] text-white border-none"
                        : "bg-transparent border border-[#E3EBE6] text-[#123D46]/70 hover:bg-[#FAF9F5]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
