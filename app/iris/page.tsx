/**
 * /iris/page.tsx — Interface Chat IRIS (Coach + Explication)
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Brain, Send, Sparkles, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { startIrisConversation, sendIrisMessage, getIrisExplication } from "@/lib/api";
import Link from "next/link";

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

export default function IRISPage() {
  const { data: session } = useSession();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [explicationLoading, setExplicationLoading] = useState(false);
  const [explication, setExplication] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"explication" | "coach">("explication");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadExplication = async () => {
    if (!session?.user?.id) return;
    setExplicationLoading(true);
    try {
      const res = await getIrisExplication(session.user.id);
      setExplication(res.explication);
    } catch {
      setExplication("IRIS n'est pas disponible pour le moment. Veuillez réessayer plus tard.");
    } finally {
      setExplicationLoading(false);
    }
  };

  const startChat = async () => {
    if (!session?.user?.id) return;
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

  const TAB_STYLE = (active: boolean) => ({
    display: "flex" as const, alignItems: "center" as const, gap: 8,
    padding: "9px 16px", borderRadius: 12,
    fontSize: 13, fontWeight: 500 as const, fontFamily: "inherit",
    cursor: "pointer" as const,
    transition: "all 0.18s",
    border: active ? "1px solid rgba(124,58,237,0.35)" : "1px solid transparent",
    background: active ? "rgba(124,58,237,0.18)" : "transparent",
    color: active ? "#a78bfa" : "#94a3b8",
  });

  return (
    <>
      <Navbar />
      <main className="page-main" style={{
        paddingTop: 88, paddingBottom: 24, paddingLeft: 24, paddingRight: 24,
        display: "flex", flexDirection: "column",
      }}>
        {/* Blobs */}
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div style={{
          maxWidth: 820, margin: "0 auto", width: "100%",
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column",
          height: "calc(100vh - 116px)",
        }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 48, height: 48, background: "rgba(124,58,237,0.2)", borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(124,58,237,0.3)",
              animation: "float 6s ease-in-out infinite",
            }}>
              <Brain style={{ width: 24, height: 24, color: "#a78bfa" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 22, color: "#f8fafc", margin: 0 }}>
                IRIS
              </h1>
              <p style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>
                Intelligence Relationnelle et Introspective pour le Soutien
              </p>
            </div>
            <span style={{
              padding: "4px 12px", borderRadius: 999,
              background: "rgba(124,58,237,0.18)", color: "#a78bfa",
              border: "1px solid rgba(124,58,237,0.3)", fontSize: 12, fontWeight: 500,
            }}>
              IA Active
            </span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button style={TAB_STYLE(activeTab === "explication")} onClick={() => setActiveTab("explication")}>
              <Sparkles style={{ width: 15, height: 15 }} />
              Explication des résultats
            </button>
            <button
              style={TAB_STYLE(activeTab === "coach")}
              onClick={() => { setActiveTab("coach"); if (!conversationId) startChat(); }}
            >
              <MessageCircle style={{ width: 15, height: 15 }} />
              Mode Coach
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* ── Onglet Explication ── */}
            {activeTab === "explication" && (
              <div className="card" style={{
                flex: 1, overflowY: "auto", padding: 32, display: "flex", flexDirection: "column"
              }}>
                {!explication ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
                    <div style={{ fontSize: 52, animation: "float 6s ease-in-out infinite" }}>🧠</div>
                    <p style={{ color: "#94a3b8", textAlign: "center", maxWidth: 380, lineHeight: 1.6, fontSize: 14 }}>
                      IRIS va analyser vos résultats et vous proposer une explication personnalisée.
                    </p>
                    <button
                      onClick={loadExplication}
                      disabled={explicationLoading}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "14px 28px", borderRadius: 14,
                        background: "#7c3aed", color: "white",
                        border: "none", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                        cursor: explicationLoading ? "not-allowed" : "pointer",
                        opacity: explicationLoading ? 0.7 : 1,
                        boxShadow: "0 0 24px rgba(124,58,237,0.35)",
                      }}
                    >
                      {explicationLoading ? (
                        <>
                          <svg style={{ width: 16, height: 16, animation: "spin 0.7s linear infinite" }} viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
                            <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                          </svg>
                          Analyse en cours…
                        </>
                      ) : (
                        <>
                          <Sparkles style={{ width: 16, height: 16 }} />
                          Obtenir mon analyse IRIS
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <div style={{
                        width: 28, height: 28, background: "linear-gradient(135deg, #7c3aed, #0ea5e9)", borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 12px rgba(124,58,237,0.4)"
                      }}>
                        <Brain size={14} color="white" />
                      </div>
                      <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: 14 }}>IRIS</span>
                    </div>
                    <div style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: 14 }}>{formatText(explication)}</div>
                    <button
                      onClick={loadExplication}
                      className="btn-regenerate"
                      style={{
                        marginTop: 20, padding: "8px 16px", borderRadius: 10,
                        background: "transparent", color: "#64748b",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontSize: 12, fontFamily: "inherit", cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Régénérer l'analyse
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Onglet Coach ── */}
            {activeTab === "coach" && (
              <>
                {/* Messages */}
                <div className="card" style={{
                  flex: 1, overflowY: "auto", padding: 20,
                  display: "flex", flexDirection: "column", gap: 16, marginBottom: 14,
                }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex", gap: 12, maxWidth: "85%",
                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                        flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                      }}
                    >
                      {msg.sender === "iris" && (
                        <div style={{
                          width: 32, height: 32, background: "linear-gradient(135deg, #7c3aed, #0ea5e9)", borderRadius: 10,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4,
                          boxShadow: "0 0 16px rgba(124,58,237,0.4)"
                        }}>
                          <Brain style={{ width: 16, height: 16, color: "white" }} />
                        </div>
                      )}
                      <div style={{
                        padding: "12px 16px", borderRadius: 18, fontSize: 14, lineHeight: 1.6,
                        ...(msg.sender === "iris" ? {
                          background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "#e2e8f0", borderTopLeftRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                        } : {
                          background: "linear-gradient(135deg, #7c3aed, #0ea5e9)", color: "white",
                          boxShadow: "0 4px 20px rgba(124,58,237,0.3)", borderTopRightRadius: 4,
                        }),
                      }}>
                        {formatText(msg.text)}
                        {msg.isPremiumCTA && (
                          <div style={{ marginTop: 12 }}>
                            <Link href="/premium" style={{
                              display: "inline-flex", alignItems: "center", gap: 8,
                              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                              color: "#fff", fontWeight: 600, padding: "8px 16px", borderRadius: 10,
                              border: "none", cursor: "pointer", fontSize: 13, textDecoration: "none",
                            }}>
                              Découvrir Premium
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div style={{ display: "flex", gap: 12, maxWidth: "85%", alignSelf: "flex-start" }}>
                      <div style={{ width: 32, height: 32, background: "rgba(124,58,237,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Brain style={{ width: 16, height: 16, color: "#a78bfa" }} />
                      </div>
                      <div style={{ background: "rgba(17,24,39,0.9)", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px", borderRadius: 18, borderTopLeftRadius: 4 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {[0, 150, 300].map((delay) => (
                            <span key={delay} style={{ width: 7, height: 7, background: "#475569", borderRadius: "50%", animation: `bounce-dot 1.2s ${delay}ms ease-in-out infinite` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Posez votre question à IRIS…"
                    disabled={loading || !conversationId}
                    style={{
                      flex: 1, background: "rgba(17,24,39,0.85)", backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14,
                      padding: "13px 18px", color: "#f8fafc", fontSize: 14, fontFamily: "inherit",
                      outline: "none", opacity: (!conversationId || loading) ? 0.5 : 1,
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading || !conversationId}
                    style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: input.trim() && !loading && conversationId ? "#7c3aed" : "rgba(124,58,237,0.25)",
                      border: "none", cursor: input.trim() && !loading && conversationId ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: input.trim() ? "0 0 16px rgba(124,58,237,0.3)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <Send style={{ width: 18, height: 18, color: "white" }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes bounce-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        .btn-regenerate:hover {
          background: rgba(255,255,255,0.05) !important;
          color: #f8fafc !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
      `}</style>
    </>
  );
}
