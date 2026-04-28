/* ═══════════════════════════════════════════════════════════════
   TAKO — CREATURE LAB
   behaviors: cursor-creature, eye-follower, galleries, lightbox,
              click-splats, wobble-on-scroll, pet-the-creature,
              magnetic buttons, scroll-reveal, marquee duplication
   ═══════════════════════════════════════════════════════════════ */

// posts are loaded from /js/posts.js (window.POSTS)
const posts = window.POSTS || [];

// ─── PERFORMANCE: lite mode on mobile / low-power ─────────────
// Disables heavy SVG filters (#fuzz, #watercolor) and mix-blend-mode
// so the GPU isn't composting on every frame. Toggled via html.lite.
const REDUCE_FX = matchMedia("(prefers-reduced-motion: reduce)").matches;

// LITE MODE is now ON BY DEFAULT for every visitor — keeps the site
// snappy on weaker devices without making them work for it. Users on
// powerful hardware can flip it off via the ⚡ toggle (bottom-right);
// preference is remembered in localStorage.
//   - localStorage "xl_lite" === "0"  → user turned lite OFF (full FX)
//   - localStorage "xl_lite" === "1"  → user turned lite ON  (explicit)
//   - localStorage missing             → default ON
//   - prefers-reduced-motion ALWAYS wins (forces lite ON)
//   - URL ?full forces lite OFF for one-off sharing of the rich version
const _userPref   = localStorage.getItem("xl_lite");
const _urlForceFull = /[?&]full\b/.test(location.search);
let LITE_MODE = (_userPref === "0" || _urlForceFull) ? false : true;
if (REDUCE_FX) LITE_MODE = true;
if (LITE_MODE) document.documentElement.classList.add("lite");

// Expose a toggle for the UI button + the console.
// `xl.lite()`           → returns current state
// `xl.lite(true|false)` → sets it, persists
window.xl = window.xl || {};
window.xl.lite = (on) => {
  if (on === undefined) return document.documentElement.classList.contains("lite");
  if (on) {
    localStorage.setItem("xl_lite", "1");
    document.documentElement.classList.add("lite");
  } else {
    localStorage.setItem("xl_lite", "0");
    document.documentElement.classList.remove("lite");
  }
  return on;
};


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
    // SEO-rich alt text: title — medium — by artist (image i)
    return post.images.map((src, i) => {
      const parts = [post.title || "Artwork"];
      if (post.medium) parts.push(post.medium);
      parts.push("by Tamar Chachava");
      if (post.images.length > 1) parts.push(`image ${i + 1} of ${post.images.length}`);
      const alt = parts.join(" — ");
      return `<div class="gallery-slide">
        <img src="${src}" alt="${alt}" loading="lazy" decoding="async" draggable="false"/>
      </div>`;
    }).join("");
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
      ${post.behance ? `<a class="work-behance" href="${post.behance}" target="_blank" rel="noopener">see more on behance ↗</a>` : ""}
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


// ─── CURSOR PERSONALITIES — rotating mood of the cursor creature ────
// The cursor creature shifts mood every 45–90s. Mood flavors its
// thought pools, announce phrase, blink rhythm, and body tint.
const CURSOR_PERSONALITIES = {
  shy:          { announce: "shy..",        says: ["oi", "um", "ჰმმ", "..", "o.o", "hi?"],              painting: ["ოოო..", "so pretty..", "um", "..♥"],                 tint: "#d8b3c9", blinkMs: 3000 },
  sleepy:       { announce: "sleepy..",     says: ["zzz", "mm..", "yawn", "ოო.."],                     painting: ["mm..", "zzz..", "nice.."],                           tint: "#b7c7de", blinkMs: 1200 },
  curious:      { announce: "curious!",     says: ["oh?", "რაო?", "hmm", "?", "what?"],                 painting: ["what's this?", "ოო?", "ohh", "hmm.."],               tint: "#f0c56a", blinkMs: 4200 },
  grumpy:       { announce: "bleh.",        says: ["pff", "-_-", "bleh", "ჰმ"],                        painting: ["pff", "meh", "fine."],                               tint: "#a89278", blinkMs: 3800 },
  happy:        { announce: "feeling good!", says: ["!", "yay", "ჰოი", "~", ":D"],                     painting: ["cute!", "ოო!", "pretty!", "love"],                   tint: "#f5a3b8", blinkMs: 5200 },
  dreamy:       { announce: "daydreaming~", says: ["★", "♥", "~", "◌", "..♪"],                         painting: ["★", "♥", "..♪", "floaty"],                           tint: "#b58bd8", blinkMs: 5800 },
  excited:      { announce: "WOO!",         says: ["!!", "yes!!", "woo", "omg"],                       painting: ["!!!", "ოოო!!", "amazing!", "yes!"],                  tint: "#ff7a2a", blinkMs: 3000 },
  anxious:      { announce: "o-oh..",       says: ["ai..", "um um", "ოი..", "o-oh"],                   painting: ["ai..", "um.. nice?", "ოი.."],                        tint: "#c9d0a8", blinkMs: 900 },
  proud:        { announce: "ahem.",        says: ["hmph", "indeed", "ჰო..", "naturally"],             painting: ["mm, fine work", "indeed", "quite good"],             tint: "#e4b84a", blinkMs: 6500 },
  mischievous:  { announce: "hehe..",       says: ["heh", "hehe", ">:)", "shh", "ოჰო"],                painting: ["hehe..", "ooh", "mine?", "shh.."],                   tint: "#b06fd8", blinkMs: 2600 },
  philosopher:  { announce: "hmm..",        says: ["hmm..", "...", "true", "so it is"],                 painting: ["so it is..", "the colors..", "hmm..", "ahh."],       tint: "#8aa1b8", blinkMs: 6800 },
  cozy:         { announce: "warm~",        says: ["mm~", "warm", "soft", "nice."],                    painting: ["soft..", "cozy", "warm~", "mm~"],                    tint: "#e8a06c", blinkMs: 4800 },
  melodramatic: { announce: "alas!",        says: ["alas!", "oh no!", "ჩემიკაი!", "*gasp*"],             painting: ["ვაიმე!", "the beauty!", "*gasp*", "alas.."],         tint: "#e4483b", blinkMs: 3200 },
};
const CURSOR_MOODS = Object.keys(CURSOR_PERSONALITIES);


