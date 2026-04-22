/* ═══════════════════════════════════════════════════════════════
   CATCH THE CREATURE — game logic
   CSS handles visuals; this just wires up state + random picks.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  const board   = document.getElementById("gameBoard");
  if (!board) return;

  const scoreEl   = document.getElementById("gameScore");
  const comboEl   = document.getElementById("gameCombo");
  const bestEl    = document.getElementById("gameBest");
  const timerEl   = document.getElementById("gameTimer");
  const timerBar  = document.getElementById("gameTimerBar");
  const timerWrap = timerBar.parentElement;
  const startBtn  = document.getElementById("gameStart");
  const againBtn  = document.getElementById("gameAgain");
  const overlay   = document.getElementById("gameOver");
  const finalEl   = document.getElementById("finalScore");
  const goMsg     = document.getElementById("goMsg");
  const creatures = Array.from(board.querySelectorAll(".cell-creature"));

  const DURATION  = 30;     // seconds
  const START_POP = 900;    // ms between pops at start
  const END_POP   = 380;    // ms at the end (faster)
  const UP_START  = 900;    // ms a creature stays up at start
  const UP_END    = 500;    // ms a creature stays up at end

  let score = 0, combo = 0, best = Number(localStorage.getItem("tako_best") || 0);
  let playing = false;
  let popTimer = null;
  let endTimer = null;
  let startedAt = 0;
  let lastCell = -1;

  const setScore = (n) => { score = n; scoreEl.textContent = n; };
  const setCombo = (n) => {
    combo = n;
    comboEl.textContent = `×${1 + Math.floor(combo / 3)}`;
    comboEl.parentElement.classList.toggle("is-hot", combo >= 3);
    if (combo >= 3) {
      comboEl.parentElement.classList.remove("is-hot");
      // retrigger animation
      void comboEl.parentElement.offsetWidth;
      comboEl.parentElement.classList.add("is-hot");
    }
  };
  bestEl.textContent = best;

  const randomCell = () => {
    let i = Math.floor(Math.random() * creatures.length);
    if (i === lastCell) i = (i + 1 + Math.floor(Math.random() * (creatures.length - 1))) % creatures.length;
    lastCell = i;
    return i;
  };

  const popOne = () => {
    if (!playing) return;
    const i = randomCell();
    const el = creatures[i];
    if (el.classList.contains("is-up") || el.classList.contains("is-hit")) return scheduleNext();
    el.classList.add("is-up");
    const elapsed = (Date.now() - startedAt) / 1000;
    const t = Math.min(1, elapsed / DURATION);
    const upFor = UP_START + (UP_END - UP_START) * t;
    setTimeout(() => {
      if (el.classList.contains("is-up") && !el.classList.contains("is-hit")) {
        // missed — combo break
        el.classList.remove("is-up");
        setCombo(0);
      }
    }, upFor);
    scheduleNext();
  };

  const scheduleNext = () => {
    const elapsed = (Date.now() - startedAt) / 1000;
    const t = Math.min(1, elapsed / DURATION);
    const gap = START_POP + (END_POP - START_POP) * t;
    popTimer = setTimeout(popOne, gap);
  };

  const onHit = (e) => {
    const btn = e.currentTarget;
    if (!playing || !btn.classList.contains("is-up") || btn.classList.contains("is-hit")) return;
    btn.classList.remove("is-up");
    btn.classList.add("is-hit");
    setCombo(combo + 1);
    const mult = 1 + Math.floor(combo / 3);
    setScore(score + mult);
    // floating +score
    const pop = document.createElement("span");
    pop.className = "score-pop";
    pop.textContent = `+${mult}`;
    btn.parentElement.appendChild(pop);
    setTimeout(() => pop.remove(), 900);
    setTimeout(() => btn.classList.remove("is-hit"), 500);
  };

  creatures.forEach(c => c.addEventListener("click", onHit));

  const tickTimer = () => {
    if (!playing) return;
    const elapsed = (Date.now() - startedAt) / 1000;
    const remaining = Math.max(0, DURATION - elapsed);
    timerEl.textContent = Math.ceil(remaining);
    if (remaining <= 0) return endGame();
    requestAnimationFrame(tickTimer);
  };

  const startGame = () => {
    score = 0; combo = 0; lastCell = -1;
    setScore(0); setCombo(0);
    timerEl.textContent = DURATION;
    creatures.forEach(c => c.classList.remove("is-up", "is-hit"));
    overlay.classList.remove("is-active");
    playing = true;
    startedAt = Date.now();
    timerWrap.style.setProperty("--duration", DURATION + "s");
    timerWrap.classList.remove("is-playing");
    void timerWrap.offsetWidth; // reflow to restart CSS anim
    timerWrap.classList.add("is-playing");
    startBtn.style.display = "none";
    requestAnimationFrame(tickTimer);
    endTimer = setTimeout(endGame, DURATION * 1000);
    scheduleNext();
  };

  const endGame = () => {
    playing = false;
    clearTimeout(popTimer);
    clearTimeout(endTimer);
    timerWrap.classList.remove("is-playing");
    creatures.forEach(c => c.classList.remove("is-up"));
    finalEl.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem("tako_best", best);
      bestEl.textContent = best;
      goMsg.textContent = "new high score !!! 🏆";
    } else if (score === 0) {
      goMsg.textContent = "...did you mean to play?";
    } else if (score < 10) {
      goMsg.textContent = "they were too quick for you.";
    } else if (score < 25) {
      goMsg.textContent = "not bad. you've got a good eye.";
    } else if (score < 50) {
      goMsg.textContent = "respectable. tako is impressed.";
    } else {
      goMsg.textContent = "absolute menace to fuzzy creatures.";
    }
    overlay.classList.add("is-active");
    startBtn.style.display = "inline-flex";
  };

  startBtn.addEventListener("click", startGame);
  againBtn.addEventListener("click", startGame);
})();
