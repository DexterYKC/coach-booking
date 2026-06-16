"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/Avatar";
import { formatDateFR, formatTimeShort, priceFR, LEVEL_FR, AGE_FR } from "@/lib/utils";
import { Check, X, Loader2, Search, Mail, Phone, MapPin, FileText } from "lucide-react";
import toast from "react-hot-toast";
import type { Booking, BookingStatus } from "@/types/database";

interface Props {
  scope: "coach" | "admin" | "user";
  showActions?: boolean;
}

export function BookingsTable({ scope, showActions = true }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const canViewDetails = scope !== "user";

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/bookings");
    const json = await res.json();
    setBookings(json.bookings || []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function update(id: string, status: BookingStatus) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) toast.error("Erreur"); else toast.success("Statut mis à jour");
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette réservation ?")) return;
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (!res.ok) toast.error("Erreur"); else toast.success("Supprimée");
    refresh();
  }

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) => {
      const t = q.toLowerCase();
      if (!t) return true;
      return (
        b.profile?.first_name?.toLowerCase().includes(t) ||
        b.profile?.last_name?.toLowerCase().includes(t) ||
        b.profile?.email?.toLowerCase().includes(t) ||
        b.service?.name?.toLowerCase().includes(t)
      );
    });

  return (
    <div className="card p-0 overflow-hidden" data-testid="bookings-table">
      <div className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b border-slate-100">
        <div className="flex flex-wrap gap-2">
          {(["all", "en_attente", "confirme", "annule"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              data-testid={`filter-${f}`}
              className={
                "text-xs px-3 py-1.5 rounded-full border transition-colors " +
                (filter === f ? "bg-brand text-white border-brand" : "bg-white border-slate-200 hover:border-brand")
              }
            >
              {f === "all" ? "Toutes" : f === "en_attente" ? "En attente" : f === "confirme" ? "Confirmées" : "Annulées"}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." className="input pl-9 text-sm py-2" data-testid="bookings-search" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {scope !== "user" && <th>Client</th>}
              <th>Service</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Tarif</th>
              <th>Statut</th>
              {showActions && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-brand" /></td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-ink-muted">Aucune réservation</td></tr>}
            {!loading && filtered.map((b) => (
              <tr
                key={b.id}
                data-testid={`booking-row-${b.id}`}
                onClick={() => canViewDetails && setSelected(b)}
                className={canViewDetails ? "cursor-pointer hover:bg-slate-50" : undefined}
              >
                {scope !== "user" && (
                  <td>
                    <div className="font-medium">{b.profile?.first_name} {b.profile?.last_name}</div>
                    <div className="text-xs text-ink-muted">{b.profile?.email}</div>
                  </td>
                )}
                <td>{b.service?.name}</td>
                <td>{formatDateFR(b.slot_date)}</td>
                <td>{formatTimeShort(b.slot_time)}</td>
                <td>{priceFR(b.price_snapshot)}</td>
                <td><StatusBadge status={b.status} /></td>
                {showActions && (
                  <td className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {b.status !== "confirme" && (
                        <button onClick={() => update(b.id, "confirme")} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 text-xs inline-flex items-center gap-1" data-testid={`confirm-${b.id}`}>
                          <Check size={14} /> Confirmer
                        </button>
                      )}
                      {b.status !== "annule" && (
                        <button onClick={() => update(b.id, "annule")} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 text-xs inline-flex items-center gap-1" data-testid={`cancel-${b.id}`}>
                          <X size={14} /> Annuler
                        </button>
                      )}
                      {scope === "admin" && (
                        <button onClick={() => remove(b.id)} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100 text-xs" data-testid={`delete-${b.id}`}>
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function BookingDetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const p = booking.profile;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="booking-detail-modal"
    >
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar url={p?.avatar_url} firstName={p?.first_name} lastName={p?.last_name} size={48} />
            <div>
              <div className="font-semibold text-ink" data-testid="booking-detail-name">{p?.first_name} {p?.last_name}</div>
              {p?.banned && <div className="text-xs text-rose-600 font-medium">Compte banni</div>}
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5" data-testid="booking-detail-close">
            <X size={18} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-ink-muted"><Mail size={14} /> {p?.email || "—"}</div>
          <div className="flex items-center gap-2 text-ink-muted"><Phone size={14} /> {p?.phone || "—"}</div>
          <div className="flex items-center gap-2 text-ink-muted"><MapPin size={14} /> {p?.city || "—"}</div>
          <div className="flex items-center gap-2 text-ink-muted">
            Niveau : {p?.basketball_level ? LEVEL_FR[p.basketball_level] : "—"}
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            Tranche d&apos;âge : {p?.age_group ? AGE_FR[p.age_group] : "—"}
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            Client depuis : {p?.created_at ? formatDateFR(p.created_at) : "—"}
          </div>
        </div>

        <div className="h-px bg-slate-100 my-4" />

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-ink-muted">Service : </span>{booking.service?.name}</div>
          <div><span className="text-ink-muted">Statut : </span><StatusBadge status={booking.status} /></div>
          <div><span className="text-ink-muted">Date : </span>{formatDateFR(booking.slot_date)}</div>
          <div><span className="text-ink-muted">Heure : </span>{formatTimeShort(booking.slot_time)}</div>
          <div><span className="text-ink-muted">Tarif : </span>{priceFR(booking.price_snapshot)}</div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-muted mb-1.5">
            <FileText size={14} /> Note du client
          </div>
          {booking.notes ? (
            <p className="text-sm bg-slate-50 rounded-xl p-3" data-testid="booking-detail-notes">{booking.notes}</p>
          ) : (
            <p className="text-sm text-ink-muted italic" data-testid="booking-detail-no-notes">Aucune note laissée par le client.</p>
          )}
        </div>
      </div>
    </div>
  );
}
