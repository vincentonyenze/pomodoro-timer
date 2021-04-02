// ===== DOM elements =====
const timeDisplay = document.getElementById("time-display");
const modeLabel = document.getElementById("mode-label");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const modesEl = document.querySelector(".modes");
const modeButtons = document.querySelectorAll(".mode-btn");
const cycleDotsEl = document.getElementById("cycle-dots");
const sessionText = document.getElementById("session-text");
const ringProgress = document.getElementById("ring-progress");

// ===== Config =====
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
// Check 4 times a second so the display changes close to each real second
const TICK_MS = 250;
const SESSIONS_BEFORE_LONG_BREAK = 4;

const MODES = {
  focus: { name: "Focus", label: "Time to focus" },
  short: { name: "Short break", label: "Take a short break" },
  long: { name: "Long break", label: "Take a long break" },
};

const APP_TITLE = "Pomodoro Timer";

// Read the radius from the SVG itself so it's only defined in one place
const RING_CIRCUMFERENCE = 2 * Math.PI * ringProgress.r.baseVal.value;

// What the main button says for each status
const START_BUTTON_LABELS = {
  idle: "Start",
  running: "Pause",
  paused: "Resume",
};

// Durations in minutes (made editable in Step 11)
const settings = {
  focus: 25,
  short: 5,
  long: 15,
};

// ===== State =====
const state = {
  mode: "focus", // "focus" | "short" | "long"
  status: "idle", // "idle" | "running" | "paused"
  remainingMs: settings.focus * MS_PER_MINUTE,
  endTime: null, // timestamp (ms) when the running timer reaches 0
  intervalId: null, // id from setInterval, needed to stop it
  completedSessions: 0, // finished focus sessions
};

// ===== Helpers =====
function getDurationMs(mode) {
  return settings[mode] * MS_PER_MINUTE;
}

// 1_500_000 ms -> "25:00", 65_000 ms -> "01:05"
function formatTime(ms) {
  // Round up so the display shows 00:00 only when time is really up
  const totalSeconds = Math.ceil(ms / MS_PER_SECOND);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// How many dots to fill in the current cycle of 4
function getFilledDots() {
  const inCycle = state.completedSessions % SESSIONS_BEFORE_LONG_BREAK;
  // Right after the 4th session (during the long break) show all 4 filled
  const cycleJustFinished =
    inCycle === 0 && state.completedSessions > 0 && state.mode !== "focus";
  return cycleJustFinished ? SESSIONS_BEFORE_LONG_BREAK : inCycle;
}

// ===== Rendering =====
function createCycleDots() {
  const dots = Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }, () => {
    const dot = document.createElement("span");
    dot.className = "dot";
    return dot;
  });
  cycleDotsEl.replaceChildren(...dots);
}

function renderSessions() {
  const filled = getFilledDots();
  [...cycleDotsEl.children].forEach((dot, index) => {
    dot.classList.toggle("is-filled", index < filled);
  });

  const count = state.completedSessions;
  sessionText.textContent = `${count} focus session${count === 1 ? "" : "s"} completed`;
}

function renderRing() {
  // 1 = full ring at the start, 0 = empty when time is up
  const fractionLeft = state.remainingMs / getDurationMs(state.mode);
  ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - fractionLeft);
}

function renderTitle() {
  if (state.status === "idle") {
    document.title = APP_TITLE;
    return;
  }

  const prefix = state.status === "paused" ? "⏸ " : "";
  document.title = `${prefix}${formatTime(state.remainingMs)} · ${MODES[state.mode].name}`;
}

function render() {
  timeDisplay.textContent = formatTime(state.remainingMs);
  modeLabel.textContent = MODES[state.mode].label;
  startBtn.textContent = START_BUTTON_LABELS[state.status];
  document.body.classList.toggle("is-running", state.status === "running");

  // The CSS switches colors from this attribute
  document.body.dataset.mode = state.mode;
  modeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.mode === state.mode);
  });

  renderSessions();
  renderRing();
  renderTitle();
}

// ===== Timer =====
function startTimer() {
  // Guard: starting twice would create two intervals counting at once
  if (state.status === "running") return;

  // Starting again after reaching 00:00 begins a fresh countdown
  if (state.remainingMs === 0) {
    state.remainingMs = getDurationMs(state.mode);
  }

  // Remember WHEN the timer should end, not how many ticks are left
  state.endTime = Date.now() + state.remainingMs;
  state.status = "running";
  state.intervalId = setInterval(tick, TICK_MS);
  render();
}

function tick() {
  // Work out the time left from the clock, so a late tick can't cause drift
  state.remainingMs = Math.max(0, state.endTime - Date.now());

  if (state.remainingMs === 0) {
    handleTimeUp();
    return;
  }
  render();
}

function pauseTimer() {
  if (state.status !== "running") return;

  stopTicking();
  // Save exactly how much time was left at the moment of pausing
  state.remainingMs = Math.max(0, state.endTime - Date.now());
  state.endTime = null;
  state.status = "paused";
  render();
}

function resetTimer() {
  stopTicking();
  state.status = "idle";
  state.endTime = null;
  state.remainingMs = getDurationMs(state.mode);
  render();
}

function setMode(mode) {
  if (!MODES[mode]) return;

  state.mode = mode;
  // A new mode always starts fresh, even if the old one was running
  resetTimer();
}

function stopTicking() {
  clearInterval(state.intervalId);
  state.intervalId = null;
}

// After focus: short break, or a long break every 4th session.
// After any break: back to focus.
function getNextMode() {
  if (state.mode !== "focus") return "focus";
  return state.completedSessions % SESSIONS_BEFORE_LONG_BREAK === 0 ? "long" : "short";
}

function handleTimeUp() {
  stopTicking();

  if (state.mode === "focus") {
    state.completedSessions++;
  }

  // setMode resets the timer, so the next mode waits for Start
  setMode(getNextMode());
}

// ===== Event handlers =====
// One button: Start / Pause / Resume depending on the status
function handleStartClick() {
  if (state.status === "running") {
    pauseTimer();
  } else {
    startTimer();
  }
}

function handleModeClick(event) {
  const button = event.target.closest(".mode-btn");
  if (!button) return;

  // Clicking the mode you're already in shouldn't wipe your progress
  if (button.dataset.mode === state.mode) return;

  setMode(button.dataset.mode);
}

// ===== Init =====
startBtn.addEventListener("click", handleStartClick);
resetBtn.addEventListener("click", resetTimer);
modesEl.addEventListener("click", handleModeClick);
createCycleDots();
ringProgress.style.strokeDasharray = RING_CIRCUMFERENCE;
render();
