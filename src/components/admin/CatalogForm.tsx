"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BookPlus, X, Plus, Check } from "lucide-react";
import { Select } from "@/components/ui/Select";

type LibraryItemData = {
  id: string;
  library: string;
  title: string;
  category: string | null;
  data: any;
};

interface CatalogFormProps {
  initialData?: LibraryItemData;
  isEdit?: boolean;
}

// Composant de saisie de tags (tableaux)
const ArrayInput = ({ 
  label, 
  value, 
  onChange,
  placeholder = "Entrée pour ajouter"
}: { 
  label: string, 
  value: string, 
  onChange: (v: string) => void,
  placeholder?: string
}) => {
  const items = value ? value.split(';').map(i => i.trim()).filter(Boolean) : [];
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      const newItems = [...items, input.trim()];
      onChange(newItems.join('; '));
      setInput("");
    }
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems.join('; '));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#123D46]/70 block">{label}</label>
      <div className="input-field flex flex-col gap-2 h-auto min-h-[44px] px-3 py-2">
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className="badge badge-violet text-[11px] px-2 py-1">
              {item}
              <button type="button" onClick={() => handleRemove(i)} className="bg-transparent border-none cursor-pointer text-inherit flex items-center p-0 ml-1">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#123D46]"
            placeholder={items.length === 0 ? placeholder : "Ajouter..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <button type="button" onClick={handleAdd} className="bg-transparent border-none cursor-pointer text-[#123D46]/40">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleButton = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) => (
  <div className="input-field flex items-center justify-between px-3.5 py-2.5 cursor-pointer" onClick={() => onChange(!checked)}>
    <span className="text-[13px] font-medium text-[#123D46]/60">{label}</span>
    <button 
      type="button"
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors outline-none ${checked ? "bg-[#00A99D]" : "bg-slate-400/40"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.4)] transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  </div>
);

const FormGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-[#123D46]/70 block">{label}</label>
    {children}
  </div>
);