// ─── CREATURE CURSOR with EMOTIONS ──────────────────────────────────
// States: is-curious · is-dizzy · is-reading · is-absorbing
//         is-excited · is-loving · is-bored · is-squish-up / is-squish-down
// Rotating base mood: cc-mood-<name> — see CURSOR_PERSONALITIES above.
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
  let lastMoveAt = performance.now();
  const trailPts = [];

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    // PERF: use transform translate instead of left/top (compositor-only)
    creature.style.setProperty("--cc-x", mx + "px");
    creature.style.setProperty("--cc-y", my + "px");
    lastMoveAt = performance.now();
    trailPts.push({ x: mx, y: my, t: lastMoveAt });
    while (trailPts.length && lastMoveAt - trailPts[0].t > 800) trailPts.shift();
    if (isBored) { isBored = false; setState("is-bored", false); }
  });

  const follow = () => {
    const ntx = tx + (mx - tx) * 0.22;
    const nty = ty + (my - ty) * 0.22;
    // skip paint invalidation if movement is sub-pixel
    if (Math.abs(ntx - tx) > 0.3 || Math.abs(nty - ty) > 0.3) {
      tx = ntx; ty = nty;
      // transform (compositor-only) instead of left/top (forces layout)
      trail.style.setProperty("--tr-x", tx + "px");
      trail.style.setProperty("--tr-y", ty + "px");
    }
    requestAnimationFrame(follow);
  };
  follow();

  // ── emote bubble ────────────────────────────────────────
  // QUIET MODE: throttle automatic emotes heavily so the cursor isn't
  // constantly popping ♥ / ! / ? / ✦. Special moments (absorb, party,
  // freak, mood-rotation) opt in via force=true.
  let emoteHideTimer = null;
  let lastEmoteAt = 0;
  const EMOTE_GAP_MS = 9000;
  const showEmote = (text, variant = "", ms = 1200, force = false) => {
    if (!emote) return;
    const now = performance.now();
    if (!force && now - lastEmoteAt < EMOTE_GAP_MS) return;
    lastEmoteAt = now;
    clearTimeout(emoteHideTimer);
    emote.textContent = text;
    emote.className = "cc-emote is-show " + variant;
    emoteHideTimer = setTimeout(() => emote.classList.remove("is-show"), ms);
  };

  // ── state flags ─────────────────────────────────────────
  let isDizzy = false, isReading = false, isAbsorbing = false;
  let isExcited = false, isLoving = false, isBored = false;
  const setState = (name, on) => creature.classList.toggle(name, on);
  const anyBig = () => isDizzy || isReading || isAbsorbing;

  // ── ROTATING PERSONALITY: cursor creature has a mood that shifts ──
  let currentMood = CURSOR_MOODS[Math.floor(Math.random() * CURSOR_MOODS.length)];
  const applyMood = (next, { announce = true } = {}) => {
    CURSOR_MOODS.forEach(m => creature.classList.remove("cc-mood-" + m));
    currentMood = next;
    creature.classList.add("cc-mood-" + next);
    const p = CURSOR_PERSONALITIES[next];
    if (p?.tint) creature.style.setProperty("--cc-mood-tint", p.tint);
    if (announce && p?.announce) {
      // tiny delay so announce isn't stepping on other bubbles
      setTimeout(() => { if (!anyBig()) showSay(p.announce, 1500); }, 120);
    }
  };
  applyMood(currentMood, { announce: false });
  // schedule the next mood shift 45–90s out; skips while the user is
  // mid-interaction (big-state) — retries in 6s.
  const scheduleMoodShift = () => {
    const wait = 45000 + Math.random() * 45000;
    setTimeout(() => {
      if (anyBig() || isLoving) { setTimeout(scheduleMoodShift, 6000); return; }
      let next = currentMood;
      while (next === currentMood) next = CURSOR_MOODS[Math.floor(Math.random() * CURSOR_MOODS.length)];
      applyMood(next);
      scheduleMoodShift();
    }, wait);
  };
  scheduleMoodShift();

  // ── PUPILS look toward mouse direction ──────────────────
  // PERF: skip style writes when pupil values stabilize (no movement).
  let lastMx = mx, lastMy = my, lastPx = 0, lastPy = 0;
  const lookTick = () => {
    if (!isDizzy && !isReading && pupilL && pupilR) {
      const dx = mx - lastMx;
      const dy = my - lastMy;
      const mag = Math.min(Math.hypot(dx, dy) / 30, 1);
      const ang = Math.atan2(dy, dx);
      const lx = Math.cos(ang) * 2.5 * mag;
      const ly = Math.sin(ang) * 2.5 * mag;
      // only write if meaningfully different (avoids paint invalidation)
      if (Math.abs(lx - lastPx) > 0.05 || Math.abs(ly - lastPy) > 0.05) {
        creature.style.setProperty("--plx", lx.toFixed(2) + "px");
        creature.style.setProperty("--ply", ly.toFixed(2) + "px");
        creature.style.setProperty("--prx", lx.toFixed(2) + "px");
        creature.style.setProperty("--pry", ly.toFixed(2) + "px");
        lastPx = lx; lastPy = ly;
      }
    }
    lastMx += (mx - lastMx) * 0.15;
    lastMy += (my - lastMy) * 0.15;
    // throttle to ~30fps — pupils don't need 60
    requestAnimationFrame(() => requestAnimationFrame(lookTick));
  };
  requestAnimationFrame(lookTick);

  // ── HOVER: grow on interactive targets, context emotes ──
  const hoverTargets = "a, button, .gallery-viewport, .work-gallery, .portrait-frame, .lightbox-close, .lightbox-nav, .tag, .click-zone, .match-card, .game-btn";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.add("cursor-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove("cursor-hover");
  });

  // ── CURIOUS: hovering over a painting image ────────────
  const imgSelector = ".gallery-slide img, .portrait-frame img, .match-card img";
  let curiousFor = null;
  document.addEventListener("mouseover", (e) => {
    const img = e.target.closest(imgSelector);
    if (img && !anyBig()) {
      curiousFor = img;
      setState("is-curious", true);
      showEmote("?", "pop-curious", 900);
    }
  });
  document.addEventListener("mouseout", (e) => {
    const img = e.target.closest(imgSelector);
    if (img && curiousFor === img) {
      curiousFor = null;
      setState("is-curious", false);
    }
  });

  // ── ABSORB: LONG-PRESS on a PALETTE CHIP or FUZZY CREATURE ──
  // (no longer absorbs from paintings — only palette swatches &
  // other floaters, which get briefly "drained" of their color.)
  const absorbSelector = ".palette-chip, .floater, .crew-creature";
  document.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    const target = e.target.closest(absorbSelector);
    if (!target) return;
    // allow chaining: if user is mid-celebration of a previous absorb,
    // end it early and start a new one on the new target.
    if (isAbsorbing) {
      isAbsorbing = false;
      setState("is-absorbing", false);
      creature.style.setProperty("--chg", "0");
    }
    if (anyBig()) return; // still blocked by reading/dizzy
    scheduleAbsorb(target);
  });
  const stopPress = () => { if (!isAbsorbing) cancelAbsorb(); };
  document.addEventListener("mouseup", stopPress);
  document.addEventListener("mouseleave", stopPress);

  // ── LOVING: over a floater creature ────────────────────
  document.addEventListener("mouseover", (e) => {
    const f = e.target.closest(".floater");
    if (f && !anyBig()) {
      isLoving = true;
      setState("is-loving", true);
      showEmote("♥", "pop-love", 1200);
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(".floater") && isLoving) {
      isLoving = false;
      setState("is-loving", false);
    }
  });

  // ── HOVERING tags/buttons: flashy short emotes ─────────
  let lastContextEmoteAt = 0;
  document.addEventListener("mouseover", (e) => {
    const now = performance.now();
    if (now - lastContextEmoteAt < 700) return;
    if (anyBig()) return;
    const tag = e.target.closest(".tag");
    const btn = e.target.closest("button, .nav-link, .game-btn");
    if (tag) { showEmote("~", "pop-tag", 700); lastContextEmoteAt = now; }
    else if (btn) { showEmote("✦", "pop-excited", 700); lastContextEmoteAt = now; }
  });

  // ── DIZZY: detect circular motion ───────────────────────
  let dizzyEndAt = 0;
  const checkCircular = () => {
    if (isReading || isAbsorbing) return;
    if (trailPts.length < 12) return;
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
  setInterval(checkCircular, 220);

  // ── READING: click on a textual element ────────────────
  const readableSel = "p, h1, h2, h3, h4, h5, h6, blockquote, li, .work-desc, .idea-text, .hero-tag, .work-title, .site-name";
  document.addEventListener("click", (e) => {
    const t = e.target.closest(readableSel);
    if (t) {
      const text = (t.textContent || "").trim();
      if (text.length >= 4 && !anyBig()) {
        isReading = true;
        setState("is-reading", true);
        showEmote("!", "pop-read", 1400);
        setTimeout(() => { isReading = false; setState("is-reading", false); }, 1400);
        return;
      }
    }
    // otherwise → excited bounce
    if (anyBig()) return;
    isExcited = true;
    setState("is-excited", true);
    showEmote("✦", "pop-excited", 600);
    setTimeout(() => { isExcited = false; setState("is-excited", false); }, 360);
  });

  // ── SCROLL: squish direction ───────────────────────────
  let lastScroll = window.scrollY, scrollTimer = null;
  window.addEventListener("scroll", () => {
    if (anyBig()) return;
    const sy = window.scrollY;
    const d = sy - lastScroll;
    lastScroll = sy;
    if (Math.abs(d) < 3) return;
    setState("is-squish-up", d < 0);
    setState("is-squish-down", d > 0);
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      setState("is-squish-up", false);
      setState("is-squish-down", false);
    }, 180);
  }, { passive: true });

  // ── BORED: mouse idle > 6s ─────────────────────────────
  setInterval(() => {
    if (anyBig() || isLoving || isExcited) return;
    const idleMs = performance.now() - lastMoveAt;
    if (idleMs > 6000 && !isBored) {
      isBored = true;
      setState("is-bored", true);
      showEmote("z", "pop-bored", 1600);
    }
  }, 1000);

  // ── ABSORB: press & hold on a palette chip or floater → steal ──
  // Shorter hold (1.6s), crisper animation: target gets "drained"
  // (desaturates + inner shimmer), cursor gulps the color with a
  // quick scale-pop and sparkle burst.
  const ABSORB_MS = 1600;
  let absorbTimer = null, absorbStart = 0, absorbRaf = 0, absorbTarget = null;
  const scheduleAbsorb = (target) => {
    cancelAbsorb();
    absorbTarget = target;
    target.classList.add("being-absorbed");
    const baselineMx = mx, baselineMy = my;
    absorbStart = performance.now();
    setState("is-charging", true);
    showSay(target.classList.contains("palette-chip") ? "mmm.." : "hehe..", 1400, true);
    const progress = () => {
      const t = performance.now() - absorbStart;
      const pct = Math.min(100, (t / ABSORB_MS) * 100);
      creature.style.setProperty("--chg", pct.toFixed(1));
      // scale the drain visually on the target
      target.style.setProperty("--drain", (pct / 100).toFixed(3));
      if (pct < 100) absorbRaf = requestAnimationFrame(progress);
    };
    absorbRaf = requestAnimationFrame(progress);
    absorbTimer = setTimeout(() => {
      if (absorbTarget !== target) { cancelAbsorb(); return; }
      if (Math.hypot(mx - baselineMx, my - baselineMy) > 120) { cancelAbsorb(); return; }
      absorbColorFrom(target);
    }, ABSORB_MS);
  };
  const cancelAbsorb = () => {
    if (absorbTimer) { clearTimeout(absorbTimer); absorbTimer = null; }
    if (absorbRaf) { cancelAnimationFrame(absorbRaf); absorbRaf = 0; }
    if (absorbTarget) {
      absorbTarget.classList.remove("being-absorbed");
      absorbTarget.style.removeProperty("--drain");
      absorbTarget = null;
    }
    setState("is-charging", false);
    creature.style.setProperty("--chg", "0");
  };

  // read color straight from the target element (palette chip bg
  // or floater creature body) — no canvas sampling needed.
  const readTargetColor = (el) => {
    // floater + crew creatures: SVG uses currentColor, check computed color on the shape
    if (el.classList.contains("floater") || el.classList.contains("crew-creature")) {
      const shape = el.querySelector(".fl-shape, svg");
      if (shape) {
        const cs = getComputedStyle(shape);
        if (cs.color && cs.color !== "rgba(0, 0, 0, 0)") return cs.color;
      }
    }
    // palette chip: background-color is the color
    const cs = getComputedStyle(el);
    if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") return cs.backgroundColor;
    // fallback to text color
    return cs.color || "rgb(181, 139, 216)";
  };

  const absorbColorFrom = (target) => {
    const color = readTargetColor(target);
    isAbsorbing = true;
    setState("is-charging", false);
    setState("is-absorbing", true);
    showEmote("✦", "pop-absorb", 1100, true);
    const isCreature = target.classList.contains("floater") || target.classList.contains("crew-creature");
    showSay(isCreature ? "stole it!" : "mine now!", 1200, true);
    // burst sparkles in the target's color
    try {
      const rx = (target.getBoundingClientRect().left + target.offsetWidth / 2);
      const ry = (target.getBoundingClientRect().top  + target.offsetHeight / 2);
      for (let i = 0; i < 8; i++) {
        setTimeout(() => emitSparklesAt(rx, ry, 2, color), i * 40);
      }
    } catch (e) {}
    // floaters + crew creatures: mark as drained, revert after 2.2s
    if (target.classList.contains("floater") || target.classList.contains("crew-creature")) {
      target.classList.add("is-drained");
      setTimeout(() => target.classList.remove("is-drained"), 2200);
    }
    // cursor gulps color at 180ms (mid-animation)
    setTimeout(() => creature.style.setProperty("--cc-color", color), 180);
    // Short lockout (500ms) so user can chain-steal from another target.
    setTimeout(() => {
      isAbsorbing = false;
      setState("is-absorbing", false);
      creature.style.setProperty("--chg", "0");
      if (absorbTarget) {
        absorbTarget.classList.remove("being-absorbed");
        absorbTarget.style.removeProperty("--drain");
        absorbTarget = null;
      }
    }, 500);
  };

  // ── passive idle blinks ────────────────────────────────
  setInterval(() => {
    if (anyBig()) return;
    const eyes = creature.querySelectorAll(".cc-eye");
    eyes.forEach(e => e.setAttribute("ry", "1"));
    setTimeout(() => eyes.forEach(e => e.setAttribute("ry", "8")), 120);
  }, 4200);

  // ── SAY bubble: random thought words ───────────────────
  const say = document.getElementById("ccSay");
  let sayHideTimer = null;
  // QUIET MODE: speech bubbles are silent by default — only special
  // moments (absorb, party, mood-announce) pass through.
  let lastSayAt = 0;
  const SAY_GAP_MS = 25000;
  const showSay = (text, ms = 1400, force = false) => {
    if (!say) return;
    const now = performance.now();
    if (!force && now - lastSayAt < SAY_GAP_MS) return;
    lastSayAt = now;
    clearTimeout(sayHideTimer);
    say.textContent = text;
    say.classList.add("is-show");
    sayHideTimer = setTimeout(() => say.classList.remove("is-show"), ms);
  };
  const thoughtsPaintingBase = ["ოოო", "ვაიმე", "მშვენიერია", "hmm", "cute", "pretty", "fuzz!", "colors~", "nice", "ძალიან მაგარია"];
  const thoughtsIdleBase     = ["mm", "...", "hi?", "oi", "ქ?", "zz"];
  const thoughtsClick        = ["!", "ok!", "ჰო", "yay", "✦"];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  // mood-flavored pools (rotates when personality shifts)
  const moodPools = () => {
    const p = CURSOR_PERSONALITIES[currentMood] || CURSOR_PERSONALITIES.curious;
    return {
      painting: thoughtsPaintingBase.concat(p.painting),
      idle:     thoughtsIdleBase.concat(p.says),
    };
  };
  const thoughtsPainting = () => moodPools().painting;
  const thoughtsIdle     = () => moodPools().idle;

  // When lingering on a painting 2s, drop a random thought
  let thoughtTimer = null;
  const onImgEnterThought = () => {
    clearTimeout(thoughtTimer);
    thoughtTimer = setTimeout(() => {
      if (curiousFor) showSay(pick(thoughtsPainting()), 1800);
    }, 1800);
  };
  const cancelThought = () => { if (thoughtTimer) { clearTimeout(thoughtTimer); thoughtTimer = null; } };
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(imgSelector)) onImgEnterThought();
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(imgSelector)) cancelThought();
  });

  // ── IDLE micro-behaviors: random cute twitches ─────────
  // plays yawn/shiver/sneeze/look-around during quiet moments
  const microPool = ["yawn", "shiver", "sneeze", "look", "look"];
  let microTimer = null;
  const playMicro = () => {
    if (anyBig() || isExcited || isLoving) return;
    const kind = pick(microPool);
    if (kind === "yawn") {
      setState("is-yawn", true);
      showSay(pick(thoughtsIdle()), 900);
      setTimeout(() => setState("is-yawn", false), 900);
    } else if (kind === "shiver") {
      setState("is-shiver", true);
      setTimeout(() => setState("is-shiver", false), 520);
    } else if (kind === "sneeze") {
      setState("is-sneeze", true);
      showEmote("!", "pop-sneeze", 600);
      // puff of sparkles
      emitSparkles(8, "#ffcc3f");
      setTimeout(() => setState("is-sneeze", false), 520);
    } else {
      setState("is-looking", true);
      setTimeout(() => setState("is-looking", false), 900);
    }
  };
  const scheduleMicro = () => {
    clearTimeout(microTimer);
    microTimer = setTimeout(() => {
      playMicro();
      scheduleMicro();
    }, 5000 + Math.random() * 6000);
  };
  scheduleMicro();

  // ── SPARKLE emission ───────────────────────────────────
  const sparkleLayer = document.getElementById("ccSparkles");
  const sparkleColors = ["#ff6fa8", "#ffcc3f", "#8fd47c", "#7cc0ed", "#b58bd8", "#ff7a2a"];
  const emitSparklesAt = (x, y, n = 5, colorOverride = null) => {
    if (!sparkleLayer) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("div");
      s.className = "cc-sparkle";
      s.style.left = (x + (Math.random() - .5) * 20) + "px";
      s.style.top  = (y + (Math.random() - .5) * 20) + "px";
      s.style.color = colorOverride || pick(sparkleColors);
      s.style.setProperty("--sz", (6 + Math.random() * 8) + "px");
      s.style.width = s.style.height = (6 + Math.random() * 8) + "px";
      sparkleLayer.appendChild(s);
      setTimeout(() => s.remove(), 720);
    }
  };
  const emitSparkles = (n = 5, colorOverride = null) => emitSparklesAt(mx, my, n, colorOverride);

  // emit sparkles on fast movement (throttled)
  let lastSparkAt = 0, lastFastMx = mx, lastFastMy = my;
  setInterval(() => {
    if (anyBig()) return;
    const dx = mx - lastFastMx;
    const dy = my - lastFastMy;
    const v = Math.hypot(dx, dy);
    lastFastMx = mx; lastFastMy = my;
    if (v > 55 && performance.now() - lastSparkAt > 160) {
      emitSparkles(1);
      lastSparkAt = performance.now();
    }
  }, 120);

  // sparkles on excited click
  document.addEventListener("click", () => { if (!anyBig()) emitSparkles(6); });

  // ── EDGE-NERVOUS: cursor near viewport edge ────────────
  setInterval(() => {
    if (anyBig()) return;
    const margin = 28;
    const near = mx < margin || my < margin ||
                 mx > window.innerWidth - margin || my > window.innerHeight - margin;
    if (near && !creature.classList.contains("is-nervous")) {
      setState("is-nervous", true);
      showEmote("!!", "pop-nervous", 800);
    } else if (!near && creature.classList.contains("is-nervous")) {
      setState("is-nervous", false);
    }
  }, 150);

  // ── DOUBLE-CLICK PARTY ─────────────────────────────────
  document.addEventListener("dblclick", () => {
    if (anyBig()) return;
    setState("is-party", true);
    showSay(pick(["★☆★", "woo!", "yay!", "წვეულება!"]), 1400, true);
    // confetti burst
    for (let i = 0; i < 4; i++) setTimeout(() => emitSparkles(5), i * 120);
    setTimeout(() => setState("is-party", false), 1400);
  });

  // say something on click (not reading)
  document.addEventListener("click", (e) => {
    if (anyBig()) return;
    if (e.target.closest(readableSel)) return; // reading handles its own
    if (Math.random() < 0.4) showSay(pick(thoughtsClick), 900);
  });
};


