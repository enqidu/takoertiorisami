/* ═══════════════════════════════════════════════════════════════
   TAKO — CREATURE LAB
   behaviors: cursor-creature, eye-follower, galleries, lightbox,
              click-splats, wobble-on-scroll, pet-the-creature,
              magnetic buttons, scroll-reveal, marquee duplication
   ═══════════════════════════════════════════════════════════════ */

// posts are loaded from /js/posts.js (window.POSTS)
const posts = window.POSTS || [];


// ─── PLACEHOLDER FALLBACKS (fuzzy creatures, in case images missing) ────
const makePlaceholder = (type, color = "var(--bubble)") => `
  <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%">
    <rect width="600" height="400" fill="#fbf4e3"/>
    <g transform="translate(200,100) scale(2)" style="color:${color}">
      <use href="#creature"/>
    </g>
  </svg>`;


// ─── RENDER ──────────────────────────────────────────────────────────

const renderTags = (tags) =>
  (tags || []).map(tag => `<span class="tag">${tag}</span>`).join("");

const renderSlides = (post) => {
  if (post.images && post.images.length > 0) {
    return post.images.map((src, i) =>
      `<div class="gallery-slide">
        <img src="${src}" alt="${post.title} — ${i + 1}" loading="lazy" draggable="false"/>
      </div>`
    ).join("");
  }
  return `<div class="gallery-slide">${makePlaceholder(post.placeholder || "doodles")}</div>`;
};

const renderGalleryControls = (total, pid) => {
  if (total <= 1) return "";
  const dots = Array.from({ length: total }, (_, i) =>
    `<button class="dot-btn ${i === 0 ? "active" : ""}" aria-label="Image ${i+1}" data-index="${i}"></button>`
  ).join("");
  return `
    <div class="gallery-controls">
      <div class="gallery-dots" id="${pid}-dots">${dots}</div>
      <span class="gallery-counter" id="${pid}-counter">1 / ${total}</span>
      <div class="gallery-arrows">
        <button class="arrow-btn" id="${pid}-prev" aria-label="Previous">←</button>
        <button class="arrow-btn" id="${pid}-next" aria-label="Next">→</button>
      </div>
    </div>`;
};

const renderPost = (post, index, workNum) => {
  const pid    = `post-${index}`;
  const isIdea = post.type === "idea";

  if (isIdea) {
    return `<section class="work-section work-idea reveal" id="${pid}">
      <div class="idea-inner">
        <span class="idea-label">✦ &nbsp; * * * &nbsp; ✦</span>
        <blockquote class="idea-text">${post.description}</blockquote>
        <div class="idea-footer">
          ${post.title ? `<span class="idea-title">— ${post.title}</span>` : ""}
          <span class="idea-date">${post.date}</span>
        </div>
      </div>
    </section>`;
  }

  const postNum   = String(workNum).padStart(2, "0");
  const hasImages = post.images && post.images.length > 0;
  const total     = hasImages ? post.images.length : 1;

  return `<section class="work-section reveal" id="${pid}">
    <header class="work-head">
      <span class="work-num">${postNum}</span>
      <span class="work-date">${post.date}</span>
    </header>
    <h2 class="work-title">${post.title || ""}</h2>
    <div class="work-gallery" data-tilt>
      <div class="gallery-frame">
        <div class="gallery-viewport" id="${pid}-viewport">
          <div class="gallery-track${total > 1 ? ' is-multi' : ''}" id="${pid}-track">
            ${renderSlides(post)}
          </div>
        </div>
      </div>
      ${renderGalleryControls(total, pid)}
    </div>
    <div class="work-body">
      <p class="work-desc">${post.description}</p>
      <div class="work-tags">${renderTags(post.tags)}</div>
    </div>
  </section>`;
};


