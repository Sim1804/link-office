"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="max-w-[700px] mx-auto pb-10">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/dashboard/superadmin/organizations" className="text-[#123D46]/70 flex items-center gap-1 hover:text-[#123D46] transition-colors text-[13px] font-medium">
          <ArrowLeft size={15} /> Retour à la liste
        </Link>
      </div>

      <h1 className="text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight mb-2">Ajouter un partenaire</h1>
      <p className="text-[#123D46]/70 text-sm mb-8">Créez une organisation et son administrateur principal en une seule étape.</p>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 mb-6 flex items-center gap-3">
          <AlertTriangle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Section 1: Organisation */}
        <div className="bg-white rounded-2xl border border-[#E3EBE6] p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <Building2 size={24} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-[#123D46] m-0">Informations de l'Organisation</h2>
          </div>
          
          <div className="flex flex-col gap-5">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Type de client *</label>
                <Select
                  value={form.type}
                  onChange={(val) => setForm({ ...form, type: val })}
                  options={[
                    { value: "B2B", label: "Entreprises (B2B)" },
                    { value: "B2B2C", label: "Mutuelles (B2B2C)" },
                    { value: "B2G", label: "Collectivités (B2G)" }
                  ]}
                  className="w-full"
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
                <p className="text-[11px] text-[#123D46]/50 mt-1.5">Sera utilisé par les bénéficiaires pour rejoindre.</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Input 
                    label="Logo de l'organisation (Optionnel)"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                </div>
                {form.logoUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F8F9FA] flex items-center justify-center border border-[#123D46]/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[#123D46]/50 mt-1.5">Le logo s'affichera sur la page de connexion des bénéficiaires.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Administrateur */}
        <div className="bg-white rounded-2xl border border-[#E3EBE6] p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <UserCircle size={24} className="text-cyan-500" />
            <h2 className="text-lg font-bold text-[#123D46] m-0">Compte Administrateur Principal</h2>
          </div>
          
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <p className="text-[11px] text-[#123D46]/50 mt-1.5">L'administrateur sera forcé de le changer à sa première connexion.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Détails du Contrat & Modalités */}
        <div className="bg-white rounded-2xl border border-[#E3EBE6] p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <Building2 size={24} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-[#123D46] m-0">Détails du Contrat & Modalités (Optionnel)</h2>
          </div>
          
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input name="contactName" value={(form as any).contactName || ""} onChange={handleChange} placeholder="Ex: Jean Dupont" label="Nom du contact partenaire" />
              </div>
              <div>
                <Input name="contactEmail" type="email" value={(form as any).contactEmail || ""} onChange={handleChange} placeholder="jean.dupont@partenaire.fr" label="Email du contact" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input name="contactPhone" value={(form as any).contactPhone || ""} onChange={handleChange} placeholder="06 12 34 56 78" label="Téléphone du contact" />
              </div>
              <div>
                <Input name="contractType" value={(form as any).contractType || ""} onChange={handleChange} placeholder="Ex: Convention annuelle" label="Type de contrat" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input name="startDate" type="date" value={(form as any).startDate || ""} onChange={handleChange} label="Date de début" />
              </div>
              <div>
                <Input name="endDate" type="date" value={(form as any).endDate || ""} onChange={handleChange} label="Date de fin" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div className="flex justify-end gap-3 mt-4">
          <Link href="/dashboard/superadmin/organizations" className="no-underline">
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
