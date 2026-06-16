import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/notifications/email";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return p?.role === "admin" ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json();
  if (!name || !email || !message)
    return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contact_messages")
    .insert({ name, email, phone: phone || null, message })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: emails } = await admin.from("notification_emails").select("email").eq("active", true);
  const emailList = (emails || []).map((e: any) => e.email);
  if (emailList.length) {
    await sendEmail({
      to: emailList,
      subject: `Nouveau message de contact — ${name}`,
      text: `${name} (${email}${phone ? `, ${phone}` : ""}) a écrit :\n\n${message}`
    });
  }

  return NextResponse.json({ ok: true, message: data });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id, read } = await req.json();
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("contact_messages").update({ read }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, message: data });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from("contact_messages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
