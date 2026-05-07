// Email helper. Sends transactional email via Resend's HTTP API.
// Underscore prefix keeps this file out of the route table.
//
// To swap providers later (Mailgun, Postmark, etc.) only this file changes —
// the rest of the codebase calls sendReservationEmail() and doesn't care which provider runs underneath.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Resend's free tier requires either a verified domain OR using the test sender.
// Until you verify a custom domain on resend.com, emails come from this address.
const FROM_ADDRESS = "Pellumbat e Paqes <onboarding@resend.dev>";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function customerEmailHtml(reservation) {
  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #1f2522;">
      <h1 style="font-family: Georgia, serif; font-size: 28px; margin: 0 0 12px;">Pellumbat e Paqes</h1>
      <p>Faleminderit, ${escapeHtml(reservation.name)}.</p>
      <p>Kerkesa juaj per rezervim u ruajt. Ekipi do t'ju kontaktoje per te konfirmuar detajet.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 18px 0; background: #fbf6ec; border-radius: 8px;">
        <tr><td style="padding: 12px 16px; font-weight: 700;">Data</td><td style="padding: 12px 16px;">${escapeHtml(reservation.date)}</td></tr>
        <tr><td style="padding: 12px 16px; font-weight: 700;">Ora</td><td style="padding: 12px 16px;">${escapeHtml(reservation.time)}</td></tr>
        <tr><td style="padding: 12px 16px; font-weight: 700;">Personat</td><td style="padding: 12px 16px;">${escapeHtml(reservation.party)}</td></tr>
        ${reservation.notes ? `<tr><td style="padding: 12px 16px; font-weight: 700;">Shenime</td><td style="padding: 12px 16px;">${escapeHtml(reservation.notes)}</td></tr>` : ""}
      </table>
      <p>Kodi i anulimit (ruajeni nese deshironi te anuloni me vone):</p>
      <p style="font-family: Consolas, monospace; font-size: 22px; letter-spacing: 3px; padding: 12px 16px; background: #1f2522; color: #fffaf0; border-radius: 8px; display: inline-block;">${escapeHtml(reservation.cancellationCode)}</p>
      <p style="margin-top: 28px; color: #657067; font-size: 14px;">WhatsApp: +355 686264646<br>Rruga e Arberit 1, Tirane</p>
    </div>
  `;
}

function ownerEmailHtml(reservation) {
  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 540px; padding: 16px; color: #1f2522;">
      <h2 style="margin: 0 0 12px;">Kerkese e re per rezervim</h2>
      <ul style="line-height: 1.7;">
        <li><b>Emri:</b> ${escapeHtml(reservation.name)}</li>
        <li><b>Email:</b> ${escapeHtml(reservation.email)}</li>
        ${reservation.phone ? `<li><b>Telefon:</b> ${escapeHtml(reservation.phone)}</li>` : ""}
        <li><b>Data / Ora:</b> ${escapeHtml(reservation.date)} ${escapeHtml(reservation.time)}</li>
        <li><b>Personat:</b> ${escapeHtml(reservation.party)}</li>
        ${reservation.notes ? `<li><b>Shenime:</b> ${escapeHtml(reservation.notes)}</li>` : ""}
        <li><b>Kodi i anulimit:</b> ${escapeHtml(reservation.cancellationCode)}</li>
      </ul>
    </div>
  `;
}

async function send(env, payload) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send.");
    return { skipped: true };
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`Resend API error ${response.status}: ${text}`);
    return { error: text || `HTTP ${response.status}` };
  }

  return await response.json();
}

// Sends one or two emails after a reservation is created.
// Both calls are wrapped so an email failure never blocks the reservation itself.
export async function sendReservationEmails(reservation, env) {
  const tasks = [];

  tasks.push(
    send(env, {
      from: FROM_ADDRESS,
      to: reservation.email,
      subject: "Kerkesa juaj per rezervim - Pellumbat e Paqes",
      html: customerEmailHtml(reservation),
    }).catch((error) => {
      console.error("Customer email failed:", error);
    }),
  );

  if (env.OWNER_EMAIL) {
    tasks.push(
      send(env, {
        from: FROM_ADDRESS,
        to: env.OWNER_EMAIL,
        reply_to: reservation.email,
        subject: `Rezervim i ri: ${reservation.name} - ${reservation.date} ${reservation.time}`,
        html: ownerEmailHtml(reservation),
      }).catch((error) => {
        console.error("Owner email failed:", error);
      }),
    );
  }

  await Promise.all(tasks);
}
