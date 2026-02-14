import { createRingTimer } from "./ringTimer.js";
import { createRoundBlocks } from "./roundBlocks.js";

export function createTimerView(
  rootEl,
  {
    settings,
    onOpenSettings,
    onStart,
    onPause,
    onResume,
    onSkipPhase,
    onRestart,
    onSkipCountdown
  }
) {
  rootEl.innerHTML = `
    <header class="view-header">
      <h1 id="timerTitle" class="view-title">HIIT Timer</h1>
      <button id="openSettingsBtn" class="icon-button" type="button" aria-label="Open settings">
        <span aria-hidden="true">SET</span>
      </button>
    </header>
    <p class="subtitle">Ring timer and round blocks active.</p>
    <section class="card">
      <h2 class="card-title">Timer</h2>
      <div id="ringTimerRoot"></div>
      <div id="roundBlocksRoot"></div>
      <div class="controls">
        <button id="startBtn" class="primary-button" type="button">Start</button>
        <button id="pauseBtn" class="secondary-button hidden" type="button">Pause</button>
        <button id="resumeBtn" class="primary-button hidden" type="button">Resume</button>
        <button id="skipPhaseBtn" class="secondary-button" type="button">Skip Phase</button>
        <button id="skipCountdownBtn" class="secondary-button hidden" type="button">Skip Countdown</button>
        <button id="restartBtn" class="secondary-button" type="button">Restart</button>
      </div>
    </section>
  `;

  const openSettingsBtn = rootEl.querySelector("#openSettingsBtn");
  const startBtn = rootEl.querySelector("#startBtn");
  const pauseBtn = rootEl.querySelector("#pauseBtn");
  const resumeBtn = rootEl.querySelector("#resumeBtn");
  const skipPhaseBtn = rootEl.querySelector("#skipPhaseBtn");
  const skipCountdownBtn = rootEl.querySelector("#skipCountdownBtn");
  const restartBtn = rootEl.querySelector("#restartBtn");
  const ringTimer = createRingTimer(rootEl.querySelector("#ringTimerRoot"));
  const roundBlocks = createRoundBlocks(rootEl.querySelector("#roundBlocksRoot"));

  openSettingsBtn.addEventListener("click", onOpenSettings);
  startBtn.addEventListener("click", onStart);
  pauseBtn.addEventListener("click", onPause);
  resumeBtn.addEventListener("click", onResume);
  skipPhaseBtn.addEventListener("click", onSkipPhase);
  skipCountdownBtn.addEventListener("click", onSkipCountdown);
  restartBtn.addEventListener("click", onRestart);

  function updateControls(runtime) {
    const isDone = runtime.phase === "DONE";
    const showStart = !runtime.started;
    const showPause = runtime.started && !runtime.paused && !isDone;
    const showResume = runtime.started && runtime.paused && !isDone;
    const showSkipCountdown = runtime.started && runtime.phase === "COUNTDOWN";

    startBtn.classList.toggle("hidden", !showStart);
    pauseBtn.classList.toggle("hidden", !showPause);
    resumeBtn.classList.toggle("hidden", !showResume);
    skipCountdownBtn.classList.toggle("hidden", !showSkipCountdown);

    startBtn.disabled = runtime.started;
    pauseBtn.disabled = !showPause;
    resumeBtn.disabled = !showResume;
    skipPhaseBtn.disabled = !runtime.started || isDone;
    skipCountdownBtn.disabled = !showSkipCountdown;
    restartBtn.disabled = !runtime.started;
  }

  return {
    update(nextSettings, runtime, remainingMs) {
      const showRound = runtime.phase === "WORK" || runtime.phase === "REST";
      const currentRound = Math.min(nextSettings.rounds, runtime.roundIndex + 1);
      const roundText = showRound ? `Round ${currentRound} / ${nextSettings.rounds}` : "";
      ringTimer.update({
        phase: runtime.phase,
        durationMs: runtime.phaseDurationMs,
        remainingMs,
        roundText
      });
      roundBlocks.render(nextSettings.rounds, runtime.roundIndex);
      updateControls(runtime);
    }
  };
}
