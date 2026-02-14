export function formatMsAsClock(ms) {
  const safeMs = Math.max(0, Number(ms) || 0);
  const totalSec = Math.ceil(safeMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function formatPhaseLabel(phase) {
  switch (phase) {
    case "COUNTDOWN":
      return "GET READY";
    case "WORK":
      return "WORK";
    case "REST":
      return "REST";
    case "COOLDOWN":
      return "COOLDOWN";
    case "DONE":
      return "DONE";
    default:
      return "GET READY";
  }
}
