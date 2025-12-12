/* /planet-website/script.js */
import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const heroText = document.getElementById("heroText");
const transitionEl = document.getElementById("transition");
const reefEl = document.getElementById("reef");
const iceEl = document.getElementById("ice");
const forestEl = document.getElementById("forest");
const calculatorEl = document.getElementById("calculator");
const calcOutroEl = document.getElementById("calcOutro");

const tint = document.getElementById("tint");
const vignette = document.getElementById("vignette");
const transitionHint = document.getElementById("transitionHint");

const reefSticky = document.getElementById("reefSticky");
const reefFog = document.getElementById("reefFog");
const reefCopy = document.getElementById("reefCopy");

const reefLayers = {
  bg: document.querySelector(".layer-bg"),
  mid: document.querySelector(".layer-mid"),
  midfg: document.querySelector(".layer-midfg"),
  fg: document.querySelector(".layer-fg"),
};

const bubbles = {
  left: document.getElementById("bubbleLeft"),
  mid: document.getElementById("bubbleMid"),
  right: document.getElementById("bubbleRight"),
};

const iceSticky = document.getElementById("iceSticky");
const iceFog = document.getElementById("iceFog");
const iceLayers = {
  bg: document.querySelector(".ice-bg"),
  mid: document.querySelector(".ice-mid"),
  fg: document.querySelector(".ice-fg"),
};

const iceBubbles = {
  left: document.getElementById("iceBubbleLeft"),
  mid: document.getElementById("iceBubbleMid"),
  right: document.getElementById("iceBubbleRight"),
};

const forestSticky = document.getElementById("forestSticky");
const forestFog = document.getElementById("forestFog");
const forestCopy = document.getElementById("forestCopy");

const forestLayers = {
  bg: document.querySelector(".forest-bg"),
  backmid: document.querySelector(".forest-backmid"),
  mid: document.querySelector(".forest-mid"),
  midfg: document.querySelector(".forest-midfg"),
  frontmid: document.querySelector(".forest-frontmid"),
  fg: document.querySelector(".forest-fg"),
};

const forestBubbles = {
  left: document.getElementById("forestBubbleLeft"),
  mid: document.getElementById("forestBubbleMid"),
  right: document.getElementById("forestBubbleRight"),
};

/* Calculator DOM */
const mealsInput = document.getElementById("mealsInput");
const mealsVal = document.getElementById("mealsVal");
const mealsHelp = document.getElementById("mealsHelp");

const commutesInput = document.getElementById("commutesInput");
const commutesVal = document.getElementById("commutesVal");
const commutesHelp = document.getElementById("commutesHelp");

const acInput = document.getElementById("acInput");
const acVal = document.getElementById("acVal");
const acHelp = document.getElementById("acHelp");

const resultCard = document.getElementById("resultCard");
const co2Big = document.getElementById("co2Big");
const treesRow = document.getElementById("treesRow");
const kmRow = document.getElementById("kmRow");

const calcHowBtn = document.getElementById("calcHowBtn");
const calcDialog = document.getElementById("calcDialog");
const calcCloseBtn = document.getElementById("calcCloseBtn");

const calcBreakdownBtn = document.getElementById("calcBreakdownBtn");
const calcBreakdown = document.getElementById("calcBreakdown");
const calcDiet = document.getElementById("calcDiet");
const calcTransport = document.getElementById("calcTransport");
const calcCooling = document.getElementById("calcCooling");

const calcReset = document.getElementById("calcReset");
const calcOutroBig = document.getElementById("calcOutroBig");
const calcSaveBtn = document.getElementById("calcSaveBtn");
const calcShareBtn = document.getElementById("calcShareBtn");
const calcToast = document.getElementById("calcToast");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function invLerp(a, b, v) { return clamp01((v - a) / Math.max(1e-6, b - a)); }

