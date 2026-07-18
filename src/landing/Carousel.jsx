// Services 3D coverflow — a tall section whose sticky stage is scrubbed by
// scroll. Behind (z0): one row of giant marquee text drifting with progress.
// Front (z1): the 7 service cards fanned in 3D (perspective + rotateY).
// All motion runs in one rAF loop writing transforms imperatively — no
// per-frame state. prefers-reduced-motion swaps in a flat scroll-snap row.
import { useRef, useState } from 'react'
import {
  useProgress,
  useRafLoop,
  useVisible,
  clamp,
  clamp01,
  reducedMotion,
} from './motion.js'
import Sparkle from './Sparkle.jsx'
import { SERVICE_CARDS, MARQUEE_ITEMS, CAROUSEL } from './data.js'
import { heroHandoff } from './handoff.js'
import './carousel.css'

// —— tunables ————————————————————————————————————————————————
const N = SERVICE_CARDS.length
const VH_PER_CARD = 55 // section height = 100vh + N * this
const SMOOTH = 0.1 // heavy lerp on scroll progress — butter motion
const SPACING_X = 300 // px between card centres on desktop …
const SPACING_VW = 0.3 // … never wider than 30vw
const SPACING_VW_MOBILE = 0.46 // tighter fan on small screens
const DEPTH_Z = 230 // px pushed back per step from centre
const MAX_DEPTH_STEPS = 3
const ROT_DEG = 36 // rotateY per step from centre
const ROT_MAX = 64
const ROT_MAX_MOBILE = 28
const MOBILE_BP = 900
const OPACITY_FULL = 0.35 // |d| fully opaque inside this
const OPACITY_GONE = 2.4 // |d| invisible beyond this
const ACTIVE_D = 0.5 // |d| below which a card counts as centred/clickable
const MARQUEE_FROM = -12 // marquee x at p=0, % of one sequence width
const MARQUEE_TO = -55 // marquee x at p=1
const MARQUEE_DRIFT = 14 // px/s constant drift on top of the scrub
const LIME_ART = '/assets/pm2/art-lime.jpg'

const FACE_THEMES = new Set(['violet', 'onyx', 'glow', 'lime'])
const faceTheme = card => (FACE_THEMES.has(card.theme) ? card.theme : 'onyx')

