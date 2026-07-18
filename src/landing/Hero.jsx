// Hero — the landing's signature pinned sequence, traced frame-by-frame from
// the reference film (0–1s):
//   1. on load, the hero card plays its entrance: twists and falls into place
//      while its photo image wipes in top→bottom (any image works)
//   2. on scroll, the SAME card transforms: a sliding wipe rises from the
//      card's bottom edge to its top, revealing the lime face — the exact
//      reverse of the load wipe — no second card ever appears
//   3. simultaneously, the purple panel spins ~90° clockwise about its center,
//      while the card slides to the stage center, grows (capped inside the
//      viewport so content stays crisp), and swivels upright — all at once
//   4. it shrinks to the exact coverflow card size, falls into the first
//      card's live slot, and swaps invisibly (faces pixel-identical)
// All scroll motion runs in one rAF loop writing transforms imperatively.
import { useEffect, useRef } from 'react'
import {
  useRafLoop,
  useProgress,
  usePointer,
  clamp01,
  lerp,
  range,
  easeInOutCubic,
  easeOutBack,
} from './motion.js'
import Sparkle from './Sparkle.jsx'
import { HERO, SERVICE_CARDS } from './data.js'
import { heroHandoff } from './handoff.js'
import './hero.css'

// the coverflow's first card — the hero card morphs into its face mid-fall
const CARD0 = SERVICE_CARDS[0]

// —— tunables ————————————————————————————————————————————————
const TILT = {
  spin: 88, // deg, clockwise in-plane rotation of the panel
  spinFrom: 0.1, // sticky progress where the spin starts
  spinTo: 0.95,
  scale: 0.8, // end scale as it recedes
  driftXvw: 14, // sweeps right as it finishes the rotation
  driftYvh: 12, // and downward, clearing the stage for the card
  tipX: 8, // deg, subtle backward tip for depth (kept small — the film is flat)
  fadeStart: 0.62, // panel opacity 1→0 across fadeStart→fadeEnd
  fadeEnd: 0.86,
  perspective: 1600, // px — mirrored by --pm2-hero-perspective in hero.css
}
const CARD_JOURNEY = {
  slideFrom: 0.08, // the card slides to center — same driver as the spin
  slideTo: 0.95,
  growScale: 1.7, // capped live to fit inside 86% of the viewport — no blur
  uprightFrom: 0.15, // swivels into upright EARLY — simultaneous with the spin
  uprightTo: 0.75,
  wipeFrom: 0.12, // the lime face wipes in bottom→top (reverse of the load wipe)
  wipeTo: 0.55,
  seatFrom: 0.86, // shrinks to the exact coverflow card size, fully upright
  seatTo: 1,
  // the fall into the coverflow's first-card slot is driven live by that
  // section's rise (see the rAF loop): merge across rise 0.62→0.97, then a
  // hard one-frame swap at rise 0.96 (faces are pixel-identical by then)
}
const IDLE_TILT_DEG = 2.5 // pointer-driven idle tilt while scroll progress ≈ 0
const IDLE_TILT_RANGE = 0.12 // sticky-progress range over which idle tilt dies
const CARD_PARALLAX = { translate: 14, rotate: 8, lerp: 0.12 } // px / deg / per-frame
const PROGRESS_SMOOTH = 0.14

