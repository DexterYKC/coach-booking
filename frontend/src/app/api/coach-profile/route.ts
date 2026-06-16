import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("coach_profile").select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coach: data });
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "admin" && prof?.role !== "coach")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const body = await req.json();
  // Single coach row -> upsert
  const { data: existing } = await admin.from("coach_profile").select("id").maybeSingle();
  let result;
  if (existing) {
    result = await admin.from("coach_profile").update(body).eq("id", existing.id).select().single();
  } else {
    result = await admin.from("coach_profile").insert(body).select().single();
  }
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coach: result.data });
}
