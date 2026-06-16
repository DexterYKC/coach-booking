import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("availability_slots").select("*")
    .order("day_of_week").order("start_time");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data });
}

async function requireCoachOrAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return p?.role === "admin" || p?.role === "coach" ? user : null;
}

export async function POST(req: NextRequest) {
  if (!(await requireCoachOrAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const body = await req.json();
  const { data, error } = await admin.from("availability_slots").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slot: data });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireCoachOrAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const { error } = await admin.from("availability_slots").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireCoachOrAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const { id, ...body } = await req.json();
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const { data, error } = await admin.from("availability_slots").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slot: data });
}
