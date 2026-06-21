import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { destroySession } from "@/lib/mock/auth";
import { MOCK_SESSION_COOKIE } from "@/lib/supabase/server";

export async function POST() {
  if (isSupabaseConfigured()) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const token = cookies().get(MOCK_SESSION_COOKIE)?.value;
  destroySession(token);
  cookies().delete(MOCK_SESSION_COOKIE);

  return NextResponse.json({ ok: true });
}
