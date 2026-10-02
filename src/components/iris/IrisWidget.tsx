"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Send, X, MessageCircle, FileText, RefreshCw } from "lucide-react";
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

export function IrisWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Effet pour basculer le contenu du tableau de bord vers la gauche
  useEffect(() => {
    const mainElements = document.querySelectorAll('main');
    if (isOpen) {
      mainElements.forEach(el => {
        el.style.paddingRight = "400px";
        el.style.transition = "padding-right 0.3s ease";
      });
    } else {
      mainElements.forEach(el => el.style.paddingRight = "");
    }
    return () => {
      mainElements.forEach(el => el.style.paddingRight = "");
    };
  }, [isOpen]);
  
  const [explicationLoading, setExplicationLoading] = useState(false);
  const [explication, setExplication] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"coach" | "explication">("coach");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("iris-open");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      document.body.classList.remove("iris-open");
    }
    
    return () => {
      document.body.classList.remove("iris-open");
    };
  }, [messages, isOpen, activeTab]);

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
    if (!session?.user?.id || conversationId) return; // Start only once
    setLoading(true);
    try {
      const conv = await startIrisConversation(session.user.id);
      setConversationId(conv.conversation_id);
      setMessages([{
        id: "welcome",
        sender: "iris",
        text: "Bonjour ! Je suis IRIS, votre coach relationnel. J'ai analysé vos résultats. Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date(),
      }]);
    } catch {
      setMessages([{ id: "err", sender: "iris", text: "IRIS est indisponible pour le moment.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "coach" && !conversationId) startChat();
      if (activeTab === "explication" && !explication) loadExplication();
    }
  }, [isOpen, activeTab, conversationId, explication, session?.user?.id]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const handleTabSwitch = (tab: "coach" | "explication") => {
    setActiveTab(tab);
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId || loading) return;
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    const text = input;
    setInput("");
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
      const res = await sendIrisMessage(conversationId, text, history);
      const irisMsg: Message = { id: `iris-${Date.now()}`, sender: "iris", text: res.message_iris, timestamp: new Date() };
      setMessages((prev) => [...prev, irisMsg]);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("quota")) {
        setMessages((prev) => [...prev, { 
          id: "err", sender: "iris", 
          text: "Vous avez atteint votre limite mensuelle de messages avec IRIS. L'accès illimité au coach est réservé aux abonnés Premium.", 
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

  if (!session?.user?.id) return null;
  if (!pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      {/* BOUTON FLOTTANT (Visible seulement si le widget est fermé) */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-[#5965E8] text-white flex items-center justify-center shadow-[0_8px_32px_rgba(89,101,232,0.3)] border-none cursor-pointer hover:scale-105 transition-transform"
        >
          <IrisMark size={32} monochrome />
        </button>
      )}

      {/* FENÊTRE DU WIDGET (SIDEBAR) */}
      {isOpen && (
        <div 
          className="fixed top-[76px] sm:top-[84px] right-0 bottom-0 w-[400px] max-w-full z-30 bg-white shadow-2xl flex flex-col border-l border-[#E3EBE6] transition-transform duration-300"
          style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        >
          {/* HEADER */}
          <div className="p-5 border-b border-[#E3EBE6] bg-gradient-to-r from-[#123D46] to-[#1E3048] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/10 rounded-xl border border-white/20">
                <IrisMark size={36} isAnimated={true} monochrome />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-jakarta font-extrabold text-base text-white m-0">
                    Coach IRIS
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-[#E3EBE6]/80 font-inter m-0">
                  Intelligence Relationnelle & Analyse
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm font-bold border-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* TABS BAR (Replacing Camille summary bar) */}
          <div className="bg-[#FAF9F5] border-b border-[#E3EBE6] px-5 py-2.5 flex items-center gap-2 text-xs">
            <button
              onClick={() => handleTabSwitch("coach")}
              className={`flex-1 py-1.5 px-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "coach" ? "bg-white text-[#123D46] shadow-xs border border-[#E3EBE6]" : "text-[#123D46]/60 hover:text-[#123D46]"}`}
            >
              <MessageCircle size={14} /> Coach
            </button>
            <button
              onClick={() => handleTabSwitch("explication")}
              className={`flex-1 py-1.5 px-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "explication" ? "bg-white text-[#123D46] shadow-xs border border-[#E3EBE6]" : "text-[#123D46]/60 hover:text-[#123D46]"}`}
            >
              <FileText size={14} /> Analyse
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
            
            {/* ONGLET: EXPLICATION */}
            {activeTab === "explication" && (
              <div className="flex flex-col h-full">
                {explicationLoading ? (
                  <div className="flex flex-col items-center gap-3 pt-10 opacity-50">
                    <div className="w-6 h-6 border-2 border-[#5965E8] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[13px] text-[#123D46]/60 font-inter">Analyse en cours...</span>
                  </div>
                ) : explication ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-[13px] text-[#123D46] leading-relaxed font-inter bg-[#F4F1E8]/70 border border-[#E3EBE6] p-4 rounded-2xl">
                      {formatText(explication)}
                    </div>
                    <button 
                      onClick={() => loadExplication(true)} 
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#E3EBE6] hover:bg-[#FAF9F5] text-[#123D46] font-jakarta font-semibold text-xs transition-colors"
                    >
                      <RefreshCw size={14} /> Actualiser l'analyse
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => loadExplication(false)} 
                    className="w-full py-2.5 px-4 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-colors shadow-xs"
                  >
                    Obtenir mon analyse IRIS
                  </button>
                )}
              </div>
            )}

            {/* ONGLET: COACH (CHAT) */}
            {activeTab === "coach" && (
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed font-inter ${
                        msg.sender === "user"
                          ? "bg-[#00A99D] text-white rounded-br-xs shadow-xs"
                          : "bg-[#F4F1E8]/70 border border-[#E3EBE6] text-[#123D46] rounded-bl-xs"
                      }`}
                    >
                      {formatText(msg.text)}
                      
                      {msg.isPremiumCTA && (
                        <div className="mt-3">
                          <button className="w-full py-1.5 text-[11px] rounded-full bg-[#123D46] hover:bg-[#1E3048] text-white font-bold transition-colors">
                            Découvrir Premium
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#123D46]/40 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                
                {loading && (
                   <div className="flex items-center gap-2 text-xs text-[#00A99D] p-3 bg-[#F4F1E8]/50 rounded-xl w-fit">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] animate-ping" />
                     <span className="font-inter">IRIS réfléchit...</span>
                   </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* INPUT AREA (Uniquement pour le Coach) */}
          {activeTab === "coach" && (
            <div className="p-4 border-t border-[#E3EBE6] bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  placeholder="Posez une question sur vos dynamiques relationnelles..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-xs focus:outline-none focus:border-[#00A99D] text-[#123D46] bg-white disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2.5 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-auto"
                >
                  <Send size={14} /> Envoyer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