function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }) {
  const to = (x) => x.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
function lerpColor(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex({
    r: Math.round(lerp(A.r, B.r, t)),
    g: Math.round(lerp(A.g, B.g, t)),
    b: Math.round(lerp(A.b, B.b, t)),
  });
}
function setDomOpacity(el, v) { if (el) el.style.opacity = String(v); }
function setLayersOpacity(layers, v) { Object.values(layers).forEach((el) => el && (el.style.opacity = String(v))); }

/* ---------- Three.js: Earth + Stars ---------- */
const container = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);

function setCameraForViewport() {
  camera.position.set(0, 0, window.innerWidth < 720 ? 3.4 : 2.8);
}
setCameraForViewport();

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(6, 3, 6);
scene.add(sun);

const earthGroup = new THREE.Group();
scene.add(earthGroup);

const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const loader = new THREE.TextureLoader();
const earthTexture = loader.load("assets/earth.jpg");
earthTexture.colorSpace = THREE.SRGBColorSpace;

const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  roughness: 0.9,
  metalness: 0.0,
  transparent: true,
  opacity: 1,
});

const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earthMesh);

const glowGeometry = new THREE.SphereGeometry(1.03, 64, 64);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0x7fbfff,
  transparent: true,
  opacity: 0.085,
});
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
earthGroup.add(glow);

function makeStars(count = 2600, radius = 60) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius;
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size: 0.055, sizeAttenuation: true, transparent: true, opacity: 1 });
  return { points: new THREE.Points(geom, mat), mat };
}
const stars = makeStars();
scene.add(stars.points);

/* ---------- Offsets ---------- */
let reefOffsetsPx = { bg: 0, mid: 0, midfg: 0, fg: 0 };
let iceOffsetsPx = { bg: 0, mid: 0, fg: 0 };
let forestOffsetsPx = { bg: 0, backmid: 0, mid: 0, midfg: 0, frontmid: 0, fg: 0 };

function computeOffsets() {
  const vh = window.innerHeight / 100;
  reefOffsetsPx = { bg: 5 * vh, mid: 9 * vh, midfg: 13 * vh, fg: 18 * vh };
  iceOffsetsPx = { bg: 0 * vh, mid: 20 * vh, fg: 60 * vh };
  forestOffsetsPx = { bg: 4 * vh, backmid: 6 * vh, mid: 9 * vh, midfg: 13 * vh, frontmid: 17 * vh, fg: 22 * vh };
}
computeOffsets();

/* ---------- Scroll metrics ---------- */
const metrics = {
  transition: { start: 0, end: 1, range: 1 },
  reef: { start: 0, end: 1, range: 1 },
  ice: { start: 0, end: 1, range: 1 },
  forest: { start: 0, end: 1, range: 1 },
  calculator: { start: 0, end: 1, range: 1 },
  driver: { start: 0, end: 1, range: 1 },
};

function computeSectionMetrics(sectionEl) {
  const start = sectionEl.offsetTop;
  const end = start + sectionEl.offsetHeight - window.innerHeight;
  const range = Math.max(1, end - start);
  return { start, end, range };
}

function computeMetrics() {
  metrics.transition = computeSectionMetrics(transitionEl);
  metrics.reef = computeSectionMetrics(reefEl);
  metrics.ice = computeSectionMetrics(iceEl);
  metrics.forest = computeSectionMetrics(forestEl);
  metrics.calculator = computeSectionMetrics(calculatorEl);

  metrics.driver.start = 0;
  metrics.driver.end = metrics.transition.end;
  metrics.driver.range = Math.max(1, metrics.driver.end - metrics.driver.start);
}

function sectionProgress(m) {
  const y = window.scrollY || 0;
  return clamp01((y - m.start) / m.range);
}

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  setCameraForViewport();
  camera.updateProjectionMatrix();
  computeOffsets();
  computeMetrics();
}, { passive: true });

window.addEventListener("load", () => { computeOffsets(); computeMetrics(); }, { passive: true });
computeMetrics();

