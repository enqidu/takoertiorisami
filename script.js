/* ═══════════════════════════════════════════════════════════════════
   HOW TO ADD A NEW POST
   ═══════════════════════════════════════════════════════════════════

   1. Copy the template below and paste it at the TOP of the `posts`
      array (newest first).

   2. Put images in the  images/  folder next to index.html.

   ─── TEMPLATE ────────────────────────────────────────────────────
   {
     title:       "Your Title",
     date:        "March 2026",
     description: `Description here.

   Can be multiple paragraphs.`,
     tags: ["creatures", "painting"],
     images: [
       "images/your-image-01.jpg",
       "images/your-image-02.jpg",    // multiple = scrollable gallery
     ],
     placeholder: "creature",  // shown if images is empty
                               // options: creature | eyes | pond | puppet | pumpkin | doodles
     // type: "idea",          // uncomment for text-only (no gallery)
   },
   ═══════════════════════════════════════════════════════════════════ */


// ─── TAG COLORS ─────────────────────────────────────────────────────
const TAG_COLORS = ["pink", "blue", "green", "orange", "purple", "yellow"];


// ─── POSTS ──────────────────────────────────────────────────────────

const posts = [
  {
    title: "Pumpkin Head",
    date: "March 2025",
    description: `ეს დავხატე როდესაც მინდოდა მეჭამა გოგრის სუპი.`,
    tags: ["creatures"],
    images: [
       "images/pumpkin.png",
    ],
    placeholder: "pumpkin",
  },

  {
    title: "Pink Creature",
    date: "February 2025",
    description: `ვარდისფერია ძმა.`,
    tags: ["Pink", "Close"],
    images: [
       "images/pink.png",
       "images/pink2.png",
    ],
    placeholder: "creature",
  },


  {
    title: "ენაცვალოს ჩემი ძუძუნი",
    date: "January 2025",
    type: "idea",
    description: `ენაცვალოს ჩემი ძუძუნი
მწყემსის, გარაის ყლესაო,
აეგრე დასჩვრეტს საოხრეს,
როგორც "ბერდენკა" ხესაო,
მეხი კი ჩამოვათხლიშე
ინტელიგენტის ყლესაო,
მიადებს, მეებრიცება,
თან მიაშველებს ხელსაო,
ბოლოს ბოდიშსაც მაიხდის:
- ლექცია მქონდა დღესაო..`,
    tags: ["მუტელი"],
    images: [],
  },

  {
    title: "გრიდი))",
    date: "December 2024",
    description: `გრიდი სადაც დავჩხარტე ჭყურტები `,
    tags: ["canvas", "acrylic", "ensemble", "creatures"],
    images: [
       "images/grid.png",
    ],
    placeholder: "eyes",
  },

  

  {
    title: "Hospital",
    date: "October 2024",
    type: "Modern Lovers",
    description: `
When you get out of the hospital
Let me back into your life
I can't stand what you do
I'm in love with your eyes

And when you get out of the dating bar
I'll be here to get back into your life
I can't stand what you do
I'm in love with your eyes

    `,
    tags: ["Jonathan Richman", "teeth"],
    images: [],
  },


];


// ─── PLACEHOLDER SVGs ──────────────────────────────────────────────
// Bold, saturated — matching YOUR painting style.

