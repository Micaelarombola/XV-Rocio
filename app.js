const $ = (id) => document.getElementById(id);

const CONFIG = {
  eventISO: "2026-06-27T21:00:00-03:00",
  dateText: "Sábado 27 de Junio 2026",
  timeText: "21:00 hs",
  eventEndText: "05:00 am",
  venueName: "Don Quijote",
  venueAddress: "San Lorenzo 2482, San Martín, Provincia de Buenos Aires",
  whatsappNumber: "5491167007577",
  alias: "roalberti"
};

/* =========================
   LOADER
========================= */
const loaderEl = $("loader");

function hideLoader() {
  if (!loaderEl) return;
  loaderEl.classList.add("hide");
  setTimeout(() => loaderEl.remove(), 450);
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(hideLoader, 400);
});

window.addEventListener("load", hideLoader);
setTimeout(hideLoader, 3500);

/* =========================
   SET DATA
========================= */
if ($("eventDateText")) $("eventDateText").textContent = CONFIG.dateText;
if ($("eventTimeText")) $("eventTimeText").textContent = CONFIG.timeText;
if ($("eventEndText")) $("eventEndText").textContent = CONFIG.eventEndText;
if ($("venueName")) $("venueName").textContent = CONFIG.venueName;
if ($("venueAddress")) $("venueAddress").textContent = CONFIG.venueAddress;
if ($("aliasText")) $("aliasText").textContent = CONFIG.alias;

/* =========================
   MÚSICA
========================= */
const musicBtn = $("musicBtn");
const bgMusic = $("bgMusic");

musicBtn?.addEventListener("click", async () => {
  try {
    if (!bgMusic) return;

    if (bgMusic.paused) {
      await bgMusic.play();
      musicBtn.textContent = "Música: ON";
      musicBtn.setAttribute("aria-pressed", "true");
    } else {
      bgMusic.pause();
      musicBtn.textContent = "Música: OFF";
      musicBtn.setAttribute("aria-pressed", "false");
    }
  } catch {
    alert("Tu navegador bloqueó el audio. Tocá de nuevo 😊");
  }
});

/* =========================
   COUNTDOWN
========================= */
const targetTime = new Date(CONFIG.eventISO).getTime();
const pad = (n) => String(n).padStart(2, "0");

function tick() {
  const d = $("days");
  const h = $("hours");
  const m = $("minutes");
  const s = $("seconds");
  if (!d || !h || !m || !s) return;

  const now = Date.now();
  let diff = targetTime - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  d.textContent = pad(days);
  h.textContent = pad(hours);
  m.textContent = pad(minutes);
  s.textContent = pad(seconds);
}

tick();
setInterval(tick, 1000);

/* =========================
   REVEAL ON SCROLL
========================= */
const revealEls = document.querySelectorAll(".revealOnScroll");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

/* =========================
   MODAL RSVP
========================= */
const modal = $("rsvpModal");
const openRsvpBtn = $("openRsvpBtn");
const closeRsvpBtn = $("closeRsvpBtn");
const backdrop = $("rsvpBackdrop");

function openModal() {
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("rsvpName")?.focus(), 100);
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openRsvpBtn?.addEventListener("click", openModal);
closeRsvpBtn?.addEventListener("click", closeModal);
backdrop?.addEventListener("click", closeModal);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("open")) {
    closeModal();
  }
});

/* =========================
   TIPO DE COMIDA
========================= */
const foodSel = $("rsvpFood");
const foodOtherWrap = $("foodOtherWrap");
const foodOther = $("rsvpFoodOther");

foodSel?.addEventListener("change", () => {
  const isOther = foodSel.value === "Otra";
  if (foodOtherWrap) foodOtherWrap.style.display = isOther ? "block" : "none";
  if (!isOther && foodOther) foodOther.value = "";
});

/* =========================
   ENVIAR RSVP WHATSAPP
========================= */
const form = $("rsvpRealForm");
const feedback = $("rsvpFeedback");

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = $("rsvpName")?.value.trim() || "";
  const qty = $("rsvpQty")?.value || "";
  const note = $("rsvpNote")?.value.trim() || "";
  const food = $("rsvpFood")?.value || "";
  const foodExtra = $("rsvpFoodOther")?.value.trim() || "";
  const foodFinal = (food === "Otra" && foodExtra) ? `Otra: ${foodExtra}` : food;

  if (!name || !qty || !food) {
    if (feedback) feedback.textContent = "Completá nombre, cantidad y tipo de comida 🙏";
    return;
  }

  const msg =
    `💗 CONFIRMACIÓN 15 DE ROCÍO 💗\n\n` +
    `Nombre: ${name}\n` +
    `Asistentes: ${qty}\n` +
    `Comida: ${foodFinal}\n` +
    (note ? `Mensaje: ${note}\n` : "") +
    `\n¡Gracias! ✨`;

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;

  if (feedback) feedback.textContent = "Abriendo WhatsApp…";
  window.open(url, "_blank", "noopener");

  setTimeout(() => {
    if (feedback) feedback.textContent = "";
    form.reset();
    if (foodOtherWrap) foodOtherWrap.style.display = "none";
    closeModal();
  }, 700);
});

/* =========================
   COPIAR ALIAS
========================= */
const copyAliasBtn = $("copyAliasBtn");
const copyFeedback = $("copyFeedback");
const aliasText = $("aliasText");

copyAliasBtn?.addEventListener("click", async () => {
  const alias = (aliasText?.textContent || CONFIG.alias || "").trim();
  if (!alias) return;

  try {
    await navigator.clipboard.writeText(alias);
    if (copyFeedback) copyFeedback.textContent = "¡Alias copiado! 💗";
    copyAliasBtn.classList.add("copied");
  } catch {
    if (copyFeedback) copyFeedback.textContent = "Copialo manual: " + alias;
  }

  setTimeout(() => {
    if (copyFeedback) copyFeedback.textContent = "";
    copyAliasBtn.classList.remove("copied");
  }, 2200);
});

/* =========================
   ENVIAR TEMA POR WHATSAPP
========================= */
const songName = $("songName");
const songArtist = $("songArtist");
const songNote = $("songNote");
const sendSongBtn = $("sendSongBtn");
const songFeedback = $("songFeedback");

sendSongBtn?.addEventListener("click", () => {
  const name = (songName?.value || "").trim();
  const artist = (songArtist?.value || "").trim();
  const note = (songNote?.value || "").trim();

  if (!name) {
    if (songFeedback) songFeedback.textContent = "Escribí el nombre del tema 🙏";
    songName?.focus();
    return;
  }

  const msg =
    `🎶 TEMA PARA LOS 15 DE ROCÍO 🎶\n\n` +
    `Tema: ${name}\n` +
    (artist ? `Artista: ${artist}\n` : "") +
    (note ? `Mensaje: ${note}\n` : "") +
    `\n¡Gracias! 💗✨`;

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;

  if (songFeedback) songFeedback.textContent = "Abriendo WhatsApp…";
  window.open(url, "_blank", "noopener");

  setTimeout(() => {
    if (songFeedback) songFeedback.textContent = "";
    if (songName) songName.value = "";
    if (songArtist) songArtist.value = "";
    if (songNote) songNote.value = "";
  }, 900);
});