import React, { useState } from 'react'
import { playUiSound } from '../../audio/audioManager.js'
import styles from './MenuButton.module.css'

/**
 * Neon "MENU" control drawn entirely in CSS/SVG (no image asset), so it scales
 * crisply, blends perfectly with the background, and can glow on hover/press.
 */
export default function MenuButton({ onClick, visible }) {
  const [hovered, setHovered] = useState(false)

  const handleEnter = () => {
    setHovered(true)
    playUiSound('hover')
  }

  return (
    <button
      id="menu-btn"
      className={`${styles.menuBtn} ${visible ? styles.visible : ''} ${hovered ? styles.hovered : ''}`}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHovered(false)}
      aria-label="Open menu"
    >
      <span className={styles.label}>MENU</span>
      {/* Hand-drawn-style underline sweep, matching the reference mark. */}
      <svg className={styles.curve} viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M4,54 C64,46 150,34 216,6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
