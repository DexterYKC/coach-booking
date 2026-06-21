import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { runQuerySpec, type QuerySpec } from "@/lib/mock/queryBuilder";

// Bridges the browser-side mock Supabase client (lib/supabase/client.ts) to the
// in-memory store, mirroring what PostgREST does for the real Supabase client.
// Local-demo only: there is no auth/role check here, same as an unauthenticated
// table without RLS. Disabled outright once real Supabase env vars are set.
export async function POST(req: Request) {
  if (isSupabaseConfigured()) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const spec = (await req.json()) as QuerySpec;
  const result = await runQuerySpec(spec);
  return NextResponse.json(result);
}
