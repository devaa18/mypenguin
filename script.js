/* =========================================================
   BIRTHDAY PROTOCOL — engine + Episode 01 content
   ---------------------------------------------------------
   HOW THIS IS ORGANIZED
   1) EPISODE      -> all the text/numbers for THIS episode.
                       To write Episode 2, mostly edit this.
   2) ENGINE UTILS -> reusable helpers (typewriter, screen
                       transitions, character rendering).
                       Should rarely need to change per episode.
   3) SCREEN LOGIC -> the per-screen init functions that wire
                       EPISODE content into the DOM using the
                       engine utils above.
   ========================================================= */

/* ---------------------------------------------------------
   1) EPISODE CONTENT
   --------------------------------------------------------- */
const EPISODE = {
  number: 1,
  birthdayDate: "24 NOVEMBER",
  daysRemaining: 50,

  bootLines: [
    { text: "> INITIALIZING PROTOCOL...", pause: 500 },
    { text: "> Running routine diagnostics...", pause: 450 },
    { text: "> Checking calendar...", pause: 650, glitch: true },
    { text: "⚠ Anomaly detected.", pause: 750, warn: true },
    { text: "Something is approaching.", pause: 500 },
  ],

  countdownLines: [
    "Protocol threshold reached.",
    "Birthday Protocol is now authorized.",
  ],

  foxLine1: "Who authorized this?",
  foxName: "THE FOX.",
  foxLine2: "Reason for initiation: CLASSIFIED",

  classifiedDoc:
`FILE: BIRTHDAY_PROTOCOL.docx
CLEARANCE: EYES ONLY
AGENT: THE FOX
OBJECTIVE: ██████████
RISK LEVEL: MODERATE
  (to The Fox's dignity)

NOTES:
This will make sense later.
Probably.`,

  announceLines: [
    "That's all you're getting for now.",
    "Protocol initiated. Further details are none of your business. Yet.",
    "Next transmission: classified.",
  ],

  ackResponse: "Good.\nYou may continue with your regularly scheduled Penguin activities.",

  easterEggLines: ["Stop investigating.", "Nice try.", "Nothing to see here."],
};

/* ---------------------------------------------------------
   2) ENGINE UTILS
   --------------------------------------------------------- */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** Types text into a fresh line inside `container`, char by char. */
function typeLine(container, text, opts = {}) {
  const { speed = 26, warn = false } = opts;
  return new Promise((resolve) => {
    const line = document.createElement("div");
    line.className = "term-line" + (warn ? " warn" : "");
    const textSpan = document.createElement("span");
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    line.appendChild(textSpan);
    line.appendChild(cursor);
    container.appendChild(line);
    container.scrollTop = container.scrollHeight;

    let i = 0;
    function step() {
      if (i < text.length) {
        textSpan.textContent = text.slice(0, i + 1);
        i++;
        container.scrollTop = container.scrollHeight;
        setTimeout(step, speed);
      } else {
        cursor.remove();
        resolve();
      }
    }
    step();
  });
}

/** Types a single message into a `.system-line` container, replacing prior content. */
async function showSystemMessage(containerId, text, opts) {
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  await typeLine(el, text, opts);
}

/** Reveals the "tap to continue" prompt for a screen and wires its action. */
function showContinue(buttonId, onTap) {
  const btn = document.getElementById(buttonId);
  btn.hidden = false;
  requestAnimationFrame(() => btn.classList.add("show"));
  btn.onclick = () => {
    btn.classList.remove("show");
    onTap();
  };
}

/** Swaps the active screen with a simple fade/slide transition. */
function transitionToScreen(id) {
  const current = document.querySelector(".screen.active");
  const next = document.getElementById("screen-" + id);
  if (!next || current === next) return;
  if (current) current.classList.remove("active");
  next.classList.add("active");
  next.scrollTop = 0;
  if (!next.dataset.inited) {
    next.dataset.inited = "1";
    initScreen(id);
  }
}

