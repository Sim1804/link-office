"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BookPlus, X, Plus, Check } from "lucide-react";

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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", display: "block" }}>{label}</label>
      <div className="input-field" style={{ display: "flex", flexDirection: "column", gap: 8, height: "auto", minHeight: 44, padding: "8px 12px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {items.map((item, i) => (
            <span key={i} className="badge badge-violet" style={{ fontSize: 11, padding: "4px 8px" }}>
              {item}
              <button type="button" onClick={() => handleRemove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", padding: 0, marginLeft: 4 }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input 
            type="text" 
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#f8fafc" }}
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
          <button type="button" onClick={handleAdd} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleButton = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) => (
  <div className="input-field" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer" }} onClick={() => onChange(!checked)}>
    <span style={{ fontSize: 13, fontWeight: 500, color: "#cbd5e1" }}>{label}</span>
    <button 
      type="button"
      style={{
        position: "relative", display: "inline-flex", height: 24, width: 44,
        flexShrink: 0, cursor: "pointer", borderRadius: 9999, border: "2px solid transparent",
        transition: "background-color 0.2s",
        background: checked ? "#7c3aed" : "rgba(100,116,139,0.4)",
        outline: "none"
      }}
    >
      <span style={{
        pointerEvents: "none", display: "inline-block", height: 20, width: 20,
        transform: checked ? "translateX(20px)" : "translateX(0)",
        borderRadius: 9999, background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        transition: "transform 0.2s"
      }} />
    </button>
  </div>
);

const FormGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8", display: "block" }}>{label}</label>
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
  const selectClass = "input-field appearance-none cursor-pointer";

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
    <div className="card glass-strong" style={{ padding: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", padding: 12, borderRadius: 14, border: "1px solid rgba(167,139,250,0.2)" }}>
          <BookPlus size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>
            {isEdit ? `Éditer l'élément ${formData.id}` : `Créer un nouvel élément`}
          </h2>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Les données alimentent à la fois le moteur de recommandation et les dashboards.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 12, padding: "12px 16px" }}>
            <AlertCircle size={18} style={{ color: "#f43f5e", flexShrink: 0 }} />
            <span style={{ color: "#f87171", fontSize: 13, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* SECTION BASE */}
        <div className="space-y-6">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #7c3aed", paddingLeft: 12 }}>Informations Primaires</h3>
          <div className="card grid grid-cols-1 md:grid-cols-2 gap-6" style={{ padding: 24 }}>
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
              <select 
                required disabled={isEdit}
                value={formData.library}
                onChange={(e) => {
                  setFormData(f => ({ ...f, library: e.target.value }));
                  if (!isEdit) setDataObj({});
                }}
                className={`${selectClass} font-medium ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <option value="Recommandations">Recommandations</option>
                <option value="Micro-défis">Micro-défis</option>
                <option value="Partenaires">Partenaires</option>
              </select>
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-6">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #a855f7", paddingLeft: 12 }}>Texte prêt à afficher *</h3>
              <div className="card" style={{ padding: 24 }}>
                <textarea 
                  className={`${inputClass} min-h-[100px] resize-y`} 
                  value={dataObj.texte_affiche || ""} 
                  onChange={e => updateData("texte_affiche", e.target.value)} 
                  placeholder="Le texte concret qui s'affichera sur l'ordonnance de l'utilisateur."
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #a855f7", paddingLeft: 12 }}>Critères de matching *</h3>
              <div className="card" style={{ padding: 24 }}>
                <textarea 
                  className={`${inputClass} min-h-[100px] resize-y`} 
                  value={dataObj.criteres_matching || ""} 
                  onChange={e => updateData("criteres_matching", e.target.value)} 
                  placeholder="Ex: Dimensions : Relations sociales | Profils : Ancre | Situations : Parent..."
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC FIELDS: MICRO-DEFIS */}
        {formData.library === "Micro-défis" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="space-y-6">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #0ea5e9", paddingLeft: 12 }}>Texte prêt à afficher *</h3>
              <div className="card" style={{ padding: 24 }}>
                <textarea 
                  className={`${inputClass} min-h-[100px] resize-y`} 
                  required 
                  value={dataObj.texte_affiche || ""} 
                  onChange={e => updateData("texte_affiche", e.target.value)} 
                  placeholder="Texte direct pour le micro-défi..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #0ea5e9", paddingLeft: 12 }}>Ciblage *</h3>
              <div className="card" style={{ padding: 24 }}>
                <textarea 
                  className={`${inputClass} min-h-[80px] resize-y`} 
                  required 
                  value={dataObj.ciblage || ""} 
                  onChange={e => updateData("ciblage", e.target.value)} 
                  placeholder="Ex: Dimension : Relations sociales | Besoin : Écoute profonde | Public : Étudiants"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #0ea5e9", paddingLeft: 12 }}>Progression *</h3>
              <div className="card" style={{ padding: 24 }}>
                <textarea 
                  className={`${inputClass} min-h-[80px] resize-y`} 
                  required 
                  value={dataObj.progression || ""} 
                  onChange={e => updateData("progression", e.target.value)} 
                  placeholder="Ex: Difficulté : Facile | Temps : 10 min | Impact : 5.0/5"
                />
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC FIELDS: PARTENAIRES */}
        {formData.library === "Partenaires" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="space-y-6">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #f59e0b", paddingLeft: 12 }}>Contenus Textuels</h3>
              <div className="card grid grid-cols-1 gap-6" style={{ padding: 24 }}>
                <FormGroup label="Description du Partenaire *">
                  <textarea className={`${inputClass} min-h-[100px] resize-y`} required value={dataObj.description || ""} onChange={e => updateData("description", e.target.value)} />
                </FormGroup>
              </div>
            </div>

            <div className="space-y-6">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #f59e0b", paddingLeft: 12 }}>Critères de Matching</h3>
              <div className="card grid grid-cols-1 md:grid-cols-2 gap-6" style={{ padding: 24 }}>
                <ArrayInput label="Besoins Couverts" value={dataObj.besoins_couverts || ""} onChange={v => updateData("besoins_couverts", v)} />
                <ArrayInput label="Situations Ciblées" value={dataObj.situations_ciblees || ""} onChange={v => updateData("situations_ciblees", v)} />
                <ArrayInput label="Publics Cibles" value={dataObj.public_cible || ""} onChange={v => updateData("public_cible", v)} />
                <ArrayInput label="Territoires" value={dataObj.territoire || ""} onChange={v => updateData("territoire", v)} />
                <FormGroup label="Dimensions IQRH"><input type="text" className={inputClass} value={dataObj.dimensions_iqrh || ""} onChange={e => updateData("dimensions_iqrh", e.target.value)} placeholder="Ex: Relations sociales" /></FormGroup>
                <FormGroup label="Département"><input type="text" className={inputClass} value={dataObj.departement || ""} onChange={e => updateData("departement", e.target.value)} /></FormGroup>
              </div>
            </div>

            <div className="space-y-6">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #f59e0b", paddingLeft: 12 }}>Statut & Compatibilités</h3>
              <div className="card grid grid-cols-1 md:grid-cols-2 gap-6" style={{ padding: 24 }}>
                 <FormGroup label="Type Partenaire"><input type="text" className={inputClass} value={dataObj.type_partenaire || ""} onChange={e => updateData("type_partenaire", e.target.value)} /></FormGroup>
                 <FormGroup label="Niveau Validation"><input type="text" className={inputClass} value={dataObj.niveau_validation || ""} onChange={e => updateData("niveau_validation", e.target.value)} /></FormGroup>
                 <FormGroup label="Tags (Mots clés internes)"><input type="text" className={inputClass} value={dataObj.tags || ""} onChange={e => updateData("tags", e.target.value)} /></FormGroup>
                 <FormGroup label="Source Interne"><input type="text" className={inputClass} value={dataObj.source_interne || ""} onChange={e => updateData("source_interne", e.target.value)} /></FormGroup>
              </div>
              <div className="card grid grid-cols-2 md:grid-cols-4 gap-4 mt-4" style={{ padding: 24 }}>
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", borderLeft: "4px solid #64748b", paddingLeft: 12 }}>Données brutes ({formData.library})</h3>
            <div className="card" style={{ padding: 24 }}>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>
                Ce type de bibliothèque (« {formData.library} ») est géré en lecture seule. Vous pouvez modifier le titre et la catégorie.
              </p>
              <FormGroup label="Description">
                <textarea className={`${inputClass} min-h-[80px] resize-y`} value={dataObj.description || ""} onChange={e => updateData("description", e.target.value)} />
              </FormGroup>
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 8, paddingTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="btn btn-secondary btn-md"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn btn-primary btn-md"
          >
            {isSubmitting ? (
              <>Enregistrement...</>
            ) : (
              <>
                {isEdit ? <Check size={18} /> : <Plus size={18} />}
                {isEdit ? "Mettre à jour" : "Créer l'élément"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
