// Horizontal work rail — sticky scrub on desktop, native snap-scroll fallback
// on small screens / reduced motion. All scrub styling is written imperatively
// inside a rAF loop; React state only tracks the active index (≤ 5 updates).
import { useEffect, useRef, useState } from 'react'
import { WORKS, WORK_RAIL } from './data.js'
import {
  clamp,
  clamp01,
  easeOutCubic,
  getScroll,
  lerp,
  reducedMotion,
  useProgress,
  useRafLoop,
} from './motion.js'
import './work.css'

// —— tunables ————————————————————————————————————————————————
const BASE_VH = 100
const VH_PER_CARD = 88
const SECTION_VH = BASE_VH + WORKS.length * VH_PER_CARD
const SMOOTH = 0.12 // progress smoothing for the scrub
const CARD_LERP = 0.14 // per-frame lerp for distance-based card styling
const INACTIVE_SCALE = 0.93
const INACTIVE_BRIGHTNESS = 0.62
const INACTIVE_SATURATE = 0.8
const ACTIVE_RADIUS = 0.55 // fraction of viewport width over which a card activates
const PARALLAX = 24 // px of counter-translate on card images
const WORD_SPEED = 0.35 // counter-scroll speed of the giant outline word
const pad2 = n => String(n).padStart(2, '0')

export default function WorkRail({ navigate }) {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const trackRef = useRef(null)
  const wordRef = useRef(null)
  const cardsRef = useRef([])
  const innersRef = useRef([])
  const imgsRef = useRef([])
  const animRef = useRef([]) // per-card lerped { s, b, sa }
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  // Simple mode: native overflow-x snap row instead of the pinned scrub.
  const [simple, setSimple] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(max-width: 900px)').matches || reducedMotion()),
  )
  useEffect(() => {
    const mqWidth = window.matchMedia('(max-width: 900px)')
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSimple(mqWidth.matches || mqMotion.matches)
    update()
    mqWidth.addEventListener('change', update)
    mqMotion.addEventListener('change', update)
    return () => {
      mqWidth.removeEventListener('change', update)
      mqMotion.removeEventListener('change', update)
    }
  }, [])

  const progress = useProgress(sectionRef, { mode: 'sticky', smooth: SMOOTH })

  // —— scrub loop (desktop only) ————————————————————————————————
  useRafLoop(() => {
    if (simple) return
    const stage = stageRef.current
    const track = trackRef.current
    if (!stage || !track) return
    const vw = stage.clientWidth || 1
    const p = progress.current

    // Measure the track every frame — never hardcode travel distance.
    const maxX = Math.max(0, track.offsetWidth - vw)
    // Exit continuation: once the rail unpins, keep drifting the cards left
    // while the section leaves the viewport, so the horizontal motion hands
    // off into the gallery's diagonal pan with no dead beat.
    const { vh } = getScroll()
    const sr = sectionRef.current.getBoundingClientRect()
    const exit = clamp01((vh - sr.bottom) / vh)
    const x = -(p * maxX + easeOutCubic(exit) * 0.35 * vw)
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`

    // Giant outline word drifts the opposite way, slower.
    const word = wordRef.current
    if (word) word.style.transform = `translate3d(${(-x * WORD_SPEED).toFixed(2)}px, -50%, 0)`

    // One rect for the track; card centers are derived from offsets.
    const trackLeft = track.getBoundingClientRect().left
    const mid = vw / 2
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < WORKS.length; i += 1) {
      const card = cardsRef.current[i]
      if (!card) continue
      const center = trackLeft + card.offsetLeft + card.offsetWidth / 2
      const rel = (center - mid) / vw
      const dist = Math.abs(rel)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
      const t = clamp01(1 - dist / ACTIVE_RADIUS)
      const a =
        animRef.current[i] ||
        (animRef.current[i] = {
          s: INACTIVE_SCALE,
          b: INACTIVE_BRIGHTNESS,
          sa: INACTIVE_SATURATE,
        })
      a.s = lerp(a.s, lerp(INACTIVE_SCALE, 1, t), CARD_LERP)
      a.b = lerp(a.b, lerp(INACTIVE_BRIGHTNESS, 1, t), CARD_LERP)
      a.sa = lerp(a.sa, lerp(INACTIVE_SATURATE, 1, t), CARD_LERP)
      card.style.transform = `translate3d(0, 0, 0) scale(${a.s.toFixed(4)})`
      const inner = innersRef.current[i]
      if (inner)
        inner.style.filter = `brightness(${a.b.toFixed(3)}) saturate(${a.sa.toFixed(3)})`
      // Inner parallax: image drifts opposite the card's viewport position.
      const img = imgsRef.current[i]
      if (img)
        img.style.transform = `translate3d(${(-clamp(rel, -1, 1) * PARALLAX).toFixed(
          2,
        )}px, 0, 0) scale(1.06)`
    }
    if (best !== activeRef.current) {
      activeRef.current = best
      setActive(best)
    }
  })

  // Clear inline styles when dropping into simple mode.
  useEffect(() => {
    if (!simple) return
    const els = [
      trackRef.current,
      wordRef.current,
      ...cardsRef.current,
      ...innersRef.current,
      ...imgsRef.current,
    ]
    els.forEach(el => {
      if (!el) return
      el.style.transform = ''
      el.style.filter = ''
    })
  }, [simple])

  // Active index from native scroll position in simple mode.
  const onTrackScroll = () => {
    if (!simple) return
    const track = trackRef.current
    if (!track) return
    const mid = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    cardsRef.current.forEach((card, i) => {
      if (!card) return
      const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    if (best !== activeRef.current) {
      activeRef.current = best
      setActive(best)
    }
  }

  const ctaHref = WORKS[active]?.href || '/'

  return (
    <section
      ref={sectionRef}
      className={`pm2-work pm2-on-dark${simple ? ' pm2-work--simple' : ''}`}
      id="work"
      style={simple ? undefined : { height: `${SECTION_VH}vh` }}
    >
      <div className="pm2-work__stage" ref={stageRef}>
        <div className="pm2-work__glow" aria-hidden="true" />
        <div className="pm2-work__word" ref={wordRef} aria-hidden="true">
          Momentum
        </div>

        <header className="pm2-work__head">
          <div className="pm2-work__headLeft">
            <span className="pm2-kicker">{WORK_RAIL.kicker}</span>
            <span className="pm2-work__count">
              {pad2(active + 1)} / {pad2(WORKS.length)}
            </span>
          </div>
          <a
            className="pm2-pill pm2-pill--ghost pm2-work__cta"
            href={ctaHref}
            onClick={e => {
              e.preventDefault()
              navigate?.(ctaHref)
            }}
          >
            {WORK_RAIL.cta}
          </a>
        </header>

        <div className="pm2-work__track" ref={trackRef} onScroll={onTrackScroll}>
          {WORKS.map((work, i) => (
            <a
              key={work.name}
              className="pm2-work__card"
              href={work.href}
              ref={el => (cardsRef.current[i] = el)}
              onClick={e => {
                e.preventDefault()
                navigate?.(work.href)
              }}
            >
              <div className="pm2-work__cardInner" ref={el => (innersRef.current[i] = el)}>
                <img
                  className="pm2-work__cardImg"
                  src={work.image}
                  alt={`${work.name} — ${work.meta}`}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  ref={el => (imgsRef.current[i] = el)}
                />
                <div className="pm2-work__shade" aria-hidden="true" />
                <div className="pm2-work__meta">{work.meta}</div>
                <h3 className="pm2-work__name">{work.name}</h3>
                <span className="pm2-work__result">{work.result}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
