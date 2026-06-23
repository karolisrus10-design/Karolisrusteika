import React from 'react'

/**
 * Catches render-time errors in its subtree and shows `fallback` instead of letting
 * the error unmount the whole app. Used to isolate the WebGL 3D scene: if the GPU /
 * WebGL context fails, the rest of the site keeps working.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Log for debugging; the fallback keeps the page alive.
    console.error('[ErrorBoundary] caught:', error, info)
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
