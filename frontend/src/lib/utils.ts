import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DAYS_FR = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi"
];

export const LEVEL_FR: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
  aucun: "Aucun / nouveau"
};

export const AGE_FR: Record<string, string> = {
  enfant: "Enfant (6-12)",
  adolescent: "Adolescent (13-17)",
  adulte: "Adulte (18-50)",
  senior: "Senior (50+)"
};

export const STATUS_FR: Record<string, string> = {
  en_attente: "En attente",
  confirme: "Confirmé",
  annule: "Annulé"
};

export function initialsOf(firstName?: string | null, lastName?: string | null) {
  const a = (firstName || "").trim().charAt(0).toUpperCase();
  const b = (lastName || "").trim().charAt(0).toUpperCase();
  return (a + b) || "?";
}

export function formatDateFR(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(d);
}

export function formatTimeShort(t: string) {
  // "HH:MM:SS" -> "HH:MM"
  return t?.slice(0, 5);
}

export function priceFR(value?: number | null) {
  if (!value || Number(value) <= 0) return "Tarif sur demande";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(Number(value));
}

export function fillTemplate(tpl: string, vars: Record<string, string | number | undefined | null>) {
  return tpl.replace(/{{\s*(\w+)\s*}}/g, (_, k) => String(vars[k] ?? ""));
}
