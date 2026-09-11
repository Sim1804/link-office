"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Headphones } from "lucide-react";
import Link from "next/link";
import { TipTapEditor } from "@/components/media/TipTapEditor";
import { updateMediaContent } from "@/app/actions/media";
import { Button } from "@/components/ui/Button";

export default function EditMediaForm({ media }: { media: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    title: media.title || "",
    slug: media.slug || "",
    summary: media.summary || "",
    mediaType: media.mediaType || "ARTICLE",
    coverImage: media.coverImage || "",
    audioUrl: media.audioUrl || "",
    duration: media.duration ? media.duration.toString() : "",
    published: media.published || false,
    content: media.content || "",
    transcript: media.transcript || "",
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      title: e.target.value,
      // Only generate slug if it's currently empty or auto-generated, but for edit, we might want to keep the original slug to avoid 404s. So let's NOT auto-update slug on edit unless they change it manually.
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await updateMediaContent(media.id, form);
    
    if (res.success) {
      router.push("/dashboard/superadmin/media");
    } else {
      setError(res.error || "Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      <Link href="/dashboard/superadmin/media" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#94a3b8", textDecoration: "none", marginBottom: 24, fontSize: 14 }}>
        <ArrowLeft size={16} /> Retour à la médiathèque
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 12 }}>
            Modifier le contenu
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Modifiez cet article, podcast ou dossier.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", marginBottom: 24 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Main Column */}
        <div style={{ flex: "1 1 600px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 24 }}>Informations Générales</h3>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Titre du contenu *</label>
              <input type="text" value={form.title} onChange={handleTitleChange} className="input-field" required placeholder="Ex: La solitude des dirigeants" style={{ width: "100%" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Slug (URL) *</label>
              <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.15)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", paddingLeft: 12 }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>/media/</span>
                <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} style={{ background: "transparent", border: "none", color: "#f8fafc", padding: "8px 12px 8px 4px", flexGrow: 1, outline: "none", fontSize: 14 }} required />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Résumé court</label>
              <textarea value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} className="input-field" rows={3} placeholder="Sera affiché sur les cartes et pour le SEO..." style={{ width: "100%", resize: "vertical" }} />
            </div>
          </div>

          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 24 }}>Contenu (WYSIWYG)</h3>
            <TipTapEditor 
              content={form.content} 
              onChange={(html) => setForm({...form, content: html})}
            />
          </div>

          {form.mediaType === "PODCAST" && (
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <Headphones size={20} style={{ color: "#a78bfa" }} /> Podcast "La Voix des Éclaireurs"
              </h3>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>URL du fichier Audio (mp3)</label>
                <input type="url" value={form.audioUrl} onChange={e => setForm({...form, audioUrl: e.target.value})} className="input-field" placeholder="https://..." style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Transcription (Texte brut)</label>
                <textarea value={form.transcript} onChange={e => setForm({...form, transcript: e.target.value})} className="input-field" rows={8} placeholder="Collez la transcription ici..." style={{ width: "100%", resize: "vertical" }} />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div style={{ flex: "1 1 300px", maxWidth: 400, display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 100 }}>
          
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 20 }}>Publication</h3>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Type de contenu</label>
              <select value={form.mediaType} onChange={e => setForm({...form, mediaType: e.target.value})} className="input-field" style={{ width: "100%" }}>
                <option value="ARTICLE">Article</option>
                <option value="PODCAST">Podcast</option>
                <option value="INTERVIEW">Interview</option>
                <option value="DOSSIER">Dossier</option>
                <option value="TEMOIGNAGE">Témoignage</option>
                <option value="PORTRAIT">Portrait</option>
                <option value="GUIDE">Guide</option>
                <option value="ANALYSE">Analyse</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Durée estimée (minutes)</label>
              <input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="input-field" placeholder="Ex: 15" style={{ width: "100%" }} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 24, padding: 12, background: "rgba(0,0,0,0.15)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
              <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} style={{ width: 16, height: 16, accentColor: "#7c3aed" }} />
              <span style={{ color: "#f8fafc", fontWeight: 500, fontSize: 14 }}>Publié</span>
            </label>

            <Button type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Mettre à jour
            </Button>
          </div>

          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 20 }}>Visuels</h3>
            
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Image de couverture (URL)</label>
              <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.15)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", paddingLeft: 12 }}>
                <ImageIcon size={16} style={{ color: "#64748b" }} />
                <input type="url" value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} style={{ background: "transparent", border: "none", color: "#f8fafc", padding: "8px 12px", flexGrow: 1, outline: "none", fontSize: 14 }} placeholder="https://..." />
              </div>
              {form.coverImage && (
                <div style={{ marginTop: 12, height: 160, borderRadius: 6, background: `url(${form.coverImage}) center/cover`, border: "1px solid rgba(255,255,255,0.1)" }} />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