// ─── GALLERY INTERACTION ─────────────────────────────────────────────
const initGallery = (pid, total) => {
  if (total <= 1) return;
  const track   = document.getElementById(`${pid}-track`);
  const dots    = document.getElementById(`${pid}-dots`);
  const counter = document.getElementById(`${pid}-counter`);
  const prev    = document.getElementById(`${pid}-prev`);
  const next    = document.getElementById(`${pid}-next`);
  if (!track) return;

  let cur = 0;
  const go = (n) => {
    cur = ((n % total) + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots?.querySelectorAll(".dot-btn").forEach((d, i) => d.classList.toggle("active", i === cur));
    if (counter) counter.textContent = `${cur + 1} / ${total}`;
  };

  prev?.addEventListener("click", () => go(cur - 1));
  next?.addEventListener("click", () => go(cur + 1));
  dots?.querySelectorAll(".dot-btn").forEach(d =>
    d.addEventListener("click", () => go(Number(d.dataset.index)))
  );

  const vp = document.getElementById(`${pid}-viewport`);
  let tx = 0;
  vp?.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
  vp?.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1);
  }, { passive: true });
};


// ─── CREATURE CURSOR with EMOTIONS ──────────────────────────────────
// States: idle · is-curious · is-dizzy · is-reading · is-absorbing
const initCursor = () => {
  const creature = document.getElementById("cursorCreature");
  const trail    = document.getElementById("cursorTrail");
  const emote    = document.getElementById("ccEmote");
  const pupilL   = creature?.querySelector(".cc-pupil-l");
  const pupilR   = creature?.querySelector(".cc-pupil-r");
  if (!creature || !trail) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  let mx = -100, my = -100;
  let tx = -100, ty = -100;
  const trailPts = []; // for circular-motion detection

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    creature.style.left = mx + "px";
    creature.style.top  = my + "px";
    trailPts.push({ x: mx, y: my, t: performance.now() });
    while (trailPts.length && performance.now() - trailPts[0].t > 800) trailPts.shift();
  });

  const follow = () => {
    tx += (mx - tx) * 0.22;
    ty += (my - ty) * 0.22;
    trail.style.left = tx + "px";
    trail.style.top  = ty + "px";
    requestAnimationFrame(follow);
  };
  follow();

  // ── emote bubble helper ─────────────────────────────────
  let emoteHideTimer = null;
  const showEmote = (text, variant = "", ms = 1200) => {
    if (!emote) return;
    clearTimeout(emoteHideTimer);
    emote.textContent = text;
    emote.className = "cc-emote is-show " + variant;
    emoteHideTimer = setTimeout(() => emote.classList.remove("is-show"), ms);
  };

  // ── state flags ─────────────────────────────────────────
  let isDizzy = false, isReading = false, isAbsorbing = false;
  const setState = (name, on) => creature.classList.toggle(name, on);

  // ── PUPILS look toward mouse direction when idle ───────
  let lastMx = mx, lastMy = my;
  const lookTick = () => {
    if (!isDizzy && !isReading && pupilL && pupilR) {
      const dx = mx - lastMx;
      const dy = my - lastMy;
      const mag = Math.min(Math.hypot(dx, dy) / 30, 1);
      const ang = Math.atan2(dy, dx);
      const lx = Math.cos(ang) * 2.5 * mag;
      const ly = Math.sin(ang) * 2.5 * mag;
      creature.style.setProperty("--plx", lx.toFixed(2) + "px");
      creature.style.setProperty("--ply", ly.toFixed(2) + "px");
      creature.style.setProperty("--prx", lx.toFixed(2) + "px");
      creature.style.setProperty("--pry", ly.toFixed(2) + "px");
    }
    lastMx += (mx - lastMx) * 0.15;
    lastMy += (my - lastMy) * 0.15;
    requestAnimationFrame(lookTick);
  };
  lookTick();

  // ── HOVER: grow on interactive targets ──────────────────
  const hoverTargets = "a, button, .gallery-viewport, .work-gallery, .portrait-frame, .lightbox-close, .lightbox-nav, .tag, .click-zone, .match-card, .game-btn";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.add("cursor-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove("cursor-hover");
  });

  // ── CURIOUS: hovering over / near a painting image ─────
  const imgSelector = ".gallery-slide img, .portrait-frame img, .match-card img";
  let curiousFor = null;
  document.addEventListener("mouseover", (e) => {
    const img = e.target.closest(imgSelector);
    if (img && !isAbsorbing && !isDizzy) {
      curiousFor = img;
      setState("is-curious", true);
      showEmote("?", "pop-curious", 900);
      scheduleAbsorb(img);
    }
  });
  document.addEventListener("mouseout", (e) => {
    const img = e.target.closest(imgSelector);
    if (img && curiousFor === img) {
      curiousFor = null;
      setState("is-curious", false);
      cancelAbsorb();
    }
  });

  // ── DIZZY: detect circular motion ───────────────────────
  let dizzyEndAt = 0;
  const checkCircular = () => {
    if (isReading || isAbsorbing) return;
    if (trailPts.length < 12) return;
    // sum turning angles across last 600ms
    const pts = trailPts.slice(-24);
    let sumAngle = 0, lastAng = null;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i-1].x;
      const dy = pts[i].y - pts[i-1].y;
      if (Math.hypot(dx, dy) < 2) continue;
      const ang = Math.atan2(dy, dx);
      if (lastAng !== null) {
        let d = ang - lastAng;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        sumAngle += d;
      }
      lastAng = ang;
    }
    // >= ~1.6 full turns in < 800ms → dizzy
    if (Math.abs(sumAngle) > Math.PI * 3.2) {
      if (!isDizzy) {
        isDizzy = true;
        setState("is-dizzy", true);
        showEmote("@", "pop-dizzy", 1800);
      }
      dizzyEndAt = performance.now() + 1800;
    }
    if (isDizzy && performance.now() > dizzyEndAt) {
      isDizzy = false;
      setState("is-dizzy", false);
    }
  };
  setInterval(checkCircular, 120);

  // ── READING: click on a textual element ────────────────
  const readableSel = "p, h1, h2, h3, h4, h5, h6, blockquote, li, .work-desc, .idea-text, .hero-tag, .work-title, .site-name";
  document.addEventListener("click", (e) => {
    const t = e.target.closest(readableSel);
    if (!t) return;
    const text = (t.textContent || "").trim();
    if (text.length < 4) return;
    // don't override dizzy/absorb
    if (isDizzy || isAbsorbing) return;
    isReading = true;
    setState("is-reading", true);
    showEmote("!", "pop-read", 1400);
    setTimeout(() => {
      isReading = false;
      setState("is-reading", false);
    }, 1400);
  });

  // ── ABSORB: 10s hovering still on an image → sample color ─
  let absorbTimer = null;
  let absorbStart = 0;
  const scheduleAbsorb = (img) => {
    cancelAbsorb();
    absorbStart = performance.now();
    const baselineMx = mx, baselineMy = my;
    absorbTimer = setTimeout(() => {
      // only fire if still hovering same img, not moved far
      if (curiousFor !== img) return;
      if (Math.hypot(mx - baselineMx, my - baselineMy) > 80) return;
      absorbColorFrom(img);
    }, 10000);
  };
  const cancelAbsorb = () => {
    if (absorbTimer) { clearTimeout(absorbTimer); absorbTimer = null; }
  };

  const absorbColorFrom = (img) => {
    try {
      const rect = img.getBoundingClientRect();
      const rx = (mx - rect.left) / rect.width;
      const ry = (my - rect.top)  / rect.height;
      if (rx < 0 || rx > 1 || ry < 0 || ry > 1) return;
      const c = document.createElement("canvas");
      const w = Math.max(1, img.naturalWidth || img.width);
      const h = Math.max(1, img.naturalHeight || img.height);
      c.width = w; c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const px = ctx.getImageData(Math.floor(rx * w), Math.floor(ry * h), 1, 1).data;
      // avoid near-white/near-black/fully-transparent picks — nudge to find a saturated pixel
      let [r, g, b, a] = px;
      if (a < 20 || (r + g + b > 720) || (r + g + b < 40)) {
        // sample a small neighborhood and pick the most saturated
        const sample = ctx.getImageData(Math.max(0, Math.floor(rx*w)-6), Math.max(0, Math.floor(ry*h)-6), 13, 13).data;
        let best = [r,g,b], bestSat = 0;
        for (let i = 0; i < sample.length; i += 4) {
          const R = sample[i], G = sample[i+1], B = sample[i+2];
          const mx2 = Math.max(R,G,B), mn = Math.min(R,G,B);
          const sat = mx2 === 0 ? 0 : (mx2 - mn) / mx2;
          if (sat > bestSat && mx2 > 30 && mx2 < 245) { bestSat = sat; best = [R,G,B]; }
        }
        [r,g,b] = best;
      }
      const color = `rgb(${r}, ${g}, ${b})`;
      isAbsorbing = true;
      setState("is-absorbing", true);
      showEmote("★", "pop-absorb", 1200);
      // flash to new color mid-animation
      setTimeout(() => {
        creature.style.setProperty("--cc-color", color);
      }, 350);
      setTimeout(() => {
        isAbsorbing = false;
        setState("is-absorbing", false);
      }, 1200);
    } catch (err) {
      // CORS or decode error — skip
    }
  };

  // occasional blink during idle
  setInterval(() => {
    if (isDizzy || isReading || isAbsorbing) return;
    const eyes = creature.querySelectorAll(".cc-eye");
    eyes.forEach(e => e.setAttribute("ry", "1"));
    setTimeout(() => eyes.forEach(e => e.setAttribute("ry", "8")), 120);
  }, 4200);
};


