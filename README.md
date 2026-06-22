# Karolis — Premium Motion Design Personal Brand Site

A single-page, single-screen immersive site for a motion designer's personal brand.
Cinematic dark UI, a rotating liquid-glass 3D hero, a "dry riverbed fills with water"
loading sequence, neon corner controls, retro typewriter panels, a premium reel modal,
and a Howler-driven sound system with an audio-reactive 3D object.

---

## ▶ Run it

```bash
npm install && npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).
Build for production with `npm run build` and preview with `npm run preview`.

Requires Node 18+.

---

## 🔁 Replace these files (placeholder → where it's used)

All live assets are in **`public/assets/`**. Drop your real files in using the **exact
same filename** and they'll be picked up automatically — no code changes needed.

### Core assets (actively used)

| File (in `public/assets/`) | What it is | Where it's used |
|---|---|---|
| `hero.glb` | The 3D centre piece (glass/iridescent sculpture) | `components/HeroScene` — the rotating hero object |
| `bg-music.mp3` | Looping music for the **Basic** vibe | `audio/audioManager.js` — toggled by the SOUND button |
| `vibe-luxury.mp3` | Looping music for the **Luxury** vibe | swapped in by the VIBE button (top-left) |
| `vibe-phonk.mp3` | Looping music for the **Phonk** vibe | swapped in by the VIBE button (top-left) |
| `portfolio-reel.mp4` | Your main reel / portfolio video | `components/ReelModal` — opens in the centred modal |

> **Note:** the **MENU**, **click me**, and **SOUND** controls are now drawn entirely in
> CSS/SVG — neon MENU text + curve, a glowing "click me" arc with a travelling light, and a
> sun/equalizer sound emblem whose bars bounce only while audio plays. They use no image or
> video assets, so there's nothing to swap there; restyle them in their component CSS.
> The hero 3D object also **expands/contracts with the music** (bass-driven scale pulse).

### Fonts (currently missing — add these)

| File (in `public/fonts/`) | Used for |
|---|---|
| `NeueMontreal.woff2` | Display / headings |
| `EditorialNew.woff2` | Editorial / body accents |

> The site runs fine without them — it falls back to clean system fonts
> (Helvetica/Inter, Georgia). Drop the two `.woff2` files in `public/fonts/`
> to get the intended typography. (`@font-face` is already wired in `src/styles/global.css`.)

### Reference / spare frames (shipped but not currently rendered)

These came in with the asset pack and are kept for reference or future use — safe to
ignore or delete: `overall-look.png`, `hero-poster.png`, `menu.png`, `menu-idle.png`,
`menu-hovered.png`, `menu-effects.mp4`, `sound-base.png`, `sound-off.png`,
`sound-clicked.png`, `sound-turning-on.mp4`, `sound-playing.mp4`, `sound-turning-off.mp4`,
`clickme-idle.png`, `clickme-hover-start.mp4`, `clickme-hovered.mp4`,
`clickme-unhovered.mp4`, `clickme-end.png`, `clickme-dola.mp4`.

---

## 🎨 Design decisions worth knowing

- **"Background couldn't match" → blend modes + ambient backlights.** The neon
  corner-control assets (menu, sound, click-me) ship with a near-black background baked in.
  They're composited with `mix-blend-mode: screen`, which drops the dark backing plate so
  only the glow shows. On top of that, each control has a **blurred, enlarged copy of its
  own art behind it** (a screen-blended "ambient backlight"), so the picture's colours
  bleed softly into the background — the control reads as embedded, not pasted on.
- **Atmospheric background.** Instead of a flat fill, the background layers soft colour
  pools that sit under each corner control (crimson top-right, blue/crimson left and
  bottom-right) plus a central blue glow that seats the 3D object in light, over a faint
  star field. This is what makes "the background match the pictures around them."
- **3D object normalisation.** The hero GLB is auto-centred on the origin and scaled to a
  fixed target size at load, so it always appears centred and well-sized regardless of the
  source model's units or pivot — then given an opaque iridescent liquid-chrome material so
  it's reliably visible against the dark scene.
- **Menu hover.** The supplied "hovered" menu art is blue-on-**white**, which would blow
  out to a white box under `screen`. Instead the crimson neon is shifted toward the brand
  ultramarine with a CSS hue filter on hover — same intent, stays seamless.
- **Loader robustness.** The reveal is driven by `setTimeout` (with a GSAP flourish on
  top), so the site always reveals even if the tab is backgrounded mid-load (where
  `requestAnimationFrame`/GSAP would otherwise freeze).
- **Audio-reactive 3D.** When music plays, the hero's scale pumps on the beat via a
  WebAudio `AnalyserNode` tapping Howler's master mix (bass-weighted, fast attack); muted
  falls back to calm idle motion.
- **Vibe switcher (top-left).** Cycles **Basic → Luxury → Phonk**, each swapping the whole
  background palette (driven by `[data-vibe]` CSS variables in `src/styles/global.css`) and
  the music track (crossfaded in `audio/audioManager.js`), with a cinematic flash on change.
  To add or retune a vibe: edit the `:root[data-vibe="…"]` palette, add the track to
  `VIBE_TRACK` in `src/App.jsx`, and drop the `.mp3` in `public/assets/`.
- **Falling service cards** (`components/Cards`). A centred stream of cards — **Websites**
  (purple), **Motion** (red), **Hyper motion** (blue) — drifts down in front of the
  sculpture and speeds up in whichever direction you scroll (wheel/touch), easing back to a
  gentle drift (rAF-driven, seamless wrap). Clicking a card opens a colour-themed popup with
  that service's copy + benefits + CTA. Edit copy/colours in `components/Cards/cardData.js`.

---

## 🧱 Structure

```
public/
  assets/   → all swappable media (see table above)
  fonts/    → self-hosted woff2 fonts
src/
  components/
    Loader/        → riverbed-fills-with-water loading sequence
    HeroScene/     → react-three-fiber canvas, 3D object, env map, bloom
    Menu/          → MENU button + full-screen nav overlay
    Overlays/      → About / Pricing / Contact panels (paper + typewriter, premium pricing)
    ClickMe/       → middle-left reel opener with hover video states
    ReelModal/     → centred video modal with custom controls + focus trap
    SoundButton/   → animated equalizer toggle (bottom-right)
  audio/           → Howler setup, UI blips, analyser wiring
  styles/          → global.css (tokens, grain, focus, reduced-motion)
  App.jsx          → state + composition
```

## ♿ Accessibility & performance

- Keyboard: `Esc` closes panels/menu/modal; the reel modal traps focus and restores it on
  close; visible-on-focus **Skip to menu** link; `:focus-visible` outlines.
- `prefers-reduced-motion`: the loader cuts to a short fade and heavy transitions are
  collapsed.
- Performance: capped device pixel ratio, lazy video. Music auto-starts on the
  visitor's first interaction (browsers block silent autoplay, so the AudioContext is
  unlocked on the first click/move/tap); the mute preference then persists per-session.

## 🛠 Stack

React + Vite · three.js via @react-three/fiber + drei · @react-three/postprocessing
(bloom) · GSAP (timelines) · Howler.js (audio).
