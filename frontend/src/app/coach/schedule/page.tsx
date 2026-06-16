"use client";

import { useEffect, useState } from "react";
import { DAYS_FR, formatTimeShort } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { AvailabilitySlot } from "@/types/database";

export default function CoachSchedulePage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ day_of_week: 1, start_time: "09:00", end_time: "10:00" });

  async function refresh() {
    setLoading(true);
    const r = await fetch("/api/schedule");
    const j = await r.json();
    setSlots(j.slots || []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function add() {
    const r = await fetch("/api/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, active: true }) });
    if (!r.ok) toast.error("Erreur"); else toast.success("Créneau ajouté");
    refresh();
  }
  async function toggle(id: string, active: boolean) {
    const r = await fetch("/api/schedule", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active }) });
    if (!r.ok) toast.error("Erreur"); else toast.success("Mis à jour");
    refresh();
  }
  async function del(id: string) {
    if (!confirm("Supprimer ce créneau ?")) return;
    await fetch(`/api/schedule?id=${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div data-testid="coach-schedule-page">
      <h1 className="heading text-3xl font-bold">Mon planning hebdomadaire</h1>
      <p className="text-ink-muted mt-1">Définissez vos créneaux récurrents disponibles à la réservation.</p>

      <div className="card mt-6" data-testid="add-slot-form">
        <h2 className="heading text-lg font-semibold mb-4">Ajouter un créneau</h2>
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="label">Jour</label>
            <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })} className="input" data-testid="slot-day">
              {DAYS_FR.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Début</label>
            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="input" data-testid="slot-start" />
          </div>
          <div>
            <label className="label">Fin</label>
            <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="input" data-testid="slot-end" />
          </div>
          <button onClick={add} className="btn-primary" data-testid="add-slot-btn"><Plus size={16} /> Ajouter</button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden mt-6">
        <table className="table-base">
          <thead>
            <tr><th>Jour</th><th>Début</th><th>Fin</th><th>Actif</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-brand" /></td></tr>}
            {slots.map((s) => (
              <tr key={s.id} data-testid={`slot-row-${s.id}`}>
                <td>{DAYS_FR[s.day_of_week]}</td>
                <td>{formatTimeShort(s.start_time)}</td>
                <td>{formatTimeShort(s.end_time)}</td>
                <td>
                  <button onClick={() => toggle(s.id, !s.active)} className={"text-xs px-3 py-1 rounded-full border " + (s.active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200")} data-testid={`toggle-${s.id}`}>
                    {s.active ? "Actif" : "Inactif"}
                  </button>
                </td>
                <td className="text-right"><button onClick={() => del(s.id)} className="btn-danger text-xs" data-testid={`delete-slot-${s.id}`}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
