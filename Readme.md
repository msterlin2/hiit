# HIIT Timer PWA

This was a simple test of codex 5.3 to write a PWA application. The purpose is to see what it could do and get some experience with codex.  It took about an hour.  It looks nice and seems to work well on the phone.

Here's the AI Generated readme;:

A simple, fast, offline-capable **HIIT (High Intensity Interval Training)** interval timer built as a **Progressive Web App (PWA)** optimized for iPhone.

This app supports configurable:

- Start countdown  
- Work intervals  
- Rest intervals  
- Number of rounds  
- Optional cooldown  
- Final 10-second audio countdown beeps  
- Phase transition sounds  
- Best-effort haptics (where supported)

Designed as a lightweight personal training timer with no accounts, no backend, and no distractions.

---

## Features

- ✅ Circular SVG countdown ring  
- ✅ Work / Rest interval cycling  
- ✅ Round progress blocks  
- ✅ Pause / Resume  
- ✅ Skip Phase + Skip Countdown  
- ✅ Restart workout with confirmation  
- ✅ Persistent settings via `localStorage`  
- ✅ Offline support via Service Worker  
- ✅ Installable on iPhone Home Screen  
- ✅ Custom app icon + standalone mode  

---

## Live Demo (GitHub Pages)

This app is deployed via GitHub Pages:

https://msterlin2.github.io/hiit/


## Install on iPhone

1. Open the app URL in **Safari**
2. Tap the **Share** icon
3. Select **Add to Home Screen**
4. Launch it like a normal app

---

## Local Development

Because this is a static vanilla PWA, you can run it locally with any simple server.

### Option 1: Python

```bash
cd src
python -m http.server 8000
````

Then open:

```
http://localhost:8000
```

### Option 2: VS Code Live Server

* Install the **Live Server** extension
* Right-click `src/index.html`
* Choose **Open with Live Server**

---

## Deployment (GitHub Pages)

This repo uses GitHub Actions to deploy the contents of `src/` as the live site root.

Workflow file:

```
.github/workflows/pages.yml
```

To redeploy:

```bash
git add .
git commit -m "Update app"
git push
```

GitHub will automatically publish updates to Pages.

---

## Notes on iOS PWAs

* Audio requires a user gesture to unlock (`Start` button)
* Icons are cached aggressively
* Service worker updates may require a refresh or reinstall


---

## Credits

Built as a lightweight personal HIIT timer using:

* Vanilla HTML/CSS/JavaScript
* Web Audio API
* SVG-based progress ring
* GitHub Pages hosting
* Coded by Codex 5.3