const makePlaceholder = (type) => {
  const svgs = {

    creature: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="400" fill="#4da6ff"/>
      <ellipse cx="300" cy="200" rx="170" ry="160" fill="#ff5c8a"/>
      <circle cx="230" cy="170" r="45" fill="white" stroke="#1a1a2e" stroke-width="3"/>
      <circle cx="236" cy="170" r="30" fill="#5cc95c"/>
      <circle cx="240" cy="164" r="18" fill="#1a1a2e"/>
      <circle cx="248" cy="158" r="6"  fill="white" opacity="0.8"/>
      <circle cx="380" cy="175" r="38" fill="white" stroke="#1a1a2e" stroke-width="3"/>
      <circle cx="384" cy="175" r="25" fill="#5cc95c"/>
      <circle cx="387" cy="170" r="15" fill="#1a1a2e"/>
      <circle cx="394" cy="164" r="5"  fill="white" opacity="0.8"/>
      <path d="M200 265 Q300 330 400 265" fill="#1a1a2e" stroke="#1a1a2e" stroke-width="3"/>
      <rect x="245" y="265" width="22" height="16" rx="3" fill="white"/>
      <rect x="275" y="265" width="22" height="16" rx="3" fill="white"/>
      <rect x="305" y="265" width="22" height="16" rx="3" fill="white"/>
      <rect x="335" y="265" width="22" height="16" rx="3" fill="white"/>
    </svg>`,

    eyes: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="400" fill="#4da6ff"/>
      <rect x="10"  y="10"  width="190" height="185" rx="8" fill="#5cc95c"/>
      <rect x="205" y="10"  width="190" height="185" rx="8" fill="#ffd642"/>
      <rect x="400" y="10"  width="190" height="185" rx="8" fill="#ff5c8a"/>
      <rect x="10"  y="205" width="190" height="185" rx="8" fill="#ffd642"/>
      <rect x="205" y="205" width="285" height="185" rx="8" fill="#5cc95c"/>
      <circle cx="105" cy="102" r="30" fill="white"/><circle cx="110" cy="100" r="16" fill="#1a1a2e"/>
      <circle cx="300" cy="102" r="28" fill="white"/><circle cx="305" cy="100" r="15" fill="#ff5c8a"/>
      <circle cx="495" cy="102" r="32" fill="white"/><circle cx="500" cy="100" r="18" fill="#1a1a2e"/>
      <circle cx="105" cy="297" r="26" fill="white"/><circle cx="108" cy="295" r="14" fill="#b07cff"/>
      <circle cx="350" cy="297" r="35" fill="white"/><circle cx="358" cy="295" r="20" fill="#1a1a2e"/>
      <rect x="500" y="205" width="90" height="185" rx="8" fill="#ff8c42"/>
      <circle cx="545" cy="280" r="22" fill="#ffd642" stroke="#1a1a2e" stroke-width="2"/>
      <circle cx="538" cy="274" r="6" fill="#1a1a2e"/>
      <circle cx="552" cy="274" r="6" fill="#1a1a2e"/>
      <path d="M536 290 Q545 298 554 290" stroke="#1a1a2e" stroke-width="2" fill="none"/>
    </svg>`,

    pond: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="400" fill="#4da6ff"/>
      <ellipse cx="120" cy="150" rx="55" ry="35" fill="#5cc95c" stroke="#3a8a3a" stroke-width="2" transform="rotate(-15,120,150)"/>
      <ellipse cx="480" cy="100" rx="45" ry="30" fill="#5cc95c" stroke="#3a8a3a" stroke-width="2" transform="rotate(10,480,100)"/>
      <ellipse cx="400" cy="320" rx="60" ry="38" fill="#5cc95c" stroke="#3a8a3a" stroke-width="2"/>
      <ellipse cx="100" cy="340" rx="50" ry="32" fill="#5cc95c" stroke="#3a8a3a" stroke-width="2" transform="rotate(-8,100,340)"/>
      <ellipse cx="520" cy="220" rx="40" ry="26" fill="#5cc95c" stroke="#3a8a3a" stroke-width="2"/>
      <path d="M180 380 Q210 240 280 200 Q320 180 340 210 Q360 240 350 300 Q380 260 420 280 Q440 290 430 350" stroke="#ff5c8a" stroke-width="38" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="280" cy="180" r="50" fill="#ff5c8a"/>
      <circle cx="266" cy="172" r="8" fill="#1a1a2e"/>
      <circle cx="294" cy="172" r="8" fill="#1a1a2e"/>
    </svg>`,

    puppet: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="400" fill="#f0e8f8"/>
      <polygon points="0,0 300,0 150,200" fill="#d8f0d0" opacity="0.7"/>
      <polygon points="300,0 600,0 600,200 300,200" fill="#f8d0e0" opacity="0.6"/>
      <polygon points="0,200 300,400 0,400" fill="#f8d0e0" opacity="0.5"/>
      <polygon points="300,200 600,200 600,400 300,400" fill="#d8f0d0" opacity="0.6"/>
      <circle cx="300" cy="130" r="72" fill="#ffd642" stroke="#ff8c42" stroke-width="3"/>
      <circle cx="270" cy="120" r="28" fill="#ff5c8a" opacity="0.8"/>
      <circle cx="270" cy="120" r="16" fill="white"/>
      <circle cx="330" cy="120" r="28" fill="#ff5c8a" opacity="0.8"/>
      <circle cx="330" cy="120" r="16" fill="white"/>
      <path d="M240 62 Q260 20 280 58 Q300 10 320 58 Q340 22 360 62" fill="#b07cff" stroke="#8060b0" stroke-width="2"/>
      <ellipse cx="218" cy="120" rx="20" ry="30" fill="#4da6ff" stroke="#1a1a2e" stroke-width="2"/>
      <ellipse cx="382" cy="120" rx="20" ry="30" fill="#4da6ff" stroke="#1a1a2e" stroke-width="2"/>
      <circle cx="218" cy="115" r="9" fill="#5cc95c"/>
      <circle cx="382" cy="115" r="9" fill="#ff8c42"/>
      <ellipse cx="300" cy="240" rx="70" ry="50" fill="#ff5c8a"/>
      <circle cx="380" cy="225" r="12" fill="#5cc95c"/>
      <circle cx="395" cy="240" r="10" fill="#ffd642"/>
      <circle cx="385" cy="258" r="10" fill="#5cc95c"/>
      <rect x="248" y="280" width="24" height="80" rx="12" fill="#ffd642"/>
      <rect x="278" y="280" width="24" height="80" rx="12" fill="#5cc95c"/>
      <rect x="308" y="280" width="24" height="80" rx="12" fill="#4da6ff"/>
      <rect x="338" y="280" width="24" height="80" rx="12" fill="#ffd642"/>
      <rect x="244" y="348" width="32" height="18" rx="6" fill="#ff5c8a"/>
      <rect x="274" y="348" width="32" height="18" rx="6" fill="#ff8c42"/>
      <rect x="304" y="348" width="32" height="18" rx="6" fill="#ff5c8a"/>
      <rect x="334" y="348" width="32" height="18" rx="6" fill="#ff8c42"/>
    </svg>`,

    pumpkin: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="400" fill="#fffbf2"/>
      <ellipse cx="300" cy="280" rx="90" ry="120" fill="#8b5e3c"/>
      <ellipse cx="290" cy="260" rx="60" ry="85"  fill="#a0703c" opacity="0.8"/>
      <ellipse cx="310" cy="270" rx="50" ry="70"  fill="#c48840" opacity="0.6"/>
      <circle cx="300" cy="120" r="80" fill="#ff8c42"/>
      <path d="M260 120 Q300 60 340 120"  stroke="#e06820" stroke-width="4" fill="none"/>
      <path d="M240 130 Q300 80 360 130"  stroke="#e06820" stroke-width="3" fill="none" opacity="0.6"/>
      <path d="M250 110 Q300 140 350 110" stroke="#e06820" stroke-width="3" fill="none" opacity="0.4"/>
      <rect x="290" y="38" width="20" height="20" rx="4" fill="#5cc95c"/>
      <path d="M310 48 Q330 30 325 50" fill="#5cc95c" stroke="#3a8a3a" stroke-width="1"/>
      <line x1="260" y1="220" x2="250" y2="280" stroke="#6b4020" stroke-width="3" opacity="0.5"/>
      <line x1="280" y1="210" x2="270" y2="300" stroke="#a06830" stroke-width="3" opacity="0.4"/>
      <line x1="320" y1="210" x2="330" y2="300" stroke="#a06830" stroke-width="3" opacity="0.4"/>
      <line x1="340" y1="220" x2="350" y2="280" stroke="#6b4020" stroke-width="3" opacity="0.5"/>
    </svg>`,

    doodles: `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="400" fill="#fffcf0"/>
      <line x1="50" y1="60"  x2="550" y2="60"  stroke="#e0d4b8" stroke-width="1"/>
      <line x1="50" y1="92"  x2="550" y2="92"  stroke="#e0d4b8" stroke-width="1"/>
      <line x1="50" y1="124" x2="550" y2="124" stroke="#e0d4b8" stroke-width="1"/>
      <line x1="50" y1="156" x2="550" y2="156" stroke="#e0d4b8" stroke-width="1"/>
      <line x1="50" y1="188" x2="550" y2="188" stroke="#e0d4b8" stroke-width="1"/>
      <line x1="50" y1="220" x2="550" y2="220" stroke="#e0d4b8" stroke-width="1"/>
      <line x1="50" y1="252" x2="550" y2="252" stroke="#e0d4b8" stroke-width="1"/>
      <line x1="50" y1="284" x2="550" y2="284" stroke="#e0d4b8" stroke-width="1"/>
      <line x1="50" y1="316" x2="550" y2="316" stroke="#e0d4b8" stroke-width="1"/>
      <line x1="50" y1="348" x2="550" y2="348" stroke="#e0d4b8" stroke-width="1"/>
      <line x1="88" y1="40"  x2="88"  y2="380" stroke="#ff5c8a" stroke-width="1.5" opacity="0.5"/>
      <circle cx="64" cy="110" r="18" fill="#ff5c8a" stroke="#1a1a2e" stroke-width="2"/>
      <circle cx="58" cy="104" r="5" fill="white"/><circle cx="59" cy="104" r="2.5" fill="#1a1a2e"/>
      <circle cx="70" cy="104" r="5" fill="white"/><circle cx="71" cy="104" r="2.5" fill="#1a1a2e"/>
      <path d="M57 118 Q64 124 71 118" stroke="#1a1a2e" stroke-width="1.5" fill="none"/>
      <rect x="100" y="54"  width="200" height="8" rx="4" fill="#b07cff" opacity="0.35"/>
      <rect x="100" y="86"  width="320" height="8" rx="4" fill="#4da6ff" opacity="0.3"/>
      <rect x="100" y="118" width="260" height="8" rx="4" fill="#5cc95c" opacity="0.3"/>
      <rect x="100" y="182" width="280" height="8" rx="4" fill="#ff5c8a" opacity="0.3"/>
      <rect x="100" y="214" width="180" height="8" rx="4" fill="#ff8c42" opacity="0.3"/>
      <rect x="100" y="278" width="310" height="8" rx="4" fill="#4da6ff" opacity="0.28"/>
      <text x="64" y="200" font-size="18" text-anchor="middle" fill="#ffd642">✦</text>
      <circle cx="64" cy="300" r="16" fill="#5cc95c" stroke="#1a1a2e" stroke-width="2"/>
      <circle cx="64" cy="296" r="6" fill="white"/>
      <circle cx="65" cy="295" r="3" fill="#1a1a2e"/>
      <circle cx="420" cy="180" r="50" fill="#ffd642" stroke="#1a1a2e" stroke-width="2" opacity="0.8"/>
      <circle cx="405" cy="170" r="10" fill="white"/><circle cx="407" cy="169" r="5" fill="#1a1a2e"/>
      <circle cx="435" cy="170" r="10" fill="white"/><circle cx="437" cy="169" r="5" fill="#1a1a2e"/>
      <path d="M408 195 Q420 206 432 195" stroke="#1a1a2e" stroke-width="2" fill="none"/>
      <rect x="405" y="230" width="30" height="50" rx="10" fill="#ffd642" opacity="0.6"/>
    </svg>`,
  };

  return svgs[type] || svgs.doodles;
};


// ─── RENDER ──────────────────────────────────────────────────────────

const renderTags = (tags) =>
  tags.map((tag, i) =>
    `<span class="tag tag-${TAG_COLORS[i % TAG_COLORS.length]}">${tag}</span>`
  ).join("");

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

  // ─── Idea post: dark editorial interstitial ───
  if (isIdea) {
    return `<section class="work-section work-idea reveal" id="${pid}">
      <div class="idea-inner">
        <span class="idea-label">✦ thought</span>
        <blockquote class="idea-text">${post.description}</blockquote>
        <div class="idea-footer">
          <span class="idea-title">— ${post.title}</span>
          <span class="idea-date">${post.date}</span>
        </div>
        <div class="work-tags">${renderTags(post.tags)}</div>
      </div>
    </section>`;
  }

  // ─── Work post: editorial section ───
  const postNum   = String(workNum).padStart(2, "0");
  const hasImages = post.images && post.images.length > 0;
  const count     = hasImages ? post.images.length : 1;

  return `<section class="work-section reveal" id="${pid}">
    <div class="work-index" aria-hidden="true">${postNum}</div>
    <div class="work-header">
      <span class="work-date">${post.date}</span>
      <h2 class="work-title">${post.title}</h2>
    </div>
    <div class="work-gallery">
      <div class="gallery-frame">
        <div class="gallery-viewport" id="${pid}-viewport">
          <div class="gallery-track" id="${pid}-track">
            ${renderSlides(post)}
          </div>
        </div>
      </div>
      ${renderGalleryControls(count, pid)}
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
    dots.querySelectorAll(".dot-btn").forEach((d, i) => d.classList.toggle("active", i === cur));
    counter.textContent = `${cur + 1} / ${total}`;
  };

  prev.addEventListener("click", () => go(cur - 1));
  next.addEventListener("click", () => go(cur + 1));
  dots.querySelectorAll(".dot-btn").forEach(d =>
    d.addEventListener("click", () => go(Number(d.dataset.index)))
  );

  // Touch swipe
  const vp = document.getElementById(`${pid}-viewport`);
  let tx = 0;
  vp.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
  vp.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  // Mouse drag
  let mx = 0, dragging = false;
  vp.addEventListener("mousedown", e => { dragging = true; mx = e.clientX; });
  window.addEventListener("mouseup", e => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - mx;
    if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1);
  });
};


