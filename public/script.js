const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector(".nav-toggle");
const tabs = document.querySelectorAll("[data-menu-tab]");
const menuTabsContainer = document.querySelector(".menu-tabs");
const languageToggle = document.querySelector("[data-language-toggle]");
const menuList = document.querySelector("[data-menu-list]");
const reserveForm = document.querySelector("[data-reserve-form]");
const formNote = document.querySelector("[data-form-note]");
const cancelForm = document.querySelector("[data-cancel-form]");
const cancelNote = document.querySelector("[data-cancel-note]");
const reserveDate = document.querySelector("[data-reserve-date]");
const timeSelect = document.querySelector("[data-time-select]");
// Could be a single <img> or the new slideshow wrapper — parallax works on either.
const heroImage = document.querySelector(".hero-slideshow") || document.querySelector(".hero > img");
const heroSlideshow = document.querySelector("[data-hero-slideshow]");

const tabIndicator = document.createElement("span");
tabIndicator.className = "tab-indicator";
menuTabsContainer.prepend(tabIndicator);

// These variables track which menu category and language the guest is currently viewing.
let menuItems = [];
let activeMenuCategory = "small";
let menuLoaded = false;
let currentLanguage = localStorage.getItem("pellumbat-language") || "sq";

// Maps a sub-category tag to the cover image shown above its items.
// Adding a new sub-category? Drop a webp here and into public/assets/categories/.
const SUBCATEGORY_COVERS = {
  "Kafeteri": "assets/categories/kafeteri.webp",
  "Freskuese": "assets/categories/freskuese.webp",
  "Birrë": "assets/categories/birre.webp",
  "Pije Vendi": "assets/categories/pije-vendi.webp",
};

