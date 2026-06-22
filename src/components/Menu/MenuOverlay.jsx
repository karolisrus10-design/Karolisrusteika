import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import AboutPanel from '../Overlays/AboutPanel.jsx'
import PricingPanel from '../Overlays/PricingPanel.jsx'
import ContactPanel from '../Overlays/ContactPanel.jsx'
import styles from './MenuOverlay.module.css'

const NAV_ITEMS = [
  { id: 'about',   label: 'About'   },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Contact' },
]

export default function MenuOverlay({ open, onClose, activePanel, onPanelOpen, onPanelClose, onContactOpen }) {
  const overlayRef = useRef(null)
  const navRef = useRef(null)
  const itemsRef = useRef([])

  useEffect(() => {
    if (!overlayRef.current) return
    if (open) {
      gsap.set(overlayRef.current, { display: 'flex' })
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      gsap.fromTo(
        itemsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
      )
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0, duration: 0.25, ease: 'power2.in',
        onComplete: () => gsap.set(overlayRef.current, { display: 'none' })
      })
    }
  }, [open])

  // Esc closes the menu (only when no panel is open — panels handle their own Esc).
  useEffect(() => {
    if (!open || activePanel) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, activePanel, onClose])

  return (
    <>
      <div
        ref={overlayRef}
        className={styles.overlay}
        style={{ display: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <span className={styles.closeLine} />
          <span className={styles.closeLine} />
        </button>

        <nav ref={navRef} className={styles.nav}>
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => (itemsRef.current[i] = el)}
              className={`${styles.navItem} ${activePanel === item.id ? styles.active : ''}`}
              onClick={() => activePanel === item.id ? onPanelClose() : onPanelOpen(item.id)}
            >
              <span className={styles.navIndex}>0{i + 1}</span>
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.navArrow}>→</span>
            </button>
          ))}
        </nav>

        <div className={styles.tagline}>
          Premium Motion Design
        </div>
      </div>

      {/* Panels render on top of overlay */}
      {activePanel === 'about'   && <AboutPanel   onClose={onPanelClose} />}
      {activePanel === 'pricing' && <PricingPanel onClose={onPanelClose} onContact={onContactOpen} />}
      {activePanel === 'contact' && <ContactPanel onClose={onPanelClose} />}
    </>
  )
}