function initScreen(id) {
  const map = {
    identify: initIdentifyScreen,
    countdown: initCountdownScreen,
    fox: initFoxScreen,
    announce: initAnnounceScreen,
    end: initEndScreen,
  };
  if (map[id]) map[id]();
}

/* ---- character rendering (SVG built in JS so mood classes can
   toggle sub-parts without duplicating markup across screens) ---- */

function svgPenguin() {
  return `
  <svg class="penguin-root" viewBox="0 0 200 210" data-mood="neutral">
    <g>
      <ellipse class="flipper left"  cx="26" cy="118" rx="16" ry="40" fill="#141a24" stroke="#57d9e8" stroke-width="1.5"/>
      <ellipse class="flipper right" cx="174" cy="118" rx="16" ry="40" fill="#141a24" stroke="#57d9e8" stroke-width="1.5"/>
      <path d="M100 18 C56 18 34 55 34 102 C34 150 58 186 100 186 C142 186 166 150 166 102 C166 55 144 18 100 18 Z"
            fill="#101620" stroke="#57d9e8" stroke-width="2.5"/>
      <path d="M100 58 C74 58 60 82 60 112 C60 148 78 172 100 172 C122 172 140 148 140 112 C140 82 126 58 100 58 Z"
            fill="#f6f9fb"/>
      <ellipse class="foot" cx="80" cy="190" rx="15" ry="8" fill="#f0a83e"/>
      <ellipse class="foot" cx="120" cy="190" rx="15" ry="8" fill="#f0a83e"/>
      <ellipse class="cheek" cx="76" cy="128" rx="10" ry="6.5" fill="#ff9b7a" opacity="0.55"/>
      <ellipse class="cheek" cx="124" cy="128" rx="10" ry="6.5" fill="#ff9b7a" opacity="0.55"/>
      <path class="brow" d="M68 90 q10 -9 20 -2" stroke="#101620" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <g>
        <circle class="pupil" cx="82" cy="104" r="8.5" fill="#141922"/>
        <circle class="pupil-shine" cx="79" cy="100.5" r="2.6" fill="#fff"/>
        <rect class="eyelid" x="70" y="88" width="26" height="24" rx="10" fill="#f6f9fb"/>
      </g>
      <g>
        <circle class="pupil" cx="118" cy="104" r="8.5" fill="#141922"/>
        <circle class="pupil-shine" cx="115" cy="100.5" r="2.6" fill="#fff"/>
        <rect class="eyelid delay" x="106" y="88" width="26" height="24" rx="10" fill="#f6f9fb"/>
      </g>
      <path d="M90 122 Q100 138 110 122 Q100 112 90 122 Z" fill="#f0a83e"/>
      <path class="smile-line" d="M86 136 Q100 148 114 136" stroke="#c97f1e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <text class="qmark" x="128" y="58" font-size="26" fill="#57d9e8" font-family="var(--mono)" font-weight="700">?</text>
    </g>
  </svg>`;
}

