import React from 'react'
import styles from './VibeButton.module.css'

const LABELS = { basic: 'BASIC', luxury: 'LUXURY', phonk: 'PHONK' }
const ORDER = ['basic', 'luxury', 'phonk']

/**
 * Top-left control that cycles the site "vibe" — each vibe swaps the background
 * palette and the background-music track. The button itself auto-themes to the
 * active vibe's accent via CSS variables.
 */
export default function VibeButton({ vibe, onCycle, visible }) {
  return (
    <button
      className={`${styles.vibeBtn} ${visible ? styles.visible : ''}`}
      onClick={onCycle}
      aria-label={`Change vibe — current: ${LABELS[vibe]}. Click to cycle.`}
      title="Change the vibe (background + music)"
    >
      <span className={styles.eyebrow}>VIBE</span>
      <span className={styles.label}>{LABELS[vibe]}</span>
      <span className={styles.dots}>
        {ORDER.map((v) => (
          <span key={v} className={`${styles.dot} ${v === vibe ? styles.dotActive : ''}`} />
        ))}
      </span>
    </button>
  )
}
