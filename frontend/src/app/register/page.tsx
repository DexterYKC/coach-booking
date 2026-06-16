"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { LEVEL_FR, AGE_FR } from "@/lib/utils";
import { DemoAccountsHint } from "@/components/DemoAccountsHint";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", city: "",
    basketball_level: "aucun", age_group: "adulte", password: ""
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function update(k: string, v: string) { setForm((s) => ({ ...s, [k]: v })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Mot de passe : minimum 8 caractères"); return; }
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: {
          first_name: form.first_name, last_name: form.last_name, role: "user"
        }
      }
    });
    if (error) { toast.error(error.message); setLoading(false); return; }

    // Update profile fields not in metadata (best-effort if email confirm disabled)
    if (data.user) {
      await supabase.from("profiles").update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        city: form.city,
        basketball_level: form.basketball_level as any,
        age_group: form.age_group as any,
        email: form.email
      }).eq("id", data.user.id);
    }
    toast.success("Compte créé. Vérifiez votre boîte mail.");
    setSent(true);
    setLoading(false);
    // If Supabase has email confirmation disabled, session is active
    if (data.session) router.push("/profile");
  }

  if (sent) {
    return (
      <main className="min-h-screen grid place-items-center px-6 py-12">
        <div className="card max-w-md text-center" data-testid="register-success">
          <h1 className="heading text-2xl font-bold">Vérifiez vos emails 📩</h1>
          <p className="text-ink-muted mt-2">Nous vous avons envoyé un lien de confirmation à <strong>{form.email}</strong>.</p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">Aller à la connexion</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-alt grid place-items-center px-6 py-12" data-testid="register-page">
      <div className="w-full max-w-xl">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand text-white grid place-items-center"><Trophy size={18} /></div>
          <span className="font-display text-lg font-bold">Coaching Basket</span>
        </Link>
        <div className="card">
          <h1 className="heading text-2xl font-bold">Créer un compte</h1>
          <p className="text-ink-muted text-sm mt-1 mb-6">Inscrivez-vous pour réserver des séances.</p>
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4" data-testid="register-form">
            <div>
              <label className="label">Prénom</label>
              <input required value={form.first_name} onChange={(e) => update("first_name", e.target.value)} className="input" data-testid="register-first-name" />
            </div>
            <div>
              <label className="label">Nom</label>
              <input required value={form.last_name} onChange={(e) => update("last_name", e.target.value)} className="input" data-testid="register-last-name" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email</label>
              <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className="input" data-testid="register-email" />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" placeholder="+216 ..." data-testid="register-phone" />
            </div>
            <div>
              <label className="label">Ville</label>
              <input required value={form.city} onChange={(e) => update("city", e.target.value)} className="input" placeholder="Tunis" data-testid="register-city" />
            </div>
            <div>
              <label className="label">Niveau de basketball</label>
              <select value={form.basketball_level} onChange={(e) => update("basketball_level", e.target.value)} className="input" data-testid="register-level">
                {Object.entries(LEVEL_FR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tranche d&apos;âge</label>
              <select value={form.age_group} onChange={(e) => update("age_group", e.target.value)} className="input" data-testid="register-age">
                {Object.entries(AGE_FR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Mot de passe</label>
              <input type="password" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} className="input" placeholder="Min. 8 caractères" data-testid="register-password" />
            </div>
            <button disabled={loading} className="btn-primary sm:col-span-2 mt-2" data-testid="register-submit-btn">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Créer mon compte"}
            </button>
          </form>
          <p className="text-sm text-ink-muted text-center mt-6">
            Déjà inscrit ? <Link href="/login" className="text-brand font-medium hover:underline">Se connecter</Link>
          </p>
          <DemoAccountsHint />
        </div>
      </div>
    </main>
  );
}
