// ===== DOM elements =====
const timeDisplay = document.getElementById("time-display");
const modeLabel = document.getElementById("mode-label");

// ===== Config =====
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;

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
}

// ===== Init =====
render();
