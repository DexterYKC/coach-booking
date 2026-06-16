import { Award, Heart, Target } from "lucide-react";
import type { CoachProfile } from "@/types/database";

export function HomeAbout({ coach }: { coach: CoachProfile | null }) {
  return (
    <section id="about" className="container-page py-16" data-testid="home-about">
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <span className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">À propos</span>
          <h2 className="heading text-3xl md:text-4xl font-bold mt-3">Une approche personnalisée du basketball</h2>
          <p className="text-ink-muted mt-4 leading-relaxed">
            {coach?.bio || "Coach passionné depuis plus de 10 ans, je propose un coaching individuel et collectif adapté à tous les niveaux. Ma méthode allie technique, condition physique et plaisir du jeu."}
          </p>
          {coach?.philosophy && (
            <blockquote className="mt-6 border-l-4 border-brand pl-4 italic text-ink-muted">
              « {coach.philosophy} »
            </blockquote>
          )}
        </div>
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
          <Feature icon={<Target size={20} />} title="Objectifs clairs" desc="Plans d'entraînement structurés et adaptés à vos objectifs personnels." />
          <Feature icon={<Award size={20} />} title="Certifications" desc={(coach?.certifications?.join(" • ")) || "BEES Basketball · FIBA Coach Level 1"} />
          <Feature icon={<Heart size={20} />} title="Bienveillance" desc="Encadrement bienveillant et progression à votre rythme." />
          <Feature icon={<Target size={20} />} title="Spécialités" desc={(coach?.specialties?.join(", ")) || "Tir, dribble, préparation physique"} />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card card-hover">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand grid place-items-center mb-3">{icon}</div>
      <h3 className="font-display font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink-muted mt-1">{desc}</p>
    </div>
  );
}
