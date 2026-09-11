"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Brain, Send, X, MessageCircle, Sparkles, User, FileText, RefreshCw } from "lucide-react";
import { startIrisConversation, sendIrisMessage, getIrisExplication } from "@/lib/api";

const formatText = (text: string) => {
  if (!text) return null;
  return text.split("\n").map((line, idx, array) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={idx}>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} style={{ color: "#f8fafc", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
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

  // Les retours anticipés doivent être placés APRÈS tous les hooks (useEffect, useState)
  if (!session?.user?.id) return null;
  if (isAuthPage || pathname === "/") return null;

  return (
    <>
      {/* BOUTON FLOTTANT (Visible seulement si le widget est fermé) */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(124, 58, 237, 0.4)",
            border: "none", cursor: "pointer", transition: "transform 0.2s",
          }}
        >
          <Brain size={24} />
        </button>
      )}

      {/* FENÊTRE DU WIDGET (SIDEBAR) */}
      {isOpen && (
        <div style={{
        position: "fixed", top: 64, right: 0, bottom: 0, width: 400, zIndex: 40,
        background: "rgba(11,15,25,0.95)", backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(124,58,237,0.2)",
        display: "flex", flexDirection: "column",
        boxShadow: "-10px 0 40px rgba(0,0,0,0.5)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
          {/* HEADER */}
          <div style={{
            padding: "24px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", flexDirection: "column", gap: 20,
            background: "rgba(124, 58, 237, 0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, background: "rgba(124, 58, 237, 0.2)", borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Brain size={20} color="#a855f7" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", margin: 0 }}>IRIS</h3>
                  <p style={{ fontSize: 12, color: "#a78bfa", margin: 0 }}>Coach Relationnel IA</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ 
                  background: "transparent", border: "none", color: "#94a3b8", 
                  cursor: "pointer", padding: 8, display: "flex", borderRadius: 8,
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                <X size={20} />
              </button>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: 8, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 12 }}>
              <button
                onClick={() => handleTabSwitch("coach")}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  background: activeTab === "coach" ? "rgba(124,58,237,0.3)" : "transparent",
                  color: activeTab === "coach" ? "#fff" : "#94a3b8",
                  fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <MessageCircle size={14} /> Coach
              </button>
              <button
                onClick={() => handleTabSwitch("explication")}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  background: activeTab === "explication" ? "rgba(124,58,237,0.3)" : "transparent",
                  color: activeTab === "explication" ? "#fff" : "#94a3b8",
                  fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <FileText size={14} /> Analyse
              </button>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            
            {/* TONGLET: EXPLICATION */}
            {activeTab === "explication" && (
              <div style={{ padding: 24 }}>
                {explicationLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 40, opacity: 0.5 }}>
                    <div style={{ width: 24, height: 24, border: "2px solid #a855f7", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>Analyse en cours...</span>
                  </div>
                ) : explication ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                      {formatText(explication)}
                    </div>
                    <button 
                      onClick={() => loadExplication(true)} 
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        width: "100%", padding: "10px 0", borderRadius: 12,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#f8fafc"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#94a3b8"; }}
                    >
                      <RefreshCw size={14} /> Actualiser l'analyse
                    </button>
                  </div>
                ) : (
                  <button onClick={() => loadExplication(false)} className="btn btn-primary" style={{ width: "100%" }}>
                    Obtenir mon analyse IRIS
                  </button>
                )}
              </div>
            )}

            {/* TONGLET: COACH (CHAT) */}
            {activeTab === "coach" && (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{
                    display: "flex", gap: 12,
                    alignItems: "flex-start",
                    flexDirection: msg.sender === "user" ? "row-reverse" : "row"
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: msg.sender === "iris" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {msg.sender === "iris" ? <Brain size={14} color="#a855f7" /> : <User size={14} color="#cbd5e1" />}
                    </div>
                    
                    <div style={{
                      background: msg.sender === "user" ? "#7c3aed" : "rgba(30, 41, 59, 0.8)",
                      border: msg.sender === "iris" ? "1px solid rgba(255,255,255,0.05)" : "none",
                      padding: "10px 14px", borderRadius: 16,
                      borderTopLeftRadius: msg.sender === "iris" ? 4 : 16,
                      borderTopRightRadius: msg.sender === "user" ? 4 : 16,
                      fontSize: 13, color: "#f8fafc", lineHeight: 1.5,
                      maxWidth: "85%",
                    }}>
                      {formatText(msg.text)}
                      
                      {msg.isPremiumCTA && (
                        <div style={{ marginTop: 12 }}>
                          <button className="btn btn-primary" style={{ width: "100%", padding: "6px 0", fontSize: 12 }}>
                            Découvrir Premium
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                   <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                     <div style={{ width: 28, height: 28, background: "rgba(124,58,237,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Brain size={14} color="#a855f7" />
                     </div>
                     <div style={{ background: "rgba(30, 41, 59, 0.8)", padding: "12px 16px", borderRadius: 16, borderTopLeftRadius: 4, display: "flex", gap: 4 }}>
                       <span style={{ width: 6, height: 6, background: "#a855f7", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                       <span style={{ width: 6, height: 6, background: "#a855f7", borderRadius: "50%", animation: "pulse 1.5s infinite 0.2s" }} />
                       <span style={{ width: 6, height: 6, background: "#a855f7", borderRadius: "50%", animation: "pulse 1.5s infinite 0.4s" }} />
                     </div>
                   </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* INPUT AREA (Uniquement pour le Coach) */}
          {activeTab === "coach" && (
            <div style={{
              padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(15, 23, 42, 0.95)",
            }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  placeholder="Écrivez à IRIS..."
                  disabled={loading}
                  style={{
                    flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20, padding: "10px 16px", color: "#f8fafc", fontSize: 13,
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 40, height: 40, borderRadius: "50%", border: "none",
                    background: input.trim() && !loading ? "#7c3aed" : "rgba(255,255,255,0.1)",
                    color: input.trim() && !loading ? "#fff" : "#64748b",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <Send size={16} style={{ marginLeft: input.trim() && !loading ? 2 : 0 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}} />
    </>
  );
}
