"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Send, X, MessageCircle, FileText, RefreshCw, ChevronDown, Sparkles } from "lucide-react";
import { startIrisConversation, sendIrisMessage, getIrisExplication } from "@/lib/api";
import { IrisMark } from "@/components/brand/IrisLogo";

const formatText = (text: string) => {
  if (!text) return null;
  return text.split("\n").map((line, idx, array) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={idx}>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
          }
          return <span key={i}>{part}</span>;
        })}
        {idx < array.length - 1 && <br />}
      </span>
    );
  });
};

interface Message {
  id: string;
  sender: "user" | "iris";
  text: string;
  timestamp: Date;
  isPremiumCTA?: boolean;
}

const QUICK_PROMPTS = [
  "Comment est calculé mon score IQRH ?",
  "Quelles sont les 5 dimensions du climat relationnel ?",
  "Comment fonctionne le coaching IA IRIS ?",
  "Quelles sont les solutions pour mon organisation ?"
];

export function IrisWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [explicationLoading, setExplicationLoading] = useState(false);
  const [explication, setExplication] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"coach" | "explication">("coach");
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, activeTab]);

  // Outside click and Escape key listeners (Standard Intercom/Crisp model)
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Support external trigger via custom event
  useEffect(() => {
    const handleOpenIris = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetTab = customEvent.detail?.tab || "coach";
      
      setIsOpen(true);
      setActiveTab(targetTab);
    };

    window.addEventListener("open-iris", handleOpenIris);
    return () => window.removeEventListener("open-iris", handleOpenIris);
  }, []);

  const loadExplication = async (forceRefresh = false) => {
    if (!session?.user?.id) return;
    if (explication && !forceRefresh) return;
    setExplicationLoading(true);
    try {
      const res = await getIrisExplication();
      setExplication(res.explication);
    } catch {
      setExplication("IRIS n'est pas disponible pour le moment. Veuillez réessayer plus tard.");
    } finally {
      setExplicationLoading(false);
    }
  };

  const startChat = async () => {
    if (!session?.user?.id) {
      // Welcome message for non-authenticated visitor
      if (messages.length === 0) {
        setMessages([{
          id: "welcome-guest",
          sender: "iris",
          text: "Bonjour ! Je suis IRIS, l'intelligence relationnelle de LinkOffice. Je suis là pour vous faire découvrir notre méthodologie, répondre à vos questions sur l'IQRH et vous guider dans l'amélioration de vos relations.",
          timestamp: new Date(),
        }]);
      }
      return;
    }
    
    if (conversationId) return;
    setLoading(true);
    try {
      const conv = await startIrisConversation(session.user.id);
      setConversationId(conv.conversation_id);
      setMessages([{
        id: "welcome",
        sender: "iris",
        text: `Bonjour ${session.user.name || ""} ! Je suis IRIS, votre coach relationnel. J'ai analysé vos indicateurs et vos dynamiques d'équipe. Comment puis-je vous accompagner aujourd'hui ?`,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages([{ id: "err", sender: "iris", text: "IRIS est indisponible pour le moment.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setConversationId(null);
    setMessages([]);
    startChat();
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "coach" && (!conversationId || messages.length === 0)) startChat();
      if (activeTab === "explication" && !explication && session?.user?.id) loadExplication();
    }
  }, [isOpen, activeTab, conversationId, explication, session?.user?.id]);

  const handleTabSwitch = (tab: "coach" | "explication") => {
    setActiveTab(tab);
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // If visitor is unauthenticated: provide intelligent SaaS guidance and CTA
    if (!session?.user?.id) {
      setLoading(true);
      setTimeout(() => {
        let reply = "L'IQRH (Indice de Qualité Relationnelle et Humaine) mesure scientifiquement l'équilibre entre vos 5 dimensions de vie : sociale, affective, sentimentale, professionnelle et personnelle. Pour obtenir votre diagnostic individuel précis, passez le test gratuit en 3 minutes !";
        
        const lower = trimmed.toLowerCase();
        if (lower.includes("dimension") || lower.includes("5")) {
          reply = "Les 5 dimensions LinkOffice sont : les Relations Sociales, les Relations Affectives, la Vie Sentimentale, la Vie Professionnelle et la Relation à Soi. Chacune fait l'objet d'un score précis et de recommandations concrètes.";
        } else if (lower.includes("organisation") || lower.includes("entreprise") || lower.includes("pro") || lower.includes("équipe")) {
          reply = "LinkOffice propose aux entreprises et collectivités des baromètres d'équipe anonymes, des diagnostics RPS/QVT et des plans d'action managériaux sur-mesure. Découvrez notre offre dans l'onglet Solutions PRO !";
        } else if (lower.includes("iris") || lower.includes("coach") || lower.includes("ia")) {
          reply = "Je suis IRIS, le coach IA développé par LinkOffice. J'analyse vos résultats IQRH pour vous proposer des micro-défis relationnels, désamorcer les tensions et renforcer la sécurité psychologique de votre quotidien.";
        }

        setMessages((prev) => [...prev, {
          id: `iris-guest-${Date.now()}`,
          sender: "iris",
          text: reply,
          timestamp: new Date(),
          isPremiumCTA: true,
        }]);
        setLoading(false);
      }, 650);
      return;
    }

    if (!conversationId) return;
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
      const res = await sendIrisMessage(conversationId, trimmed, history);
      const irisMsg: Message = { id: `iris-${Date.now()}`, sender: "iris", text: res.message_iris, timestamp: new Date() };
      setMessages((prev) => [...prev, irisMsg]);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("quota")) {
        setMessages((prev) => [...prev, { 
          id: "err", sender: "iris", 
          text: "Vous avez atteint votre quota mensuel de questions avec IRIS. L'accès illimité au coach est réservé aux abonnés Premium.", 
          timestamp: new Date(),
          isPremiumCTA: true 
        }]);
      } else {
        setMessages((prev) => [...prev, { id: "err", sender: "iris", text: "IRIS est temporairement indisponible.", timestamp: new Date() }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Do not display during survey evaluations to prevent distraction
  if (pathname?.startsWith("/questionnaire")) return null;

  return (
    <>
      {/* ── 1. BOUTON DÉCLENCHEUR FLOTTANT (STANDARDS SAAS : EN BAS À DROITE QUAND FERMÉ) ── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-50 w-14 h-14 sm:w-[58px] sm:h-[58px] rounded-full bg-[#5965E8] hover:bg-[#4853d6] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(89,101,232,0.42)] border-none cursor-pointer hover:scale-105 active:scale-95 transition-all p-0 group"
          aria-label="Ouvrir Coach IRIS"
          title="Coach IRIS — Intelligence Relationnelle"
        >
          {/* Logo IRIS avec marge intérieure minimale pour une visibilité optimale */}
          <div className="w-10 h-10 flex items-center justify-center">
            <IrisMark size={40} monochrome className="transition-transform group-hover:scale-105" />
          </div>

          {/* Pastille verte de statut actif */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-xs" />

          {/* Infobulle d'accueil au survol sur desktop */}
          <span className="hidden sm:inline-flex items-center gap-1.5 absolute right-16 top-1/2 -translate-y-1/2 bg-white text-[#123D46] px-3.5 py-1.5 rounded-full shadow-lg border border-[#E3EBE6] text-xs font-jakarta font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span>Coach IRIS IA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
        </button>
      )}

      {/* ── 2. CARTE CHAT FLOTTANTE (STANDARDS INTERCOM / CRISP : ANCRÉE EN BAS À DROITE) ── */}
      {isOpen && (
        <div 
          ref={widgetRef}
          className="fixed bottom-5 sm:bottom-6 right-3 sm:right-6 z-50 w-[410px] max-w-[calc(100vw-1.5rem)] h-[620px] max-h-[calc(100vh-5rem)] bg-white rounded-3xl shadow-2xl flex flex-col border border-[#E3EBE6] overflow-hidden transition-all duration-200 animate-scale-in"
          role="dialog"
          aria-label="Coach IRIS"
        >
          {/* HEADER PREMIUM AUX COULEURS DE LINKOFFICE */}
          <div className="p-4 sm:p-5 border-b border-[#E3EBE6] bg-gradient-to-r from-[#123D46] to-[#1E3048] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <IrisMark size={32} monochrome isAnimated={true} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-jakarta font-extrabold text-sm sm:text-base text-white m-0">
                    Coach IRIS
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-[#E3EBE6]/80 font-inter m-0">
                  Intelligence Relationnelle · En ligne
                </p>
              </div>
            </div>

            {/* Actions de contrôle standard */}
            <div className="flex items-center gap-1.5">
              <button 
                type="button"
                onClick={handleResetChat}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
                title="Recommencer la discussion"
                aria-label="Recommencer"
              >
                <RefreshCw size={13} />
              </button>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
                title="Fermer IRIS (Échap)"
                aria-label="Fermer Coach IRIS"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ONGLET TABS BAR (Si connecté) */}
          {session?.user?.id && (
            <div className="bg-[#FAF9F5] border-b border-[#E3EBE6] px-4 py-2 flex items-center gap-2 text-xs shrink-0">
              <button
                type="button"
                onClick={() => handleTabSwitch("coach")}
                className={`flex-1 py-1.5 px-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${activeTab === "coach" ? "bg-white text-[#123D46] shadow-xs border border-[#E3EBE6]" : "text-[#123D46]/60 hover:text-[#123D46]"}`}
              >
                <MessageCircle size={14} /> Coach
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch("explication")}
                className={`flex-1 py-1.5 px-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${activeTab === "explication" ? "bg-white text-[#123D46] shadow-xs border border-[#E3EBE6]" : "text-[#123D46]/60 hover:text-[#123D46]"}`}
              >
                <FileText size={14} /> Analyse
              </button>
            </div>
          )}

          {/* ZONE DE CONTENU / MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white">
            
            {/* ONGLET 2: EXPLICATION & DÉCODAGE DES RÉSULTATS */}
            {activeTab === "explication" && session?.user?.id && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3EBE6]">
                  <div>
                    <h4 className="font-jakarta font-bold text-sm text-[#123D46] m-0">
                      Analyse de votre profil
                    </h4>
                    <p className="text-[11px] text-[#123D46]/60 font-inter m-0">
                      Décodage personnalisé selon vos réponses IQRH
                    </p>
                  </div>
                </div>

                {explicationLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <span className="w-6 h-6 border-2 border-[#00A99D] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[#123D46]/60 font-inter">Génération de l'analyse par IRIS...</span>
                  </div>
                ) : explication ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#F4F1E8]/60 border border-[#E3EBE6] text-xs sm:text-[13px] text-[#123D46] leading-relaxed font-inter">
                      {formatText(explication)}
                    </div>
                    <button 
                      type="button"
                      onClick={() => loadExplication(true)} 
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-white border border-[#E3EBE6] hover:bg-[#FAF9F5] text-[#123D46] font-jakarta font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <RefreshCw size={14} /> Actualiser l'analyse
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => loadExplication(false)} 
                    className="w-full py-2.5 px-5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    Obtenir mon analyse IRIS
                  </button>
                )}
              </div>
            )}

            {/* ONGLET 1: COACHING CONVERSATIONNEL */}
            {activeTab === "coach" && (
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed font-inter ${
                        msg.sender === "user"
                          ? "bg-[#00A99D] text-white rounded-br-xs shadow-xs"
                          : "bg-[#FAF9F5] border border-[#E3EBE6] text-[#123D46] rounded-bl-xs"
                      }`}
                    >
                      {formatText(msg.text)}
                      
                      {msg.isPremiumCTA && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              if (!session) router.push('/#iqrh');
                              else router.push('/premium');
                            }}
                            className="w-full py-2 text-xs rounded-full bg-[#123D46] hover:bg-[#1E3048] text-white font-jakarta font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            {!session ? "Faire mon test gratuit →" : "Découvrir Premium →"}
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#123D46]/40 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                
                {/* Suggestions rapides (chips standard) quand la conversation débute */}
                {messages.length <= 1 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider block">
                      Questions fréquentes
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(prompt)}
                          className="text-left p-2.5 px-3.5 rounded-2xl bg-[#FAF9F5] hover:bg-[#00A99D]/10 hover:text-[#00A99D] border border-[#E3EBE6] text-xs font-jakarta font-semibold text-[#123D46]/80 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <span>{prompt}</span>
                          <span className="text-[#00A99D] opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loading && (
                   <div className="flex items-center gap-2 text-xs text-[#00A99D] p-3 bg-[#FAF9F5] rounded-xl w-fit">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] animate-ping" />
                     <span className="font-inter">IRIS réfléchit...</span>
                   </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ZONE DE SAISIE */}
          {activeTab === "coach" && (
            <div className="p-3 sm:p-4 border-t border-[#E3EBE6] bg-white shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(input); }}
                  placeholder="Posez une question sur vos dynamiques relationnelles..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-full border border-[#E3EBE6] text-xs focus:outline-none focus:border-[#00A99D] text-[#123D46] bg-[#FAF9F5] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 h-auto cursor-pointer"
                >
                  <Send size={13} />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
