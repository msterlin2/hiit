# PR3 — SVG Ring Timer + Round Blocks

## Objective
Replace the text-only display with the circular SVG ring timer and round blocks UI. Keep the PR2 engine unchanged.

## Scope
- `ui/ringTimer.js`: SVG ring rendering + progress updates
- `ui/roundBlocks.js`: blocks row for rounds
- Update timer view to use these components
- Phase color styling + labels

## Deliverables (files)
- `/src/ui/ringTimer.js`
- `/src/ui/roundBlocks.js`
- Update `/src/ui/timerView.js`
- Update `/src/styles.css`

## Ring UI Spec
- Use SVG circle with:
  - background track circle
  - foreground progress circle
- Progress representation:
  - stroke-dasharray / dashoffset based on progress ratio
  - ratio = remainingMs / durationMs
  - ring should shrink smoothly as time elapses
- Center text:
  - remaining time
  - phase label
  - round indicator when phase in WORK/REST

## Phase Colors
- WORK: green
- REST: red
- COUNTDOWN/COOLDOWN: neutral

## Round Blocks Spec
- Display N blocks (N=rounds).
- Initially filled.
- After each WORK completes, that block becomes outline.
- While in round k:
  - completedCount = roundIndex (completed WORK intervals)
  - blocks [0..completedCount-1] outlined
  - remaining blocks filled
- Responsive:
  - if rounds > 12, wrap rows or shrink block size; still readable.

## Acceptance Criteria
- Ring animates smoothly on iPhone.
- Ring color changes correctly by phase.
- Blocks decrement exactly once per WORK completion.
- UI remains usable for rounds up to 50 (wrap or compress).
