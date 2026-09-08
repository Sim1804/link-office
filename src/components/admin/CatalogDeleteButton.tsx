"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface CatalogDeleteButtonProps {
  itemId: string;
}

export function CatalogDeleteButton({ itemId }: CatalogDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/catalog/${itemId}`, { method: "DELETE" });
      if (res.ok) {
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
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#f87171", fontWeight: 500 }}>Supprimer ?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          title="Confirmer la suppression"
          style={{
            padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: "rgba(244,63,94,0.15)", color: "#f87171",
            border: "1px solid rgba(244,63,94,0.3)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4
          }}
        >
          {isDeleting ? <Loader2 size={12} className="animate-spin" /> : null}
          Oui
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          title="Annuler"
          style={{
            padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: "rgba(148,163,184,0.1)", color: "#94a3b8",
            border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer"
          }}
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      title={`Supprimer ${itemId}`}
      style={{
        padding: 8, borderRadius: 8,
        background: "rgba(244,63,94,0.08)", color: "#f87171",
        border: "1px solid rgba(244,63,94,0.15)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.2s"
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(244,63,94,0.18)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(244,63,94,0.08)")}
    >
      <Trash2 size={16} />
    </button>
  );
}