function svgFox() {
  return `
  <svg class="fox-root" viewBox="0 0 200 210" data-mood="smug">
    <g>
      <path class="tail" d="M148 158 C188 148 194 100 164 82 C186 96 188 136 152 164 Z" fill="#e8894a" stroke="#141922" stroke-width="2"/>
      <path class="tail" d="M166 92 C180 100 180 118 166 124 Z" fill="#faf1e6"/>
      <path d="M45 62 L22 12 L70 42 Z" fill="#e8894a" stroke="#141922" stroke-width="2.5"/>
      <path d="M155 62 L178 12 L130 42 Z" fill="#e8894a" stroke="#141922" stroke-width="2.5"/>
      <path d="M48 52 L34 22 L62 40 Z" fill="#faf1e6"/>
      <path d="M152 52 L166 22 L138 40 Z" fill="#faf1e6"/>
      <path d="M100 30 C58 30 34 62 34 104 C34 148 58 186 100 186 C142 186 166 148 166 104 C166 62 142 30 100 30 Z"
            fill="#e8894a" stroke="#141922" stroke-width="2.5"/>
      <path d="M100 95 C76 95 62 116 64 142 C66 166 80 180 100 180 C120 180 134 166 136 142 C138 116 124 95 100 95 Z"
            fill="#faf1e6"/>
      <ellipse class="paw-wave" cx="54" cy="182" rx="13" ry="18" fill="#e8894a" stroke="#141922" stroke-width="2"/>
      <ellipse cx="80" cy="188" rx="13" ry="9" fill="#e8894a" stroke="#141922" stroke-width="2"/>
      <ellipse cx="120" cy="188" rx="13" ry="9" fill="#e8894a" stroke="#141922" stroke-width="2"/>
      <ellipse class="cheek" cx="76" cy="144" rx="10" ry="6.5" fill="#ff8b5c" opacity="0.55"/>
      <ellipse class="cheek" cx="124" cy="144" rx="10" ry="6.5" fill="#ff8b5c" opacity="0.55"/>
      <path class="brow" d="M112 96 q11 -8 21 -1" stroke="#141922" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.9"/>
      <g>
        <path class="eye-open-only" d="M74 112 q9 -13 18 0 q-9 8 -18 0 Z" fill="#141922"/>
      </g>
      <g>
        <circle class="pupil" cx="126" cy="112" r="8" fill="#141922"/>
        <circle class="pupil-shine" cx="123" cy="108.5" r="2.4" fill="#fff"/>
        <rect class="eyelid" x="114" y="100" width="26" height="22" rx="10" fill="#e8894a"/>
      </g>
      <path d="M100 132 L92 142 L108 142 Z" fill="#141922"/>
      <path class="smirk" d="M92 142 Q102 158 122 138" stroke="#141922" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="flatmouth" d="M88 148 L128 148" stroke="#141922" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

function showCharacter(containerId, type, mood) {
  const el = document.getElementById(containerId);
  el.innerHTML = type === "penguin" ? svgPenguin() : svgFox();
  setMood(containerId, mood);
}

function setMood(containerId, mood) {
  const el = document.getElementById(containerId);
  const root = el.querySelector(".penguin-root, .fox-root");
  if (!root) return;
  // SVG className is not a plain string (SVGAnimatedString), so use classList directly.
  [...root.classList].forEach((c) => {
    if (c.startsWith("mood-")) root.classList.remove(c);
  });
  root.classList.add("mood-" + mood);
}

/* ---------------------------------------------------------
   3) SCREEN LOGIC
   --------------------------------------------------------- */

async function runBoot() {
  const term = document.getElementById("boot-terminal");
  await delay(400);
  for (const line of EPISODE.bootLines) {
    if (line.glitch) {
      document.getElementById("screen-boot").classList.add("glitch-flash");
      await delay(180);
      document.getElementById("screen-boot").classList.remove("glitch-flash");
    }
    await typeLine(term, line.text, { warn: !!line.warn });
    await delay(line.pause || 400);
  }
  showContinue("boot-continue", () => transitionToScreen("identify"));
}

function initIdentifyScreen() {
  showCharacter("penguin-stage", "penguin", "neutral");
  const verifyBtn = document.getElementById("verify-btn");
  verifyBtn.addEventListener("click", async () => {
    verifyBtn.disabled = true;
    setMood("penguin-stage", "confused");
    await delay(750);
    await showSystemMessage("identify-msg", "Identity confirmed.");
    await delay(250);
    setMood("penguin-stage", "amused");
    showContinue("identify-continue", () => transitionToScreen("countdown"));
  });
}

function initCountdownScreen() {
  const numEl = document.getElementById("countdown-number");
  const target = EPISODE.daysRemaining;
  let n = 0;
  const step = Math.max(12, Math.round(500 / target));
  const timer = setInterval(() => {
    n++;
    numEl.textContent = n;
    if (n >= target) clearInterval(timer);
  }, step);

  (async () => {
    await delay(target * step + 500);
    const msgEl = document.getElementById("countdown-msg");
    for (const line of EPISODE.countdownLines) {
      msgEl.innerHTML = "";
      await typeLine(msgEl, line);
      await delay(650);
    }
    showContinue("countdown-continue", () => transitionToScreen("fox"));
  })();
}

function initFoxScreen() {
  showCharacter("fox-stage", "fox", "smug");
  wireFoxEasterEgg(document.getElementById("fox-stage"));

  (async () => {
    await delay(300);
    await showSystemMessage("fox-msg1", EPISODE.foxLine1);
    await delay(600);
    const nameEl = document.getElementById("fox-name");
    nameEl.hidden = false;
    await delay(700);
    await showSystemMessage("fox-msg2", EPISODE.foxLine2);
    await delay(300);
    const viewBtn = document.getElementById("view-protocol-btn");
    viewBtn.hidden = false;
    viewBtn.addEventListener("click", openClassifiedModal);
  })();
}

let foxClickCount = 0;
function wireFoxEasterEgg(stageEl) {
  stageEl.style.position = "relative";
  stageEl.addEventListener("click", () => {
    foxClickCount++;
    if (foxClickCount >= 3) {
      const lineIndex = (foxClickCount - 3) % EPISODE.easterEggLines.length;
      showFoxBubble(stageEl, EPISODE.easterEggLines[lineIndex]);
    }
  });
}

function showFoxBubble(anchor, text) {
  let bubble = anchor.querySelector(".fox-bubble");
  if (!bubble) {
    bubble = document.createElement("div");
    bubble.className = "fox-bubble";
    anchor.appendChild(bubble);
  }
  bubble.textContent = text;
  bubble.classList.remove("show");
  void bubble.offsetWidth;
  bubble.classList.add("show");
  setMood("fox-stage", "alert");
  clearTimeout(anchor._bubbleTimer);
  anchor._bubbleTimer = setTimeout(() => {
    bubble.classList.remove("show");
    setMood("fox-stage", "smug");
  }, 1600);
}

function openClassifiedModal() {
  const overlay = document.getElementById("modal-overlay");
  const body = document.getElementById("modal-body");
  body.textContent = EPISODE.classifiedDoc;
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("show"));

  const closeBtn = document.getElementById("modal-close");
  const close = () => {
    overlay.classList.remove("show");
    setTimeout(() => {
      overlay.hidden = true;
      showContinue("fox-continue", () => transitionToScreen("announce"));
    }, 250);
    closeBtn.removeEventListener("click", close);
    overlay.removeEventListener("click", overlayClick);
  };
  const overlayClick = (e) => {
    if (e.target === overlay) close();
  };
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", overlayClick);
}

function initAnnounceScreen() {
  (async () => {
    await delay(300);
    const msgEl = document.getElementById("announce-msg");
    for (const line of EPISODE.announceLines) {
      msgEl.innerHTML = "";
      await typeLine(msgEl, line);
      await delay(600);
    }
  })();

  const ackBtn = document.getElementById("ack-btn");
  ackBtn.addEventListener("click", async () => {
    ackBtn.disabled = true;
    const respEl = document.getElementById("ack-response");
    respEl.hidden = false;
    const lines = EPISODE.ackResponse.split("\n");
    for (const l of lines) {
      await typeLine(respEl, l);
      await delay(200);
    }
    await delay(400);
    const slot = document.getElementById("fox-wave-slot");
    slot.innerHTML = svgFox();
    setMood("fox-wave-slot", "wave");
    slot.classList.add("show");
    await delay(1400);
    slot.classList.remove("show");
    await delay(600);
    transitionToScreen("end");
  });
}

function initEndScreen() {
  showCharacter("penguin-end-stage", "penguin", "neutral");
}

/* ---------------------------------------------------------
   BOOTSTRAP
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("screen-boot").dataset.inited = "1";
  runBoot();
});