// ─── CUSTOM CURSOR (dot + ring with lag) ─────────────────────────────

const initCursor = () => {
  const dot  = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  // Only on devices with a fine pointer (mouse)
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top  = my + "px";
  });

  // Ring follows with lerp (smooth lag)
  const lerp = () => {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + "px";
    ring.style.top  = ry + "px";
    requestAnimationFrame(lerp);
  };
  lerp();

  // Hover detection for interactive elements
  const hoverTargets = "a, button, .gallery-viewport, .floating-portrait, .lightbox-close, .lightbox-nav";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.add("cursor-hover");
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.remove("cursor-hover");
    }
  });
};


// ─── EYE FOLLOWER ───────────────────────────────────────────────────

const initEye = () => {
  const eye  = document.getElementById("eyeFollower");
  const iris = document.getElementById("eyeIris");
  if (!eye || !iris) return;
  document.addEventListener("mousemove", (e) => {
    const r  = eye.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const a  = Math.atan2(e.clientY - cy, e.clientX - cx);
    const d  = Math.min(8, Math.hypot(e.clientX - cx, e.clientY - cy) * 0.025);
    iris.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`;
  });
};


// ─── SCROLL REVEAL (IntersectionObserver) ────────────────────────────

const initReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -40px 0px"
  });

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


// ─── PARALLAX INDEX NUMBERS ──────────────────────────────────────────

const initParallax = () => {
  const indexes = document.querySelectorAll(".work-index");
  if (!indexes.length) return;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        indexes.forEach(el => {
          const rect = el.parentElement.getBoundingClientRect();
          const ratio = rect.top / window.innerHeight;
          el.style.transform = `translateY(${ratio * 50}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });
};


// ─── LIGHTBOX ───────────────────────────────────────────────────────

const initLightbox = () => {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.id = "lightbox";
  lb.innerHTML = `
    <button class="lightbox-close" aria-label="Close">×</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous">←</button>
    <img class="lightbox-img" id="lightboxImg" src="" alt="" />
    <button class="lightbox-nav lightbox-next" aria-label="Next">→</button>
    <span class="lightbox-counter" id="lightboxCounter"></span>
  `;
  document.body.appendChild(lb);

  const img      = document.getElementById("lightboxImg");
  const counter  = document.getElementById("lightboxCounter");
  const prevBtn  = lb.querySelector(".lightbox-prev");
  const nextBtn  = lb.querySelector(".lightbox-next");
  const closeBtn = lb.querySelector(".lightbox-close");

  let images = [];
  let idx    = 0;

  const update = () => {
    img.src = images[idx];
    img.alt = `Image ${idx + 1} of ${images.length}`;
    if (images.length > 1) {
      counter.textContent = `${idx + 1} / ${images.length}`;
      prevBtn.style.display = "";
      nextBtn.style.display = "";
      counter.style.display = "";
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
      counter.style.display = "none";
    }
  };

  const open = (srcs, startIdx) => {
    images = srcs;
    idx = startIdx || 0;
    update();
    lb.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lb.classList.remove("active");
    document.body.style.overflow = "";
  };

  const goPrev = () => { idx = (idx - 1 + images.length) % images.length; update(); };
  const goNext = () => { idx = (idx + 1) % images.length; update(); };

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); goPrev(); });
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); goNext(); });
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("active")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  });

  // Touch swipe in lightbox
  let tx = 0;
  lb.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) dx < 0 ? goNext() : goPrev();
  }, { passive: true });

  window.openLightbox = open;
};


