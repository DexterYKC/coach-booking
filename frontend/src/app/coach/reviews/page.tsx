import { ReviewsModeration } from "@/components/ReviewsModeration";

export default function CoachReviewsPage() {
  return (
    <div data-testid="coach-reviews-page">
      <h1 className="heading text-3xl font-bold">Avis clients</h1>
      <p className="text-ink-muted mt-1">Validez les avis avant qu&apos;ils n&apos;apparaissent sur la page d&apos;accueil.</p>
      <div className="mt-6">
        <ReviewsModeration />
      </div>
    </div>
  );
}
