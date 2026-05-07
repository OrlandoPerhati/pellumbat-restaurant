import {
  checkLoginRateLimit,
  cleanString,
  clearLoginAttempts,
  createSession,
  getClientIp,
  jsonResponse,
  readJsonBody,
  recordFailedLogin,
} from "../../_shared.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return jsonResponse({ error: "Admin password is not configured." }, 500);
  }

  const ip = getClientIp(request);

  const limit = await checkLoginRateLimit(env, ip);
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return jsonResponse(
      { error: `Too many failed attempts. Try again in ${minutes} minute(s).` },
      429,
    );
  }

  const input = await readJsonBody(request);
  if (cleanString(input.password) !== env.ADMIN_PASSWORD) {
    await recordFailedLogin(env, ip);
    return jsonResponse({ error: "Incorrect admin password." }, 401);
  }

  await clearLoginAttempts(env, ip);
  const session = await createSession(env);
  return jsonResponse({ ok: true, session });
}
