"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Building2, UserCircle, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

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
        <Link href="/dashboard/superadmin/organizations" style={{ color: "var(--text-2)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={15} /> Retour à la liste
        </Link>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>Ajouter un partenaire</h1>
      <p style={{ color: "var(--text-2)", marginBottom: 32 }}>Créez une organisation et son administrateur principal en une seule étape.</p>

      {error && (
        <div style={{ padding: "16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 12, color: "var(--rose)", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertTriangle size={20} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Section 1: Organisation */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Building2 size={24} style={{ color: "var(--violet)" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Informations de l'Organisation</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <Input 
                label="Nom de l'entreprise ou collectivité *" 
                required 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Ex: Mutuelle Solis" 
              />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--text-2)", fontWeight: 600, marginBottom: 8 }}>Type de client *</label>
                <Select
                  value={form.type}
                  onChange={(val) => setForm({ ...form, type: val })}
                  options={[
                    { value: "B2B", label: "Entreprises (B2B)" },
                    { value: "B2B2C", label: "Mutuelles (B2B2C)" },
                    { value: "B2G", label: "Collectivités (B2G)" }
                  ]}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <Input 
                  label="Code d'accès unique *" 
                  required 
                  name="codeAccess" 
                  value={form.codeAccess} 
                  onChange={handleChange} 
                  placeholder="Ex: SOLIS2026" 
                />
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>Sera utilisé par les bénéficiaires pour rejoindre.</p>
              </div>
            </div>
            
            <div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <Input 
                    label="Logo de l'organisation (Optionnel)"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                </div>
                {form.logoUrl && (
                  <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--text-3)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.logoUrl} alt="Logo preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                )}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>Le logo s'affichera sur la page de connexion des bénéficiaires.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Administrateur */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <UserCircle size={24} style={{ color: "var(--cyan)" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Compte Administrateur Principal</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <Input required name="adminFirstName" value={form.adminFirstName} onChange={handleChange} placeholder="Prénom" label="Prénom *" />
              </div>
              <div>
                <Input required name="adminLastName" value={form.adminLastName} onChange={handleChange} placeholder="Nom" label="Nom *" />
              </div>
            </div>
            
            <div>
              <Input required type="email" name="adminEmail" value={form.adminEmail} onChange={handleChange} placeholder="admin.rh@entreprise.fr" label="Email professionnel (identifiant) *" />
            </div>

            <div>
              <Input required type="text" name="adminPassword" value={form.adminPassword} onChange={handleChange} placeholder="Mot de passe provisoire" label="Mot de passe initial *" />
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>L'administrateur sera forcé de le changer à sa première connexion.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Détails du Contrat & Modalités */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Building2 size={24} style={{ color: "var(--emerald)" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Détails du Contrat & Modalités (Optionnel)</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <Input name="contactName" value={(form as any).contactName || ""} onChange={handleChange} placeholder="Ex: Jean Dupont" label="Nom du contact partenaire" />
              </div>
              <div>
                <Input name="contactEmail" type="email" value={(form as any).contactEmail || ""} onChange={handleChange} placeholder="jean.dupont@partenaire.fr" label="Email du contact" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <Input name="contactPhone" value={(form as any).contactPhone || ""} onChange={handleChange} placeholder="06 12 34 56 78" label="Téléphone du contact" />
              </div>
              <div>
                <Input name="contractType" value={(form as any).contractType || ""} onChange={handleChange} placeholder="Ex: Convention annuelle" label="Type de contrat" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <Input name="startDate" type="date" value={(form as any).startDate || ""} onChange={handleChange} label="Date de début" />
              </div>
              <div>
                <Input name="endDate" type="date" value={(form as any).endDate || ""} onChange={handleChange} label="Date de fin" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <Input name="targetPopulation" type="number" value={(form as any).targetPopulation || ""} onChange={handleChange} placeholder="Ex: 500" label="Population visée" />
              </div>
              <div>
                <Input name="quota" type="number" value={(form as any).quota || ""} onChange={handleChange} placeholder="Ex: 200" label="Quota (accès max)" />
              </div>
              <div>
                <Input name="territory" value={(form as any).territory || ""} onChange={handleChange} placeholder="Ex: France, Île-de-France" label="Territoire" />
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
