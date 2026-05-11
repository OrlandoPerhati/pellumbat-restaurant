// Shared helpers used by every Pages Function. Underscore prefix keeps this file out of the route table.

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SLOT_TIMES = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
export const SLOT_CAPACITY = 18;

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function cleanString(value) {
  return String(value ?? "").trim();
}

export function slugify(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function partyCount(value) {
  const match = cleanString(value).match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function activeReservation(reservation) {
  return !["Completed", "Canceled"].includes(reservation.status);
}

export function createCancellationCode() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function bearerToken(request) {
  const auth = request.headers.get("Authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : "";
}

export async function isAdmin(request, env) {
  const token = bearerToken(request);
  if (!token) return false;
  const row = await env.DB.prepare(
    "SELECT id FROM sessions WHERE id = ? AND expires_at > ?",
  )
    .bind(token, Date.now())
    .first();
  return Boolean(row);
}

export async function requireAdmin(request, env) {
  if (await isAdmin(request, env)) return null;
  return jsonResponse({ error: "Admin login required." }, 401);
}

export async function createSession(env) {
  const id = crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(Date.now()).run();
  await env.DB.prepare("INSERT INTO sessions (id, expires_at) VALUES (?, ?)")
    .bind(id, expiresAt)
    .run();
  return id;
}

export async function destroySession(token, env) {
  if (!token) return;
  await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
}

// --- Login rate limiting ---------------------------------------------------
// We allow MAX_ATTEMPTS failures within ATTEMPT_WINDOW_MS. After that the IP
// is locked for LOCKOUT_MS. A successful login clears the counter.

const MAX_LOGIN_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

export function getClientIp(request) {
  // Cloudflare always sets CF-Connecting-IP for traffic going through their network.
  // X-Forwarded-For is a generic fallback in case the request bypasses CF (e.g., local dev).
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    ""
  );
}

export async function checkLoginRateLimit(env, ip) {
  if (!ip) return { allowed: true };
  const row = await env.DB.prepare(
    "SELECT locked_until FROM login_attempts WHERE ip = ?",
  )
    .bind(ip)
    .first();
  if (!row) return { allowed: true };

  const now = Date.now();
  if (row.locked_until > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((row.locked_until - now) / 1000) };
  }
  return { allowed: true };
}

export async function recordFailedLogin(env, ip) {
  if (!ip) return;
  const now = Date.now();
  const row = await env.DB.prepare(
    "SELECT attempts, first_attempt_at FROM login_attempts WHERE ip = ?",
  )
    .bind(ip)
    .first();

  if (!row || now - row.first_attempt_at > ATTEMPT_WINDOW_MS) {
    // First failure or the previous window has expired — start a fresh count.
    await env.DB.prepare(
      "INSERT OR REPLACE INTO login_attempts (ip, attempts, first_attempt_at, locked_until) VALUES (?, ?, ?, ?)",
    )
      .bind(ip, 1, now, 0)
      .run();
    return;
  }

  const newAttempts = row.attempts + 1;
  const lockedUntil = newAttempts >= MAX_LOGIN_ATTEMPTS ? now + LOCKOUT_MS : 0;
  await env.DB.prepare(
    "UPDATE login_attempts SET attempts = ?, locked_until = ? WHERE ip = ?",
  )
    .bind(newAttempts, lockedUntil, ip)
    .run();
}

export async function clearLoginAttempts(env, ip) {
  if (!ip) return;
  await env.DB.prepare("DELETE FROM login_attempts WHERE ip = ?").bind(ip).run();
}

// --- Cloudflare Turnstile verification -------------------------------------
// Turnstile is Cloudflare's CAPTCHA replacement. The widget runs in the browser,
// produces a single-use token after the visitor passes the challenge, and we verify
// that token server-side before trusting the form submission.

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token, ip, env) {
  // If the secret isn't configured (e.g., local dev) we skip verification rather than block all bookings.
  if (!env.TURNSTILE_SECRET_KEY) {
    return { success: true, skipped: true };
  }
  if (!token) {
    return { success: false, error: "Missing verification token." };
  }

  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET_KEY);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Turnstile verify failed:", error);
    return { success: false, error: "Verification service unreachable." };
  }
}

export function rowToMenuItem(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description,
    price: row.price,
    tags: row.tags || "",
    available: Boolean(row.available),
  };
}

export function rowToReservation(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    date: row.date,
    time: row.time,
    party: row.party,
    notes: row.notes || "",
    status: row.status,
    cancellationCode: row.cancellation_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
    canceledAt: row.canceled_at || undefined,
    canceledBy: row.canceled_by || undefined,
  };
}

export function validateMenuItem(input, existingId) {
  const item = {
    id: existingId || slugify(input.name) || crypto.randomUUID(),
    category: cleanString(input.category),
    name: cleanString(input.name),
    description: cleanString(input.description),
    price: cleanString(input.price),
    tags: cleanString(input.tags),
    available: Boolean(input.available),
  };

  if (!["small", "mains", "drinks"].includes(item.category)) {
    return { error: "Choose a valid menu category." };
  }
  if (!item.name || !item.price) {
    return { error: "Name and price are required." };
  }
  return { item };
}

export function validateReservation(input) {
  const reservation = {
    id: crypto.randomUUID(),
    name: cleanString(input.name),
    email: cleanString(input.email),
    phone: cleanString(input.phone),
    date: cleanString(input.date),
    time: cleanString(input.time),
    party: cleanString(input.party),
    notes: cleanString(input.notes),
    status: "New",
    cancellationCode: createCancellationCode(),
    createdAt: new Date().toISOString(),
  };

  if (!reservation.name || !reservation.email || !reservation.date || !reservation.time || !reservation.party) {
    return { error: "Name, email, date, time, and party size are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservation.email)) {
    return { error: "Please enter a valid email address." };
  }
  if (partyCount(reservation.party) < 1) {
    return { error: "Please select a party size." };
  }
  return { reservation };
}

export async function availabilityForDate(date, env) {
  const { results } = await env.DB.prepare(
    `SELECT time, party, status FROM reservations WHERE date = ?`,
  )
    .bind(date)
    .all();

  const totals = new Map();
  for (const row of results || []) {
    if (!activeReservation(row)) continue;
    totals.set(row.time, (totals.get(row.time) || 0) + partyCount(row.party));
  }

  return SLOT_TIMES.map((time) => {
    const booked = totals.get(time) || 0;
    const seatsLeft = Math.max(SLOT_CAPACITY - booked, 0);
    return { time, booked, seatsLeft, available: seatsLeft > 0 };
  });
}
