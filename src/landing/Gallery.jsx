// Gallery — the fly-through field, rebuilt to match the reference film's
// measured motion (frames 4.6s–7.2s):
//   1. PAN    — tiles sweep in from the right and cross the frame diagonally
//               (left + ~15° up), pure translation, per-tile parallax speeds
//               0.55–1.35. The target rides the slowest (deepest) layer and
//               is delivered to dead center at constant size.
//   2. BLAST  — the pan freezes and the whole field scales about the screen
//               center until the target fills the viewport (small inset,
//               rounded corners); the other tiles get flung off the edges.
//               The copy fades in over the framed image during the blast.
//   3. HOLD   — a readable beat on the framed slide.
//   4. THROUGH— the field keeps scaling, the target blurs into a glow, a
//               veil blooms and the section unpins into the finale.
// One rAF loop reads sticky progress and writes transforms imperatively.
// Phones use the same camera move with a tighter, portrait-aware layout;
// only reduced-motion users receive the static stack.
import { useEffect, useRef, useState } from 'react'
import { GALLERY } from './data.js'
import {
  useRafLoop,
  getScroll,
  clamp01,
  lerp,
  range,
  easeInOutCubic,
  easeOutCubic,
  reducedMotion,
} from './motion.js'
import './gallery.css'

// —— tunables (measured against the reference recording) ————————————
const MOBILE_BP = 900
const PAN_END = 0.6 // pinned progress: pan ends, target centered
const BLAST_END = 0.85 // pinned progress: target reaches the framed state;
// the rest of the runway is a readable hold, then the footer scrolls in.
const COPY_IN = [0.72, 0.87]
const CORE_IN = [0.87, 0.94] // pinned progress across which the frozen video
// (already covering the still on its identical first frame) starts playing
const BG_IN = [0.03, 0.15] // pinned progress across which the black
// backdrop fades up, right as the finished work rail releases beneath.
const PAN_SPAN = 1.6 // total pan travel of a depth-1 layer, × viewport width
const SLOPE = 0.2 // upward drift per px of leftward travel (≈11°)
const TARGET_DEPTH = 0.65 // the target rides the slowest layer
const TARGET_W = 0.4 // target width as a fraction of vw at rest
const TARGET_W_MOBILE = 0.38
const RADIUS_FIELD = 14 // visible tile radius during the pan, px
const RADIUS_FRAME = 18 // visible target radius at the framed state, px

// Choreography: the section overlaps the work rail's very tail (negative
// margin), so every element starts just past the RIGHT edge (x ≈ 103vw)
// and nothing is on screen at K = 0 — the sweep only begins once the last
// work card has settled. `at` is the pan moment the tile crosses the right
// edge, y its entry lane in vh, `depth` the parallax speed, w the width
// in vw. Anti-overlap rules: entries ≥ 0.12 apart, consecutive entries
// rotate top (y 24–36) / mid (58–60) / bottom (96–102) lanes, same-lane
// neighbors ≥ 0.1 apart with the faster depth in front. Bottom-lane tiles
// enter below the viewport edge and rise into the lower-left, which the
// diagonal would otherwise leave empty. The aurora (08) enters early so
// it has exited before the target crosses its corridor.
// The aurora (08) rides the slow lane straight to a berth directly ABOVE
// the target's frame — it holds there through the end of the pan, then the
// blast (scale about the screen center) hurls it off the top edge, clearing
// the stage for the target. Verified collision-free by simulating every
// pairwise rect across pan + blast at 0.5% steps.
// Order = GALLERY.tiles.
const CHOREO = [
  { at: 0.02, x: 103, y: 34, depth: 1.0, w: 14, ar: '4 / 5', op: 0.95 },
  { at: 0.18, x: 104, y: 60, depth: 1.05, w: 18, ar: '3 / 2', op: 1 },
  { at: 0.14, x: 103, y: 96, depth: 1.0, w: 12, ar: '5 / 7', op: 0.7 },
  { at: 0.78, x: 103, y: 100, depth: 1.15, w: 13, ar: '3 / 2', op: 0.85 },
  { at: 0.6, x: 103, y: 102, depth: 0.95, w: 15, ar: '5 / 4', op: 0.92 },
  { at: 0.8, x: 103, y: 24, depth: 1.2, w: 13, ar: '3 / 2', op: 0.8 },
  { at: 0.26, x: 104, y: 106, depth: 1.0, w: 14, ar: '3 / 2', op: 0.8 },
  { at: 0.52, x: 103, y: 27, depth: 0.8, w: 16, ar: '3 / 2', op: 0.9 },
]
const QUOTE_CHOREO = { at: 0.36, x: 103, y: 26, depth: 1.15 }

