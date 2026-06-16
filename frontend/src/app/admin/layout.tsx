"use client";

import { PanelShell } from "@/components/PanelShell";
import { LayoutDashboard, Users, Calendar, Briefcase, User, Clock, Bell, MessageSquare, Star } from "lucide-react";

const nav = [
  { href: "/admin", label: "Vue d'ensemble", icon: <LayoutDashboard size={16} /> },
  { href: "/admin/bookings", label: "Réservations", icon: <Calendar size={16} /> },
  { href: "/admin/messages", label: "Messages", icon: <MessageSquare size={16} /> },
  { href: "/admin/reviews", label: "Avis clients", icon: <Star size={16} /> },
  { href: "/admin/users", label: "Utilisateurs", icon: <Users size={16} /> },
  { href: "/admin/services", label: "Services", icon: <Briefcase size={16} /> },
  { href: "/admin/coach", label: "Profil coach", icon: <User size={16} /> },
  { href: "/admin/schedule", label: "Planning", icon: <Clock size={16} /> },
  { href: "/admin/notifications", label: "Notifications", icon: <Bell size={16} /> }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell title="Administration" role="admin" nav={nav}>{children}</PanelShell>;
}
