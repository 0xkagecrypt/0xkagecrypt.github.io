document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- terminal boot sequence ---------- */

const bootLines = [
  "[boot] initializing shadow_protocol...",
  "[boot] loading security_modules ... done",
  "[boot] target_chains: solana, rust-chains, zk",
];
const promptLine = "0xkagecrypt@web3:~$ status --current";
const taglineText =
  "Full-time on Solana security. Auditing DeFi programs, drilling into Anchor account validation.";

function typeLine(el, text, speed) {
  return new Promise((resolve) => {
    let i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        resolve();
      }
    })();
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function revealFocusBadges() {
  document.querySelectorAll(".focus-badge").forEach((badge, idx) => {
    setTimeout(() => badge.classList.add("is-visible"), idx * 120);
  });
}

async function runBootSequence() {
  const output = document.getElementById("terminal-output");
  if (!output) return;

  if (prefersReducedMotion) {
    output.innerHTML = "";
    bootLines.forEach((line) => {
      const div = document.createElement("div");
      div.className = "term-line term-muted";
      div.textContent = line;
      output.appendChild(div);
    });
    const promptDiv = document.createElement("div");
    promptDiv.className = "term-line term-prompt";
    promptDiv.textContent = promptLine;
    output.appendChild(promptDiv);
    const tagDiv = document.createElement("div");
    tagDiv.className = "term-line term-tagline";
    tagDiv.textContent = taglineText;
    output.appendChild(tagDiv);
    revealFocusBadges();
    return;
  }

  for (const line of bootLines) {
    const div = document.createElement("div");
    div.className = "term-line term-muted";
    output.appendChild(div);
    await typeLine(div, line, 12);
    await wait(120);
  }

  const promptDiv = document.createElement("div");
  promptDiv.className = "term-line term-prompt";
  output.appendChild(promptDiv);
  await typeLine(promptDiv, promptLine, 25);
  await wait(300);

  const tagDiv = document.createElement("div");
  tagDiv.className = "term-line term-tagline";
  output.appendChild(tagDiv);
  await typeLine(tagDiv, taglineText, 18);

  const cursor = document.createElement("span");
  cursor.className = "term-cursor";
  tagDiv.appendChild(cursor);

  revealFocusBadges();
}

runBootSequence();

/* ---------- scroll-triggered reveal ---------- */

const revealEls = document.querySelectorAll(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

/* ---------- cursor glow (desktop) / tap ripple (mobile) ---------- */

if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  window.addEventListener(
    "mousemove",
    (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    },
    { passive: true }
  );

  function animateGlow() {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;
    glow.style.transform = `translate3d(${currentX - 150}px, ${currentY - 150}px, 0)`;
    requestAnimationFrame(animateGlow);
  }
  requestAnimationFrame(animateGlow);
} else if (window.matchMedia("(pointer: coarse)").matches) {
  document.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      const ripple = document.createElement("span");
      ripple.className = "tap-ripple";
      ripple.style.left = `${touch.clientX}px`;
      ripple.style.top = `${touch.clientY}px`;
      document.body.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    },
    { passive: true }
  );
}

/* ---------- ambient snow in hero (canvas) ---------- */

function initSnow() {
  const canvas = document.getElementById("snow-canvas");
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  let width, height, particles;

  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }

  function makeParticles() {
    const count = window.innerWidth < 640 ? 16 : 32;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.4,
      speed: Math.random() * 0.35 + 0.12,
      drift: Math.random() * 0.3 - 0.15,
      alpha: Math.random() * 0.45 + 0.1,
    }));
  }

  resize();
  makeParticles();
  window.addEventListener(
    "resize",
    () => {
      resize();
      makeParticles();
    },
    { passive: true }
  );

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
  });

  function frame() {
    if (running) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#E8E6F0";
      particles.forEach((p) => {
        p.y += p.speed;
        p.x += p.drift;
        if (p.y > height) {
          p.y = -4;
          p.x = Math.random() * width;
        }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

initSnow();

/* ---------- magnetic hover buttons ---------- */

if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".magnetic").forEach((el) => {
    let rect = null;

    el.addEventListener("mouseenter", () => {
      rect = el.getBoundingClientRect();
    });

    el.addEventListener(
      "mousemove",
      (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.25}px)`;
      },
      { passive: true }
    );

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
      rect = null;
    });
  });
}

/* ---------- active nav link on scroll ---------- */

const navLinks = document.querySelectorAll("[data-nav-link]");

if (navLinks.length && "IntersectionObserver" in window) {
  const linkFor = (id) =>
    document.querySelector(`[data-nav-link][href="#${id}"]`);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = linkFor(entry.target.id);
          if (!link) return;
          navLinks.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  document
    .querySelectorAll("main section[id]")
    .forEach((section) => sectionObserver.observe(section));
}
