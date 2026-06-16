import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "noreply@example.com";
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}) {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.log("[email:noop]", opts.subject, "->", opts.to);
    return { ok: false, skipped: true };
  }
  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html || `<pre style="font-family:DM Sans,sans-serif;white-space:pre-wrap">${escapeHtml(opts.text)}</pre>`
    });
    return { ok: true, result };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[email:error]", e);
    return { ok: false, error: (e as Error).message };
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
