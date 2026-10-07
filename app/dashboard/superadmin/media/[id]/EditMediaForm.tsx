"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Headphones } from "lucide-react";
import Link from "next/link";
import { TipTapEditor } from "@/components/media/TipTapEditor";
import { updateMediaContent } from "@/app/actions/media";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

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
    <div className="pb-16">
      <Link href="/dashboard/superadmin/media" className="inline-flex items-center gap-2 text-[#123D46]/70 no-underline mb-6 text-sm hover:text-[#123D46] transition-colors font-medium">
        <ArrowLeft size={16} /> Retour à la médiathèque
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-jakarta font-extrabold text-[#123D46] flex items-center gap-3 tracking-tight">
            Modifier le contenu
          </h1>
          <p className="text-[#123D46]/70 mt-2 text-sm">Modifiez cet article, podcast ou dossier.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-500 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-8 items-start flex-wrap">
        
        {/* Main Column */}
        <div className="flex-1 min-w-[600px] flex flex-col gap-6">
          <div className="bg-white border border-[#E3EBE6] rounded-2xl p-8 shadow-xs">
            <h3 className="text-lg font-bold text-[#123D46] mb-6">Informations Générales</h3>
            
            <div className="mb-5">
              <Input
                label="Titre du contenu *"
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                required
                placeholder="Ex: La solitude des dirigeants"
                className="w-full"
              />
            </div>

            <div className="mb-5">
              <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Slug (URL) *</label>
              <div className="flex items-center bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] pl-3 focus-within:ring-2 focus-within:ring-[#00A99D]/20 overflow-hidden">
                <span className="text-[#123D46]/50 text-sm">/media/</span>
                <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="bg-transparent border-none text-[#123D46] py-2.5 pr-3 pl-1 grow outline-none text-sm" required />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Résumé court</label>
              <textarea
                value={form.summary}
                onChange={e => setForm({...form, summary: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none text-sm text-[#123D46] resize-y"
                rows={3}
                placeholder="Sera affiché sur les cartes et pour le SEO..."
              />
            </div>
          </div>

          <div className="bg-white border border-[#E3EBE6] rounded-2xl p-8 shadow-xs">
            <h3 className="text-lg font-bold text-[#123D46] mb-6">Contenu (WYSIWYG)</h3>
            <TipTapEditor 
              content={form.content} 
              onChange={(html) => setForm({...form, content: html})}
            />
          </div>

          {form.mediaType === "PODCAST" && (
            <div className="bg-white border border-[#E3EBE6] rounded-2xl p-8 shadow-xs">
              <h3 className="text-lg font-bold text-[#123D46] mb-6 flex items-center gap-2">
                <Headphones size={20} className="text-[#00A99D]" /> Podcast "La Voix des Éclaireurs"
              </h3>
              
              <div className="mb-5">
                <Input
                  label="URL du fichier Audio (mp3)"
                  type="url"
                  value={form.audioUrl}
                  onChange={e => setForm({...form, audioUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Transcription (Texte brut)</label>
                <textarea
                  value={form.transcript}
                  onChange={e => setForm({...form, transcript: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none text-sm text-[#123D46] resize-y"
                  rows={8}
                  placeholder="Collez la transcription ici..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col gap-6 sticky top-24">
          
          <div className="bg-white border border-[#E3EBE6] rounded-2xl p-8 shadow-xs">
            <h3 className="text-base font-bold text-[#123D46] mb-5">Publication</h3>
            
            <div className="mb-5">
              <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Type de contenu</label>
              <Select
                value={form.mediaType}
                onChange={(val) => setForm({...form, mediaType: val})}
                options={[
                  { value: "ARTICLE", label: "Article" },
                  { value: "PODCAST", label: "Podcast" },
                  { value: "INTERVIEW", label: "Interview" },
                  { value: "DOSSIER", label: "Dossier" },
                  { value: "TEMOIGNAGE", label: "Témoignage" },
                  { value: "PORTRAIT", label: "Portrait" },
                  { value: "GUIDE", label: "Guide" },
                  { value: "ANALYSE", label: "Analyse" }
                ]}
                className="w-full"
              />
            </div>

            <div className="mb-6">
              <Input
                label="Durée estimée (minutes)"
                type="number"
                value={form.duration}
                onChange={e => setForm({...form, duration: e.target.value})}
                placeholder="Ex: 15"
                className="w-full"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer mb-6 p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] hover:bg-[#FAF9F5] transition-colors">
              <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4 accent-[#00A99D]" />
              <span className="text-[#123D46] font-medium text-sm">Publié</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Mettre à jour
            </button>
          </div>

          <div className="bg-white border border-[#E3EBE6] rounded-2xl p-8 shadow-xs">
            <h3 className="text-base font-bold text-[#123D46] mb-5">Visuels</h3>
            
            <div>
              <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Image de couverture (URL)</label>
              <div className="flex items-center bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] pl-3 focus-within:ring-2 focus-within:ring-[#00A99D]/20 overflow-hidden">
                <ImageIcon size={16} className="text-[#123D46]/50" />
                <input type="url" value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} className="bg-transparent border-none text-[#123D46] py-2.5 px-3 grow outline-none text-sm" placeholder="https://..." />
              </div>
              {form.coverImage && (
                <div className="mt-3 h-40 rounded-xl border border-[#E3EBE6]" style={{ background: `url(${form.coverImage}) center/cover` }} />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
