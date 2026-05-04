import { cleanString, jsonResponse, readJsonBody, requireAdmin, rowToReservation } from "../../../_shared.js";

const ALLOWED = new Set(["New", "Confirmed", "Waiting", "Completed", "Canceled"]);

export async function onRequestPatch({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const input = await readJsonBody(request);
  const status = cleanString(input.status);
  if (!ALLOWED.has(status)) {
    return jsonResponse({ error: "Invalid reservation status." }, 400);
  }

  const row = await env.DB.prepare("SELECT * FROM reservations WHERE id = ?")
    .bind(params.id)
    .first();
  if (!row) return jsonResponse({ error: "Reservation not found." }, 404);

  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, now, params.id)
    .run();

  return jsonResponse({ reservation: rowToReservation({ ...row, status, updated_at: now }) });
}