// ─── FLOATER CREATURES — each one has personality ────────────────────
// pupils track cursor · creatures blink, wink, yawn, sleep, peek,
// get surprised when you approach, say tiny things, get shy, etc.
const FLOATER_SVG = `
  <svg viewBox="-4 -4 108 108" class="fl-svg">
    <g class="fl-body">
      <path class="fl-shape" d="M20 62 Q10 38 28 24 Q50 8 72 24 Q90 38 80 62 Q78 84 50 86 Q22 84 20 62 Z" fill="currentColor"/>
      <path class="fl-spikes" d="M28 20 L24 10 L32 18 M40 14 L40 4 L44 14 M60 14 L60 4 L56 14 M72 20 L76 10 L68 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    </g>
    <g class="fl-face">
      <g class="fl-eye fl-eye-l">
        <ellipse class="fl-eye-white" cx="38" cy="50" rx="7" ry="8" fill="#fffaed"/>
        <circle class="fl-pupil fl-pupil-l" cx="38" cy="51" r="3" fill="#1a1410"/>
        <circle class="fl-gleam fl-gleam-l" cx="39" cy="49" r="1.1" fill="#fffaed"/>
      </g>
      <g class="fl-eye fl-eye-r">
        <ellipse class="fl-eye-white" cx="62" cy="50" rx="7" ry="8" fill="#fffaed"/>
        <circle class="fl-pupil fl-pupil-r" cx="62" cy="51" r="3" fill="#1a1410"/>
        <circle class="fl-gleam fl-gleam-r" cx="63" cy="49" r="1.1" fill="#fffaed"/>
      </g>
      <ellipse class="fl-blush fl-blush-l" cx="28" cy="62" rx="4" ry="2" fill="#ff9bb0" opacity="0"/>
      <ellipse class="fl-blush fl-blush-r" cx="72" cy="62" rx="4" ry="2" fill="#ff9bb0" opacity="0"/>
      <ellipse class="fl-mouth" cx="50" cy="66" rx="4" ry="2.5" fill="#e4483b"/>
      <!-- PUK: amazed eyebrow arches + small cute smile (hidden by default) -->
      <g class="fl-brows">
        <path d="M30 38 Q 36 32 42 38" stroke="#1a1410" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M58 38 Q 64 32 70 38" stroke="#1a1410" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
      <g class="fl-smile">
        <path d="M44 64 Q 50 68 56 64" stroke="#1a1410" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </g>
      <!-- CRAZY: tongue (hidden by default; shown when data-mood="crazy") -->
      <ellipse class="fl-tongue" cx="55" cy="74" rx="2.4" ry="3.2" fill="#ff6fa8" opacity="0"/>
      <text class="fl-zzz" x="72" y="22" font-size="14" fill="#1a1410" opacity="0" font-family="DM Mono, monospace">z</text>
      <!-- COOL: sunglasses overlay (hidden by default; shown when data-mood="cool") -->
      <g class="fl-shades">
        <rect x="28" y="44" width="20" height="12" rx="3" fill="#1a1410"/>
        <rect x="52" y="44" width="20" height="12" rx="3" fill="#1a1410"/>
        <rect x="46" y="48" width="8"  height="2" fill="#1a1410"/>
        <rect x="22" y="48" width="6"  height="2" fill="#1a1410"/>
        <rect x="72" y="48" width="6"  height="2" fill="#1a1410"/>
        <line x1="32" y1="46" x2="36" y2="51" stroke="#fffaed" stroke-width="1.4" stroke-linecap="round"/>
        <line x1="56" y1="46" x2="60" y2="51" stroke="#fffaed" stroke-width="1.4" stroke-linecap="round"/>
      </g>
      <!-- GIRLISH: pink bow on side of head (hidden by default) -->
      <g class="fl-bow">
        <ellipse cx="86" cy="22" rx="5" ry="3" fill="#ff6fa8" stroke="#1a1410" stroke-width="1.3" transform="rotate(-25 86 22)"/>
        <ellipse cx="86" cy="32" rx="5" ry="3" fill="#ff6fa8" stroke="#1a1410" stroke-width="1.3" transform="rotate(25 86 32)"/>
        <circle  cx="86" cy="27" r="2.2" fill="#ff6fa8" stroke="#1a1410" stroke-width="1.3"/>
      </g>
    </g>
  </svg>
`;

