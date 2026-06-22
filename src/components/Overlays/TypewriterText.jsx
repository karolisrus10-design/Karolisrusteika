import React, { useEffect, useRef, useState } from 'react'

// Character-by-character typewriter that handles newlines and bold markers
export default function TypewriterText({ text, speed = 28, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')

    const tick = () => {
      indexRef.current++
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current < text.length) {
        timerRef.current = setTimeout(tick, speed)
      } else {
        onDone?.()
      }
    }
    timerRef.current = setTimeout(tick, 100)
    return () => clearTimeout(timerRef.current)
  }, [text, speed])

  // Render with simple bold/newline support
  return (
    <span>
      {displayed.split('\n').map((line, li, arr) => (
        <React.Fragment key={li}>
          {line.split(/(\*\*[^*]+\*\*)/).map((chunk, ci) =>
            chunk.startsWith('**') && chunk.endsWith('**')
              ? <strong key={ci}>{chunk.slice(2, -2)}</strong>
              : chunk
          )}
          {li < arr.length - 1 && <br />}
        </React.Fragment>
      ))}
      <span className="cursor">█</span>
    </span>
  )
}
