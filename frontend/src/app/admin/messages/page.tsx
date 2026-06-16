"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDateFR } from "@/lib/utils";
import type { ContactMessage } from "@/types/database";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const r = await fetch("/api/contact");
    const j = await r.json();
    setMessages(j.messages || []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function markRead(id: string, read: boolean) {
    await fetch("/api/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, read }) });
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    const r = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
    if (!r.ok) toast.error("Erreur"); else toast.success("Supprimé");
    refresh();
  }

  return (
    <div data-testid="admin-messages-page">
      <h1 className="heading text-3xl font-bold">Messages</h1>
      <p className="text-ink-muted mt-1">Messages envoyés via le formulaire de contact de la page d&apos;accueil.</p>

      <div className="grid gap-4 mt-6">
        {loading && <Loader2 className="animate-spin text-brand mx-auto" />}
        {!loading && messages.length === 0 && (
          <div className="card text-center" data-testid="messages-empty">
            <p className="text-ink-muted">Aucun message reçu pour le moment.</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={"card " + (m.read ? "" : "border-brand-200 bg-brand-50/30")}
            data-testid={`message-card-${m.id}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{m.name}</span>
                  {!m.read && <span className="text-[10px] uppercase tracking-wide bg-brand text-white rounded-full px-2 py-0.5">Nouveau</span>}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-ink-muted mt-1">
                  <span className="flex items-center gap-1"><Mail size={12} /> {m.email}</span>
                  {m.phone && <span className="flex items-center gap-1"><Phone size={12} /> {m.phone}</span>}
                  <span>{formatDateFR(m.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => markRead(m.id, !m.read)}
                  className="btn-ghost text-xs"
                  data-testid={`message-toggle-read-${m.id}`}
                >
                  {m.read ? "Marquer non lu" : "Marquer lu"}
                </button>
                <button onClick={() => remove(m.id)} className="btn-danger text-xs" data-testid={`message-delete-${m.id}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm mt-3 whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
