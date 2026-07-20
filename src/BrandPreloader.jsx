import { useEffect, useState } from 'react'
import './brand-preloader.css'

const EXIT_DELAY = 2050
const REMOVE_DELAY = 3050
const INITIAL_PAGE_IS_HOME = typeof window !== 'undefined' &&
  (window.location.pathname === '/' || window.location.pathname === '')

// This module survives client-side route changes but is evaluated again after
// a real page load. Claiming the preloader once therefore prevents it from
// replaying when users navigate back home, while refreshes still replay it.
let initialPreloaderClaimed = false

function shouldShowPreloader() {
  if (!INITIAL_PAGE_IS_HOME || initialPreloaderClaimed) return false
  initialPreloaderClaimed = true
  return true
}

export default function BrandPreloader() {
  const [phase, setPhase] = useState(() => {
    const shouldShow = shouldShowPreloader()
    if (shouldShow) {
      // Set the loading contract during render, before the shared header is
      // committed. Waiting for useEffect leaves one paint where the landing
      // navbar can appear above the preloader.
      document.documentElement.classList.add('pm-preloader-active')
      document.body.classList.remove('pm-preloader-complete', 'page-loaded')
    }
    return shouldShow ? 'entering' : 'hidden'
  })

  useEffect(() => {
    if (phase === 'hidden') return undefined

    const root = document.documentElement
    root.classList.add('pm-preloader-active')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const exitDelay = reducedMotion ? 250 : EXIT_DELAY
    const removeDelay = reducedMotion ? 500 : REMOVE_DELAY

    const exitTimer = window.setTimeout(() => setPhase('exiting'), exitDelay)
    const removeTimer = window.setTimeout(() => {
      root.classList.remove('pm-preloader-active')
      document.body.classList.add('pm-preloader-complete')
      window.dispatchEvent(new CustomEvent('pm:preloader-complete'))
      setPhase('hidden')
    }, removeDelay)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(removeTimer)
      root.classList.remove('pm-preloader-active')
    }
  }, [])

  if (phase === 'hidden') return null

  return (
    <div
      className={`pm-preloader is-${phase}`}
      role="status"
      aria-label="Podium Momentum is loading"
      aria-live="polite"
    >
      <div className="pm-preloader__wash" aria-hidden="true" />
      <div className="pm-preloader__brand">
        <span className="pm-preloader__logo-mask" aria-hidden="true">
          <img
            className="pm-preloader__logo"
            src="/assets/brand-lockup.png"
            width="1982"
            height="319"
            alt=""
          />
        </span>
        <span className="pm-preloader__sr">Podium Momentum</span>
      </div>
    </div>
  )
}