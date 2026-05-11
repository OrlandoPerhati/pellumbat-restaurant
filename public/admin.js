const list = document.querySelector("[data-reservation-list]");
const filter = document.querySelector("[data-filter]");
const search = document.querySelector("[data-search]");
const refresh = document.querySelector("[data-refresh]");
const csvExportBtn = document.querySelector("[data-csv-export]");
const viewToggleButtons = document.querySelectorAll("[data-view]");
const calendarContainer = document.querySelector("[data-reservation-calendar]");
const calendarMonthLabel = document.querySelector("[data-calendar-month]");
const calendarWeekdays = document.querySelector("[data-calendar-weekdays]");
const calendarGrid = document.querySelector("[data-calendar-grid]");
const calendarDayPanel = document.querySelector("[data-calendar-day-panel]");
const calendarPrev = document.querySelector("[data-calendar-prev]");
const calendarNext = document.querySelector("[data-calendar-next]");
const loginPanel = document.querySelector("[data-login-panel]");
const loginForm = document.querySelector("[data-login-form]");
const loginNote = document.querySelector("[data-login-note]");
const adminApp = document.querySelector("[data-admin-app]");
const logoutButton = document.querySelector("[data-logout]");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");
const menuForm = document.querySelector("[data-menu-form]");
const menuNote = document.querySelector("[data-menu-note]");
const adminMenuList = document.querySelector("[data-admin-menu-list]");
const adminLanguageToggle = document.querySelector("[data-admin-language-toggle]");
const confirmModal = document.querySelector("[data-confirm-modal]");
const confirmMessage = document.querySelector("[data-confirm-message]");
const confirmCancel = document.querySelector("[data-confirm-cancel]");
const confirmDelete = document.querySelector("[data-confirm-delete]");
const stats = {
  total: document.querySelector('[data-stat="total"]'),
  new: document.querySelector('[data-stat="new"]'),
  confirmed: document.querySelector('[data-stat="confirmed"]'),
};

let reservations = [];
let menuItems = [];
let adminSessionToken = "";
let pendingDeleteReservationId = "";
let adminLanguage = localStorage.getItem("pellumbat-language") || "sq";
let activeView = "list"; // "list" or "calendar"
let searchQuery = "";
let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedCalendarDate = "";

