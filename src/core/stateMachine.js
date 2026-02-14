export const PHASES = Object.freeze({
  COUNTDOWN: "COUNTDOWN",
  WORK: "WORK",
  REST: "REST",
  COOLDOWN: "COOLDOWN",
  DONE: "DONE"
});

export function getInitialPhase(settings) {
  return settings.countdownSec > 0 ? PHASES.COUNTDOWN : PHASES.WORK;
}

export function getPhaseDurationMs(phase, settings) {
  switch (phase) {
    case PHASES.COUNTDOWN:
      return settings.countdownSec * 1000;
    case PHASES.WORK:
      return settings.workSec * 1000;
    case PHASES.REST:
      return settings.restSec * 1000;
    case PHASES.COOLDOWN:
      return settings.cooldownSec * 1000;
    case PHASES.DONE:
      return 0;
    default:
      return 0;
  }
}

export function createIdleRuntimeState(settings) {
  const phase = getInitialPhase(settings);
  const phaseDurationMs = getPhaseDurationMs(phase, settings);
  return {
    phase,
    roundIndex: 0,
    phaseDurationMs,
    phaseEndTs: 0,
    paused: false,
    pausedRemainingMs: phaseDurationMs,
    started: false
  };
}

export function beginWorkout(settings, now) {
  const phase = getInitialPhase(settings);
  const phaseDurationMs = getPhaseDurationMs(phase, settings);
  return {
    phase,
    roundIndex: 0,
    phaseDurationMs,
    phaseEndTs: now + phaseDurationMs,
    paused: false,
    pausedRemainingMs: phaseDurationMs,
    started: true
  };
}

export function pauseWorkout(state, now) {
  if (!state.started || state.paused || state.phase === PHASES.DONE) {
    return state;
  }
  const remainingMs = Math.max(0, state.phaseEndTs - now);
  return {
    ...state,
    paused: true,
    phaseEndTs: 0,
    pausedRemainingMs: remainingMs
  };
}

export function resumeWorkout(state, now) {
  if (!state.started || !state.paused || state.phase === PHASES.DONE) {
    return state;
  }
  return {
    ...state,
    paused: false,
    phaseEndTs: now + state.pausedRemainingMs
  };
}

function transitionFromWork(state, settings) {
  const completedWorks = state.roundIndex + 1;
  if (completedWorks >= settings.rounds) {
    if (settings.cooldownSec > 0) {
      return {
        phase: PHASES.COOLDOWN,
        roundIndex: completedWorks
      };
    }
    return {
      phase: PHASES.DONE,
      roundIndex: completedWorks
    };
  }

  if (settings.restSec > 0) {
    return {
      phase: PHASES.REST,
      roundIndex: completedWorks
    };
  }

  return {
    phase: PHASES.WORK,
    roundIndex: completedWorks
  };
}

function transitionPhase(phase, state, settings) {
  switch (phase) {
    case PHASES.COUNTDOWN:
      return { phase: PHASES.WORK, roundIndex: state.roundIndex };
    case PHASES.WORK:
      return transitionFromWork(state, settings);
    case PHASES.REST:
      return { phase: PHASES.WORK, roundIndex: state.roundIndex };
    case PHASES.COOLDOWN:
      return { phase: PHASES.DONE, roundIndex: state.roundIndex };
    case PHASES.DONE:
      return { phase: PHASES.DONE, roundIndex: state.roundIndex };
    default:
      return { phase: PHASES.DONE, roundIndex: state.roundIndex };
  }
}

function withTransition(state, settings, now, nextPhase, nextRoundIndex) {
  const durationMs = getPhaseDurationMs(nextPhase, settings);
  return {
    ...state,
    phase: nextPhase,
    roundIndex: nextRoundIndex,
    phaseDurationMs: durationMs,
    pausedRemainingMs: durationMs,
    phaseEndTs: nextPhase === PHASES.DONE ? 0 : now + durationMs,
    paused: false
  };
}

export function completeCurrentPhase(state, settings, now) {
  if (!state.started || state.phase === PHASES.DONE) {
    return state;
  }
  const next = transitionPhase(state.phase, state, settings);
  return withTransition(state, settings, now, next.phase, next.roundIndex);
}

export function skipCurrentPhase(state, settings, now) {
  if (!state.started || state.phase === PHASES.DONE) {
    return state;
  }
  const next = transitionPhase(state.phase, state, settings);
  return withTransition(state, settings, now, next.phase, next.roundIndex);
}

export function restartWorkout(settings) {
  return createIdleRuntimeState(settings);
}
