import { createClient as createSbClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./isConfigured";
import { MockQueryBuilder, runQuerySpec } from "@/lib/mock/queryBuilder";
import { createMockStorage } from "@/lib/mock/storage";
import { deleteAuthUser, findAuthUserByEmail, signUpUser, toSupabaseUser } from "@/lib/mock/auth";

function createMockAdminClient() {
  return {
    from(table: string) {
      return new MockQueryBuilder(runQuerySpec, table);
    },
    storage: createMockStorage(),
    auth: {
      admin: {
        async deleteUser(id: string) {
          deleteAuthUser(id);
          return { data: {}, error: null };
        },
        async createUser({ email, password, user_metadata }: { email: string; password: string; user_metadata?: any }) {
          const existing = findAuthUserByEmail(email);
          if (existing) return { data: { user: toSupabaseUser(existing) }, error: { message: "User already exists" } };
          const { user, error } = signUpUser({ email, password, data: user_metadata });
          return { data: { user }, error };
        },
        async listUsers() {
          return { data: { users: [] }, error: null };
        }
      }
    }
  };
}

/**
 * Admin / service-role client.
 * Use ONLY in trusted server contexts (API routes).
 * Bypasses RLS.
 */
export function createAdminClient() {
  if (isSupabaseConfigured()) {
    return createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return createMockAdminClient() as any;
}
