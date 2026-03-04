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

  spotifyUrl: "https://open.spotify.com/",
  carouselAutoplay: true,
  carouselMs: 4200,

  petalsEnabled: true,
  petalsPerMinute: 35
};

/* =========================
   LOADER (NO SE TRABA)
   ========================= */
const loader = document.getElementById("loader");

function hideLoader() {
  if (!loader) return;
  loader.classList.add("hide");
  setTimeout(() => loader.remove(), 450);
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(hideLoader, 250);
});

// plan B por si algo tarda o falla
setTimeout(hideLoader, 2500);

// si termina de cargar todo, también lo saca
window.addEventListener("load", hideLoader);

/* =========================
   SET DATA EN PÁGINA (con guardas)
   ========================= */
const $ = (id) => document.getElementById(id);

if ($("eventDateText")) $("eventDateText").textContent = CONFIG.dateText;
if ($("eventTimeText")) $("eventTimeText").textContent = CONFIG.timeText;
if ($("venueName")) $("venueName").textContent = CONFIG.venueName;
if ($("venueAddress")) $("venueAddress").textContent = CONFIG.venueAddress;

if ($("mapsBtn")) $("mapsBtn").href = CONFIG.mapsUrl;
if ($("aliasText")) $("aliasText").textContent = CONFIG.alias;
if ($("spotifyBtn")) $("spotifyBtn").href = CONFIG.spotifyUrl;

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

/* =========================
   REVEAL ON SCROLL
   ========================= */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("visible");
  });
}, { threshold: 0.14 });

document.querySelectorAll(".revealOnScroll").forEach(el => observer.observe(el));

/* =========================
   CAROUSEL
   ========================= */
const track = $("carouselTrack");
const prevBtn = $("prevBtn");
const nextBtn = $("nextBtn");
const dotsWrap = $("dots");

let index = 0;
let autoplayId = null;

const slides = track ? Array.from(track.querySelectorAll(".slide")) : [];

function renderDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "dot" + (i === index ? " active" : "");
    d.setAttribute("aria-label", `Ir a la imagen ${i + 1}`);
    d.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(d);
  });
}

function goTo(i, userAction = false) {
  if (!track || slides.length === 0) return;
  index = (i + slides.length) % slides.length;
  track.style.transform = `translateX(${-index * 100}%)`;
  renderDots();
  if (userAction) restartAutoplay();
}

function startAutoplay() {
  if (!CONFIG.carouselAutoplay || slides.length <= 1) return;
  autoplayId = setInterval(() => goTo(index + 1), CONFIG.carouselMs);
}
function stopAutoplay() {
  if (autoplayId) clearInterval(autoplayId);
  autoplayId = null;
}
function restartAutoplay() {
  stopAutoplay();
  startAutoplay();
}

if (slides.length) {
  renderDots();
  prevBtn?.addEventListener("click", () => goTo(index - 1, true));
  nextBtn?.addEventListener("click", () => goTo(index + 1, true));
  startAutoplay();

  const carouselWrap = document.querySelector(".carouselTrackWrap");
  carouselWrap?.addEventListener("mouseenter", stopAutoplay);
  carouselWrap?.addEventListener("mouseleave", startAutoplay);
}

/* =========================
   SPARKLES BACKGROUND (CANVAS)
   ========================= */
const canvas = $("sparkleCanvas");
const ctx = canvas?.getContext("2d");

let w = 0, h = 0;

function resize() {
  if (!canvas) return;
  w = canvas.width = window.innerWidth * devicePixelRatio;
  h = canvas.height = window.innerHeight * devicePixelRatio;
}
window.addEventListener("resize", resize);
resize();

const sparkles = Array.from({ length: 110 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  r: (Math.random() * 2 + 0.7) * devicePixelRatio,
  a: Math.random() * 0.55 + 0.10,
  s: (Math.random() * 0.60 + 0.18) * devicePixelRatio,
  t: Math.random() * Math.PI * 2
}));

