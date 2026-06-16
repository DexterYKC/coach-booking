"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Loader2, Mail, Phone, Send } from "lucide-react";
import toast from "react-hot-toast";
import type { CoachProfile } from "@/types/database";

export function HomeContact({ coach }: { coach: CoachProfile | null }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function update(k: keyof typeof form, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSending(false);
    if (!res.ok) {
      toast.error("Erreur lors de l'envoi, réessayez.");
      return;
    }
    toast.success("Message envoyé !");
    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <section id="contact" className="container-page py-20" data-testid="home-contact">
      <div className="card md:p-12 bg-gradient-to-br from-brand to-brand-700 text-white border-0 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="heading text-3xl md:text-4xl font-bold">Prêt à passer au niveau supérieur ?</h2>
            <p className="text-white/85 mt-3 max-w-md">Réservez votre première séance dès aujourd&apos;hui. Le coach vous recontacte sous 24h pour valider votre créneau.</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/#services" className="inline-flex items-center gap-2 bg-white text-brand hover:bg-brand-50 rounded-xl px-6 py-3 font-medium transition-all active:scale-[0.97]" data-testid="contact-cta">
                <Calendar size={18} /> Réserver maintenant
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 border border-white/40 text-white rounded-xl px-6 py-3 font-medium hover:bg-white/10 transition-colors">
                Créer un compte
              </Link>
            </div>
            <div className="grid gap-3 mt-8 max-w-sm">
              {coach?.contact_email && (
                <a href={`mailto:${coach.contact_email}`} className="flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-2xl p-4 transition-colors" data-testid="contact-email">
                  <Mail size={20} /> <span className="text-sm">{coach.contact_email}</span>
                </a>
              )}
              {coach?.contact_phone && (
                <a href={`tel:${coach.contact_phone}`} className="flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-2xl p-4 transition-colors" data-testid="contact-phone">
                  <Phone size={20} /> <span className="text-sm">{coach.contact_phone}</span>
                </a>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 text-ink" data-testid="contact-form-card">
            {sent ? (
              <div className="text-center py-8" data-testid="contact-form-success">
                <div className="font-display text-xl font-bold">Merci ! 🙌</div>
                <p className="text-ink-muted mt-2">Votre message a bien été envoyé. Le coach vous répondra rapidement.</p>
                <button onClick={() => setSent(false)} className="btn-secondary mt-5 text-sm">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-3" data-testid="contact-form">
                <h3 className="heading font-semibold text-lg">Envoyer un message</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Votre nom"
                    className="input"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    data-testid="contact-form-name"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Votre email"
                    className="input"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    data-testid="contact-form-email"
                  />
                </div>
                <input
                  placeholder="Téléphone (optionnel)"
                  className="input"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  data-testid="contact-form-phone"
                />
                <textarea
                  required
                  rows={4}
                  placeholder="Votre message"
                  className="input"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  data-testid="contact-form-message"
                />
                <button disabled={sending} className="btn-primary justify-center" data-testid="contact-form-submit">
                  {sending ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} /> Envoyer</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
