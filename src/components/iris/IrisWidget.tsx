"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Send, X, MessageCircle, FileText, RefreshCw } from "lucide-react";
import { startIrisConversation, sendIrisMessage, getIrisExplication, getActiveIrisConversation } from "@/lib/api";
import { IrisMark } from "@/components/brand/IrisLogo";
import { useIris } from "@/src/context/IrisContext";

/**
 * Règles typographiques françaises : insère des espaces insécables avant les ponctuations doubles (: ; ? !)
 * et après/avant les guillemets « ».
 */
function applyFrenchTypography(text: string): string {
  return text
    .replace(/\s+([:;?!»])/g, "\u00A0$1")
    .replace(/([«])\s+/g, "$1\u00A0");
}

function renderInline(
  text: string,
  isUser: boolean,
  onNavigate: (url: string) => void
) {
  if (!text) return null;

  // Découpage des liens [label](url), gras **bold**, italique *italic*, et code `code`
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*[^*]+?\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    // Gras **texte**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className={`font-bold ${isUser ? "text-white" : "text-[#123D46]"}`}>
          {applyFrenchTypography(part.slice(2, -2))}
        </strong>
      );
    }

    // Lien [label](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const isInternal = url.startsWith("/");
      if (isInternal) {
        return (
          <button
            key={i}
            type="button"
            onClick={() => onNavigate(url)}
            className="text-[#00A99D] underline font-bold hover:text-[#199E9A] transition-colors cursor-pointer inline p-0 bg-transparent border-none text-left"
          >
            {applyFrenchTypography(label)}
          </button>
        );
      }
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00A99D] underline font-bold hover:text-[#199E9A] transition-colors inline"
        >
          {applyFrenchTypography(label)}
        </a>
      );
    }

    // Italique *texte*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 3) {
      return (
        <em key={i} className="italic">
          {applyFrenchTypography(part.slice(1, -1))}
        </em>
      );
    }

    // Code inline `texte`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 3) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Texte brut avec typographie française
    return <span key={i}>{applyFrenchTypography(part)}</span>;
  });
}

