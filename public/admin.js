const list = document.querySelector("[data-reservation-list]");
const filter = document.querySelector("[data-filter]");
const refresh = document.querySelector("[data-refresh]");
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

// Renders reservation cards and status dropdowns from the API response.
function renderReservations() {
  const selected = filter.value;
  const visible = selected === "All" ? reservations : reservations.filter((item) => item.status === selected);

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
    alert(adminT("reservations.updateError"));
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
    alert(adminT("reservations.deleteError"));
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
    alert(adminT("menu.updateError"));
  }

  await loadMenuItems();
}

// Removes a menu item after staff confirm the destructive action.
async function deleteMenuItem(id) {
  const item = menuItems.find((entry) => entry.id === id);
  if (!item || !confirm(adminT("menu.confirmDelete", { name: item.name }))) {
    return;
  }

  const response = await fetch(`/api/menu/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!response.ok) {
    alert(adminT("menu.deleteError"));
  }

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

filter.addEventListener("change", renderReservations);
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
    deleteMenuItem(event.target.dataset.deleteMenu);
  }
});

applyAdminTranslations();
checkSession();