// ─── FLOATER CREATURES — follow cursor slightly ──────────────────────
const initFloaters = () => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const floaters = document.querySelectorAll(".floater");
  if (!floaters.length) return;
  let mx = 0.5, my = 0.5;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
  });
  // gentle cursor pull, smoothed with lerp so cursor movement doesn't jitter
  const state = Array.from(floaters, () => ({ x: 0, y: 0 }));
  const tick = () => {
    floaters.forEach((f, i) => {
      const pull = 4; // gentle, consistent
      const targetX = (mx - 0.5) * pull;
      const targetY = (my - 0.5) * pull;
      state[i].x += (targetX - state[i].x) * 0.08;
      state[i].y += (targetY - state[i].y) * 0.08;
      f.style.setProperty("--ox", state[i].x.toFixed(2) + "px");
      f.style.setProperty("--oy", state[i].y.toFixed(2) + "px");
    });
    requestAnimationFrame(tick);
  };
  tick();
};


// ─── SCROLL REVEAL ────────────────────────────────────────────────────
const initReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
};


// ─── NAV SCROLL STATE ────────────────────────────────────────────────
const initNavScroll = () => {
  const nav  = document.querySelector(".nav");
  const hero = document.querySelector(".hero");
  if (!nav || !hero) return;
  const observer = new IntersectionObserver(([entry]) => {
    nav.classList.toggle("nav-scrolled", !entry.isIntersecting);
  }, { threshold: 0 });
  observer.observe(hero);
};