// Translation dictionary: every key represents one visible phrase on the public website.
const translations = {
  sq: {
    "nav.menu": "Menuja",
    "nav.events": "Evente",
    "nav.story": "Rreth nesh",
    "nav.faq": "Pyetje",
    "nav.visit": "Kontakt",
    "nav.reserve": "Rezervo",
    "language.button": "English",
    "hero.eyebrow": "Dasma. Evente. Bar. Restaurant.",
    "hero.copy":
      "Pellumbat e Paqes eshte nje ambient mikprites per dasma, evente, bar dhe restaurant. Na kontaktoni ne WhatsApp ose me telefon per te planifikuar daten tuaj.",
    "hero.reserve": "Rezervo ose kontakto",
    "hero.menu": "Shiko menune",
    "moments.share.label": "Dasma",
    "moments.share.title": "Nje ambient i ngrohte per festa te paharrueshme.",
    "moments.gather.label": "Evente",
    "moments.gather.title": "Festa private, mbremje familjare dhe momente te vecanta.",
    "moments.toast.label": "Bar",
    "moments.toast.title": "Pije, muzike dhe mbremje te kendshme me te ftuarit tuaj.",
    "quick.tonight": "Sherbime",
    "quick.tonightValue": "Dasma & Evente",
    "quick.experience": "Eksperience",
    "quick.experienceValue": "Pervoje 19-vjecare",
    "quick.parking": "Parking",
    "quick.parkingValue": "Parking falas",
    "quick.address": "Adresa",
    "gallery.eyebrow": "Galeria",
    "gallery.title": "Ambiente per cdo event",
    "gallery.copy":
      "Shikoni disa nga dekorimet, tavolinat dhe sallat e pergatitura per dasma, fejesa, ditelindje dhe evente familjare.",
    "gallery.wedding": "Dasma",
    "gallery.engagement": "Fejesa",
    "gallery.birthday": "Ditelindje",
    "gallery.dining": "Tavolina festive",
    "gallery.anniversary": "Per-vjetore",
    "menu.eyebrow": "Menuja aktuale",
    "menu.title": "Menuja e restaurantit",
    "menu.copy":
      "Menuja dhe cmimet finale do te shtohen sapo te jene gati. Per momentin mund te shikoni kategorite kryesore dhe te na kontaktoni per oferta per evente.",
    "menu.small": "Pjata te vogla",
    "menu.mains": "Pjata kryesore",
    "menu.drinks": "Pije",
    "menu.loading": "Duke ngarkuar menune...",
    "menu.empty": "Nuk ka artikuj te disponueshem ne kete seksion per momentin.",
    "menu.error": "Menuja nuk u ngarkua. Ju lutemi rifreskoni faqen.",
    "events.eyebrow": "Dasma & evente",
    "events.title": "Nje vend per dasma, festa familjare dhe mbremje te vecanta.",
    "events.copy":
      "Me pervoje 19-vjecare, Pellumbat e Paqes bashkon restaurantin, barin dhe atmosferen festive ne nje vend. Na shkruani ne WhatsApp per disponueshmeri.",
    "events.cta": "Shkruaj ne WhatsApp",
    "testimonials.eyebrow": "Vlerësime",
    "testimonials.title": "Çfarë thonë mysafirët tanë",
    "testimonials.q1":
      "Eventi i fejesës u organizua në mënyrë të përkryer. Stafi shumë i kujdesshëm dhe ambienti tepër mikpritës. E rekomandojmë me gjithë zemër.",
    "testimonials.q1.name": "Ana & Bekim",
    "testimonials.q1.role": "Fejesë, Maj 2025",
    "testimonials.q2":
      "Festuam 60-vjetorin e martesës këtu dhe nuk mund të zgjidhnim më mirë. Salla u dekorua mrekullueshëm dhe kuzhina ishte e shkëlqyer.",
    "testimonials.q2.name": "Familja Hoxha",
    "testimonials.q2.role": "Përvjetor 60-vjeçar",
    "testimonials.q3":
      "Kemi organizuar disa ditëlindje familjare në Pëllumbat e Paqes. Çdo herë komunikim i shpejtë dhe ekzekutim profesional. Faleminderit ekipi!",
    "testimonials.q3.name": "Klejdi M.",
    "testimonials.q3.role": "Ditëlindje familjare",
    "faq.eyebrow": "Pyetjet më të shpeshta",
    "faq.title": "Çfarë duan të dinë mysafirët",
    "faq.q1": "Sa mysafirë mund të presë salla?",
    "faq.a1":
      "Salla kryesore mban deri në 350 mysafirë për dasma dhe evente të mëdha. Për grupe më të vogla mund të organizojmë seksione më intime.",
    "faq.q2": "A ofron ambienti parking?",
    "faq.a2":
      "Po — kemi parking falas për të gjithë mysafirët, me hyrje direkt nga rruga kryesore. Stafi ndihmon për të orientuar makinat gjatë eventeve të mëdha.",
    "faq.q3": "A merreni edhe me kuzhinën?",
    "faq.a3":
      "Po. Ofrojmë menu të plota për dasma, fejesa dhe ditëlindje, të personalizueshme sipas dëshirës dhe numrit të mysafirëve. Detajet i konfirmojmë gjatë takimit paraprak.",
    "faq.q4": "Sa para një ngjarje duhet ta rezervoj datën?",
    "faq.a4":
      "Për dasma rekomandohet të rezervoni 3–6 muaj para datës. Për evente më të vogla, 3–4 javë mjafton në shumicën e rasteve.",
    "faq.q5": "A mund të sjellim dekorime tonat?",
    "faq.a5":
      "Sigurisht. Mund të bashkëpunojmë me dekoratorë të jashtëm, ose të ofrojmë vetë dekorimet tradicionale të sallës. Diskutojmë opsionet gjatë takimit.",
    "faq.q6": "Si bëhet pagesa dhe çfarë politike anulimi keni?",
    "faq.a6":
      "Konfirmimi i datës kërkon një paradhënie. Politika e anulimit varet nga afati i njoftimit dhe lloji i eventit — detajet specifikohen në marrëveshje.",
    "story.eyebrow": "Rreth nesh",
    "story.title": "Dasma, evente, bar dhe restaurant ne nje ambient mikprites.",
    "story.copy":
      "Prej 19 vitesh, Pellumbat e Paqes mirepret dasma, evente, bar dhe restaurant ne Tirane. Kjo faqe i ndihmon te ftuarit te kontaktojne ambientin dhe te kerkojne rezervim.",
    "story.card1.title": "Dasma",
    "story.card1.copy": "Nje ambient per cifte, familje, fotografi, darke dhe feste.",
    "story.card2.title": "Pervoje 19-vjecare",
    "story.card2.copy": "Mikpritje dhe organizim eventesh te ndertuara me vite pune dhe kujdes.",
    "story.card3.title": "Parking falas",
    "story.card3.copy": "Me parking falas per mysafiret, vizita behet me e lehte per familje dhe grupe.",
    "visit.eyebrow": "Kontakt",
    "visit.title": "Sherbimet dhe kontakti",
    "visit.wedThu": "Dasma",
    "visit.friSat": "Evente",
    "visit.sun": "Bar",
    "visit.monTue": "Restaurant",
    "visit.byReservation": "Me rezervim",
    "visit.contactForHours": "Kontaktoni per orarin",
    "visit.contactTitle": "Kontakt & WhatsApp",
    "visit.closed": "Mbyllur",
    "visit.copy": "Pellumbat e Paqes ndodhet ne Rruga e Arberit 1, Tirane, Albania. Ambienti ofron parking falas. Per dasma, evente, bar ose restaurant, telefononi ose shkruani ne WhatsApp: +355 686264646.",
    "reserve.eyebrow": "Rezervime",
    "reserve.title": "Kerko rezervim",
    "reserve.copy":
      "Per dasma dhe evente te tjera, dergoni kerkesen ketu dhe ne do t'ju kontaktojme per te konfirmuar detajet. Per tavolina ne bar ose restaurant, mund te na shkruani edhe direkt ne WhatsApp.",
    "form.name": "Emri",
    "form.email": "Emaili",
    "form.date": "Data",
    "form.time": "Ora",
    "form.party": "Numri i personave",
    "form.phone": "Telefoni",
    "form.notes": "Shenime",
    "form.notesPlaceholder": "Rasti, kerkesa per event, preferenca per tavoline",
    "form.select": "Zgjidh",
    "form.guests2": "2 persona",
    "form.guests3": "3 persona",
    "form.guests4": "4 persona",
    "form.guests5": "5 persona",
    "form.guests6": "6 persona",
    "form.guests7": "7+ persona",
    "form.submit": "Dergo kerkesen",
    "form.sending": "Duke derguar kerkesen...",
    "form.success": "Faleminderit, {name}. Kerkesa juaj u ruajt. Per dasma dhe evente, do t'ju kontaktojme per te konfirmuar detajet.",
    "form.successWithCode":
      "Faleminderit, {name}. Kerkesa juaj u ruajt. Kodi per anulim eshte {code}. Per dasma dhe evente, do t'ju kontaktojme per te konfirmuar detajet.",
    "form.error": "Rezervimi nuk u dergua. Ju lutemi telefononi ose shkruani ne WhatsApp.",
    "cancel.toggle": "Doni te anuloni nje rezervim ekzistues?",
    "cancel.eyebrow": "Anulim",
    "cancel.title": "Doni ta anuloni kerkesen?",
    "cancel.copy":
      "Perdorni emailin dhe kodin e anulimit nga kerkesa juaj. Anulimet per dasma dhe evente do te kontrollohen nga ekipi.",
    "cancel.code": "Kodi i anulimit",
    "cancel.submit": "Anulo kerkesen",
    "cancel.sending": "Duke anuluar kerkesen...",
    "cancel.success": "Kerkesa u anulua. Nese eshte dasme ose event, ekipi mund t'ju kontaktoje per detajet.",
    "cancel.error": "Kerkesa nuk u anulua. Kontrolloni emailin dhe kodin, ose na shkruani ne WhatsApp.",
    "availability.seatsLeft": "{time} - {count} vende te lira",
    "footer.admin": "Admin",
  },
  en: {
    "nav.menu": "Menu",
    "nav.events": "Events",
    "nav.story": "About",
    "nav.faq": "FAQ",
    "nav.visit": "Contact",
    "nav.reserve": "Reserve",
    "language.button": "Shqip",
    "hero.eyebrow": "Wedding. Events. Bar. Restaurant.",
    "hero.copy":
      "Pellumbat e Paqes is a welcoming venue for weddings, celebrations, bar service, and restaurant dining. Contact us on WhatsApp or by phone to plan your date.",
    "hero.reserve": "Reserve or contact",
    "hero.menu": "View menu",
    "moments.share.label": "Weddings",
    "moments.share.title": "A warm setting for unforgettable wedding celebrations.",
    "moments.gather.label": "Events",
    "moments.gather.title": "Private celebrations, family gatherings, and special evenings.",
    "moments.toast.label": "Bar",
    "moments.toast.title": "Drinks, music, and relaxed nights with your guests.",
    "quick.tonight": "Services",
    "quick.tonightValue": "Wedding & Events",
    "quick.experience": "Experience",
    "quick.experienceValue": "19 years",
    "quick.parking": "Parking",
    "quick.parkingValue": "Free parking",
    "quick.address": "Address",
    "gallery.eyebrow": "Gallery",
    "gallery.title": "Spaces for every event",
    "gallery.copy":
      "See real decor, table settings, and event halls prepared for weddings, engagements, birthdays, and family events.",
    "gallery.wedding": "Weddings",
    "gallery.engagement": "Engagements",
    "gallery.birthday": "Birthdays",
    "gallery.dining": "Celebration tables",
    "gallery.anniversary": "Anniversaries",
    "menu.eyebrow": "Current menu",
    "menu.title": "Restaurant menu",
    "menu.copy":
      "The final menu and real prices will be added soon. For now, browse the main categories and contact us for event offers.",
    "menu.small": "Small plates",
    "menu.mains": "Mains",
    "menu.drinks": "Drinks",
    "menu.loading": "Loading menu...",
    "menu.empty": "No items are available in this section right now.",
    "menu.error": "The menu could not be loaded. Please refresh the page.",
    "events.eyebrow": "Weddings & events",
    "events.title": "A place for weddings, family celebrations, and special nights.",
    "events.copy":
      "With 19 years of experience, Pellumbat e Paqes brings together the restaurant, bar, and event atmosphere in one place. Message us on WhatsApp to discuss availability.",
    "events.cta": "Message on WhatsApp",
    "testimonials.eyebrow": "Testimonials",
    "testimonials.title": "What our guests say",
    "testimonials.q1":
      "Our engagement event was organized perfectly. The team was attentive and the venue was warm and welcoming. We recommend it wholeheartedly.",
    "testimonials.q1.name": "Ana & Bekim",
    "testimonials.q1.role": "Engagement, May 2025",
    "testimonials.q2":
      "We celebrated our 60th wedding anniversary here — we couldn't have picked a better place. The hall was beautifully decorated and the food was excellent.",
    "testimonials.q2.name": "The Hoxha family",
    "testimonials.q2.role": "60th anniversary",
    "testimonials.q3":
      "We've held several family birthdays at Pëllumbat e Paqes. Every time the communication is fast and the execution is professional. Thank you, team!",
    "testimonials.q3.name": "Klejdi M.",
    "testimonials.q3.role": "Family birthday",
    "faq.eyebrow": "Frequently asked",
    "faq.title": "What guests want to know",
    "faq.q1": "How many guests can the hall hold?",
    "faq.a1":
      "The main hall holds up to 350 guests for weddings and large events. For smaller groups we can arrange more intimate sections.",
    "faq.q2": "Is there parking on site?",
    "faq.a2":
      "Yes — free parking for all guests, with direct entry from the main road. Our team helps direct cars during large events.",
    "faq.q3": "Do you also handle catering?",
    "faq.a3":
      "Yes. We offer full menus for weddings, engagements, and birthdays, customised to your wishes and guest count. The details are confirmed during the planning meeting.",
    "faq.q4": "How far in advance should I book?",
    "faq.a4":
      "For weddings, we recommend booking 3–6 months ahead. For smaller events, 3–4 weeks is usually enough.",
    "faq.q5": "Can we bring our own decorations?",
    "faq.a5":
      "Absolutely. We can work with outside decorators, or provide the venue's traditional decor ourselves. We discuss the options during the planning meeting.",
    "faq.q6": "How does payment and cancellation work?",
    "faq.a6":
      "Confirming the date requires a deposit. The cancellation policy depends on the notice given and the type of event — details are spelled out in the agreement.",
    "story.eyebrow": "About us",
    "story.title": "Wedding, events, bar, and restaurant in one welcoming space.",
    "story.copy":
      "For 19 years, Pellumbat e Paqes has welcomed weddings, events, bar guests, and restaurant visitors in Tirana. This website gives guests a clear place to contact the venue and request reservations.",
    "story.card1.title": "Weddings",
    "story.card1.copy": "A dedicated setting for couples, families, photos, dinner, and celebration.",
    "story.card2.title": "19 years of experience",
    "story.card2.copy": "Hospitality and event planning shaped by years of steady work and care.",
    "story.card3.title": "Free parking",
    "story.card3.copy": "Free guest parking makes visits easier for families, groups, and event guests.",
    "visit.eyebrow": "Contact",
    "visit.title": "Services and contact",
    "visit.wedThu": "Weddings",
    "visit.friSat": "Events",
    "visit.sun": "Bar",
    "visit.monTue": "Restaurant",
    "visit.byReservation": "By reservation",
    "visit.contactForHours": "Contact for hours",
    "visit.contactTitle": "Contact & WhatsApp",
    "visit.closed": "Closed",
    "visit.copy": "Pellumbat e Paqes is located at Rruga e Arberit 1, Tirane, Albania. The venue offers free parking. For weddings, events, bar, and restaurant questions, call or message us on WhatsApp at +355 686264646.",
    "reserve.eyebrow": "Reservations",
    "reserve.title": "Request a reservation",
    "reserve.copy":
      "For weddings and other events, send your request here and we will contact you back to confirm the details. For bar or restaurant tables, you can also message us directly on WhatsApp.",
    "form.name": "Name",
    "form.email": "Email",
    "form.date": "Date",
    "form.time": "Time",
    "form.party": "Party size",
    "form.phone": "Phone",
    "form.notes": "Notes",
    "form.notesPlaceholder": "Occasion, event request, table preference",
    "form.select": "Select",
    "form.guests2": "2 guests",
    "form.guests3": "3 guests",
    "form.guests4": "4 guests",
    "form.guests5": "5 guests",
    "form.guests6": "6 guests",
    "form.guests7": "7+ guests",
    "form.submit": "Send request",
    "form.sending": "Sending your request...",
    "form.success": "Thanks, {name}. Your request was saved. For weddings and events, we will contact you back to confirm the details.",
    "form.successWithCode":
      "Thanks, {name}. Your request was saved. Your cancellation code is {code}. For weddings and events, we will contact you back to confirm the details.",
    "form.error": "Could not send the request. Please call or message us on WhatsApp.",
    "cancel.toggle": "Need to cancel an existing reservation?",
    "cancel.eyebrow": "Cancellation",
    "cancel.title": "Need to cancel?",
    "cancel.copy":
      "Use the email and cancellation code from your request. Wedding and event cancellations are still reviewed by the team.",
    "cancel.code": "Cancellation code",
    "cancel.submit": "Cancel request",
    "cancel.sending": "Canceling your request...",
    "cancel.success": "Your request was canceled. If this is a wedding or event, the team may contact you about the details.",
    "cancel.error": "Could not cancel the request. Check the email and code, or message us on WhatsApp.",
    "availability.seatsLeft": "{time} - {count} seats left",
    "footer.admin": "Admin",
  },
};

