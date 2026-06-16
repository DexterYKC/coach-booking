"use client";

import { PanelShell } from "@/components/PanelShell";
import { Calendar, User, ClipboardList, Tag, Star } from "lucide-react";

const nav = [
  { href: "/coach", label: "Tableau de bord", icon: <ClipboardList size={16} /> },
  { href: "/coach/bookings", label: "Réservations", icon: <Calendar size={16} /> },
  { href: "/coach/reviews", label: "Avis clients", icon: <Star size={16} /> },
  { href: "/coach/schedule", label: "Mon planning", icon: <Calendar size={16} /> },
  { href: "/coach/services", label: "Services & tarifs", icon: <Tag size={16} /> },
  { href: "/coach/profile", label: "Mon profil coach", icon: <User size={16} /> }
];

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell title="Espace Coach" role="coach" nav={nav}>{children}</PanelShell>;
}
