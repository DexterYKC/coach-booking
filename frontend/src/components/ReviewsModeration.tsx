"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, Check, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDateFR } from "@/lib/utils";
import type { Review, ReviewStatus } from "@/types/database";

export function ReviewsModeration() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ReviewStatus>("pending");

  async function refresh() {
    setLoading(true);
    const r = await fetch("/api/reviews");
    const j = await r.json();
    setReviews(j.reviews || []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function setStatus(id: string, status: ReviewStatus) {
    const r = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!r.ok) toast.error("Erreur"); else toast.success("Avis mis à jour");
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet avis ?")) return;
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    refresh();
  }

  const filtered = reviews.filter((r) => filter === "all" || r.status === filter);

  return (
    <div data-testid="reviews-moderation">
      <div className="flex flex-wrap gap-2 mb-4">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`review-filter-${f}`}
            className={
              "text-xs px-3 py-1.5 rounded-full border transition-colors " +
              (filter === f ? "bg-brand text-white border-brand" : "bg-white border-slate-200 hover:border-brand")
            }
          >
            {f === "pending" ? "En attente" : f === "approved" ? "Approuvés" : f === "rejected" ? "Rejetés" : "Tous"}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {loading && <Loader2 className="animate-spin text-brand mx-auto" />}
        {!loading && filtered.length === 0 && (
          <div className="card text-center" data-testid="reviews-empty">
            <p className="text-ink-muted">Aucun avis dans cette catégorie.</p>
          </div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="card" data-testid={`review-mod-card-${r.id}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={14} className={n <= r.rating ? "fill-brand text-brand" : "text-slate-200"} />
                  ))}
                </div>
                <div className="text-sm font-medium mt-1">
                  {r.profile?.first_name} {r.profile?.last_name}
                  <span className="text-ink-muted font-normal ml-2 text-xs">{formatDateFR(r.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {r.status !== "approved" && (
                  <button onClick={() => setStatus(r.id, "approved")} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 text-xs inline-flex items-center gap-1" data-testid={`review-approve-${r.id}`}>
                    <Check size={14} /> Approuver
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button onClick={() => setStatus(r.id, "rejected")} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 text-xs inline-flex items-center gap-1" data-testid={`review-reject-${r.id}`}>
                    <X size={14} /> Rejeter
                  </button>
                )}
                <button onClick={() => remove(r.id)} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100 text-xs" data-testid={`review-delete-${r.id}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm mt-3">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
