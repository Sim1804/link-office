import React, { useState } from 'react';
import { IrisMark } from '../brand/IrisLogo';

interface IrisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userScore?: number;
}

interface Message {
  id: string;
  sender: 'iris' | 'user';
  text: string;
  timestamp: string;
}

export const IrisDrawer: React.FC<IrisDrawerProps> = ({
  isOpen,
  onClose,
  userScore = 83
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'iris',
      text: `Bonjour Camille ! Votre indice IQRH global est de ${userScore}/100, ce qui témoigne d'un climat relationnel très sain. Votre point d'appui majeur réside dans vos relations affectives (88/100), tandis que votre dimension « Vie sentimentale » (75/100) ressort comme votre axe de vigilance prioritaire. Sur quel sujet souhaitez-vous échanger aujourd'hui ?`,
      timestamp: 'À l’instant'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    'Comment équilibrer ma vie sentimentale et mes engagements pros ?',
    'Pourquoi mes relations affectives sont-elles ma plus grande force ?',
    'Un rituel simple de 5 minutes pour clarifier mes priorités ?',
    'Comment préserver mon énergie relationnelle cette semaine ?'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'À l’instant'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (query.toLowerCase().includes('sentimentale') || query.toLowerCase().includes('priorités')) {
        reply = `Pour votre dimension sentimentale (75/100), le Laboratoire du Lien Humain préconise le protocole d'« attention sanctuarisée » : définir un moment hebdomadaire non négociable, sans écran ni contraintes logistiques, dédié uniquement à l'écoute mutuelle. Cela permet de désamorcer l'usure insidieuse du quotidien.`;
      } else if (query.toLowerCase().includes('force') || query.toLowerCase().includes('affectives')) {
        reply = `Votre score de 88/100 en relations affectives prouve une excellente sécurité psychologique. Vous savez écouter et vous entourer de personnes bienveillantes. C'est votre filet de sécurité : n'hésitez pas à vous appuyer sur ce socle lorsque des doutes professionnels ou personnels émergent.`;
      } else if (query.toLowerCase().includes('rituel')) {
        reply = `Voici le rituel « La météo du lien » : en début de semaine, prenez 3 minutes pour noter sur une échelle de 1 à 5 votre niveau de saturation relationnelle. Si un signal faible apparaît (inférieur à 3), planifiez immédiatement un temps d'échange apaisé.`;
      } else {
        reply = `Excellente question, Camille. Vos 5 dimensions montrent une belle harmonie globale (IER de 87%). Pour progresser sans surcharge, appliquez le principe des micro-ajustements : une seule action relationnelle concrète par semaine vaut mieux qu'un grand bouleversement ponctuel.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `i-${Date.now()}`,
          sender: 'iris',
          text: reply,
          timestamp: 'À l’instant'
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col border-l border-[#E3EBE6] animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-[#E3EBE6] bg-gradient-to-r from-[#123D46] to-[#1E3048] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <IrisMark size={28} isAnimated={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-jakarta font-extrabold text-base text-white">
                  Coach IRIS
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-[#E3EBE6]/80 font-inter">
                Intelligence Relationnelle & Analyse Personnalisée
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm font-bold"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Camille summary bar */}
        <div className="bg-[#FAF9F5] border-b border-[#E3EBE6] px-5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-jakarta font-semibold text-[#123D46]">Camille Demo</span>
            <span className="text-[#123D46]/40">·</span>
            <span className="text-[#00A99D] font-bold">IQRH {userScore}/100</span>
          </div>
          <span className="text-[11px] text-[#5965E8] font-medium bg-[#5965E8]/10 px-2 py-0.5 rounded-full">
            Session active
          </span>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed font-inter ${
                  msg.sender === 'user'
                    ? 'bg-[#00A99D] text-white rounded-br-xs shadow-xs'
                    : 'bg-[#F4F1E8]/70 border border-[#E3EBE6] text-[#123D46] rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-[#123D46]/40 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#00A99D] p-2 bg-[#F4F1E8]/50 rounded-xl w-32">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] animate-ping" />
              <span>IRIS réfléchit...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-t border-[#E3EBE6] bg-[#FAF9F5] space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-[#123D46]/60 tracking-wider block px-1">
            Suggestions pour votre profil :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] bg-white border border-[#E3EBE6] hover:border-[#00A99D] hover:text-[#00A99D] text-[#123D46]/80 px-2.5 py-1 rounded-lg transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-[#E3EBE6] bg-white">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Posez une question sur vos dynamiques relationnelles..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E3EBE6] text-xs focus:outline-none focus:border-[#00A99D] text-[#123D46]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-colors shadow-xs"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
