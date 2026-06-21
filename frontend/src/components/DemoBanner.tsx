import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      data-testid="demo-banner"
      className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm py-2.5 px-6 text-center"
    >
      <div className="container-page flex items-center justify-center gap-2 flex-wrap">
        <Info size={14} />
        <span>
          <strong>Mode démo locale</strong> — Supabase n&apos;est pas encore connecté. Les données sont stockées en mémoire sur cette machine et seront réinitialisées au redémarrage du serveur. Remplissez{" "}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded">.env.local</code> pour activer la base de données réelle.
        </span>
      </div>
    </div>
  );
}
