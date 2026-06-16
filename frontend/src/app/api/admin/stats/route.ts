import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const today = new Date();
  const startWeek = new Date(today); startWeek.setDate(today.getDate() - 7);
  const startMonth = new Date(today); startMonth.setDate(today.getDate() - 30);

  const [
    bookingsAll,
    bookingsWeek,
    bookingsMonth,
    bookingsByStatus,
    usersCount,
    recent
  ] = await Promise.all([
    admin.from("bookings").select("id, price_snapshot, status, created_at, slot_date, slot_time, service_id").order("created_at", { ascending: false }),
    admin.from("bookings").select("id, price_snapshot, status").gte("created_at", startWeek.toISOString()),
    admin.from("bookings").select("id, price_snapshot, status").gte("created_at", startMonth.toISOString()),
    admin.from("bookings").select("status"),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("activity_log").select("*").order("created_at", { ascending: false }).limit(15)
  ]);

  const totals = {
    all: bookingsAll.data?.length || 0,
    week: bookingsWeek.data?.length || 0,
    month: bookingsMonth.data?.length || 0,
    users: usersCount.count || 0
  };

  const statusCounts = (bookingsByStatus.data || []).reduce((acc: any, b: any) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, { en_attente: 0, confirme: 0, annule: 0 });

  const revenue = {
    all: (bookingsAll.data || []).filter((b: any) => b.status === "confirme").reduce((s: number, b: any) => s + Number(b.price_snapshot || 0), 0),
    week: (bookingsWeek.data || []).filter((b: any) => b.status === "confirme").reduce((s: number, b: any) => s + Number(b.price_snapshot || 0), 0),
    month: (bookingsMonth.data || []).filter((b: any) => b.status === "confirme").reduce((s: number, b: any) => s + Number(b.price_snapshot || 0), 0)
  };

  return NextResponse.json({
    totals,
    statusCounts,
    revenue,
    activity: recent.data || []
  });
}
