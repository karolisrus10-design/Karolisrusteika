import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './PaperPanel.module.css'

export default function PaperPanel({ onClose, title, children }) {
  const panelRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
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
        className={styles.paper}
        onClick={e => e.stopPropagation()}
        role="document"
      >
        <div className={styles.grainOverlay} />
        <div className={styles.worn} />

        <div className={styles.inner}>
          {title && <div className={styles.title}>{title}</div>}
          <div className={styles.content}>{children}</div>
        </div>

        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close panel">
          <span>✕</span>
        </button>
      </div>
    </div>
  )
}
