const STORAGE_KEY = "hiit.settings.v1";

export const DEFAULT_SETTINGS = Object.freeze({
  countdownSec: 10,
  workSec: 120,
  restSec: 30,
  rounds: 8,
  cooldownSec: 0,
  audioEnabled: true,
  final10Beeps: true,
  transitionSounds: true,
  hapticsEnabled: true
});

export const SETTING_LIMITS = Object.freeze({
  countdownSec: { min: 0, max: 60 },
  workSec: { min: 5, max: 3600 },
  restSec: { min: 0, max: 3600 },
  rounds: { min: 1, max: 50 },
  cooldownSec: { min: 0, max: 3600 }
});

const NUMBER_KEYS = Object.keys(SETTING_LIMITS);
const BOOLEAN_KEYS = [
  "audioEnabled",
  "final10Beeps",
  "transitionSounds",
  "hapticsEnabled"
];

export function sanitizeSettings(input) {
  const candidate = { ...DEFAULT_SETTINGS, ...(input || {}) };
  const next = { ...DEFAULT_SETTINGS };

  for (const key of NUMBER_KEYS) {
    const value = Number(candidate[key]);
    const limits = SETTING_LIMITS[key];
    const safeValue = Number.isFinite(value) ? value : DEFAULT_SETTINGS[key];
    next[key] = Math.min(limits.max, Math.max(limits.min, Math.round(safeValue)));
  }

  for (const key of BOOLEAN_KEYS) {
    next[key] = typeof candidate[key] === "boolean" ? candidate[key] : DEFAULT_SETTINGS[key];
  }

  return next;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeSettings(parsed);
    return sanitized;
  } catch (_err) {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  const sanitized = sanitizeSettings(settings);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
}

export function resetSettings() {
  const defaults = { ...DEFAULT_SETTINGS };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}
