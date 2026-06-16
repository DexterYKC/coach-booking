import { Calendar, CheckCircle2, MousePointerClick } from "lucide-react";

const steps = [
  { icon: MousePointerClick, title: "Choisissez un service", desc: "Parcourez les services et sélectionnez celui qui correspond à votre objectif." },
  { icon: Calendar, title: "Réservez un créneau", desc: "Sélectionnez la date et l'heure dans le calendrier du coach." },
  { icon: CheckCircle2, title: "Recevez la confirmation", desc: "Vous recevez un email + WhatsApp dès que le coach confirme votre séance." }
];

export function HomeHowItWorks() {
  return (
    <section className="container-page py-20" data-testid="home-how-it-works">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">Réservation</span>
        <h2 className="heading text-3xl md:text-4xl font-bold mt-3">Comment ça marche</h2>
        <p className="text-ink-muted mt-3">Trois étapes simples pour réserver votre séance.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 relative">
        {steps.map((s, i) => (
          <div key={i} className="card text-center" data-testid={`step-${i + 1}`}>
            <div className="w-12 h-12 rounded-2xl bg-brand text-white grid place-items-center mx-auto">
              <s.icon size={22} />
            </div>
            <div className="font-display text-sm text-brand mt-4 font-semibold">Étape {i + 1}</div>
            <h3 className="font-display text-xl font-bold mt-1">{s.title}</h3>
            <p className="text-sm text-ink-muted mt-2">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
