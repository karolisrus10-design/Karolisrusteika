import React from 'react'
import { playUiSound } from '../../audio/audioManager.js'
import styles from './ClickMe.module.css'

/**
 * "MY PORTFOLIO" launcher — a glassmorphism tile (bottom-right) with a play badge,
 * a soft purple glow and a gentle float. Opens the reel modal on click.
 */
export default function ClickMe({ onClick, visible }) {
  return (
    <button
      className={`${styles.portfolio} ${visible ? styles.visible : ''}`}
      onClick={onClick}
      onMouseEnter={() => playUiSound('hover')}
      aria-label="Open my portfolio reel"
    >
      <span className={styles.play} aria-hidden="true">
        <svg viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19" /></svg>
      </span>
      <span className={styles.label}>MY<br />PORTFOLIO</span>
    </button>
  )
}
