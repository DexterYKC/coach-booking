"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "./isConfigured";
import { MockQueryBuilder, type QueryExecutor } from "@/lib/mock/queryBuilder";

const remoteExecutor: QueryExecutor = async (spec) => {
  const res = await fetch("/api/mock/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spec)
  });
  return res.json();
};

function createMockBrowserClient() {
  return {
    auth: {
      async getUser() {
        const res = await fetch("/api/mock/auth/me");
        const json = await res.json();
        return { data: { user: json.user ?? null }, error: null };
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const res = await fetch("/api/mock/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const json = await res.json();
        if (!res.ok) return { data: { user: null, session: null }, error: { message: json.error || "Identifiants invalides" } };
        return { data: { user: json.user, session: json.session }, error: null };
      },
      async signUp({ email, password, options }: { email: string; password: string; options?: { data?: any } }) {
        const res = await fetch("/api/mock/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, data: options?.data })
        });
        const json = await res.json();
        if (!res.ok) return { data: { user: null, session: null }, error: { message: json.error || "Erreur d'inscription" } };
        return { data: { user: json.user, session: json.session }, error: null };
      },
      async signOut() {
        await fetch("/api/mock/auth/logout", { method: "POST" });
        return { error: null };
      }
    },
    from(table: string) {
      return new MockQueryBuilder(remoteExecutor, table);
    }
  };
}

export function createClient() {
  if (isSupabaseConfigured()) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return createMockBrowserClient() as any;
}
