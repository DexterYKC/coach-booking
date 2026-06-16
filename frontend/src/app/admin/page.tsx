"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, Calendar, Wallet, Clock as ClockIcon } from "lucide-react";
import { formatDateFR, priceFR } from "@/lib/utils";

interface Stats {
  totals: { all: number; week: number; month: number; users: number };
  statusCounts: { en_attente: number; confirme: number; annule: number };
  revenue: { all: number; week: number; month: number };
  activity: { id: string; action: string; metadata: any; created_at: string }[];
}

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/stats");
      const j = await r.json();
      setStats(j);
    })();
  }, []);

  if (!stats) return <Loader2 className="animate-spin text-brand mx-auto mt-10" />;

  return (
    <div data-testid="admin-home">
      <h1 className="heading text-3xl font-bold">Vue d&apos;ensemble</h1>
      <p className="text-ink-muted mt-1">Suivez l&apos;activité de la plateforme en temps réel.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <KPI icon={<Calendar size={18} />} label="Réservations (total)" value={stats.totals.all} testId="kpi-total" />
        <KPI icon={<TrendingUp size={18} />} label="Cette semaine" value={stats.totals.week} testId="kpi-week" />
        <KPI icon={<Users size={18} />} label="Utilisateurs" value={stats.totals.users} testId="kpi-users" />
        <KPI icon={<Wallet size={18} />} label="Revenu (tout)" value={priceFR(stats.revenue.all)} testId="kpi-revenue" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="card lg:col-span-2" data-testid="status-breakdown">
          <h2 className="heading font-semibold mb-4">Réservations par statut</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatusBox label="En attente" value={stats.statusCounts.en_attente} className="bg-amber-50 text-amber-800 border-amber-100" />
            <StatusBox label="Confirmées" value={stats.statusCounts.confirme} className="bg-emerald-50 text-emerald-800 border-emerald-100" />
            <StatusBox label="Annulées" value={stats.statusCounts.annule} className="bg-rose-50 text-rose-800 border-rose-100" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <RevenueBox label="Revenu cette semaine" value={priceFR(stats.revenue.week)} />
            <RevenueBox label="Revenu ce mois" value={priceFR(stats.revenue.month)} />
          </div>
        </div>
        <div className="card" data-testid="activity-feed">
          <h2 className="heading font-semibold mb-4 flex items-center gap-2"><ClockIcon size={16} /> Activité récente</h2>
          <ul className="space-y-3">
            {stats.activity.length === 0 && <li className="text-sm text-ink-muted">Aucune activité</li>}
            {stats.activity.map((a) => (
              <li key={a.id} className="text-sm border-l-2 border-brand pl-3" data-testid={`activity-${a.id}`}>
                <div className="font-medium">{labelOf(a.action)}</div>
                <div className="text-xs text-ink-muted">{formatDateFR(a.created_at)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function labelOf(action: string) {
  if (action === "booking_created") return "Nouvelle réservation";
  if (action === "booking_status_changed") return "Statut de réservation modifié";
  return action;
}

function KPI({ icon, label, value, testId }: { icon: React.ReactNode; label: string; value: any; testId: string }) {
  return (
    <div className="card" data-testid={testId}>
      <div className="flex items-center gap-2 text-ink-muted text-xs uppercase tracking-wide">{icon} {label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function StatusBox({ label, value, className }: any) {
  return (
    <div className={`rounded-2xl p-4 border ${className}`}>
      <div className="text-xs uppercase tracking-wide font-medium">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function RevenueBox({ label, value }: any) {
  return (
    <div className="rounded-2xl p-4 bg-slate-50 border border-slate-100">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