// ─── CLICK-SPAWN SPLATS (paint splats on click anywhere) ─────────────
const initClickSplats = () => {
  const colors = ["var(--bubble)", "var(--spring)", "var(--sky)", "var(--yolk)", "var(--grape)", "var(--pumpkin)"];
  document.addEventListener("click", (e) => {
    // don't splat if clicking interactive
    if (e.target.closest("a, button, .gallery-viewport, .arrow-btn, .dot-btn, .lightbox")) return;
    const splat = document.createElement("div");
    splat.className = "click-splat";
    splat.style.setProperty("--x", e.clientX + "px");
    splat.style.setProperty("--y", e.clientY + "px");
    splat.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
    splat.style.setProperty("--r", (Math.random() * 360) + "deg");
    splat.innerHTML = `<svg viewBox="0 0 100 100"><use href="#splat"/></svg>`;
    document.body.appendChild(splat);
    setTimeout(() => splat.remove(), 900);
  });
};


// ─── TILT GALLERIES (3D hover tilt) ──────────────────────────────────
const initTilt = () => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll("[data-tilt]").forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      el.style.setProperty("--rx", (py * -6) + "deg");
      el.style.setProperty("--ry", (px *  8) + "deg");
    });
    el.addEventListener("mouseleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
};


// ─── MAGNETIC BUTTONS ────────────────────────────────────────────────
const initMagnetic = () => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll(".nav-link, .hero-tag, .hero-scroll, .back-link, .tag, .site-name").forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      el.style.setProperty("--mx", (px * 10) + "px");
      el.style.setProperty("--my", (py * 10) + "px");
    });
    el.addEventListener("mouseleave", () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  });
};