function t(key, replacements = {}) {
  const text = translations[currentLanguage]?.[key] || translations.en[key] || key;
  return Object.entries(replacements).reduce((value, [name, replacement]) => {
    return value.replaceAll(`{${name}}`, replacement);
  }, text);
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });
  languageToggle.textContent = t("language.button");
  renderMenu();
  positionTabIndicator();
  if (reserveDate.value) {
    loadAvailability();
  }
}

// Escaping protects the page if menu text contains symbols like <, >, or quotes.
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Renders one menu item card. `skipPrimaryTag` is true when we're rendering inside a sub-group
// header so we don't repeat the group label as a pill on every card.
function renderMenuItemHtml(item, index, skipPrimaryTag) {
  const allTags = String(item.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const visibleTags = skipPrimaryTag ? allTags.slice(1) : allTags;
  const tagsHtml = visibleTags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

  return `
    <article class="menu-item" style="--enter-delay: ${index * 40}ms">
      <div>
        <div class="menu-item-heading">
          <h3>${escapeHtml(item.name)}</h3>
          <strong>${escapeHtml(item.price)}</strong>
        </div>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        ${tagsHtml ? `<div class="menu-tags">${tagsHtml}</div>` : ""}
      </div>
    </article>
  `;
}

// Renders the public menu from server data instead of hard-coded HTML.
function renderMenu() {
  if (!menuLoaded) {
    menuList.innerHTML = `<p class="empty-state">${t("menu.loading")}</p>`;
    return;
  }

  const visible = menuItems.filter((item) => item.category === activeMenuCategory && item.available);

  if (!visible.length) {
    menuList.innerHTML = `<p class="empty-state">${t("menu.empty")}</p>`;
    return;
  }

  // Group items by their first tag so a category with sub-types (e.g., drinks has Kafeteri/Birrë/etc.)
  // renders with sub-headings instead of one long flat list.
  const groups = new Map();
  for (const item of visible) {
    const primaryTag = (String(item.tags || "").split(",")[0] || "").trim();
    if (!groups.has(primaryTag)) groups.set(primaryTag, []);
    groups.get(primaryTag).push(item);
  }

  const hasMeaningfulGroups = groups.size > 1 || (groups.size === 1 && [...groups.keys()][0] !== "");

  if (!hasMeaningfulGroups) {
    menuList.innerHTML = visible.map((item, index) => renderMenuItemHtml(item, index, false)).join("");
    return;
  }

  let html = "";
  let index = 0;
  for (const [tag, items] of groups) {
    if (tag) {
      const cover = SUBCATEGORY_COVERS[tag];
      if (cover) {
        // Banner style: image background with the heading overlaid.
        html += `
          <div class="menu-group-banner" style="background-image: url('${escapeHtml(cover)}')">
            <h3>${escapeHtml(tag)}</h3>
          </div>
        `;
      } else {
        // Fallback for sub-categories without a cover image.
        html += `<h3 class="menu-group-heading">${escapeHtml(tag)}</h3>`;
      }
    }
    html += items.map((item) => renderMenuItemHtml(item, index++, Boolean(tag))).join("");
  }
  menuList.innerHTML = html;
}

function positionTabIndicator() {
  const activeTab = menuTabsContainer.querySelector(".tab.is-active");
  if (!activeTab) return;
  tabIndicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;
  tabIndicator.style.width = `${activeTab.offsetWidth}px`;
}

// Loads menu items from the Node server so admin changes can appear on the public site.
async function loadMenu() {
  try {
    const response = await fetch("/api/menu");
    const data = await response.json();
    menuItems = data.menu || [];
    menuLoaded = true;
    renderMenu();
  } catch {
    menuLoaded = true;
    menuList.innerHTML = `<p class="empty-state">${t("menu.error")}</p>`;
  }
}

// Converts 24-hour API times like "18:30" into guest-friendly display text.
function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(currentLanguage === "sq" ? "sq-AL" : "en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hours, minutes));
}

// Checks open seats for the selected date and updates the time dropdown.
async function loadAvailability() {
  const date = reserveDate.value;
  if (!date) return;

  const selected = timeSelect.value;
  try {
    const response = await fetch(`/api/availability?date=${encodeURIComponent(date)}`);
    if (!response.ok) return;

    const data = await response.json();
    timeSelect.innerHTML = `<option value="">${t("form.select")}</option>`;
    data.slots.forEach((slot) => {
      const option = document.createElement("option");
      option.value = slot.time;
      option.disabled = !slot.available;
      option.textContent = t("availability.seatsLeft", { time: formatTime(slot.time), count: slot.seatsLeft });
      timeSelect.append(option);
    });
    timeSelect.value = selected;
  } catch {
    // Availability is optional — silently skip if the server is unreachable.
  }
}

// The header gets a solid background after scrolling for better readability.
const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", isOpen);
  header.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

// Menu tabs switch categories without navigating away from the page.
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeMenuCategory = tab.dataset.menuTab;

    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    positionTabIndicator();
    renderMenu();
  });
});

