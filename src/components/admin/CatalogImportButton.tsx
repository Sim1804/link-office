"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
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
      <button 
        type="button"
        onClick={() => fileInputRef.current?.click()} 
        disabled={isUploading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#123D46] hover:bg-[#0D2530] text-white font-jakarta font-bold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Upload className="w-4 h-4" />
        <span>{isUploading ? "Importation..." : "Importer le catalogue (JSON)"}</span>
      </button>
    </>
  );
}