// --- Tiny toast notification helper ---------------------------------------
// Replaces window.alert with inline, non-blocking feedback. Auto-dismisses after a few seconds.
function toast(message, type = "info") {
  let container = document.querySelector("[data-toast-container]");
  if (!container) {
    container = document.createElement("div");
    container.setAttribute("data-toast-container", "");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-visible"));
  setTimeout(() => {
    el.classList.remove("is-visible");
    setTimeout(() => el.remove(), 320);
  }, 3500);
}

function toIsoDate(date) {
  // Local-time YYYY-MM-DD. toISOString() would shift by timezone, which is wrong for date-only values.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Admin translations reuse the same localStorage key as the public website.
const adminTranslations = {
  sq: {
    "language.button": "English",
    "nav.website": "Faqja",
    "nav.reservations": "Rezervime",
    "nav.menu": "Menuja",
    "nav.refresh": "Rifresko",
    "nav.logout": "Dil",
    "login.eyebrow": "Zone e mbrojtur",
    "login.title": "Hyrja e adminit",
    "login.copy": "Perdor fjalekalimin lokal te adminit per te menaxhuar rezervimet dhe menune.",
    "login.password": "Fjalekalimi",
    "login.button": "Hyr",
    "login.checking": "Po kontrolloj fjalekalimin...",
    "login.error": "Nuk u krye hyrja.",
    "dashboard.eyebrow": "Paneli i adminit",
    "dashboard.title": "Rezervime",
    "dashboard.copy": "Shiko kerkesat e reja dhe perditeso statusin e cdo rezervimi.",
    "stats.total": "Total",
    "stats.new": "Te reja",
    "stats.confirmed": "Te konfirmuara",
    "reservations.requests": "Kerkesat",
    "reservations.status": "Statusi",
    "reservations.search": "Kërko",
    "reservations.searchPlaceholder": "Emër ose email",
    "reservations.viewList": "Listë",
    "reservations.viewCalendar": "Kalendar",
    "reservations.exportCsv": "Eksporto CSV",
    "reservations.csvSuccess": "CSV u shkarkua.",
    "reservations.csvEmpty": "Nuk ka rezervime për të eksportuar.",
    "reservations.calendarBookings": "rezervime",
    "reservations.calendarPickDay": "Klikoni një ditë për të parë rezervimet.",
    "reservations.loading": "Po ngarkohen rezervimet...",
    "reservations.none": "Nuk ka rezervime qe perputhen me kete pamje.",
    "reservations.error": "Nuk u ngarkuan rezervimet. Sigurohu qe serveri eshte ndezur.",
    "reservations.noDate": "Nuk ka date te zgjedhur",
    "reservations.guests": "te ftuar",
    "reservations.cancelCode": "Kodi i anulimit",
    "reservations.updateStatus": "Perditeso statusin",
    "reservations.cancel": "Anulo",
    "reservations.delete": "Fshi",
    "reservations.updateError": "Nuk u perditesua ai rezervim.",
    "reservations.deleteError": "Nuk u fshi ai rezervim.",
    "status.all": "Te gjitha",
    "status.new": "I ri",
    "status.confirmed": "I konfirmuar",
    "status.waiting": "Ne pritje",
    "status.completed": "I perfunduar",
    "status.canceled": "I anuluar",
    "menu.editor": "Editori i menuse",
    "menu.hint": "Ndryshimet shfaqen ne menune publike sapo faqja rifreskohet.",
    "menu.category": "Kategoria",
    "menu.small": "Pjata te vogla",
    "menu.mains": "Pjata kryesore",
    "menu.drinks": "Pije",
    "menu.name": "Emri",
    "menu.price": "Cmimi",
    "menu.tags": "Etiketa",
    "menu.tagsPlaceholder": "Vegjetariane, Sezonale",
    "menu.description": "Pershkrimi",
    "menu.availablePublic": "E dukshme ne menune publike",
    "menu.add": "Shto artikull",
    "menu.loading": "Po ngarkohet menuja...",
    "menu.none": "Ende nuk ka artikuj ne menu.",
    "menu.error": "Nuk u ngarkuan artikujt e menuse.",
    "menu.available": "E disponueshme",
    "menu.save": "Po ruhet artikulli...",
    "menu.saveError": "Nuk u ruajt ai artikull.",
    "menu.added": "Artikulli u shtua.",
    "menu.updateError": "Nuk u perditesua ai artikull.",
    "menu.confirmDelete": "Ta fshijme \"{name}\" nga menuja?",
    "menu.deleteError": "Nuk u fshi ai artikull.",
    "modal.eyebrow": "Konfirmo veprimin",
    "modal.title": "Te fshihet rezervimi?",
    "modal.copy": "Kjo do ta heqe rezervimin pergjithmone nga regjistrat lokal.",
    "modal.message": "Kjo do te fshije pergjithmone rezervimin per \"{name}\". Ky veprim nuk kthehet mbrapsht.",
    "modal.keep": "Mbaje rezervimin",
    "modal.delete": "Fshi rezervimin",
  },
  en: {
    "language.button": "Shqip",
    "nav.website": "Website",
    "nav.reservations": "Reservations",
    "nav.menu": "Menu",
    "nav.refresh": "Refresh",
    "nav.logout": "Log out",
    "login.eyebrow": "Protected area",
    "login.title": "Admin login",
    "login.copy": "Use the local admin password to manage reservations and menu items.",
    "login.password": "Password",
    "login.button": "Log in",
    "login.checking": "Checking password...",
    "login.error": "Could not log in.",
    "dashboard.eyebrow": "Admin dashboard",
    "dashboard.title": "Reservations",
    "dashboard.copy": "Review incoming table requests and move each booking through its current status.",
    "stats.total": "Total",
    "stats.new": "New",
    "stats.confirmed": "Confirmed",
    "reservations.requests": "Requests",
    "reservations.status": "Status",
    "reservations.search": "Search",
    "reservations.searchPlaceholder": "Name or email",
    "reservations.viewList": "List",
    "reservations.viewCalendar": "Calendar",
    "reservations.exportCsv": "Export CSV",
    "reservations.csvSuccess": "CSV downloaded.",
    "reservations.csvEmpty": "No reservations to export.",
    "reservations.calendarBookings": "bookings",
    "reservations.calendarPickDay": "Click a day to see its reservations.",
    "reservations.loading": "Loading reservations...",
    "reservations.none": "No reservation requests match this view.",
    "reservations.error": "Could not load reservations. Make sure the server is running.",
    "reservations.noDate": "No date selected",
    "reservations.guests": "guests",
    "reservations.cancelCode": "Cancel code",
    "reservations.updateStatus": "Update status",
    "reservations.cancel": "Cancel",
    "reservations.delete": "Delete",
    "reservations.updateError": "Could not update that reservation.",
    "reservations.deleteError": "Could not delete that reservation.",
    "status.all": "All",
    "status.new": "New",
    "status.confirmed": "Confirmed",
    "status.waiting": "Waiting",
    "status.completed": "Completed",
    "status.canceled": "Canceled",
    "menu.editor": "Menu editor",
    "menu.hint": "Changes appear on the public menu immediately after refresh.",
    "menu.category": "Category",
    "menu.small": "Small plates",
    "menu.mains": "Mains",
    "menu.drinks": "Drinks",
    "menu.name": "Name",
    "menu.price": "Price",
    "menu.tags": "Tags",
    "menu.tagsPlaceholder": "Vegetarian, Seasonal",
    "menu.description": "Description",
    "menu.availablePublic": "Available on public menu",
    "menu.add": "Add item",
    "menu.loading": "Loading menu...",
    "menu.none": "No menu items yet.",
    "menu.error": "Could not load menu items.",
    "menu.available": "Available",
    "menu.save": "Saving menu item...",
    "menu.saveError": "Could not save that menu item.",
    "menu.added": "Menu item added.",
    "menu.updateError": "Could not update that menu item.",
    "menu.confirmDelete": "Delete \"{name}\" from the menu?",
    "menu.deleteError": "Could not delete that menu item.",
    "modal.eyebrow": "Confirm action",
    "modal.title": "Delete reservation?",
    "modal.copy": "This will permanently remove the reservation from the local records.",
    "modal.message": "This will permanently delete the reservation for \"{name}\". This cannot be undone.",
    "modal.keep": "Keep reservation",
    "modal.delete": "Delete reservation",
  },
};

function authHeaders(extraHeaders = {}) {
  return {
    ...extraHeaders,
    Authorization: `Bearer ${adminSessionToken}`,
  };
}

function adminT(key, replacements = {}) {
  const text = adminTranslations[adminLanguage]?.[key] || adminTranslations.en[key] || key;
  return Object.entries(replacements).reduce((value, [name, replacement]) => {
    return value.replaceAll(`{${name}}`, replacement);
  }, text);
}

function statusLabel(status) {
  return adminT(`status.${String(status).toLowerCase()}`);
}

function applyAdminTranslations() {
  document.documentElement.lang = adminLanguage;
  document.querySelectorAll("[data-admin-i18n]").forEach((element) => {
    element.textContent = adminT(element.dataset.adminI18n);
  });
  document.querySelectorAll("[data-admin-i18n-placeholder]").forEach((element) => {
    element.placeholder = adminT(element.dataset.adminI18nPlaceholder);
  });
  adminLanguageToggle.textContent = adminT("language.button");
}

// Escaping keeps admin-rendered guest/menu text safe inside HTML templates.
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Formats stored date and time values into something staff can scan quickly.
function formatDateTime(date, time) {
  if (!date || !time) return adminT("reservations.noDate");
  return new Intl.DateTimeFormat(adminLanguage === "sq" ? "sq-AL" : "en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`${date}T${time}`));
}

// Updates the dashboard numbers at the top of the admin page.
function renderStats() {
  stats.total.textContent = reservations.length;
  stats.new.textContent = reservations.filter((item) => item.status === "New").length;
  stats.confirmed.textContent = reservations.filter((item) => item.status === "Confirmed").length;
}

// Applies the current filter, search, and (when in calendar mode) selected-day to the full reservation list.
function getVisibleReservations() {
  const selectedStatus = filter ? filter.value : "All";
  const q = searchQuery.toLowerCase();
  return reservations.filter((item) => {
    if (selectedStatus !== "All" && item.status !== selectedStatus) return false;
    if (activeView === "calendar" && selectedCalendarDate && item.date !== selectedCalendarDate) return false;
    if (!q) return true;
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q)
    );
  });
}

// Renders reservation cards and status dropdowns from the API response.
function renderReservations() {
  const visible = getVisibleReservations();

  renderStats();

  if (!visible.length) {
    list.innerHTML = `<p class="empty-state">${adminT("reservations.none")}</p>`;
    return;
  }

  list.innerHTML = visible
    .map(
      (reservation) => `
        <article class="reservation-card">
          <div class="reservation-main">
            <div>
              <p class="reservation-time">${escapeHtml(formatDateTime(reservation.date, reservation.time))}</p>
              <h3>${escapeHtml(reservation.name)}</h3>
              <p>${escapeHtml(reservation.party)} ${adminT("reservations.guests")}</p>
            </div>
            <span class="status-pill status-${escapeHtml(reservation.status.toLowerCase())}">${escapeHtml(statusLabel(reservation.status))}</span>
          </div>
          <div class="reservation-details">
            <a href="mailto:${escapeHtml(reservation.email)}">${escapeHtml(reservation.email)}</a>
            ${reservation.phone ? `<a href="tel:${escapeHtml(reservation.phone)}">${escapeHtml(reservation.phone)}</a>` : ""}
            ${reservation.cancellationCode ? `<span>${adminT("reservations.cancelCode")}: ${escapeHtml(reservation.cancellationCode)}</span>` : ""}
          </div>
          ${reservation.notes ? `<p class="reservation-notes">${escapeHtml(reservation.notes)}</p>` : ""}
          <div class="reservation-actions">
            <label class="status-control">
              ${adminT("reservations.updateStatus")}
              <select data-status="${escapeHtml(reservation.id)}">
                ${["New", "Confirmed", "Waiting", "Completed", "Canceled"]
                  .map(
                    (status) =>
                      `<option value="${status}" ${status === reservation.status ? "selected" : ""}>${statusLabel(status)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <button class="ghost-button" type="button" data-cancel-reservation="${escapeHtml(reservation.id)}">${adminT("reservations.cancel")}</button>
            <button class="ghost-button danger" type="button" data-delete-reservation="${escapeHtml(reservation.id)}">${adminT("reservations.delete")}</button>
          </div>
        </article>
      `,
    )
    .join("");
}

// Loads reservation requests. This requires a valid admin session.
async function loadReservations() {
  list.innerHTML = `<p class="empty-state">${adminT("reservations.loading")}</p>`;
  const response = await fetch("/api/reservations", { headers: authHeaders() });
  if (!response.ok) {
    list.innerHTML = `<p class="empty-state">${adminT("reservations.error")}</p>`;
    return;
  }

  const data = await response.json();
  reservations = data.reservations || [];
  renderReservations();
  if (activeView === "calendar") renderCalendar();
}

// Renders the menu editor list, including availability toggles and delete buttons.
function renderMenuItems() {
  if (!menuItems.length) {
    adminMenuList.innerHTML = `<p class="empty-state">${adminT("menu.none")}</p>`;
    return;
  }

  adminMenuList.innerHTML = menuItems
    .map(
      (item) => `
        <article class="admin-menu-card">
          <div>
            <p class="reservation-time">${escapeHtml(item.category)}</p>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <p class="admin-hint">${escapeHtml(item.price)}${item.tags ? ` · ${escapeHtml(item.tags)}` : ""}</p>
          </div>
          <div class="menu-card-actions">
            <label class="check-control">
              <input type="checkbox" data-availability="${escapeHtml(item.id)}" ${item.available ? "checked" : ""} />
              ${adminT("menu.available")}
            </label>
            <button class="ghost-button danger" type="button" data-delete-menu="${escapeHtml(item.id)}">${adminT("reservations.delete")}</button>
          </div>
        </article>
      `,
    )
    .join("");
}

// Loads the menu from the server so staff can manage the same data guests see.
async function loadMenuItems() {
  adminMenuList.innerHTML = `<p class="empty-state">${adminT("menu.loading")}</p>`;
  const response = await fetch("/api/menu");
  if (!response.ok) {
    adminMenuList.innerHTML = `<p class="empty-state">${adminT("menu.error")}</p>`;
    return;
  }

  const data = await response.json();
  menuItems = data.menu || [];
  renderMenuItems();
}

// Saves a new status when staff move a booking through the workflow.
async function updateStatus(id, status) {
  const response = await fetch(`/api/reservations/${id}/status`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    toast(adminT("reservations.updateError"), "error");
  }

  await loadReservations();
}

function openDeleteReservationModal(id) {
  const reservation = reservations.find((entry) => entry.id === id);
  if (!reservation) {
    return;
  }

  pendingDeleteReservationId = id;
  confirmMessage.textContent = adminT("modal.message", { name: reservation.name });
  confirmModal.classList.remove("is-hidden");
  confirmDelete.focus();
}

function closeDeleteReservationModal() {
  pendingDeleteReservationId = "";
  confirmModal.classList.add("is-hidden");
}

async function deleteReservation(id) {
  const response = await fetch(`/api/reservations/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!response.ok) {
    toast(adminT("reservations.deleteError"), "error");
  }

  closeDeleteReservationModal();
  await loadReservations();
}

// Adds a new dish or drink to the public menu.
async function addMenuItem(event) {
  event.preventDefault();
  const data = new FormData(menuForm);
  const payload = Object.fromEntries(data.entries());
  payload.available = data.get("available") === "on";
  menuNote.textContent = adminT("menu.save");

  const response = await fetch("/api/menu", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    menuNote.textContent = result.error || adminT("menu.saveError");
    return;
  }

  menuNote.textContent = adminT("menu.added");
  menuForm.reset();
  menuForm.elements.available.checked = true;
  await loadMenuItems();
}

// Toggles whether a menu item appears on the public site.
async function updateMenuAvailability(id, available) {
  const item = menuItems.find((entry) => entry.id === id);
  if (!item) return;

  const response = await fetch(`/api/menu/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ ...item, available }),
  });

  if (!response.ok) {
    toast(adminT("menu.updateError"), "error");
  }

  await loadMenuItems();
}

// Tracks which menu item is queued for deletion via the confirm modal.
let pendingDeleteMenuItemId = "";

function openDeleteMenuItemModal(id) {
  const item = menuItems.find((entry) => entry.id === id);
  if (!item) return;
  pendingDeleteMenuItemId = id;
  pendingDeleteReservationId = "";
  confirmMessage.textContent = adminT("menu.confirmDelete", { name: item.name });
  confirmModal.classList.remove("is-hidden");
  confirmDelete.focus();
}

// Removes a menu item once staff confirm via the shared modal.
async function deleteMenuItem(id) {
  const response = await fetch(`/api/menu/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!response.ok) {
    toast(adminT("menu.deleteError"), "error");
  }
  pendingDeleteMenuItemId = "";
  confirmModal.classList.add("is-hidden");
  await loadMenuItems();
}

// Shows either the login panel or the admin app based on session state.
function setAuthenticated(authenticated) {
  loginPanel.classList.toggle("is-hidden", authenticated);
  adminApp.classList.toggle("is-hidden", !authenticated);
  logoutButton.classList.toggle("is-hidden", !authenticated);
  refresh.classList.toggle("is-hidden", !authenticated);
  adminTabs.forEach((tab) => tab.classList.toggle("is-hidden", !authenticated));
}

// Checks whether the browser already has a valid admin cookie.
async function checkSession() {
  adminSessionToken = "";
  setAuthenticated(false);
}

// Sends the password to the server and starts an admin session when it is correct.
async function login(event) {
  event.preventDefault();
  loginNote.textContent = adminT("login.checking");
  const data = new FormData(loginForm);
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: data.get("password") }),
  });
  const result = await response.json();

  if (!response.ok) {
    loginNote.textContent = result.error || adminT("login.error");
    return;
  }

  adminSessionToken = result.session || "";
  loginForm.reset();
  loginNote.textContent = "";
  setAuthenticated(true);
  await Promise.all([loadReservations(), loadMenuItems()]);
}

