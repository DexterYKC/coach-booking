"use client";

import { useEffect, useState } from "react";
import { Loader2, Ban, Trash2, Search } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { LEVEL_FR, AGE_FR, formatDateFR } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Profile } from "@/types/database";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | "user" | "coach" | "admin">("all");

  async function refresh() {
    setLoading(true);
    const r = await fetch("/api/admin/users");
    const j = await r.json();
    setUsers(j.users || []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function ban(id: string, banned: boolean) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, banned }) });
    toast.success(banned ? "Utilisateur banni" : "Utilisateur réactivé");
    refresh();
  }
  async function del(id: string) {
    if (!confirm("Supprimer définitivement ce compte ?")) return;
    const r = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (!r.ok) toast.error("Erreur"); else toast.success("Supprimé");
    refresh();
  }

  const filtered = users
    .filter((u) => role === "all" || u.role === role)
    .filter((u) => {
      const t = q.toLowerCase();
      if (!t) return true;
      return [u.first_name, u.last_name, u.email, u.city].some((x) => x?.toLowerCase().includes(t));
    });

  return (
    <div data-testid="admin-users-page">
      <h1 className="heading text-3xl font-bold">Utilisateurs</h1>
      <p className="text-ink-muted mt-1">Gérez les comptes utilisateurs.</p>

      <div className="card p-0 overflow-hidden mt-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b border-slate-100">
          <div className="flex flex-wrap gap-2">
            {(["all", "user", "coach", "admin"] as const).map((r) => (
              <button key={r} onClick={() => setRole(r)} className={"text-xs px-3 py-1.5 rounded-full border " + (role === r ? "bg-brand text-white border-brand" : "bg-white border-slate-200")} data-testid={`role-filter-${r}`}>
                {r === "all" ? "Tous" : r === "user" ? "Clients" : r === "coach" ? "Coach" : "Admins"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." className="input pl-9 text-sm py-2" data-testid="users-search" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Utilisateur</th><th>Email</th><th>Téléphone</th><th>Ville</th><th>Niveau</th><th>Âge</th><th>Rôle</th><th>Inscrit</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-brand" /></td></tr>}
              {filtered.map((u) => (
                <tr key={u.id} data-testid={`user-row-${u.id}`}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar url={u.avatar_url} firstName={u.first_name} lastName={u.last_name} size={32} />
                      <div>
                        <div className="font-medium">{u.first_name} {u.last_name}</div>
                        {u.banned && <span className="text-xs text-rose-600">Banni</span>}
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{u.email}</td>
                  <td className="text-sm">{u.phone || "—"}</td>
                  <td className="text-sm">{u.city || "—"}</td>
                  <td className="text-sm">{LEVEL_FR[u.basketball_level || "aucun"]}</td>
                  <td className="text-sm">{AGE_FR[u.age_group || "adulte"]}</td>
                  <td><span className="text-xs px-2 py-0.5 rounded-full bg-slate-100">{u.role}</span></td>
                  <td className="text-sm text-ink-muted">{formatDateFR(u.created_at)}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => ban(u.id, !u.banned)} className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs inline-flex items-center gap-1" data-testid={`ban-${u.id}`}><Ban size={12} /> {u.banned ? "Réactiver" : "Bannir"}</button>
                      <button onClick={() => del(u.id)} className="btn-danger text-xs" data-testid={`delete-user-${u.id}`}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
