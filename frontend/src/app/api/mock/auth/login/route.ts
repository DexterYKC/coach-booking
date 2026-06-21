import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { signInUser, createSession } from "@/lib/mock/auth";
import { MOCK_SESSION_COOKIE } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (isSupabaseConfigured()) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { email, password } = await req.json();
  const { user, error } = signInUser({ email, password });
  if (error || !user) {
    return NextResponse.json({ error: error?.message || "Identifiants invalides" }, { status: 401 });
  }

  const token = createSession(user.id);
  cookies().set(MOCK_SESSION_COOKIE, token, { path: "/", httpOnly: false, sameSite: "lax" });

  return NextResponse.json({ user, session: { access_token: token } });
}
