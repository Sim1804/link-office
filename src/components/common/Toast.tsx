import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyle =
    toast.type === 'warning'
      ? 'bg-[#FFC629]/15 border-[#FFC629]/40 text-[#123D46]'
      : toast.type === 'info'
      ? 'bg-[#5965E8]/10 border-[#5965E8]/30 text-[#123D46]'
      : 'bg-[#00A99D]/10 border-[#00A99D]/30 text-[#123D46]';

  const icon =
    toast.type === 'warning' ? (
      <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
    ) : toast.type === 'info' ? (
      <Info className="w-4 h-4 text-[#5965E8] shrink-0" />
    ) : (
      <CheckCircle2 className="w-4 h-4 text-[#00A99D] shrink-0" />
    );

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-lg backdrop-blur-md bg-white/95 ${bgStyle} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 text-xs">
        {toast.title && <div className="font-jakarta font-bold text-[#123D46] mb-0.5">{toast.title}</div>}
        <div className="text-[#123D46]/85 font-medium leading-relaxed">{toast.message}</div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#123D46]/40 hover:text-[#123D46] p-0.5 rounded-md hover:bg-black/5 transition-colors"
        aria-label="Fermer la notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
