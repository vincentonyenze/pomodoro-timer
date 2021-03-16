// ===== DOM elements =====
const timeDisplay = document.getElementById("time-display");
const modeLabel = document.getElementById("mode-label");
const startBtn = document.getElementById("start-btn");

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
  document.body.classList.toggle("is-running", state.status === "running");
}

// ===== Timer =====
function startTimer() {
  // Guard: starting twice would create two intervals counting at once
  if (state.status === "running") return;

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
function handleStartClick() {
  startTimer();
}

// ===== Init =====
startBtn.addEventListener("click", handleStartClick);
render();
