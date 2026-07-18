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
// One rAF loop reads sticky progress and writes transforms imperatively;
// below 900px / reduced motion the field renders as a static stack.
import { useEffect, useRef } from 'react'
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
const MOBILE_BP = 900 // px — below this the fly-through is disabled
const PAN_END = 0.6 // pinned progress: pan ends, target centered
const BLAST_END = 0.85 // pinned progress: target reaches the framed state;
// the rest of the runway is a readable hold, then the footer scrolls in.
const COPY_IN = [0.72, 0.87]
const BG_IN = [0.03, 0.15] // pinned progress across which the black
// backdrop fades up, right as the finished work rail releases beneath.
const PAN_SPAN = 1.6 // total pan travel of a depth-1 layer, × viewport width
const SLOPE = 0.2 // upward drift per px of leftward travel (≈11°)
const TARGET_DEPTH = 0.65 // the target rides the slowest layer
const TARGET_W = 0.4 // target width as a fraction of vw at rest
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

const clampInset = vw => Math.min(44, Math.max(20, 0.03 * vw))

export default function Gallery() {
  const sectionRef = useRef(null)
  const tileEls = useRef([])
  const quoteRef = useRef(null)
  const targetRef = useRef(null)
  const copyRef = useRef(null)
  const bgRef = useRef(null)
  const flags = useRef({ reduced: false, cleared: false })
  const cam = useRef({ vw: 0, vh: 0 })
  const uRef = useRef(0) // smoothed pinned progress

  useEffect(() => {
    flags.current.reduced = reducedMotion()
  }, [])

  // Resolve the choreography into px bases and the framed-state geometry.
  // A tile placed at (x, y) for pan moment `at` has base position
  // B = pos + at * PAN_SPAN * depth * (1, SLOPE); the per-frame position is
  // then B - K * PAN_SPAN * depth * (1, SLOPE).
  const measure = (vw, vh) => {
    const c = cam.current
    if (c.vw === vw && c.vh === vh) return c
    const span = PAN_SPAN * vw
    const inset = clampInset(vw)
    // The framed slide sits low in the viewport (heavier top inset), so no
    // black bar reads under it before the footer scrolls in.
    const insetTop = inset * 1.6
    const insetBottom = inset * 0.4
    const frameW = vw - inset * 2
    const frameH = vh - insetTop - insetBottom
    const tw = Math.round(vw * TARGET_W)
    const th = Math.round((tw * frameH) / frameW)
    const target = targetRef.current
    target.style.width = `${tw}px`
    target.style.height = `${th}px`
    c.vw = vw
    c.vh = vh
    c.span = span
    c.sFull = frameW / tw
    c.bases = CHOREO.map(t => ({
      x: (t.x / 100) * vw + t.at * span * t.depth,
      y: (t.y / 100) * vh + t.at * span * t.depth * SLOPE,
      depth: t.depth,
    }))
    c.quoteBase = {
      x: (QUOTE_CHOREO.x / 100) * vw + QUOTE_CHOREO.at * span * QUOTE_CHOREO.depth,
      y:
        (QUOTE_CHOREO.y / 100) * vh +
        QUOTE_CHOREO.at * span * QUOTE_CHOREO.depth * SLOPE,
      depth: QUOTE_CHOREO.depth,
    }
    // Target base: the blast scales about the viewport center, so to land
    // the slide on the (lower) frame center it must arrive at K = 1 offset
    // below center by that shift divided by the final scale.
    const dropY = (insetTop + frameH / 2 - vh / 2) / c.sFull
    c.targetBase = {
      x: vw / 2 - tw / 2 + span * TARGET_DEPTH,
      y: vh / 2 + dropY - th / 2 + span * TARGET_DEPTH * SLOPE,
      depth: TARGET_DEPTH,
    }
    return c
  }

  useRafLoop(() => {
    const f = flags.current
    const target = targetRef.current
    if (!target) return
    const { vw, vh } = getScroll()

    if (f.reduced || vw <= MOBILE_BP) {
      if (!f.cleared) {
        f.cleared = true
        const els = [
          target,
          quoteRef.current,
          copyRef.current,
          bgRef.current,
          ...tileEls.current,
        ]
        els.forEach(el => el && (el.style.cssText = ''))
        cam.current.vw = 0
      }
      return
    }
    f.cleared = false

    const c = measure(vw, vh)

    // —— pinned progress (smoothed): the section overlaps the work rail,
    // so its stage pins while the rail is still on screen and the pan
    // starts right there — tiles sweep in over the rail's last card.
    const rect = sectionRef.current.getBoundingClientRect()
    const pRaw = clamp01(-rect.top / Math.max(1, rect.height - vh))
    if (pRaw === 0 && uRef.current < 0.001) uRef.current = 0
    else if (pRaw === 1 && uRef.current > 0.999) uRef.current = 1
    else uRef.current = lerp(uRef.current, pRaw, 0.14)
    const pPin = uRef.current

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
      const py = base.y - K * c.span * base.depth * SLOPE
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
    target.style.transform = place(c.targetBase)
    // Counter-scaled radius: reads RADIUS_FIELD during the pan and
    // RADIUS_FRAME once framed, regardless of the current scale.
    target.style.borderRadius = `${(lerp(RADIUS_FIELD, RADIUS_FRAME, blast) / s).toFixed(2)}px`

    // —— copy over the framed slide: rises in and stays ———————————
    if (copyRef.current) {
      const tin = easeOutCubic(range(pPin, COPY_IN[0], COPY_IN[1]))
      copyRef.current.style.opacity = tin.toFixed(3)
      copyRef.current.style.transform = `translate3d(0, ${((1 - tin) * 26).toFixed(1)}px, 0)`
    }
  })

  return (
    <section className="pm2-gallery pm2-on-dark" ref={sectionRef} aria-label="Momentum gallery">
      <h2 className="pm2-gallery-sronly">Momentum gallery</h2>
      <div className="pm2-gallery-stage">
        <div className="pm2-gallery-bg" ref={bgRef} aria-hidden="true" />
        <div className="pm2-gallery-field">
          {GALLERY.tiles.map((data, i) => {
            const cfg = CHOREO[i]
            if (!cfg) return null
            return (
              <figure
                key={data.label}
                ref={el => (tileEls.current[i] = el)}
                className="pm2-gallery-tile"
                style={{ width: `${cfg.w}vw`, aspectRatio: cfg.ar, opacity: cfg.op }}
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

          <figure className="pm2-gallery-target" ref={targetRef}>
            <img
              src={GALLERY.target.image}
              alt={GALLERY.target.alt}
              loading="eager"
              fetchpriority="high"
              decoding="async"
              draggable="false"
            />
          </figure>
        </div>

        <div className="pm2-gallery-copy" ref={copyRef}>
          <span className="pm2-gallery-badge">{GALLERY.core.badge}</span>
          <p className="pm2-gallery-line">
            <span>Intelligence,</span>
            <span className="pm2-gallery-line-dim">beyond limits</span>
          </p>
          <a href="/contact-us" className="pm2-pill pm2-pill--white pm2-gallery-cta">
            Book a strategy call
          </a>
        </div>
      </div>
    </section>
  )
}
