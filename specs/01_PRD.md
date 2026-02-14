# PRD — HIIT Interval Timer PWA (Vanilla)

## 1) Overview
A simple, reliable HIIT interval timer optimized for iPhone as a Progressive Web App (PWA).
The timer cycles through Countdown → Work/Rest rounds → Cooldown → Done.
Settings persist locally; no login.

## 2) Goals
- One-tap start, clear phase visibility, reliable timekeeping.
- Smooth circular countdown ring and round-completion blocks.
- Audio beeps for final 10 seconds of each phase + distinct start/transition/finish cues.
- Best-effort haptics.

## 3) Non-goals (MVP)
- Accounts, syncing, workout libraries/presets, Apple Health integration, analytics.

## 4) Target Platform
- iPhone Safari PWA (Add to Home Screen).
- Must also function in regular mobile/desktop browsers.

## 5) User Stories
- As a user, I can configure work/rest/rounds and have the app remember them.
- As a user, I can start a workout and see the remaining time and phase clearly.
- As a user, I can pause/resume and not lose my place.
- As a user, I hear beeps in the final 10 seconds of every phase.
- As a user, I get clear cues at phase changes and workout completion.
- As a user, I can skip countdown or skip the current phase if needed.
- As a user, I can see progress across rounds (blocks).

## 6) Terminology
- Phase: COUNTDOWN, WORK, REST, COOLDOWN, DONE
- Round: one WORK interval. "rounds" is count of WORK intervals.
- Round index: 0-based count of completed WORK intervals.

## 7) Functional Requirements

### 7.1 Timer Phases and Rules
- Start flow:
  - If countdownSec > 0: start in COUNTDOWN.
  - Else: start in WORK.
- WORK repeats for `rounds` times.
- REST happens after each WORK except the last.
- If cooldownSec > 0: after final WORK (and its skipped REST), run COOLDOWN.
- Then DONE.

### 7.2 Controls
- Start: begins workout; must unlock audio context if audio enabled.
- Pause/Resume: pauses without drift; resumes accurately.
- Skip Phase:
  - If in COUNTDOWN: go to WORK.
  - If in WORK: behave as if WORK ended now (mark round complete, transition accordingly).
  - If in REST: go to next WORK (increment round index).
  - If in COOLDOWN: go to DONE.
- Restart:
  - Confirm dialog.
  - Returns to initial phase (COUNTDOWN if enabled else WORK), roundIndex=0.

### 7.3 Settings and Persistence
- Settings stored locally via localStorage.
- Validation:
  - countdownSec: 0–60
  - workSec: 5–3600
  - restSec: 0–3600
  - rounds: 1–50
  - cooldownSec: 0–3600
- Toggles:
  - audioEnabled
  - final10Beeps
  - transitionSounds
  - hapticsEnabled

### 7.4 Audio Requirements
- Web Audio API (oscillator + gain envelope).
- Audio unlock/resume only on user gesture (Start).
- Sounds:
  - Final 10 seconds: short beep each second for remainingSec 10..1, in every phase (COUNTDOWN/WORK/REST/COOLDOWN).
  - Transition sound: distinct cue when phase changes (optional via toggle).
  - Start: distinct cue when workout begins.
  - Finish: distinct cue on DONE.

### 7.5 Haptics Requirements
- Best-effort `navigator.vibrate()` if available.
- Suggested patterns:
  - Final 3 seconds: brief pulse each second.
  - Phase transition: longer pulse.
- If unsupported or disabled: no-op.

### 7.6 Offline / PWA
- Provide manifest + icons.
- Service worker caches app shell for offline use after first load.
- Must work on HTTPS hosting.

## 8) UI/UX Requirements

### 8.1 Main Timer Screen
- Circular timer ring (SVG) centered.
- Center text:
  - Remaining time (mm:ss)
  - Phase label (GET READY / WORK / REST / COOLDOWN / DONE)
  - Round indicator: "Round X / N" during WORK/REST
- Ring color by phase:
  - WORK green, REST red, COUNTDOWN/COOLDOWN neutral.
- Round blocks:
  - N blocks displayed beneath ring.
  - Initially filled.
  - After each WORK completes, that block becomes outline.
- Top right: Settings icon.
- Controls row:
  - Start / Pause / Resume (contextual)
  - Skip Phase
  - Restart
  - Skip Countdown (only during COUNTDOWN)

### 8.2 Settings Screen
- Simple form.
- Save button (explicit).
- Reset defaults.
- Back navigation to timer.

## 9) Accessibility
- Large tap targets.
- High contrast for timer text.
- Respect prefers-reduced-motion (optional optimization; not required in MVP).

## 10) Acceptance Criteria (high-level)
- Correct sequence timing and transitions for typical and edge cases.
- Smooth ring animation.
- Beeps occur correctly in final 10 seconds of every phase.
- Settings persist across reloads.
- PWA installable and works offline after first load.
