"use client";

import { useEffect, useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import Image from "next/image";
import { Loader2, Save, X, Plus, Facebook, Instagram } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import toast from "react-hot-toast";
import type { CoachProfile, CoachSocialLinks } from "@/types/database";

const SOCIAL_FIELDS: { key: keyof CoachSocialLinks; label: string; icon: any; placeholder: string }[] = [
  { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/votre-page" },
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/votre-compte" },
  { key: "tiktok", label: "TikTok", icon: TikTokIcon, placeholder: "https://tiktok.com/@votre-compte" }
];

export default function CoachProfilePage() {
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specInput, setSpecInput] = useState("");
  const [certInput, setCertInput] = useState("");

  async function refresh() {
    const r = await fetch("/api/coach-profile");
    const j = await r.json();
    setCoach(j.coach);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  function update<K extends keyof CoachProfile>(k: K, v: any) { setCoach((c) => c ? { ...c, [k]: v } : c); }
  function updateSocial(key: keyof CoachSocialLinks, v: string) {
    setCoach((c) => c ? { ...c, social_links: { ...(c.social_links || {}), [key]: v } } : c);
  }

  async function save() {
    if (!coach) return;
    setSaving(true);
    const r = await fetch("/api/coach-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: coach.full_name,
        tagline: coach.tagline,
        bio: coach.bio,
        location: coach.location,
        specialties: coach.specialties,
        certifications: coach.certifications,
        experience_years: coach.experience_years,
        philosophy: coach.philosophy,
        contact_email: coach.contact_email,
        contact_phone: coach.contact_phone,
        gallery: coach.gallery,
        social_links: coach.social_links
      })
    });
    if (!r.ok) toast.error("Erreur"); else toast.success("Profil sauvegardé");
    setSaving(false);
  }

  async function setPhoto(url: string) {
    await fetch("/api/coach-profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photo_url: url }) });
    update("photo_url", url);
  }
  async function addGalleryImage(url: string) {
    const newGallery = [...(coach?.gallery || []), url];
    await fetch("/api/coach-profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gallery: newGallery }) });
    update("gallery", newGallery);
  }
  async function removeGalleryImage(url: string) {
    const newGallery = (coach?.gallery || []).filter((u) => u !== url);
    await fetch("/api/coach-profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gallery: newGallery }) });
    update("gallery", newGallery);
    const path = extractPath(url, "coach-images");
    if (path) await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bucket: "coach-images", path }) });
  }

  if (loading || !coach) return <div className="text-center py-16"><Loader2 className="animate-spin text-brand mx-auto" /></div>;

  return (
    <div data-testid="coach-profile-page">
      <h1 className="heading text-3xl font-bold">Mon profil coach</h1>
      <p className="text-ink-muted mt-1">Ces informations apparaissent sur la page d&apos;accueil publique.</p>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="card">
          <h2 className="heading font-semibold mb-4">Photo principale</h2>
          <ImageUploader bucket="coach-images" folder="main" currentUrl={coach.photo_url} onUploaded={setPhoto} testId="coach-main-photo" />
        </div>
        <div className="card lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <Field label="Nom complet" value={coach.full_name} onChange={(v) => update("full_name", v)} testId="coach-name" />
          <Field label="Tagline" value={coach.tagline || ""} onChange={(v) => update("tagline", v)} testId="coach-tagline" />
          <Field label="Lieu" value={coach.location || ""} onChange={(v) => update("location", v)} testId="coach-location" />
          <Field label="Années d'expérience" type="number" value={String(coach.experience_years || 0)} onChange={(v) => update("experience_years", Number(v))} testId="coach-exp" />
          <Field label="Email de contact" value={coach.contact_email || ""} onChange={(v) => update("contact_email", v)} testId="coach-email" />
          <Field label="Téléphone" value={coach.contact_phone || ""} onChange={(v) => update("contact_phone", v)} testId="coach-phone" />
          <div className="sm:col-span-2">
            <label className="label">Biographie</label>
            <textarea rows={4} value={coach.bio || ""} onChange={(e) => update("bio", e.target.value)} className="input" data-testid="coach-bio" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Philosophie</label>
            <textarea rows={2} value={coach.philosophy || ""} onChange={(e) => update("philosophy", e.target.value)} className="input" data-testid="coach-philosophy" />
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="heading font-semibold mb-4">Spécialités</h2>
        <TagInput tags={coach.specialties || []} onChange={(t) => update("specialties", t)} input={specInput} setInput={setSpecInput} testId="specialties" placeholder="Tir, dribble..." />
      </div>

      <div className="card mt-6">
        <h2 className="heading font-semibold mb-4">Certifications</h2>
        <TagInput tags={coach.certifications || []} onChange={(t) => update("certifications", t)} input={certInput} setInput={setCertInput} testId="certifications" placeholder="BEES, FIBA..." />
      </div>

      <div className="card mt-6">
        <h2 className="heading font-semibold mb-4">Réseaux sociaux</h2>
        <p className="text-ink-muted text-sm mb-4">Laissez un champ vide pour masquer son icône sur la page d&apos;accueil.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => {
            const value = coach.social_links?.[key] || "";
            return (
              <div key={key}>
                <label className="label flex items-center gap-1.5"><Icon size={14} /> {label}</label>
                <div className="flex gap-2">
                  <input
                    className="input"
                    value={value}
                    onChange={(e) => updateSocial(key, e.target.value)}
                    placeholder={placeholder}
                    data-testid={`coach-social-${key}`}
                  />
                  {value && (
                    <button
                      type="button"
                      onClick={() => updateSocial(key, "")}
                      className="btn-ghost px-2"
                      title={`Retirer ${label}`}
                      data-testid={`coach-social-${key}-clear`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="heading font-semibold mb-4">Galerie photos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(coach.gallery || []).map((url) => (
            <div key={url} className="relative aspect-square rounded-2xl overflow-hidden group" data-testid={`gallery-img-${url.slice(-12)}`}>
              <Image src={url} alt="" fill className="object-cover" sizes="200px" />
              <button onClick={() => removeGalleryImage(url)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition">
                <X size={14} />
              </button>
            </div>
          ))}
          <ImageUploader bucket="coach-images" folder="gallery" onUploaded={addGalleryImage} testId="coach-gallery-upload" label="Ajouter une photo" />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary mt-6" data-testid="coach-save-btn">
        {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Enregistrer les modifications</>}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", testId }: { label: string; value: string; onChange: (v: string) => void; type?: string; testId: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} className="input" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
    </div>
  );
}

function TagInput({ tags, onChange, input, setInput, testId, placeholder }: { tags: string[]; onChange: (t: string[]) => void; input: string; setInput: (v: string) => void; testId: string; placeholder: string }) {
  function add() { if (!input.trim()) return; onChange([...tags, input.trim()]); setInput(""); }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((t) => (
          <span key={t} className="bg-brand-50 text-brand-700 rounded-full px-3 py-1 text-sm flex items-center gap-1" data-testid={`${testId}-tag-${t}`}>
            {t} <button onClick={() => onChange(tags.filter((x) => x !== t))}><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={placeholder} className="input" data-testid={`${testId}-input`} />
        <button onClick={add} className="btn-secondary" data-testid={`${testId}-add`}><Plus size={16} /></button>
      </div>
    </div>
  );
}

function extractPath(publicUrl: string, bucket: string): string | null {
  const idx = publicUrl.indexOf(`/${bucket}/`);
  if (idx < 0) return null;
  return publicUrl.substring(idx + bucket.length + 2);
}
