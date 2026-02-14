# HIIT PWA Specs (Vanilla)

## How to use these specs with Codex
1. Read `specs/01_PRD.md` first.
2. Then implement PRs in order:
   - `specs/02_PR1_Scaffold_PWA.md`
   - `specs/03_PR2_Timer_StateMachine.md`
   - `specs/04_PR3_UI_Ring_Blocks.md`
   - `specs/05_PR4_Audio.md`
   - `specs/06_PR5_Haptics_Polish.md`

## Constraints
- Vanilla HTML/CSS/JS only (ES modules OK). No React.
- Must run as an iPhone Safari PWA ("Add to Home Screen").
- Persist settings locally (localStorage).
- Offline-capable after first load (service worker cache).

## Definitions
- "Rounds" = number of WORK intervals.
- REST occurs after each WORK except the final WORK.
- Cooldown behaves like Countdown: a single phase with its own timer.

## Defaults (MVP)
- countdownSec=10, workSec=120, restSec=30, rounds=8, cooldownSec=0
- audioEnabled=true, final10Beeps=true, transitionSounds=true, hapticsEnabled=true
