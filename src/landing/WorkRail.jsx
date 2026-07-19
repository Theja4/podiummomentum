// Horizontal work rail — sticky scrub on desktop, native snap-scroll fallback
// on small screens / reduced motion. All scrub styling is written imperatively
// inside a rAF loop; React state only tracks the active index (≤ 5 updates).
import { useEffect, useRef, useState } from 'react'
import { WORKS, WORK_RAIL } from './data.js'
import TrailCursor from './TrailCursor.jsx'
import {
  clamp,
  clamp01,
  easeOutCubic,
  getScroll,
  reducedMotion,
  useProgress,
  useRafLoop,
} from './motion.js'
import './work.css'

// —— tunables ————————————————————————————————————————————————
const BASE_VH = 100
const VH_PER_CARD = 100
const SECTION_VH = BASE_VH + WORKS.length * VH_PER_CARD
const SMOOTH = 0.12 // progress smoothing for the scrub
const PARALLAX = 12 // px of counter-translate; restrained to keep screenshots crisp
const WORD_SPEED = 0.35 // counter-scroll speed of the giant outline word
const pad2 = n => String(n).padStart(2, '0')

export default function WorkRail({ navigate }) {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const trackRef = useRef(null)
  const wordRef = useRef(null)
  const cardsRef = useRef([])
  const imgsRef = useRef([])
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)
  // "View" chip that replaces the cursor while a card is hovered (TrailCursor).
  const moveRef = useRef({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)

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
  const xPrevRef = useRef(0)
  const cardResetRef = useRef(false)
  useRafLoop(() => {
    if (simple) return
    const stage = stageRef.current
    const track = trackRef.current
    if (!stage || !track) return

    // —— reads: every layout query happens before any style write, so the
    // loop never forces a mid-frame reflow. ——
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
    // The track rect still carries LAST frame's transform; subtracting the
    // previous x recovers the untransformed left edge without a post-write
    // rect read (which forced a reflow every frame).
    const baseLeft = track.getBoundingClientRect().left - xPrevRef.current
    // Whole-pixel rail movement keeps the tag-pill type crisp while the
    // active card is resting in the viewport.
    const x = Math.round(-(p * maxX + easeOutCubic(exit) * 0.35 * vw))
    const trackLeft = baseLeft + x
    const mid = vw / 2
    let best = 0
    let bestDist = Infinity
    const imgX = []
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
      // Inner parallax: image drifts opposite the card's viewport position.
      imgX[i] = Math.round(-clamp(rel, -1, 1) * PARALLAX)
    }

    // —— writes ——
    xPrevRef.current = x
    track.style.transform = `translate3d(${x}px, 0, 0)`
    // Giant outline word drifts the opposite way, slower.
    const word = wordRef.current
    if (word) word.style.transform = `translate3d(${Math.round(-x * WORD_SPEED)}px, -50%, 0)`
    for (let i = 0; i < WORKS.length; i += 1) {
      const card = cardsRef.current[i]
      if (!card) continue
      // Keep the complete card, including its bottom tag pills, at native
      // scale with no parent filter so its type remains sharply rasterized.
      // (One-shot: rewriting 'none' every frame churns style for nothing.)
      if (!cardResetRef.current) card.style.transform = 'none'
      const img = imgsRef.current[i]
      if (img) img.style.transform = `translate3d(${imgX[i]}px, 0, 0) scale(1.03)`
    }
    cardResetRef.current = true
    if (best !== activeRef.current) {
      activeRef.current = best
      setActive(best)
    }
  })

  // Clear inline styles when dropping into simple mode.
  useEffect(() => {
    if (!simple) return
    xPrevRef.current = 0
    cardResetRef.current = false
    const els = [
      trackRef.current,
      wordRef.current,
      ...cardsRef.current,
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
              onMouseEnter={e => {
                moveRef.current.x = e.clientX
                moveRef.current.y = e.clientY
                setHovering(true)
              }}
              onMouseLeave={() => setHovering(false)}
              onMouseMove={e => {
                moveRef.current.x = e.clientX
                moveRef.current.y = e.clientY
              }}
            >
              <div className="pm2-work__cardInner">
                <div className="pm2-work__cardHead">
                  <span className="pm2-work__sector">{work.sector}</span>
                  <span className="pm2-work__index">{pad2(i + 1)}</span>
                </div>
                <h3 className="pm2-work__name">{work.name}</h3>
                <div
                  className={`pm2-work__frame${work.inset ? ' pm2-work__frame--inset' : ''}`}
                  style={{ background: work.frame }}
                >
                  <span className="pm2-work__shot">
                    <img
                      className="pm2-work__cardImg"
                      src={work.image}
                      alt={`${work.name} — ${work.meta}`}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      ref={el => (imgsRef.current[i] = el)}
                    />
                  </span>
                </div>
                <div className="pm2-work__tags">
                  {work.tags.map(tag => (
                    <span className="pm2-work__tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                  <span className="pm2-work__tag pm2-work__tag--result">{work.result}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <TrailCursor label="View" show={hovering && !simple} moveRef={moveRef} />
    </section>
  )
}
