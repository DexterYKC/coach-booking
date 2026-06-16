"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2, LogOut } from "lucide-react";

interface NavItem { href: string; label: string; icon: React.ReactNode }

export function PanelShell({
  title,
  role,
  nav,
  children
}: {
  title: string;
  role: "coach" | "admin";
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?next=" + pathname); return; }
      const { data: prof } = await supabase.from("profiles").select("role,first_name,last_name,email").eq("id", user.id).maybeSingle();
      if (prof?.role !== role && prof?.role !== "admin") {
        router.push("/");
        return;
      }
      setUser({ name: `${prof?.first_name || ""} ${prof?.last_name || ""}`.trim() || user.email || "", email: user.email ?? null });
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function logout() { await supabase.auth.signOut(); router.push("/"); }

  if (!ready) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-brand" /></div>;

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col md:flex-row">
      <aside className="md:w-64 md:min-h-screen bg-white border-r border-slate-100 md:sticky md:top-0 md:self-start">
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="font-display font-bold text-lg" data-testid="panel-logo">Coaching Basket</Link>
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mt-1">{title}</div>
        </div>
        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible" data-testid="panel-nav">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              data-testid={`nav-${n.href.replace(/\//g, "-")}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                pathname === n.href || pathname.startsWith(n.href + "/")
                  ? "bg-brand text-white"
                  : "text-ink-muted hover:bg-slate-50 hover:text-ink"
              )}
            >
              {n.icon} {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block p-3 border-t border-slate-100 mt-auto">
          <div className="px-3 py-2 text-sm">{user?.name}</div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 rounded-xl hover:bg-rose-50" data-testid="panel-logout">
            <LogOut size={16} /> Se déconnecter
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="container-page py-8">{children}</div>
      </main>
    </div>
  );
}