// ─── WOBBLE ON SCROLL TITLES ─────────────────────────────────────────
const initScrollWobble = () => {
  const titles = document.querySelectorAll(".work-title, .about-section-title, .work-num");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      titles.forEach(el => {
        const r = el.getBoundingClientRect();
        const v = (r.top / window.innerHeight - 0.5) * 4;
        el.style.setProperty("--scroll-skew", v.toFixed(2) + "deg");
      });
      ticking = false;
    });
  }, { passive: true });
};


// ─── PET THE CREATURES — click a floater, it squishes + hearts
//     SECRET: pet 5× within 4s and the creature runs to the game 🕹️
const initPet = () => {
  let petCount = 0;
  let petTimer = null;
  const resetPetCount = () => { petCount = 0; };
  document.querySelectorAll(".floater").forEach(el => {
    el.style.pointerEvents = "auto";
    el.style.cursor = "none";
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      el.classList.add("pet");
      for (let i = 0; i < 8; i++) {
        const h = document.createElement("span");
        h.className = "pet-heart";
        h.textContent = ["♥","✦","♡","✿","★","✿"][Math.floor(Math.random()*6)];
        h.style.setProperty("--dx", (Math.random() * 240 - 120) + "px");
        h.style.setProperty("--dy", (-80 - Math.random() * 140) + "px");
        h.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
        h.style.setProperty("--d", (Math.random() * 0.3) + "s");
        const r = el.getBoundingClientRect();
        h.style.left = (r.left + r.width / 2) + "px";
        h.style.top  = (r.top  + r.height / 2) + "px";
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 1400);
      }
      setTimeout(() => el.classList.remove("pet"), 600);

      // secret pet-count → game
      petCount++;
      clearTimeout(petTimer);
      petTimer = setTimeout(resetPetCount, 4000);
      if (petCount >= 5) {
        petCount = 0;
        document.body.classList.add("party");
        setTimeout(() => { window.location.href = "game.html"; }, 700);
      }
    });
  });

  // SECRET: type "play" anywhere → game
  const word = "play";
  let wi = 0;
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    if (t && t.matches && t.matches("input, textarea")) return;
    if (e.key && e.key.toLowerCase() === word[wi]) {
      wi++;
      if (wi === word.length) { wi = 0; window.location.href = "game.html"; }
    } else { wi = 0; }
  });
};


// ─── SECRET: triple-click the site name → hop to the game ────────────
const initSiteNameSecret = () => {
  const name = document.querySelector(".site-name");
  if (!name) return;
  let clicks = 0, clickTimer = null;
  name.addEventListener("click", (e) => {
    clicks++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clicks = 0; }, 600);
    if (clicks >= 3) {
      e.preventDefault();
      clicks = 0;
      window.location.href = "game.html";
    }
  });
};


// ─── KONAMI EASTER EGG (trigger confetti party) ──────────────────────
const initKonami = () => {
  const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let i = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === seq[i].toLowerCase()) {
      i++;
      if (i === seq.length) { i = 0; document.body.classList.toggle("party"); }
    } else { i = 0; }
  });
};


// ─── IMAGE EDGE COLOR SAMPLING (seamless image bleed) ────────────────
const initImageColors = () => {
  const canvas = document.createElement("canvas");
  const ctx    = canvas.getContext("2d");
  const sample = (img) => {
    const slide = img.closest(".gallery-slide");
    if (!slide) return;
    try {
      const W = 60, H = 60;
      canvas.width = W; canvas.height = H;
      ctx.drawImage(img, 0, 0, W, H);
      const px = ctx.getImageData(0, 0, W, H).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let x = 0; x < W; x++) {
        let i = x * 4;
        r += px[i]; g += px[i+1]; b += px[i+2]; n++;
        i = ((H-1) * W + x) * 4;
        r += px[i]; g += px[i+1]; b += px[i+2]; n++;
      }
      for (let y = 1; y < H - 1; y++) {
        let i = y * W * 4;
        r += px[i]; g += px[i+1]; b += px[i+2]; n++;
        i = (y * W + W - 1) * 4;
        r += px[i]; g += px[i+1]; b += px[i+2]; n++;
      }
      r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n);
      const lum = 0.299*r + 0.587*g + 0.114*b;
      const blend = lum < 80 ? 0.68 : lum < 160 ? 0.4 : 0.18;
      const mix = (v, bg) => Math.round(v * (1 - blend) + bg * blend);
      const sr = mix(r, 251), sg = mix(g, 244), sb = mix(b, 227);
      slide.style.background = `rgb(${sr},${sg},${sb})`;
    } catch (e) {}
  };
  document.querySelectorAll(".gallery-slide img").forEach(img => {
    if (img.complete && img.naturalWidth > 0) sample(img);
    else img.addEventListener("load", () => sample(img), { once: true });
  });
};


