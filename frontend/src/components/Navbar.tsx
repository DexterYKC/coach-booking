"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, User as UserIcon, ShieldCheck, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface NavUser {
  id: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role: "user" | "coach" | "admin";
  avatar_url?: string | null;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<NavUser | null>(null);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return setUser(null);
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
      setUser({
        id: u.id,
        email: u.email || null,
        first_name: prof?.first_name,
        last_name: prof?.last_name,
        role: prof?.role || "user",
        avatar_url: prof?.avatar_url
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/#services", label: "Services" },
    { href: "/#about", label: "À propos" },
    { href: "/#contact", label: "Contact" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <nav className="container-page flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2" data-testid="nav-logo">
          <div className="w-9 h-9 rounded-xl bg-brand text-white grid place-items-center font-bold font-display">
            <Trophy size={18} strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-ink">Coaching Basket</div>
            <div className="text-[11px] text-ink-muted -mt-0.5">Tunisie</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === l.href ? "text-brand bg-brand-50" : "text-ink-muted hover:text-ink hover:bg-slate-50"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {!user && (
            <>
              <Link href="/login" className="btn-ghost text-sm" data-testid="nav-login-btn">Se connecter</Link>
              <Link href="/register" className="btn-primary text-sm" data-testid="nav-register-btn">S&apos;inscrire</Link>
            </>
          )}
          {user && (
            <div className="relative">
              <button
                data-testid="nav-user-menu-btn"
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Avatar url={user.avatar_url} firstName={user.first_name} lastName={user.last_name} size={32} />
                <span className="text-sm font-medium text-ink hidden lg:inline">{user.first_name || user.email}</span>
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-lg p-2" data-testid="nav-user-dropdown">
                  <Link href="/profile" onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50" data-testid="nav-profile-link">
                    <UserIcon size={16} /> Mon profil
                  </Link>
                  <Link href="/bookings" onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50" data-testid="nav-bookings-link">
                    <Trophy size={16} /> Mes réservations
                  </Link>
                  {user.role === "coach" && (
                    <Link href="/coach" onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50" data-testid="nav-coach-link">
                      <ShieldCheck size={16} /> Espace coach
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50" data-testid="nav-admin-link">
                      <ShieldCheck size={16} /> Admin
                    </Link>
                  )}
                  <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50" data-testid="nav-logout-btn">
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)} data-testid="nav-mobile-toggle">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white" data-testid="nav-mobile-panel">
          <div className="container-page py-4 flex flex-col gap-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                {l.label}
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-2" />
            {!user && (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary text-sm">Se connecter</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary text-sm">S&apos;inscrire</Link>
              </>
            )}
            {user && (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Mon profil</Link>
                <Link href="/bookings" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Mes réservations</Link>
                {user.role === "coach" && <Link href="/coach" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Espace coach</Link>}
                {user.role === "admin" && <Link href="/admin" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Admin</Link>}
                <button onClick={logout} className="text-left px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50">Se déconnecter</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