window.addEventListener("resize", positionTabIndicator, { passive: true });
window.addEventListener("load", positionTabIndicator);

reserveDate.addEventListener("change", loadAvailability);

languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "sq" ? "en" : "sq";
  localStorage.setItem("pellumbat-language", currentLanguage);
  applyTranslations();
});

// Tracks a pending auto-dismiss timer so a fast second submission cancels the first one.
let formNoteTimer = null;

// Sends the reservation request to the backend and displays success/error feedback.
reserveForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(reserveForm);
  const payload = Object.fromEntries(data.entries());
  const name = String(payload.name || "").trim().split(" ")[0] || "there";

  // Cancel any pending auto-dismiss so the new message isn't wiped instantly.
  if (formNoteTimer) {
    clearTimeout(formNoteTimer);
    formNoteTimer = null;
  }
  formNote.classList.remove("is-fading");

  // Turnstile injects a hidden input named "cf-turnstile-response" once the visitor passes verification.
  // If it's missing, the widget hasn't finished yet — block submission rather than risk a server rejection.
  if (!payload["cf-turnstile-response"]) {
    formNote.textContent = "Please wait a moment for the verification widget, then try again.";
    formNote.classList.add("is-error");
    return;
  }

  formNote.textContent = t("form.sending");

  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || t("form.error"));
    }

    formNote.textContent = t("form.success", { name });
    formNote.classList.remove("is-error");
    reserveForm.reset();
    // Reset the Turnstile widget — tokens are single-use, so the next submission needs a fresh one.
    if (window.turnstile && typeof window.turnstile.reset === "function") {
      window.turnstile.reset();
    }
    await loadAvailability();
    // Auto-dismiss the success message after a few seconds — customers also get an email,
    // so the on-page note is just a quick acknowledgment.
    if (formNoteTimer) clearTimeout(formNoteTimer);
    formNoteTimer = setTimeout(() => {
      formNote.classList.add("is-fading");
      setTimeout(() => {
        formNote.textContent = "";
        formNote.classList.remove("is-fading");
      }, 420);
    }, 5000);
  } catch (error) {
    formNote.textContent = error.message || t("form.error");
    formNote.classList.add("is-error");
    if (window.turnstile && typeof window.turnstile.reset === "function") {
      window.turnstile.reset();
    }
  }
});

cancelForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(cancelForm);
  const payload = Object.fromEntries(data.entries());

  cancelNote.textContent = t("cancel.sending");

  try {
    const response = await fetch("/api/reservations/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || t("cancel.error"));
    }

    cancelNote.textContent = t("cancel.success");
    cancelNote.classList.remove("is-error");
    cancelForm.reset();
    await loadAvailability();
  } catch (error) {
    cancelNote.textContent = error.message || t("cancel.error");
    cancelNote.classList.add("is-error");
  }
});

reserveDate.min = new Date().toISOString().split("T")[0];

// Reveal sections as they scroll into view for a smoother browsing feel.
const revealTargets = document.querySelectorAll(
  ".section-heading, .gallery-grid figure, .events-section > div, .feature-copy, .feature-grid article, .visit-layout > *, .reserve-copy, .reserve-form, .cancel-form, .food-moments article, .quick-info > div",
);
revealTargets.forEach((element) => element.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}

// Subtle parallax on the hero photo while still inside the first viewport.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lastScrollY = 0;
let parallaxQueued = false;

function applyHeroParallax() {
  parallaxQueued = false;
  if (!heroImage || reduceMotion.matches) return;
  if (lastScrollY < window.innerHeight) {
    heroImage.style.transform = `translate3d(0, ${lastScrollY * 0.12}px, 0) scale(1.18)`;
  }
}

