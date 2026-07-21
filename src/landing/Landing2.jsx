// Landing page composition root — replaces LandingFx on the home route.
// Sections are self-contained components in this folder; each owns its CSS.
import { useEffect } from 'react'
import './tokens.css'
import Hero from './Hero.jsx'
import Carousel from './Carousel.jsx'
import Beyond from './Beyond.jsx'
import WorkRail from './WorkRail.jsx'
import Gallery from './Gallery.jsx'

export default function Landing2({ navigate }) {
  useEffect(() => {
    // Scopes the floating-pill header restyle (and any page-level overrides)
    // to the landing only; removed on unmount so other routes stay untouched.
    document.body.classList.add('pm2-active')
    return () => document.body.classList.remove('pm2-active')
  }, [])

  useEffect(() => {
    // On mobile, the browser's collapsing toolbar/navigation area exposes its
    // theme colour around the visual viewport. Follow whichever section owns
    // the viewport centre so the dark landing run never ends in a white bar.
    const meta = document.querySelector('meta[name="theme-color"]')
    const previousTheme = meta?.getAttribute('content') || '#ffffff'
    let frame = 0
    let dark = false

    const updateViewportTheme = () => {
      frame = 0
      const center = document.elementFromPoint(
        Math.max(0, window.innerWidth / 2),
        Math.max(0, window.innerHeight / 2),
      )
      const nextDark = Boolean(center?.closest?.('.pm2-on-dark'))
      if (nextDark === dark) return
      dark = nextDark
      document.body.classList.toggle('pm2-dark-viewport', dark)
      meta?.setAttribute('content', dark ? '#040a07' : '#ffffff')
    }

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateViewportTheme)
    }

    updateViewportTheme()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate, { passive: true })
    window.visualViewport?.addEventListener('resize', requestUpdate, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      window.visualViewport?.removeEventListener('resize', requestUpdate)
      document.body.classList.remove('pm2-dark-viewport')
      meta?.setAttribute('content', previousTheme)
    }
  }, [])

  useEffect(() => {
    // The shared footer carries the site-wide [data-reveal] entrance and sits
    // outside this root, so reveal it from here (same contract as LandingFx).
    const nodes = [...document.querySelectorAll('footer[data-reveal]')]
    if (!nodes.length || typeof IntersectionObserver === 'undefined') {
      nodes.forEach(n => n.classList.add('is-inview'))
      return undefined
    }
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    nodes.forEach(n => io.observe(n))
    return () => io.disconnect()
  }, [])

  return (
    <main className="pm2" aria-label="Podium Momentum — home">
      <Hero navigate={navigate} />
      <Carousel navigate={navigate} />
      <Beyond />
      <WorkRail navigate={navigate} />
      <Gallery />
    </main>
  )
}
