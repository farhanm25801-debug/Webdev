// @ts-nocheck
/* ============================================================
   CREATIVEVERSE — script.js
   EDIT THE CONFIG BELOW FIRST. Everything else can stay as is.
   ============================================================ */
const CONFIG = {
  // Your email. Replace before publishing.
  email: "your.email@example.com", // <-- REPLACE

  // Social links. Replace each URL (keep the quotes). Delete a line to remove it.
  socials: [
    { label: "Instagram", url: "https://instagram.com/YOUR_HANDLE" }, // <-- REPLACE
    { label: "YouTube", url: "https://youtube.com/@YOUR_HANDLE" },    // <-- REPLACE
    { label: "Behance", url: "https://behance.net/YOUR_HANDLE" },     // <-- REPLACE
    { label: "LinkedIn", url: "https://linkedin.com/in/YOUR_HANDLE" } // <-- REPLACE
  ],

  // NOVA promo video. Leave "" to show the animated placeholder.
  // Example: "assets/video/nova-promo.mp4"
  novaVideo: "",
  novaPoster: "" // Optional, e.g. "assets/images/nova-poster.jpg"
};

/* ============================================================ */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

  const loader = $("#loader");
  const toastEl = $("#toast");

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  /* ---------- Config: email, socials, year ---------- */
  const emailBtn = $("#emailBtn");
  emailBtn.href = "mailto:" + CONFIG.email;
  if (CONFIG.email.indexOf("example.com") !== -1) {
    emailBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toast("Replace the email in CONFIG.email (script.js)");
    });
  }

  const socialList = $("#socials");
  CONFIG.socials.forEach((s) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = s.label;
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (s.url.indexOf("YOUR_HANDLE") !== -1) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        toast("Replace the " + s.label + " link in CONFIG.socials (script.js)");
      });
    }
    li.appendChild(a);
    socialList.appendChild(li);
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Loader + reveals ---------- */
  let loaderGone = false;
  function hideLoader() {
    if (loaderGone) return;
    loaderGone = true;
    loader.classList.add("done");
    document.body.classList.add("loaded");
    startReveals();
  }
  window.addEventListener("load", () => setTimeout(hideLoader, 250));
  setTimeout(hideLoader, 3000); // safety net if a font or image is slow

  function startReveals() {
    const items = $$("[data-reveal]");
    items.forEach((el, i) => el.style.setProperty("--d", (i % 3) * 90 + "ms"));
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Nav ---------- */
  const menuBtn = $("#menuBtn");
  const navLinks = $("#navLinks");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("open", open);
  }
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav")) setMenu(false);
  });

  /* ---------- Subtle parallax (one rAF-throttled scroll listener) ---------- */
  if (!reduced) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--scroll", Math.min(window.scrollY, 1200));
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Cursor glow (desktop only) ---------- */
  const glow = $("#cursorGlow");
  if (finePointer && !reduced && glow) {
    let gx = 0, gy = 0, gTick = false;
    window.addEventListener("pointermove", (e) => {
      gx = e.clientX; gy = e.clientY;
      if (gTick) return;
      gTick = true;
      requestAnimationFrame(() => {
        glow.style.transform = "translate(" + gx + "px," + gy + "px)";
        glow.classList.add("on");
        gTick = false;
      });
    }, { passive: true });
    document.addEventListener("pointerleave", () => glow.classList.remove("on"));
  }

  /* ---------- Card tilt (mouse and pen only) ---------- */
  if (finePointer && !reduced) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
        card.style.setProperty("--ry", ((px - 0.5) * 8).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - py) * 8).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- NOVA video (loaded only when you press play) ---------- */
  (function setupVideo() {
    const box = $("#videoBox");
    const video = $("#novaVideo");
    const reel = $("#reelPlaceholder");
    const playBtn = $("#playBtn");
    const note = $("#videoNote");

    if (!CONFIG.novaVideo) {
      playBtn.addEventListener("click", () => toast("Add your video path in CONFIG.novaVideo (script.js)"));
      return;
    }

    note.textContent = "NOVA promo film";
    if (CONFIG.novaPoster) video.poster = CONFIG.novaPoster;

    playBtn.addEventListener("click", () => {
      playBtn.disabled = true;
      note.textContent = "Loading video...";
      video.addEventListener("error", () => {
        video.hidden = true;
        reel.hidden = false;
        playBtn.hidden = false;
        playBtn.disabled = false;
        note.textContent = "Video not found. Check the path in CONFIG.novaVideo.";
        toast("Video failed to load. Check the file name and folder.");
      }, { once: true });
      video.addEventListener("playing", () => {
        note.textContent = "NOVA promo film";
      }, { once: true });
      video.src = CONFIG.novaVideo;
      video.hidden = false;
      reel.hidden = true;
      playBtn.hidden = true;
      box.classList.add("playing");
      video.play().catch(() => { /* user can press the native play control */ });
    });
  })();

  /* ---------- 3D hero ---------- */
  const stage = $("#stage");
  const canvas = $("#heroCanvas");

  // The stage shows the CSS fallback until it gets the class "ready".
  function useFallback() {
    stage.classList.remove("ready");
    stage.classList.add("no-3d");
  }

  function loadThree() {
    return new Promise((resolve, reject) => {
      if (window.THREE) return resolve();
      const s = document.createElement("script");
      s.src = THREE_URL;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Three.js failed to load"));
      document.head.appendChild(s);
    });
  }

  function hasWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  async function init3D() {
    if (!hasWebGL()) throw new Error("No WebGL");
    await loadThree();
    const THREE = window.THREE;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0.2, 7.5);

    /* Lights: two coloured points that drift for the animated gradient feel */
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(2, 4, 5);
    scene.add(key);
    const lightA = new THREE.PointLight(0x8b3dff, 2.2, 14);
    const lightB = new THREE.PointLight(0xff5a1f, 2.0, 14);
    scene.add(lightA, lightB);

    /* Materials */
    const mHead = new THREE.MeshStandardMaterial({ color: 0xf1ecff, roughness: 0.32, metalness: 0.1 });
    const mVisor = new THREE.MeshStandardMaterial({ color: 0x0b0814, roughness: 0.12, metalness: 0.85 });
    const mEye = new THREE.MeshStandardMaterial({ color: 0xc6ff3d, emissive: 0xc6ff3d, emissiveIntensity: 1.1 });
    const mOrange = new THREE.MeshStandardMaterial({ color: 0xff5a1f, roughness: 0.4, metalness: 0.2 });
    const mPurple = new THREE.MeshStandardMaterial({ color: 0x8b3dff, roughness: 0.35, metalness: 0.3 });

    /* Character (all procedural, no model file needed) */
    const root = new THREE.Group();
    scene.add(root);
    const character = new THREE.Group();
    root.add(character);

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 20), mPurple);
    body.scale.set(1, 1.1, 0.8);
    body.position.y = -0.55;
    character.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), mHead);
    head.scale.set(1.15, 0.95, 1.0);
    head.position.y = 1.05;
    character.add(head);

    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 20), mVisor);
    visor.scale.set(1.12, 0.62, 0.5);
    visor.position.set(0, 1.08, 0.7);
    character.add(visor);

    const eyes = new THREE.Group();
    eyes.position.set(0, 1.1, 1.02);
    [-0.32, 0.32].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mEye);
      eye.scale.set(1, 1.7, 0.4);
      eye.position.x = x;
      eyes.add(eye);
    });
    character.add(eyes);

    [-1, 1].forEach((s) => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.28, 24), mOrange);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(s * 1.2, 1.05, 0);
      character.add(ear);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), mOrange);
      hand.position.set(s * 1.15, -0.35, 0.25);
      character.add(hand);
    });

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), mHead);
    stem.position.set(0, 2.05, 0);
    character.add(stem);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), mEye);
    bulb.position.set(0, 2.35, 0);
    character.add(bulb);

    /* Orbiting ring for depth */
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.035, 12, 80), mOrange);
    ring.rotation.set(1.2, 0.3, 0);
    root.add(ring);

    /* Pointer tracking (target values are smoothed in the loop) */
    const target = { x: 0, y: 0 };
    window.addEventListener("pointermove", (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
    document.addEventListener("pointerleave", () => { target.x = 0; target.y = 0; });

    /* Sizing follows the stage, so there are no layout shifts */
    function resize() {
      const w = stage.clientWidth || 300;
      const h = stage.clientHeight || 300;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener("resize", resize);
    resize();

    /* Animation loop: runs only while the hero is visible and the tab is active */
    let running = false;
    let heroVisible = true;

    function frame(t) {
      if (!running) return;
      const sway = Math.sin(t * 0.0016);
      character.position.y = sway * 0.12;
      character.rotation.z = Math.sin(t * 0.0011) * 0.03;
      root.rotation.y += (target.x * 0.55 - root.rotation.y) * 0.06;
      root.rotation.x += (target.y * 0.25 - root.rotation.x) * 0.06;
      ring.rotation.z = t * 0.0004;
      eyes.scale.y = (t % 4200) < 120 ? 0.1 : 1; // quick blink
      lightA.position.set(Math.sin(t * 0.0009) * 4, 2 + Math.cos(t * 0.0007) * 1.5, 3);
      lightB.position.set(Math.cos(t * 0.0008) * -4, -1.5 + Math.sin(t * 0.0006), 3);
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduced) return;
      running = true;
      requestAnimationFrame(frame);
    }
    function stop() { running = false; }
    function sync() { (heroVisible && !document.hidden) ? start() : stop(); }

    document.addEventListener("visibilitychange", sync);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((en) => { heroVisible = en[0].isIntersecting; sync(); }, { threshold: 0.01 }).observe(stage);
    }

    /* If the GPU context is lost, switch to the fallback gracefully */
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); stop(); useFallback(); });

    // First frame is always drawn (also covers reduced motion: static pose)
    renderer.render(scene, camera);
    stage.classList.add("ready");
    sync();
  }

  /* Load 3D when the browser is idle so text and layout appear first */
  const kick = () => init3D().catch(() => useFallback());
  if ("requestIdleCallback" in window) requestIdleCallback(kick, { timeout: 1500 });
  else setTimeout(kick, 400);
})();