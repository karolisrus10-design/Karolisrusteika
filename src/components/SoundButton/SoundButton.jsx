import React from 'react'
import styles from './SoundButton.module.css'

/**
 * Sound toggle drawn in CSS/SVG (no video assets): a neon emblem with an equalizer
 * at its centre. The bars bounce only while audio plays and collapse to a flat line
 * when muted. soundState: 'off' | 'turning-on' | 'playing' | 'turning-off'.
 */
export default function SoundButton({ soundState, onClick, visible }) {
  const playing = soundState === 'playing' || soundState === 'turning-on'
  const bars = [0, 1, 2, 3, 4]

  return (
    <button
      className={`${styles.soundBtn} ${visible ? styles.visible : ''} ${playing ? styles.playing : styles.muted}`}
      onClick={onClick}
      aria-label={playing ? 'Mute sound' : 'Unmute sound'}
      title={playing ? 'Sound on' : 'Sound off'}
    >
      <svg className={styles.emblem} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="soundGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6f8c" />
            <stop offset="100%" stopColor="#3b7bff" />
          </linearGradient>
        </defs>

        {/* Radiating spokes (sun motif) — slowly rotate while playing */}
        <g className={styles.spokes}>
          {[...Array(28)].map((_, i) => {
            const a = (i / 28) * Math.PI * 2
            const r1 = 43, r2 = 49
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * r1}
                y1={50 + Math.sin(a) * r1}
                x2={50 + Math.cos(a) * r2}
                y2={50 + Math.sin(a) * r2}
                stroke="url(#soundGrad)"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            )
          })}
        </g>

        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#soundGrad)" strokeWidth="2.4" />

        {/* Equalizer bars */}
        <g className={styles.bars}>
          {bars.map((i) => (
            <rect key={i} className={styles.bar} x={37 + i * 6} y={36} width="3" height="28" rx="1.5" />
          ))}
        </g>
      </svg>
    </button>
  )
}
