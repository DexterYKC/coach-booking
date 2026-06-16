import Link from "next/link";
import { Mail, MapPin, Phone, Trophy } from "lucide-react";

export function Footer({ coach }: { coach?: { contact_email?: string | null; contact_phone?: string | null; location?: string | null } | null }) {
  return (
    <footer className="bg-ink text-white mt-24" data-testid="site-footer">
      <div className="container-page py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand grid place-items-center">
              <Trophy size={18} />
            </div>
            <span className="font-display text-lg font-bold">Coaching Basket</span>
          </div>
          <p className="text-sm text-slate-300">Coaching basketball, fitness et préparation physique en Tunisie.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Navigation</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link href="/" className="hover:text-white">Accueil</Link></li>
            <li><Link href="/#services" className="hover:text-white">Services</Link></li>
            <li><Link href="/#about" className="hover:text-white">À propos</Link></li>
            <li><Link href="/login" className="hover:text-white">Se connecter</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {coach?.contact_email && (
              <li className="flex items-center gap-2"><Mail size={14} /> {coach.contact_email}</li>
            )}
            {coach?.contact_phone && (
              <li className="flex items-center gap-2"><Phone size={14} /> {coach.contact_phone}</li>
            )}
            <li className="flex items-center gap-2"><MapPin size={14} /> {coach?.location || "Tunis, Tunisie"}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Horaires</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Lun - Ven : 09h00 → 19h00</li>
            <li>Samedi : 09h00 → 13h00</li>
            <li>Dimanche : Fermé</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-5 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Coaching Basket Tunisie. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
