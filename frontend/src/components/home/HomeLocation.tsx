import { MapPin } from "lucide-react";
import type { CoachProfile } from "@/types/database";

export function HomeLocation({ coach }: { coach: CoachProfile | null }) {
  const location = coach?.location || "Tunis, Tunisie";
  return (
    <section className="bg-white border-y border-slate-100 py-20" data-testid="home-location">
      <div className="container-page grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">Localisation</span>
          <h2 className="heading text-3xl md:text-4xl font-bold mt-3">Où se déroulent les séances</h2>
          <p className="text-ink-muted mt-3">Les séances se tiennent à <strong>{location}</strong>. Le coach se déplace également sur d&apos;autres terrains de Tunis sur demande.</p>
          <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100" data-testid="location-card">
            <div className="w-10 h-10 rounded-xl bg-brand text-white grid place-items-center"><MapPin size={20} /></div>
            <div>
              <div className="font-medium">{location}</div>
              <div className="text-xs text-ink-muted">Voir sur la carte avant chaque séance</div>
            </div>
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-card">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
            width="100%"
            height="380"
            loading="lazy"
            style={{ border: 0 }}
            data-testid="location-map"
            title="Map"
          />
        </div>
      </div>
    </section>
  );
}
