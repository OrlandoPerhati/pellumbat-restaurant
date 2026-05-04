import { availabilityForDate, cleanString, jsonResponse } from "../_shared.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const date = cleanString(url.searchParams.get("date"));
  if (!date) return jsonResponse({ error: "Date is required." }, 400);
  return jsonResponse({ slots: await availabilityForDate(date, env) });
}
