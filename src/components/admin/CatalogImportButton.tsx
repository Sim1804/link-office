"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function CatalogImportButton() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const json = JSON.parse(content);

          const response = await fetch("/api/admin/catalog/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(json),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erreur lors de l'import");
          }

          alert("Catalogue importé avec succès !");
          router.refresh();
        } catch (error: any) {
          console.error("Erreur d'import :", error);
          alert(`Erreur : ${error.message}`);
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      console.error(err);
      alert(`Erreur de lecture : ${err.message}`);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Button 
        variant="secondary"
        onClick={() => fileInputRef.current?.click()} 
        disabled={isUploading}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <Upload size={18} />
        {isUploading ? "Importation..." : "Importer le catalogue (JSON)"}
      </Button>
    </>
  );
}
