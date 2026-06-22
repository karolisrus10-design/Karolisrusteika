import React, { useState } from 'react'
import PaperPanel from './PaperPanel.jsx'
import TypewriterText from './TypewriterText.jsx'
import styles from './ContactPanel.module.css'

const CONTACT_TEXT = `**Let's Build Something People Remember**\n\nWhether you need product motion, SaaS visuals, launch content, or high-converting ads, I'll help your brand feel premium and impossible to ignore.\n\nFast replies. Fast delivery. Built for results.`

export default function ContactPanel({ onClose }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('karolisrusteika@gmail.com').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <PaperPanel onClose={onClose} title="// contact.txt">
      <TypewriterText text={CONTACT_TEXT} speed={22} />
      <div className={styles.emailRow}>
        <a href="mailto:karolisrusteika@gmail.com" className={styles.email}>
          karolisrusteika@gmail.com
        </a>
        <button className={styles.copyBtn} onClick={handleCopy} title="Copy email">
          {copied ? '✓' : '⎘'}
        </button>
      </div>
    </PaperPanel>
  )
}
