import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './PricingPanel.module.css'

export default function PricingPanel({ onClose, onContact }) {
  const panelRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
    )
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleClose = () => {
    gsap.to(panelRef.current, {
      opacity: 0, y: 20, duration: 0.25, ease: 'power2.in',
      onComplete: onClose
    })
  }

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        onClick={e => e.stopPropagation()}
        role="document"
      >
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close panel">✕</button>

        <div className={styles.eyebrow}>Premium Motion</div>

        <div className={styles.priceRow}>
          <span className={styles.oldPrice}>500 — 1500</span>
          <span className={styles.newPrice}>300 — 500</span>
        </div>

        <div className={styles.divider} />

        <p className={styles.description}>
          High-converting motion visuals for brands that want to look premium and move faster than competitors.
          <br /><br />
          <span className={styles.highlight}>Limited discounted pricing while we scale.</span>
        </p>

        <ul className={styles.featureList}>
          <li><span className={styles.dot} />Fast delivery</li>
          <li><span className={styles.dot} />Premium execution</li>
          <li><span className={styles.dot} />Built to convert</li>
        </ul>

        <div className={styles.urgency}>
          Reserve your spot before pricing increases.
        </div>

        <button
          className={styles.cta}
          onClick={() => { handleClose(); setTimeout(onContact, 300) }}
        >
          Reserve Your Spot →
        </button>
      </div>
    </div>
  )
}
