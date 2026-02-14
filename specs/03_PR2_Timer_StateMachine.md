# PR2 — Timer Engine + State Machine (Text UI)

## Objective
Implement the workout state machine and monotonic timer engine. Display phase, round, and remaining time in the timer view (text-only). Add controls: Start, Pause/Resume, Skip Phase, Restart, Skip Countdown.

## Scope
- `core/stateMachine.js`: transition rules, edge cases
- `core/timerEngine.js`: monotonic timing using `performance.now()`
- Update `ui/timerView.js` to:
  - render phase label
  - render remaining time
  - render round info during WORK/REST
- Add button handlers for all controls

## Deliverables (files)
- `/src/core/stateMachine.js`
- `/src/core/timerEngine.js`
- `/src/core/format.js` (time formatting helper)
- Update `/src/ui/timerView.js`
- Update `/src/app.js` wiring

## Definitions
- Rounds = count of WORK intervals.
- REST occurs after each WORK except the last.
- Cooldown is a single final phase if cooldownSec > 0.

## State Machine Spec

### Phases
- COUNTDOWN
- WORK
- REST
- COOLDOWN
- DONE

### Runtime State
- phase
- roundIndex (0-based count of completed WORK)
- phaseDurationMs
- phaseEndTs (performance.now reference)
- paused boolean
- pausedRemainingMs

### Start behavior
- If countdownSec > 0 => phase=COUNTDOWN, roundIndex=0
- Else => phase=WORK, roundIndex=0

### Transition on phase completion
- COUNTDOWN -> WORK
- WORK completion:
  - mark current work as completed (roundIndex increments conceptually after completion)
  - if roundIndex == rounds-1:
    - if cooldownSec > 0 => COOLDOWN
    - else => DONE
  - else => REST
- REST completion:
  - roundIndex++ (move to next work)
  - WORK
- COOLDOWN completion:
  - DONE

### Skip Phase button
- COUNTDOWN => WORK
- WORK => treat as WORK completion immediately (round completion applies)
- REST => go to next WORK (roundIndex++)
- COOLDOWN => DONE
- DONE => no-op

### Skip Countdown button
- Only visible/enabled in COUNTDOWN.
- Same behavior as Skip Phase while in COUNTDOWN.

### Restart button
- Confirm.
- Reset to initial start state (COUNTDOWN if enabled else WORK), roundIndex=0.

### Pause/Resume
- Pause:
  - compute remainingMs = max(0, endTs - now)
  - store pausedRemainingMs
  - stop animation loop
- Resume:
  - endTs = now + pausedRemainingMs
  - restart animation loop

## Timer Engine Spec
- Use `requestAnimationFrame` loop.
- Compute remainingMs each frame using monotonic clock.
- Provide a callback `onPhaseComplete()` when remainingMs <= 0.
- For text rendering, update DOM at most 10–15 fps (optional optimization).

## Acceptance Criteria
- With default settings: countdown 10 then WORK 120, REST 30 repeating; total 8 WORK, 7 REST; then DONE (cooldown 0).
- countdown=0 starts directly in WORK.
- rounds=1 runs one WORK then cooldown/done.
- rest=0 transitions WORK -> WORK (next round) without delay.
- cooldown > 0 runs after last WORK then DONE.
- Pause/Resume does not drift noticeably (monotonic endTs).
- Skip Phase behaves exactly as spec.