function FormattedIrisContent({
  content,
  isUser,
  onNavigate,
}: {
  content: string;
  isUser: boolean;
  onNavigate: (url: string) => void;
}) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let idx = 0;
  while (idx < lines.length) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      idx++;
      continue;
    }

    // 1. Titre H3/H2: ### ou ##
    if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
      const titleText = trimmed.replace(/^#{2,3}\s+/, "");
      elements.push(
        <h4
          key={`h-${idx}`}
          className={`font-jakarta font-bold text-xs sm:text-[13px] mt-2.5 mb-1 flex items-center gap-1.5 ${
            isUser ? "text-white" : "text-[#123D46]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] inline-block shrink-0" />
          <span>{renderInline(titleText, isUser, onNavigate)}</span>
        </h4>
      );
      idx++;
      continue;
    }

    // 2. Citation / Callout: >
    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed.slice(2);
      elements.push(
        <div
          key={`q-${idx}`}
          className="my-2 p-2.5 px-3 rounded-xl bg-[#00A99D]/8 border-l-2 border-[#00A99D] text-xs leading-relaxed text-[#123D46] font-medium"
        >
          {renderInline(quoteText, isUser, onNavigate)}
        </div>
      );
      idx++;
      continue;
    }

    // 3. Liste numérotée: 1. ... 2. ...
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const itemText = numberedMatch[2];
      elements.push(
        <div key={`num-${idx}`} className="flex items-start gap-2.5 my-1.5">
          <span
            className={`shrink-0 w-5 h-5 rounded-full font-jakarta font-extrabold text-[10px] flex items-center justify-center mt-0.5 ${
              isUser
                ? "bg-white/20 text-white"
                : "bg-[#00A99D]/12 text-[#00A99D]"
            }`}
          >
            {num}
          </span>
          <div className="flex-1 leading-relaxed text-xs sm:text-[13px]">
            {renderInline(itemText, isUser, onNavigate)}
          </div>
        </div>
      );
      idx++;
      continue;
    }

    // 4. Liste à puces: - , * , •
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const itemText = trimmed.replace(/^[-*•]\s+/, "");
      elements.push(
        <div key={`bullet-${idx}`} className="flex items-start gap-2.5 my-1.5">
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#00A99D] mt-2" />
          <div className="flex-1 leading-relaxed text-xs sm:text-[13px]">
            {renderInline(itemText, isUser, onNavigate)}
          </div>
        </div>
      );
      idx++;
      continue;
    }

    // 5. Paragraphe standard
    elements.push(
      <p key={`p-${idx}`} className="my-1.5 leading-relaxed text-xs sm:text-[13px]">
        {renderInline(trimmed, isUser, onNavigate)}
      </p>
    );
    idx++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

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
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const { isOpen, setIsOpen, activeTab, setActiveTab } = useIris();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [explicationLoading, setExplicationLoading] = useState(false);
  const [explication, setExplication] = useState<string | null>(null);
  
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
      // On mobile screens (< 1024px), clicking outside closes the drawer
      if (window.innerWidth < 1024 && widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
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

  const handleNavigate = useCallback((url: string) => {
    setIsOpen(false);
    router.push(url);
  }, [router, setIsOpen]);

  const startChat = async () => {
    if (!session?.user?.id) {
      // Message de bienvenue pour visiteur non connecté
      if (messages.length === 0) {
        setMessages([{
          id: "welcome-guest",
          sender: "iris",
          text: "Bonjour ! Je suis IRIS, l'intelligence relationnelle de Link Office. Je suis là pour vous faire découvrir notre méthodologie, répondre à vos questions sur l'IQRH et vous guider dans l'amélioration de vos relations.",
          timestamp: new Date(),
        }]);
      }
      return;
    }
    
    if (conversationId && messages.length > 0) return;
    setLoading(true);
    try {
      // 1. Tenter de restaurer la conversation active (dialogue continu persistant)
      const activeRes = await getActiveIrisConversation();
      if (activeRes?.conversation?.id && activeRes.conversation.messages.length > 0) {
        setConversationId(activeRes.conversation.id);
        setMessages(activeRes.conversation.messages.map(m => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          timestamp: new Date(m.timestamp),
        })));
        return;
      }

      // 2. Sinon, initialiser une nouvelle session propre
      const conv = await startIrisConversation(session.user.id);
      setConversationId(conv.conversation_id);
      const userName = session.user.name?.trim();
      const welcomeText = userName
        ? `Bonjour ${userName} ! Je suis IRIS, votre coach relationnel. J'ai analysé vos indicateurs et vos dynamiques d'équipe. Comment puis-je vous accompagner aujourd'hui ?`
        : "Bonjour ! Je suis IRIS, votre coach relationnel. J'ai analysé vos indicateurs et vos dynamiques d'équipe. Comment puis-je vous accompagner aujourd'hui ?";

      setMessages([{
        id: "welcome",
        sender: "iris",
        text: welcomeText,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages([{ id: "err", sender: "iris", text: "IRIS est momentanément indisponible. Veuillez réessayer dans quelques instants.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = async () => {
    if (!session?.user?.id) {
      setMessages([]);
      startChat();
      return;
    }
    setLoading(true);
    try {
      const conv = await startIrisConversation(session.user.id);
      setConversationId(conv.conversation_id);
      const userName = session.user.name?.trim();
      const welcomeText = userName
        ? `Bonjour ${userName} ! Je suis IRIS, votre coach relationnel. J'ai réinitialisé notre échange. Comment puis-je vous accompagner aujourd'hui ?`
        : "Bonjour ! Je suis IRIS, votre coach relationnel. J'ai réinitialisé notre échange. Comment puis-je vous accompagner aujourd'hui ?";

      setMessages([{
        id: `welcome-${Date.now()}`,
        sender: "iris",
        text: welcomeText,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages([{ id: "err", sender: "iris", text: "Impossible de réinitialiser la discussion pour le moment.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
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
        let reply = "L'IQRH (Indice de Qualité Relationnelle et Humaine) est un score scientifique sur 100 mesurant l'équilibre de vos 5 dimensions de vie : sociale, affective, sentimentale, professionnelle et personnelle. Pour obtenir votre diagnostic individuel précis, passez le test en 8 à 10 minutes !";
        
        const lower = trimmed.toLowerCase();
        if (lower.includes("dimension") || lower.includes("5")) {
          reply = "Les 5 dimensions Link Office sont :\n\n1. **Dimension Sociale** : Réseau élargi, sentiment d'appartenance et liens faibles protecteurs au quotidien.\n2. **Dimension Affective** : Liens de confiance profonde, écoute sincère et soutien émotionnel des pairs.\n3. **Vie Sentimentale / Intime** : Sphère privée, sécurité et équilibre affectif personnel.\n4. **Vie Professionnelle** : Coopération, sécurité psychologique, reconnaissance et équité managériale.\n5. **Relation à Soi** : Écoute de ses limites, auto-bienveillance et prévention de la charge mentale.";
        } else if (lower.includes("organisation") || lower.includes("entreprise") || lower.includes("pro") || lower.includes("équipe") || lower.includes("solution")) {
          reply = "Link Office propose aux organisations un accompagnement complet :\n\n• **Baromètre d'équipe anonyme** (k-anonymat strict dès 5 répondants) pour mesurer le climat social.\n• **Programme Binôme Relationnel** pour briser les silos et favoriser l'entraide.\n• **Plans d'actions RH & managériaux** pour prévenir les RPS et améliorer la QVCT.\n• **Portails dédiés** : B2B (entreprises), B2G (collectivités) et B2B2C (mutuelles/assurances).";
        } else if (lower.includes("iris") || lower.includes("coach") || lower.includes("ia") || lower.includes("fonctionne")) {
          reply = "En tant que coach d'intelligence relationnelle, mon accompagnement repose sur 4 piliers :\n\n1. **Analyse personnalisée** de votre bilan IQRH pour révéler vos forces et axes de progression.\n2. **Ordonnance Relationnelle sur-mesure** avec des recommandations et micro-défis hebdomadaires progressifs.\n3. **Accompagnement continu** pour surmonter des blocages, préparer des discussions difficiles ou désamorcer des tensions.\n4. **Validation des défis** et suivi gamifié de votre progression.";
        } else if (lower.includes("calcul") || lower.includes("score") || lower.includes("iqrh")) {
          reply = "Votre score IQRH (0 à 100) est calculé à partir du questionnaire psychométrique Link Office (~8 à 10 minutes). Il évalue vos comportements et ressentis à travers les 5 dimensions fondamentales, complété par l'ICR (Complexité), l'IER (Équilibre) et votre Météo relationnelle.";
        }

        setMessages((prev) => [...prev, {
          id: `iris-guest-${Date.now()}`,
          sender: "iris",
          text: reply,
          timestamp: new Date(),
          isPremiumCTA: true,
        }]);
        setLoading(false);
      }, 500);
      return;
    }

    let activeConvId = conversationId;
    setLoading(true);
    try {
      if (!activeConvId && session?.user?.id) {
        const conv = await startIrisConversation(session.user.id);
        activeConvId = conv.conversation_id;
        setConversationId(activeConvId);
      }

      if (activeConvId) {
        const history = messages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
        const res = await sendIrisMessage(activeConvId, trimmed, history);
        const irisMsg: Message = { id: `iris-${Date.now()}`, sender: "iris", text: res.message_iris, timestamp: new Date() };
        setMessages((prev) => [...prev, irisMsg]);
      } else {
        throw new Error("CONVERSATION_INIT_FAILED");
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("quota")) {
        setMessages((prev) => [...prev, { 
          id: "err", sender: "iris", 
          text: "Vous avez atteint votre quota journalier de questions avec IRIS (5 messages / jour). L'accès illimité au coach est réservé aux abonnés Premium.", 
          timestamp: new Date(),
          isPremiumCTA: true 
        }]);
      } else {
        // En cas de coupure réseau, fournir une réponse de haute qualité cohérente avec Link Office
        let fallbackReply = "Je reste à votre entière disposition pour vous accompagner dans votre équilibre relationnel. N'hésitez pas à explorer vos micro-défis du jour ou à me poser une autre question !";
        const lower = trimmed.toLowerCase();
        if (lower.includes("dimension") || lower.includes("5")) {
          fallbackReply = "Les 5 dimensions du climat relationnel Link Office sont :\n\n1. **Dimension Sociale** : Réseau relationnel élargi, inclusion, sentiment d'appartenance et liens faibles protecteurs au quotidien.\n2. **Dimension Affective** : Liens de confiance profonde, écoute sincère et soutien émotionnel des pairs.\n3. **Vie Sentimentale / Intime** : Sphère privée, sécurité et équilibre affectif personnel.\n4. **Vie Professionnelle** : Coopération, sécurité psychologique, reconnaissance et équité managériale.\n5. **Relation à Soi** : Écoute de ses propres limites, auto-bienveillance et prévention de la charge mentale.";
        } else if (lower.includes("organisation") || lower.includes("entreprise") || lower.includes("pro") || lower.includes("équipe") || lower.includes("solution")) {
          fallbackReply = "Link Office propose aux organisations :\n\n• **Baromètre d'équipe et Climat Social** : Mesure du bien-être relationnel 100% anonymisée (k-anonymat strict dès 5 répondants).\n• **Programme Binôme Relationnel** : Mise en relation de pairs pour briser les silos et favoriser l'entraide.\n• **Plans d'actions RH & managériaux** : Prévention active des RPS et amélioration de la QVCT.\n• **Portails dédiés** : B2B (entreprises), B2G (collectivités) et B2B2C (mutuelles et réseaux de santé).";
        } else if (lower.includes("iris") || lower.includes("coach") || lower.includes("ia") || lower.includes("fonctionne")) {
          fallbackReply = "En tant que coach d'intelligence relationnelle, mon rôle est de vous guider pas à pas :\n\n1. **Analyse de votre bilan IQRH** pour identifier vos forces et leviers d'amélioration.\n2. **Génération d'une Ordonnance Relationnelle** avec des recommandations et micro-défis hebdomadaires progressifs.\n3. **Dialogue continu** pour surmonter des blocages, préparer des discussions difficiles ou désamorcer des tensions.\n4. **Validation des défis** et suivi gamifié de votre progression.";
        } else if (lower.includes("calcul") || lower.includes("score") || lower.includes("iqrh")) {
          fallbackReply = "Votre score IQRH (0 à 100) est issu de notre évaluation psychométrique (~8 à 10 minutes). Il évalue vos comportements et ressentis à travers les 5 dimensions fondamentales, complété par l'ICR (Complexité), l'IER (Équilibre) et votre Météo relationnelle.";
        }

        setMessages((prev) => [...prev, { id: `iris-fallback-${Date.now()}`, sender: "iris", text: fallbackReply, timestamp: new Date() }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Le widget IRIS ne s'affiche que si l'utilisateur est connecté
  if (status !== "authenticated" || !session?.user) return null;

  // Ne pas afficher pendant les évaluations de questionnaire pour éviter la distraction
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

      {/* ── 2. PANNEAU LATÉRAL INCORPORÉ (DOCK LATÉRAL : S'INCORPORE DANS LA PAGE PENDANT QUE LE CONTENU BASCULE À GAUCHE) ── */}
      {isOpen && (
        <aside 
          ref={widgetRef}
          className="fixed top-0 right-0 z-50 w-full sm:w-[420px] h-screen bg-white shadow-2xl flex flex-col border-l border-[#E3EBE6] overflow-hidden transition-transform duration-300 ease-in-out"
          role="dialog"
          aria-label="Coach IRIS"
        >
          {/* HEADER PREMIUM AUX COULEURS DE LINKOFFICE (Hauteur alignée au pixel près sur la navbar = 65px) */}
          <div className="h-[65px] min-h-[65px] max-h-[65px] px-4 sm:px-5 border-b border-[#E3EBE6] bg-gradient-to-r from-[#123D46] to-[#1E3048] text-white flex items-center justify-between shrink-0 box-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <IrisMark size={24} monochrome isAnimated={true} />
              </div>
              <div>
                <div className="flex items-center gap-2 leading-none">
                  <h3 className="font-jakarta font-extrabold text-sm text-white m-0 leading-tight">
                    Coach IRIS
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-[#E3EBE6]/80 font-inter m-0 leading-tight mt-0.5">
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
                    <span className="text-xs text-[#123D46]/60 font-inter">{"Génération de l'analyse par IRIS..."}</span>
                  </div>
                ) : explication ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#F4F1E8]/60 border border-[#E3EBE6] text-xs sm:text-[13px] text-[#123D46] leading-relaxed font-inter">
                      <FormattedIrisContent content={explication} isUser={false} onNavigate={handleNavigate} />
                    </div>
                    <button 
                      type="button"
                      onClick={() => loadExplication(true)} 
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-full bg-white border border-[#E3EBE6] hover:bg-[#FAF9F5] text-[#123D46] font-jakarta font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <RefreshCw size={14} /> {"Actualiser l'analyse"}
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
                      className={`${
                        msg.sender === "user" ? "max-w-[85%]" : "max-w-[92%]"
                      } p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed font-inter ${
                        msg.sender === "user"
                          ? "bg-[#00A99D] text-white rounded-br-xs shadow-xs"
                          : "bg-[#FAF9F5] border border-[#E3EBE6] text-[#123D46] rounded-bl-xs shadow-2xs"
                      }`}
                    >
                      <FormattedIrisContent
                        content={msg.text}
                        isUser={msg.sender === "user"}
                        onNavigate={handleNavigate}
                      />
                      
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
        </aside>
      )}
    </>
  );
}