// Clears the admin session and returns to the login view.
async function logout() {
  await fetch("/api/admin/logout", { method: "POST", headers: authHeaders() });
  adminSessionToken = "";
  reservations = [];
  menuItems = [];
  setAuthenticated(false);
}

// Switches between the reservations dashboard and menu editor.
function switchAdminTab(target) {
  adminPanels.forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.adminPanel !== target);
  });
}

list.addEventListener("change", (event) => {
  if (event.target.matches("[data-status]")) {
    updateStatus(event.target.dataset.status, event.target.value);
  }
});

list.addEventListener("click", (event) => {
  if (event.target.matches("[data-cancel-reservation]")) {
    updateStatus(event.target.dataset.cancelReservation, "Canceled");
  }

  if (event.target.matches("[data-delete-reservation]")) {
    openDeleteReservationModal(event.target.dataset.deleteReservation);
  }
});

confirmCancel.addEventListener("click", closeDeleteReservationModal);

confirmDelete.addEventListener("click", () => {
  if (pendingDeleteReservationId) {
    deleteReservation(pendingDeleteReservationId);
  } else if (pendingDeleteMenuItemId) {
    deleteMenuItem(pendingDeleteMenuItemId);
  }
});

confirmModal.addEventListener("click", (event) => {
  if (event.target === confirmModal) {
    closeDeleteReservationModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !confirmModal.classList.contains("is-hidden")) {
    closeDeleteReservationModal();
  }
});