if (heroImage && !reduceMotion.matches) {
  heroImage.style.transform = "scale(1.18)";
}

window.addEventListener(
  "scroll",
  () => {
    lastScrollY = window.scrollY;
    if (!parallaxQueued) {
      parallaxQueued = true;
      requestAnimationFrame(applyHeroParallax);
    }
  },
  { passive: true },
);

// --- Hero slideshow ---------------------------------------------------------
// Cycle through the slides every 7 seconds with a crossfade.
// Pauses when the visitor's mouse is over the hero, and is fully disabled for prefers-reduced-motion.
if (heroSlideshow && !reduceMotion.matches) {
  const slides = Array.from(heroSlideshow.querySelectorAll("img"));
  if (slides.length > 1) {
    let activeIndex = 0;
    let paused = false;

    heroSlideshow.addEventListener("mouseenter", () => (paused = true));
    heroSlideshow.addEventListener("mouseleave", () => (paused = false));
    // Pause when the tab is hidden — saves work and avoids racing back when the user returns.
    document.addEventListener("visibilitychange", () => (paused = document.hidden));

    setInterval(() => {
      if (paused) return;
      slides[activeIndex].classList.remove("is-active");
      activeIndex = (activeIndex + 1) % slides.length;
      slides[activeIndex].classList.add("is-active");
    }, 7000);
  }
}

