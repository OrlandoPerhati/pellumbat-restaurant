const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || (IS_PRODUCTION ? "0.0.0.0" : "127.0.0.1");
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, "data");
const RESERVATIONS_FILE = path.join(DATA_DIR, "reservations.json");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const SLOT_CAPACITY = 18;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const sessions = new Set();

if (IS_PRODUCTION && (!process.env.ADMIN_PASSWORD || ADMIN_PASSWORD === "admin")) {
  throw new Error("Set a strong ADMIN_PASSWORD before running in production.");
}

// Static file types tell the browser how to interpret each served asset.
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

// The data store is intentionally simple for learning: JSON files instead of a database.
async function ensureDataStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(RESERVATIONS_FILE);
  } catch {
    await fs.writeFile(RESERVATIONS_FILE, "[]\n", "utf8");
  }
  try {
    await fs.access(MENU_FILE);
  } catch {
    await fs.writeFile(MENU_FILE, "[]\n", "utf8");
  }
}

// Reservation helpers keep file-reading and file-writing logic in one place.
async function readReservations() {
  await ensureDataStore();
  const raw = await fs.readFile(RESERVATIONS_FILE, "utf8");
  return JSON.parse(raw || "[]");
}

async function writeReservations(reservations) {
  await ensureDataStore();
  await fs.writeFile(RESERVATIONS_FILE, `${JSON.stringify(reservations, null, 2)}\n`, "utf8");
}

// Menu helpers use the same JSON pattern as reservations, so the admin editor can stay lightweight.
async function readMenu() {
  await ensureDataStore();
  const raw = await fs.readFile(MENU_FILE, "utf8");
  return JSON.parse(raw || "[]");
}

async function writeMenu(items) {
  await ensureDataStore();
  await fs.writeFile(MENU_FILE, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

// Consistent JSON responses make the frontend fetch code easier to read and debug.
function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

// Reads and parses JSON request bodies sent by forms and admin actions.
async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) {
      throw new Error("Request body is too large.");
    }
  }
  return JSON.parse(body || "{}");
}

// Small cleanup helpers normalize user input before saving it.
function cleanString(value) {
  return String(value || "").trim();
}

