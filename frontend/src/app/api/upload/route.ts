import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const bucket = (form.get("bucket") as string) || "user-avatars";
  const folder = (form.get("folder") as string) || user.id;

  if (!file) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (!["user-avatars", "coach-images", "service-images"].includes(bucket))
    return NextResponse.json({ error: "invalid_bucket" }, { status: 400 });

  // Role checks
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = prof?.role || "user";
  if ((bucket === "coach-images" || bucket === "service-images") && role !== "coach" && role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (bucket === "user-avatars" && folder !== user.id && role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Size limits
  const maxBytes = bucket === "user-avatars" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes)
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  // Use service-role to bypass storage RLS in a controlled way (we already checked role above)
  const admin = createAdminClient();
  const { error } = await admin.storage.from(bucket).upload(path, bytes, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ ok: true, publicUrl: pub.publicUrl, path, bucket });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { bucket, path } = await req.json();
  if (!bucket || !path) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = prof?.role || "user";
  // Folder check for user-avatars
  if (bucket === "user-avatars") {
    const folder = path.split("/")[0];
    if (folder !== user.id && role !== "admin")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
  } else if (bucket === "coach-images" || bucket === "service-images") {
    if (role !== "coach" && role !== "admin")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin.storage.from(bucket).remove([path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
