// Finale — the closing CTA (reference frame f_067): a light page band holding
// a violet radial panel with the big chrome star on the right. The panel
// enters with a scrubbed clip-path + rise, and the star grows via scaleRef
// driven by the panel's enter progress.
import { useEffect, useRef } from 'react'
import { FINALE } from './data.js'
import Sparkle from './Sparkle.jsx'
import ChromeStar from './ChromeStar.jsx'
import { useRafLoop, useProgress, lerp, easeOutCubic, reducedMotion } from './motion.js'
import './finale.css'

// —— tunables ————————————————————————————————————————————————————————
const STAR_SPIN = 1.6 // faster rotation while entering
const STAR_FROM = 0.55
const STAR_TO = 1.12
const PANEL_RISE = 60 // px translateY at enter start
const CLIP_Y = 6 // % vertical inset at enter start
const CLIP_X = 3 // % horizontal inset at enter start
const CLIP_RADIUS = 40 // px corner radius at enter start

export default function Finale({ navigate }) {
  const panelRef = useRef(null)
  const starScale = useRef(STAR_FROM)
  const flags = useRef({ reduced: false, radius: CLIP_RADIUS })
  const enter = useProgress(panelRef, { mode: 'enter', smooth: 0.12 })

  useEffect(() => {
    const f = flags.current
    f.reduced = reducedMotion()
    if (f.reduced) {
      // Static end state: full-size star, no clip scrub.
      starScale.current = STAR_TO
      return undefined
    }
    const panel = panelRef.current
    if (!panel) return undefined
    // Arms the CSS starting pose (clipped + lowered); the rAF loop then
    // scrubs inline styles from there. Without this class the panel rests
    // fully visible — also the no-JS / reduced-motion fallback.
    panel.classList.add('pm2-scrub')
    const r = parseFloat(getComputedStyle(panel).borderTopLeftRadius)
    if (Number.isFinite(r) && r > 0) f.radius = r
    return () => panel.classList.remove('pm2-scrub')
  }, [])

  useRafLoop(() => {
    if (flags.current.reduced) return
    const panel = panelRef.current
    if (!panel) return
    const e = easeOutCubic(enter.current)
    starScale.current = lerp(STAR_FROM, STAR_TO, e)
    const iy = ((1 - e) * CLIP_Y).toFixed(2)
    const ix = ((1 - e) * CLIP_X).toFixed(2)
    const ir = lerp(CLIP_RADIUS, flags.current.radius, e).toFixed(1)
    panel.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${ir}px)`
    panel.style.transform = `translate3d(0, ${((1 - e) * PANEL_RISE).toFixed(1)}px, 0)`
  })

  const go = e => {
    e.preventDefault()
    navigate?.(FINALE.cta.href)
  }

  return (
    <section className="pm2-finale">
      <div className="pm2-finale-panel" ref={panelRef}>
        <div className="pm2-finale-noise" aria-hidden="true" />
        <Sparkle
          className="pm2-finale-watermark"
          size={460}
          color="none"
          stroke="#e9d5ff"
        />
        <div className="pm2-finale-grid">
          <div className="pm2-finale-copy">
            <h2 className="pm2-finale-title">
              <span>{FINALE.line1}</span>
              <span className="pm2-finale-dim">{FINALE.line2}</span>
            </h2>
            <p className="pm2-finale-text">{FINALE.copy}</p>
            <a
              href={FINALE.cta.href}
              className="pm2-pill pm2-pill--white"
              onClick={go}
            >
              {FINALE.cta.label}
            </a>
          </div>
          <div className="pm2-finale-star">
            <ChromeStar spin={STAR_SPIN} scaleRef={starScale} />
          </div>
        </div>
      </div>
    </section>
  )
}
