"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { DemoAccountsHint } from "@/components/DemoAccountsHint";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Identifiants invalides" : error.message);
      setLoading(false);
      return;
    }
    // Determine role and redirect
    const userId = data.user?.id;
    if (userId) {
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      const role = prof?.role || "user";
      const next = params.get("next");
      toast.success("Connecté");
      router.push(next || (role === "admin" ? "/admin" : role === "coach" ? "/coach" : "/"));
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-surface-alt grid place-items-center px-6 py-12" data-testid="login-page">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand text-white grid place-items-center"><Trophy size={18} /></div>
          <span className="font-display text-lg font-bold">Coaching Basket</span>
        </Link>
        <div className="card">
          <h1 className="heading text-2xl font-bold">Connexion</h1>
          <p className="text-ink-muted text-sm mt-1 mb-6">Heureux de vous revoir.</p>
          <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="label">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="vous@exemple.com" data-testid="login-email-input" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" data-testid="login-password-input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full" data-testid="login-submit-btn">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Se connecter"}
            </button>
          </form>
          <p className="text-sm text-ink-muted text-center mt-6">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-brand font-medium hover:underline">Créer un compte</Link>
          </p>
          <DemoAccountsHint />
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-brand" /></div>}>
      <LoginInner />
    </Suspense>
  );
}