// --- Animated counter -------------------------------------------------------
// Any element with [data-counter="N"] counts from 0 to N once it scrolls into view.
// Uses requestAnimationFrame for buttery smooth interpolation rather than setInterval.
function runCounter(element) {
  const target = Number(element.dataset.counter || 0);
  const suffix = element.dataset.counterSuffix || "";
  if (!target || reduceMotion.matches) {
    element.textContent = `${target}${suffix}`;
    return;
  }
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // Ease-out cubic: starts fast, slows toward the end.
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterTargets = document.querySelectorAll("[data-counter]");
if ("IntersectionObserver" in window && counterTargets.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 },
  );
  counterTargets.forEach((el) => counterObserver.observe(el));
}

// --- Scroll-to-top button ---------------------------------------------------
const scrollTopBtn = document.querySelector("[data-scroll-top]");
if (scrollTopBtn) {
  const updateScrollTop = () => {
    if (window.scrollY > window.innerHeight * 0.6) {
      scrollTopBtn.removeAttribute("hidden");
    } else {
      scrollTopBtn.setAttribute("hidden", "");
    }
  };
  updateScrollTop();
  window.addEventListener("scroll", updateScrollTop, { passive: true });
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
  });
}

// --- Gallery lightbox -------------------------------------------------------
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImg = document.querySelector("[data-lightbox-img]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");

