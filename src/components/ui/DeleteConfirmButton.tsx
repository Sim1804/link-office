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
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: "var(--error)", fontWeight: 500 }}>Supprimer ?</span>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Confirmer la suppression"
          style={{ padding: "4px 8px", height: "auto", fontSize: 12 }}
        >
          {isDeleting ? <Loader2 size={12} className="animate-spin" style={{ marginRight: 4 }} /> : null}
          Oui
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowConfirm(false)}
          title="Annuler"
          style={{ padding: "4px 8px", height: "auto", fontSize: 12 }}
        >
          Non
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={() => setShowConfirm(true)}
      title={title}
      style={{ padding: "6px" }}
    >
      <Trash2 size={14} />
    </Button>
  );
}
