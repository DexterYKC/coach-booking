"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, ChevronLeft, ChevronRight, Clock, Calendar as CalIcon } from "lucide-react";
import toast from "react-hot-toast";
import { formatDateFR, formatTimeShort, priceFR, DAYS_FR } from "@/lib/utils";
import type { Service, AvailabilitySlot, Booking } from "@/types/database";

function addDays(d: Date, n: number) {
  const c = new Date(d); c.setDate(c.getDate() + n); return c;
}
function ymd(d: Date) { return d.toISOString().slice(0, 10); }

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const serviceId = String(params?.serviceId);
  const [user, setUser] = useState<any>(null);
  const [service, setService] = useState<Service | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  });
  const [selected, setSelected] = useState<{ date: string; time: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const [svc, sl] = await Promise.all([
        supabase.from("services").select("*").eq("id", serviceId).maybeSingle(),
        supabase.from("availability_slots").select("*").eq("active", true)
      ]);
      setService(svc.data as Service);
      setSlots((sl.data as AvailabilitySlot[]) || []);
      const start = ymd(weekStart);
      const end = ymd(addDays(weekStart, 13));
      const { data: bk } = await supabase
        .from("bookings")
        .select("slot_date, slot_time, status")
        .gte("slot_date", start).lte("slot_date", end)
        .in("status", ["en_attente", "confirme"]);
      setBookings((bk as any) || []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  function slotsForDay(date: Date) {
    const dow = date.getDay();
    const day = slots.filter((s) => s.day_of_week === dow);
    return day.map((s) => {
      const dateStr = ymd(date);
      const time = s.start_time;
      const taken = bookings.some((b: any) => b.slot_date === dateStr && b.slot_time === time);
      const past = date < new Date(new Date().setHours(0,0,0,0)) ||
        (ymd(date) === ymd(new Date()) && new Date(`${dateStr}T${time}`).getTime() < Date.now());
      return { time, taken, past, date: dateStr };
    });
  }

  async function submit() {
    if (!selected) return toast.error("Choisissez un créneau");
    if (!user) { router.push(`/login?next=/book/${serviceId}`); return; }
    setSubmitting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        slot_date: selected.date,
        slot_time: selected.time,
        notes
      })
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      toast.error(json.error === "slot_taken" ? "Créneau déjà pris" : (json.error || "Erreur"));
      return;
    }
    toast.success("Réservation enregistrée");
    router.push("/bookings");
  }

  if (loading) return <main><Navbar /><div className="container-page py-16 text-center"><Loader2 className="animate-spin text-brand mx-auto" /></div></main>;
  if (!service) return <main><Navbar /><div className="container-page py-16">Service introuvable.</div></main>;

  return (
    <main data-testid="book-page">
      <Navbar />
      <section className="container-page py-12">
        <button onClick={() => router.back()} className="btn-ghost text-sm mb-4" data-testid="book-back">
          <ChevronLeft size={16} /> Retour
        </button>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2" data-testid="slot-picker">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading text-xl font-bold">Choisissez un créneau</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="btn-ghost text-sm" data-testid="prev-week"><ChevronLeft size={16} /></button>
                <span className="text-sm font-medium">{formatDateFR(weekStart)}</span>
                <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="btn-ghost text-sm" data-testid="next-week"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
              {days.map((d) => {
                const ds = slotsForDay(d);
                return (
                  <div key={ymd(d)} className="border border-slate-100 rounded-2xl p-3" data-testid={`day-col-${ymd(d)}`}>
                    <div className="text-xs uppercase tracking-wide text-ink-muted">{DAYS_FR[d.getDay()].slice(0, 3)}</div>
                    <div className="font-display font-bold">{d.getDate()}</div>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {ds.length === 0 && <div className="text-[11px] text-ink-muted">—</div>}
                      {ds.map((s) => {
                        const isSel = selected?.date === s.date && selected.time === s.time;
                        const disabled = s.taken || s.past;
                        return (
                          <button
                            key={s.time}
                            disabled={disabled}
                            data-testid={`slot-btn-${s.date}-${s.time.slice(0,5)}`}
                            onClick={() => setSelected({ date: s.date, time: s.time })}
                            className={
                              "text-xs px-2 py-1.5 rounded-lg border transition-colors " +
                              (disabled ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through" :
                                isSel ? "bg-brand text-white border-brand" :
                                "bg-white border-slate-200 hover:border-brand hover:text-brand")
                            }
                          >
                            {formatTimeShort(s.time)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <aside className="card h-fit" data-testid="booking-summary">
            <h3 className="heading text-lg font-bold">{service.name}</h3>
            <p className="text-sm text-ink-muted mt-1">{service.description}</p>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-xs text-ink-muted">Durée</div>
                <div className="font-semibold flex items-center gap-1"><Clock size={14} /> {service.duration_minutes} min</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-xs text-ink-muted">Tarif</div>
                <div className="font-semibold">{priceFR(service.price)}</div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-brand-50 border border-brand-100">
              <div className="text-xs uppercase tracking-wide text-brand font-semibold">Créneau choisi</div>
              {selected ? (
                <div className="mt-1 text-sm flex items-center gap-2 text-ink">
                  <CalIcon size={14} /> {formatDateFR(selected.date)} • {formatTimeShort(selected.time)}
                </div>
              ) : (
                <div className="text-sm text-ink-muted mt-1">Aucun créneau sélectionné</div>
              )}
            </div>
            <label className="label mt-4">Notes (optionnel)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input" placeholder="Objectifs, conditions médicales..." data-testid="booking-notes" />
            <button onClick={submit} disabled={submitting || !selected} className="btn-primary w-full mt-4" data-testid="confirm-booking-btn">
              {submitting ? <Loader2 className="animate-spin" size={16} /> : "Confirmer la réservation"}
            </button>
            <p className="text-[11px] text-ink-muted text-center mt-2" data-testid="payment-hint">
              Réservation gratuite. Paiement sur place auprès du coach.
            </p>
            {!user && <p className="text-xs text-ink-muted text-center mt-3">Vous devez être connecté pour réserver.</p>}
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
