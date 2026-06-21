import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { signUpUser, createSession } from "@/lib/mock/auth";
import { MOCK_SESSION_COOKIE } from "@/lib/supabase/server";

export async function POST(req: Request) {
  if (isSupabaseConfigured()) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { email, password, data } = await req.json();
  const { user, error } = signUpUser({ email, password, data });
  if (error || !user) {
    return NextResponse.json({ error: error?.message || "Erreur d'inscription" }, { status: 400 });
  }

  const token = createSession(user.id);
  cookies().set(MOCK_SESSION_COOKIE, token, { path: "/", httpOnly: false, sameSite: "lax" });

  // No real email provider in mock mode — auto-confirm so the demo flow isn't blocked.
  return NextResponse.json({ user, session: { access_token: token } });
}