// ─── LIGHTBOX TRIGGERS (click gallery images to open) ───────────────

const initLightboxTriggers = () => {
  document.querySelectorAll(".gallery-viewport").forEach(vp => {
    let sx = 0, sy = 0;

    vp.addEventListener("pointerdown", (e) => {
      sx = e.clientX;
      sy = e.clientY;
    });

    vp.addEventListener("pointerup", (e) => {
      const dx = Math.abs(e.clientX - sx);
      const dy = Math.abs(e.clientY - sy);
      if (dx > 8 || dy > 8) return; // was a drag

      // Collect real images (skip SVG placeholders)
      const imgs = vp.querySelectorAll(".gallery-slide img");
      if (!imgs.length) return;

      const sources = Array.from(imgs).map(i => i.src);

      // Figure out which slide is currently visible
      const track = vp.querySelector(".gallery-track");
      const t     = track ? (track.style.transform || "") : "";
      const m     = t.match(/translateX\(-(\d+)%\)/);
      const cur   = m ? Math.round(parseInt(m[1]) / 100) : 0;

      if (window.openLightbox) window.openLightbox(sources, cur);
    });
  });
};


// ─── MOUNT ──────────────────────────────────────────────────────────

const worksEl = document.getElementById("works");

if (worksEl) {
  // Build all post HTML at once
  let html    = "";
  let workNum = 0;

  posts.forEach((post, index) => {
    if (post.type !== "idea") workNum++;
    html += renderPost(post, index, workNum);
  });

  worksEl.innerHTML = html;

  // Init galleries after DOM is populated
  posts.forEach((post, index) => {
    if (post.type !== "idea") {
      const hasImg = post.images && post.images.length > 0;
      initGallery(`post-${index}`, hasImg ? post.images.length : 1);
    }
  });

  // Init lightbox click triggers on all gallery viewports
  initLightboxTriggers();
}

// Global inits — run on every page
initLightbox();
initCursor();
initEye();
initReveal();
initParallax();
initNavScroll();
