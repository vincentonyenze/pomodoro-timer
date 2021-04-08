# Pomodoro Timer

A focus timer based on the Pomodoro technique, built with plain HTML, CSS and JavaScript. No frameworks or libraries.

This is **Project 5** in my beginner-to-expert web development roadmap.

<!-- Add a screenshot: save one as screenshot.png in this folder and uncomment the line below -->
<!-- ![Pomodoro Timer screenshot](screenshot.png) -->

## How the Pomodoro technique works

1. Focus for 25 minutes.
2. Take a 5-minute short break.
3. After every 4 focus sessions, take a 15-minute long break.

## Features

- Focus, short break and long break modes, each with its own color theme
- Start, pause, resume and reset
- Switches to the next mode automatically when time is up, with a long break after every 4th focus session
- Session counter and cycle dots showing progress towards the long break
- Animated SVG progress ring
- Time left shown in the browser tab title
- A chime generated with the Web Audio API (can be turned off)
- Desktop notification when time is up while you're in another tab
- Custom durations for each mode, with validation
- Settings saved in `localStorage`
- Accurate even in background tabs: time is calculated from the clock, not by counting ticks
- Keyboard and screen-reader friendly
- Responsive layout for desktop and phone

## Built with

- HTML5 (`<details>`/`<summary>`, inline SVG, ARIA attributes)
- CSS3 (custom properties for theming, SVG `stroke-dasharray`/`stroke-dashoffset`, `clamp()`, `aspect-ratio`, media queries)
- Vanilla JavaScript (ES6+)
- Browser APIs: Web Audio, Notifications, `localStorage`

## What I learned

- **Timers:** `setInterval`/`clearInterval` and `setTimeout`/`clearTimeout`, and why only one timer should run at a time
- **Accurate timing:** storing an end time and using `Date.now()` instead of counting ticks, which drift and get throttled in background tabs
- **State machines:** a single `status` (`idle` / `running` / `paused`) instead of several booleans, with guards on each action
- **Working with time:** milliseconds, `Math.ceil`/`Math.floor`, and `%` for formatting `mm:ss` and "every 4th session"
- **Theming with CSS variables:** one `data-mode` attribute recolors the whole page
- **SVG progress rings:** circumference, `stroke-dasharray` and `stroke-dashoffset`
- **Browser policies:** audio and notification permission must start from a user click
- **Feature detection:** checking that an API exists before using it
- **Defensive loading:** validating every value read from `localStorage`
- **Settings vs. state:** keeping saved preferences separate from what's happening right now

## How to run

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   ```
2. Open `index.html` in your browser.

No installation or build step is needed.

**Note:** some browsers don't allow notifications on pages opened from a local file (`file://`). If notifications don't appear, use a local server (for example the Live Server extension in VS Code) or the deployed GitHub Pages version.

## Project structure

```
pomodoro-timer/
├── index.html   # Mode buttons, timer ring, controls, settings form
├── style.css    # Mode themes, ring, responsive layout
├── script.js    # State, timer logic, sound, notifications, settings
└── README.md
```

## Known limitations

- Browsers may delay timers in tabs that have been hidden for a long time, so the chime or notification can arrive a little late. The time shown is always correct when you return.
- The session count resets when the page is reloaded.

## Possible improvements

- Option to auto-start the next session
- Keyboard shortcuts (Space to start/pause, R to reset)
- Save today's session count and show a weekly history
- A task list to choose what each focus session is for
- Rebuild in React (planned for a later project in my roadmap)
