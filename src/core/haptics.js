function canVibrate() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function pulse(pattern) {
  if (!canVibrate()) {
    return;
  }
  navigator.vibrate(pattern);
}

export function createHapticsController() {
  function finalCountdownPulse() {
    pulse(35);
  }

  function transitionPulse() {
    pulse(120);
  }

  function finishPulse() {
    pulse([120, 70, 180]);
  }

  return {
    finalCountdownPulse,
    transitionPulse,
    finishPulse
  };
}
