"use client";

import { useEffect, useState } from "react";
import { BookingsTable } from "@/components/BookingsTable";
import { formatDateFR } from "@/lib/utils";

export default function CoachHomePage() {
  const [stats, setStats] = useState<{ upcoming: number; pending: number; today: string }>({ upcoming: 0, pending: 0, today: formatDateFR(new Date()) });

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/bookings");
      const j = await r.json();
      const bks = j.bookings || [];
      const today = new Date().toISOString().slice(0,10);
      setStats({
        upcoming: bks.filter((b: any) => b.status === "confirme" && b.slot_date >= today).length,
        pending: bks.filter((b: any) => b.status === "en_attente").length,
        today: formatDateFR(new Date())
      });
    })();
  }, []);

  return (
    <div data-testid="coach-home">
      <h1 className="heading text-3xl font-bold">Bienvenue, coach 👋</h1>
      <p className="text-ink-muted mt-1">{stats.today}</p>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <Stat label="En attente" value={stats.pending} hint="Demandes à traiter" testId="stat-pending" />
        <Stat label="Confirmées à venir" value={stats.upcoming} hint="Séances planifiées" testId="stat-upcoming" />
        <Stat label="Aujourd'hui" value={stats.today} hint="Date" textValue testId="stat-today" />
      </div>

      <h2 className="heading text-xl font-bold mt-10 mb-4">Toutes mes réservations</h2>
      <BookingsTable scope="coach" />
    </div>
  );
}

function Stat({ label, value, hint, testId, textValue }: { label: string; value: any; hint: string; testId: string; textValue?: boolean }) {
  return (
    <div className="card" data-testid={testId}>
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className={"mt-2 font-display font-bold " + (textValue ? "text-lg" : "text-3xl")}>{value}</div>
      <div className="text-xs text-ink-muted mt-1">{hint}</div>
    </div>
  );
}
