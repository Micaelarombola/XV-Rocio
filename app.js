/* =========================
   CONFIG RÁPIDA
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

  // FX
  petalsEnabled: true,
  petalsPerMinute: 35
};

/* =========================
   HELPERS
   ========================= */
const $ = (id) => document.getElementById(id);
const isMobile = window.matchMedia("(max-width: 768px)").matches;

/* =========================
   LOADER (ÚNICO, SIEMPRE CIERRA)
   ========================= */
const loaderEl = document.getElementById("loader");

function hideLoader() {
  if (!loaderEl) return;
  loaderEl.classList.add("hide");
  setTimeout(() => loaderEl.remove(), 450);
}

// Cierra cuando termina de cargar todo
window.addEventListener("load", hideLoader);
// Plan B por si alguna imagen tarda/falla
setTimeout(hideLoader, 3500);

/* =========================
   SET DATA EN PÁGINA
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  if ($("eventDateText")) $("eventDateText").textContent = CONFIG.dateText;
  if ($("eventTimeText")) $("eventTimeText").textContent = `${CONFIG.timeText} a ${CONFIG.eventEndText}`;
  if ($("venueName")) $("venueName").textContent = CONFIG.venueName;
  if ($("venueAddress")) $("venueAddress").textContent = CONFIG.venueAddress;

  if ($("mapsBtn")) $("mapsBtn").href = CONFIG.mapsUrl;
  if ($("aliasText")) $("aliasText").textContent = CONFIG.alias;

  // Hook a secciones para efectos
  setupRevealOnScroll();
  setupCountdown();
  setupPetals();
  setupCanvasSparkles(); // safe (se apaga en celu)
  setupRsvpModal();
  setupCopyAlias();
  setupSongWhatsapp();
  setupLightbox();
});

/* =========================
   COUNTDOWN
   ========================= */
function setupCountdown() {
  const targetTime = new Date(CONFIG.eventISO).getTime();
  const $days = $("days");
  const $hours = $("hours");
  const $minutes = $("minutes");
  const $seconds = $("seconds");
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    if (!$days || !$hours || !$minutes || !$seconds) return;

    const now = Date.now();
    let diff = targetTime - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    $days.textContent = pad(days);
    $hours.textContent = pad(hours);
    $minutes.textContent = pad(minutes);
    $seconds.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
}

/* =========================
   REVEAL ON SCROLL
   ========================= */
function setupRevealOnScroll() {
  const els = document.querySelectorAll(".revealOnScroll");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
    { threshold: 0.14 }
  );

  els.forEach((el) => observer.observe(el));
}

/* =========================
   SPARKLES BACKGROUND (CANVAS) - SAFE
   (en celu se apaga para que NO se vuelva inestable)
   ========================= */
function setupCanvasSparkles() {
  const canvas = $("sparkleCanvas");
  if (!canvas) return;

  // En celu lo apagamos para evitar saltos + barra “cargando”
  if (isMobile) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d");
  let w = 0, h = 0;
  let rafId = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
  }

  const sparkles = [];
  function init(count = 90) {
    sparkles.length = 0;
    const dpr = window.devicePixelRatio || 1;
    for (let i = 0; i < count; i++) {
      sparkles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 2 + 0.7) * dpr,
        a: Math.random() * 0.45 + 0.10,
        s: (Math.random() * 0.55 + 0.18) * dpr,
        t: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, Math.max(w, h) * 0.8);
    g.addColorStop(0, "rgba(232,154,184,0.14)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const dpr = window.devicePixelRatio || 1;

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

    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    resize();
    init(90);
  });

  resize();
  init(90);

  if (rafId) cancelAnimationFrame(rafId);
  draw();
}

/* =========================
   PETALS / HEARTS (DOM FX) - CELU OK
   ========================= */
function setupPetals() {
  if (!CONFIG.petalsEnabled) return;

  const petalsLayer = document.querySelector(".petals");
  if (!petalsLayer) return;

  const ppm = isMobile ? 8 : CONFIG.petalsPerMinute; // en celu MUY suave
  const intervalMs = isMobile
    ? Math.max(900, Math.floor(60000 / Math.max(1, ppm)))
    : Math.max(220, Math.floor(60000 / Math.max(1, ppm)));

  setInterval(() => {
    const maxPetals = isMobile ? 6 : 22;
    if (document.querySelectorAll(".petal").length > maxPetals) return;

    const el = document.createElement("div");
    el.className = "petal";

    const left = Math.random() * 100;
    const size = isMobile ? (10 + Math.random() * 8) : (12 + Math.random() * 14);
    const duration = isMobile ? (6 + Math.random() * 4) : (7 + Math.random() * 6);

    el.style.left = left + "vw";
    el.style.animationDuration = duration + "s";
    el.style.opacity = (0.25 + Math.random() * 0.45).toFixed(2);
    el.style.transform = `translateY(-20px) rotate(${Math.random() * 180}deg)`;
    el.style.filter = "none";
    el.style.fontSize = size + "px";

    petalsLayer.appendChild(el);
    setTimeout(() => el.remove(), (duration * 1000) + 500);
  }, intervalMs);
}

/* =========================
   RSVP MODAL
   ========================= */
function setupRsvpModal() {
  const modal = $("rsvpModal");
  const openRsvpBtn = $("openRsvpBtn");
  const closeRsvpBtn = $("closeRsvpBtn");
  const backdrop = $("rsvpBackdrop");

  function openModal() {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => $("rsvpName")?.focus(), 80);
    document.body.style.overflow = "hidden";
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

  // Tipo de comida: mostrar "Otra"
  const foodSel = $("rsvpFood");
  const foodOtherWrap = $("foodOtherWrap");
  const foodOther = $("rsvpFoodOther");

  foodSel?.addEventListener("change", () => {
    const isOther = foodSel.value === "Otra";
    if (foodOtherWrap) foodOtherWrap.style.display = isOther ? "block" : "none";
    if (!isOther && foodOther) foodOther.value = "";
  });

  // Enviar WhatsApp RSVP
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
}

/* =========================
   COPIAR ALIAS
   ========================= */
function setupCopyAlias() {
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
}

/* =========================
   MÚSICA: ENVIAR TEMA POR WHATSAPP
   (sin Spotify)
   ========================= */
function setupSongWhatsapp() {
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
}

/* =========================
   GALERÍA: LIGHTBOX
   (requiere .gItem y #lightbox etc)
   ========================= */
function setupLightbox() {
  const lightbox = $("lightbox");
  const lightboxImg = $("lightboxImg");
  const lightboxClose = $("lightboxClose");
  const lightboxBackdrop = $("lightboxBackdrop");

  const imgs = document.querySelectorAll(".gItem img");
  if (!imgs.length) return;

  imgs.forEach((img) => {
    img.parentElement?.addEventListener("click", () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lightboxImg) lightboxImg.src = "";
  }

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxBackdrop?.addEventListener("click", closeLightbox);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox?.classList.contains("open")) closeLightbox();
  });
}