const FL_PERSONALITIES = {
  shy:          { says: ["მაცა..", "um", "hi?", "ჰმ", "..", "o.o"],        blinkMs: [1800, 4200], mood: "shy" },
  sleepy:       { says: ["zzz", "mm..", "yawn", "sleep?", "ოო"],          blinkMs: [700, 1700],  mood: "sleepy" },
  curious:      { says: ["oh?", "რაიო?", "hmm", "what?", "?"],               blinkMs: [3000, 5500], mood: "curious" },
  grumpy:       { says: ["ჰმ", "pff", "no", "-_-", "bleh"],                 blinkMs: [2500, 5000], mood: "grumpy" },
  happy:        { says: ["!", "yay", "ჰოი", "~", ":D", "ოო!"],              blinkMs: [3500, 6500], mood: "happy" },
  dreamy:       { says: ["★", "♥", "~", "◌", "..♪"],                         blinkMs: [3000, 6000], mood: "dreamy" },
  // NEW 7
  excited:      { says: ["!!", "ოოო!!", "yes!!", "woo", "omg"],             blinkMs: [2000, 3500], mood: "excited" },
  anxious:      { says: ["ai..", "ai!", "um um", "ოი..", "o-oh"],          blinkMs: [500, 1400],  mood: "anxious" },
  proud:        { says: ["hmph", "mm.", "indeed", "ჰო..", "naturally"],    blinkMs: [4500, 7000], mood: "proud" },
  mischievous:  { says: ["heh", "hehe", ">:)", "shh", "ოჰო"],               blinkMs: [1600, 3400], mood: "mischievous" },
  philosopher:  { says: ["hmm..", "...", "true", "so it is", "რაც არის"], blinkMs: [4000, 7500], mood: "philosopher" },
  cozy:         { says: ["mm~", "warm", "soft", "nice.", "♨"],              blinkMs: [3200, 5800], mood: "cozy" },
  melodramatic: { says: ["alas!", "oh no!", "ვაიმე!", "the pain", "*gasp*"], blinkMs: [2000, 4500], mood: "melodramatic" },
  // CUSTOM CREW MOODS
  truk:         { says: ["hi!", "oh boy", "neat", "haha", "hi friend", "shucks"],   blinkMs: [3200, 6000], mood: "truk" },
  cool:         { says: ["yeah", "mhm", "obviously", "sure", "♪", "..yep"],          blinkMs: [4500, 8000], mood: "cool" },
  crazy:        { says: ["YESSSS", "i love this!!", "OH MY GOD", "wee wee!", "oof!", "i'm SO good"], blinkMs: [600, 1400], mood: "crazy" },
  girlish:      { says: ["adam driver..", "ugh", "i'm a writer", "i could write that", "is it me?", "♥"], blinkMs: [3000, 5500], mood: "girlish" },
  oversleep:    { says: ["zzzzz", "five more", "..nh", "(asleep)", "Z", "mmm"],     blinkMs: [400, 1100],  mood: "oversleep" },
};
const FL_POOL = Object.keys(FL_PERSONALITIES);

