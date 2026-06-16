import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen grid place-items-center px-6" data-testid="verify-email-page">
      <div className="card max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="heading text-2xl font-bold mt-4">Email confirmé 🎉</h1>
        <p className="text-ink-muted mt-2">Votre adresse email a bien été vérifiée. Vous pouvez maintenant vous connecter et réserver vos séances.</p>
        <Link href="/login" className="btn-primary mt-6 inline-flex">Aller à la connexion</Link>
      </div>
    </main>
  );
}