filter.addEventListener("change", () => {
  renderReservations();
  if (activeView === "calendar") renderCalendar();
});

if (search) {
  search.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim();
    renderReservations();
  });
}

refresh.addEventListener("click", () => Promise.all([loadReservations(), loadMenuItems()]));
loginForm.addEventListener("submit", login);
logoutButton.addEventListener("click", logout);
menuForm.addEventListener("submit", addMenuItem);
adminLanguageToggle.addEventListener("click", () => {
  adminLanguage = adminLanguage === "sq" ? "en" : "sq";
  localStorage.setItem("pellumbat-language", adminLanguage);
  applyAdminTranslations();
  renderReservations();
  renderMenuItems();
  // Clear the cached weekday labels so they re-render in the new language.
  if (calendarWeekdays) calendarWeekdays.innerHTML = "";
  if (activeView === "calendar") renderCalendar();
});

adminTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchAdminTab(tab.dataset.adminTab));
});

adminMenuList.addEventListener("change", (event) => {
  if (event.target.matches("[data-availability]")) {
    updateMenuAvailability(event.target.dataset.availability, event.target.checked);
  }
});

adminMenuList.addEventListener("click", (event) => {
  if (event.target.matches("[data-delete-menu]")) {
    openDeleteMenuItemModal(event.target.dataset.deleteMenu);
  }
});

