import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./email";
import { sendWhatsapp } from "./whatsapp";
import { fillTemplate, STATUS_FR } from "@/lib/utils";
import type { NotificationType } from "@/types/database";

interface NotifyArgs {
  type: NotificationType;
  vars: Record<string, string | number | undefined | null>;
  userEmail?: string | null;
  userPhone?: string | null;
}

export async function dispatchNotification({ type, vars, userEmail, userPhone }: NotifyArgs) {
  const admin = createAdminClient();
  const { data: tpl } = await admin
    .from("notification_templates")
    .select("*")
    .eq("type", type)
    .maybeSingle();

  if (!tpl) return { ok: false, error: "template_missing" };

  // Translate status to FR if present
  const enrichedVars = {
    ...vars,
    status: typeof vars.status === "string" ? STATUS_FR[vars.status] || vars.status : vars.status
  };

  const subject = fillTemplate(tpl.subject || "Notification", enrichedVars);
  const bodyEmail = fillTemplate(tpl.body_email || "", enrichedVars);
  const bodyWa = fillTemplate(tpl.body_whatsapp || "", enrichedVars);

  if (type.endsWith("_user")) {
    if (userEmail) await sendEmail({ to: userEmail, subject, text: bodyEmail });
    if (userPhone) await sendWhatsapp({ to: userPhone, body: bodyWa });
  } else {
    const [{ data: emails }, { data: whats }] = await Promise.all([
      admin.from("notification_emails").select("email").eq("active", true),
      admin.from("notification_whatsapp").select("phone_number").eq("active", true)
    ]);
    const emailList = (emails || []).map((e: any) => e.email);
    const waList = (whats || []).map((w: any) => w.phone_number);
    if (emailList.length) await sendEmail({ to: emailList, subject, text: bodyEmail });
    if (waList.length) await sendWhatsapp({ to: waList, body: bodyWa });
  }

  return { ok: true };
}