// The phone field keeps the desktop sequence and timing, but opens the
// vertical lanes and slightly enlarges the thumbnails so the individual
// pieces still read on a narrow screen. The final target remains deliberately
// small during the fly-through, then becomes the viewport-filling portrait
// frame during the blast.
const MOBILE_CHOREO = [
  { at: 0, x: 96, y: 17, depth: 1.0, w: 25, ar: '4 / 5', op: 0.95 },
  { at: 0.16, x: 104, y: 50, depth: 1.08, w: 30, ar: '3 / 2', op: 1 },
  { at: 0.12, x: 104, y: 88, depth: 0.94, w: 21, ar: '5 / 7', op: 0.72 },
  { at: 0.77, x: 104, y: 76, depth: 1.16, w: 27, ar: '3 / 2', op: 0.86 },
  { at: 0.59, x: 104, y: 96, depth: 0.96, w: 28, ar: '5 / 4', op: 0.92 },
  { at: 0.8, x: 104, y: 14, depth: 1.2, w: 25, ar: '3 / 2', op: 0.82 },
  { at: 0.28, x: 104, y: 105, depth: 1.0, w: 23, ar: '3 / 2', op: 0.8 },
  { at: 0.5, x: 104, y: 27, depth: 0.82, w: 29, ar: '3 / 2', op: 0.9 },
]
const MOBILE_QUOTE_CHOREO = { at: 0.38, x: 104, y: 63, depth: 1.12 }

const clampInset = vw => Math.min(44, Math.max(20, 0.03 * vw))

