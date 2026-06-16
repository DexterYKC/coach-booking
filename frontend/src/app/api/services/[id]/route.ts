import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getRole() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return p?.role || "user";
}

// Coach can edit services (incl. price). Only admin can delete.
const COACH_EDITABLE_FIELDS = ["name", "description", "duration_minutes", "price", "active", "sort_order", "image_url"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const role = await getRole();
  if (role !== "admin" && role !== "coach")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  // For coach: whitelist fields; admin: pass anything
  const cleaned: Record<string, any> = role === "admin"
    ? body
    : Object.fromEntries(Object.entries(body).filter(([k]) => COACH_EDITABLE_FIELDS.includes(k)));
  cleaned.updated_at = new Date().toISOString();

  const admin = createAdminClient();
  const { data, error } = await admin.from("services").update(cleaned).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, service: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const role = await getRole();
  if (role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const { error } = await admin.from("services").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