/* ---------- UI updates ---------- */
function updateTransitionUI(p) {
  const heroFade = 1 - easeOut(invLerp(0.0, 0.25, p));
  heroText.style.opacity = String(heroFade);
  heroText.style.transform = `translateY(${lerp(0, -10, 1 - heroFade)}px)`;

  const a = invLerp(0.0, 0.4, p);
  earthGroup.scale.setScalar(lerp(1.0, 1.15, easeOut(a)));

  const b = invLerp(0.4, 0.8, p);
  setDomOpacity(tint, lerp(0, 0.75, easeInOut(b)));
  setDomOpacity(vignette, lerp(0.0, 0.55, easeInOut(b)));

  const c = invLerp(0.8, 1.0, p);
  const earthAlpha = 1 - easeOut(c);
  earthMaterial.opacity = earthAlpha;
  glowMaterial.opacity = 0.085 * earthAlpha;
  stars.mat.opacity = lerp(1.0, 0.0, easeOut(invLerp(0.7, 1.0, p)));

  setDomOpacity(transitionHint, easeOut(invLerp(0.86, 1.0, p)));
}

function animateBubbles(elMap, bubbleP, speeds) {
  const t = easeInOut(bubbleP);
  const startVh = 130;
  const endVh = -130;

  const fadeIn = easeOut(invLerp(0.0, 0.10, bubbleP));
  const fadeOut = 1 - easeOut(invLerp(0.92, 1.0, bubbleP));
  const opacity = fadeIn * fadeOut;

  const apply = (el, speed) => {
    if (!el) return;
    const p = clamp01(t * speed);
    el.style.transform = `translateY(${lerp(startVh, endVh, p)}vh)`;
    el.style.opacity = String(opacity);
  };

  apply(elMap.left, speeds.left);
  apply(elMap.mid, speeds.mid);
  apply(elMap.right, speeds.right);
}

/* ---------- Reef ---------- */
function updateReefScene() {
  const yLocal = (window.scrollY || 0) - metrics.reef.start;

  const settlePx = 0.35 * window.innerHeight;
  const bubblePx = 2.6 * window.innerHeight;
  const maxLocal = metrics.reef.range;
  const exitPx = Math.max(1, maxLocal - settlePx - bubblePx);

  const settleT = easeInOut(clamp01(yLocal / settlePx));
  reefLayers.bg.style.transform = `translateY(${lerp(reefOffsetsPx.bg, 0, settleT)}px)`;
  reefLayers.mid.style.transform = `translateY(${lerp(reefOffsetsPx.mid, 0, settleT)}px)`;
  reefLayers.midfg.style.transform = `translateY(${lerp(reefOffsetsPx.midfg, 0, settleT)}px)`;
  reefLayers.fg.style.transform = `translateY(${lerp(reefOffsetsPx.fg, 0, settleT)}px)`;

  const top = lerpColor("#47d6ea", "#0a5f6c", settleT);
  const mid = lerpColor("#0a5f6c", "#06404a", settleT);
  const bot = lerpColor("#042d34", "#02161b", settleT);
  reefSticky.style.background = `linear-gradient(to bottom, ${top} 0%, ${mid} 55%, ${bot} 100%)`;
  reefFog.style.opacity = String(lerp(0.0, 0.55, settleT));

  const bubbleP = clamp01((yLocal - settlePx) / bubblePx);
  animateBubbles(bubbles, bubbleP, { left: 0.8, mid: 1.3, right: 1.05 });

  const exitP = clamp01((yLocal - (settlePx + bubblePx)) / exitPx);
  if (exitP > 0) {
    const a = 1 - easeOut(exitP);
    setLayersOpacity(reefLayers, a);
    if (reefCopy) {
      reefCopy.style.opacity = String(0.92 * a);
      reefCopy.style.transform = `translateX(-50%) translateY(${lerp(0, -18, easeOut(exitP))}px)`;
    }
    reefSticky.style.background = "#02161b";
    reefFog.style.opacity = String(lerp(0.55, 0.8, easeOut(exitP)));
  } else {
    setLayersOpacity(reefLayers, 1);
    if (reefCopy) {
      reefCopy.style.opacity = "0.92";
      reefCopy.style.transform = "translateX(-50%)";
    }
  }
}

