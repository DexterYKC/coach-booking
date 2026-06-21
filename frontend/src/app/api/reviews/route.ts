import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role = "user";
  if (user) {
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    role = prof?.role || "user";
  }

  const admin = createAdminClient();
  let q = admin.from("reviews").select("*, profile:profiles(first_name,last_name,avatar_url)").order("created_at", { ascending: false });
  if (role !== "admin" && role !== "coach") q = q.eq("status", "approved");

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { rating, comment } = await req.json();
  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5 || !comment?.trim())
    return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .insert({ user_id: user.id, rating: ratingNum, comment: comment.trim() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, review: data });
}
