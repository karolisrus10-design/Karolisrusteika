import { Howl, Howler } from 'howler'

const BG_VOLUME = 0.35                       // target background-music level
const DEFAULT_SRC = '/assets/bg-music.mp3'

let analyser = null
let audioCtx = null
let started = false                          // has the audio system been initialised
let currentSrc = DEFAULT_SRC                 // the active vibe's track
let currentHowl = null
let stopTimer = null                         // pending "pause after fade-out"
const howls = {}                             // src -> Howl (lazily created, cached)

function getHowl(src) {
  if (!howls[src]) {
    howls[src] = new Howl({ src: [src], loop: true, volume: BG_VOLUME, html5: false })
  }
  return howls[src]
}

export async function initAudio() {
  if (started) return
  started = true
  getHowl(currentSrc) // creating the first Howl spins up Howler.ctx + masterGain

  // Wire up a WebAudio analyser for the 3D visualizer by tapping Howler's master
  // mix. Every track routes through masterGain, so the analyser keeps working no
  // matter which vibe's track is playing. We connect masterGain → analyser but do
  // NOT route the analyser onward to the destination (that would double the signal).
  try {
    audioCtx = Howler.ctx || null
    if (audioCtx && Howler.masterGain) {
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      Howler.masterGain.connect(analyser)
    }
  } catch (e) {
    // Analyser setup failed — 3D will fall back to calm idle motion.
    analyser = null
  }
}

export function playBgMusic() {
  if (!started) return
  // Cancel any pending pause so a quick off→on isn't paused out from under us.
  if (stopTimer) { clearTimeout(stopTimer); stopTimer = null }
  const h = getHowl(currentSrc)
  currentHowl = h
  if (!h.playing()) h.play()
  // Always fade the volume back up — stop leaves it at 0, so otherwise a second
  // play would be silent.
  h.fade(h.volume(), BG_VOLUME, 500)
}

export function stopBgMusic() {
  if (!currentHowl || !currentHowl.playing()) return
  const h = currentHowl
  h.fade(h.volume(), 0, 450)
  if (stopTimer) clearTimeout(stopTimer)
  stopTimer = setTimeout(() => { if (h) h.pause(); stopTimer = null }, 480)
}

// Switch the background track for a new "vibe". Crossfades when sound is playing;
// otherwise just records the selection so the next play uses the right track.
export function setVibeTrack(src, shouldPlay) {
  if (!src || src === currentSrc) {
    if (src === currentSrc && shouldPlay) playBgMusic()
    return
  }
  const prev = currentHowl
  currentSrc = src
  if (!started) return // not initialised yet — selection is remembered for first play

  const next = getHowl(src)
  if (shouldPlay) {
    if (stopTimer) { clearTimeout(stopTimer); stopTimer = null }
    if (prev && prev.playing()) {
      prev.fade(prev.volume(), 0, 500)
      const p = prev
      setTimeout(() => { if (p && p.playing()) p.pause() }, 520)
    }
    currentHowl = next
    next.volume(0)
    if (!next.playing()) next.play()
    next.fade(0, BG_VOLUME, 650)
  } else {
    currentHowl = next
  }
}

// Resume a suspended AudioContext (browsers start it suspended until a gesture)
// and make sure music is actually playing. Used to honour autoplay-on-load on the
// visitor's first interaction.
export function resumeAudio() {
  try {
    if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume()
  } catch (e) { /* ignore */ }
  if (currentHowl && !currentHowl.playing()) playBgMusic()
}

export function getAnalyser() {
  return analyser
}

export function playUiSound(type) {
  // UI sounds are subtle tone blips generated via WebAudio (no file needed)
  try {
    const ctx = Howler.ctx || new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const configs = {
      menu:  { freq: 520, type: 'sine',     dur: 0.12, vol: 0.04 },
      panel: { freq: 440, type: 'sine',     dur: 0.10, vol: 0.03 },
      hover: { freq: 660, type: 'triangle', dur: 0.06, vol: 0.02 },
      click: { freq: 380, type: 'sine',     dur: 0.08, vol: 0.03 },
    }

    const cfg = configs[type] || configs.click
    osc.type = cfg.type
    osc.frequency.setValueAtTime(cfg.freq, ctx.currentTime)
    gain.gain.setValueAtTime(cfg.vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + cfg.dur)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + cfg.dur)
  } catch (e) {
    // Silently fail if audio context unavailable
  }
}
