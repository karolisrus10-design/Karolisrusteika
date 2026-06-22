import React from 'react'
import PaperPanel from './PaperPanel.jsx'
import TypewriterText from './TypewriterText.jsx'

const ABOUT_TEXT = `I'm Karolis. I turn products into experiences people remember.\n\nThrough cinematic motion and high-converting visuals, I help brands feel more premium, capture attention faster, and increase perceived value instantly.\n\n**Built for startups, SaaS, and ecommerce brands that want to stand out instead of blend in.**`

export default function AboutPanel({ onClose }) {
  return (
    <PaperPanel onClose={onClose} title="// about.txt">
      <TypewriterText text={ABOUT_TEXT} speed={22} />
    </PaperPanel>
  )
}
