export function createTimerEngine({ getState, onTick, onPhaseComplete, onSecondTick, fps = 12 }) {
  let rafId = 0;
  let active = false;
  let lastTickTs = 0;
  let lastCompleteKey = "";
  let secondPhaseKey = "";
  let lastSecondValue = null;
  const minFrameGap = 1000 / fps;

  const stop = () => {
    active = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const frame = (now) => {
    if (!active) {
      return;
    }

    const state = getState();
    if (!state || !state.started || state.paused || state.phase === "DONE") {
      rafId = requestAnimationFrame(frame);
      return;
    }

    const remainingMs = Math.max(0, state.phaseEndTs - now);
    const phaseKey = `${state.phase}|${state.roundIndex}|${state.phaseEndTs}`;
    if (phaseKey !== secondPhaseKey) {
      secondPhaseKey = phaseKey;
      lastSecondValue = null;
    }

    if (onSecondTick) {
      const remainingSec = Math.ceil(remainingMs / 1000);
      if (remainingSec !== lastSecondValue) {
        lastSecondValue = remainingSec;
        onSecondTick({
          now,
          remainingSec,
          remainingMs,
          state
        });
      }
    }

    if (now - lastTickTs >= minFrameGap || remainingMs <= 0) {
      lastTickTs = now;
      onTick({
        now,
        remainingMs,
        state
      });
    }

    if (remainingMs <= 0) {
      const completeKey = phaseKey;
      if (completeKey !== lastCompleteKey) {
        lastCompleteKey = completeKey;
        onPhaseComplete(now);
      }
    }

    rafId = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (active) {
        return;
      }
      active = true;
      lastTickTs = 0;
      secondPhaseKey = "";
      lastSecondValue = null;
      rafId = requestAnimationFrame(frame);
    },
    stop,
    isRunning() {
      return active;
    }
  };
}
