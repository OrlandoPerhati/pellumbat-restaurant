import { jsonResponse, requireAdmin, rowToReservation } from "../../_shared.js";

export async function onRequestDelete({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const row = await env.DB.prepare("SELECT * FROM reservations WHERE id = ?")
    .bind(params.id)
    .first();
  if (!row) return jsonResponse({ error: "Reservation not found." }, 404);

  await env.DB.prepare("DELETE FROM reservations WHERE id = ?").bind(params.id).run();
  return jsonResponse({ reservation: rowToReservation(row) });
}
