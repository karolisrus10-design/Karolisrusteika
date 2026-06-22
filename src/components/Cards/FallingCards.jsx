import React, { useEffect, useRef } from 'react'
import { CARD_ORDER, CARDS } from './cardData.js'
import styles from './FallingCards.module.css'

const BASE_VEL = 34 // px/s — gentle downward drift

/**
 * A vertical stream of service cards that fall from the top, passing in front of the
 * 3D sculpture. They drift down on their own and speed up in whichever direction the
 * visitor scrolls (wheel / touch), easing back to the baseline drift. Clicking a card
 * opens its popup.
 */
export default function FallingCards({ visible, onSelect }) {
  const trackRef = useRef(null)
  const offsetRef = useRef(0)
  const velRef = useRef(BASE_VEL)
  const periodRef = useRef(1000)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const base = reduced ? 0 : BASE_VEL // honour reduced motion: no auto-drift
    velRef.current = base

    // One full set of cards = the loop period (distance to its duplicate).
    const measure = () => {
      const t = trackRef.current
      if (!t || t.children.length <= CARD_ORDER.length) return
      periodRef.current =
        t.children[CARD_ORDER.length].offsetTop - t.children[0].offsetTop || 1000
    }
    measure()
    window.addEventListener('resize', measure)

    let raf
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      // Ease the velocity back toward the baseline drift.
      velRef.current += (base - velRef.current) * Math.min(dt * 1.6, 1)
      offsetRef.current += velRef.current * dt
      const H = periodRef.current || 1000
      offsetRef.current = ((offsetRef.current % H) + H) % H // wrap into [0, H)
      if (trackRef.current) {
        trackRef.current.style.transform = `translateY(${offsetRef.current - H}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Scroll boosts the fall in the scrolled direction.
    const onWheel = (e) => { velRef.current += e.deltaY * 1.1 }
    window.addEventListener('wheel', onWheel, { passive: true })

    // Touch drag (mobile): dragging up/down pushes the stream the same way.
    let lastY = null
    const onTouchStart = (e) => { lastY = e.touches[0].clientY }
    const onTouchMove = (e) => {
      if (lastY == null) return
      const y = e.touches[0].clientY
      velRef.current += (lastY - y) * 5
      lastY = y
    }
    const onTouchEnd = () => { lastY = null }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  // Three repeats so the column always fills the viewport across the wrap.
  const stream = [...CARD_ORDER, ...CARD_ORDER, ...CARD_ORDER]

  return (
    <div className={`${styles.layer} ${visible ? styles.visible : ''}`} aria-hidden={!visible}>
      <div className={styles.track} ref={trackRef}>
        {stream.map((id, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.card} ${styles[id]}`}
            onClick={() => onSelect(id)}
            tabIndex={visible ? 0 : -1}
            aria-label={`${CARDS[id].title} — learn more`}
          >
            <span className={styles.cardLabel}>{CARDS[id].label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
