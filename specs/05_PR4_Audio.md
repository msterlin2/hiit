# PR4 — Audio Cues (Web Audio)

## Objective
Add reliable audio cues using Web Audio API: final-10 beeps per phase, plus distinct start/transition/finish sounds. Must work on iPhone PWA after a user gesture.

## Scope
- `core/audio.js`: AudioContext management + beep patterns
- Integrate audio triggers into timer engine/state transitions
- Respect settings toggles

## Deliverables (files)
- `/src/core/audio.js`
- Update `/src/app.js` and/or `/src/ui/timerView.js` to initialize audio on Start
- Update `/src/core/timerEngine.js` to emit "whole-second" events (or equivalent hook)

## iOS Requirements
- AudioContext must be created/resumed ONLY on user gesture (Start tap).
- If audio disabled, never create AudioContext.

## Sound Design
Implement these as oscillator beeps with gain envelope (fast attack/decay):
- `playBeep()` short single beep (final-10)
- `playTransition()` double beep
- `playStart()` rising chirp (two quick beeps at different frequencies)
- `playFinish()` three-tone or longer chirp

## Trigger Rules
- If settings.audioEnabled=false: no sounds.
- If settings.final10Beeps=true:
  - In every phase (COUNTDOWN/WORK/REST/COOLDOWN),
  - when remainingSec is 10..1 inclusive,
  - play one short beep per second, exactly once per second.
- If settings.transitionSounds=true:
  - On every phase transition (COUNTDOWN->WORK, WORK->REST, REST->WORK, WORK->COOLDOWN, COOLDOWN->DONE),
  - play transition cue,
  - EXCEPT: workout start should use `playStart()` once when Start is pressed and workout begins.
- On DONE:
  - play finish cue once.

## Whole-second scheduling (no duplicates)
- Timer engine must track lastEmittedRemainingSec per phase.
- Only fire beeps when remainingSec changes and meets conditions.

## Acceptance Criteria
- On iPhone: after tapping Start, beeps occur in final 10 seconds of phases.
- No duplicate beeps within the same second.
- Phase transition cues play exactly once per transition.
- Disabling audio prevents any sound.
