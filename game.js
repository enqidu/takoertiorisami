/* ═══════════════════════════════════════════════════════════════
   MATCH THE PAINTINGS — memory game using Tamar's works
   ═══════════════════════════════════════════════════════════════ */

(function () {
  const board    = document.getElementById("matchBoard");
  if (!board) return;

  const movesEl  = document.getElementById("gameMoves");
  const pairsEl  = document.getElementById("gamePairs");
  const timeEl   = document.getElementById("gameTime");
  const bestEl   = document.getElementById("gameBest");
  const startBtn = document.getElementById("gameStart");
  const againBtn = document.getElementById("gameAgain");
  const overlay  = document.getElementById("gameOver");
  const finalM   = document.getElementById("finalMoves");
  const finalT   = document.getElementById("finalTime");
  const goMsg    = document.getElementById("goMsg");

  const posts = (window.POSTS || []).filter(p => p.images && p.images.length > 0);
  // Fixed 4×4 board: 8 pairs = 16 cards. Each game picks 8 random
  // images from the available posts.
  const PAIRS = Math.min(8, posts.length);

  let moves = 0, found = 0, startedAt = 0, timerId = null;
  let flipped = [];        // currently face-up cards awaiting resolution
  let locked = false;      // during 2-card compare
  let best = Number(localStorage.getItem("tako_match_best") || 0);
  bestEl.textContent = best ? `${best} moves` : "—";

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const pickImages = () => {
    const imgs = posts.map(p => p.images[0]);
    return shuffle(imgs).slice(0, PAIRS);
  };

  const fmtTime = (s) => s < 60 ? `${s}s` : `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const tick = () => {
    const s = Math.floor((Date.now() - startedAt) / 1000);
    timeEl.textContent = fmtTime(s);
  };

  const setMoves = (n) => { moves = n; movesEl.textContent = n; };
  const setPairs = (n) => { found = n; pairsEl.textContent = `${n}/${PAIRS}`; };

  const buildBoard = () => {
    const imgs = pickImages();
    const deck = shuffle([...imgs, ...imgs]); // pairs

    board.innerHTML = deck.map((src, i) => `
      <button class="match-card" data-src="${src}" data-i="${i}" aria-label="card">
        <span class="card-inner">
          <span class="card-back">
            <svg viewBox="0 0 100 100"><g style="color: var(--bubble)"><use href="#creature"/></g></svg>
          </span>
          <span class="card-front">
            <img src="${src}" alt="" loading="lazy" draggable="false"/>
          </span>
        </span>
      </button>
    `).join("");

    board.querySelectorAll(".match-card").forEach(c => c.addEventListener("click", onCardClick));
  };

  const onCardClick = (e) => {
    const card = e.currentTarget;
    if (locked) return;
    if (card.classList.contains("is-flip") || card.classList.contains("is-matched")) return;

    card.classList.add("is-flip");
    flipped.push(card);

    if (flipped.length === 2) {
      setMoves(moves + 1);
      locked = true;
      const [a, b] = flipped;
      if (a.dataset.src === b.dataset.src) {
        setTimeout(() => {
          a.classList.add("is-matched");
          b.classList.add("is-matched");
          flipped = [];
          locked = false;
          setPairs(found + 1);
          if (found === PAIRS) endGame();
        }, 380);
      } else {
        setTimeout(() => {
          a.classList.remove("is-flip");
          b.classList.remove("is-flip");
          flipped = [];
          locked = false;
        }, 780);
      }
    }
  };

  const startGame = () => {
    setMoves(0);
    setPairs(0);
    timeEl.textContent = "0s";
    overlay.classList.remove("is-active");
    flipped = []; locked = false;
    buildBoard();
    startedAt = Date.now();
    clearInterval(timerId);
    timerId = setInterval(tick, 250);
    startBtn.style.display = "none";
  };

  const endGame = () => {
    clearInterval(timerId);
    const s = Math.floor((Date.now() - startedAt) / 1000);
    finalM.textContent = moves;
    finalT.textContent = fmtTime(s);
    if (!best || moves < best) {
      best = moves;
      localStorage.setItem("tako_match_best", best);
      bestEl.textContent = `${best} moves`;
      goMsg.textContent = "new personal best! 🏆";
    } else if (moves <= PAIRS + 2) {
      goMsg.textContent = "freakishly good memory.";
    } else if (moves <= PAIRS + 6) {
      goMsg.textContent = "respectable. tako is impressed.";
    } else if (moves <= PAIRS + 12) {
      goMsg.textContent = "you got there in the end.";
    } else {
      goMsg.textContent = "the creatures remember you.";
    }
    overlay.classList.add("is-active");
    startBtn.style.display = "inline-flex";
  };

  startBtn.addEventListener("click", startGame);
  againBtn.addEventListener("click", startGame);

  // build an initial (un-started) board so the page isn't empty
  buildBoard();
  setPairs(0);
})();
