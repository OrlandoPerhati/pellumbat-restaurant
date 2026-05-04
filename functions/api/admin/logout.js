import { bearerToken, destroySession, jsonResponse } from "../../_shared.js";

export async function onRequestPost({ request, env }) {
  await destroySession(bearerToken(request), env);
  return jsonResponse({ ok: true });
}
