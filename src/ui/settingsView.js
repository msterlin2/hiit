import { DEFAULT_SETTINGS, SETTING_LIMITS, sanitizeSettings } from "../core/storage.js";

const NUMBER_FIELDS = [
  "countdownSec",
  "workSec",
  "restSec",
  "rounds",
  "cooldownSec"
];

const TOGGLE_FIELDS = [
  "audioEnabled",
  "final10Beeps",
  "transitionSounds",
  "hapticsEnabled"
];

function fieldLabel(key) {
  const labels = {
    countdownSec: "Countdown (sec)",
    workSec: "Work (sec)",
    restSec: "Rest (sec)",
    rounds: "Rounds",
    cooldownSec: "Cooldown (sec)"
  };
  return labels[key] || key;
}

function validateForm(data) {
  const errors = {};
  const cleaned = {};

  for (const key of NUMBER_FIELDS) {
    const raw = data[key];
    if (raw === "" || raw === null || raw === undefined) {
      errors[key] = "Required";
      continue;
    }
    const numeric = Number(raw);
    const { min, max } = SETTING_LIMITS[key];
    if (!Number.isFinite(numeric)) {
      errors[key] = "Must be a number";
      continue;
    }
    if (numeric < min || numeric > max) {
      errors[key] = `Must be between ${min} and ${max}`;
      continue;
    }
    cleaned[key] = Math.round(numeric);
  }

  for (const key of TOGGLE_FIELDS) {
    cleaned[key] = Boolean(data[key]);
  }

  return { errors, cleaned };
}

function formValuesFromState(formEl) {
  const formData = new FormData(formEl);
  const values = {};

  for (const key of NUMBER_FIELDS) {
    values[key] = formData.get(key);
  }

  for (const key of TOGGLE_FIELDS) {
    values[key] = formData.get(key) === "on";
  }

  return values;
}

function setInlineErrors(formEl, errors) {
  const errorNodes = formEl.querySelectorAll(".field-error");
  errorNodes.forEach((node) => {
    node.textContent = "";
  });

  Object.entries(errors).forEach(([key, message]) => {
    const errorEl = formEl.querySelector(`[data-error-for="${key}"]`);
    if (errorEl) {
      errorEl.textContent = message;
    }
  });
}

function numericFieldMarkup(key, value) {
  const limits = SETTING_LIMITS[key];
  return `
    <label class="field">
      <span class="field-label">${fieldLabel(key)}</span>
      <input
        class="field-input"
        type="number"
        name="${key}"
        inputmode="numeric"
        min="${limits.min}"
        max="${limits.max}"
        value="${value}"
        required
      >
      <small class="field-hint">Range: ${limits.min} to ${limits.max}</small>
      <small class="field-error" data-error-for="${key}" role="alert"></small>
    </label>
  `;
}

function toggleFieldMarkup(key, checked, label) {
  return `
    <label class="toggle">
      <input type="checkbox" name="${key}" ${checked ? "checked" : ""}>
      <span>${label}</span>
    </label>
  `;
}

function formatOnOff(value) {
  return value ? "On" : "Off";
}

function renderSummary(settings) {
  return `
    <li><span>Countdown</span><strong>${settings.countdownSec}s</strong></li>
    <li><span>Work</span><strong>${settings.workSec}s</strong></li>
    <li><span>Rest</span><strong>${settings.restSec}s</strong></li>
    <li><span>Rounds</span><strong>${settings.rounds}</strong></li>
    <li><span>Cooldown</span><strong>${settings.cooldownSec}s</strong></li>
    <li><span>Audio</span><strong>${formatOnOff(settings.audioEnabled)}</strong></li>
    <li><span>Final-10 Beeps</span><strong>${formatOnOff(settings.final10Beeps)}</strong></li>
    <li><span>Transition Sounds</span><strong>${formatOnOff(settings.transitionSounds)}</strong></li>
    <li><span>Haptics</span><strong>${formatOnOff(settings.hapticsEnabled)}</strong></li>
  `;
}

export function createSettingsView(rootEl, { settings, onBack, onSave }) {
  rootEl.innerHTML = `
    <header class="view-header">
      <h1 id="settingsTitle" class="view-title">Settings</h1>
      <button id="settingsBackBtn" class="text-button" type="button">Back</button>
    </header>
    <form id="settingsForm" class="settings-form" novalidate>
      <div class="settings-grid">
        <section class="card">
          <h2 class="card-title">Current Settings</h2>
          <ul id="settingsCurrentSummary" class="settings-summary">
            ${renderSummary(settings)}
          </ul>
        </section>
        <section class="card">
          <h2 class="card-title">Edit Settings</h2>
          ${NUMBER_FIELDS.map((key) => numericFieldMarkup(key, settings[key])).join("")}
          <div class="settings-toggle-group">
            ${toggleFieldMarkup("audioEnabled", settings.audioEnabled, "Audio enabled")}
            ${toggleFieldMarkup("final10Beeps", settings.final10Beeps, "Final 10-second beeps")}
            ${toggleFieldMarkup("transitionSounds", settings.transitionSounds, "Transition sounds")}
            ${toggleFieldMarkup("hapticsEnabled", settings.hapticsEnabled, "Haptics enabled")}
          </div>
        </section>
      </div>
      <div class="settings-actions">
        <button id="saveSettingsBtn" class="primary-button" type="submit">Save</button>
        <button id="resetSettingsBtn" class="secondary-button" type="button">Reset Defaults</button>
      </div>
    </form>
  `;

  const formEl = rootEl.querySelector("#settingsForm");
  const backBtn = rootEl.querySelector("#settingsBackBtn");
  const resetBtn = rootEl.querySelector("#resetSettingsBtn");
  const summaryEl = rootEl.querySelector("#settingsCurrentSummary");

  backBtn.addEventListener("click", onBack);

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = formValuesFromState(formEl);
    const { errors, cleaned } = validateForm(values);
    setInlineErrors(formEl, errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    const nextSettings = sanitizeSettings(cleaned);
    onSave(nextSettings);
  });

  resetBtn.addEventListener("click", () => {
    update(DEFAULT_SETTINGS);
  });

  function update(nextSettings) {
    const sanitized = sanitizeSettings(nextSettings);
    summaryEl.innerHTML = renderSummary(sanitized);
    NUMBER_FIELDS.forEach((key) => {
      const field = formEl.querySelector(`[name="${key}"]`);
      if (field) {
        field.value = String(sanitized[key]);
      }
    });
    TOGGLE_FIELDS.forEach((key) => {
      const toggle = formEl.querySelector(`[name="${key}"]`);
      if (toggle) {
        toggle.checked = Boolean(sanitized[key]);
      }
    });
    setInlineErrors(formEl, {});
  }

  return {
    update
  };
}