// This creates readable ids for menu items, like "market-fish" instead of a random string.
function slugify(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Cookie/session helpers provide a minimal local admin login without adding a full auth library.
function readCookie(request, name) {
  const header = request.headers.cookie || "";
  return header
    .split(";")
    .map((cookie) => cookie.trim().split("="))
    .find(([key]) => key === name)?.[1];
}

function isAdmin(request) {
  const authHeader = request.headers.authorization || "";
  const bearerSession = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  return Boolean(bearerSession && sessions.has(bearerSession));
}

function requireAdmin(request, response) {
  if (isAdmin(request)) {
    return true;
  }

  sendJson(response, 401, { error: "Admin login required." });
  return false;
}

function partyCount(value) {
  const match = cleanString(value).match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function activeReservation(reservation) {
  return !["Completed", "Canceled"].includes(reservation.status);
}

function createCancellationCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

// Availability is calculated from active reservations and a simple per-time-slot seat capacity.
async function availabilityForDate(date) {
  const reservations = await readReservations();
  const totals = new Map();
  reservations
    .filter((reservation) => reservation.date === date && activeReservation(reservation))
    .forEach((reservation) => {
      totals.set(reservation.time, (totals.get(reservation.time) || 0) + partyCount(reservation.party));
    });

  return ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map((time) => {
    const booked = totals.get(time) || 0;
    const seatsLeft = Math.max(SLOT_CAPACITY - booked, 0);
    return { time, booked, seatsLeft, available: seatsLeft > 0 };
  });
}

// Validates guest reservation requests before they are stored.
function validateReservation(input) {
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

// Validates menu items created or updated through the admin dashboard.
function validateMenuItem(input, existingId) {
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

  if (!item.name || !item.description || !item.price) {
    return { error: "Name, description, and price are required." };
  }

  return { item };
}

// API routes power the reservation form, admin login, admin dashboard, and menu editor.
async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, service: "restaurant-website" });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/admin/login") {
    const input = await readJsonBody(request);
    if (cleanString(input.password) !== ADMIN_PASSWORD) {
      sendJson(response, 401, { error: "Incorrect admin password." });
      return true;
    }

    const session = crypto.randomUUID();
    sessions.add(session);
    sendJson(response, 200, { ok: true, session });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/admin/logout") {
    const authHeader = request.headers.authorization || "";
    const session = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (session) {
      sessions.delete(session);
    }

    sendJson(response, 200, { ok: true });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/session") {
    sendJson(response, 200, { authenticated: isAdmin(request) });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/menu") {
    const menu = await readMenu();
    sendJson(response, 200, { menu });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/menu") {
    if (!requireAdmin(request, response)) return true;
    const input = await readJsonBody(request);
    const { item, error } = validateMenuItem(input);
    if (error) {
      sendJson(response, 400, { error });
      return true;
    }

    const menu = await readMenu();
    const existingIds = new Set(menu.map((entry) => entry.id));
    while (existingIds.has(item.id)) {
      item.id = `${item.id}-${crypto.randomUUID().slice(0, 4)}`;
    }
    menu.push(item);
    await writeMenu(menu);
    sendJson(response, 201, { item });
    return true;
  }

  const menuMatch = url.pathname.match(/^\/api\/menu\/([^/]+)$/);
  if ((request.method === "PATCH" || request.method === "DELETE") && menuMatch) {
    if (!requireAdmin(request, response)) return true;
    const menu = await readMenu();
    const index = menu.findIndex((item) => item.id === menuMatch[1]);
    if (index === -1) {
      sendJson(response, 404, { error: "Menu item not found." });
      return true;
    }

    if (request.method === "DELETE") {
      const [removed] = menu.splice(index, 1);
      await writeMenu(menu);
      sendJson(response, 200, { item: removed });
      return true;
    }

    const input = await readJsonBody(request);
    const { item, error } = validateMenuItem({ ...menu[index], ...input }, menu[index].id);
    if (error) {
      sendJson(response, 400, { error });
      return true;
    }

    menu[index] = item;
    await writeMenu(menu);
    sendJson(response, 200, { item });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/availability") {
    const date = cleanString(url.searchParams.get("date"));
    if (!date) {
      sendJson(response, 400, { error: "Date is required." });
      return true;
    }

    sendJson(response, 200, { slots: await availabilityForDate(date) });
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/reservations") {
    if (!requireAdmin(request, response)) return true;
    const reservations = await readReservations();
    reservations.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    sendJson(response, 200, { reservations });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/reservations") {
    try {
      const input = await readJsonBody(request);
      const { reservation, error } = validateReservation(input);
      if (error) {
        sendJson(response, 400, { error });
        return true;
      }

      const reservations = await readReservations();
      const slots = await availabilityForDate(reservation.date);
      const slot = slots.find((item) => item.time === reservation.time);
      if (!slot || slot.seatsLeft < partyCount(reservation.party)) {
        sendJson(response, 409, { error: "That time is full. Please choose another time." });
        return true;
      }

      reservations.unshift(reservation);
      await writeReservations(reservations);
      sendJson(response, 201, { reservation });
    } catch {
      sendJson(response, 400, { error: "Could not save the reservation request." });
    }
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/reservations/cancel") {
    try {
      const input = await readJsonBody(request);
      const email = cleanString(input.email).toLowerCase();
      const cancellationCode = cleanString(input.cancellationCode).toUpperCase();

      if (!email || !cancellationCode) {
        sendJson(response, 400, { error: "Email and cancellation code are required." });
        return true;
      }

      const reservations = await readReservations();
      const reservation = reservations.find((item) => {
        return (
          cleanString(item.email).toLowerCase() === email &&
          cleanString(item.cancellationCode).toUpperCase() === cancellationCode
        );
      });

      if (!reservation) {
        sendJson(response, 404, { error: "No reservation matched that email and cancellation code." });
        return true;
      }

      if (reservation.status === "Canceled") {
        sendJson(response, 200, { reservation });
        return true;
      }

      reservation.status = "Canceled";
      reservation.canceledBy = "customer";
      reservation.canceledAt = new Date().toISOString();
      reservation.updatedAt = reservation.canceledAt;
      await writeReservations(reservations);
      sendJson(response, 200, { reservation });
    } catch {
      sendJson(response, 400, { error: "Could not cancel the reservation." });
    }
    return true;
  }

  const statusMatch = url.pathname.match(/^\/api\/reservations\/([^/]+)\/status$/);
  if (request.method === "PATCH" && statusMatch) {
    if (!requireAdmin(request, response)) return true;
    try {
      const input = await readJsonBody(request);
      const status = cleanString(input.status);
      const allowed = new Set(["New", "Confirmed", "Waiting", "Completed", "Canceled"]);
      if (!allowed.has(status)) {
        sendJson(response, 400, { error: "Invalid reservation status." });
        return true;
      }

      const reservations = await readReservations();
      const reservation = reservations.find((item) => item.id === statusMatch[1]);
      if (!reservation) {
        sendJson(response, 404, { error: "Reservation not found." });
        return true;
      }

      reservation.status = status;
      reservation.updatedAt = new Date().toISOString();
      await writeReservations(reservations);
      sendJson(response, 200, { reservation });
    } catch {
      sendJson(response, 400, { error: "Could not update the reservation." });
    }
    return true;
  }

  const reservationMatch = url.pathname.match(/^\/api\/reservations\/([^/]+)$/);
  if (request.method === "DELETE" && reservationMatch) {
    if (!requireAdmin(request, response)) return true;
    const reservations = await readReservations();
    const index = reservations.findIndex((item) => item.id === reservationMatch[1]);
    if (index === -1) {
      sendJson(response, 404, { error: "Reservation not found." });
      return true;
    }

    const [removed] = reservations.splice(index, 1);
    await writeReservations(reservations);
    sendJson(response, 200, { reservation: removed });
    return true;
  }

  return false;
}

// Serves normal website files such as HTML, CSS, JavaScript, and images.
async function serveStatic(request, response, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") {
    pathname = "/index.html";
  }

  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

// Every request enters here first, then gets routed to either the API or static files.
const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${HOST}:${PORT}`);

  try {
    if (url.pathname.startsWith("/api/") && (await handleApi(request, response, url))) {
      return;
    }

    await serveStatic(request, response, url);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error." });
  }
});

ensureDataStore().then(() => {
  server.listen(PORT, HOST, () => {
    console.log(`Restaurant site running at http://${HOST}:${PORT}/`);
    console.log(`Admin page: http://${HOST}:${PORT}/admin.html`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
});