/* ---------- Ice (with exit fade-to-forest-base) ---------- */
function updateIceScene() {
  const yLocal = (window.scrollY || 0) - metrics.ice.start;
  const vh = window.innerHeight;

  const skyPx = 0.40 * vh;
  const revealStartPx = 0.15 * vh;
  const settlePx = 0.55 * vh;
  const bubblePx = 2.6 * vh;

  const maxLocal = metrics.ice.range;
  const exitStart = revealStartPx + settlePx + bubblePx;
  const exitPx = Math.max(1, maxLocal - exitStart);

  const skyT = easeInOut(clamp01(yLocal / skyPx));
  const skyTop = lerpColor("#02161b", "#d9f6ff", skyT);
  const skyMid = lerpColor("#02161b", "#93d7f0", skyT);
  const skyBot = lerpColor("#02161b", "#0b5b73", skyT);

  const revealT = easeOut(clamp01((yLocal - revealStartPx) / Math.max(1e-6, 0.28 * vh)));
  setLayersOpacity(iceLayers, revealT);

  const settleRaw = clamp01((yLocal - revealStartPx) / Math.max(1e-6, settlePx));
  const baseT = easeInOut(settleRaw);
  const fgT = Math.pow(baseT, 0.58);

  iceLayers.bg.style.transform = "translateY(0px)";
  iceLayers.mid.style.transform = `translateY(${lerp(iceOffsetsPx.mid, 0, baseT)}px)`;

  const fgScale = lerp(1.55, 1.35, baseT);
  const fgY = lerp(iceOffsetsPx.fg, 0, fgT);
  iceLayers.fg.style.transform = `translateY(${fgY}px) scale(${fgScale})`;

  const bubbleP = clamp01((yLocal - (revealStartPx + settlePx)) / bubblePx);
  animateBubbles(iceBubbles, bubbleP, { left: 0.8, mid: 1.3, right: 1.05 });

  const exitP = clamp01((yLocal - exitStart) / exitPx);
  const exitT = easeOut(exitP);
  const iceAlpha = 1 - exitT;

  const forestBase = "#bfe9ff";
  const outTop = lerpColor(skyTop, forestBase, exitT);
  const outMid = lerpColor(skyMid, forestBase, exitT);
  const outBot = lerpColor(skyBot, forestBase, exitT);
  iceSticky.style.background = `linear-gradient(to bottom, ${outTop} 0%, ${outMid} 55%, ${outBot} 100%)`;

  setLayersOpacity(iceLayers, revealT * iceAlpha);
  setDomOpacity(iceFog, lerp(0.02, 0.22, skyT) * iceAlpha);
}

