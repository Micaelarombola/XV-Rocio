/* =========================
   HELPERS
========================= */
const $ = (id) => document.getElementById(id);

/* =========================
   CONFIG
========================= */
const CONFIG = {
  eventISO: "2026-06-27T21:00:00-03:00",
  dateText: "Sábado 27 de Junio 2026",
  timeText: "21:00 hs",
  eventEndText: "05:00 am",
  venueName: "Don Quijote",
  venueAddress: "San Lorenzo 2482, San Martín, Provincia de Buenos Aires",
  mapsUrl: "https://maps.app.goo.gl/3CG66y4NVssTGMXh6",

  whatsappNumber: "5491167007577",
  alias: "roalberti",

  petalsEnabled: true,
  petalsPerMinute: 35
};

/* =========================
   LOADER (limpio y sin trabarse)
========================= */
function hideLoader() {
  const loader = $("loader");
  if (!loader) return;
  loader.classList.add("hide");
  setTimeout(() => loader.remove(), 420);
}

// Apenas el DOM está listo (rápido)
document.addEventListener("DOMContentLoaded", () => {
  // si hay imágenes pesadas, no esperes forever:
  setTimeout(hideLoader, 250);
  setTimeout(hideLoader, 3500); // fallback sí o sí
});

// Si el load llega, también lo cerramos
window.addEventListener("load", hideLoader);

/* =========================
   SET DATA EN PÁGINA
========================= */
$("eventDateText") && ($("eventDateText").textContent = CONFIG.dateText);
$("eventTimeText") && ($("eventTimeText").textContent = CONFIG.timeText);
$("eventEndText") && ($("eventEndText").textContent = CONFIG.eventEndText);
$("venueName") && ($("venueName").textContent = CONFIG.venueName);
$("venueAddress") && ($("venueAddress").textContent = CONFIG.venueAddress);

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
  const d = $("days"), h = $("hours"), m = $("minutes"), s = $("seconds");
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
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add("visible"));
}

/* =========================
   DRESS CODE: visible siempre
========================= */
const dress = document.querySelector(".dressPremium");
if (dress) {
  dress.style.opacity = "1";
  dress.style.transform = "none";
}

/* =========================
   CANVAS SPARKLES (solo PC)
========================= */
const isMobile = window.matchMedia("(max-width: 768px)").matches;

if (!isMobile) {
  const canvas = $("sparkleCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  let w = 0, h = 0;

  const resize = () => {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
  };

  resize();
  window.addEventListener("resize", () => requestAnimationFrame(resize), { passive: true });

  const dpr = window.devicePixelRatio || 1;
  const sparkles = Array.from({ length: 110 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: (Math.random() * 2 + 0.7) * dpr,
    a: Math.random() * 0.55 + 0.10,
    s: (Math.random() * 0.60 + 0.18) * dpr,
    t: Math.random() * Math.PI * 2
  }));

  function draw() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, w, h);

    const g = ctx.createRadialGradient(
      w * 0.5, h * 0.35, 0,
      w * 0.5, h * 0.35, Math.max(w, h) * 0.8
    );
    g.addColorStop(0, "rgba(232,154,184,0.14)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const p of sparkles) {
      p.t += 0.02;
      p.y += p.s;
      p.x += Math.sin(p.t) * (0.25 * dpr);

      if (p.y - p.r > h) {
        p.y = -10 * dpr;
        p.x = Math.random() * w;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(216,112,163,${p.a})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
}

/* =========================
   PETALS (suave)
========================= */
if (CONFIG.petalsEnabled) {
  const petalsLayer = document.querySelector(".petals");
  if (petalsLayer) {
    const ppm = isMobile ? 8 : CONFIG.petalsPerMinute;
    const interval = Math.max(400, Math.floor(60_000 / ppm));

    setInterval(() => {
      const limit = isMobile ? 10 : 28;
      if (document.querySelectorAll(".petal").length > limit) return;

      const el = document.createElement("div");
      el.className = "petal";

      const left = Math.random() * 100;
      const size = 12 + Math.random() * 14;
      const duration = 7 + Math.random() * 6;

      el.style.left = left + "vw";
      el.style.animationDuration = duration + "s";
      el.style.opacity = (0.25 + Math.random() * 0.45).toFixed(2);
      el.style.fontSize = size + "px";

      petalsLayer.appendChild(el);
      setTimeout(() => el.remove(), (duration * 1000) + 500);
    }, interval);
  }
}

/* =========================
   RSVP MODAL + WHATSAPP
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
  if (e.key === "Escape" && modal?.classList.contains("open")) closeModal();
});

/* Tipo de comida: mostrar "Otra" */
const foodSel = $("rsvpFood");
const foodOtherWrap = $("foodOtherWrap");
const foodOther = $("rsvpFoodOther");

foodSel?.addEventListener("change", () => {
  const isOther = foodSel.value === "Otra";
  if (foodOtherWrap) foodOtherWrap.style.display = isOther ? "block" : "none";
  if (!isOther && foodOther) foodOther.value = "";
});

/* Enviar WhatsApp */
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
    (note ? `Mensaje: ${note}\n` : ``) +
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
    (artist ? `Artista: ${artist}\n` : ``) +
    (note ? `Mensaje: ${note}\n` : ``) +
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