const initFloaters = () => {
  const floaters = Array.from(document.querySelectorAll(".floater, .crew-creature"));
  if (!floaters.length) return;
  const hoverable = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // build inline SVG for each floater (preserve existing color style)
  floaters.forEach((f, i) => {
    const existing = f.querySelector("svg");
    const color = existing ? existing.getAttribute("style") : (f.getAttribute("data-color") || "");
    // bubble for everyone — crew creatures need it too so they can announce names on hover
    f.innerHTML = FLOATER_SVG + `<div class="fl-bubble"></div>`;
    const svg = f.querySelector(".fl-svg");
    if (color) svg.setAttribute("style", color);
    // personality: use data-mood or pick random
    const mood = f.getAttribute("data-mood") || FL_POOL[Math.floor(Math.random() * FL_POOL.length)];
    f.dataset.mood = mood;
    f._personality = FL_PERSONALITIES[mood] || FL_PERSONALITIES.curious;

    // NAME ANNOUNCE — when hovered, named creatures say their own name
    const name = f.getAttribute("data-name");
    if (name) {
      f.addEventListener("pointerenter", () => {
        const b = f.querySelector(".fl-bubble");
        if (!b) return;
        b.textContent = name;
        b.classList.add("on");
        clearTimeout(b._nameT);
        b._nameT = setTimeout(() => b.classList.remove("on"), 1600);
      });
    }
  });

  if (!hoverable) return; // on touch devices keep them still

  // cursor tracking (normalized -0.5..0.5)
  let mx = 0.5, my = 0.5, pageX = 0, pageY = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
    pageX = e.clientX; pageY = e.clientY;
  });

  const state = floaters.map(() => ({ x: 0, y: 0, px: 0, py: 0, near: false, busy: false, lastBlink: 0, nextBehavior: 0, cx: 0, cy: 0, visible: true }));

  // PERF: cache each floater's center position — getBoundingClientRect
  // inside the tick loop was forcing 21 layout reflows every frame.
  // Recompute only on scroll/resize. Small bob error is invisible.
  const updateRects = () => {
    floaters.forEach((f, i) => {
      const r = f.getBoundingClientRect();
      state[i].cx = r.left + r.width / 2;
      state[i].cy = r.top  + r.height / 2;
    });
  };
  updateRects();
  window.addEventListener("scroll", updateRects, { passive: true });
  window.addEventListener("resize", updateRects);

  // PERF: skip tick work for offscreen floaters
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const i = floaters.indexOf(e.target);
      if (i >= 0) state[i].visible = e.isIntersecting;
    });
  }, { rootMargin: "100px" });
  floaters.forEach(f => io.observe(f));

  const setTempState = (el, cls, ms) => {
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  };

  const showBubble = (el, text, ms = 1200) => {
    const b = el.querySelector(".fl-bubble");
    if (!b) return;
    b.textContent = text;
    b.classList.add("on");
    clearTimeout(b._t);
    b._t = setTimeout(() => b.classList.remove("on"), ms);
  };

  const blink = (el) => setTempState(el, "fl-blink", 130);
  const wink  = (el) => setTempState(el, Math.random() < 0.5 ? "fl-wink-l" : "fl-wink-r", 320);
  const giggle = (el) => setTempState(el, "fl-giggle", 440);
  const sniff = (el) => setTempState(el, "fl-sniff", 900);
  const peek  = (el) => {
    const dirs = ["fl-peek-l", "fl-peek-r", "fl-peek-u", "fl-peek-d"];
    setTempState(el, dirs[Math.floor(Math.random() * dirs.length)], 700);
  };

  // random behavior scheduler per creature
  const scheduleBehavior = (el, s, p) => {
    const [lo, hi] = p.blinkMs;
    s.nextBehavior = performance.now() + lo + Math.random() * (hi - lo);
  };

  const holdState = (el, cls, ms) => {
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  };

  const pickBehavior = (el, p) => {
    if (el.classList.contains("fl-surprised") || el.classList.contains("fl-happy")) {
      blink(el); return;
    }
    const r = Math.random();
    switch (p.mood) {
      case "sleepy":
        if (r < 0.3)  { holdState(el, "fl-sleep", 2400 + Math.random() * 2200); return; }
        if (r < 0.55) { holdState(el, "fl-sleepy", 1600); return; }
        break;
      case "shy":
        if (r < 0.35) { holdState(el, "fl-shy", 1600); return; }
        break;
      case "grumpy":
        if (r < 0.3)  { holdState(el, "fl-grumpy", 1800); return; }
        break;
      case "happy":
        if (r < 0.25) { giggle(el); return; }
        break;
      case "dreamy":
        if (r < 0.4)  { peek(el); return; }
        break;
      case "excited":
        if (r < 0.35) { holdState(el, "fl-excited", 700); return; }
        if (r < 0.55) { giggle(el); return; }
        if (r < 0.75) { showBubble(el, p.says[Math.floor(Math.random() * p.says.length)], 900); return; }
        break;
      case "anxious":
        if (r < 0.35) { holdState(el, "fl-anxious", 900); return; }
        if (r < 0.55) { blink(el); blink(el); return; } // double-blink
        if (r < 0.75) { peek(el); return; }
        break;
      case "proud":
        if (r < 0.3)  { holdState(el, "fl-proud", 1800); return; }
        if (r < 0.45) { holdState(el, "fl-blink", 260); return; } // slow blink
        break;
      case "mischievous":
        if (r < 0.45) { wink(el); return; }
        if (r < 0.6)  { giggle(el); return; }
        if (r < 0.8)  { showBubble(el, p.says[Math.floor(Math.random() * p.says.length)], 800); return; }
        break;
      case "philosopher":
        if (r < 0.4)  { holdState(el, "fl-philosopher", 1600); return; }
        if (r < 0.6)  { peek(el); return; }
        break;
      case "cozy":
        if (r < 0.5)  { holdState(el, "fl-cozy", 2200); return; }
        if (r < 0.7)  { holdState(el, "fl-sleepy", 1400); return; }
        break;
      case "melodramatic":
        if (r < 0.35) { holdState(el, "fl-melodrama", 1400); return; }
        if (r < 0.55) { holdState(el, "fl-shy", 900); return; } // faints
        if (r < 0.75) { showBubble(el, p.says[Math.floor(Math.random() * p.says.length)], 1200); return; }
        break;
    }
    // default menu
    if (r < 0.5) blink(el);
    else if (r < 0.7) wink(el);
    else if (r < 0.85) peek(el);
    else sniff(el);
    if (Math.random() < 0.22) {
      showBubble(el, p.says[Math.floor(Math.random() * p.says.length)], 1100);
    }
  };

  floaters.forEach((el, i) => scheduleBehavior(el, state[i], el._personality));

  const tick = () => {
    const now = performance.now();
    floaters.forEach((f, i) => {
      const s = state[i];
      // skip entirely for offscreen floaters — saves paint + layout
      if (!s.visible) return;
      const isFloater = f.classList.contains("floater");

      // cursor-pull offset for body (only floaters, not crew creatures which bob in place)
      if (isFloater) {
        const pull = 4;
        const tx = (mx - 0.5) * pull;
        const ty = (my - 0.5) * pull;
        s.x += (tx - s.x) * 0.08;
        s.y += (ty - s.y) * 0.08;
        f.style.setProperty("--ox", s.x.toFixed(2) + "px");
        f.style.setProperty("--oy", s.y.toFixed(2) + "px");
      }

      // pupil tracking toward cursor using cached center (no layout reflow)
      const cx = s.cx, cy = s.cy;
      const dx = pageX - cx, dy = pageY - cy;
      const dist = Math.hypot(dx, dy);
      // normalize → small eye offset
      const maxOff = 3.2;
      const ang = Math.atan2(dy, dx);
      const mag = Math.min(1, dist / 320);
      const pxTarget = Math.cos(ang) * maxOff * mag;
      const pyTarget = Math.sin(ang) * maxOff * mag;
      s.px += (pxTarget - s.px) * 0.12;
      s.py += (pyTarget - s.py) * 0.12;
      if (!f.classList.contains("fl-peek-l") &&
          !f.classList.contains("fl-peek-r") &&
          !f.classList.contains("fl-peek-u") &&
          !f.classList.contains("fl-peek-d") &&
          !f.classList.contains("fl-sleep") &&
          !f.classList.contains("fl-shy")) {
        f.style.setProperty("--flpx", s.px.toFixed(2) + "px");
        f.style.setProperty("--flpy", s.py.toFixed(2) + "px");
      }

      // proximity reactions
      const near = dist < 140;
      const veryNear = dist < 80;
      if (near !== s.near) {
        s.near = near;
        const p = f._personality;
        if (near) {
          // wake up if sleeping
          f.classList.remove("fl-sleep", "fl-sleepy");
          // mood-flavored body language
          if (p.mood === "happy" || p.mood === "dreamy") {
            f.classList.add("fl-happy");
          } else if (p.mood === "shy") {
            f.classList.add("fl-shy");
          } else if (p.mood === "grumpy") {
            f.classList.add("fl-grumpy");
          } else {
            f.classList.add("fl-surprised");
            setTimeout(() => f.classList.remove("fl-surprised"), 700);
          }
          // EVERY creature says something on approach: name or a says-line.
          // Named creatures announce their name 50% of the time, otherwise
          // a random personality line. Anonymous creatures always use says.
          const name = f.getAttribute("data-name");
          let text;
          if (name && Math.random() < 0.5) {
            text = name;
          } else if (p.says && p.says.length) {
            text = p.says[Math.floor(Math.random() * p.says.length)];
          } else {
            text = name || "!";
          }
          showBubble(f, text, 1400);
        } else {
          f.classList.remove("fl-happy", "fl-shy", "fl-grumpy", "fl-surprised");
        }
      }
      if (veryNear && !f._gleamTs) {
        f._gleamTs = now;
        if (Math.random() < 0.5) {
          const p = f._personality;
          if (p.says && p.says.length) {
            showBubble(f, p.says[Math.floor(Math.random() * p.says.length)], 1100);
          }
        }
      }
      if (!veryNear && f._gleamTs && now - f._gleamTs > 400) f._gleamTs = 0;

      // behavior tick
      if (now >= s.nextBehavior) {
        pickBehavior(f, f._personality);
        scheduleBehavior(f, s, f._personality);
      }
    });
    // throttle: skip alternate frames (~30fps is plenty for bobbing creatures)
    requestAnimationFrame(() => requestAnimationFrame(tick));
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
//     SECRET: pet 12× within 4s and the creature runs to the game 🕹️
const initPet = () => {
  let petCount = 0;
  let petTimer = null;
  const PET_GOAL = 12;        // clicks needed to trigger the game
  const PET_IDLE_MS = 4000;   // reset to 0 after this much inactivity
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
      petTimer = setTimeout(resetPetCount, PET_IDLE_MS);
      if (petCount >= PET_GOAL) {
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


// ─── FUZZY BREAKS — little creatures between posts ───────────────────
//   YOU CAN CUSTOMIZE THESE from posts.js:
//     window.TWEEN_NOTES   = ["your custom note", "sup", "..."];   // replaces random pool
//     window.TWEEN_MOODS   = ["shy", "happy", ...];                // replaces random mood pool
//     window.TWEEN_COLORS  = ["var(--bubble)", ...];               // replaces random color pool
//   Per-post override (on the post object itself):
//     tween: false                             // no break after this post
//     tween: "აქ მიყვარს ყოფნა"                // forces this exact note
//     tween: { note: "...", mood: "shy", color: "var(--grape)", hide: false }
const TWEEN_MOODS_DEFAULT  = ["happy", "sleepy", "curious", "shy", "grumpy", "dreamy", "excited", "anxious", "proud", "mischievous", "philosopher", "cozy", "melodramatic"];
const TWEEN_COLORS_DEFAULT = ["var(--bubble)", "var(--spring)", "var(--yolk)", "var(--sky)", "var(--grape)", "var(--pumpkin)", "var(--tomato)"];
const TWEEN_NOTES_DEFAULT  = [
  "breathe.", "keep scrolling.", "little break.", "fuzzy intermission.",
  "ოოო~", "მე აქ ვარ", "pssst.", "more below.", "tiny nap.",
  "don't skip me.", "აქ მიყვარს ყურება", "psst — below is good."
];
const TWEEN_MOODS  = (window.TWEEN_MOODS  && window.TWEEN_MOODS.length)  ? window.TWEEN_MOODS  : TWEEN_MOODS_DEFAULT;
const TWEEN_COLORS = (window.TWEEN_COLORS && window.TWEEN_COLORS.length) ? window.TWEEN_COLORS : TWEEN_COLORS_DEFAULT;
const TWEEN_NOTES  = (window.TWEEN_NOTES  && window.TWEEN_NOTES.length)  ? window.TWEEN_NOTES  : TWEEN_NOTES_DEFAULT;
// simple seeded pseudo-random for stable layout per session
let _twSeed = 0;
const twRand = () => { _twSeed = (_twSeed * 9301 + 49297) % 233280; return _twSeed / 233280; };

const makeTween = (key, override) => {
  // override === false → skip entirely
  if (override === false) return "";
  // override is a string → treat as forced note
  // override is an object → may specify { note, mood, color, hide }
  const ov = (typeof override === "string") ? { note: override }
           : (override && typeof override === "object") ? override
           : null;
  if (ov && ov.hide) return "";

  _twSeed = key * 9973 + 7;
  const nCreatures = 1 + Math.floor(twRand() * 2.5); // 1-3
  const showNote   = ov?.note ? true : (twRand() < 0.55);
  const parts = [];
  // spread creatures horizontally without overlap
  const slots = [];
  for (let i = 0; i < nCreatures; i++) {
    let x; let tries = 0;
    do { x = 8 + twRand() * 84; tries++; }
    while (tries < 8 && slots.some(s => Math.abs(s - x) < 22));
    slots.push(x);
    const y    = 10 + twRand() * 55;
    const d    = (twRand() * 2.2).toFixed(1);
    const size = 48 + Math.floor(twRand() * 44); // 48-92px
    const mood = ov?.mood  || TWEEN_MOODS[Math.floor(twRand() * TWEEN_MOODS.length)];
    const col  = ov?.color || TWEEN_COLORS[Math.floor(twRand() * TWEEN_COLORS.length)];
    const rot  = (twRand() * 20 - 10).toFixed(1);
    parts.push(`<div class="floater tween" data-mood="${mood}" style="--tw-x:${x.toFixed(1)}%; --tw-y:${y.toFixed(1)}%; --tw-d:${d}s; --r:${rot}deg; width:${size}px; height:${size}px"><svg viewBox="0 0 100 100" style="color:${col}"><use href="#creature"/></svg></div>`);
  }
  if (showNote) {
    const note = ov?.note || TWEEN_NOTES[Math.floor(twRand() * TWEEN_NOTES.length)];
    const nx   = 35 + twRand() * 30;
    const ny   = 30 + twRand() * 40;
    const nr   = (twRand() * 8 - 4).toFixed(1);
    parts.push(`<div class="tween-note" style="--tw-nx:${nx.toFixed(1)}%; --tw-ny:${ny.toFixed(1)}%; --tw-nr:${nr}deg">${note}</div>`);
  }
  return `<div class="work-tween" aria-hidden="true">${parts.join("")}</div>`;
};

// ─── VAZHA'S GAME — 5 rapid clicks on vazha → catch-the-bouncing-creature
//     game starts. Vazha bounces around the viewport, fleeing the cursor.
//     Catch him 5 times (cursor close enough) → confetti + victory text.
function initVazhaGame() {
  let clicks = 0;
  let resetT = null;
  let isPlaying = false;

  // Use CAPTURE phase so we see the click before .floater's pet handler
  // calls stopPropagation() — without `true` here, our listener never fires
  // on vazha clicks and the default 12-click pet→game.html path runs first.
  document.addEventListener("click", (e) => {
    if (isPlaying) return;
    const target = e.target.closest('[data-mood="crazy"]');
    if (!target) return;
    clicks++;
    clearTimeout(resetT);
    resetT = setTimeout(() => { clicks = 0; }, 1500);
    if (clicks >= 5) {
      clicks = 0;
      startVazhaGame();
    }
  }, true);

  function startVazhaGame() {
    isPlaying = true;
    const overlay = document.createElement("div");
    overlay.className = "vazha-game";
    overlay.innerHTML = `
      <div class="vazha-game-counter"><span class="vg-label">catch vazha · </span><span id="vazhaCount">0</span> / 5</div>
      <button class="vazha-game-close" id="vazhaGameClose" aria-label="Quit">×</button>
      <div class="vazha-game-vazha" id="vazhaGameVazha" data-mood="crazy" style="color: var(--grape)"></div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const vazha = overlay.querySelector("#vazhaGameVazha");
    vazha.innerHTML = FLOATER_SVG;

    const SIZE = 84;
    const HALF = SIZE / 2;
    let x = window.innerWidth * 0.5;
    let y = window.innerHeight * 0.5;
    let vx = (Math.random() < .5 ? 1 : -1) * (3 + Math.random() * 2);
    let vy = (Math.random() < .5 ? 1 : -1) * (3 + Math.random() * 2);
    let cursorX = -2000, cursorY = -2000;
    let count = 0;
    let lastCatchT = 0;
    let raf = 0;
    let frame = 0;
    // speed scales with catches — escalating chaos
    let speedMul = 1;
    let speedCap = 16;
    let lastTauntT = 0;
    const TAUNTS = ["wee!", "haha", "no!!", "ოო!", "i'm flying", "almost!", "ჰაჰა", "miss"];
    const taunt = (cx, cy) => {
      const t = document.createElement("span");
      t.className = "vazha-game-taunt";
      t.textContent = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
      t.style.left = cx + "px";
      t.style.top  = (cy - 50) + "px";
      overlay.appendChild(t);
      setTimeout(() => t.remove(), 1200);
    };
    const trail = (tx, ty) => {
      const d = document.createElement("span");
      d.className = "vazha-game-trail";
      d.style.left = tx + "px";
      d.style.top  = ty + "px";
      overlay.appendChild(d);
      setTimeout(() => d.remove(), 600);
    };

    const onMove = (e) => { cursorX = e.clientX; cursorY = e.clientY; };
    document.addEventListener("mousemove", onMove);

    const tick = () => {
      frame++;
      const dx = x - cursorX;
      const dy = y - cursorY;
      const dist = Math.hypot(dx, dy) || 0.001;

      // flee from cursor when within 220px (force scales with speedMul too)
      if (dist < 220) {
        const force = ((220 - dist) / 70) * speedMul;
        vx += (dx / dist) * force;
        vy += (dy / dist) * force;
      }
      // damping + min speed (so vazha never stops; min scales w/ catches)
      vx *= 0.96;
      vy *= 0.96;
      const minSpeed = 3 * speedMul;
      const speed = Math.hypot(vx, vy) || 0.001;
      if (speed < minSpeed) { vx = (vx / speed) * minSpeed; vy = (vy / speed) * minSpeed; }
      // cap speed
      if (speed > speedCap) { vx = (vx / speed) * speedCap; vy = (vy / speed) * speedCap; }

      x += vx; y += vy;
      // bounce off walls
      if (x < HALF)                      { x = HALF;                      vx = Math.abs(vx); }
      if (x > window.innerWidth  - HALF) { x = window.innerWidth  - HALF; vx = -Math.abs(vx); }
      if (y < HALF)                      { y = HALF;                      vy = Math.abs(vy); }
      if (y > window.innerHeight - HALF) { y = window.innerHeight - HALF; vy = -Math.abs(vy); }

      vazha.style.transform = `translate(${(x - HALF).toFixed(1)}px, ${(y - HALF).toFixed(1)}px) rotate(${(vx * 1.8).toFixed(1)}deg)`;

      // sparkle trail every 4 frames at his current position
      if (frame % 4 === 0) trail(x, y);

      // proximity warning pulse on the overlay
      overlay.classList.toggle("is-close", dist < 120);

      // random taunt bubble every ~1.6-2.6s
      const now = performance.now();
      if (now - lastTauntT > 1800 + Math.random() * 1200) {
        lastTauntT = now;
        taunt(x, y);
      }

      // catch detection — cursor within HALF + 24
      if (dist < HALF + 24 && now - lastCatchT > 700) {
        lastCatchT = now;
        count++;
        speedMul += 0.22;          // each catch makes him faster
        speedCap = Math.min(30, speedCap + 1.8);
        const cEl = document.getElementById("vazhaCount");
        if (cEl) cEl.textContent = count;
        spawnHearts(x, y);
        // expanding rings — three at once in different colors
        spawnRing(x, y, "");
        spawnRing(x, y, "is-pink");
        spawnRing(x, y, "is-yolk");
        // give vazha a kick away so the cursor doesn't auto-trigger again
        const ang = Math.atan2(dy, dx);
        vx = Math.cos(ang) * speedCap * 0.9;
        vy = Math.sin(ang) * speedCap * 0.9;
        // brief screen-flash class (tomato-tinted)
        overlay.classList.add("is-flash");
        setTimeout(() => overlay.classList.remove("is-flash"), 220);
        if (count >= 5) { win(); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    function spawnHearts(cx, cy) {
      const glyphs = ["♥", "✦", "★", "!", "♡", "✿"];
      for (let i = 0; i < 22; i++) {
        const h = document.createElement("span");
        h.className = "vazha-game-heart";
        h.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        h.style.left = cx + "px";
        h.style.top = cy + "px";
        h.style.setProperty("--dx", (Math.random() * 320 - 160).toFixed(0) + "px");
        h.style.setProperty("--dy", (-90 - Math.random() * 240).toFixed(0) + "px");
        h.style.setProperty("--r", (Math.random() * 720 - 360).toFixed(0) + "deg");
        h.style.setProperty("--d", (Math.random() * 0.18).toFixed(2) + "s");
        overlay.appendChild(h);
        setTimeout(() => h.remove(), 1600);
      }
    }
    function spawnRing(cx, cy, modifier) {
      const r = document.createElement("span");
      r.className = "vazha-game-ring" + (modifier ? " " + modifier : "");
      r.style.left = cx + "px";
      r.style.top  = cy + "px";
      // staggered start so rings cascade
      r.style.animationDelay = (modifier === "is-pink" ? "60ms" : modifier === "is-yolk" ? "120ms" : "0ms");
      overlay.appendChild(r);
      setTimeout(() => r.remove(), 900);
    }

    function win() {
      cancelAnimationFrame(raf);
      // confetti
      const colors = ["var(--bubble)", "var(--yolk)", "var(--spring)", "var(--sky)", "var(--grape)", "var(--tomato)", "var(--pumpkin)"];
      for (let i = 0; i < 80; i++) {
        const c = document.createElement("span");
        c.className = "vazha-game-confetti";
        c.style.left = (Math.random() * window.innerWidth) + "px";
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.setProperty("--dx", (Math.random() * 600 - 300).toFixed(0) + "px");
        c.style.setProperty("--d", (Math.random() * 0.9).toFixed(2) + "s");
        c.style.setProperty("--rot", (Math.random() * 1080).toFixed(0) + "deg");
        overlay.appendChild(c);
        setTimeout(() => c.remove(), 3500);
      }
      // big victory text
      const winEl = document.createElement("div");
      winEl.className = "vazha-game-win";
      winEl.textContent = "SAGOL BRAAAT";
      overlay.appendChild(winEl);
      setTimeout(end, 3200);
    }

    function end() {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("keydown", onKey);
      overlay.classList.add("is-closing");
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = "";
        isPlaying = false;
      }, 380);
    }

    const onKey = (e) => { if (e.key === "Escape") end(); };
    document.addEventListener("keydown", onKey);
    overlay.querySelector("#vazhaGameClose").addEventListener("click", end);
  }
}
initVazhaGame();

// ─── ORRKA'S GAME — vinyl scratch. 5 rapid clicks on orrka →
//     drag cursor around the record in circles. 5 full rotations = win.
//     orrka peeks from the side, EQ bars dance, her saying floats up.
function initOrrkaGame() {
  let clicks = 0;
  let resetT = null;
  let isPlaying = false;

  document.addEventListener("click", (e) => {
    if (isPlaying) return;
    const target = e.target.closest('[data-mood="cool"]');
    if (!target) return;
    clicks++;
    clearTimeout(resetT);
    resetT = setTimeout(() => { clicks = 0; }, 1500);
    if (clicks >= 5) {
      clicks = 0;
      startOrrkaGame();
    }
  }, true);

  function startOrrkaGame() {
    isPlaying = true;
    const overlay = document.createElement("div");
    overlay.className = "vs-game";
    overlay.innerHTML = `
      <div class="vs-counter"><span id="vsCount">0</span> / 5 spins</div>
      <button class="vs-close" id="vsGameClose" aria-label="Quit">×</button>
      <button class="vs-mute" id="vsMute" aria-label="Mute">♪</button>
      <div class="vs-status" id="vsStatus">spin the record…</div>
      <div class="vs-stage">
        <div class="vs-eq" aria-hidden="true">
          ${Array.from({length: 14}, (_, i) => `<span class="vs-bar" style="--i:${i}"></span>`).join("")}
        </div>
        <div class="vs-eq vs-eq-right" aria-hidden="true">
          ${Array.from({length: 14}, (_, i) => `<span class="vs-bar" style="--i:${i}"></span>`).join("")}
        </div>
        <div class="vs-deck" id="vsDeck">
          <div class="vs-record" id="vsRecord">
            <div class="vs-groove vs-groove-1"></div>
            <div class="vs-groove vs-groove-2"></div>
            <div class="vs-groove vs-groove-3"></div>
            <div class="vs-groove vs-groove-4"></div>
            <div class="vs-label">
              <div class="vs-label-text">orrka</div>
              <div class="vs-label-sub">side a</div>
            </div>
            <div class="vs-spindle"></div>
          </div>
          <div class="vs-arm"><span class="vs-arm-tip"></span></div>
        </div>
        <div class="vs-orrka" data-mood="cool" style="color: var(--sky)"></div>
        <div class="vs-bubbles" id="vsBubbles"></div>
      </div>
      <div class="vs-hint" id="vsHint">drag in circles ↻</div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const orrka   = overlay.querySelector(".vs-orrka");
    orrka.innerHTML = FLOATER_SVG;

    const record  = overlay.querySelector("#vsRecord");
    const status  = overlay.querySelector("#vsStatus");
    const countEl = overlay.querySelector("#vsCount");
    const bubbles = overlay.querySelector("#vsBubbles");
    const hint    = overlay.querySelector("#vsHint");
    const muteBtn = overlay.querySelector("#vsMute");

    // ─── audio (Web Audio API — lazy, no asset files) ───────────
    let audioCtx = null, masterGain = null, ambGain = null, ambNodes = null;
    let muted = localStorage.getItem("vs_muted") === "1";
    muteBtn.classList.toggle("is-muted", muted);
    muteBtn.textContent = muted ? "♪̸" : "♪";

    let noiseBuf = null;
    const initAudio = () => {
      if (audioCtx || muted) return;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(audioCtx.destination);

        // pre-bake a half-second white-noise buffer for scratch/ambience
        const len = Math.floor(audioCtx.sampleRate * 0.5);
        noiseBuf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
        const ch = noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * 0.6;

        // dreamy room-tone hum — looped low pad behind everything
        startAmbience();
      } catch (e) { audioCtx = null; }
    };

    const startAmbience = () => {
      if (!audioCtx) return;
      ambGain = audioCtx.createGain();
      ambGain.gain.value = 0;
      ambGain.connect(masterGain);
      ambGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1.2);

      // two detuned saw oscillators, low-passed → warm pad
      const o1 = audioCtx.createOscillator();
      const o2 = audioCtx.createOscillator();
      o1.type = "sawtooth"; o2.type = "sawtooth";
      o1.frequency.value = 110;     // A2
      o2.frequency.value = 110 * 1.498; // ~E3, fifth
      const lp = audioCtx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 700; lp.Q.value = 0.6;
      const padGain = audioCtx.createGain();
      padGain.gain.value = 0.12;
      o1.connect(lp); o2.connect(lp); lp.connect(padGain).connect(ambGain);
      o1.start(); o2.start();

      // slow LFO on the filter for breathing
      const lfo = audioCtx.createOscillator();
      const lfoG = audioCtx.createGain();
      lfo.frequency.value = 0.18;
      lfoG.gain.value = 220;
      lfo.connect(lfoG).connect(lp.frequency);
      lfo.start();

      ambNodes = { o1, o2, lp, padGain, lfo, lfoG };
    };

    const stopAudio = () => {
      if (!audioCtx) return;
      try {
        if (ambGain) ambGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
        setTimeout(() => {
          try { audioCtx && audioCtx.close(); } catch (e) {}
          audioCtx = null; masterGain = null; ambGain = null; ambNodes = null;
        }, 350);
      } catch (e) {}
    };

    const playScratch = (deg) => {
      if (!audioCtx || muted) return;
      const v = Math.min(20, Math.abs(deg));
      const src = audioCtx.createBufferSource();
      src.buffer = noiseBuf;
      src.playbackRate.value = 0.55 + v / 14;
      const bp = audioCtx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 500 + v * 110;
      bp.Q.value = 5.5;
      const g = audioCtx.createGain();
      const t = audioCtx.currentTime;
      const peak = Math.min(0.45, 0.06 + v / 40);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.13);
      src.connect(bp).connect(g).connect(masterGain);
      src.start(t);
      src.stop(t + 0.14);
    };

    const playChime = (n) => {
      if (!audioCtx || muted) return;
      const t = audioCtx.currentTime;
      // climbing pentatonic-ish: A4 C5 E5 G5 C6
      const freqs = [440, 523.25, 659.25, 783.99, 1046.5];
      const f = freqs[Math.min(n - 1, freqs.length - 1)];
      [f, f * 2, f * 3].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        o.type = i === 0 ? "sine" : "triangle";
        o.frequency.value = freq;
        const g = audioCtx.createGain();
        const peak = i === 0 ? 0.32 : (i === 1 ? 0.12 : 0.05);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.85 - i * 0.15);
        o.connect(g).connect(masterGain);
        o.start(t);
        o.stop(t + 0.9);
      });
    };

    const playWin = () => {
      if (!audioCtx || muted) return;
      const base = audioCtx.currentTime;
      const seq = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      seq.forEach((f, i) => {
        const o = audioCtx.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        const g = audioCtx.createGain();
        const t = base + i * 0.11;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.42, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        o.connect(g).connect(masterGain);
        o.start(t); o.stop(t + 0.65);
      });
      // bass thump
      const b = audioCtx.createOscillator();
      b.type = "sine"; b.frequency.value = 80;
      const bg = audioCtx.createGain();
      bg.gain.setValueAtTime(0.6, base);
      bg.gain.exponentialRampToValueAtTime(0.001, base + 1.1);
      b.connect(bg).connect(masterGain);
      b.start(base); b.stop(base + 1.2);
    };

    muteBtn.addEventListener("click", () => {
      muted = !muted;
      localStorage.setItem("vs_muted", muted ? "1" : "0");
      muteBtn.classList.toggle("is-muted", muted);
      muteBtn.textContent = muted ? "♪̸" : "♪";
      if (muted && audioCtx) stopAudio();
      if (!muted && !audioCtx) initAudio();
    });

    const SAYING = "მე ვარ ყველაზე ჩლუნგი გოგო ამ დაწესებულებაში";
    const WIN_LINE = "სასტავს მანქანა ვგონივარ მაგრამ ტორმუზი არა მაქვს";
    const MID_POOL = [
      "სორო ამოვთხარე",
      "yeah… that's the spot",
      "დიდი ხე გავახარე",
      "scratch it ↻",
      "სამოთხიდან გავვარდი",
      SAYING,
      "გოგოები თამაშობენ პაბჯის",
      "smoother",
      "24 აღარ მყოფნის · 25 შავი დევი",
      "mmhm",
      SAYING,
      "louder",
    ];
    // shuffle so the order varies per game
    const MID_LINES = MID_POOL.slice().sort(() => Math.random() - 0.5);

    let dragging   = false;
    let lastAngle  = null;
    let totalDeg   = 0;
    let recordRot  = 0;
    let spins      = 0;
    let won        = false;
    let bubbleI    = 0;
    let lastBubbleAt = 0;
    let lastEqAt   = 0;
    let lastScratchAt = 0;

    const getCenter = () => {
      const r = record.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };

    const onDown = (e) => {
      if (won) return;
      initAudio();
      const t = e.touches ? e.touches[0] : e;
      const { cx, cy } = getCenter();
      lastAngle = Math.atan2(t.clientY - cy, t.clientX - cx) * 180 / Math.PI;
      dragging = true;
      record.classList.add("is-spinning");
      hint.classList.add("is-fade");
    };

    const onMove = (e) => {
      if (!dragging || won) return;
      const t = e.touches ? e.touches[0] : e;
      const { cx, cy } = getCenter();
      const a = Math.atan2(t.clientY - cy, t.clientX - cx) * 180 / Math.PI;
      let delta = a - lastAngle;
      // normalize to [-180, 180]
      if (delta > 180)  delta -= 360;
      if (delta < -180) delta += 360;
      lastAngle = a;

      // only count clockwise motion (positive delta in screen space)
      if (Math.abs(delta) < 60) {
        totalDeg += delta;
        recordRot += delta;
        record.style.transform = `rotate(${recordRot}deg)`;
      }

      const now = performance.now();

      // scratch sound — throttled to ~70ms, only when actually scratching
      if (now - lastScratchAt > 70 && Math.abs(delta) > 1.2) {
        playScratch(delta);
        lastScratchAt = now;
      }

      // EQ pulse when actively scratching
      if (now - lastEqAt > 80 && Math.abs(delta) > 1) {
        overlay.classList.add("vs-pulse");
        lastEqAt = now;
        setTimeout(() => overlay.classList.remove("vs-pulse"), 90);
      }

      // every full clockwise rotation
      const newSpins = Math.floor(Math.abs(totalDeg) / 360);
      if (newSpins > spins && totalDeg > 0) {
        spins = newSpins;
        countEl.textContent = spins;
        spawnRing();
        playChime(spins);
        if (spins === 1) status.textContent = "yes. like that.";
        else if (spins === 2) status.textContent = "groovy.";
        else if (spins === 3) status.textContent = "she's feeling it.";
        else if (spins === 4) status.textContent = "one more!!";
        if (spins >= 5) { win(); return; }
      }

      // periodic floating saying
      if (now - lastBubbleAt > 1100 && Math.abs(delta) > 2) {
        spawnBubble(MID_LINES[bubbleI % MID_LINES.length]);
        bubbleI++;
        lastBubbleAt = now;
      }
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      lastAngle = null;
      record.classList.remove("is-spinning");
    };

    const spawnRing = () => {
      const r = document.createElement("span");
      r.className = "vs-ring";
      const palette = ["var(--bubble)", "var(--yolk)", "var(--spring)", "var(--sky)", "var(--grape)"];
      r.style.borderColor = palette[spins % palette.length];
      overlay.querySelector(".vs-stage").appendChild(r);
      setTimeout(() => r.remove(), 1200);
    };

    const spawnBubble = (text) => {
      const b = document.createElement("div");
      b.className = "vs-bubble";
      // bias slightly to the side so they float over open space
      const side = Math.random() > 0.5 ? 1 : -1;
      b.style.setProperty("--bx", (side * (40 + Math.random() * 120)).toFixed(0) + "px");
      b.style.setProperty("--rot", ((Math.random() * 8 - 4)).toFixed(1) + "deg");
      b.textContent = text;
      bubbles.appendChild(b);
      setTimeout(() => b.remove(), 2400);
    };

    const stage = overlay.querySelector(".vs-stage");
    stage.addEventListener("mousedown", onDown);
    stage.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    function win() {
      won = true;
      dragging = false;
      record.classList.add("is-winning");
      playWin();

      const winEl = document.createElement("div");
      winEl.className = "vs-win";
      winEl.textContent = WIN_LINE;
      overlay.appendChild(winEl);

      const sayingEl = document.createElement("div");
      sayingEl.className = "vs-saying";
      sayingEl.textContent = SAYING;
      overlay.appendChild(sayingEl);

      const colors = ["var(--bubble)", "var(--yolk)", "var(--spring)", "var(--sky)", "var(--grape)", "var(--tomato)", "var(--pumpkin)"];
      for (let i = 0; i < 90; i++) {
        const c = document.createElement("span");
        c.className = "vazha-game-confetti";
        c.style.left = (Math.random() * window.innerWidth) + "px";
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.setProperty("--dx", (Math.random() * 600 - 300).toFixed(0) + "px");
        c.style.setProperty("--d", (Math.random() * 1.0).toFixed(2) + "s");
        c.style.setProperty("--rot", (Math.random() * 1080).toFixed(0) + "deg");
        overlay.appendChild(c);
        setTimeout(() => c.remove(), 3800);
      }
      setTimeout(end, 4400);
    }

    function end() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      document.removeEventListener("keydown", onKey);
      stopAudio();
      overlay.classList.add("is-closing");
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = "";
        isPlaying = false;
      }, 380);
    }

    const onKey = (e) => { if (e.key === "Escape") end(); };
    document.addEventListener("keydown", onKey);
    overlay.querySelector("#vsGameClose").addEventListener("click", end);
  }
}
initOrrkaGame();

