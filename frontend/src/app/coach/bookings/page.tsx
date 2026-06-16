"use client";
import { BookingsTable } from "@/components/BookingsTable";

export default function CoachBookingsPage() {
  return (
    <div data-testid="coach-bookings-page">
      <h1 className="heading text-3xl font-bold">Réservations</h1>
      <p className="text-ink-muted mt-1">Confirmez ou annulez les demandes reçues.</p>
      <div className="mt-6"><BookingsTable scope="coach" /></div>
    </div>
  );
}
