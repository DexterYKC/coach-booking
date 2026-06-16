"use client";
import { BookingsTable } from "@/components/BookingsTable";
export default function AdminBookingsPage() {
  return (
    <div data-testid="admin-bookings-page">
      <h1 className="heading text-3xl font-bold">Réservations</h1>
      <p className="text-ink-muted mt-1">Vue d&apos;ensemble et gestion de toutes les réservations.</p>
      <div className="mt-6"><BookingsTable scope="admin" /></div>
    </div>
  );
}
