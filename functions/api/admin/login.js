import { cleanString, createSession, jsonResponse, readJsonBody } from "../../_shared.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return jsonResponse({ error: "Admin password is not configured." }, 500);
  }

  const input = await readJsonBody(request);
  if (cleanString(input.password) !== env.ADMIN_PASSWORD) {
    return jsonResponse({ error: "Incorrect admin password." }, 401);
  }

  const session = await createSession(env);
  return jsonResponse({ ok: true, session });
}