export default function Gallery() {
  const sectionRef = useRef(null)
  const tileEls = useRef([])
  const quoteRef = useRef(null)
  const targetRef = useRef(null)
  const targetImgRef = useRef(null)
  const videoRef = useRef(null)
  const copyRef = useRef(null)
  const bgRef = useRef(null)
  const flags = useRef({ reduced: false, cleared: false, warmed: false, videoReady: false })
  const cam = useRef({ vw: 0, vh: 0 })
  const uRef = useRef(0) // smoothed pinned progress
  const [isReduced] = useState(reducedMotion)

  useEffect(() => {
    flags.current.reduced = reducedMotion()
  }, [])

  // Match the hero → Web Design handoff with an interruptible scroll magnet.
  // The gallery begins at exactly 80% of Recent Work; once the user releases
  // the wheel inside that overlap, this spring carries the live velocity and
  // seats the Intelligence card at the end of its camera choreography.
  useEffect(() => {
    const scrollEl = document.scrollingElement || document.documentElement
    let raf = 0
    let mode = 'idle'
    let lastY = window.scrollY
    let lastT = performance.now()
    let velocity = 0
    let lastInputT = -1e9
    let springPos = 0
    let springVel = 0
    let target = 0

    const OMEGA = 5.75
    const INPUT_GRACE = 70
    const ENGAGE_LO = 0.008
    const ENGAGE_HI = 0.86
    // Seat beyond the video activation range. Snapping at CORE_IN[0] left the
    // smoothed progress infinitesimally before playback, so the final frame
    // looked frozen on both touch and wheel input.
    const SEAT_PROGRESS = 0.95

    const anchors = () => {
      if (reducedMotion()) return null
      const section = sectionRef.current
      if (!section) return null
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const runway = rect.height - vh
      if (runway <= 0) return null
      const restY = window.scrollY + rect.top
      return { restY, seatY: restY + runway * SEAT_PROGRESS, runway }
    }

    const endSpring = () => {
      scrollEl.style.scrollBehavior = ''
      mode = 'idle'
      lastY = window.scrollY
    }

    const tick = now => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(50, now - lastT) || 16
      lastT = now

      if (mode === 'spring') {
        const seconds = dt / 1000
        const displacement = springPos - target
        const velocityTerm = springVel + OMEGA * displacement
        const decay = Math.exp(-OMEGA * seconds)
        springPos = target + (displacement + velocityTerm * seconds) * decay
        springVel = (springVel - OMEGA * velocityTerm * seconds) * decay
        window.scrollTo(0, springPos)
        lastY = window.scrollY
        if (Math.abs(springPos - target) < 0.4 && Math.abs(springVel) < 10) {
          window.scrollTo(0, target)
          endSpring()
        }
        return
      }

      const y = window.scrollY
      const instantaneous = (y - lastY) / (dt / 1000)
      lastY = y
      velocity = velocity * 0.55 + instantaneous * 0.45
      const a = anchors()
      if (!a) return
      const progress = (y - a.restY) / a.runway
      if (progress <= ENGAGE_LO || progress >= ENGAGE_HI) return
      if (now - lastInputT < INPUT_GRACE) return
      if (velocity <= 0) return

      target = a.seatY
      springPos = y
      springVel = Math.max(0, velocity)
      scrollEl.style.scrollBehavior = 'auto'
      mode = 'spring'
    }

    const onInput = () => {
      lastInputT = performance.now()
      if (mode === 'spring') endSpring()
    }

    raf = requestAnimationFrame(tick)
    window.addEventListener('wheel', onInput, { passive: true })
    window.addEventListener('touchstart', onInput, { passive: true })
    window.addEventListener('touchmove', onInput, { passive: true })
    window.addEventListener('pointerdown', onInput, { passive: true })
    window.addEventListener('keydown', onInput)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', onInput)
      window.removeEventListener('touchstart', onInput)
      window.removeEventListener('touchmove', onInput)
      window.removeEventListener('pointerdown', onInput)
      window.removeEventListener('keydown', onInput)
      scrollEl.style.scrollBehavior = ''
    }
  }, [])

  // The video's first frame IS the zoom surface. As soon as the clip can
  // render frame 0 (identical pixels to the still) it takes over wholesale;
  // playback starts later, once the full-size frame has landed.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return undefined
    const on = () => { flags.current.videoReady = true }
    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) on()
    v.addEventListener('loadeddata', on)
    return () => v.removeEventListener('loadeddata', on)
  }, [])

  const onTargetMove = event => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = clamp01((event.clientX - rect.left) / Math.max(1, rect.width))
    const y = clamp01((event.clientY - rect.top) / Math.max(1, rect.height))
    target.style.setProperty('--gallery-spring-x', `${((x - 0.5) * -8).toFixed(2)}px`)
    target.style.setProperty('--gallery-spring-y', `${((y - 0.5) * -8).toFixed(2)}px`)
    target.style.setProperty('--gallery-shine-x', `${(x * 100).toFixed(1)}%`)
    target.style.setProperty('--gallery-shine-y', `${(y * 100).toFixed(1)}%`)
  }

  const onTargetLeave = event => {
    event.currentTarget.style.removeProperty('--gallery-spring-x')
    event.currentTarget.style.removeProperty('--gallery-spring-y')
  }

  // Resolve the choreography into px bases and the framed-state geometry.
  // A tile placed at (x, y) for pan moment `at` has base position
  // B = pos + at * PAN_SPAN * depth * (1, SLOPE); the per-frame position is
  // then B - K * PAN_SPAN * depth * (1, SLOPE).
  const measure = (vw, vh) => {
    const c = cam.current
    if (c.vw === vw && c.vh === vh) return c
    const mobile = vw <= MOBILE_BP
    const choreo = mobile ? MOBILE_CHOREO : CHOREO
    const quoteChoreo = mobile ? MOBILE_QUOTE_CHOREO : QUOTE_CHOREO
    const slope = mobile ? 0.15 : SLOPE
    const span = (mobile ? 2.05 : PAN_SPAN) * vw
    const inset = clampInset(vw)
    // The framed slide sits low in the viewport (heavier top inset), so no
    // black bar reads under it before the footer scrolls in.
    const insetTop = inset * 1.6
    const insetBottom = inset * 0.4
    const frameW = vw - inset * 2
    const frameH = vh - insetTop - insetBottom
    const tw = Math.round(vw * (mobile ? TARGET_W_MOBILE : TARGET_W))
    const th = Math.round((tw * frameH) / frameW)
    const target = targetRef.current
    // Lay the target out at its final frame size and scale it DOWN during the
    // field pass. The previous version laid it out as a small tile and scaled
    // it up 2–3×, which made the decoded video look soft at the final hold.
    target.style.width = `${frameW}px`
    target.style.height = `${frameH}px`
    c.vw = vw
    c.vh = vh
    c.span = span
    c.slope = slope
    c.sFull = frameW / tw
    c.bases = choreo.map(t => ({
      x: (t.x / 100) * vw + t.at * span * t.depth,
      y: (t.y / 100) * vh + t.at * span * t.depth * slope,
      depth: t.depth,
    }))
    c.quoteBase = {
      x: (quoteChoreo.x / 100) * vw + quoteChoreo.at * span * quoteChoreo.depth,
      y:
        (quoteChoreo.y / 100) * vh +
        quoteChoreo.at * span * quoteChoreo.depth * slope,
      depth: quoteChoreo.depth,
    }
    // Target base: the blast scales about the viewport center, so to land
    // the slide on the (lower) frame center it must arrive at K = 1 offset
    // below center by that shift divided by the final scale.
    const dropY = (insetTop + frameH / 2 - vh / 2) / c.sFull
    c.targetBase = {
      x: vw / 2 - tw / 2 + span * TARGET_DEPTH,
      y: vh / 2 + dropY - th / 2 + span * TARGET_DEPTH * slope,
      depth: TARGET_DEPTH,
    }
    return c
  }

  useRafLoop(() => {
    const f = flags.current
    const target = targetRef.current
    if (!target) return
    const { vw, vh } = getScroll()
    const mobile = vw <= MOBILE_BP

    if (f.reduced) {
      if (!f.cleared) {
        f.cleared = true
        const els = [
          target,
          targetImgRef.current,
          videoRef.current,
          quoteRef.current,
          copyRef.current,
          bgRef.current,
          ...tileEls.current,
        ]
        els.forEach(el => el && (el.style.cssText = ''))
        const vid = videoRef.current
        if (vid && !vid.paused) vid.pause()
        cam.current.vw = 0
      }
      return
    }
    f.cleared = false

    const c = measure(vw, vh)

    // —— pinned progress (smoothed): the section begins at exactly 80% of
    // the work rail's sticky journey, so the Intelligence card choreography
    // starts there and snaps cleanly into its final framed state.
    const rect = sectionRef.current.getBoundingClientRect()
    const pRaw = clamp01(-rect.top / Math.max(1, rect.height - vh))
    if (pRaw === 0 && uRef.current < 0.001) uRef.current = 0
    else if (pRaw === 1 && uRef.current > 0.999) uRef.current = 1
    else uRef.current = lerp(uRef.current, pRaw, 0.14)
    const pPin = uRef.current
    const copyIn = mobile ? [0.84, 0.94] : COPY_IN

    // —— phase scalars ——————————————————————————————————————————
    const K = easeInOutCubic(Math.min(1, pPin / PAN_END)) // pan progress
    const blast = easeInOutCubic(range(pPin, PAN_END, BLAST_END))

    // Black backdrop fades up right as the finished rail releases beneath.
    if (bgRef.current) {
      bgRef.current.style.opacity = easeInOutCubic(range(pPin, BG_IN[0], BG_IN[1])).toFixed(3)
    }
    // Geometric zoom: 1 → sFull across the blast, then it holds framed
    // until the section unpins and the footer scrolls in.
    const s = Math.pow(c.sFull, blast)
    const cx = vw / 2
    const cy = vh / 2

    // Screen position after pan + scale-about-center, as a transform string.
    const place = (base, extraScale = 1) => {
      const px = base.x - K * c.span * base.depth
      const py = base.y - K * c.span * base.depth * c.slope
      const fx = cx + s * (px - cx)
      const fy = cy + s * (py - cy)
      return `translate3d(${fx.toFixed(2)}px, ${fy.toFixed(2)}px, 0) scale(${(
        s * extraScale
      ).toFixed(4)})`
    }

    for (let i = 0; i < CHOREO.length; i++) {
      const el = tileEls.current[i]
      if (el) el.style.transform = place(c.bases[i])
    }
    if (quoteRef.current) quoteRef.current.style.transform = place(c.quoteBase)
    const targetScale = s / c.sFull
    target.style.transform = place(c.targetBase, 1 / c.sFull)
    // Counter-scaled radius: reads RADIUS_FIELD during the pan and
    // RADIUS_FRAME once framed, regardless of the current scale.
    target.style.borderRadius = `${(
      lerp(RADIUS_FIELD, RADIUS_FRAME, blast) / targetScale
    ).toFixed(2)}px`

    // Keep the artwork centered while it is one of the flying tiles, then
    // glide it right as the card opens. This preserves the camera target
    // through the pan while landing on the requested right-weighted layout.
    const mediaShiftIn = easeInOutCubic(range(pPin, PAN_END + 0.025, BLAST_END))
    const mediaShift = (mobile ? Math.min(28, vw * 0.065) : Math.min(78, vw * 0.05))
      * mediaShiftIn
    target.style.setProperty('--gallery-media-x', `${mediaShift.toFixed(2)}px`)
    target.style.pointerEvents = pPin >= copyIn[0] ? 'auto' : 'none'

    // —— copy over the framed slide: rises in and stays ———————————
    if (copyRef.current) {
      const tin = easeOutCubic(range(pPin, copyIn[0], copyIn[1]))
      copyRef.current.style.opacity = tin.toFixed(3)
      copyRef.current.style.transform = `translate3d(0, ${((1 - tin) * 26).toFixed(1)}px, 0)`
    }

    // —— ambient loop: once decoded, the frozen first frame replaces the
    // still as the zoom surface (same pixels, but sharp under the blast);
    // playback then starts inside CORE_IN and pauses off-screen ————————
    const vid = videoRef.current
    if (vid && !f.warmed && pPin > 0.15) {
      f.warmed = true
      vid.preload = 'auto'
      vid.load()
    }
    const showVideo = vid && f.videoReady
    const coreIn = easeInOutCubic(range(pPin, CORE_IN[0], CORE_IN[1]))
    if (vid) {
      vid.style.opacity = showVideo ? '1' : '0'
      const offscreen = rect.bottom < 0 || rect.top > vh
      if (showVideo && coreIn > 0.003 && !offscreen) {
        if (vid.paused) vid.play().catch(() => {})
      } else if (!vid.paused) vid.pause()
    }
    if (targetImgRef.current) targetImgRef.current.style.opacity = showVideo ? '0' : '1'
  })

  return (
    <section className="pm2-gallery pm2-on-dark" ref={sectionRef} aria-label="Momentum gallery">
      <h2 className="pm2-gallery-sronly">Momentum gallery</h2>
      <div className="pm2-gallery-stage">
        <div className="pm2-gallery-bg" ref={bgRef} aria-hidden="true" />
        <div className="pm2-gallery-field">
          {GALLERY.tiles.map((data, i) => {
            const cfg = CHOREO[i]
            const mobileCfg = MOBILE_CHOREO[i]
            if (!cfg) return null
            return (
              <figure
                key={data.label}
                ref={el => (tileEls.current[i] = el)}
                className="pm2-gallery-tile"
                style={{
                  '--gallery-w': `${cfg.w}vw`,
                  '--gallery-mobile-w': `${mobileCfg.w}vw`,
                  '--gallery-ratio': cfg.ar,
                  '--gallery-mobile-ratio': mobileCfg.ar,
                  '--gallery-opacity': cfg.op,
                  '--gallery-mobile-opacity': mobileCfg.op,
                }}
              >
                <img
                  src={data.image}
                  alt={`${data.label} — ${data.sub}`}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
                <figcaption className="pm2-gallery-tile-label">
                  <span className="pm2-gallery-tile-name">{data.label}</span>
                  <span className="pm2-gallery-tile-sub">{data.sub}</span>
                </figcaption>
              </figure>
            )
          })}

          <aside className="pm2-gallery-quote" id="testimonials" ref={quoteRef}>
            <p className="pm2-gallery-quote-text">&ldquo;{GALLERY.quote.text}&rdquo;</p>
            <div className="pm2-gallery-quote-foot">
              <img
                className="pm2-gallery-quote-avatar"
                src={GALLERY.quote.avatar}
                alt={GALLERY.quote.name}
                loading="lazy"
                decoding="async"
                draggable="false"
              />
              <div>
                <div className="pm2-gallery-quote-name">{GALLERY.quote.name}</div>
                <div className="pm2-gallery-quote-role">{GALLERY.quote.role}</div>
              </div>
            </div>
          </aside>

          <figure
            className="pm2-gallery-target"
            ref={targetRef}
            onMouseMove={onTargetMove}
            onMouseLeave={onTargetLeave}
          >
            <div className="pm2-gallery-target-spring">
              <img
                ref={targetImgRef}
                src={GALLERY.target.image}
                alt={GALLERY.target.alt}
                loading="eager"
                fetchpriority="high"
                decoding="async"
                draggable="false"
              />
              {!isReduced && (
                <video
                  ref={videoRef}
                  className="pm2-gallery-target-video"
                  src={GALLERY.target.video}
                  poster={GALLERY.target.image}
                  muted
                  playsInline
                  loop
                  preload="none"
                  aria-hidden="true"
                />
              )}
            </div>
            <span className="pm2-gallery-target-sheen" aria-hidden="true" />
          </figure>
        </div>

        <div className="pm2-gallery-copy" ref={copyRef}>
          <p className="pm2-gallery-line">
            <span>Intelligence,</span>
            <span className="pm2-gallery-line-dim">beyond limits</span>
          </p>
          <p className="pm2-gallery-description">{GALLERY.core.description}</p>
          <div className="pm2-gallery-actions">
            <a href="/contact-us" className="pm2-pill pm2-pill--white pm2-gallery-cta">
              Book a strategy call
              <span aria-hidden="true">↗</span>
            </a>
            <a href="/services" className="pm2-pill pm2-pill--ghost pm2-gallery-cta">
              Explore services
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
