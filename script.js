// ===== DOM elements =====
const timeDisplay = document.getElementById("time-display");
const modeLabel = document.getElementById("mode-label");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const modesEl = document.querySelector(".modes");
const modeButtons = document.querySelectorAll(".mode-btn");

// ===== Config =====
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
// Check 4 times a second so the display changes close to each real second
const TICK_MS = 250;

const MODES = {
  focus: { label: "Time to focus" },
  short: { label: "Take a short break" },
  long: { label: "Take a long break" },
};

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

// ===== Rendering =====
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

function handleTimeUp() {
  stopTicking();
  state.status = "idle";
  render();
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
modesEl.addEventListener("click", handleModeClick);
resetBtn.addEventListener("click", resetTimer);
render();