/* ---------- Forest (with exit fade to white for tool) ---------- */
function updateForestScene() {
  const yLocal = (window.scrollY || 0) - metrics.forest.start;
  const vh = window.innerHeight;

  const base = "#bfe9ff";
  const skyTop = "#d9f6ff";
  const skyMid = "#a9e6ff";
  const skyBot = "#78c7ef";

  const revealStartPx = 0.10 * vh;
  const revealPx = 0.28 * vh;
  const settlePx = 0.70 * vh;
  const bubblePx = 2.6 * vh;

  const maxLocal = metrics.forest.range;
  const exitStart = revealStartPx + settlePx + bubblePx;
  const exitPx = Math.max(1, maxLocal - exitStart);

  const exitP = clamp01((yLocal - exitStart) / exitPx);
  const exitT = easeOut(exitP);
  const forestAlpha = 1 - exitT;

  const bgT = easeInOut(clamp01(yLocal / (0.55 * vh)));
  const top0 = lerpColor(base, skyTop, bgT);
  const mid0 = lerpColor(base, skyMid, bgT);
  const bot0 = lerpColor(base, skyBot, bgT);

  const white = "#ffffff";
  const top = lerpColor(top0, white, exitT);
  const mid = lerpColor(mid0, white, exitT);
  const bot = lerpColor(bot0, white, exitT);
  forestSticky.style.background = `linear-gradient(to bottom, ${top} 0%, ${mid} 55%, ${bot} 100%)`;

  setDomOpacity(forestFog, lerp(0.0, 0.22, bgT) * forestAlpha);

  const revealT = easeOut(clamp01((yLocal - revealStartPx) / Math.max(1e-6, revealPx)));
  setLayersOpacity(forestLayers, revealT * forestAlpha);

  const settleT = easeInOut(clamp01((yLocal - revealStartPx) / Math.max(1e-6, settlePx)));
  forestLayers.bg.style.transform = `translateY(${lerp(forestOffsetsPx.bg, 0, settleT)}px)`;
  forestLayers.backmid.style.transform = `translateY(${lerp(forestOffsetsPx.backmid, 0, settleT)}px)`;
  forestLayers.mid.style.transform = `translateY(${lerp(forestOffsetsPx.mid, 0, settleT)}px)`;
  forestLayers.midfg.style.transform = `translateY(${lerp(forestOffsetsPx.midfg, 0, settleT)}px)`;
  forestLayers.frontmid.style.transform = `translateY(${lerp(forestOffsetsPx.frontmid, 0, settleT)}px)`;
  forestLayers.fg.style.transform = `translateY(${lerp(forestOffsetsPx.fg, 0, settleT)}px)`;

  const bubbleStart = revealStartPx + settlePx;
  const bubbleP = clamp01((yLocal - bubbleStart) / bubblePx);
  animateBubbles(forestBubbles, bubbleP, { left: 0.8, mid: 1.3, right: 1.05 });

  if (forestCopy) {
    const copyIn = easeOut(revealT);
    const yIn = lerp(10, 0, copyIn);
    const yOut = lerp(0, -18, exitT);
    forestCopy.style.opacity = String(0.92 * revealT * forestAlpha);
    forestCopy.style.transform = `translateX(-50%) translateY(${yIn + yOut}px)`;
  }
}

/* ---------- Calculator (entry animation + engine) ---------- */
function helperMeals(v) {
  if (v === 0) return "No change from baseline.";
  if (v >= 14) return "Mostly plant-based week.";
  if (v >= 7) return "About 1 meat-free meal per day.";
  return "Small weekly shift.";
}

function helperCommutes(v) {
  return v === 0 ? "Replacing car rides has a big impact." : "Replacing car rides has a big impact.";
}

function helperAC(v) {
  return "Higher temperature usually reduces energy use.";
}

const engine = {
  baselineMeals: 2,
  baselineCommutes: 2,
  baselineAC: 24,
  kgPerMeal: 45,
  kgPerCommute: 120,
  kgPerDeg: 90,
};

let lastResult = { total: 0, diet: 0, transport: 0, cooling: 0 };

function computeImpact(meals, commutes, ac) {
  const diet = (meals - engine.baselineMeals) * engine.kgPerMeal;
  const transport = (commutes - engine.baselineCommutes) * engine.kgPerCommute;
  const cooling = (engine.baselineAC - ac) * engine.kgPerDeg;
  const total = Math.max(0, Math.round(diet + transport + cooling));
  return {
    total,
    diet: Math.max(0, Math.round(diet)),
    transport: Math.max(0, Math.round(transport)),
    cooling: Math.max(0, Math.round(cooling)),
  };
}

