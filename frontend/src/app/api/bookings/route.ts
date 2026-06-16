import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchNotification } from "@/lib/notifications/dispatch";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = prof?.role || "user";

  let q = supabase
    .from("bookings")
    .select("*, service:services(*), profile:profiles(*)")
    .order("slot_date", { ascending: false })
    .order("slot_time", { ascending: false });

  if (role === "user") q = q.eq("user_id", user.id);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { service_id, slot_date, slot_time, notes } = body;
  if (!service_id || !slot_date || !slot_time)
    return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const admin = createAdminClient();
  const { data: svc } = await admin.from("services").select("price,name,active").eq("id", service_id).maybeSingle();
  if (!svc || !svc.active) return NextResponse.json({ error: "service_unavailable" }, { status: 400 });

  // Prevent double-booking same slot
  const { data: existing } = await admin
    .from("bookings")
    .select("id")
    .eq("slot_date", slot_date)
    .eq("slot_time", slot_time)
    .in("status", ["en_attente", "confirme"])
    .maybeSingle();
  if (existing) return NextResponse.json({ error: "slot_taken" }, { status: 409 });

  const { data: created, error } = await admin
    .from("bookings")
    .insert({
      user_id: user.id,
      service_id,
      slot_date,
      slot_time,
      notes: notes || null,
      price_snapshot: svc.price || 0
    })
    .select("*, service:services(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: prof } = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle();

  const vars = {
    first_name: prof?.first_name || "",
    last_name: prof?.last_name || "",
    email: prof?.email || user.email || "",
    phone: prof?.phone || "",
    service_name: svc.name,
    slot_date,
    slot_time: String(slot_time).slice(0, 5)
  };

  // Notify user
  await dispatchNotification({
    type: "booking_created_user",
    vars,
    userEmail: prof?.email || user.email,
    userPhone: prof?.phone
  });
  // Notify admin
  await dispatchNotification({ type: "booking_created_admin", vars });

  // Activity log
  await admin.from("activity_log").insert({
    actor_id: user.id,
    action: "booking_created",
    metadata: { booking_id: created.id, service: svc.name }
  });

  return NextResponse.json({ ok: true, booking: created });
}
