# PR5 — Haptics + Polish

## Objective
Add best-effort haptics patterns and polish UX: confirms, edge-case handling, small accessibility improvements.

## Scope
- `core/haptics.js` using `navigator.vibrate()` when available
- Integrate haptics triggers parallel to audio triggers
- UI polish: confirm dialogs, disabled button states, minor accessibility

## Deliverables (files)
- `/src/core/haptics.js`
- Update timer engine and/or view to call haptics hooks
- Update settings UI to include haptics toggle (already in PR1 settings model)

## Haptics Rules
- If settings.hapticsEnabled=false: no vibration calls.
- If `navigator.vibrate` not available: no-op.
- Final 3 seconds of every phase (remainingSec 3..1):
  - short pulse each second
- Phase transition:
  - longer pulse once per transition
- Finish:
  - two pulses or a longer pulse (distinct)

## UX Polish
- Restart requires confirm.
- Skip Phase disabled in DONE.
- Start disabled when already running; shows Pause/Resume contextually.
- Skip Countdown only visible during COUNTDOWN.

## Optional (nice-to-have)
- Respect prefers-reduced-motion by reducing ring animation updates (not required).

## Acceptance Criteria
- Haptics occur where supported and enabled; no console errors when unsupported.
- Toggles respected.
- Buttons behave predictably across phases.