// --- CSV export -------------------------------------------------------------
// Builds a CSV from the *currently visible* reservations (so filter + search affect the export)
// and triggers a browser download. CSV fields are quoted and inner quotes escaped per RFC 4180.
function escapeCsvField(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return '"' + s.replaceAll('"', '""') + '"';
  return s;
}

function exportCsv() {
  const rows = getVisibleReservations();
  if (!rows.length) {
    toast(adminT("reservations.csvEmpty"), "info");
    return;
  }
  const headers = ["Date", "Time", "Name", "Email", "Phone", "Party", "Status", "Notes", "CancellationCode", "CreatedAt"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.date,
        r.time,
        r.name,
        r.email,
        r.phone,
        r.party,
        r.status,
        r.notes,
        r.cancellationCode,
        r.createdAt,
      ]
        .map(escapeCsvField)
        .join(","),
    );
  }
  // BOM keeps Excel happy when the CSV contains UTF-8 (Albanian diacritics).
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reservations-${toIsoDate(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast(adminT("reservations.csvSuccess"), "success");
}

if (csvExportBtn) csvExportBtn.addEventListener("click", exportCsv);

// --- View toggle (List vs Calendar) ----------------------------------------
function setActiveView(view) {
  activeView = view;
  viewToggleButtons.forEach((btn) => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });
  calendarContainer.classList.toggle("is-hidden", view !== "calendar");
  if (view === "calendar") {
    renderCalendar();
  } else {
    selectedCalendarDate = "";
    renderReservations();
  }
}