function openLightbox(src, alt, caption) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightboxCaption.textContent = caption || "";
  lightbox.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.setAttribute("hidden", "");
  lightboxImg.src = "";
  document.body.style.overflow = "";
}

document.querySelectorAll(".gallery-grid figure").forEach((figure) => {
  figure.addEventListener("click", () => {
    const img = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    if (!img) return;
    openLightbox(img.src, img.alt, caption?.textContent);
  });
  // Keyboard accessibility: focus + Enter/Space opens the lightbox.
  figure.tabIndex = 0;
  figure.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      figure.click();
    }
  });
});

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && !lightbox.hasAttribute("hidden")) {
    closeLightbox();
  }
});

// --- Cancel form toggle -----------------------------------------------------
// Hides the cancel form by default. Click expands it; click again collapses.
const cancelToggle = document.querySelector("[data-cancel-toggle]");
if (cancelToggle && cancelForm) {
  cancelToggle.addEventListener("click", () => {
    const isOpen = cancelForm.hasAttribute("hidden");
    if (isOpen) {
      cancelForm.removeAttribute("hidden");
      cancelToggle.setAttribute("aria-expanded", "true");
      cancelToggle.classList.add("is-open");
      // Move focus into the form for keyboard users so they can start typing immediately.
      cancelForm.querySelector("input")?.focus();
    } else {
      cancelForm.setAttribute("hidden", "");
      cancelToggle.setAttribute("aria-expanded", "false");
      cancelToggle.classList.remove("is-open");
    }
  });
}

applyTranslations();
loadMenu();
