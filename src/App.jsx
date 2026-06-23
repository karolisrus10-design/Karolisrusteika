import React, { useState, useRef, useEffect, useCallback } from 'react'
import Loader from './components/Loader/Loader.jsx'
import HeroScene, { HeroFallback } from './components/HeroScene/HeroScene.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import MenuButton from './components/Menu/MenuButton.jsx'
import MenuOverlay from './components/Menu/MenuOverlay.jsx'
import SoundButton from './components/SoundButton/SoundButton.jsx'
import ClickMe from './components/ClickMe/ClickMe.jsx'
import ReelModal from './components/ReelModal/ReelModal.jsx'
import VibeButton from './components/VibeButton/VibeButton.jsx'
import FallingCards from './components/Cards/FallingCards.jsx'
import CardModal from './components/Cards/CardModal.jsx'
import { initAudio, playBgMusic, stopBgMusic, playUiSound, getAnalyser, resumeAudio, setVibeTrack } from './audio/audioManager.js'

// Each vibe swaps the background palette (via the [data-vibe] CSS variables) and
// the background-music track.
const VIBE_ORDER = ['basic', 'luxury', 'phonk']
const VIBE_TRACK = {
  basic:  '/assets/bg-music.mp3',
  luxury: '/assets/vibe-luxury.mp3',
  phonk:  '/assets/vibe-phonk.mp3',
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState(null) // 'about'|'pricing'|'contact'
  const [reelOpen, setReelOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [soundState, setSoundState] = useState('off') // 'off'|'turning-on'|'playing'|'turning-off'
  const [vibe, setVibe] = useState('basic')
  const [cardModal, setCardModal] = useState(null) // 'websites'|'basic'|'hyper'|null

  const analyserRef = useRef(null)
  const soundOnRef = useRef(false) // guards against double-enable (e.g. session resume)

  // Apply the vibe: swap the palette (data attribute drives CSS variables) and the
  // music track (crossfades only if sound is currently playing).
  useEffect(() => {
    document.documentElement.setAttribute('data-vibe', vibe)
    setVibeTrack(VIBE_TRACK[vibe], soundOnRef.current)
  }, [vibe])

  const cycleVibe = () => {
    playUiSound('panel')
    setVibe((v) => VIBE_ORDER[(VIBE_ORDER.indexOf(v) + 1) % VIBE_ORDER.length])
  }

  const handleLoadComplete = () => {
    setLoaded(true)
  }

  const enableSound = useCallback(() => {
    if (soundOnRef.current) return
    soundOnRef.current = true
    setSoundState('turning-on')
    initAudio().then(() => {
      playBgMusic()
      analyserRef.current = getAnalyser()
      setTimeout(() => {
        setSoundOn(true)
        setSoundState('playing')
      }, 800)
    })
    try { sessionStorage.setItem('karolis-sound', 'on') } catch (e) {}
  }, [])

  const disableSound = useCallback(() => {
    if (!soundOnRef.current) return
    soundOnRef.current = false
    setSoundState('turning-off')
    stopBgMusic()
    setTimeout(() => {
      setSoundOn(false)
      setSoundState('off')
    }, 800)
    try { sessionStorage.setItem('karolis-sound', 'off') } catch (e) {}
  }, [])

  const handleSoundToggle = () => {
    soundOnRef.current ? disableSound() : enableSound()
  }

  // Auto-start music once the page is revealed (unless the visitor explicitly muted
  // earlier this session). Browsers block silent autoplay until a gesture, so we kick
  // the AudioContext on the visitor's first interaction — music then begins the moment
  // they move/click/tap, which is as close to "plays on arrival" as the browser allows.
  useEffect(() => {
    if (!loaded) return
    let pref
    try { pref = sessionStorage.getItem('karolis-sound') } catch (e) { pref = null }
    if (pref === 'off') return // respect an explicit mute

    enableSound() // flips the button to "playing" and queues playback

    const kick = () => {
      resumeAudio() // resume the suspended context + ensure it's actually playing
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
      window.removeEventListener('touchstart', kick)
    }
    window.addEventListener('pointerdown', kick)
    window.addEventListener('keydown', kick)
    window.addEventListener('touchstart', kick)
    return () => {
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
      window.removeEventListener('touchstart', kick)
    }
  }, [loaded, enableSound])

  const handleMenuOpen = () => {
    playUiSound('menu')
    setMenuOpen(true)
  }

  const handleMenuClose = () => {
    setMenuOpen(false)
    setActivePanel(null)
  }

  const handlePanelOpen = (panel) => {
    playUiSound('panel')
    setActivePanel(panel)
  }

  const handleReelOpen = () => {
    setReelOpen(true)
    if (soundOn) stopBgMusic()
  }

  const handleReelClose = () => {
    setReelOpen(false)
    if (soundOn) playBgMusic()
  }

  return (
    <>
      <a href="#menu-btn" className="skip-link">Skip to menu</a>

      {!loaded && <Loader onComplete={handleLoadComplete} />}

      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease', width: '100%', height: '100%' }}>
        <ErrorBoundary fallback={<HeroFallback dimmed={menuOpen || reelOpen || !!cardModal || !!activePanel} />}>
          <HeroScene
            soundOn={soundOn}
            analyser={analyserRef.current}
            dimmed={menuOpen || reelOpen || !!cardModal || !!activePanel}
          />
        </ErrorBoundary>

        <FallingCards
          visible={loaded && !menuOpen && !reelOpen && !cardModal && !activePanel}
          onSelect={setCardModal}
        />

        <ClickMe onClick={handleReelOpen} visible={loaded && !menuOpen && !reelOpen} />

        <MenuButton
          onClick={handleMenuOpen}
          visible={loaded && !menuOpen}
        />

        <SoundButton
          soundState={soundState}
          onClick={handleSoundToggle}
          visible={loaded}
        />

        <VibeButton
          vibe={vibe}
          onCycle={cycleVibe}
          visible={loaded && !menuOpen}
        />
      </div>

      {/* Cinematic flash on each vibe change (replays via key); hidden under the
          loader on first paint. */}
      <div key={vibe} className="vibe-flash" aria-hidden="true" />

      <MenuOverlay
        open={menuOpen}
        onClose={handleMenuClose}
        activePanel={activePanel}
        onPanelOpen={handlePanelOpen}
        onPanelClose={() => setActivePanel(null)}
        onContactOpen={() => handlePanelOpen('contact')}
      />

      {reelOpen && (
        <ReelModal
          onClose={handleReelClose}
          soundOn={soundOn}
        />
      )}

      {cardModal && (
        <CardModal
          card={cardModal}
          onClose={() => setCardModal(null)}
          onContact={() => { setCardModal(null); handlePanelOpen('contact') }}
        />
      )}
    </>
  )
}