function animateNumber(el, from, to, ms = 520) {
  if (!el) return;
  const start = performance.now();
  const step = (now) => {
    const t = clamp01((now - start) / ms);
    const v = Math.round(lerp(from, to, easeOut(t)));
    el.textContent = String(v);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function updateCalculatorUI(next) {
  if (!co2Big) return;

  animateNumber(co2Big, lastResult.total, next.total, 560);
  animateNumber(calcOutroBig, lastResult.total, next.total, 560);

  const trees = Math.round(next.total / 21);
  const km = Math.round(next.total / 0.17);

  treesRow.textContent = `≈ ${trees} trees grown for a year`;
  kmRow.textContent = `≈ ${km} km of driving avoided`;

  calcDiet.textContent = `${next.diet} kg`;
  calcTransport.textContent = `${next.transport} kg`;
  calcCooling.textContent = `${next.cooling} kg`;

  if (resultCard) {
    resultCard.classList.remove("pulse");
    void resultCard.offsetWidth;
    resultCard.classList.add("pulse");
  }

  lastResult = next;
}

function readInputs() {
  const meals = Number(mealsInput?.value ?? 0);
  const commutes = Number(commutesInput?.value ?? 0);
  const ac = Number(acInput?.value ?? 24);
  return { meals, commutes, ac };
}

function syncInputsUI() {
  const { meals, commutes, ac } = readInputs();

  mealsVal.textContent = `${meals} / 21`;
  mealsHelp.textContent = helperMeals(meals);

  commutesVal.textContent = `${commutes} trips/week`;
  commutesHelp.textContent = helperCommutes(commutes);

  acVal.textContent = `${ac}°C`;
  acHelp.textContent = helperAC(ac);

  updateCalculatorUI(computeImpact(meals, commutes, ac));
}

mealsInput?.addEventListener("input", syncInputsUI, { passive: true });
commutesInput?.addEventListener("input", syncInputsUI, { passive: true });
acInput?.addEventListener("input", syncInputsUI, { passive: true });

calcReset?.addEventListener("click", () => {
  mealsInput.value = String(engine.baselineMeals);
  commutesInput.value = String(engine.baselineCommutes);
  acInput.value = String(engine.baselineAC);
  syncInputsUI();
});

calcHowBtn?.addEventListener("click", () => calcDialog?.showModal());
calcCloseBtn?.addEventListener("click", () => calcDialog?.close());

calcBreakdownBtn?.addEventListener("click", () => {
  if (!calcBreakdown) return;
  const open = calcBreakdown.classList.toggle("is-open");
  calcBreakdown.setAttribute("aria-hidden", open ? "false" : "true");
  calcBreakdownBtn.textContent = open ? "Hide breakdown" : "Show breakdown";
});

calcSaveBtn?.addEventListener("click", () => {
  const plan = readInputs();
  localStorage.setItem("planetsos_plan", JSON.stringify(plan));
  if (calcToast) calcToast.textContent = "Saved. You can come back anytime.";
});

calcShareBtn?.addEventListener("click", async () => {
  const plan = readInputs();
  const text = `PlanetOS plan: ${plan.meals} meat-free meals/week, ${plan.commutes} public transport trips/week, AC ${plan.ac}°C.`;
  try {
    await navigator.clipboard.writeText(text);
    if (calcToast) calcToast.textContent = "Copied to clipboard.";
  } catch {
    if (calcToast) calcToast.textContent = "Copy failed — your browser may block clipboard on file:// URLs.";
  }
});

syncInputsUI();

/* Calculator in-view trigger */
if (calculatorEl && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && calculatorEl.classList.add("is-inview")),
    { threshold: 0.35 }
  );
  io.observe(calculatorEl);
}

/* ---------- Animate ---------- */
const MIN_RAD = THREE.MathUtils.degToRad(-30);
const MAX_RAD = THREE.MathUtils.degToRad(30);

let currentRot = MIN_RAD;
let targetRot = MIN_RAD;

function animate() {
  requestAnimationFrame(animate);

  if (reduceMotion) {
    renderer.render(scene, camera);
    return;
  }

  const driveP = sectionProgress(metrics.driver);
  targetRot = lerp(MIN_RAD, MAX_RAD, driveP);
  currentRot = lerp(currentRot, targetRot, 0.12);

  earthGroup.rotation.y += 0.0008;
  earthMesh.rotation.y = currentRot;
  glow.rotation.y = currentRot;

  updateTransitionUI(sectionProgress(metrics.transition));
  updateReefScene();
  updateIceScene();
  updateForestScene();

  renderer.render(scene, camera);
}

animate();