export function CatalogForm({ initialData, isEdit }: CatalogFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    library: initialData?.library || "Recommandations",
    title: initialData?.title || "",
    category: initialData?.category || "",
  });
  
  const [dataObj, setDataObj] = useState<any>(initialData?.data || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateData = (key: string, value: any) => {
    setDataObj((prev: any) => ({ ...prev, [key]: value }));
  };

  const inputClass = "input-field";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    const finalId = formData.id;
    
    try {
      const url = isEdit ? `/api/admin/catalog/${initialData?.id}` : "/api/admin/catalog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: finalId,
          data: dataObj
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      router.push("/dashboard/superadmin/catalog");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--error-bg)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px" }}>
            <AlertCircle size={18} style={{ color: "var(--error)", flexShrink: 0 }} />
            <span style={{ color: "var(--error)", fontSize: 13, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* SECTION BASE */}
        <div className="card" style={{ padding: 32 }}>
          <div className="flex items-center gap-3 mb-6">
            <BookPlus size={24} style={{ color: "var(--primary)" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Informations Principales</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Identifiant Unique (ID) *">
              <input 
                type="text" required disabled={isEdit}
                placeholder="Ex: REC001, DEF001, PAR001" 
                value={formData.id} 
                onChange={e => setFormData(f => ({ ...f, id: e.target.value.toUpperCase().replace(/\s/g, '') }))} 
                className={`${inputClass} font-mono ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`} 
              />
            </FormGroup>
            
            <FormGroup label="Bibliothèque cible *">
              <Select 
                disabled={isEdit}
                value={formData.library}
                onChange={(value) => {
                  setFormData(f => ({ ...f, library: value }));
                  if (!isEdit) setDataObj({});
                }}
                options={[
                  { value: "Recommandations", label: "Recommandations" },
                  { value: "Micro-défis", label: "Micro-défis" },
                  { value: "Partenaires", label: "Partenaires" }
                ]}
              />
            </FormGroup>

            <FormGroup label="Titre Principal *">
              <input 
                type="text" required 
                placeholder="Le nom de l'élément..." 
                value={formData.title} 
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} 
                className={inputClass} 
              />
            </FormGroup>

            <FormGroup label="Catégorie (Optionnelle)">
              <input 
                type="text" 
                placeholder="Ex: Santé, Sport, Management..." 
                value={formData.category || ""} 
                onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} 
                className={inputClass} 
              />
            </FormGroup>
          </div>
        </div>

        {/* DYNAMIC FIELDS: RECOMMANDATIONS */}
        {formData.library === "Recommandations" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="card" style={{ padding: 32 }}>
              <div className="flex items-center gap-3 mb-6">
                <BookPlus size={24} style={{ color: "var(--indigo)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Texte prêt à afficher *</h2>
              </div>
              <textarea 
                className={`${inputClass} min-h-[100px] resize-y`} 
                value={dataObj.texte_affiche || ""} 
                onChange={e => updateData("texte_affiche", e.target.value)} 
                placeholder="Le texte concret qui s'affichera sur l'ordonnance de l'utilisateur."
                required
              />
            </div>

            <div className="card" style={{ padding: 32 }}>
              <div className="flex items-center gap-3 mb-6">
                <BookPlus size={24} style={{ color: "var(--indigo)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Critères de matching *</h2>
              </div>
              <textarea 
                className={`${inputClass} min-h-[100px] resize-y`} 
                value={dataObj.criteres_matching || ""} 
                onChange={e => updateData("criteres_matching", e.target.value)} 
                placeholder="Ex: Dimensions : Relations sociales | Profils : Ancre | Situations : Parent..."
                required
              />
            </div>
          </div>
        )}

        {/* DYNAMIC FIELDS: MICRO-DEFIS */}
        {formData.library === "Micro-défis" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="card" style={{ padding: 32 }}>
              <div className="flex items-center gap-3 mb-6">
                <BookPlus size={24} style={{ color: "var(--cyan)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Texte prêt à afficher *</h2>
              </div>
              <textarea 
                className={`${inputClass} min-h-[100px] resize-y`} 
                required 
                value={dataObj.texte_affiche || ""} 
                onChange={e => updateData("texte_affiche", e.target.value)} 
                placeholder="Texte direct pour le micro-défi..."
              />
            </div>

            <div className="card" style={{ padding: 32 }}>
              <div className="flex items-center gap-3 mb-6">
                <BookPlus size={24} style={{ color: "var(--cyan)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Ciblage *</h2>
              </div>
              <textarea 
                className={`${inputClass} min-h-[80px] resize-y`} 
                required 
                value={dataObj.ciblage || ""} 
                onChange={e => updateData("ciblage", e.target.value)} 
                placeholder="Ex: Dimension : Relations sociales | Besoin : Écoute profonde | Public : Étudiants"
              />
            </div>

            <div className="card" style={{ padding: 32 }}>
              <div className="flex items-center gap-3 mb-6">
                <BookPlus size={24} style={{ color: "var(--cyan)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Progression *</h2>
              </div>
              <textarea 
                className={`${inputClass} min-h-[80px] resize-y`} 
                required 
                value={dataObj.progression || ""} 
                onChange={e => updateData("progression", e.target.value)} 
                placeholder="Ex: Difficulté : Facile | Temps : 10 min | Impact : 5.0/5"
              />
            </div>
          </div>
        )}

        {/* DYNAMIC FIELDS: PARTENAIRES */}
        {formData.library === "Partenaires" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="card" style={{ padding: 32 }}>
              <div className="flex items-center gap-3 mb-6">
                <BookPlus size={24} style={{ color: "var(--amber)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Contenus Textuels</h2>
              </div>
              <FormGroup label="Description du Partenaire *">
                <textarea className={`${inputClass} min-h-[100px] resize-y`} required value={dataObj.description || ""} onChange={e => updateData("description", e.target.value)} />
              </FormGroup>
            </div>

            <div className="card" style={{ padding: 32 }}>
              <div className="flex items-center gap-3 mb-6">
                <BookPlus size={24} style={{ color: "var(--amber)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Critères de Matching</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ArrayInput label="Besoins Couverts" value={dataObj.besoins_couverts || ""} onChange={v => updateData("besoins_couverts", v)} />
                <ArrayInput label="Situations Ciblées" value={dataObj.situations_ciblees || ""} onChange={v => updateData("situations_ciblees", v)} />
                <ArrayInput label="Publics Cibles" value={dataObj.public_cible || ""} onChange={v => updateData("public_cible", v)} />
                <ArrayInput label="Territoires" value={dataObj.territoire || ""} onChange={v => updateData("territoire", v)} />
                <FormGroup label="Dimensions IQRH"><input type="text" className={inputClass} value={dataObj.dimensions_iqrh || ""} onChange={e => updateData("dimensions_iqrh", e.target.value)} placeholder="Ex: Relations sociales" /></FormGroup>
                <FormGroup label="Département"><input type="text" className={inputClass} value={dataObj.departement || ""} onChange={e => updateData("departement", e.target.value)} /></FormGroup>
              </div>
            </div>

            <div className="card" style={{ padding: 32 }}>
              <div className="flex items-center gap-3 mb-6">
                <BookPlus size={24} style={{ color: "var(--amber)" }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Statut & Compatibilités</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                 <FormGroup label="Type Partenaire"><input type="text" className={inputClass} value={dataObj.type_partenaire || ""} onChange={e => updateData("type_partenaire", e.target.value)} /></FormGroup>
                 <FormGroup label="Niveau Validation"><input type="text" className={inputClass} value={dataObj.niveau_validation || ""} onChange={e => updateData("niveau_validation", e.target.value)} /></FormGroup>
                 <FormGroup label="Tags (Mots clés internes)"><input type="text" className={inputClass} value={dataObj.tags || ""} onChange={e => updateData("tags", e.target.value)} /></FormGroup>
                 <FormGroup label="Source Interne"><input type="text" className={inputClass} value={dataObj.source_interne || ""} onChange={e => updateData("source_interne", e.target.value)} /></FormGroup>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                 <ToggleButton label="B2C" checked={dataObj.compatible_b2c === "Oui"} onChange={c => updateData("compatible_b2c", c ? "Oui" : "Non")} />
                 <ToggleButton label="B2B" checked={dataObj.compatible_b2b === "Oui"} onChange={c => updateData("compatible_b2b", c ? "Oui" : "Non")} />
                 <ToggleButton label="B2B2C" checked={dataObj.compatible_b2b2c === "Oui"} onChange={c => updateData("compatible_b2b2c", c ? "Oui" : "Non")} />
                 <ToggleButton label="Collectivité" checked={dataObj.compatible_collectivite === "Oui"} onChange={c => updateData("compatible_collectivite", c ? "Oui" : "Non")} />
              </div>
            </div>
          </div>
        )}

        {/* FALLBACK: unknown library type (ex: Besoins) */}
        {!['Recommandations', 'Micro-défis', 'Partenaires'].includes(formData.library) && (
          <div className="card animate-in fade-in slide-in-from-bottom-4" style={{ padding: 32 }}>
            <div className="flex items-center gap-3 mb-6">
              <BookPlus size={24} style={{ color: "var(--text-3)" }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Données brutes ({formData.library})</h2>
            </div>
            <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 24 }}>
              Ce type de bibliothèque (« {formData.library} ») est géré en lecture seule. Vous pouvez modifier le titre et la catégorie.
            </p>
            <FormGroup label="Description">
              <textarea className={`${inputClass} min-h-[80px] resize-y`} value={dataObj.description || ""} onChange={e => updateData("description", e.target.value)} />
            </FormGroup>
          </div>
        )}

        <div className="border-t border-[#E3EBE6] mt-6 pt-6 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-5 py-2.5 rounded-full border border-[#E3EBE6] bg-white hover:bg-[#FAF9F5] text-[#123D46] font-jakarta font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>Enregistrement...</>
            ) : (
              <>
                {isEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isEdit ? "Mettre à jour" : "Créer l'élément"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
