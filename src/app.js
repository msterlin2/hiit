import { loadSettings, saveSettings, resetSettings } from "./core/storage.js";
import { createTimerView } from "./ui/timerView.js";
import { createSettingsView } from "./ui/settingsView.js";
import {
  beginWorkout,
  completeCurrentPhase,
  createIdleRuntimeState,
  pauseWorkout,
  restartWorkout,
  resumeWorkout,
  skipCurrentPhase
} from "./core/stateMachine.js";
import { createTimerEngine } from "./core/timerEngine.js";
import { createAudioController } from "./core/audio.js";
import { createHapticsController } from "./core/haptics.js";

const timerRoot = document.querySelector("#timerView");
const settingsRoot = document.querySelector("#settingsView");

let settings = loadSettings();
let runtime = createIdleRuntimeState(settings);
let remainingMs = runtime.phaseDurationMs;
const audio = createAudioController();
const haptics = createHapticsController();

function isAudiblePhase(phase) {
  return phase === "COUNTDOWN" || phase === "WORK" || phase === "REST" || phase === "COOLDOWN";
}

function onPhaseTransition(fromPhase, toPhase) {
  if (fromPhase === toPhase) {
    return;
  }
  if (settings.audioEnabled && settings.transitionSounds) {
    audio.playTransition();
  }
  if (settings.hapticsEnabled) {
    haptics.transitionPulse();
  }
  if (settings.audioEnabled && toPhase === "DONE") {
    audio.playFinish();
  }
  if (settings.hapticsEnabled && toPhase === "DONE") {
    haptics.finishPulse();
  }
}

const timerEngine = createTimerEngine({
  getState: () => runtime,
  onTick: ({ remainingMs: nextRemaining }) => {
    remainingMs = nextRemaining;
    renderTimer();
  },
  onPhaseComplete: (now) => {
    const prevPhase = runtime.phase;
    runtime = completeCurrentPhase(runtime, settings, now);
    remainingMs = runtime.phaseDurationMs;
    onPhaseTransition(prevPhase, runtime.phase);
    if (runtime.phase === "DONE") {
      timerEngine.stop();
    }
    renderTimer();
  },
  onSecondTick: ({ state, remainingSec }) => {
    if (!isAudiblePhase(state.phase)) {
      return;
    }
    if (settings.audioEnabled && settings.final10Beeps && remainingSec >= 1 && remainingSec <= 10) {
      audio.playBeep();
    }
    if (settings.hapticsEnabled && remainingSec >= 1 && remainingSec <= 3) {
      haptics.finalCountdownPulse();
    }
  }
});

const timerView = createTimerView(timerRoot, {
  settings,
  onOpenSettings: () => showView("settings"),
  onStart: () => {
    const startWorkout = () => {
      const now = performance.now();
      runtime = beginWorkout(settings, now);
      remainingMs = runtime.phaseDurationMs;
      timerEngine.start();
      renderTimer();
      if (settings.audioEnabled) {
        audio.playStart();
      }
    };
    if (!settings.audioEnabled) {
      startWorkout();
      return;
    }
    audio.ensureUnlocked().then(startWorkout).catch(startWorkout);
  },
  onPause: () => {
    runtime = pauseWorkout(runtime, performance.now());
    remainingMs = runtime.pausedRemainingMs;
    timerEngine.stop();
    renderTimer();
  },
  onResume: () => {
    runtime = resumeWorkout(runtime, performance.now());
    timerEngine.start();
    renderTimer();
  },
  onSkipPhase: () => {
    const prevPhase = runtime.phase;
    runtime = skipCurrentPhase(runtime, settings, performance.now());
    remainingMs = runtime.phaseDurationMs;
    onPhaseTransition(prevPhase, runtime.phase);
    if (runtime.phase === "DONE") {
      timerEngine.stop();
    } else if (!runtime.paused) {
      timerEngine.start();
    }
    renderTimer();
  },
  onRestart: () => {
    if (!runtime.started) {
      return;
    }
    const shouldRestart = window.confirm("Restart workout?");
    if (!shouldRestart) {
      return;
    }
    timerEngine.stop();
    runtime = restartWorkout(settings);
    remainingMs = runtime.phaseDurationMs;
    renderTimer();
  },
  onSkipCountdown: () => {
    if (runtime.phase !== "COUNTDOWN") {
      return;
    }
    const prevPhase = runtime.phase;
    runtime = skipCurrentPhase(runtime, settings, performance.now());
    remainingMs = runtime.phaseDurationMs;
    onPhaseTransition(prevPhase, runtime.phase);
    timerEngine.start();
    renderTimer();
  }
});

const settingsView = createSettingsView(settingsRoot, {
  settings,
  onBack: () => showView("timer"),
  onSave: (nextSettings) => {
    settings = nextSettings;
    saveSettings(settings);
    if (!runtime.started || runtime.phase === "DONE") {
      runtime = createIdleRuntimeState(settings);
      remainingMs = runtime.phaseDurationMs;
    }
    renderTimer();
    showView("timer");
  }
});

function renderTimer() {
  timerView.update(settings, runtime, remainingMs);
}

function showView(name) {
  const timerVisible = name === "timer";
  timerRoot.classList.toggle("hidden", !timerVisible);
  settingsRoot.classList.toggle("hidden", timerVisible);
}

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "escape") {
    showView("timer");
  }
});

window.addEventListener("storage", (event) => {
  if (event.key) {
    settings = loadSettings();
    if (!runtime.started || runtime.phase === "DONE") {
      runtime = createIdleRuntimeState(settings);
      remainingMs = runtime.phaseDurationMs;
    }
    renderTimer();
    settingsView.update(settings);
  }
});

window.addEventListener("beforeunload", () => {
  saveSettings(settings);
});

const resetDefaultsButton = settingsRoot.querySelector("#resetSettingsBtn");
if (resetDefaultsButton) {
  resetDefaultsButton.addEventListener("click", () => {
    settings = resetSettings();
    if (!runtime.started || runtime.phase === "DONE") {
      runtime = createIdleRuntimeState(settings);
      remainingMs = runtime.phaseDurationMs;
    }
    renderTimer();
    settingsView.update(settings);
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const serviceWorkerUrl = new URL("./service-worker.js", import.meta.url);
      await navigator.serviceWorker.register(serviceWorkerUrl);
    } catch (_err) {
      // No-op for MVP scaffold if service worker registration fails.
    }
  });
}

showView("timer");
renderTimer();
settingsView.update(settings);