viewToggleButtons.forEach((btn) => {
  btn.addEventListener("click", () => setActiveView(btn.dataset.view));
});

// --- Calendar renderer ------------------------------------------------------
// Renders the month grid for `calendarCursor`. Each cell shows the day number plus
// a small badge with the number of bookings for that date. Clicking a cell scopes
// the list below to that day (selectedCalendarDate filter).
function renderCalendar() {
  if (!calendarGrid) return;

  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Week starts on Monday (European convention). getDay(): Sun=0..Sat=6 → shift so Mon=0..Sun=6.
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;

  const monthLabel = new Intl.DateTimeFormat(adminLanguage === "sq" ? "sq-AL" : "en", {
    month: "long",
    year: "numeric",
  }).format(firstOfMonth);
  if (calendarMonthLabel) calendarMonthLabel.textContent = monthLabel;

  if (calendarWeekdays && !calendarWeekdays.children.length) {
    const labels = adminLanguage === "sq"
      ? ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Die"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    calendarWeekdays.innerHTML = labels.map((l) => `<span>${l}</span>`).join("");
  }

  // Count active (non-canceled) bookings per ISO date for the current month.
  const counts = new Map();
  for (const r of reservations) {
    if (r.status === "Canceled") continue;
    counts.set(r.date, (counts.get(r.date) || 0) + 1);
  }

  const today = toIsoDate(new Date());
  let html = "";
  // Leading blanks for days before the 1st of the month.
  for (let i = 0; i < startWeekday; i += 1) {
    html += `<div class="calendar-cell is-empty"></div>`;
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateIso = toIsoDate(new Date(year, month, day));
    const count = counts.get(dateIso) || 0;
    const classes = ["calendar-cell"];
    if (count > 0) classes.push("has-bookings");
    if (dateIso === today) classes.push("is-today");
    if (dateIso === selectedCalendarDate) classes.push("is-selected");
    html += `
      <button type="button" class="${classes.join(" ")}" data-calendar-day="${dateIso}">
        <span class="calendar-day-num">${day}</span>
        ${count > 0 ? `<span class="calendar-day-count">${count}</span>` : ""}
      </button>
    `;
  }
  calendarGrid.innerHTML = html;

  // Day panel below the grid: shows reservations for the selected day (or a hint to pick one).
  if (selectedCalendarDate) {
    calendarDayPanel.classList.remove("is-hidden");
    const dayReservations = reservations.filter((r) => r.date === selectedCalendarDate);
    const dateLabel = new Intl.DateTimeFormat(adminLanguage === "sq" ? "sq-AL" : "en", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(`${selectedCalendarDate}T12:00:00`));
    calendarDayPanel.innerHTML = `
      <h4>${escapeHtml(dateLabel)}</h4>
      ${dayReservations.length === 0 ? `<p class="empty-state">${adminT("reservations.none")}</p>` : ""}
    `;
    renderReservations();
  } else {
    calendarDayPanel.classList.remove("is-hidden");
    calendarDayPanel.innerHTML = `<p class="admin-hint">${adminT("reservations.calendarPickDay")}</p>`;
    renderReservations();
  }
}

if (calendarPrev) {
  calendarPrev.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
    selectedCalendarDate = "";
    renderCalendar();
  });
}
if (calendarNext) {
  calendarNext.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
    selectedCalendarDate = "";
    renderCalendar();
  });
}
if (calendarGrid) {
  calendarGrid.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-calendar-day]");
    if (!cell) return;
    const date = cell.dataset.calendarDay;
    selectedCalendarDate = selectedCalendarDate === date ? "" : date;
    renderCalendar();
  });
}

applyAdminTranslations();
checkSession();
