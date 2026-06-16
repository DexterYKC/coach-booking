"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatusBadge } from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { Loader2, X, Calendar, Clock, Star, Send } from "lucide-react";
import { formatDateFR, formatTimeShort, priceFR } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Booking } from "@/types/database";

export default function MyBookingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?next=/bookings"); return; }
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/bookings");
    const json = await res.json();
    setBookings(json.bookings || []);
    setLoading(false);
  }

  async function cancel(id: string) {
    if (!confirm("Annuler cette réservation ?")) return;
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "annule" })
    });
    if (!res.ok) toast.error("Erreur"); else toast.success("Réservation annulée");
    refresh();
  }

  return (
    <main data-testid="bookings-page">
      <Navbar />
      <section className="container-page py-12">
        <h1 className="heading text-3xl font-bold">Mes réservations</h1>
        <p className="text-ink-muted mt-1">Suivez le statut de vos réservations.</p>

        <div className="mt-8 grid gap-4">
          {loading && <Loader2 className="animate-spin mx-auto text-brand" />}
          {!loading && bookings.length === 0 && (
            <div className="card text-center" data-testid="bookings-empty">
              <p className="text-ink-muted">Vous n&apos;avez pas encore de réservation.</p>
              <a href="/#services" className="btn-primary mt-4 inline-flex">Réserver une séance</a>
            </div>
          )}
          {bookings.map((b) => (
            <div key={b.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`booking-row-${b.id}`}>
              <div>
                <div className="font-display text-lg font-semibold">{b.service?.name || "Service"}</div>
                <div className="flex items-center gap-4 text-sm text-ink-muted mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {formatDateFR(b.slot_date)}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {formatTimeShort(b.slot_time)}</span>
                  <span>{priceFR(b.price_snapshot)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={b.status} />
                {b.status !== "annule" && (
                  <button onClick={() => cancel(b.id)} className="btn-danger text-sm" data-testid={`cancel-booking-${b.id}`}>
                    <X size={14} /> Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <ReviewForm />
      </section>
      <Footer />
    </main>
  );
}

function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!rating) return toast.error("Choisissez une note");
    if (!comment.trim()) return toast.error("Écrivez un commentaire");
    setSending(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment })
    });
    setSending(false);
    if (!res.ok) { toast.error("Erreur lors de l'envoi"); return; }
    toast.success("Avis envoyé, en attente de validation");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card mt-8 text-center" data-testid="review-form-success">
        <p className="font-medium">Merci pour votre avis ! 🙌</p>
        <p className="text-sm text-ink-muted mt-1">Il sera visible publiquement une fois validé par le coach.</p>
      </div>
    );
  }

  return (
    <div className="card mt-8" data-testid="review-form">
      <h2 className="heading text-lg font-bold">Laisser un avis</h2>
      <p className="text-sm text-ink-muted mt-1">Votre avis sera affiché sur la page d&apos;accueil après validation.</p>
      <div className="flex gap-1 mt-4" data-testid="review-form-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} data-testid={`review-star-${n}`}>
            <Star size={28} className={n <= rating ? "fill-brand text-brand" : "text-slate-200"} />
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        className="input mt-4"
        placeholder="Votre expérience avec le coach..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        data-testid="review-form-comment"
      />
      <button onClick={submit} disabled={sending} className="btn-primary mt-4" data-testid="review-form-submit">
        {sending ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Envoyer mon avis</>}
      </button>
    </div>
  );
}