// ─── LITE MODE TOGGLE — flips heavy effects off, persists in localStorage
function initLiteToggle() {
  const btn = document.getElementById("liteToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const isOn = document.documentElement.classList.contains("lite");
    window.xl.lite(!isOn);
  });
}
initLiteToggle();

// ─── GRID OVERLAY — see all works at once, click any to scroll there ──
function initGridOverlay() {
  const toggle  = document.getElementById("gridToggle");
  const overlay = document.getElementById("gridOverlay");
  const closeEl = document.getElementById("gridClose");
  const inner   = document.getElementById("gridOverlayInner");
  if (!toggle || !overlay || !inner) return;

  const tiles = [];
  posts.forEach((post, index) => {
    if (!post.images || !post.images.length) return;
    const title = (post.title || "untitled").replace(/"/g, "&quot;");
    // per-tile organic jitter — small random rotation + a hint of x nudge
    const rot = ((Math.random() - 0.5) * 5).toFixed(2);     // ±2.5 deg
    const nudge = ((Math.random() - 0.5) * 12).toFixed(1);  // ±6 px
    tiles.push(
      `<a href="#post-${index}" class="grid-tile" data-target="post-${index}"
          style="--rot:${rot}deg; margin-left:${nudge}px">
         <img src="${post.images[0]}" alt="${title}" loading="lazy" decoding="async" draggable="false"/>
         <span class="grid-tile-title">${title}</span>
       </a>`
    );
  });
  inner.innerHTML = tiles.join("");

  const open = () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  toggle.addEventListener("click", open);
  closeEl?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });

  inner.addEventListener("click", async (e) => {
    const tile = e.target.closest(".grid-tile");
    if (!tile) return;
    e.preventDefault();
    const id = tile.dataset.target;
    const target = document.getElementById(id);
    if (!target) { close(); return; }

    const NAV_OFFSET = 90;
    const computeTop = () =>
      Math.max(0, target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET);

    // STEP 1 — wait for webfonts to load. Fallback fonts have different
    // metrics, so text-heavy sections shift height once Garamond/Syne
    // arrive. Without this wait, the first click after a cold load hits
    // a stale Y.
    try { if (document.fonts?.ready) await document.fonts.ready; } catch {}

    // STEP 2 — force layout on every work-section to evict the
    // content-visibility:auto placeholders (which default to 800px until
    // measured). Reading offsetTop synchronously realizes real heights.
    document.querySelectorAll(".work-section").forEach(s => { void s.offsetTop; });

    // STEP 3 — jump-scroll while the overlay still covers the page so
    // the user never sees the leap.
    window.scrollTo({ top: computeTop(), behavior: "instant" });

    // STEP 4 — close overlay; page already at the right spot.
    close();

    // STEP 5 — defensive correction. Lazy images decoding mid-flight can
    // shift heights by tens of pixels. Re-measure after a beat and
    // smooth-correct if we drifted.
    setTimeout(() => {
      const t = computeTop();
      if (Math.abs(t - window.scrollY) > 4) {
        window.scrollTo({ top: t, behavior: "smooth" });
      }
    }, 220);
  });
}

