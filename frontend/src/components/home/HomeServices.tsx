import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { Service } from "@/types/database";
import { priceFR } from "@/lib/utils";

export function HomeServices({ services }: { services: Service[] }) {
  return (
    <section id="services" className="bg-white py-20 border-y border-slate-100" data-testid="home-services">
      <div className="container-page">
        <div className="max-w-2xl mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">Services</span>
          <h2 className="heading text-3xl md:text-4xl font-bold mt-3">Choisissez votre type de séance</h2>
          <p className="text-ink-muted mt-3">
            Toutes les séances peuvent être réservées en quelques clics. Le coach confirme ensuite la disponibilité.
            Le paiement se fait sur place.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.length === 0 && (
            <div className="text-ink-muted col-span-full text-sm" data-testid="services-empty">
              Aucun service disponible pour le moment.
            </div>
          )}
          {services.map((s) => {
            const hasPrice = Number(s.price) > 0;
            return (
              <div key={s.id} className="card card-hover flex flex-col relative" data-testid={`service-card-${s.id}`}>
                {s.image_url && (
                  <div className="relative w-full aspect-[16/10] -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-4 overflow-hidden rounded-t-2xl" data-testid={`service-image-${s.id}`}>
                    <Image src={s.image_url} alt={s.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" />
                  </div>
                )}
                {hasPrice && (
                  <span
                    className="absolute top-4 right-4 bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-3 py-1 text-xs font-bold"
                    data-testid={`service-price-badge-${s.id}`}
                  >
                    {priceFR(s.price)}
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold leading-snug pr-16">{s.name}</h3>
                <p className="text-sm text-ink-muted mt-2 flex-1">{s.description}</p>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-ink-muted">
                    <Clock size={14} /> {s.duration_minutes} min
                  </span>
                  <span
                    className="font-display font-bold text-ink"
                    data-testid={`service-price-${s.id}`}
                  >
                    {hasPrice ? (
                      <>
                        {priceFR(s.price)}
                        <span className="text-xs text-ink-muted font-normal"> / séance</span>
                      </>
                    ) : (
                      <span className="text-sm text-ink-muted font-normal">Tarif sur demande</span>
                    )}
                  </span>
                </div>

                <Link
                  href={`/book/${s.id}`}
                  className="btn-primary w-full mt-5 text-sm"
                  data-testid={`reserve-btn-${s.id}`}
                >
                  Réserver <ArrowRight size={16} />
                </Link>
                <p className="text-[11px] text-ink-muted text-center mt-2">Réservation gratuite · paiement sur place</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
