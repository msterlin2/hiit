function createEnvelope(context, destination, frequency, durationSec, type = "sine", volume = 0.16) {
  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  osc.connect(gain);
  gain.connect(destination);
  osc.start(now);
  osc.stop(now + durationSec + 0.015);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createAudioController() {
  let context = null;
  let unlocked = false;

  function getContext() {
    if (!context) {
      context = new AudioContext();
    }
    return context;
  }

  async function ensureUnlocked() {
    const ctx = getContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    unlocked = ctx.state === "running";
    return unlocked;
  }

  function canPlay() {
    return Boolean(context && unlocked && context.state === "running");
  }

  function playBeep() {
    if (!canPlay()) {
      return;
    }
    createEnvelope(context, context.destination, 980, 0.085, "square", 0.12);
  }

  async function playTransition() {
    if (!canPlay()) {
      return;
    }
    createEnvelope(context, context.destination, 740, 0.08, "square", 0.11);
    await wait(85);
    createEnvelope(context, context.destination, 880, 0.085, "square", 0.11);
  }

  async function playStart() {
    if (!canPlay()) {
      return;
    }
    createEnvelope(context, context.destination, 620, 0.09, "triangle", 0.12);
    await wait(90);
    createEnvelope(context, context.destination, 900, 0.11, "triangle", 0.14);
  }

  async function playFinish() {
    if (!canPlay()) {
      return;
    }
    createEnvelope(context, context.destination, 660, 0.11, "sine", 0.12);
    await wait(110);
    createEnvelope(context, context.destination, 830, 0.11, "sine", 0.12);
    await wait(110);
    createEnvelope(context, context.destination, 1040, 0.16, "sine", 0.14);
  }

  return {
    ensureUnlocked,
    playBeep,
    playTransition,
    playStart,
    playFinish
  };
}
