"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BookPlus } from "lucide-react";

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

const FormGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 5 }}>{label}</label>
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

  const updateData = (key: string, value: string) => {
    setDataObj((prev: any) => ({ ...prev, [key]: value }));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "10px 14px", color: "var(--text-1)", fontSize: 14,
    fontFamily: "inherit", outline: "none", transition: "border-color 0.2s"
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 100,
    resize: "vertical"
  };

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
    <div className="card">
      <h2 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <BookPlus size={16} style={{ color: "#a78bfa" }} /> {isEdit ? `Éditer l'élément` : `Ajouter un élément`}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 8, padding: "10px 12px" }}>
            <AlertCircle size={14} style={{ color: "#f43f5e", flexShrink: 0 }} />
            <span style={{ color: "#f43f5e", fontSize: 12 }}>{error}</span>
          </div>
        )}

        {/* BASE FIELDS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 5 }}>Identifiant (ID unique) *</label>
            <input 
              type="text" required disabled={isEdit}
              placeholder="Ex: REC001, DEF001..." 
              value={formData.id} 
              onChange={e => setFormData(f => ({ ...f, id: e.target.value.toUpperCase() }))} 
              style={{ ...inputStyle, opacity: isEdit ? 0.7 : 1, cursor: isEdit ? "not-allowed" : "text" }} 
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 5 }}>Bibliothèque (Type) *</label>
            <select 
              required disabled={isEdit}
              value={formData.library}
              onChange={(e) => {
                setFormData(f => ({ ...f, library: e.target.value }));
                if (!isEdit) setDataObj({});
              }}
              style={{ ...inputStyle, cursor: isEdit ? "not-allowed" : "pointer", opacity: isEdit ? 0.7 : 1 }}
            >
              <option value="Recommandations">Recommandations</option>
              <option value="Micro-défis">Micro-défis</option>
              <option value="Partenaires">Partenaires</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 5 }}>Titre Principal *</label>
            <input 
              type="text" required 
              placeholder="Nom complet..." 
              value={formData.title} 
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} 
              style={inputStyle} 
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 5 }}>Catégorie (Optionnelle)</label>
            <input 
              type="text" 
              placeholder="Ex: Relations sociales..." 
              value={formData.category || ""} 
              onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} 
              style={inputStyle} 
            />
          </div>
        </div>

        {/* DYNAMIC FIELDS: RECOMMANDATIONS */}
        {formData.library === "Recommandations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            <h3 style={{ color: "#a78bfa", fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>Détails de la Recommandation</h3>
            
            <FormGroup label="Description globale">
              <textarea style={textareaStyle} value={dataObj.description || ""} onChange={e => updateData("description", e.target.value)} />
            </FormGroup>
            
            <FormGroup label="Objectif">
              <textarea style={textareaStyle} value={dataObj.objectif || ""} onChange={e => updateData("objectif", e.target.value)} />
            </FormGroup>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FormGroup label="Dimensions ciblées"><input style={inputStyle} type="text" value={dataObj.dimensions_ciblees || ""} onChange={e => updateData("dimensions_ciblees", e.target.value)} /></FormGroup>
              <FormGroup label="Profils cibles"><input style={inputStyle} type="text" value={dataObj.profils_cibles || ""} onChange={e => updateData("profils_cibles", e.target.value)} /></FormGroup>
              <FormGroup label="Situations ciblées"><input style={inputStyle} type="text" value={dataObj.situations_ciblees || ""} onChange={e => updateData("situations_ciblees", e.target.value)} /></FormGroup>
              
              <FormGroup label="Facteurs de risque"><input style={inputStyle} type="text" value={dataObj.facteurs_risque_cibles || ""} onChange={e => updateData("facteurs_risque_cibles", e.target.value)} /></FormGroup>
              <FormGroup label="Facteurs protecteurs"><input style={inputStyle} type="text" value={dataObj.facteurs_protecteurs_developpes || ""} onChange={e => updateData("facteurs_protecteurs_developpes", e.target.value)} /></FormGroup>
              <FormGroup label="Besoins couverts"><input style={inputStyle} type="text" value={dataObj.besoins_couverts || ""} onChange={e => updateData("besoins_couverts", e.target.value)} /></FormGroup>
              
              <FormGroup label="Niveau priorité"><input style={inputStyle} type="text" value={dataObj.niveau_priorite || ""} onChange={e => updateData("niveau_priorite", e.target.value)} /></FormGroup>
              <FormGroup label="Difficulté"><input style={inputStyle} type="text" value={dataObj.difficulte || ""} onChange={e => updateData("difficulte", e.target.value)} /></FormGroup>
              <FormGroup label="Temps estimé"><input style={inputStyle} type="text" value={dataObj.temps_estime || ""} onChange={e => updateData("temps_estime", e.target.value)} /></FormGroup>
              
              <FormGroup label="Impact attendu (1-5)"><input style={inputStyle} type="text" value={dataObj.impact_attendu_1_5 || ""} onChange={e => updateData("impact_attendu_1_5", e.target.value)} /></FormGroup>
              <FormGroup label="Délai résultat"><input style={inputStyle} type="text" value={dataObj.delai_resultat || ""} onChange={e => updateData("delai_resultat", e.target.value)} /></FormGroup>
              <FormGroup label="Fréquence"><input style={inputStyle} type="text" value={dataObj.frequence || ""} onChange={e => updateData("frequence", e.target.value)} /></FormGroup>
            </div>
            
            <h3 style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginTop: 10 }}>Compatibilités</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
              <FormGroup label="Micro-défi">
                <select style={inputStyle} value={dataObj.compatible_micro_defi || "Non"} onChange={e => updateData("compatible_micro_defi", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
              <FormGroup label="IRIS">
                <select style={inputStyle} value={dataObj.compatible_iris || "Non"} onChange={e => updateData("compatible_iris", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
              <FormGroup label="Binôme">
                <select style={inputStyle} value={dataObj.compatible_binome || "Non"} onChange={e => updateData("compatible_binome", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
              <FormGroup label="B2B">
                <select style={inputStyle} value={dataObj.compatible_b2b || "Non"} onChange={e => updateData("compatible_b2b", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
              <FormGroup label="B2B2C">
                <select style={inputStyle} value={dataObj.compatible_b2b2c || "Non"} onChange={e => updateData("compatible_b2b2c", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
              <FormGroup label="Collectivité">
                <select style={inputStyle} value={dataObj.compatible_collectivite || "Non"} onChange={e => updateData("compatible_collectivite", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FormGroup label="Programmes LinkOffice"><input style={inputStyle} type="text" value={dataObj.programmes_link_office_associes || ""} onChange={e => updateData("programmes_link_office_associes", e.target.value)} /></FormGroup>
              <FormGroup label="Partenaires associés"><input style={inputStyle} type="text" value={dataObj.partenaires_associes || ""} onChange={e => updateData("partenaires_associes", e.target.value)} /></FormGroup>
            </div>

            <FormGroup label="Texte Affiché">
              <textarea style={textareaStyle} value={dataObj.texte_affiche || ""} onChange={e => updateData("texte_affiche", e.target.value)} />
            </FormGroup>
            <FormGroup label="Texte IRIS">
              <textarea style={textareaStyle} value={dataObj.texte_iris || ""} onChange={e => updateData("texte_iris", e.target.value)} />
            </FormGroup>
          </div>
        )}

        {/* DYNAMIC FIELDS: MICRO-DEFIS */}
        {formData.library === "Micro-défis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            <h3 style={{ color: "#06b6d4", fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>Détails du Micro-défi</h3>
            
            <FormGroup label="Description">
              <textarea style={textareaStyle} value={dataObj.description || ""} onChange={e => updateData("description", e.target.value)} />
            </FormGroup>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FormGroup label="Dimension Ciblée"><input style={inputStyle} type="text" value={dataObj.dimension_ciblee || ""} onChange={e => updateData("dimension_ciblee", e.target.value)} /></FormGroup>
              <FormGroup label="Besoin Cible"><input style={inputStyle} type="text" value={dataObj.besoin_cible || ""} onChange={e => updateData("besoin_cible", e.target.value)} /></FormGroup>
              
              <FormGroup label="Public Cible"><input style={inputStyle} type="text" value={dataObj.public_cible || ""} onChange={e => updateData("public_cible", e.target.value)} /></FormGroup>
              <FormGroup label="Difficulté"><input style={inputStyle} type="text" value={dataObj.difficulte || ""} onChange={e => updateData("difficulte", e.target.value)} /></FormGroup>
              
              <FormGroup label="Temps Estimé"><input style={inputStyle} type="text" value={dataObj.temps_estime || ""} onChange={e => updateData("temps_estime", e.target.value)} /></FormGroup>
              <FormGroup label="Points"><input style={inputStyle} type="text" value={dataObj.points || ""} onChange={e => updateData("points", e.target.value)} /></FormGroup>
              
              <FormGroup label="Impact Attendu (1-5)"><input style={inputStyle} type="text" value={dataObj.impact_attendu_1_5 || ""} onChange={e => updateData("impact_attendu_1_5", e.target.value)} /></FormGroup>
              <FormGroup label="Validation Attendue"><input style={inputStyle} type="text" value={dataObj.validation_attendue || ""} onChange={e => updateData("validation_attendue", e.target.value)} /></FormGroup>
              
              <FormGroup label="Compatible Binôme">
                <select style={inputStyle} value={dataObj.compatible_binome || "Oui"} onChange={e => updateData("compatible_binome", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
              <FormGroup label="Compatible IRIS">
                <select style={inputStyle} value={dataObj.compatible_iris || "Oui"} onChange={e => updateData("compatible_iris", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
            </div>

            <FormGroup label="Texte Notification">
              <textarea style={textareaStyle} value={dataObj.texte_notification || ""} onChange={e => updateData("texte_notification", e.target.value)} />
            </FormGroup>
          </div>
        )}

        {/* DYNAMIC FIELDS: PARTENAIRES */}
        {formData.library === "Partenaires" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            <h3 style={{ color: "#f59e0b", fontSize: 14, fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>Détails du Partenaire</h3>
            
            <FormGroup label="Description">
              <textarea style={textareaStyle} value={dataObj.description || ""} onChange={e => updateData("description", e.target.value)} />
            </FormGroup>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FormGroup label="Public Cible"><input style={inputStyle} type="text" value={dataObj.public_cible || ""} onChange={e => updateData("public_cible", e.target.value)} /></FormGroup>
              <FormGroup label="Besoins Couverts"><input style={inputStyle} type="text" value={dataObj.besoins_couverts || ""} onChange={e => updateData("besoins_couverts", e.target.value)} /></FormGroup>
              
              <FormGroup label="Situations Ciblées"><input style={inputStyle} type="text" value={dataObj.situations_ciblees || ""} onChange={e => updateData("situations_ciblees", e.target.value)} /></FormGroup>
              <FormGroup label="Dimensions IQRH"><input style={inputStyle} type="text" value={dataObj.dimensions_iqrh || ""} onChange={e => updateData("dimensions_iqrh", e.target.value)} /></FormGroup>
              
              <FormGroup label="Territoire"><input style={inputStyle} type="text" value={dataObj.territoire || ""} onChange={e => updateData("territoire", e.target.value)} /></FormGroup>
              <FormGroup label="Département"><input style={inputStyle} type="text" value={dataObj.departement || ""} onChange={e => updateData("departement", e.target.value)} /></FormGroup>
              
              <FormGroup label="Type Partenaire"><input style={inputStyle} type="text" value={dataObj.type_partenaire || ""} onChange={e => updateData("type_partenaire", e.target.value)} /></FormGroup>
              <FormGroup label="Niveau Validation"><input style={inputStyle} type="text" value={dataObj.niveau_validation || ""} onChange={e => updateData("niveau_validation", e.target.value)} /></FormGroup>
            </div>
            
            <h3 style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginTop: 10 }}>Compatibilités</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
              <FormGroup label="B2C">
                <select style={inputStyle} value={dataObj.compatible_b2c || "Non"} onChange={e => updateData("compatible_b2c", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
              <FormGroup label="B2B">
                <select style={inputStyle} value={dataObj.compatible_b2b || "Non"} onChange={e => updateData("compatible_b2b", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
              <FormGroup label="B2B2C">
                <select style={inputStyle} value={dataObj.compatible_b2b2c || "Non"} onChange={e => updateData("compatible_b2b2c", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
              <FormGroup label="Collectivité">
                <select style={inputStyle} value={dataObj.compatible_collectivite || "Non"} onChange={e => updateData("compatible_collectivite", e.target.value)}><option value="Oui">Oui</option><option value="Non">Non</option></select>
              </FormGroup>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FormGroup label="Tags"><input style={inputStyle} type="text" value={dataObj.tags || ""} onChange={e => updateData("tags", e.target.value)} /></FormGroup>
              <FormGroup label="Source Interne"><input style={inputStyle} type="text" value={dataObj.source_interne || ""} onChange={e => updateData("source_interne", e.target.value)} /></FormGroup>
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border)", marginTop: 10, paddingTop: 20, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button type="button" onClick={() => router.back()} className="btn btn-ghost btn-md">
            Annuler
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-md">
            {isSubmitting ? "Enregistrement..." : (isEdit ? "Mettre à jour" : "Créer l'élément")}
          </button>
        </div>
      </form>
    </div>
  );
}
