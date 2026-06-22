import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CARDS } from './cardData.js'
import styles from './CardModal.module.css'

/**
 * Popup shown when a falling card is clicked. Themed to the card's accent colour.
 */
export default function CardModal({ card, onClose, onContact }) {
  const backdropRef = useRef(null)
  const panelRef = useRef(null)
  const data = card ? CARDS[card] : null

  useEffect(() => {
    if (!data) return
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 30, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }
    )
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card])

  const handleClose = () => {
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.28 })
    gsap.to(panelRef.current, {
      opacity: 0, y: 20, scale: 0.97, duration: 0.28, ease: 'power2.in',
      onComplete: onClose,
    })
  }

  if (!data) return null

  return (
    <div ref={backdropRef} className={styles.backdrop} onClick={handleClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        style={{ '--accent': data.color, '--accent-rgb': data.rgb }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={data.title}
      >
        <button className={styles.close} onClick={handleClose} aria-label="Close">✕</button>

        <div className={styles.eyebrow}>{data.title}</div>
        <h2 className={styles.headline}>{data.headline}</h2>
        <p className={styles.text}>{data.text}</p>

        <ul className={styles.bullets}>
          {data.bullets.map((b) => (
            <li key={b}><span className={styles.check}>✔</span>{b}</li>
          ))}
        </ul>

        <button className={styles.cta} type="button" onClick={onContact}>
          Start a project →
        </button>
      </div>
    </div>
  )
}
