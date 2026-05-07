import {
  availabilityForDate,
  jsonResponse,
  partyCount,
  readJsonBody,
  requireAdmin,
  rowToReservation,
  validateReservation,
} from "../../_shared.js";
import { sendReservationEmails } from "../../_email.js";

export async function onRequestGet({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const { results } = await env.DB.prepare(
    "SELECT * FROM reservations ORDER BY date ASC, time ASC",
  ).all();
  return jsonResponse({ reservations: (results || []).map(rowToReservation) });
}

export async function onRequestPost({ request, env }) {
  const input = await readJsonBody(request);
  const { reservation, error } = validateReservation(input);
  if (error) return jsonResponse({ error }, 400);

  const slots = await availabilityForDate(reservation.date, env);
  const slot = slots.find((item) => item.time === reservation.time);
  if (!slot || slot.seatsLeft < partyCount(reservation.party)) {
    return jsonResponse({ error: "That time is full. Please choose another time." }, 409);
  }

  await env.DB.prepare(
    `INSERT INTO reservations (
      id, name, email, phone, date, time, party, notes, status,
      cancellation_code, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      reservation.id,
      reservation.name,
      reservation.email,
      reservation.phone,
      reservation.date,
      reservation.time,
      reservation.party,
      reservation.notes,
      reservation.status,
      reservation.cancellationCode,
      reservation.createdAt,
    )
    .run();

  // Send confirmation emails. Failures inside the helper are logged but never thrown,
  // so a Resend outage cannot block a customer from completing a booking.
  await sendReservationEmails(reservation, env);

  return jsonResponse({ reservation }, 201);
}
