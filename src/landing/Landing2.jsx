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
