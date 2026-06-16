import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchNotification } from "@/lib/notifications/dispatch";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = prof?.role || "user";

  const body = await req.json();
  const { status, notes } = body;

  const admin = createAdminClient();

  // Fetch existing
  const { data: existing } = await admin.from("bookings").select("*, service:services(*), profile:profiles(*)").eq("id", params.id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Permission
  if (role === "user" && existing.user_id !== user.id)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (role === "user" && status && status !== "annule")
    return NextResponse.json({ error: "forbidden_status" }, { status: 403 });

  const update: any = {};
  if (status) update.status = status;
  if (typeof notes === "string") update.notes = notes;
  update.updated_at = new Date().toISOString();

  const { data: updated, error } = await admin
    .from("bookings").update(update).eq("id", params.id)
    .select("*, service:services(*), profile:profiles(*)").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (status && status !== existing.status) {
    const vars = {
      first_name: existing.profile?.first_name || "",
      last_name: existing.profile?.last_name || "",
      email: existing.profile?.email || "",
      phone: existing.profile?.phone || "",
      service_name: existing.service?.name || "",
      slot_date: existing.slot_date,
      slot_time: String(existing.slot_time).slice(0, 5),
      status
    };
    await dispatchNotification({
      type: "booking_status_user",
      vars,
      userEmail: existing.profile?.email,
      userPhone: existing.profile?.phone
    });
    await dispatchNotification({ type: "booking_status_admin", vars });
    await admin.from("activity_log").insert({
      actor_id: user.id,
      action: "booking_status_changed",
      metadata: { booking_id: params.id, from: existing.status, to: status }
    });
  }

  return NextResponse.json({ ok: true, booking: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { error } = await admin.from("bookings").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
