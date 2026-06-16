import { Star } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type { Review } from "@/types/database";

export function HomeReviews({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section id="reviews" className="bg-surface-alt py-20 border-y border-slate-100" data-testid="home-reviews">
      <div className="container-page">
        <div className="max-w-2xl mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">Avis clients</span>
          <h2 className="heading text-3xl md:text-4xl font-bold mt-3">Ce qu&apos;ils en disent</h2>
          <div className="flex items-center gap-2 mt-3" data-testid="reviews-average">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={18} className={n <= Math.round(avg) ? "fill-brand text-brand" : "text-slate-200"} />
              ))}
            </div>
            <span className="text-sm text-ink-muted">{avg.toFixed(1)} / 5 · {reviews.length} avis</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div key={r.id} className="card" data-testid={`review-card-${r.id}`}>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={14} className={n <= r.rating ? "fill-brand text-brand" : "text-slate-200"} />
                ))}
              </div>
              <p className="text-sm text-ink mt-3">{r.comment}</p>
              <div className="flex items-center gap-2 mt-4">
                <Avatar url={r.profile?.avatar_url} firstName={r.profile?.first_name} lastName={r.profile?.last_name} size={28} />
                <span className="text-sm font-medium text-ink-muted">
                  {r.profile?.first_name || "Client"} {r.profile?.last_name?.charAt(0) || ""}.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
