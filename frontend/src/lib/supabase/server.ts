import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "./isConfigured";
import { MockQueryBuilder, runQuerySpec } from "@/lib/mock/queryBuilder";
import { getUserIdBySession, findAuthUserById, toSupabaseUser } from "@/lib/mock/auth";

export const MOCK_SESSION_COOKIE = "mock_session";

function createMockServerClient() {
  return {
    auth: {
      async getUser() {
        const token = cookies().get(MOCK_SESSION_COOKIE)?.value;
        const userId = getUserIdBySession(token);
        if (!userId) return { data: { user: null }, error: null };
        const authUser = findAuthUserById(userId);
        if (!authUser) return { data: { user: null }, error: null };
        return { data: { user: toSupabaseUser(authUser) }, error: null };
      }
    },
    from(table: string) {
      return new MockQueryBuilder(runQuerySpec, table);
    }
  };
}

export function createClient() {
  if (isSupabaseConfigured()) {
    const cookieStore = cookies();

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // No-op in Server Components — middleware handles refresh.
            }
          }
        }
      }
    );
  }
  return createMockServerClient() as any;
}
