"use client";

/**
 * @file page.tsx
 * @module app/dashboard/superadmin/platform
 * @description Page de configuration de la plateforme — réservée au SUPER_ADMIN.
 *
 * Sections :
 * 1. Configuration LLM IRIS — changer de provider/modèle sans toucher au code
 * 2. Feature Flags — activer/désactiver les modules de la plateforme
 * 3. Paramètres Système — limites, mode maintenance
 */

import { useState, useEffect, useCallback } from "react";
import {
  Cpu, Zap, Settings2, ToggleLeft, ToggleRight,
  RefreshCw, CheckCircle2, AlertCircle, ChevronDown,
  Activity, Shield, Users, MessageSquare, Handshake, FileQuestion,
  RotateCcw, Save, ExternalLink, Eye, EyeOff, AlertTriangle, Sparkles
} from "lucide-react";
import { IrisMark } from "@/components/brand/IrisLogo";

// ─── Types ──────────────────────────────────────────────────────────────────

type LlmProvider = "groq" | "openai" | "anthropic" | "mistral";

interface LlmConfig {
  provider: LlmProvider;
  model: string;
  maxOutputTokens: number;
  systemPromptOverride: string | null;
  fallbackEnabled: boolean;
  rateLimitPerUser: number;
  updatedAt: string;
  updatedBy: string | null;
}

interface ProvidersInfo {
  available: Record<LlmProvider, boolean>;
  models: Record<LlmProvider, string[]>;
  envKeys: Record<LlmProvider, string>;
}

interface PlatformSettings {
  iris_enabled: boolean;
  binome_enabled: boolean;
  questionnaire_enabled: boolean;
  registration_enabled: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  max_users_per_org: number;
  updatedAt: string;
  updatedBy: string | null;
}

// ─── Constantes UI ──────────────────────────────────────────────────────────

const PROVIDER_META: Record<LlmProvider, { label: string; color: string; description: string }> = {
  groq: {
    label: "Groq",
    color: "#F55036",
    description: "Ultra-rapide · Open Source models · Recommandé pour IRIS",
  },
  openai: {
    label: "OpenAI",
    color: "#10A37F",
    description: "GPT-4o et GPT-4o-mini · Haute qualité · Coût plus élevé",
  },
  anthropic: {
    label: "Anthropic",
    color: "#C96442",
    description: "Claude 3.5 Sonnet · Excellence en nuance et sécurité",
  },
  mistral: {
    label: "Mistral AI",
    color: "#FF7000",
    description: "Modèles européens · RGPD-friendly · Souveraineté des données",
  },
};

const FEATURE_FLAGS = [
  {
    key: "iris_enabled" as keyof PlatformSettings,
    label: "IRIS — Coaching IA",
    description: "Active le module de coaching relationnel alimenté par l'IA pour tous les utilisateurs",
    icon: Sparkles,
    color: "#5965E8",
  },
  {
    key: "binome_enabled" as keyof PlatformSettings,
    label: "Module Binôme",
    description: "Active le matching et le suivi des binômes de soutien",
    icon: Handshake,
    color: "#00A99D",
  },
  {
    key: "questionnaire_enabled" as keyof PlatformSettings,
    label: "Questionnaire IQRH",
    description: "Permet aux utilisateurs d'accéder et de compléter le questionnaire",
    icon: FileQuestion,
    color: "#199E9A",
  },
  {
    key: "registration_enabled" as keyof PlatformSettings,
    label: "Nouvelles inscriptions",
    description: "Autorise les nouvelles créations de compte sur la plateforme",
    icon: Users,
    color: "#FFC629",
  },
];