export default function Hero({ navigate }) {
  const sectionRef = useRef(null)
  const panelRef = useRef(null)
  const cardRef = useRef(null)
  const limeRef = useRef(null)
  const photoRef = useRef(null)
  const carouselRef = useRef(null)
  const card0Ref = useRef(null)

  const sticky = useProgress(sectionRef, { mode: 'sticky', smooth: PROGRESS_SMOOTH })
  const pointer = usePointer()

  const cardCur = useRef({ x: 0, y: 0, r: 0 })
  // Static mode: small screens (no sticky/tilt) or reduced motion — the rAF
  // loop then clears its writes and CSS lays out a plain stacked hero.
  const staticRef = useRef(false)

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 900px)')
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      staticRef.current = mqMobile.matches || mqReduced.matches
    }
    update()
    mqMobile.addEventListener('change', update)
    mqReduced.addEventListener('change', update)
    return () => {
      mqMobile.removeEventListener('change', update)
      mqReduced.removeEventListener('change', update)
      // release the coverflow's first card when the hero unmounts
      heroHandoff.ghostOpacity = 0
    }
  }, [])

  useRafLoop(() => {
    const panel = panelRef.current
    const card = cardRef.current
    const lime = limeRef.current
    const photo = photoRef.current

    if (staticRef.current) {
      // Let CSS own the layout entirely (stacked mobile hero / reduced motion).
      heroHandoff.ghostOpacity = 0
      if (panel) {
        panel.style.transform = ''
        panel.style.opacity = ''
        panel.style.pointerEvents = ''
      }
      if (card) {
        card.style.transform = ''
        card.style.opacity = ''
        card.style.removeProperty('--m')
      }
      if (lime) lime.style.clipPath = ''
      if (photo) {
        photo.style.transform = ''
        photo.style.opacity = ''
      }
      return
    }

    const vw = window.innerWidth || 1
    const vh = window.innerHeight || 1

    // —— panel spin (sticky progress 0→1): flat ~90° clockwise rotation ——
    const s = sticky.current
    const e = easeInOutCubic(range(s, TILT.spinFrom, TILT.spinTo))
    const idle = 1 - range(s, 0, IDLE_TILT_RANGE)
    const px = pointer.current.x
    const py = pointer.current.y
    const rx = TILT.tipX * e - py * IDLE_TILT_DEG * idle
    const ry = px * IDLE_TILT_DEG * idle
    const rz = TILT.spin * e
    const sc = lerp(1, TILT.scale, e)
    const tx = TILT.driftXvw * e
    const ty = TILT.driftYvh * e
    const op = 1 - range(s, TILT.fadeStart, TILT.fadeEnd)
    if (panel) {
      panel.style.transform = `translate3d(${tx.toFixed(3)}vw, ${ty.toFixed(3)}vh, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${sc.toFixed(4)})`
      panel.style.opacity = op.toFixed(3)
      panel.style.pointerEvents = op < 0.05 ? 'none' : ''
    }

    // —— the hero card: wipes photo→lime, slides to center, grows, swivels
    // upright, shrinks, then falls into the coverflow's first card slot ——
    if (card) {
      // Rest geometry is MEASURED (offsetLeft/offsetTop are layout values,
      // unaffected by the transforms we write), never mirrored from CSS.
      const heroR = sectionRef.current ? sectionRef.current.getBoundingClientRect() : null
      const stickySpan = heroR ? heroR.height - vh : 0
      // sticky stage: pinned at 0 while the section scrolls through, then
      // scrolls up with it after release
      const stageTop = heroR ? (heroR.top > -stickySpan ? 0 : heroR.top + stickySpan) : 0
      const stageLeft = heroR ? heroR.left : 0
      const restCX = stageLeft + card.offsetLeft + card.offsetWidth / 2
      const restCY = stageTop + card.offsetTop + card.offsetHeight / 2
      // the coverflow card it will become (mirrors carousel.css card sizing —
      // the hero card is built at the same size, so the seat scale lands 1.0)
      const cw = Math.min(370, vw * 0.8)
      const ch = Math.min(530, vh * 0.74)
      const seatSX = cw / card.offsetWidth
      const seatSY = ch / card.offsetHeight

      // ONE simultaneous motion with the panel's spin: slide + grow + swivel
      const eG = easeInOutCubic(range(s, CARD_JOURNEY.slideFrom, CARD_JOURNEY.slideTo))
      const eUp = easeInOutCubic(range(s, CARD_JOURNEY.uprightFrom, CARD_JOURNEY.uprightTo))
      const eSp = easeInOutCubic(range(s, CARD_JOURNEY.seatFrom, CARD_JOURNEY.seatTo))
      const eS = easeOutBack(range(s, CARD_JOURNEY.seatFrom, CARD_JOURNEY.seatTo)) // soft snap
      // grown size is capped so the card never fills/stretches past the window
      const gsMax = Math.min(
        CARD_JOURNEY.growScale,
        (vw * 0.86) / card.offsetWidth,
        (vh * 0.86) / card.offsetHeight,
      )
      const growS = lerp(1, gsMax, eG)
      const sx = lerp(growS, seatSX, eS)
      const sy = lerp(growS, seatSY, eS)
      // rides the panel's spin at first, swivels into upright early
      const gr = rz * (1 - eUp)
      // slides from the panel slot to the stage center
      const cx = lerp(restCX, vw / 2, eG)
      const cy = lerp(restCY, vh / 2, eG)

      // —— the sliding wipe: lime face rises from the card's bottom edge ——
      const w = easeInOutCubic(range(s, CARD_JOURNEY.wipeFrom, CARD_JOURNEY.wipeTo))
      if (lime) {
        lime.style.clipPath = `inset(${((1 - w) * 100).toFixed(2)}% 0 0 0 round 26px)`
      }
      // the photo drifts up gently as the wipe passes beneath it
      if (photo) {
        photo.style.transform = `translateY(${(-8 * w).toFixed(2)}%)`
        photo.style.opacity = (1 - 0.35 * w).toFixed(3)
      }

      // The coverflow's first-card slot, tracked live from the card's ACTUAL
      // rendered rect — so it lands exactly on it at any scroll speed.
      if (!carouselRef.current) carouselRef.current = document.getElementById('services')
      let rise = 0
      let slotX = vw / 2
      let slotY = vh / 2
      if (carouselRef.current) {
        const cEl = carouselRef.current
        rise = clamp01((vh - cEl.getBoundingClientRect().top) / vh)
        if (!card0Ref.current || !card0Ref.current.isConnected) {
          card0Ref.current = cEl.querySelector('.pm2-carousel-card')
        }
        if (card0Ref.current) {
          const r = card0Ref.current.getBoundingClientRect()
          slotX = r.left + r.width / 2
          slotY = r.top + r.height / 2
        }
      }
      const eM = easeInOutCubic(range(rise, 0.62, 0.97)) // merge into the slot
      const goalX = lerp(vw / 2, slotX, eM)
      const goalY = lerp(vh / 2, slotY, eM)
      const c = cardCur.current
      c.x = lerp(c.x, px * CARD_PARALLAX.translate, CARD_PARALLAX.lerp)
      c.y = lerp(c.y, py * CARD_PARALLAX.translate, CARD_PARALLAX.lerp)
      c.r = lerp(c.r, px * CARD_PARALLAX.rotate, CARD_PARALLAX.lerp)
      const gx = cx - restCX + (goalX - vw / 2) + c.x * idle
      const gy = cy - restCY + (goalY - vh / 2) + c.y * idle
      // content morph: the lime face slides into the card's face mid-fall
      const m = easeInOutCubic(range(rise, 0.66, 0.94))
      // the faces are pixel-identical by now — a hard one-frame swap
      const cOp = rise < 0.96 ? 1 : 0

      card.style.transform = `translate3d(${gx.toFixed(2)}px, ${gy.toFixed(2)}px, 0) rotate(${(gr + c.r * idle).toFixed(3)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`
      card.style.opacity = cOp.toFixed(3)
      card.style.setProperty('--m', m.toFixed(4))
      // the coverflow keeps its own first card hidden until we've landed
      heroHandoff.ghostOpacity = s >= CARD_JOURNEY.slideFrom ? cOp : 0
    }
  })

  return (
    <section className="pm2-hero" id="top" ref={sectionRef}>
      <div className="pm2-hero-stage">
        {/* the violet panel that spins ~90° away on scroll */}
        <div className="pm2-hero-panel" ref={panelRef}>
          <div className="pm2-hero-inner">
            <h1 className="pm2-hero-title">
              <span className="pm2-hero-line">
                <span className="pm2-hero-line-in">{HERO.line1}</span>
              </span>
              <span className="pm2-hero-line pm2-hero-line--dim">
                <span className="pm2-hero-line-in">{HERO.line2}</span>
              </span>
            </h1>

            <div className="pm2-hero-mid">
              <div className="pm2-hero-copy">
                <p className="pm2-hero-lead">{HERO.lead}</p>
                <div className="pm2-hero-ctas">
                  <a
                    className="pm2-pill pm2-pill--white"
                    href={HERO.primaryCta.href}
                    onClick={e => {
                      e.preventDefault()
                      navigate?.(HERO.primaryCta.href)
                    }}
                  >
                    {HERO.primaryCta.label}
                  </a>
                  <a className="pm2-pill pm2-pill--ghost" href={HERO.secondaryCta.href}>
                    {HERO.secondaryCta.label}
                  </a>
                </div>
                <div className="pm2-hero-stats">
                  {HERO.stats.map(stat => (
                    <div className="pm2-hero-stat" key={stat.label}>
                      <span className="pm2-hero-stat-value">{stat.value}</span>
                      <span className="pm2-hero-stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pm2-hero-bottom">
              <div className="pm2-hero-trust">
                <span className="pm2-hero-avatars" aria-hidden="true">
                  {HERO.avatars.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      width="34"
                      height="34"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      style={{ zIndex: HERO.avatars.length - i }}
                    />
                  ))}
                </span>
                <span className="pm2-hero-trust-text">{HERO.trust}</span>
              </div>
              <p className="pm2-hero-caption">{HERO.caption}</p>
            </div>
          </div>
        </div>

        {/* THE card: photo face on top, lime face wiping in from the bottom.
            It slides out of the panel slot, grows, swivels upright, then
            falls into the coverflow — it never gets replaced by a new card */}
        <div className="pm2-hero-card" ref={cardRef}>
          {/* entrance wrapper: twists and falls into place on load */}
          <div className="pm2-hero-card-enter">
            <div className="pm2-hero-card-float">
              {/* photo face — the load wipe reveals it top→bottom */}
              <div className="pm2-hero-card-reveal" ref={photoRef}>
                <img
                  src={HERO.cardArt}
                  alt="Abstract violet brand artwork with a figure in motion"
                  width="340"
                  height="425"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
              {/* lime face — the scroll wipe reveals it bottom→top */}
              <div className="pm2-hero-card-lime" ref={limeRef} aria-hidden="true">
                <span className="pm2-carousel-cover" aria-hidden="true">
                  <img src="/assets/pm2/art-lime.jpg" alt="" loading="lazy" decoding="async" draggable="false" />
                </span>
                {/* the coverflow card's face, slides in with --m */}
                <span className="pm2-hero-ghost-faceB" aria-hidden="true">
                  <span className="pm2-carousel-card-top">
                    <span className="pm2-carousel-idx">{String(CARD0.index).padStart(2, '0')}</span>
                    <span className="pm2-carousel-domain">{CARD0.domain}</span>
                  </span>
                  <span className="pm2-carousel-card-mid">
                    <span className="pm2-carousel-chip">{CARD0.line}</span>
                  </span>
                  <span className="pm2-carousel-card-bottom">
                    <span className="pm2-mask">
                      <span className="pm2-mask-in pm2-carousel-card-title">{CARD0.title}</span>
                    </span>
                  </span>
                </span>
                {/* the lime card's own identity, slides out with --m */}
                <span className="pm2-hero-ghost-faceA" aria-hidden="true">
                  <Sparkle size={26} color="#c9f62d" className="pm2-hero-ghost-sparkle" />
                  <span className="pm2-hero-ghost-labelMask">
                    <span className="pm2-mask-in pm2-hero-ghost-label">Browse our services</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
