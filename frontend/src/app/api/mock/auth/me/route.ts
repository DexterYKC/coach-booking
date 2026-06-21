import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { getUserIdBySession, findAuthUserById, toSupabaseUser } from "@/lib/mock/auth";
import { MOCK_SESSION_COOKIE } from "@/lib/supabase/server";

export async function GET() {
  if (isSupabaseConfigured()) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const token = cookies().get(MOCK_SESSION_COOKIE)?.value;
  const userId = getUserIdBySession(token);
  if (!userId) return NextResponse.json({ user: null });

  const authUser = findAuthUserById(userId);
  if (!authUser) return NextResponse.json({ user: null });

  return NextResponse.json({ user: toSupabaseUser(authUser) });
}
