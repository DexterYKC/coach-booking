"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import { ImageUploader } from "@/components/ImageUploader";
import { LEVEL_FR, AGE_FR } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import type { Profile } from "@/types/database";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?next=/profile"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(data as Profile);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof Profile>(k: K, v: any) {
    setProfile((p) => p ? { ...p, [k]: v } : p);
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        city: profile.city,
        basketball_level: profile.basketball_level,
        age_group: profile.age_group
      })
    });
    const json = await res.json();
    if (!res.ok) toast.error(json.error || "Erreur");
    else toast.success("Profil mis à jour");
    setSaving(false);
  }

  async function setAvatar(url: string) {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: url })
    });
    update("avatar_url", url);
  }

  async function removeAvatar() {
    if (!profile?.avatar_url) return;
    const path = extractPath(profile.avatar_url, "user-avatars");
    if (path) {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: "user-avatars", path })
      });
    }
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: null })
    });
    update("avatar_url", null);
  }

  if (loading || !profile) return (
    <main><Navbar /><div className="container-page py-16 text-center"><Loader2 className="animate-spin mx-auto text-brand" /></div></main>
  );

  return (
    <main data-testid="profile-page">
      <Navbar />
      <section className="container-page py-12">
        <h1 className="heading text-3xl font-bold">Mon profil</h1>
        <p className="text-ink-muted mt-1">Mettez à jour vos informations personnelles.</p>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className="card text-center" data-testid="avatar-card">
            <div className="flex justify-center">
              {profile.avatar_url ? (
                <Avatar url={profile.avatar_url} firstName={profile.first_name} lastName={profile.last_name} size={120} />
              ) : (
                <Avatar firstName={profile.first_name} lastName={profile.last_name} size={120} />
              )}
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold">{profile.first_name} {profile.last_name}</h2>
            <div className="text-sm text-ink-muted">{profile.email}</div>
            <div className="mt-6">
              <ImageUploader
                bucket="user-avatars"
                folder={profile.id}
                currentUrl={profile.avatar_url}
                maxSizeMB={2}
                shape="round"
                label="Changer la photo"
                testId="user-avatar-upload"
                onUploaded={setAvatar}
                onRemoved={removeAvatar}
              />
            </div>
          </div>

          <div className="card lg:col-span-2" data-testid="profile-form">
            <h2 className="heading text-lg font-semibold mb-4">Informations</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Prénom" value={profile.first_name || ""} onChange={(v) => update("first_name", v)} testId="profile-first-name" />
              <Field label="Nom" value={profile.last_name || ""} onChange={(v) => update("last_name", v)} testId="profile-last-name" />
              <Field label="Téléphone" value={profile.phone || ""} onChange={(v) => update("phone", v)} testId="profile-phone" />
              <Field label="Ville" value={profile.city || ""} onChange={(v) => update("city", v)} testId="profile-city" />
              <Select label="Niveau" value={profile.basketball_level || "aucun"} options={LEVEL_FR} onChange={(v) => update("basketball_level", v as any)} testId="profile-level" />
              <Select label="Tranche d'âge" value={profile.age_group || "adulte"} options={AGE_FR} onChange={(v) => update("age_group", v as any)} testId="profile-age" />
            </div>
            <button onClick={save} disabled={saving} className="btn-primary mt-6" data-testid="profile-save-btn">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Enregistrer</>}
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Field({ label, value, onChange, testId }: { label: string; value: string; onChange: (v: string) => void; testId: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
    </div>
  );
}

function Select({ label, value, options, onChange, testId }: { label: string; value: string; options: Record<string, string>; onChange: (v: string) => void; testId: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId}>
        {Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </div>
  );
}

function extractPath(publicUrl: string, bucket: string): string | null {
  const idx = publicUrl.indexOf(`/${bucket}/`);
  if (idx < 0) return null;
  return publicUrl.substring(idx + bucket.length + 2);
}