// ─── LIGHTBOX ─────────────────────────────────────────────────────────
const initLightbox = () => {
  const lb = document.createElement("div");
  lb.className = "lightbox"; lb.id = "lightbox";
  lb.innerHTML = `
    <button class="lightbox-close" aria-label="Close">×</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous">←</button>
    <img class="lightbox-img" id="lightboxImg" src="" alt="" />
    <button class="lightbox-nav lightbox-next" aria-label="Next">→</button>
    <span class="lightbox-counter" id="lightboxCounter"></span>`;
  document.body.appendChild(lb);

  const img      = document.getElementById("lightboxImg");
  const counter  = document.getElementById("lightboxCounter");
  const prevBtn  = lb.querySelector(".lightbox-prev");
  const nextBtn  = lb.querySelector(".lightbox-next");
  const closeBtn = lb.querySelector(".lightbox-close");

  let images = [], idx = 0;
  const update = () => {
    img.src = images[idx]; img.alt = `Image ${idx + 1} of ${images.length}`;
    if (images.length > 1) {
      counter.textContent = `${idx + 1} / ${images.length}`;
      prevBtn.style.display = ""; nextBtn.style.display = ""; counter.style.display = "";
    } else {
      prevBtn.style.display = "none"; nextBtn.style.display = "none"; counter.style.display = "none";
    }
  };
  const open = (srcs, startIdx) => {
    images = srcs; idx = startIdx || 0; update();
    lb.classList.add("active"); document.body.style.overflow = "hidden";
  };
  const close = () => { lb.classList.remove("active"); document.body.style.overflow = ""; };
  const goPrev = () => { idx = (idx - 1 + images.length) % images.length; update(); };
  const goNext = () => { idx = (idx + 1) % images.length; update(); };

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); goPrev(); });
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); goNext(); });
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("active")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft")  goPrev();
    if (e.key === "ArrowRight") goNext();
  });

  let tx = 0;
  lb.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) dx < 0 ? goNext() : goPrev();
  }, { passive: true });

  window.openLightbox = open;
};

const initLightboxTriggers = () => {
  document.querySelectorAll(".gallery-viewport").forEach(vp => {
    let sx = 0, sy = 0;
    vp.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
    vp.addEventListener("pointerup", (e) => {
      const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
      if (dx > 8 || dy > 8) return;
      const imgs = vp.querySelectorAll(".gallery-slide img");
      if (!imgs.length) return;
      const sources = Array.from(imgs).map(i => i.src);
      const clickedImg = e.target.closest(".gallery-slide img");
      const cur = clickedImg ? Math.max(0, Array.from(imgs).indexOf(clickedImg)) : 0;
      if (window.openLightbox) window.openLightbox(sources, cur);
    });
  });
};


// ─── MOUNT ──────────────────────────────────────────────────────────
const worksEl = document.getElementById("works");
if (worksEl) {
  let html = ""; let workNum = 0;
  posts.forEach((post, index) => {
    if (post.type !== "idea") workNum++;
    html += renderPost(post, index, workNum);
  });
  worksEl.innerHTML = html;

  // init galleries after mount
  posts.forEach((post, index) => {
    if (post.type === "idea") return;
    const total = (post.images && post.images.length) || 1;
    initGallery(`post-${index}`, total);
  });

  initImageColors();
  initLightboxTriggers();
  initTilt();
}

// GLOBAL
initCursor();
initFloaters();
initReveal();
initNavScroll();
initClickSplats();
initMagnetic();
initScrollWobble();
initPet();
initSiteNameSecret();
initKonami();
initLightbox();
