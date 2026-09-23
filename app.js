(() => {
  "use strict";

  const STORAGE_COUNTS = "hanuman-app:counts:v1";
  const STORAGE_POS = "hanuman-app:pos:v1";
  const STORAGE_TEXT = "hanuman-app:lasttext:v1";
  const STORAGE_SEEN_INTRO = "hanuman-app:seenintro:v1";
  const STORAGE_SPEED = "hanuman-app:speed:v1";
  const STORAGE_MALA = "hanuman-app:mala:v1";
  const STORAGE_VIEW = "hanuman-app:view:v1";
  const CHALISA_VIDEO_ID = "BLlTFapgvOo";
  const BEADS_PER_MALA = 108;

  const TEXT_IDS = Object.keys(TEXTS);

  const els = {
    body: document.body,
    cardWrap: document.getElementById("cardWrap"),
    progress: document.getElementById("progress"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    translateBtn: document.getElementById("translateBtn"),
    learnBtn: document.getElementById("learnBtn"),
    completeBtn: document.getElementById("completeBtn"),
    stanzaCount: document.getElementById("stanzaCount"),
    tabs: Array.from(document.querySelectorAll(".tab")),
    countBtn: document.getElementById("countBtn"),
    countBadge: document.getElementById("countBadge"),
    aboutBtn: document.getElementById("aboutBtn"),
    introOverlay: document.getElementById("introOverlay"),
    introEnterBtn: document.getElementById("introEnterBtn"),
    toast: document.getElementById("toast"),
    sheet: document.getElementById("countSheet"),
    countRows: document.getElementById("countRows"),
    resetCountBtn: document.getElementById("resetCountBtn"),
    closeSheetBtn: document.getElementById("closeSheetBtn"),
    hint: document.getElementById("swipeHint"),
    speedSelect: document.getElementById("learnSpeed"),
    malaStrand: document.getElementById("malaStrand"),
    malaBeads: document.getElementById("malaBeads"),
    beadCount: document.getElementById("beadCount"),
    malaCount: document.getElementById("malaCount"),
    malaTotal: document.getElementById("malaTotal"),
    malaUndoBtn: document.getElementById("malaUndoBtn"),
    malaResetBtn: document.getElementById("malaResetBtn"),
  };

  function loadSpeed() {
    const v = parseFloat(localStorage.getItem(STORAGE_SPEED));
    return isFinite(v) && v > 0 ? v : 0.75;
  }
  let learnRate = loadSpeed();
  if (els.speedSelect) {
    els.speedSelect.value = String(learnRate);
    els.speedSelect.addEventListener("change", () => {
      learnRate = parseFloat(els.speedSelect.value) || 0.75;
      try {
        localStorage.setItem(STORAGE_SPEED, String(learnRate));
      } catch (e) {}
      if (ytPlayer && ytPlaying) {
        try {
          ytPlayer.setPlaybackRate(learnRate);
        } catch (e) {}
      }
    });
  }

  function emptyCountMap() {
    const m = {};
    TEXT_IDS.forEach((id) => {
      m[id] = 0;
    });
    return m;
  }

  function loadCounts() {
    try {
      const raw = localStorage.getItem(STORAGE_COUNTS);
      if (raw) return Object.assign(emptyCountMap(), JSON.parse(raw));
    } catch (e) {}
    return emptyCountMap();
  }
  function saveCounts(counts) {
    try {
      localStorage.setItem(STORAGE_COUNTS, JSON.stringify(counts));
    } catch (e) {}
  }
  function loadPos() {
    try {
      const raw = localStorage.getItem(STORAGE_POS);
      if (raw) return Object.assign(emptyCountMap(), JSON.parse(raw));
    } catch (e) {}
    return emptyCountMap();
  }
  function savePos(pos) {
    try {
      localStorage.setItem(STORAGE_POS, JSON.stringify(pos));
    } catch (e) {}
  }
  function loadMala() {
    try {
      const m = JSON.parse(localStorage.getItem(STORAGE_MALA));
      if (m) {
        return {
          beads: Math.min(Math.max(m.beads | 0, 0), BEADS_PER_MALA),
          malas: Math.max(m.malas | 0, 0),
        };
      }
    } catch (e) {}
    return { beads: 0, malas: 0 };
  }
  function saveMala(mala) {
    try {
      localStorage.setItem(STORAGE_MALA, JSON.stringify(mala));
    } catch (e) {}
  }
  function loadMalaMode() {
    try {
      return localStorage.getItem(STORAGE_VIEW) === "mala";
    } catch (e) {
      return false;
    }
  }

  const state = {
    textId: localStorage.getItem(STORAGE_TEXT) || "ramstuti",
    index: 0,
    showTranslation: false,
    counts: loadCounts(),
    pos: loadPos(),
    seenLast: false, // whether user has reached last stanza this pass
    mala: loadMala(), // beads: 0..108 on the current mala, malas: completed rounds
    malaMode: loadMalaMode(),
  };
  state.index = state.pos[state.textId] || 0;

  function currentText() {
    return TEXTS[state.textId];
  }
  function currentStanza() {
    return currentText().stanzas[state.index];
  }

  // ---------------- rendering ----------------
  let activeCardEl = null;

  function buildCard(stanza) {
    const card = document.createElement("div");
    card.className = "stanza-card";
    const tag =
      stanza.type === "doha"
        ? "Doha"
        : stanza.type === "invocation"
          ? "Invocation"
          : `Verse ${stanza.n}`;
    const lines = stanza.text
      .split("\n")
      .map((l) => `<span class="stanza-line">${escapeHtml(l)}</span>`)
      .join("<br>");
    card.innerHTML = `
      <div class="stanza-header">
        <div class="stanza-tag">${tag}</div>
        <button class="card-learn-btn" type="button">Learn</button>
      </div>
      <div class="stanza-body">
        <div class="stanza-text">${lines}</div>
        <div class="stanza-meaning${state.showTranslation ? " visible" : ""}">${escapeHtml(stanza.meaning)}</div>
      </div>
    `;
    card
      .querySelector(".card-learn-btn")
      .addEventListener("click", () => toggleLearn(stanza, card));
    return card;
  }

  function escapeHtml(str) {
    return str.replace(
      /[&<>]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
    );
  }

  function renderInitial() {
    els.cardWrap.innerHTML = "";
    activeCardEl = buildCard(currentStanza());
    els.cardWrap.appendChild(activeCardEl);
    renderProgress();
    renderMeta();
    renderTabs();
  }

  function renderProgress() {
    const stanzas = currentText().stanzas;
    els.progress.innerHTML = "";
    stanzas.forEach((_, i) => {
      const s = document.createElement("span");
      if (i <= state.index) s.classList.add("done");
      els.progress.appendChild(s);
    });
  }

  function renderMeta() {
    const stanzas = currentText().stanzas;
    els.stanzaCount.textContent = `${state.index + 1} / ${stanzas.length}`;
    els.translateBtn.classList.toggle("active", state.showTranslation);
  }

  function renderTabs() {
    els.tabs.forEach((t) => {
      const active = state.malaMode
        ? t.dataset.text === "mala"
        : t.dataset.text === state.textId;
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    els.body.setAttribute("data-theme", state.malaMode ? "mala" : state.textId);
    els.body.classList.toggle("mala-mode", state.malaMode);
  }

  // ---------------- navigation ----------------
  let animating = false;

  function goTo(newIndex, direction) {
    // direction: 1 = next (card exits left, new enters from right), -1 = prev
    if (animating) return;
    if (learning) stopLearn();
    const stanzas = currentText().stanzas;
    const wrapped = newIndex >= stanzas.length || newIndex < 0;

    if (wrapped && direction === 1) {
      completeReading();
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = 0;
      return; // no-op at start
    }

    animating = true;
    const outEl = activeCardEl;
    const newCard = buildCard(stanzas[newIndex]);
    newCard.style.transform =
      direction === 1
        ? "translateX(28px) scale(0.96)"
        : "translateX(-28px) scale(0.96)";
    newCard.style.opacity = "0";
    els.cardWrap.appendChild(newCard);

    requestAnimationFrame(() => {
      outEl.style.transform =
        direction === 1
          ? "translateX(-110%) rotate(-4deg)"
          : "translateX(110%) rotate(4deg)";
      outEl.style.opacity = "0";
      newCard.style.transform = "translateX(0) scale(1)";
      newCard.style.opacity = "1";
    });

    setTimeout(() => {
      outEl.remove();
      activeCardEl = newCard;
      animating = false;
    }, 360);

    state.index = newIndex;
    state.pos[state.textId] = state.index;
    savePos(state.pos);
    renderProgress();
    renderMeta();
    hideHintOnce();
  }

  function nextStanza() {
    goTo(state.index + 1, 1);
  }
  function prevStanza() {
    if (state.index === 0) return;
    goTo(state.index - 1, -1);
  }

  function completeReading() {
    const id = state.textId;
    state.counts[id] = (state.counts[id] || 0) + 1;
    saveCounts(state.counts);
    updateCountBadge();
    const title = currentText().title;
    showToast(
      `🙏 ${title} complete — ${state.counts[id]} time${state.counts[id] === 1 ? "" : "s"}`,
    );
  }

  function markCompleteManually() {
    completeReading();
    goTo(0, -1);
  }

  // ---------------- translation ----------------
  function toggleTranslation() {
    state.showTranslation = !state.showTranslation;
    const m = activeCardEl.querySelector(".stanza-meaning");
    if (m) m.classList.toggle("visible", state.showTranslation);
    renderMeta();
  }

  // ---------------- switching text ----------------
  function switchText(id) {
    if (animating) return;
    if (id === "mala") {
      setMalaMode(true);
      return;
    }
    if (state.malaMode) setMalaMode(false);
    if (id === state.textId) return;
    if (learning) stopLearn();
    state.textId = id;
    state.index = state.pos[id] || 0;
    localStorage.setItem(STORAGE_TEXT, id);
    els.cardWrap.innerHTML = "";
    activeCardEl = buildCard(currentStanza());
    els.cardWrap.appendChild(activeCardEl);
    renderProgress();
    renderMeta();
    renderTabs();
    updateCountBadge();
  }

  // ---------------- naam jap mala ----------------
  // The strand shows 5 beads; slot 2 is the centre (current) bead. Slots outside 0..4
  // are invisible parking spots that beads slide in from / out to.
  // [scale, opacity] per slot; the centre bead is largest.
  const BEAD_SLOTS = {
    "-2": [0.2, 0],
    "-1": [0.6, 0],
    0: [0.75, 1],
    1: [0.9, 1],
    2: [1, 1],
    3: [0.9, 1],
    4: [0.75, 1],
    5: [0.6, 0],
    6: [0.2, 0],
  };
  const BEAD_SIZE = 0.2; // full-size bead diameter as a fraction of strand height (matches .bead width in CSS)
  const BEAD_GAP = 0.02; // space between neighbouring beads, same units

  // Stack beads outward from the centre so neighbours never overlap, whatever the scales are.
  const BEAD_TOPS = { 2: 50 };
  for (let s = 3; s <= 6; s++) {
    const step =
      (BEAD_SIZE * (BEAD_SLOTS[s - 1][0] + BEAD_SLOTS[s][0])) / 2 + BEAD_GAP;
    BEAD_TOPS[s] = BEAD_TOPS[s - 1] + step * 100;
    BEAD_TOPS[4 - s] = 100 - BEAD_TOPS[s]; // mirror above the centre
  }
  const beadEls = new Map(); // absolute bead number -> element

  function malaTotal() {
    const { beads, malas } = state.mala;
    return malas * BEADS_PER_MALA + (beads % BEADS_PER_MALA);
  }

  function placeBead(el, slot) {
    const [scale, opacity] = BEAD_SLOTS[slot];
    el.style.top = `${BEAD_TOPS[slot]}%`;
    el.style.transform = `translate(-50%, -50%) scale(${scale})`;
    el.style.opacity = opacity;
    el.style.filter = `brightness(${0.55 + 0.45 * scale})`; // farther beads sit in shadow
    el.style.zIndex = 10 - Math.abs(slot - 2);
    el.classList.toggle("current", slot === 2);
  }

  function renderStrand() {
    // bead n sits at slot 2 - (n - total): upcoming beads above, counted beads below
    const total = malaTotal();
    for (let n = total - 3; n <= total + 3; n++) {
      let el = beadEls.get(n);
      if (!el) {
        el = document.createElement("span");
        el.className = n % BEADS_PER_MALA === 0 ? "bead guru" : "bead";
        placeBead(el, 2 - (n - total));
        els.malaBeads.appendChild(el);
        beadEls.set(n, el);
      }
    }
    beadEls.forEach((el, n) => {
      const slot = 2 - (n - total);
      if (slot >= -1 && slot <= 5) {
        placeBead(el, slot);
        return;
      }
      // one step out of range: slide off the strand, then drop; further out (undo/reset jumps): drop now
      beadEls.delete(n);
      if (slot === -2 || slot === 6) {
        placeBead(el, slot);
        setTimeout(() => el.remove(), 400);
      } else {
        el.remove();
      }
    });
  }

  function renderMala() {
    const { beads, malas } = state.mala;
    renderStrand();
    els.beadCount.textContent = beads;
    els.malaCount.textContent = malas.toLocaleString();
    els.malaTotal.textContent = (
      malas * BEADS_PER_MALA +
      (beads % BEADS_PER_MALA)
    ).toLocaleString();
    els.malaUndoBtn.disabled = beads === 0;
  }

  function buzz(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {}
  }

  function countBead() {
    const m = state.mala;
    if (m.beads >= BEADS_PER_MALA) m.beads = 0; // start the next round after a full mala
    m.beads++;
    if (m.beads === BEADS_PER_MALA) {
      m.malas++;
      buzz([60, 60, 160]);
      showToast(
        `📿 Mala complete — ${m.malas} mala${m.malas === 1 ? "" : "s"}`,
      );
      els.malaStrand.classList.remove("complete");
      void els.malaStrand.offsetWidth; // restart the glow animation
      els.malaStrand.classList.add("complete");
    } else {
      buzz(12);
    }
    saveMala(m);
    renderMala();
  }

  function undoBead() {
    const m = state.mala;
    if (m.beads === 0) return;
    if (m.beads === BEADS_PER_MALA) m.malas--;
    // bead 1 of a later round was preceded by a full mala — step back onto it
    m.beads = m.beads === 1 && m.malas > 0 ? BEADS_PER_MALA : m.beads - 1;
    saveMala(m);
    renderMala();
  }

  function resetMala() {
    if (!confirm("Reset your bead and mala counts to zero?")) return;
    state.mala = { beads: 0, malas: 0 };
    saveMala(state.mala);
    renderMala();
  }

  function setMalaMode(on) {
    if (on && learning) stopLearn();
    state.malaMode = on;
    try {
      localStorage.setItem(STORAGE_VIEW, on ? "mala" : "text");
    } catch (e) {}
    renderTabs();
    if (on) renderMala();
  }

  // ---------------- count sheet ----------------
  function updateCountBadge() {
    const total = TEXT_IDS.reduce(
      (sum, id) => sum + (state.counts[id] || 0),
      0,
    );
    els.countBadge.textContent = total;
  }

  function renderCountSheet() {
    els.countRows.innerHTML = "";
    Object.values(TEXTS).forEach((t) => {
      const row = document.createElement("div");
      row.className = "count-row";
      row.innerHTML = `<span class="name">${t.title}</span><span class="num">${state.counts[t.id] || 0}</span>`;
      els.countRows.appendChild(row);
    });
  }

  function openSheet() {
    renderCountSheet();
    els.sheet.classList.add("open");
  }
  function closeSheet() {
    els.sheet.classList.remove("open");
  }

  // ---------------- toast ----------------
  let toastTimer = null;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 3200);
  }

  function hideHintOnce() {
    if (!els.hint.classList.contains("hide")) els.hint.classList.add("hide");
  }

  // ---------------- YouTube chant audio (Chalisa Learn mode) ----------------
  let ytPlayer = null,
    ytReady = false,
    ytPlaying = false;
  const ytTimers = [];

  window.onYouTubeIframeAPIReady = function () {
    try {
      ytPlayer = new YT.Player("ytPlayerMount", {
        height: "1",
        width: "1",
        videoId: CHALISA_VIDEO_ID,
        playerVars: { controls: 0, disablekb: 1, playsinline: 1 },
        events: {
          onReady: () => {
            ytReady = true;
          },
        },
      });
    } catch (e) {
      /* YT unavailable (offline/blocked) — Learn falls back to TTS */
    }
  };

  function clearYtTimers() {
    ytTimers.forEach((id) => clearTimeout(id));
    ytTimers.length = 0;
  }

  function stopYtLearn() {
    ytPlaying = false;
    clearYtTimers();
    if (ytPlayer) {
      try {
        ytPlayer.pauseVideo();
      } catch (e) {}
    }
  }

  function startLearnYouTube(stanza, cardEl) {
    const stanzas = currentText().stanzas;
    const idx = stanzas.indexOf(stanza);
    const endT =
      idx >= 0 && idx < stanzas.length - 1 ? stanzas[idx + 1].t : CHALISA_END_T;
    const startT = stanza.t;
    const duration = Math.max(endT - startT, 1);

    learning = true;
    ytPlaying = true;
    setLearnUI(true);
    const myToken = ++learnToken;
    const lineEls = Array.from(cardEl.querySelectorAll(".stanza-line"));

    try {
      ytPlayer.seekTo(startT, true);
      ytPlayer.setPlaybackRate(learnRate);
      ytPlayer.playVideo();
    } catch (e) {
      stopLearn();
      showToast("Couldn't start chant audio — check your connection");
      return;
    }

    lineEls.forEach((el, i) => {
      const offset = (duration * i) / lineEls.length;
      const delay = (offset / learnRate) * 1000;
      ytTimers.push(
        setTimeout(() => {
          if (myToken !== learnToken) return;
          lineEls.forEach((el2) => el2.classList.remove("active"));
          el.classList.add("active");
          el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }, delay),
      );
    });

    ytTimers.push(
      setTimeout(
        () => {
          if (myToken !== learnToken) return;
          stopLearn();
        },
        (duration / learnRate) * 1000,
      ),
    );
  }

  // ---------------- learn mode (browser text-to-speech + a soft generated drone) ----------------
  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  let learning = false;
  let learnToken = 0; // increments on every stop/stanza-change so stale async callbacks no-op
  let audioCtx = null,
    droneGain = null,
    droneOscillators = [];

  function startDrone() {
    try {
      if (audioCtx) return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
      droneGain = audioCtx.createGain();
      droneGain.gain.value = 0;
      droneGain.connect(audioCtx.destination);
      // a soft sustained root + fifth, tanpura-like — generated tone, not a recording
      droneOscillators = [110, 165].map((freq) => {
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(droneGain);
        osc.start();
        return osc;
      });
      droneGain.gain.linearRampToValueAtTime(0.045, audioCtx.currentTime + 1.2);
    } catch (e) {
      /* ambient drone is a nice-to-have; ignore failures */
    }
  }

  function stopDrone() {
    if (!audioCtx) return;
    try {
      const ctx = audioCtx,
        gain = droneGain,
        oscs = droneOscillators;
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
      setTimeout(() => {
        oscs.forEach((o) => {
          try {
            o.stop();
          } catch (e) {}
        });
        try {
          ctx.close();
        } catch (e) {}
      }, 750);
    } catch (e) {}
    audioCtx = null;
    droneGain = null;
    droneOscillators = [];
  }

  function setLearnUI(active) {
    els.learnBtn.classList.toggle("active", active);
    els.learnBtn.querySelector(".pill-label").textContent = active
      ? "Stop"
      : "Learn";
    const cardBtn =
      activeCardEl && activeCardEl.querySelector(".card-learn-btn");
    if (cardBtn) {
      cardBtn.classList.toggle("active", active);
      cardBtn.textContent = active ? "Stop" : "Learn";
    }
  }

  function stopLearn() {
    learnToken++; // invalidate any in-flight speakNext/timer chain
    learning = false;
    if (speechSupported) window.speechSynthesis.cancel();
    stopDrone();
    stopYtLearn();
    document
      .querySelectorAll(".stanza-line.active")
      .forEach((el) => el.classList.remove("active"));
    setLearnUI(false);
  }

  function startLearn(stanza, cardEl) {
    if (state.textId === "chalisa" && ytReady && typeof stanza.t === "number") {
      startLearnYouTube(stanza, cardEl);
      return;
    }
    if (!speechSupported) {
      showToast("Voice guidance isn't supported on this browser");
      return;
    }
    window.speechSynthesis.cancel();
    learning = true;
    setLearnUI(true);
    startDrone();
    const myToken = ++learnToken;
    const lineEls = Array.from(cardEl.querySelectorAll(".stanza-line"));
    let i = 0;

    function speakNext() {
      if (myToken !== learnToken) return; // superseded by stop/navigation
      lineEls.forEach((el) => el.classList.remove("active"));
      if (i >= lineEls.length) {
        stopLearn();
        return;
      }
      const lineEl = lineEls[i];
      lineEl.classList.add("active");
      lineEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      const utter = new SpeechSynthesisUtterance(lineEl.textContent);
      utter.rate = learnRate;
      utter.pitch = 1.0;
      utter.onend = () => {
        if (myToken === learnToken) {
          i++;
          speakNext();
        }
      };
      utter.onerror = () => {
        if (myToken === learnToken) {
          i++;
          speakNext();
        }
      };
      window.speechSynthesis.speak(utter);
    }
    speakNext();
  }

  function toggleLearn(stanza, cardEl) {
    if (learning) stopLearn();
    else startLearn(stanza, cardEl);
  }

  // ---------------- intro / about overlay ----------------
  function openIntro() {
    els.introOverlay.classList.add("open");
  }
  function closeIntro() {
    els.introOverlay.classList.remove("open");
    try {
      localStorage.setItem(STORAGE_SEEN_INTRO, "1");
    } catch (e) {}
  }

  // ---------------- swipe gestures ----------------
  let startX = 0,
    startY = 0,
    dragging = false,
    dragged = false;

  els.cardWrap.addEventListener("pointerdown", (e) => {
    if (animating) return;
    if (e.target.closest(".nav-arrow")) return;
    startX = e.clientX;
    startY = e.clientY;
    dragging = true;
    dragged = false;
    activeCardEl.style.transition = "none";
  });

  els.cardWrap.addEventListener("pointermove", (e) => {
    if (!dragging || animating) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    if (Math.abs(dy) > Math.abs(dx) * 1.3) return; // vertical scroll intent
    dragged = true;
    activeCardEl.style.transform = `translateX(${dx}px) rotate(${dx / 30}deg)`;
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    if (!dragged) return;
    const dx = (e.clientX || 0) - startX;
    activeCardEl.style.transition = "";
    const threshold = 80;
    if (dx <= -threshold) {
      nextStanza();
    } else if (dx >= threshold) {
      prevStanza();
    } else {
      activeCardEl.style.transform = "";
    }
  }
  els.cardWrap.addEventListener("pointerup", endDrag);
  els.cardWrap.addEventListener("pointercancel", endDrag);
  els.cardWrap.addEventListener("pointerleave", (e) => {
    if (dragging && dragged) endDrag(e);
  });

  // ---------------- wire up controls ----------------
  els.prevBtn.addEventListener("click", prevStanza);
  els.nextBtn.addEventListener("click", nextStanza);
  els.translateBtn.addEventListener("click", toggleTranslation);
  els.learnBtn.addEventListener("click", () =>
    toggleLearn(currentStanza(), activeCardEl),
  );
  els.completeBtn.addEventListener("click", markCompleteManually);
  els.aboutBtn.addEventListener("click", openIntro);
  els.introEnterBtn.addEventListener("click", closeIntro);
  els.introOverlay.addEventListener("click", (e) => {
    if (e.target === els.introOverlay) closeIntro();
  });
  els.countBtn.addEventListener("click", openSheet);
  els.closeSheetBtn.addEventListener("click", closeSheet);
  els.sheet.addEventListener("click", (e) => {
    if (e.target === els.sheet) closeSheet();
  });
  els.resetCountBtn.addEventListener("click", () => {
    if (confirm("Reset all reading counts to zero?")) {
      state.counts = emptyCountMap();
      saveCounts(state.counts);
      updateCountBadge();
      renderCountSheet();
    }
  });
  els.tabs.forEach((t) =>
    t.addEventListener("click", () => switchText(t.dataset.text)),
  );
  // swipe the strand down to pull the next bead, like drawing a real mala through the fingers
  let malaStartY = null;
  const MALA_PULL = 36; // px of downward drag that counts as one bead

  els.malaStrand.addEventListener("pointerdown", (e) => {
    malaStartY = e.clientY;
    els.malaStrand.setPointerCapture(e.pointerId);
    els.malaBeads.style.transition = "none";
  });
  els.malaStrand.addEventListener("pointermove", (e) => {
    if (malaStartY === null) return;
    const dy = Math.max(0, e.clientY - malaStartY);
    els.malaBeads.style.transform = `translateY(${Math.min(dy, 70) * 0.5}px)`;
  });
  function endMalaDrag(e) {
    if (malaStartY === null) return;
    const dy = e.clientY - malaStartY;
    malaStartY = null;
    els.malaBeads.style.transition = "";
    els.malaBeads.style.transform = "";
    if (e.type === "pointerup" && dy >= MALA_PULL) countBead();
  }
  els.malaStrand.addEventListener("pointerup", endMalaDrag);
  els.malaStrand.addEventListener("pointercancel", endMalaDrag);
  els.malaUndoBtn.addEventListener("click", undoBead);
  els.malaResetBtn.addEventListener("click", resetMala);

  document.addEventListener("keydown", (e) => {
    if (state.malaMode) {
      // space/enter/arrow-down count a bead; focused buttons already handle their own keys
      const countKey =
        e.key === " " || e.key === "Enter" || e.key === "ArrowDown";
      if (countKey && !e.target.closest("button, select, input, summary")) {
        e.preventDefault();
        countBead();
      }
      return;
    }
    if (e.key === "ArrowRight") nextStanza();
    if (e.key === "ArrowLeft") prevStanza();
  });

  // ---------------- init ----------------
  renderMala();
  renderInitial();
  updateCountBadge();
  let seenIntro = false;
  try {
    seenIntro = localStorage.getItem(STORAGE_SEEN_INTRO) === "1";
  } catch (e) {}
  if (!seenIntro) openIntro();
})();