const chevron = dir => (
  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d={dir < 0 ? 'M10 2.5 4.5 8l5.5 5.5' : 'M6 2.5 11.5 8 6 13.5'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// Card face layouts per theme (violet / onyx / glow / lime) — markup only;
// all positioning comes from carousel.css.
function CardFace({ card }) {
  const theme = faceTheme(card)
  return (
    <>
      {card.image && (
        <div className="pm2-carousel-card-bg" aria-hidden="true">
          <img src={card.image} alt="" loading="lazy" decoding="async" draggable="false" />
        </div>
      )}

      <div className="pm2-carousel-card-top">
        <span className="pm2-carousel-idx">{String(card.index).padStart(2, '0')}</span>
        <span className="pm2-carousel-domain">{card.domain}</span>
      </div>

      {theme === 'violet' && (
        <div className="pm2-carousel-card-mid">
          <div className="pm2-carousel-orb">
            <Sparkle size={200} color="#0a0512" style={{ width: '100%', height: '100%' }} />
            <Sparkle
              size={80}
              color="#ffffff"
              className="pm2-carousel-orb-core"
              style={{ width: '38%', height: '38%' }}
            />
          </div>
        </div>
      )}

      {(theme === 'onyx' || theme === 'lime') && (
        <>
          <div className="pm2-carousel-cover">
            <img src={LIME_ART} alt="" loading="lazy" decoding="async" draggable="false" />
          </div>
          <div className="pm2-carousel-card-mid">
            <span className="pm2-carousel-chip">{card.line}</span>
          </div>
        </>
      )}

      {theme === 'glow' && (
        <div className="pm2-carousel-card-mid">
          <span className="pm2-carousel-chip pm2-carousel-chip--icon">
            <span className="pm2-carousel-chip-txt">{card.line}</span>
            <span className="pm2-carousel-chip-ico" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 12 12">
                <path
                  d="M6 1v10M1 6h10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
        </div>
      )}

      <div className="pm2-carousel-card-bottom">
        <h3 className="pm2-carousel-card-title">{card.title}</h3>
        {theme === 'violet' && <p className="pm2-carousel-card-line">{card.line}</p>}
        {theme === 'glow' && (
          <span className="pm2-carousel-prog" aria-hidden="true">
            <i style={{ width: `${(card.index / N) * 100}%` }} />
          </span>
        )}
      </div>
    </>
  )
}

export default function Carousel({ navigate }) {
  const sectionRef = useRef(null)
  const marqueeRef = useRef(null)
  const cardRefs = useRef([])
  const fRef = useRef(0) // live float index for click/key handlers
  const [isReduced] = useState(reducedMotion)
  const progress = useProgress(sectionRef, { mode: 'sticky', smooth: SMOOTH })
  const visible = useVisible(sectionRef)

  const linkProps = href => ({
    href,
    onClick: e => {
      e.preventDefault()
      navigate?.(href)
    },
  })

  // Scroll the section so card `idx` sits dead centre (p = idx / (N-1)).
  const scrollToIndex = idx => {
    const el = sectionRef.current
    if (!el || typeof window === 'undefined') return
    const i = clamp(idx, 0, N - 1)
    const top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0)
    const vh = window.innerHeight || 1
    const rangePx = Math.max(1, el.offsetHeight - vh)
    window.scrollTo({ top: top + (i / (N - 1)) * rangePx, behavior: 'smooth' })
  }
  const step = dir => scrollToIndex(Math.round(fRef.current) + dir)

  const onStageKey = e => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  const onCardClick = (card, i) => {
    if (Math.abs(i - fRef.current) < ACTIVE_D) navigate?.(card.href)
    else scrollToIndex(i)
  }

  useRafLoop((dt, now) => {
    if (isReduced || !visible) return
    const vw = window.innerWidth || 1
    const mobile = vw <= MOBILE_BP
    const p = progress.current
    const f = p * (N - 1)
    fRef.current = f

    // Giant marquee: scrubbed -12% -> -55% of one sequence + constant drift.
    const mq = marqueeRef.current
    if (mq) {
      const unit = (mq.firstElementChild && mq.firstElementChild.offsetWidth) || 1
      const base = ((MARQUEE_FROM + (MARQUEE_TO - MARQUEE_FROM) * p) / 100) * unit
      const drift = ((now / 1000) * MARQUEE_DRIFT) % unit
      mq.style.transform = `translate3d(${(base - drift).toFixed(1)}px, -50%, 0)`
    }

    const spacing = mobile ? vw * SPACING_VW_MOBILE : Math.min(SPACING_X, vw * SPACING_VW)
    const rotMax = mobile ? ROT_MAX_MOBILE : ROT_MAX
    for (let i = 0; i < N; i++) {
      const el = cardRefs.current[i]
      if (!el) continue
      const d = i - f
      const ad = Math.abs(d)
      const x = d * spacing
      const z = -Math.min(ad, MAX_DEPTH_STEPS) * DEPTH_Z
      const ry = clamp(-d * ROT_DEG, -rotMax, rotMax)
      let op = clamp01((OPACITY_GONE - ad) / (OPACITY_GONE - OPACITY_FULL))
      // the hero's ghost card becomes this card — keep the real one hidden
      // until the ghost has landed in the slot (complementary cross-fade)
      if (i === 0) op = Math.min(op, 1 - clamp01(heroHandoff.ghostOpacity))
      el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(
        1,
      )}px, 0, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`
      el.style.opacity = op.toFixed(3)
      el.style.zIndex = String(100 - Math.round(ad * 10))
      el.style.pointerEvents = ad < ACTIVE_D ? 'auto' : 'none'
      el.style.visibility = op <= 0.001 ? 'hidden' : 'visible'
    }
  })

  // —— reduced motion: plain horizontal scroll-snap row ————————————————
  if (isReduced) {
    return (
      <section className="pm2-carousel pm2-carousel--flat" id="services" ref={sectionRef}>
        <div className="pm2-carousel-flat-head">
          <span className="pm2-kicker">{CAROUSEL.kicker}</span>
        </div>
        <div className="pm2-carousel-flat-row" role="list">
          {SERVICE_CARDS.map(card => (
            <a
              key={card.slug}
              role="listitem"
              className={`pm2-carousel-card pm2-carousel-card--${faceTheme(card)}`}
              aria-label={`${card.title}: ${card.line}`}
              {...linkProps(card.href)}
            >
              <CardFace card={card} />
            </a>
          ))}
        </div>
        <div className="pm2-carousel-flat-foot">
          <a className="pm2-pill pm2-pill--solid" {...linkProps(CAROUSEL.cta.href)}>
            {CAROUSEL.cta.label}
          </a>
        </div>
      </section>
    )
  }

  const marqueeSeq = copy => (
    <span className="pm2-carousel-mseq" key={copy}>
      {MARQUEE_ITEMS.map((item, i) => (
        <span className="pm2-carousel-mitem" key={i}>
          <span className={`pm2-carousel-mword${i % 2 ? ' is-outline' : ''}`}>{item}</span>
          <Sparkle
            size={70}
            color="#6d28d9"
            className="pm2-carousel-mspark"
            style={{ width: '0.34em', height: '0.34em' }}
          />
        </span>
      ))}
    </span>
  )

  return (
    <section
      className="pm2-carousel"
      id="services"
      ref={sectionRef}
      style={{ height: `${100 + N * VH_PER_CARD}vh` }}
    >
      <div className="pm2-carousel-sticky">
        <div className="pm2-carousel-marquee" ref={marqueeRef} aria-hidden="true">
          {[0, 1].map(marqueeSeq)}
        </div>

        <div
          className="pm2-carousel-stage"
          tabIndex={0}
          role="group"
          aria-label="Services carousel — use arrow keys to browse"
          onKeyDown={onStageKey}
        >
          {SERVICE_CARDS.map((card, i) => (
            <article
              key={card.slug}
              ref={el => {
                cardRefs.current[i] = el
              }}
              className={`pm2-carousel-card pm2-carousel-card--${faceTheme(card)}`}
              aria-label={`${card.title}: ${card.line}`}
              onClick={() => onCardClick(card, i)}
            >
              <CardFace card={card} />
            </article>
          ))}
        </div>

        <div className="pm2-carousel-foot">
          <span className="pm2-kicker">{CAROUSEL.kicker}</span>
          <a className="pm2-pill pm2-pill--solid" {...linkProps(CAROUSEL.cta.href)}>
            {CAROUSEL.cta.label}
          </a>
        </div>

        <div className="pm2-carousel-nav">
          <button type="button" aria-label="Previous service" onClick={() => step(-1)}>
            {chevron(-1)}
          </button>
          <button type="button" aria-label="Next service" onClick={() => step(1)}>
            {chevron(1)}
          </button>
        </div>
      </div>
    </section>
  )
}
