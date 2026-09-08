"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Building2, UserCircle, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "B2B",
    codeAccess: "",
    logoUrl: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/v1/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setForm({ ...form, logoUrl: data.url });
        setError(null);
      } else {
        setError(data.error || "Erreur lors du téléchargement du logo.");
      }
    } catch {
      setError("Erreur réseau lors du téléchargement du logo.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/superadmin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création");
      
      router.push("/dashboard/superadmin/organizations");
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/dashboard/superadmin/organizations" style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={15} /> Retour à la liste
        </Link>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Ajouter un partenaire</h1>
      <p style={{ color: "#94a3b8", marginBottom: 32 }}>Créez une organisation et son administrateur principal en une seule étape.</p>

      {error && (
        <div style={{ padding: "16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 12, color: "#f43f5e", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertTriangle size={20} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Section 1: Organisation */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Building2 size={24} style={{ color: "#c084fc" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", margin: 0 }}>Informations de l'Organisation</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Nom de l'entreprise ou collectivité *</label>
              <input required name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Ex: Mutuelle Solis" />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Type de client *</label>
                <select required name="type" value={form.type} onChange={handleChange} className="input-field">
                  <option value="B2B">B2B (Ressources Humaines)</option>
                  <option value="B2B2C">B2B2C (Partenaire Financeur)</option>
                  <option value="COLLECTIVITE">Collectivité (Mairie, Région)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Code d'accès unique *</label>
                <input required name="codeAccess" value={form.codeAccess} onChange={handleChange} className="input-field" placeholder="Ex: SOLIS2026" />
                <p style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Sera utilisé par les bénéficiaires pour rejoindre.</p>
              </div>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Logo de l'organisation (Optionnel)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="input-field" 
                  style={{ flex: 1 }} 
                />
                {form.logoUrl && (
                  <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #334155" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.logoUrl} alt="Logo preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                )}
              </div>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Le logo s'affichera sur la page de connexion des bénéficiaires.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Administrateur */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <UserCircle size={24} style={{ color: "#38bdf8" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", margin: 0 }}>Compte Administrateur Principal</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Prénom *</label>
                <input required name="adminFirstName" value={form.adminFirstName} onChange={handleChange} className="input-field" placeholder="Prénom" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Nom *</label>
                <input required name="adminLastName" value={form.adminLastName} onChange={handleChange} className="input-field" placeholder="Nom" />
              </div>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Email professionnel (identifiant) *</label>
              <input required type="email" name="adminEmail" value={form.adminEmail} onChange={handleChange} className="input-field" placeholder="admin.rh@entreprise.fr" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Mot de passe initial *</label>
              <input required type="text" name="adminPassword" value={form.adminPassword} onChange={handleChange} className="input-field" placeholder="Mot de passe provisoire" />
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>L'administrateur sera forcé de le changer à sa première connexion.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Détails du Contrat & Modalités */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Building2 size={24} style={{ color: "#34d399" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", margin: 0 }}>Détails du Contrat & Modalités (Optionnel)</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Nom du contact partenaire</label>
                <input name="contactName" value={(form as any).contactName || ""} onChange={handleChange} className="input-field" placeholder="Ex: Jean Dupont" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Email du contact</label>
                <input name="contactEmail" type="email" value={(form as any).contactEmail || ""} onChange={handleChange} className="input-field" placeholder="jean.dupont@partenaire.fr" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Téléphone du contact</label>
                <input name="contactPhone" value={(form as any).contactPhone || ""} onChange={handleChange} className="input-field" placeholder="06 12 34 56 78" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Type de contrat</label>
                <input name="contractType" value={(form as any).contractType || ""} onChange={handleChange} className="input-field" placeholder="Ex: Convention annuelle" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Date de début</label>
                <input name="startDate" type="date" value={(form as any).startDate || ""} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Date de fin</label>
                <input name="endDate" type="date" value={(form as any).endDate || ""} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Population visée</label>
                <input name="targetPopulation" type="number" value={(form as any).targetPopulation || ""} onChange={handleChange} className="input-field" placeholder="Ex: 500" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Quota (accès max)</label>
                <input name="quota" type="number" value={(form as any).quota || ""} onChange={handleChange} className="input-field" placeholder="Ex: 200" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Territoire</label>
                <input name="territory" value={(form as any).territory || ""} onChange={handleChange} className="input-field" placeholder="Ex: France, Île-de-France" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
          <Link href="/dashboard/superadmin/organizations" style={{ textDecoration: "none" }}>
            <Button variant="ghost">Annuler</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Création en cours..." : <><Save size={16} /> Créer l'organisation</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
