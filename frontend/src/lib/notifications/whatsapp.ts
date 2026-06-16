/**
 * WhatsApp sender — placeholder.
 * Configure WHATSAPP_PROVIDER (twilio | meta) + WHATSAPP_API_KEY etc.
 * Without env config, messages are just logged to the server console.
 */
export async function sendWhatsapp(opts: {
  to: string | string[];
  body: string;
}) {
  const provider = process.env.WHATSAPP_PROVIDER;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const apiSecret = process.env.WHATSAPP_API_SECRET;
  const from = process.env.WHATSAPP_FROM_NUMBER;
  const apiUrl = process.env.WHATSAPP_API_URL;

  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to];

  if (!apiKey || !from) {
    // eslint-disable-next-line no-console
    console.log("[whatsapp:noop]", recipients.join(", "), opts.body.slice(0, 80));
    return { ok: false, skipped: true };
  }

  // ------ TWILIO ------
  if (provider === "twilio") {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${apiKey}/Messages.json`;
      const results = [];
      for (const to of recipients) {
        const body = new URLSearchParams({
          From: `whatsapp:${from}`,
          To: `whatsapp:${to}`,
          Body: opts.body
        });
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: "Basic " + Buffer.from(`${apiKey}:${apiSecret || ""}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body
        });
        results.push({ to, status: res.status });
      }
      return { ok: true, results };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  // ------ META / GENERIC ------
  if (provider === "meta" && apiUrl) {
    try {
      const results = [];
      for (const to of recipients) {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: opts.body }
          })
        });
        results.push({ to, status: res.status });
      }
      return { ok: true, results };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  // eslint-disable-next-line no-console
  console.log("[whatsapp:unknown-provider]", provider, opts.body.slice(0, 80));
  return { ok: false, skipped: true };
}
