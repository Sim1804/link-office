"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DeleteConfirmButtonProps {
  endpoint: string;
  title?: string;
  onSuccess?: () => void;
}

export function DeleteConfirmButton({ endpoint, title = "Supprimer", onSuccess }: DeleteConfirmButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        if (onSuccess) onSuccess();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="inline-flex items-center gap-1.5 p-1 rounded-lg bg-rose-50 border border-rose-200 animate-fade-in">
        <span className="text-[11px] text-rose-700 font-semibold px-1">Supprimer ?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          title="Confirmer la suppression"
          className="px-2.5 py-0.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
          Oui
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          title="Annuler"
          className="px-2.5 py-0.5 rounded-full bg-white hover:bg-rose-100 text-[#123D46] text-[11px] font-semibold border border-rose-200 transition-colors cursor-pointer"
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      title={title}
      className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
