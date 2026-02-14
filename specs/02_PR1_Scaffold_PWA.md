# PR1 — Scaffold + PWA Shell + Settings Persistence

## Objective
Create a vanilla static PWA with two views (Timer, Settings), persistent settings in localStorage, and offline caching of the app shell.

## Scope
- Project file structure
- `index.html`, `styles.css`, `app.js` using ES modules
- Settings view with form + validation + persistence
- Timer view displays current settings values (no running timer yet)
- PWA: manifest, icons, service worker cache

## Deliverables (files)
- `/src/index.html`
- `/src/styles.css`
- `/src/app.js`
- `/src/ui/timerView.js`
- `/src/ui/settingsView.js`
- `/src/core/storage.js`
- `/public/manifest.webmanifest`
- `/public/icon-192.png`, `/public/icon-512.png` (placeholders OK)
- `/service-worker.js`

## Implementation Notes
### Views
- Single-page approach:
  - two root containers: `#timerView`, `#settingsView`
  - show/hide based on in-app navigation
- Settings icon on timer view navigates to settings view.
- Back button in settings returns to timer.

### storage.js
- `loadSettings(): Settings`
- `saveSettings(settings: Settings): void`
- `resetSettings(): Settings` (returns defaults and persists)

### Defaults
Use these defaults:
- countdownSec=10, workSec=120, restSec=30, rounds=8, cooldownSec=0
- audioEnabled=true, final10Beeps=true, transitionSounds=true, hapticsEnabled=true

### Validation
Clamp or reject invalid values; show inline error messages.

### PWA
- `manifest.webmanifest` with:
  - name, short_name
  - start_url
  - display: standalone
  - background_color, theme_color
  - icons 192/512
- `service-worker.js`:
  - cache-first for app shell assets
  - versioned cache name

## Acceptance Criteria
- Opening app shows timer view with settings summary.
- Clicking settings icon opens settings view.
- Save changes; return to timer; settings reflected.
- Reload page; settings persist.
- Service worker installs; app works offline after first load.
- PWA install banner available (where supported) and iPhone Add to Home Screen works.

## Out of Scope
- Timer engine, state machine, ring UI, audio/haptics.
