import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Facebook, Instagram, MapPin, Star } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import type { CoachProfile } from "@/types/database";

const HERO_IMG =
  "https://images.unsplash.com/photo-1562552052-4e9f2d8e8a4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwY29hY2glMjBvdXRkb29yJTIwY291cnR8ZW58MHx8fHwxNzgxNTc0NTcwfDA&ixlib=rb-4.1.0&q=85";

export function HomeHero({ coach }: { coach: CoachProfile | null }) {
  const photo = coach?.photo_url || HERO_IMG;
  return (
    <section className="container-page pt-12 md:pt-20 pb-16" data-testid="home-hero">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-3 py-1 text-xs font-medium mb-5" data-testid="hero-tag">
            <Star size={12} fill="#0D9488" /> Coach certifié — {coach?.experience_years || 10}+ ans d&apos;expérience
          </div>
          <h1 className="heading text-4xl md:text-6xl font-bold leading-[1.05]" data-testid="hero-title">
            Progressez en basket avec{" "}
            <span className="text-brand">{coach?.full_name || "votre coach"}</span>
          </h1>
          <p className="mt-5 text-lg text-ink-muted max-w-xl" data-testid="hero-tagline">
            {coach?.tagline || "Coach de basketball certifié — Tunisie"}. Coaching individuel, collectif, fitness et formation jeunes — adapté à tous les niveaux.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" data-testid="hero-ctas">
            <Link href="#services" className="btn-primary" data-testid="hero-cta-primary">
              <Calendar size={18} /> Réserver une séance
            </Link>
            <Link href="#about" className="btn-secondary" data-testid="hero-cta-secondary">
              En savoir plus <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 max-w-md gap-4">
            <Stat label="Années" value={`${coach?.experience_years || 10}+`} social={coach?.social_links?.facebook ? { href: coach.social_links.facebook, icon: Facebook, label: "Facebook", key: "facebook" } : undefined} />
            <Stat label="Spécialités" value={`${coach?.specialties?.length || 4}`} social={coach?.social_links?.instagram ? { href: coach.social_links.instagram, icon: Instagram, label: "Instagram", key: "instagram" } : undefined} />
            <Stat label="Lieu" value={coach?.location?.split(",")[0] || "Tunis"} social={coach?.social_links?.tiktok ? { href: coach.social_links.tiktok, icon: TikTokIcon, label: "TikTok", key: "tiktok" } : undefined} />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-cardHover border border-slate-100" data-testid="hero-image">
            <Image src={photo} alt="coach" fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 40vw" />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-2 shadow-md">
              <MapPin size={16} className="text-brand" />
              <span className="text-sm font-medium">{coach?.location || "Tunis, Tunisie"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface StatSocial {
  key: string;
  href: string;
  icon: any;
  label: string;
}

function Stat({ label, value, social }: { label: string; value: string; social?: StatSocial }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold text-ink">{value}</div>
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      {social && (
        <a
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          data-testid={`hero-social-${social.key}`}
          className="mt-3 w-16 h-16 rounded-xl bg-slate-50 text-ink-muted hover:bg-brand-50 hover:text-brand grid place-items-center transition-colors"
        >
          <social.icon size={32} />
        </a>
      )}
    </div>
  );
}