function draw() {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, w, h);

  const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, Math.max(w, h) * 0.8);
  g.addColorStop(0, "rgba(232,154,184,0.14)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (const p of sparkles) {
    p.t += 0.02;
    p.y += p.s;
    p.x += Math.sin(p.t) * (0.25 * devicePixelRatio);

    if (p.y - p.r > h) {
      p.y = -10 * devicePixelRatio;
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

/* =========================
   PETALS / HEARTS (DOM FX)
   ========================= */
if (CONFIG.petalsEnabled) {
  const petalsLayer = document.querySelector(".petals");
  const interval = Math.max(120, Math.floor((CONFIG.petalsPerMinute / 60) * 1000));

  setInterval(() => {
    if (!petalsLayer) return;

    const el = document.createElement("div");
    el.className = "petal";

    const left = Math.random() * 100;
    const size = 12 + Math.random() * 14;
    const duration = 7 + Math.random() * 6;

    el.style.left = left + "vw";
    el.style.animationDuration = duration + "s";
    el.style.opacity = (0.25 + Math.random() * 0.45).toFixed(2);
    el.style.transform = `translateY(-20px) rotate(${Math.random() * 180}deg)`;
    el.style.filter = `blur(${(Math.random() * 0.6).toFixed(2)}px)`;
    el.style.fontSize = size + "px";

    petalsLayer.appendChild(el);
    setTimeout(() => el.remove(), (duration * 1000) + 500);
  }, interval);
}

/* =========================
   RSVP MODAL + COMIDA + WHATSAPP (SIN HASH)
   ========================= */
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
   COPIAR ALIAS (Premium)
   ========================= */
const copyAliasBtn = document.getElementById("copyAliasBtn");
const copyFeedback = document.getElementById("copyFeedback");
const aliasText = document.getElementById("aliasText");

copyAliasBtn?.addEventListener("click", async () => {
  const alias = (aliasText?.textContent || CONFIG.alias || "").trim();
  if (!alias) return;

  try{
    await navigator.clipboard.writeText(alias);
    copyFeedback.textContent = "¡Alias copiado! 💗";
    copyAliasBtn.classList.add("copied");
  }catch{
    copyFeedback.textContent = "Copialo manual: " + alias;
  }

  setTimeout(() => {
    copyFeedback.textContent = "";
    copyAliasBtn.classList.remove("copied");
  }, 2200);
});

const dress = document.querySelector(".dressPremium");
if (dress){
  const obs = new IntersectionObserver(([e])=>{
    if (e.isIntersecting){
      dress.classList.add("dressIn");
      obs.disconnect();
    }
  }, {threshold: .2});
  obs.observe(dress);
}
/* =========================
   SORPRESA: Fotos (typing + confetti + flash)
   ========================= */
const photosSub = document.getElementById("photosSub");
const gallerySection = document.getElementById("gallery");
const carouselBox = document.querySelector(".carouselTrackWrap");

function typeText(el, text, speed = 28){
  if (!el) return;
  el.classList.add("typing");
  el.textContent = "";
  let i = 0;

  const timer = setInterval(() => {
    el.textContent += text[i] || "";
    i++;
    if (i > text.length){
      clearInterval(timer);
      setTimeout(() => el.classList.remove("typing"), 800);
    }
  }, speed);
}

// Typing cuando entra a la sección (1 vez)
let galleryTyped = false;
const galleryObs = new IntersectionObserver(([e])=>{
  if (e.isIntersecting && !galleryTyped){
    galleryTyped = true;
    typeText(photosSub, "Deslizá con las flechitas y descubrí momentos especiales 💗✨", 22);
    heartsBurst();
  }
},{threshold:.35});

if (gallerySection) galleryObs.observe(gallerySection);

// Mini confetti corazones (solo en Fotos)
function heartsBurst(){
  if (!gallerySection) return;

  const burstCount = 16;
  for(let i=0;i<burstCount;i++){
    const h = document.createElement("div");
    h.textContent = "💗";
    h.style.position = "absolute";
    h.style.left = (50 + (Math.random()*24 - 12)) + "%";
    h.style.top = (18 + (Math.random()*16 - 8)) + "px";
    h.style.fontSize = (12 + Math.random()*16) + "px";
    h.style.opacity = "0.9";
    h.style.transform = `translate(-50%, 0) rotate(${Math.random()*40-20}deg)`;
    h.style.pointerEvents = "none";
    h.style.filter = "blur(0.1px)";
    h.style.zIndex = "2";

    // anim
    const dx = (Math.random()*140 - 70);
    const dy = (Math.random()*120 + 80);
    h.animate([
      { transform: h.style.transform, opacity: 0.95 },
      { transform: `translate(calc(-50% + ${dx}px), ${dy}px) rotate(${Math.random()*220-110}deg)`, opacity: 0 }
    ], {
      duration: 950 + Math.random()*450,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "forwards"
    });

    gallerySection.style.position = "relative";
    gallerySection.appendChild(h);
    setTimeout(() => h.remove(), 1600);
  }
}

// Flash suave cuando cambia de slide
function flashCarousel(){
  if (!carouselBox) return;
  carouselBox.classList.remove("flash");
  // forzar reflow
  void carouselBox.offsetWidth;
  carouselBox.classList.add("flash");
}

// Enganchar flash a tus botones y dots (si existen)
document.getElementById("prevBtn")?.addEventListener("click", flashCarousel);
document.getElementById("nextBtn")?.addEventListener("click", flashCarousel);
document.getElementById("dots")?.addEventListener("click", (e) => {
  if (e.target?.classList?.contains("dot")) flashCarousel();
});

/* =========================
   Detalle sorpresa (solo 1 vez)
   ========================= */
const surpriseCard = document.getElementById("surpriseCard");
if (surpriseCard){
  const obs = new IntersectionObserver(([e])=>{
    if (e.isIntersecting){
      surpriseCard.classList.add("pop");
      setTimeout(()=>surpriseCard.classList.remove("pop"), 650);
      obs.disconnect();
    }
  }, { threshold: 0.35 });

  obs.observe(surpriseCard);
}

/* =========================
   SET DATA extra: fin del evento
   ========================= */
if (typeof $ === "function") {
  if ($("eventEndText")) $("eventEndText").textContent = "05:00 am";
}

/* =========================
   Detalles: sorpresa visual (sparkles 1 vez + tilt)
   ========================= */
const details = document.getElementById("details");
let detailsSparkled = false;

function spawnDetailsSparkles() {
  if (!details) return;

  const emojis = ["✨","💗","✨","💫","✨"];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "detailsSparkle";
    s.textContent = emojis[i % emojis.length];

    const x = 10 + Math.random() * 80; // %
    const y = 10 + Math.random() * 55; // %
    s.style.left = x + "%";
    s.style.top = y + "%";
    s.style.animationDelay = (Math.random() * 0.35) + "s";
    s.style.fontSize = (12 + Math.random() * 10) + "px";

    details.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
}

if (details) {
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !detailsSparkled) {
      detailsSparkled = true;
      spawnDetailsSparkles();
      obs.disconnect();
    }
  }, { threshold: 0.35 });

  obs.observe(details);
}

/* Tilt suave en cards (PC + touch) */
document.querySelectorAll("#details .card").forEach((card) => {
  const strength = 10;

  function reset() {
    card.style.transform = "translateY(0)";
  }

  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -strength;
    const ry = ((x / r.width) - 0.5) * strength;
    card.style.transform = `translateY(-3px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  card.addEventListener("mouseleave", reset);

  card.addEventListener("touchstart", () => {
    card.style.transform = "translateY(-3px) scale(1.01)";
  }, { passive: true });

  card.addEventListener("touchend", reset);
});