import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './Loader.module.css'

export default function Loader({ onComplete }) {
  const containerRef = useRef(null)
  const waterRef = useRef(null)
  const ripple1Ref = useRef(null)
  const ripple2Ref = useRef(null)
  const glintRef = useRef(null)
  const progressRef = useRef(0)
  const doneRef = useRef(false)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // The ONLY path that reveals the app. Idempotent and driven by setTimeout (not
    // rAF), so it fires even if the tab is backgrounded and rAF/GSAP is throttled.
    const reveal = () => {
      if (doneRef.current) return
      doneRef.current = true
      onComplete()
    }

    // --- Reduced motion: skip the cinematic fill, do a short fade ---
    if (reduced) {
      setPct(100)
      if (containerRef.current) {
        gsap.to(containerRef.current, { opacity: 0, duration: 0.4, onComplete: reveal })
      }
      const guard = setTimeout(reveal, 600) // guaranteed reveal
      return () => clearTimeout(guard)
    }

    const minDuration = 2400 // ms minimum so the intro is felt, not skipped

    // Simulate load progress (water rising). Clamp shy of full; finish() tops it off.
    let frame
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const natural = Math.min(elapsed / minDuration, 0.92)
      progressRef.current = natural
      setPct(Math.round(natural * 100))
      if (natural < 0.92) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    // Surface ripples
    if (ripple1Ref.current && ripple2Ref.current) {
      gsap.to(ripple1Ref.current, { x: '+=8', yoyo: true, repeat: -1, duration: 1.1, ease: 'sine.inOut' })
      gsap.to(ripple2Ref.current, { x: '-=6', yoyo: true, repeat: -1, duration: 0.9, ease: 'sine.inOut', delay: 0.4 })
    }

    // Glint sweep across the water
    if (glintRef.current) {
      gsap.fromTo(glintRef.current,
        { x: '-120%', opacity: 0 },
        { x: '220%', opacity: 0.6, duration: 1.6, ease: 'power1.inOut', repeat: -1, repeatDelay: 1.2 }
      )
    }

    // Best-effort cinematic dissolve: settle the water, then recede the loader to
    // reveal the hero. Its onComplete calls reveal() on a normal (visible) tab.
    const finish = () => {
      cancelAnimationFrame(frame)
      setPct(100)
      if (!containerRef.current) { reveal(); return }
      const tl = gsap.timeline({ onComplete: reveal })
      tl.to(waterRef.current, { scaleY: 1.08, duration: 0.3, ease: 'back.out(2)' })
        .to(waterRef.current, { scaleY: 1, duration: 0.2 })
        .to(containerRef.current, { yPercent: -105, duration: 0.7, ease: 'power2.inOut', delay: 0.15 })
    }
    const finishTimer = setTimeout(finish, minDuration + 300)

    // Safety net: if rAF/GSAP is throttled (tab backgrounded), the dissolve's
    // onComplete never fires — guarantee the reveal regardless of animation state.
    const guardTimer = setTimeout(reveal, minDuration + 300 + 1700)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(finishTimer)
      clearTimeout(guardTimer)
    }
  }, [onComplete])

  return (
    <div ref={containerRef} className={styles.loader}>
      <div className={styles.riverBed}>
        {/* Dry channel walls */}
        <div className={styles.bedWall} />
        <div className={styles.bedFloor} />

        {/* Water fill */}
        <div
          ref={waterRef}
          className={styles.water}
          style={{ width: `${pct}%` }}
        >
          {/* Ripple lines */}
          <div ref={ripple1Ref} className={styles.ripple} style={{ top: '30%' }} />
          <div ref={ripple2Ref} className={styles.ripple} style={{ top: '65%' }} />

          {/* Glint */}
          <div ref={glintRef} className={styles.glint} />
        </div>

        {/* Crimson micro-dots (surface glints) */}
        {[...Array(6)].map((_, i) => (
          <Glint key={i} pct={pct} index={i} />
        ))}
      </div>

      <div className={styles.label}>
        <span className={styles.name}>KAROLIS</span>
        <span className={styles.pctText}>{pct}%</span>
      </div>
    </div>
  )
}

function Glint({ pct, index }) {
  const ref = useRef(null)
  const activated = pct > (index / 6) * 100

  useEffect(() => {
    if (activated && ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }
      )
    }
  }, [activated])

  const left = `${(index / 6) * 90 + 2}%`
  const top = `${25 + (index % 3) * 20}%`

  return (
    <div
      ref={ref}
      className={styles.crimsonGlint}
      style={{ left, top, opacity: 0 }}
    />
  )
}
