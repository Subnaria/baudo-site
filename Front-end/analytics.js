// ============================ 
// CONFIGURATION 
// ============================ 
const ANALYTICS_WORKER_URL = "https://baudo-analystic.totoyopacmam.workers.dev"; 
const WORKER_SECRET = "8f3a1c9e4b7d2f6a9c0e1d3b5a7f8c2d4e6a1b9c3d7f0a2b4c6e8d1f3a5b7c9e"; 
const RATE_LIMIT_MS = 60 * 1000; 
const STORAGE_KEY = "baudo_last_visit"; 
const CACHE_KEY = "baudo_last_total"; 

let isFirstLoad = true; // Flag pour détecter le premier chargement

// ============================ 
// FORMAT NUMBER (1000 → 1K, etc.)
// ============================ 
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// ============================
// ANIMATE NUMBER (pour les stats)
// ============================
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * easeOut);
    
    element.textContent = formatNumber(current);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// ============================ 
// FETCH TOTAL VISITS (GET /stats) 
// ============================ 
async function fetchTotalVisits() { 
  try { 
    const res = await fetch(`${ANALYTICS_WORKER_URL}/stats?secret=${WORKER_SECRET}`); 
 
    if (!res.ok) throw new Error(`HTTP ${res.status}`); 
 
    const data = await res.json(); 
 
    if (data.success && typeof data.totalVisits === "number") { 
      localStorage.setItem(CACHE_KEY, data.totalVisits.toString()); 
      updateCounterDisplay(data.totalVisits); 
    } else { 
      throw new Error(data.error || "Réponse invalide"); 
    } 
  } catch (e) { 
    console.warn("Impossible de récupérer le total, utilisation du cache local:", e); 
    const cached = localStorage.getItem(CACHE_KEY); 
    if (cached) updateCounterDisplay(Number(cached)); 
  } 
} 
 
// ============================ 
// ENVOI D'UNE VISITE (POST /) 
// ============================ 
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
    } catch (e) { 
      console.warn("Impossible de récupérer l'IP, utilisation d'anon", e); 
    } 
 
    const res = await fetch(ANALYTICS_WORKER_URL, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({  
        ip,  
        userAgent: navigator.userAgent,  
        workerSecret: WORKER_SECRET  
      }) 
    }); 
 
    if (!res.ok) throw new Error(`HTTP ${res.status}`); 
 
    const data = await res.json(); 
    if (data.success && typeof data.totalVisits === "number") { 
      localStorage.setItem(CACHE_KEY, data.totalVisits.toString()); 
      updateCounterDisplay(data.totalVisits); 
    } else { 
      throw new Error(data.error || "Réponse invalide"); 
    } 
  } catch (err) { 
    console.warn("Erreur analytics, utilisation du cache local:", err); 
    const cached = localStorage.getItem(CACHE_KEY); 
    if (cached) updateCounterDisplay(Number(cached)); 
  } 
} 
 
// ============================ 
// MISE À JOUR DU COMPTEUR AVEC ANIMATION
// ============================ 
function updateCounterDisplay(total) { 
  const el = document.getElementById("siteViews"); 
  if (!el) return; 
  
  // Au premier chargement, affiche 0 puis anime
  if (isFirstLoad) {
    el.textContent = "0";
    el.dataset.currentValue = "0";
    isFirstLoad = false;
    
    // Attendre un petit délai pour que le site soit visible
    setTimeout(() => {
      animateNumber(el, 0, total, 2000);
      el.dataset.currentValue = total.toString();
    }, 500);
    return;
  }
  
  // Pour les mises à jour suivantes
  const previousValue = parseInt(el.dataset.currentValue || "0", 10);
  animateNumber(el, previousValue, total, 1500);
  el.dataset.currentValue = total.toString();
} 
 
// ============================ 
// AUTO-INIT 
// ============================ 
window.addEventListener("load", () => {
  // Attendre que TOUT soit chargé (images, CSS, etc.)
  setTimeout(() => {
    fetchTotalVisits(); // GET /stats - récupère le total 
    sendVisit();        // POST / - ajoute une visite 
    setInterval(fetchTotalVisits, 30_000); 
  }, 300);
});