// ─── Composant Toggle ────────────────────────────────────────────────────────

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className="relative flex-shrink-0"
      style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
      aria-pressed={value}
    >
      <div
        style={{
          width: 48,
          height: 26,
          borderRadius: 13,
          background: value ? "#00A99D" : "#CBD5E1",
          transition: "background 0.2s",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: value ? 26 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }}
        />
      </div>
    </button>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function PlatformPage() {
  // ── État LLM ─────────────────────────────────────────────────────────────
  const [llmConfig, setLlmConfig] = useState<LlmConfig | null>(null);
  const [providers, setProviders] = useState<ProvidersInfo | null>(null);
  const [llmLoading, setLlmLoading] = useState(true);
  const [llmSaving, setLlmSaving] = useState(false);
  const [llmSuccess, setLlmSuccess] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  // Formulaire LLM local
  const [selectedProvider, setSelectedProvider] = useState<LlmProvider>("groq");
  const [selectedModel, setSelectedModel] = useState("");
  const [maxTokens, setMaxTokens] = useState(800);
  const [rateLimitPerUser, setRateLimitPerUser] = useState(20);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [promptOverride, setPromptOverride] = useState("");
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  // ── État Settings ────────────────────────────────────────────────────────
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // ── Chargement initial ───────────────────────────────────────────────────
  const loadLlmConfig = useCallback(async () => {
    setLlmLoading(true);
    setLlmError(null);
    try {
      const res = await fetch("/api/superadmin/platform/llm");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setLlmConfig(data.config);
      setProviders(data.providers);
      setSelectedProvider(data.config.provider);
      setSelectedModel(data.config.model);
      setMaxTokens(data.config.maxOutputTokens);
      setRateLimitPerUser(data.config.rateLimitPerUser);
      setFallbackEnabled(data.config.fallbackEnabled);
      setPromptOverride(data.config.systemPromptOverride || "");
    } catch {
      setLlmError("Impossible de charger la configuration LLM.");
    } finally {
      setLlmLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/superadmin/platform/settings");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setSettings(data.settings);
    } catch {
      setSettingsError("Impossible de charger les paramètres.");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLlmConfig();
    loadSettings();
  }, [loadLlmConfig, loadSettings]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleProviderChange = (provider: LlmProvider) => {
    setSelectedProvider(provider);
    if (providers?.models[provider]) {
      setSelectedModel(providers.models[provider][0]);
    }
  };

  const saveLlmConfig = async () => {
    setLlmSaving(true);
    setLlmError(null);
    setLlmSuccess(false);
    try {
      const res = await fetch("/api/superadmin/platform/llm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          maxOutputTokens: maxTokens,
          rateLimitPerUser,
          fallbackEnabled,
          systemPromptOverride: promptOverride.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la sauvegarde");
      }
      const data = await res.json();
      setLlmConfig(data.config);
      setLlmSuccess(true);
      setTimeout(() => setLlmSuccess(false), 4000);
    } catch (e: any) {
      setLlmError(e.message);
    } finally {
      setLlmSaving(false);
    }
  };

  const resetLlmConfig = async () => {
    if (!confirm("Réinitialiser la configuration LLM aux valeurs par défaut ?")) return;
    setLlmSaving(true);
    try {
      await fetch("/api/superadmin/platform/llm", { method: "DELETE" });
      await loadLlmConfig();
    } finally {
      setLlmSaving(false);
    }
  };

  const toggleFeatureFlag = async (key: keyof PlatformSettings, value: boolean) => {
    if (!settings) return;
    setSettingsSaving(key);
    setSettingsError(null);
    const optimistic = { ...settings, [key]: value };
    setSettings(optimistic);
    try {
      const res = await fetch("/api/superadmin/platform/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setSettings(data.settings);
    } catch {
      setSettings(settings); // rollback
      setSettingsError(`Impossible de modifier "${key}"`);
    } finally {
      setSettingsSaving(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5965E8]/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-[#5965E8]" />
          </div>
          Paramètres de la Plateforme
        </h1>
        <p className="text-sm text-[#123D46]/60 mt-1">
          Configuration du moteur IA IRIS · Feature flags · Paramètres système
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Configuration LLM                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
        {/* Header section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3EBE6] bg-gradient-to-r from-[#5965E8]/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5965E8]/10 flex items-center justify-center">
              <IrisMark size={22} />
            </div>
            <div>
              <h2 className="text-base font-jakarta font-bold text-[#123D46]">Moteur IA — Configuration IRIS</h2>
              <p className="text-xs text-[#123D46]/60">Changez de provider ou de modèle sans modifier le code</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {llmConfig && (
              <span className="text-[11px] text-[#123D46]/40 hidden sm:block">
                Modifié le {new Date(llmConfig.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
            <button
              onClick={loadLlmConfig}
              disabled={llmLoading}
              className="p-2 rounded-lg text-[#123D46]/40 hover:text-[#123D46] hover:bg-[#F4F1E8] transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${llmLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {llmLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#5965E8] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Alertes */}
              {llmError && (
                <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {llmError}
                </div>
              )}
              {llmSuccess && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Configuration LLM mise à jour et active immédiatement (cache invalidé)
                </div>
              )}

              {/* Sélection du Provider */}
              <div>
                <label className="block text-xs font-jakarta font-bold text-[#123D46]/70 uppercase tracking-wider mb-3">
                  Provider LLM
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {(["groq", "openai", "anthropic", "mistral"] as LlmProvider[]).map((p) => {
                    const meta = PROVIDER_META[p];
                    const available = providers?.available[p] ?? false;
                    const active = selectedProvider === p;
                    return (
                      <button
                        key={p}
                        onClick={() => available && handleProviderChange(p)}
                        disabled={!available}
                        title={!available ? `Clé API ${providers?.envKeys[p]} manquante dans l'environnement` : undefined}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          active
                            ? "border-[#5965E8] bg-[#5965E8]/5 shadow-sm"
                            : available
                            ? "border-[#E3EBE6] hover:border-[#5965E8]/40 cursor-pointer"
                            : "border-[#E3EBE6] opacity-40 cursor-not-allowed"
                        }`}
                      >
                        {!available && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                            Clé manquante
                          </span>
                        )}
                        <div
                          className="w-7 h-7 rounded-lg mb-2 flex items-center justify-center text-white text-xs font-black"
                          style={{ background: meta.color }}
                        >
                          {meta.label[0]}
                        </div>
                        <div className="text-sm font-bold text-[#123D46]">{meta.label}</div>
                        <div className="text-[11px] text-[#123D46]/50 mt-0.5 leading-tight">{meta.description}</div>
                        {active && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#5965E8]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sélection du modèle */}
              {providers && selectedProvider && (
                <div>
                  <label className="block text-xs font-jakarta font-bold text-[#123D46]/70 uppercase tracking-wider mb-2">
                    Modèle
                  </label>
                  <div className="relative max-w-md">
                    <select
                      id="llm-model-select"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-[#E3EBE6] text-sm font-medium text-[#123D46] bg-white focus:outline-none focus:ring-2 focus:ring-[#5965E8]/30 focus:border-[#5965E8]"
                    >
                      {providers.models[selectedProvider].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#123D46]/40 pointer-events-none" />
                  </div>
                  <p className="text-xs text-[#123D46]/40 mt-1">
                    Variable d'env active : <code className="bg-[#F4F1E8] px-1.5 py-0.5 rounded text-[#5965E8]">{providers.envKeys[selectedProvider]}</code>
                  </p>
                </div>
              )}

              {/* Paramètres avancés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-jakarta font-bold text-[#123D46]/70 uppercase tracking-wider mb-2">
                    Tokens max par réponse
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      id="max-tokens-range"
                      min={100}
                      max={4000}
                      step={100}
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                      className="flex-1 accent-[#5965E8]"
                    />
                    <span className="text-sm font-bold text-[#123D46] w-12 text-right tabular-nums">{maxTokens}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-jakarta font-bold text-[#123D46]/70 uppercase tracking-wider mb-2">
                    Limite requêtes / utilisateur / heure
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      id="rate-limit-range"
                      min={1}
                      max={100}
                      step={1}
                      value={rateLimitPerUser}
                      onChange={(e) => setRateLimitPerUser(parseInt(e.target.value, 10))}
                      className="flex-1 accent-[#5965E8]"
                    />
                    <span className="text-sm font-bold text-[#123D46] w-12 text-right tabular-nums">{rateLimitPerUser}</span>
                  </div>
                </div>
              </div>

              {/* Fallback mode */}
              <div className="flex items-center justify-between p-4 bg-[#F4F1E8] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-[#123D46]">Mode dégradé automatique</p>
                  <p className="text-xs text-[#123D46]/60">
                    Si le provider est indisponible, IRIS répond avec un message de maintenance
                  </p>
                </div>
                <Toggle value={fallbackEnabled} onChange={setFallbackEnabled} />
              </div>

              {/* Override du prompt système */}
              <div>
                <button
                  onClick={() => setShowPromptEditor(!showPromptEditor)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#5965E8] hover:text-[#4654D9] transition-colors"
                >
                  {showPromptEditor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPromptEditor ? "Masquer" : "Configurer"} le prompt système IRIS
                  {promptOverride && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5965E8]/10 text-[#5965E8]">Override actif</span>
                  )}
                </button>

                {showPromptEditor && (
                  <div className="mt-3">
                    <p className="text-xs text-[#123D46]/50 mb-2">
                      Laissez vide pour utiliser le prompt système par défaut codé dans l'application.
                      Ce champ remplace entièrement le prompt système d'IRIS si renseigné.
                    </p>
                    <textarea
                      id="system-prompt-override"
                      value={promptOverride}
                      onChange={(e) => setPromptOverride(e.target.value)}
                      rows={6}
                      placeholder="Vous êtes IRIS, assistant de coaching relationnel IA de Link Office..."
                      className="w-full px-4 py-3 rounded-xl border border-[#E3EBE6] text-sm font-mono text-[#123D46] bg-[#F8F9FA] focus:outline-none focus:ring-2 focus:ring-[#5965E8]/30 focus:border-[#5965E8] resize-y"
                    />
                    <p className="text-xs text-[#123D46]/40 mt-1 text-right">
                      {promptOverride.length} caractères
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#E3EBE6]">
                <button
                  id="save-llm-config-btn"
                  onClick={saveLlmConfig}
                  disabled={llmSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5965E8] hover:bg-[#4654D9] text-white text-sm font-jakarta font-bold transition-colors disabled:opacity-60 shadow-sm"
                >
                  {llmSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {llmSaving ? "Sauvegarde..." : "Sauvegarder & Activer"}
                </button>
                <button
                  onClick={resetLlmConfig}
                  disabled={llmSaving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E3EBE6] text-sm font-semibold text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Réinitialiser
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Feature Flags                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E3EBE6] bg-gradient-to-r from-[#00A99D]/5 to-transparent">
          <div className="w-9 h-9 rounded-xl bg-[#00A99D]/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#00A99D]" />
          </div>
          <div>
            <h2 className="text-base font-jakarta font-bold text-[#123D46]">Feature Flags — Modules Plateforme</h2>
            <p className="text-xs text-[#123D46]/60">Activez ou désactivez les modules instantanément, sans redéploiement</p>
          </div>
        </div>

        <div className="divide-y divide-[#E3EBE6]">
          {settingsError && (
            <div className="px-6 py-3 bg-rose-50 text-rose-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {settingsError}
            </div>
          )}

          {FEATURE_FLAGS.map((flag) => {
            const Icon = flag.icon;
            const value = settings ? (settings[flag.key] as boolean) : true;
            const isSaving = settingsSaving === flag.key;

            return (
              <div key={flag.key} className="flex items-center justify-between px-6 py-4 hover:bg-[#F4F1E8]/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${flag.color}15` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: flag.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#123D46]">{flag.label}</p>
                    <p className="text-xs text-[#123D46]/50">{flag.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${value ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                    {value ? "Actif" : "Désactivé"}
                  </span>
                  {isSaving ? (
                    <RefreshCw className="w-5 h-5 text-[#123D46]/30 animate-spin" />
                  ) : (
                    <Toggle
                      value={value}
                      onChange={(v) => toggleFeatureFlag(flag.key, v)}
                      disabled={settingsLoading}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Mode Maintenance — mis en avant */}
          <div className={`flex items-center justify-between px-6 py-4 transition-colors ${settings?.maintenance_mode ? "bg-amber-50" : "hover:bg-[#F4F1E8]/40"}`}>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#123D46] flex items-center gap-2">
                  Mode Maintenance
                  {settings?.maintenance_mode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold animate-pulse">
                      ACTIF
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#123D46]/50">
                  Redirige tous les utilisateurs vers une page d'information
                </p>
              </div>
            </div>
            <Toggle
              value={settings?.maintenance_mode ?? false}
              onChange={(v) => toggleFeatureFlag("maintenance_mode", v)}
              disabled={settingsLoading || settingsSaving === "maintenance_mode"}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — Informations de sécurité                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-[#E3EBE6] rounded-2xl overflow-hidden shadow-xs">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E3EBE6] bg-gradient-to-r from-[#123D46]/5 to-transparent">
          <div className="w-9 h-9 rounded-xl bg-[#123D46]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#123D46]" />
          </div>
          <div>
            <h2 className="text-base font-jakarta font-bold text-[#123D46]">Sécurité — Architecture LLM</h2>
            <p className="text-xs text-[#123D46]/60">Comment les clés API sont protégées</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Shield,
                color: "#00A99D",
                title: "Clés jamais en BDD",
                desc: "Seul le nom de la variable d'env est stocké. La clé réelle reste dans les secrets Vercel/serveur.",
              },
              {
                icon: Activity,
                color: "#5965E8",
                title: "Cache mémoire 60s",
                desc: "La config est lue en BDD toutes les 60s. La mise à jour est immédiate côté superadmin (invalidation manuelle).",
              },
              {
                icon: Cpu,
                color: "#FFC629",
                title: "Audit complet",
                desc: "Chaque appel IRIS est journalisé : provider, modèle, latence, tokens — sans stocker le contenu utilisateur.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-4 rounded-xl bg-[#F4F1E8] border border-[#E3EBE6]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-[#123D46] mb-1">{title}</p>
                <p className="text-xs text-[#123D46]/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#123D46]/40 pt-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Pour ajouter un nouveau provider, ajoutez sa clé API dans les variables d'environnement du serveur puis rafraîchissez cette page.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
