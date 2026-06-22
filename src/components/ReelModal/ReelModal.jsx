import React, { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import styles from './ReelModal.module.css'

export default function ReelModal({ onClose, soundOn }) {
  const backdropRef = useRef(null)
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.93, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: 0.05 }
    )

    // Auto-play
    videoRef.current?.play().then(() => setPlaying(true)).catch(() => {})

    // Move focus into the modal and remember what to restore on close.
    const prevFocus = document.activeElement
    containerRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') { handleClose(); return }
      // Focus trap: keep Tab within the modal's focusable controls.
      if (e.key === 'Tab') {
        const focusables = containerRef.current?.querySelectorAll(
          'button, [href], video, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      // Restore focus to the trigger when the modal closes.
      if (prevFocus && prevFocus.focus) prevFocus.focus()
    }
  }, [])

  const handleClose = useCallback(() => {
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 })
    gsap.to(containerRef.current, {
      opacity: 0, scale: 0.93, y: 16, duration: 0.3, ease: 'power2.in',
      onComplete: onClose
    })
  }, [onClose])

  const togglePlay = () => {
    const vid = videoRef.current
    if (!vid) return
    if (vid.paused) { vid.play(); setPlaying(true) }
    else { vid.pause(); setPlaying(false) }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setMuted(v => !v)
  }

  const handleTimeUpdate = () => {
    const vid = videoRef.current
    if (!vid) return
    setProgress(vid.currentTime / (vid.duration || 1))
  }

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current?.duration || 0)
  }

  const handleProgressClick = (e) => {
    const bar = progressRef.current
    if (!bar || !videoRef.current) return
    const rect = bar.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pct * videoRef.current.duration
  }

  const fmt = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div ref={backdropRef} className={styles.backdrop} onClick={handleClose}>
      <div
        ref={containerRef}
        className={styles.container}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Portfolio reel"
        tabIndex={-1}
      >
        <video
          ref={videoRef}
          src="/assets/portfolio-reel.mp4"
          className={styles.video}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setPlaying(false)}
          playsInline
          preload="metadata"
        />

        {/* Custom controls */}
        <div className={styles.controls}>
          <button className={styles.ctrl} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing
              ? <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            }
          </button>

          <div ref={progressRef} className={styles.progressBar} onClick={handleProgressClick}>
            <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
          </div>

          <span className={styles.time}>
            {fmt(progress * duration)} / {fmt(duration)}
          </span>

          <button className={styles.ctrl} onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted
              ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            }
          </button>
        </div>

        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close reel">
          <span className={styles.closeLine} />
          <span className={styles.closeLine} />
        </button>
      </div>
    </div>
  )
}