// ─── MOUNT ──────────────────────────────────────────────────────────
const worksEl = document.getElementById("works");
if (worksEl) {
  let html = ""; let workNum = 0;
  posts.forEach((post, index) => {
    if (post.type !== "idea") workNum++;
    html += renderPost(post, index, workNum);
    // drop a fuzzy break after each post except the last.
    // Customize per-post via `tween:` on the post object (see posts.js).
    if (index < posts.length - 1) {
      html += makeTween(index + 1, post.tween);
    }
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
  initGridOverlay();
}


// ─── FREAKY MODE — fast spam-clicks anywhere → cursor loses its mind
//   Threshold: 6 clicks within 700ms. Holds the freak for ~2.4s after
//   the last qualifying click; resets cleanly. Desktop only (touch
//   devices don't have the cursor creature).
const initFreaky = () => {
  const creature = document.getElementById("cursorCreature");
  const emote    = document.getElementById("ccEmote");
  if (!creature) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const WINDOW_MS = 700;
  const TRIGGER   = 6;
  const HOLD_MS   = 2400;

  let clickTimes = [];
  let freakOff   = null;

  const popEmote = (txt) => {
    if (!emote) return;
    emote.textContent = txt;
    emote.className = "cc-emote pop-freak";
    setTimeout(() => { emote.className = "cc-emote"; emote.textContent = ""; }, 480);
  };

  document.addEventListener("click", () => {
    const now = performance.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter(t => now - t < WINDOW_MS);
    if (clickTimes.length >= TRIGGER) {
      if (!creature.classList.contains("cc-freaky")) {
        creature.classList.add("cc-freaky");
        popEmote("!?");
      }
      clearTimeout(freakOff);
      freakOff = setTimeout(() => {
        creature.classList.remove("cc-freaky");
        clickTimes = [];
      }, HOLD_MS);
    }
  }, true);
};

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
initFreaky();
