export function DemoAccountsHint() {
  if (process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS !== "true") return null;

  return (
    <div className="mt-6 bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm" data-testid="demo-accounts-hint">
      <div className="font-semibold text-brand-700 mb-2">Comptes de démo</div>
      <ul className="space-y-1 text-ink-muted">
        <li><strong className="text-ink">Coach</strong> : coach@example.com / Coach123!</li>
        <li><strong className="text-ink">Client</strong> : client@example.com / Client123!</li>
      </ul>
      <p className="mt-2 text-xs text-ink-muted">Ou créez votre propre compte.</p>
    </div>
  );
}
