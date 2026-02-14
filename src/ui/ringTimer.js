import { formatMsAsClock, formatPhaseLabel } from "../core/format.js";

const PHASE_COLOR = {
  COUNTDOWN: "#94a3b8",
  WORK: "#22c55e",
  REST: "#ef4444",
  COOLDOWN: "#94a3b8",
  DONE: "#14b8a6"
};

export function createRingTimer(rootEl) {
  const radius = 104;
  const circumference = 2 * Math.PI * radius;

  rootEl.innerHTML = `
    <div class="ring-wrap">
      <svg class="ring-svg" viewBox="0 0 260 260" role="img" aria-label="Timer progress">
        <circle class="ring-track" cx="130" cy="130" r="${radius}"></circle>
        <circle class="ring-progress" cx="130" cy="130" r="${radius}"></circle>
      </svg>
      <div class="ring-center">
        <p class="phase-label" data-role="phase">GET READY</p>
        <p class="time-preview" data-role="time">00:00</p>
        <p class="round-preview hidden" data-role="round"></p>
      </div>
    </div>
  `;

  const progressEl = rootEl.querySelector(".ring-progress");
  const phaseEl = rootEl.querySelector('[data-role="phase"]');
  const timeEl = rootEl.querySelector('[data-role="time"]');
  const roundEl = rootEl.querySelector('[data-role="round"]');

  progressEl.style.strokeDasharray = `${circumference}`;
  progressEl.style.strokeDashoffset = `${circumference}`;

  function update({ phase, durationMs, remainingMs, roundText }) {
    const safeDuration = Math.max(1, durationMs || 1);
    const safeRemaining = Math.max(0, remainingMs || 0);
    const ratio = Math.min(1, Math.max(0, safeRemaining / safeDuration));
    const dashOffset = circumference * (1 - ratio);

    progressEl.style.strokeDashoffset = `${dashOffset}`;
    progressEl.style.stroke = PHASE_COLOR[phase] || PHASE_COLOR.COUNTDOWN;
    phaseEl.style.color = PHASE_COLOR[phase] || PHASE_COLOR.COUNTDOWN;
    phaseEl.textContent = formatPhaseLabel(phase);
    timeEl.textContent = formatMsAsClock(safeRemaining);

    if (roundText) {
      roundEl.textContent = roundText;
      roundEl.classList.remove("hidden");
    } else {
      roundEl.classList.add("hidden");
    }
  }

  return { update };
}
