import { cleanString, jsonResponse, readJsonBody, rowToReservation } from "../../_shared.js";

export async function onRequestPost({ request, env }) {
  const input = await readJsonBody(request);
  const email = cleanString(input.email).toLowerCase();
  const cancellationCode = cleanString(input.cancellationCode).toUpperCase();

  if (!email || !cancellationCode) {
    return jsonResponse({ error: "Email and cancellation code are required." }, 400);
  }

  const row = await env.DB.prepare(
    "SELECT * FROM reservations WHERE LOWER(email) = ? AND UPPER(cancellation_code) = ?",
  )
    .bind(email, cancellationCode)
    .first();

  if (!row) {
    return jsonResponse({ error: "No reservation matched that email and cancellation code." }, 404);
  }

  if (row.status === "Canceled") {
    return jsonResponse({ reservation: rowToReservation(row) });
  }

  const now = new Date().toISOString();
  await env.DB.prepare(
    "UPDATE reservations SET status = ?, canceled_by = ?, canceled_at = ?, updated_at = ? WHERE id = ?",
  )
    .bind("Canceled", "customer", now, now, row.id)
    .run();

  const updated = { ...row, status: "Canceled", canceled_by: "customer", canceled_at: now, updated_at: now };
  return jsonResponse({ reservation: rowToReservation(updated) });
}
