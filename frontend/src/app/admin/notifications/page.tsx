"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Mail, MessageCircle, Save } from "lucide-react";
import toast from "react-hot-toast";

interface Email { id: string; email: string; label?: string | null; active: boolean }
interface Wa { id: string; phone_number: string; label?: string | null; active: boolean }
interface Template { id: string; type: string; subject: string | null; body_email: string | null; body_whatsapp: string | null }

export default function AdminNotificationsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [whats, setWhats] = useState<Wa[]>([]);
  const [tpls, setTpls] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState({ email: "", label: "" });
  const [newWa, setNewWa] = useState({ phone_number: "", label: "" });

  async function refresh() {
    setLoading(true);
    const r = await fetch("/api/notifications");
    const j = await r.json();
    setEmails(j.emails || []); setWhats(j.whatsapp || []); setTpls(j.templates || []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function addEmail() {
    if (!newEmail.email) return;
    const r = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "emails", ...newEmail, active: true }) });
    if (!r.ok) toast.error("Erreur"); else { setNewEmail({ email: "", label: "" }); toast.success("Email ajouté"); }
    refresh();
  }
  async function addWa() {
    if (!newWa.phone_number) return;
    const r = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "whatsapp", ...newWa, active: true }) });
    if (!r.ok) toast.error("Erreur"); else { setNewWa({ phone_number: "", label: "" }); toast.success("Numéro ajouté"); }
    refresh();
  }
  async function delItem(kind: "emails" | "whatsapp", id: string) {
    await fetch(`/api/notifications?kind=${kind}&id=${id}`, { method: "DELETE" });
    refresh();
  }
  async function toggle(kind: "emails" | "whatsapp", id: string, active: boolean) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id, active }) });
    refresh();
  }
  async function saveTemplate(t: Template) {
    const r = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "template", id: t.id, subject: t.subject, body_email: t.body_email, body_whatsapp: t.body_whatsapp }) });
    if (!r.ok) toast.error("Erreur"); else toast.success("Modèle sauvegardé");
  }

  if (loading) return <Loader2 className="animate-spin text-brand mx-auto mt-10" />;

  return (
    <div data-testid="admin-notifications-page">
      <h1 className="heading text-3xl font-bold">Notifications</h1>
      <p className="text-ink-muted mt-1">Adresses, numéros et modèles de messages.</p>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card" data-testid="emails-card">
          <h2 className="heading font-semibold mb-4 flex items-center gap-2"><Mail size={16} /> Adresses email destinataires</h2>
          <div className="flex gap-2 mb-4">
            <input className="input" placeholder="admin@exemple.com" value={newEmail.email} onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })} data-testid="new-email-input" />
            <input className="input" placeholder="Label (optionnel)" value={newEmail.label} onChange={(e) => setNewEmail({ ...newEmail, label: e.target.value })} />
            <button onClick={addEmail} className="btn-primary" data-testid="new-email-add"><Plus size={16} /></button>
          </div>
          <ul className="divide-y divide-slate-100">
            {emails.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 text-sm" data-testid={`email-row-${e.id}`}>
                <div><div className="font-medium">{e.email}</div>{e.label && <div className="text-xs text-ink-muted">{e.label}</div>}</div>
                <div className="flex gap-1 items-center">
                  <button onClick={() => toggle("emails", e.id, !e.active)} className={"text-xs px-3 py-1 rounded-full border " + (e.active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 border-slate-200")}>{e.active ? "Actif" : "Inactif"}</button>
                  <button onClick={() => delItem("emails", e.id)} className="btn-danger text-xs" data-testid={`del-email-${e.id}`}><Trash2 size={12} /></button>
                </div>
              </li>
            ))}
            {emails.length === 0 && <li className="text-sm text-ink-muted py-4">Aucune adresse configurée.</li>}
          </ul>
        </div>

        <div className="card" data-testid="whatsapp-card">
          <h2 className="heading font-semibold mb-4 flex items-center gap-2"><MessageCircle size={16} /> Numéros WhatsApp destinataires</h2>
          <div className="flex gap-2 mb-4">
            <input className="input" placeholder="+216 ..." value={newWa.phone_number} onChange={(e) => setNewWa({ ...newWa, phone_number: e.target.value })} data-testid="new-wa-input" />
            <input className="input" placeholder="Label (optionnel)" value={newWa.label} onChange={(e) => setNewWa({ ...newWa, label: e.target.value })} />
            <button onClick={addWa} className="btn-primary" data-testid="new-wa-add"><Plus size={16} /></button>
          </div>
          <ul className="divide-y divide-slate-100">
            {whats.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-2 text-sm" data-testid={`wa-row-${w.id}`}>
                <div><div className="font-medium">{w.phone_number}</div>{w.label && <div className="text-xs text-ink-muted">{w.label}</div>}</div>
                <div className="flex gap-1 items-center">
                  <button onClick={() => toggle("whatsapp", w.id, !w.active)} className={"text-xs px-3 py-1 rounded-full border " + (w.active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 border-slate-200")}>{w.active ? "Actif" : "Inactif"}</button>
                  <button onClick={() => delItem("whatsapp", w.id)} className="btn-danger text-xs" data-testid={`del-wa-${w.id}`}><Trash2 size={12} /></button>
                </div>
              </li>
            ))}
            {whats.length === 0 && <li className="text-sm text-ink-muted py-4">Aucun numéro configuré.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="heading text-xl font-bold">Modèles de messages</h2>
        <p className="text-ink-muted text-sm mt-1">Variables disponibles : <code className="text-xs">{`{{first_name}} {{last_name}} {{email}} {{phone}} {{service_name}} {{slot_date}} {{slot_time}} {{status}}`}</code></p>
        <div className="grid gap-4 mt-4">
          {tpls.map((t) => (
            <TemplateEditor key={t.id} template={t} onSave={saveTemplate} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateEditor({ template, onSave }: { template: Template; onSave: (t: Template) => void }) {
  const [t, setT] = useState(template);
  return (
    <div className="card" data-testid={`tpl-${t.type}`}>
      <div className="text-xs uppercase tracking-wide text-brand font-semibold">{labelOf(t.type)}</div>
      <input className="input mt-2 font-medium" placeholder="Sujet email" value={t.subject || ""} onChange={(e) => setT({ ...t, subject: e.target.value })} data-testid={`tpl-${t.type}-subject`} />
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div>
          <label className="label">Corps email</label>
          <textarea rows={6} className="input" value={t.body_email || ""} onChange={(e) => setT({ ...t, body_email: e.target.value })} data-testid={`tpl-${t.type}-email`} />
        </div>
        <div>
          <label className="label">Corps WhatsApp</label>
          <textarea rows={6} className="input" value={t.body_whatsapp || ""} onChange={(e) => setT({ ...t, body_whatsapp: e.target.value })} data-testid={`tpl-${t.type}-wa`} />
        </div>
      </div>
      <button onClick={() => onSave(t)} className="btn-primary mt-3 text-sm" data-testid={`tpl-${t.type}-save`}><Save size={14} /> Enregistrer</button>
    </div>
  );
}

function labelOf(type: string) {
  switch (type) {
    case "booking_created_user": return "Création — message au client";
    case "booking_status_user": return "Mise à jour de statut — message au client";
    case "booking_created_admin": return "Création — message à l'admin/coach";
    case "booking_status_admin": return "Mise à jour de statut — message à l'admin/coach";
    default: return type;
  }
}
