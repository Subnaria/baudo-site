const ANALYTICS_WORKER_URL = "https://baudo-analystic.totoyopacmam.workers.dev";
const RATE_LIMIT_MS = 60 * 1000;
const STORAGE_KEY = "baudo_last_visit";
const CACHE_KEY = "baudo_last_total";

let isFirstLoad = true;

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + "K";
  return num.toString();
}

function animateNumber(el, start, end, duration) {
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatNumber(Math.floor(start + (end - start) * easeOut));
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

async function fetchTotalVisits() {
  try {
    const res = await fetch(`${ANALYTICS_WORKER_URL}/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success) {
      localStorage.setItem(CACHE_KEY, data.totalVisits.toString());
      updateCounterDisplay(data.totalVisits);
    } else throw new Error(data.error || "Réponse invalide");
  } catch (e) {
    console.warn("Impossible de récupérer le total, utilisation du cache local:", e);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) updateCounterDisplay(Number(cached));
  }
}

async function sendVisit() {
  try {
    const lastVisit = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    if (lastVisit && now - Number(lastVisit) < RATE_LIMIT_MS) return;

    localStorage.setItem(STORAGE_KEY, now.toString());

    let ip = "anonymous";
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      ip = (await ipRes.json()).ip || ip;
    } catch {}

    const res = await fetch(ANALYTICS_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, userAgent: navigator.userAgent }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success) localStorage.setItem(CACHE_KEY, data.totalVisits.toString());
    updateCounterDisplay(data.totalVisits);
  } catch (err) {
    console.warn("Erreur analytics, utilisation du cache local:", err);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) updateCounterDisplay(Number(cached));
  }
}

function updateCounterDisplay(total) {
  const el = document.getElementById("siteViews");
  if (!el) return;

  const prev = parseInt(el.dataset.currentValue || "0", 10);
  const start = isFirstLoad ? 0 : prev;
  isFirstLoad = false;
  el.dataset.currentValue = total.toString();
  animateNumber(el, start, total, 1500);
}

// Auto-init
window.addEventListener("load", () => {
  setTimeout(() => {
    fetchTotalVisits();
    sendVisit();
    setInterval(fetchTotalVisits, 30_000);
  }, 300);
});
