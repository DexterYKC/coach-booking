import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return p?.role === "admin" ? user : null;
}

function table(kind: "emails" | "whatsapp") {
  return kind === "emails" ? "notification_emails" : "notification_whatsapp";
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const [{ data: emails }, { data: whats }, { data: tpls }] = await Promise.all([
    admin.from("notification_emails").select("*").order("created_at"),
    admin.from("notification_whatsapp").select("*").order("created_at"),
    admin.from("notification_templates").select("*").order("type")
  ]);
  return NextResponse.json({ emails, whatsapp: whats, templates: tpls });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { kind, ...payload } = await req.json();
  if (!kind) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin.from(table(kind)).insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { kind, id, ...payload } = await req.json();
  const admin = createAdminClient();
  if (kind === "template") {
    const { data, error } = await admin.from("notification_templates").update(payload).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, item: data });
  }
  const { data, error } = await admin.from(table(kind)).update(payload).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") as "emails" | "whatsapp" | null;
  const id = searchParams.get("id");
  if (!kind || !id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from(table(kind)).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
