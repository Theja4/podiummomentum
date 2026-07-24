// Hero — the landing's signature pinned sequence, traced frame-by-frame from
// the reference film (0–1s):
//   1. on load, the hero card plays its entrance: twists and falls into place
//      while its photo image wipes in top→bottom (any image works)
//   2. on scroll, the SAME card transforms: a sliding wipe rises from the
//      card's bottom edge to its top, revealing the mint brand face — the
//      exact reverse of the load wipe — no second card ever appears
//   3. simultaneously, the forest panel spins ~90° clockwise about its center,
//      while the card slides to the stage center, grows (capped inside the
//      viewport so content stays crisp), and swivels upright — all at once
//   4. it shrinks to the exact coverflow card size, falls into the first
//      card's live slot, and swaps invisibly (faces pixel-identical: the
//      ghost renders the very same CardFace as the coverflow)
// All scroll motion runs in one rAF loop writing transforms imperatively.
import { useEffect, useRef, useState } from 'react'
import {
  useRafLoop,
  useRafRead,
  usePointer,
  clamp01,
  lerp,
  range,
  easeInOutCubic,
  easeOutBack,
  smoothToward,
  useVisible,
} from './motion.js'
import Sparkle from './Sparkle.jsx'
import HeroVideo from './HeroVideo.jsx'
import { CARD_GEOM_STEPS, CardFace, faceTheme } from './Carousel.jsx'
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
  uprightFrom: 0.15,
  uprightTo: 0.75,
  wipeFrom: 0.12, // the mint face wipes in bottom→top (reverse of the load wipe)
  wipeTo: 0.55,
  // the fall into the coverflow's first-card slot is driven live by that
  // section's rise (see the rAF loop): merge across rise 0.62→0.97, then a
  // hard one-frame swap at rise 0.96 (faces are pixel-identical by then)
}
const IDLE_TILT_RANGE = 0.12 // sticky-progress range over which card parallax dies
const CARD_PARALLAX = { translate: 0, rotate: 0, lerp: 0.12 } // px / deg / per-frame
// (parallax disabled: any residual sub-pixel rotate/translate composites the
// card face soft — the user wants it razor sharp; the float + journey motion
// already carry the liveliness)
// ONE smoothed clock drives the ENTIRE desktop choreography — panel spin,
// copy exit, card journey, wide-morph, final slide and the seat swap. It is
// built from raw scroll pixels across the whole rest→seat span and smoothed
// once (exponential, τ ms, frame-rate independent). The old code smoothed the
// sticky progress but drove the morph/expansion/swap from the RAW services
// position: at speed the two clocks diverged, so the swap fired while the
// card was still huge and mid-flight — the landing chop this replaces.
const CLOCK_TAU = 70
// Normal mid-journey catch-up stays below this ceiling so discrete wheel input
// cannot appear directly in the choreography. Endpoint finishing uses the
// slightly higher, still-finite ceiling below.
const CLOCK_MAX_SPEED = 0.9 // normalized choreography progress / second
// Once raw scroll reaches an endpoint, allow a slightly quicker finish without
// releasing the velocity limit entirely. The old uncapped endpoint catch-up
// could grow the card by 13px in one frame after a fast flick.
const CLOCK_BOUND_MAX_SPEED = 1.2
const CLOCK_BOUND_SNAP_EPS = 0.003
const HANDOFF_REVERSE_HYSTERESIS = 3
// The ghost's copy (title, support line, Explore) rises on this slice of the
// content morph (--m), a hair behind its artwork, so the card in flight is
// never a lone image with no words. Keep in sync with hero.css.
const GHOST_COPY_IN_FROM = 0.54
const GHOST_COPY_IN_SPAN = 0.3
const ghostCopyIn = m => clamp01((m - GHOST_COPY_IN_FROM) / GHOST_COPY_IN_SPAN)
const MOBILE_CLOCK_MAX_SPEED = 1.8
// Cross the services sticky boundary by a couple of CSS pixels when the
// magnetic handoff seats. A mathematically exact section-top target can be
// rounded to the near side by the browser, leaving `servicesTop` fractionally
// positive. In that state rawRise never reaches 1, so the artwork ghost hangs
// over the real card until the visitor supplies one more scroll tick.
const MAGNET_SEAT_OVERSHOOT = 2
// The mobile journey — the same film compressed into the seam between the
// hero and the services deck, all driven by that section's rise (0→1 as its
// top crosses the viewport): the mint face wipes up over the resting card,
// the card detaches from the panel's field, swings upright, grows from its
// rest scale to the coverflow's exact first-card size and seats into the
// live slot — finished by the same hard one-frame swap as desktop.
const MOBILE_JOURNEY = {
  restTilt: -4,
  restMaxS: 0.8, // rest-fit scale clamps: the card must read as a miniature…
  restMinS: 0.34, // …but never collapse on very short phones
  wipeFrom: 0.06, // the mint face starts rising off the card's bottom edge
  wipeTo: 0.5,
  flyFrom: 0.14, // detaches from the panel and heads for the slot
  flyTo: 0.96,
  uprightTo: 0.66,
  morphFrom: 0.62, // faceA→faceB content morph (--m), same story as desktop
  morphTo: 0.93,
  swapAt: 0.965, // the hard swap into the coverflow's first card
}
const DESKTOP_WIDE_CARD = {
  maxW: 700,
  vw: 0.60,
  maxH: 550,
  vh: 0.63,
}

export default function Hero({ navigate }) {
  const sectionRef = useRef(null)
  const panelRef = useRef(null)
  const cardRef = useRef(null)
  const wipeRef = useRef(null)
  const photoRef = useRef(null)
  const titleRef = useRef(null)
  const copyBlockRef = useRef(null)
  const statsRef = useRef(null)
  const ctasRef = useRef(null)
  const bottomRef = useRef(null)
  const carouselRef = useRef(null)
  const card0Ref = useRef(null)

  const pointer = usePointer()

  // Every layout measurement for the frame, gathered in the shared READ
  // phase (clean layout — no forced reflow), plus the unified clock.
  const measured = useRef({
    // False whenever the clocks below have NOT been advanced against live
    // scroll on the previous frame — at mount, and after every span the read
    // phase sat out because the hero was off-screen. The next visible frame
    // snaps them to the raw scroll position instead of easing toward it.
    synced: false,
    heroTop: 0,
    heroLeft: 0,
    heroHeight: 0,
    servicesTop: Infinity,
    hasServices: false,
    slotX: 0,
    slotY: 0,
    slotW: 0,
    hasSlot: false,
    cardW: 1,
    cardH: 1,
    cardL: 0,
    cardT: 0,
    wrapR: null,
    u: 0, // smoothed unified clock, 0 at hero rest → 1 at the seat
    s: 0, // derived: pinned-phase progress (was the smoothed sticky)
    rise: 0, // derived: services-rise progress, SAME clock as s
    rawRise: 0, // unsmoothed rise — the mobile journey stays scroll-locked
    mobileRise: 0,
  })

  const cardCur = useRef({ x: 0, y: 0, r: 0 })
  // Per-frame write dedupe: geometry writes (width/height/margin) invalidate
  // layout, so they only happen when the value actually changed; one-shot
  // clears are flagged so rest frames write nothing at all.
  const frameCache = useRef({
    geomKey: '',
    staticCleared: false,
    reducedCleared: false,
    heroPointerEvents: '',
    wipeSettled: false,
    offscreenHidden: false,
  })
  // Static mode: small screens (no sticky/tilt) or reduced motion — on small
  // screens the compressed MOBILE_JOURNEY runs (wipe → fly → seat into the
  // deck); reduced motion freezes the card at its rest fit, no journey.
  const staticRef = useRef(false)
  const mobileRef = useRef(false)
  const reducedRef = useRef(false)
  // Mobile relocates the card INTO the panel's open field (a flex slot in
  // the hero copy column); desktop keeps it stage-level so it escapes the
  // panel's spin. Rendering position must follow the breakpoint.
  const slotRef = useRef(null)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches,
  )
  const visible = useVisible(sectionRef, '120% 0px 120% 0px')

  useEffect(() => {
    const scrollEl = document.scrollingElement || document.documentElement
    let raf = 0
    let mode = 'idle' // 'idle' | 'spring'
    let lastY = window.scrollY
    let lastT = performance.now()
    let velPPS = 0 // measured scroll velocity, px/s, lightly smoothed
    let lastInputT = -1e9
    let target = 0
    let springPos = 0
    let springVel = 0 // px/s
    let springDir = 0 // sign of (target − start): crossing it ends the spring

    // A critically damped spring drives the magnet — NOT a time-based tween.
    // It carries the incoming scroll velocity and uses the closed-form update,
    // so variable frame times cannot make the card step or overshoot.
    //   • It engages carrying the scroll's live velocity, so the handoff from
    //     inertia is seamless (velocity-continuous — no "kick" from a dead stop
    //     into a fast tween start).
    //   • It is (near) critically damped, so it decelerates smoothly into the
    //     seat with no overshoot wobble — the old easeOutBack bounced right at
    //     the pixel-identical card swap, which read as chop at the very end.
    const OMEGA = 5.75 // rad/s — half the old frequency (~1s settle, 2× longer)
    // A slow, deliberate scroll emits SPARSE wheel events (gaps well past
    // 70ms) — the old short grace let the magnet engage between the user's
    // own ticks and yank the page they were still driving: a tug-of-war that
    // read as chop through the whole handoff band. Engage only after a real
    // stop: a long quiet window AND near-zero measured velocity.
    const INPUT_GRACE = 450 // ms since last real input before the magnet engages
    const STOPPED_VEL = 140 // px/s — above this the page is still travelling
    const ENGAGE_LO = 0.05
    const ENGAGE_HI = 0.95
    const MID = 0.5
    const PROJECT = 0.16 // s of velocity look-ahead — a flick commits its way

    // Both layouts use the same physical section boundaries. On mobile the
    // section is no longer pinned, but the services top is still the exact
    // end of the card handoff, so it remains the correct magnetic seat.
    // restY — hero at rest; seatY — card fully fallen into the coverflow's
    // first-card slot (only complete once services rises to the viewport top).
    let anchorCache = null
    const measureAnchors = () => {
      const el = sectionRef.current
      const services = document.getElementById('services')
      if (!el || !services) return null
      const restY = window.scrollY + el.getBoundingClientRect().top
      const seatY =
        window.scrollY + services.getBoundingClientRect().top + MAGNET_SEAT_OVERSHOOT
      const span = seatY - restY
      if (span <= 0) return null
      return { restY, seatY, span }
    }
    // Both sections are viewport-sized, so the anchors only move when the
    // viewport does — cache them and keep the per-frame band check free of
    // layout reads (this loop runs outside the shared read/write pump).
    const anchors = () => {
      if (reducedRef.current) return null
      if (!anchorCache) anchorCache = measureAnchors()
      return anchorCache
    }
    const invalidateAnchors = () => {
      anchorCache = null
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
        const dtf = dt / 1000
        // Exact critically damped solution. Unlike Euler integration this is
        // stable across dropped/variable frames and costs no additional loop.
        const displacement = springPos - target
        const velocityTerm = springVel + OMEGA * displacement
        const decay = Math.exp(-OMEGA * dtf)
        springPos = target + (displacement + velocityTerm * dtf) * decay
        springVel = (springVel - OMEGA * velocityTerm * dtf) * decay
        // Carried inertia can push the closed-form solution past the anchor.
        // The seat is a hard, intentional stop: land exactly on it, never
        // sail past and pull back — that bounce read as shake at the landing.
        if (springDir !== 0 && Math.sign(target - springPos) !== springDir) {
          window.scrollTo(0, target)
          endSpring()
          return
        }
        // Land in ONE exact step while the motion still masks it. The old
        // tail (until 0.4px / 10px/s) kept writing sub-pixel scrolls for
        // ~half a second after the card looked seated; every device-pixel
        // rounding crossing shifted the whole page 1px for a single frame —
        // an isolated full-screen text shimmer.
        if (Math.abs(springPos - target) < 1.5 && Math.abs(springVel) < 60) {
          window.scrollTo(0, target)
          endSpring()
          return
        }
        window.scrollTo(0, springPos)
        lastY = window.scrollY // our own write must not read back as user velocity
        return
      }

      // idle: track the live scroll velocity so a handoff can match it
      const y = window.scrollY
      const instVel = (y - lastY) / (dt / 1000)
      lastY = y
      velPPS = velPPS * 0.55 + instVel * 0.45

      const a = anchors()
      if (!a) return
      const progress = (y - a.restY) / a.span
      if (progress <= ENGAGE_LO || progress >= ENGAGE_HI) return
      if (now - lastInputT < INPUT_GRACE) return // user is still driving
      if (Math.abs(velPPS) > STOPPED_VEL) return // still coasting — wait it out

      // engage: re-measure once so the seat is pixel-exact, then commit.
      // flick-to-commit: project where the residual velocity is headed so a
      // decisive flick toward the seat completes even from just under halfway
      anchorCache = measureAnchors()
      const fresh = anchorCache
      if (!fresh) return
      const projected = progress + (velPPS * PROJECT) / fresh.span
      target = projected >= MID ? fresh.seatY : fresh.restY
      springPos = y
      springVel = velPPS // seamless: carry the incoming inertia into the spring
      springDir = Math.sign(target - springPos)
      scrollEl.style.scrollBehavior = 'auto' // own the scroll; CSS smooth would fight
      mode = 'spring'
    }

    // Any genuine input hands control straight back — the spring never fights
    // the user. (Engagement waits out INPUT_GRACE, so an in-flight spring only
    // ever sees deliberate overrides here, never the inertia that fed it.)
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
    window.addEventListener('resize', invalidateAnchors, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', onInput)
      window.removeEventListener('touchstart', onInput)
      window.removeEventListener('touchmove', onInput)
      window.removeEventListener('pointerdown', onInput)
      window.removeEventListener('keydown', onInput)
      window.removeEventListener('resize', invalidateAnchors)
      scrollEl.style.scrollBehavior = ''
    }
  }, [])

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 900px)')
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      mobileRef.current = mqMobile.matches
      reducedRef.current = mqReduced.matches
      staticRef.current = mqMobile.matches || mqReduced.matches
      setIsMobile(mqMobile.matches)
    }
    update()
    mqMobile.addEventListener('change', update)
    mqReduced.addEventListener('change', update)
    return () => {
      mqMobile.removeEventListener('change', update)
      mqReduced.removeEventListener('change', update)
      // release the coverflow's first card when the hero unmounts
      heroHandoff.ghostOpacity = 0
      heroHandoff.cardExpansion = 0
      heroHandoff.copyReveal = 0
      heroHandoff.phase = 'journey'
    }
  }, [])

  // —— READ PHASE: every DOM measurement the frame needs, taken while layout
  // is still clean from the previous frame's render (no forced reflow), plus
  // the unified clock update. The write loop below only consumes. ——
  useRafRead(dt => {
    const m = measured.current
    if (!visible) {
      // The clocks below only advance on visible frames, so every off-screen
      // span leaves them frozen at the position the hero was last seen in.
      // Re-arm the snap: without it, returning after an in-page anchor jump
      // (the hero's own "View selected work" → #work) resumed easing from that
      // frozen value, replaying the whole flight FORWARD — at the clock's
      // capped speed, over about a second of wall time — while the visitor was
      // scrolling up. That is the reverse-scroll chop this guards.
      m.synced = false
      return
    }
    const card = cardRef.current
    const vh = window.innerHeight || 1

    const el = sectionRef.current
    const heroR = el ? el.getBoundingClientRect() : null
    m.heroTop = heroR ? heroR.top : 0
    m.heroLeft = heroR ? heroR.left : 0
    m.heroHeight = heroR ? heroR.height : vh

    if (!carouselRef.current) carouselRef.current = document.getElementById('services')
    const cEl = carouselRef.current
    m.hasServices = Boolean(cEl)
    m.servicesTop = cEl ? cEl.getBoundingClientRect().top : Infinity
    m.servicesH = cEl ? cEl.offsetHeight : 0

    if (card) {
      m.cardW = card.offsetWidth || 1
      m.cardH = card.offsetHeight || 1
      m.cardL = card.offsetLeft
      m.cardT = card.offsetTop
    }

    // the coverflow's first-card slot, tracked from its ACTUAL rendered rect
    // so the ghost lands exactly on it at any scroll speed
    m.hasSlot = false
    if (cEl) {
      if (!card0Ref.current || !card0Ref.current.isConnected) {
        card0Ref.current = cEl.querySelector('.pm2-carousel-card')
      }
      if (card0Ref.current) {
        const r = card0Ref.current.getBoundingClientRect()
        if (r.width > 1) {
          m.slotX = r.left + r.width / 2
          m.slotY = r.top + r.height / 2
          m.slotW = r.width
          m.hasSlot = true
        }
      }
    }

    m.wrapR =
      staticRef.current && slotRef.current ? slotRef.current.getBoundingClientRect() : null

    // —— one physical rest→seat clock. The hero's sticky travel and the
    // services rise overlap because the services section starts with a
    // negative margin; treating them as sequential double-counted that
    // overlap and abruptly changed resize speed mid-flight.
    const stickySpan = Math.max(1, m.heroHeight - vh)
    m.rawRise = cEl ? clamp01((vh - m.servicesTop) / vh) : 0
    const scrollY = window.scrollY || window.pageYOffset || 0
    const heroDocY = scrollY + m.heroTop
    const servicesDocY = cEl ? scrollY + m.servicesTop : heroDocY + stickySpan + vh
    const seatSpan = Math.max(1, servicesDocY - heroDocY)
    const stickyEnd = Math.max(0.0001, clamp01(stickySpan / seatSpan))
    const riseStart = Math.min(0.9999, clamp01((seatSpan - vh) / seatSpan))
    const rawU = clamp01((scrollY - heroDocY) / seatSpan)
    if (!m.synced) {
      // a restored scroll position — or a return from off-screen — must not
      // play a catch-up flight; the clock simply IS wherever scroll says
      m.u = rawU
    } else if (rawU === 0 && m.u < 0.001) {
      m.u = 0 // exact bounds so resting transforms clear and text is crisp
    } else if (rawU === 1 && m.u > 0.999) {
      m.u = 1
    } else {
      // NEVER snap mid-range: gluing the clock to raw between the bounds
      // replays the wheel's discrete deltas as visible steps on the card —
      // the exponential is precisely what absorbs that staircase.
      const clockSmooth = 1 - Math.exp(-16.667 / CLOCK_TAU)
      // The speed ceiling shapes large jumps at every scroll speed. Endpoint
      // catch-up gets a slightly higher ceiling, then snaps only the final
      // imperceptible fraction; this prevents a fast flick from bypassing the
      // vertical smoothing while still completing the handoff promptly.
      const atBound = rawU <= 0.001 || rawU >= 0.999
      const boundSettled = Math.abs(rawU - m.u) <= CLOCK_BOUND_SNAP_EPS
      const clockMaxSpeed = atBound
        ? boundSettled
          ? Infinity
          : CLOCK_BOUND_MAX_SPEED
        : CLOCK_MAX_SPEED
      m.u = smoothToward(m.u, rawU, clockSmooth, dt, clockMaxSpeed)
    }
    if (!m.synced) {
      m.mobileRise = m.rawRise
    } else if (m.rawRise === 0 && m.mobileRise < 0.001) {
      m.mobileRise = 0
    } else if (m.rawRise === 1 && m.mobileRise > 0.999) {
      m.mobileRise = 1
    } else {
      // same bound release as the desktop clock: once raw has arrived the
      // compressed mobile journey must finish promptly, not drift capped
      const mobileAtBound = m.rawRise <= 0.001 || m.rawRise >= 0.999
      m.mobileRise = smoothToward(
        m.mobileRise,
        m.rawRise,
        0.2,
        dt,
        mobileAtBound ? Infinity : MOBILE_CLOCK_MAX_SPEED,
      )
    }
    m.synced = true
    m.s = range(m.u, 0, stickyEnd)
    m.rise = range(m.u, riseStart, 1)

    if (!staticRef.current) {
      // Enter only when the ghost is fully wide and the deck is physically
      // pinned. On reverse, keep the current owner for a few CSS pixels; this
      // hysteresis prevents sub-pixel boundary rounding from toggling layers.
      if (
        heroHandoff.phase === 'journey' &&
        m.servicesTop <= 0 &&
        m.rise >= 0.999
      ) {
        m.rise = 1
        heroHandoff.phase = 'deck'
      } else if (
        heroHandoff.phase === 'deck' &&
        m.servicesTop > HANDOFF_REVERSE_HYSTERESIS
      ) {
        // The last visible deck frame is fully wide. Show the fixed ghost at
        // that exact same size on the transfer frame; its smoothed shrink can
        // resume on the next frame without a layer-swap pop.
        m.rise = 1
        heroHandoff.phase = 'journey'
      }

      // Publish the same read-phase value the hero will render this frame so
      // the deck never consumes a one-frame-old resize value.
      heroHandoff.cardExpansion = m.rise
    }
  })

  useRafLoop(() => {
    const panel = panelRef.current
    const card = cardRef.current
    const wipe = wipeRef.current
    const photo = photoRef.current

    const frame = frameCache.current
    const setHeroPassThrough = passThrough => {
      const pointerEvents = passThrough ? 'none' : ''
      if (frame.heroPointerEvents === pointerEvents) return
      frame.heroPointerEvents = pointerEvents
      if (sectionRef.current) sectionRef.current.style.pointerEvents = pointerEvents
    }

    // When the hero scrolls out of view the loop stops driving the card, but on
    // the desktop the card is position:fixed — so a scroll that skips the whole
    // handoff (e.g. the "View selected work" anchor jump to #work) can freeze
    // its viewport-fixed ghost mid-journey and leave it floating over a later
    // section. The smoothed clock hasn't caught up to the jumped scroll, so the
    // last-written opacity is still the resting card's. Force the ghost hidden
    // and click-through while off-screen; the next visible frame re-derives the
    // real state, so re-entering the hero on reverse scroll restores it.
    if (!visible) {
      if (!frame.offscreenHidden && card) {
        frame.offscreenHidden = true
        // Hand card zero to the deck outright. The hero is the page's first
        // section, so out of view can only mean the visitor is somewhere past
        // the entire handoff — the journey is over by definition. Leaving the
        // last mid-flight values published here stranded the coverflow: it
        // read `phase: 'journey'`, pinned its own progress to zero and kept
        // card zero hidden, so scrolling back up through services after the
        // #work jump showed an empty deck with no card zero at all.
        heroHandoff.ghostOpacity = 0
        heroHandoff.phase = 'deck'
        heroHandoff.cardExpansion = 1
        heroHandoff.copyReveal = 1
        if (!staticRef.current) {
          card.style.opacity = '0'
          card.style.pointerEvents = 'none'
          setHeroPassThrough(true)
        }
      }
      return
    }
    frame.offscreenHidden = false

    if (staticRef.current) {
      if (!card) return
      heroHandoff.cardExpansion = 0
      if (!frame.staticCleared) {
        frame.staticCleared = true
        frame.geomKey = ''
        // CSS owns the stacked layout; the panel never transforms on mobile
        if (panel) {
          panel.style.transform = ''
          panel.style.opacity = ''
          panel.style.pointerEvents = ''
        }
        // Desktop writes its fixed responsive geometry inline. Release those
        // values when mobile/reduced layout returns geometry ownership to CSS.
        card.style.removeProperty('width')
        card.style.removeProperty('height')
        card.style.removeProperty('margin-top')
        card.style.removeProperty('--pm2-card-pad')
        card.style.removeProperty('--pm2-card-radius')
        card.style.removeProperty('--pm2-card-title')
        card.style.removeProperty('--pm2-card-copy')
      }
      if (reducedRef.current && !mobileRef.current) {
        // reduced motion on desktop: plain stacked hero, no journey at all
        setHeroPassThrough(false)
        if (!frame.reducedCleared) {
          frame.reducedCleared = true
          heroHandoff.ghostOpacity = 0
          heroHandoff.copyReveal = 1
          card.style.transform = ''
          card.style.opacity = ''
          card.style.removeProperty('--m')
          if (wipe) wipe.style.clipPath = ''
          if (photo) {
            photo.style.transform = ''
            photo.style.opacity = ''
          }
        }
        return
      }
      frame.reducedCleared = false

      const M = MOBILE_JOURNEY
      const vw = window.innerWidth || 1
      const vh = window.innerHeight || 1
      const meas = measured.current

      // Rest geometry: the card is BUILT at the coverflow's exact mobile
      // card size and scale-fitted into the slot the panel reserves for it
      // (measured in the read phase — the wrapper never transforms, so its
      // rect is safe).
      const wrapR = meas.wrapR
      const cw = meas.cardW
      const ch = meas.cardH
      const restS = wrapR
        ? Math.min(M.restMaxS, Math.max(M.restMinS, Math.min(wrapR.width / cw, wrapR.height / ch)))
        : 0.6
      const restCX = wrapR ? wrapR.left + wrapR.width / 2 : vw / 2
      const restCY = wrapR ? wrapR.top + wrapR.height / 2 : vh / 2

      if (reducedRef.current) {
        // reduced motion on mobile: the card holds its rest fit, no journey
        setHeroPassThrough(false)
        heroHandoff.ghostOpacity = 0
        heroHandoff.copyReveal = 1
        card.style.transform = `rotate(${M.restTilt}deg) scale(${restS.toFixed(4)})`
        card.style.opacity = ''
        card.style.pointerEvents = ''
        card.style.removeProperty('--m')
        if (wipe) wipe.style.clipPath = ''
        if (photo) {
          photo.style.transform = ''
          photo.style.opacity = ''
        }
        return
      }

      // —— the mobile journey: driven by the services section's rise. The
      // section is not pinned here, so the raw (scroll-locked) rise IS the
      // single coherent clock — no smoothing, no tearing. ——
      const rise = meas.mobileRise

      // the coverflow's first-card slot, tracked live from its ACTUAL rect —
      // so the ghost lands exactly on it at any scroll speed
      const slotX = meas.hasSlot ? meas.slotX : vw / 2
      const slotY = meas.hasSlot ? meas.slotY : vh / 2
      const seatS = meas.hasSlot ? meas.slotW / cw : 1

      const w = easeInOutCubic(range(rise, M.wipeFrom, M.wipeTo))
      const e = easeInOutCubic(range(rise, M.flyFrom, M.flyTo))
      const eUp = easeOutBack(range(rise, M.flyFrom, M.uprightTo))
      const m = easeInOutCubic(range(rise, M.morphFrom, M.morphTo))
      // the faces are pixel-identical by now — a hard one-frame swap
      const cOp = rise < M.swapAt ? 1 : 0

      if (wipe) {
        const rad = vw <= 600 ? 22 : 26 // mirrors carousel.css card radius
        wipe.style.clipPath = `inset(${((1 - w) * 100).toFixed(2)}% 0 0 0 round ${rad}px)`
      }
      // the photo drifts up gently as the wipe passes beneath it
      if (photo) {
        if (w < 0.0005) {
          photo.style.transform = ''
          photo.style.opacity = ''
        } else {
          photo.style.transform = `translateY(${(-8 * w).toFixed(2)}%)`
          photo.style.opacity = (1 - 0.35 * w).toFixed(3)
        }
      }

      const gx = (slotX - restCX) * e
      const gy = (slotY - restCY) * e
      const cardScale = lerp(restS, seatS, e)
      const gr = M.restTilt * (1 - eUp)
      card.style.transform = `translate3d(${gx.toFixed(2)}px, ${gy.toFixed(2)}px, 0) rotate(${gr.toFixed(3)}deg) scale(${cardScale.toFixed(4)})`
      card.style.opacity = cOp.toFixed(3)
      card.style.pointerEvents = cOp < 0.5 ? 'none' : ''
      // The hero and services overlap during the handoff. Once the ghost has
      // seated, release the hero's full section hit area—not only the ghost
      // card—so every visible part of the service cards can receive hover,
      // pointer-cursor and click events. Reverse scrolling restores the hero.
      setHeroPassThrough(cOp <= 0.01)
      card.style.setProperty('--m', m.toFixed(4))
      // the coverflow keeps its own first card hidden until we've landed
      heroHandoff.ghostOpacity = rise >= M.flyFrom ? cOp : 0
      heroHandoff.copyReveal = ghostCopyIn(m)
      return
    }

    const vw = window.innerWidth || 1
    const vh = window.innerHeight || 1
    frame.staticCleared = false

    // —— every measurement comes from the shared read phase; s and rise are
    // overlapping windows of the SAME physical, smoothed clock, so the panel,
    // card journey, wide-morph and seat swap cannot drift apart. ———
    const meas = measured.current
    const rise = meas.rise
    const slotX = meas.hasSlot ? meas.slotX : vw / 2
    const cardW = meas.cardW
    const cardL = meas.cardL

    // —— panel spin (clock progress 0→1): flat ~90° clockwise rotation ——
    // NOTE: the panel carries ALL the hero copy, so it never 3D-tilts on
    // pointer idle (any non-identity 3D transform composited the panel and
    // rasterized its text soft). Pointer parallax lives on the card only.
    const s = meas.s
    const e = easeInOutCubic(range(s, TILT.spinFrom, TILT.spinTo))
    const idle = 1 - range(s, 0, IDLE_TILT_RANGE)
    const px = pointer.current.x
    const py = pointer.current.y
    const rx = TILT.tipX * e
    const ry = 0
    const rz = TILT.spin * e
    const sc = lerp(1, TILT.scale, e)
    const tx = TILT.driftXvw * e
    const ty = TILT.driftYvh * e
    const op = 1 - range(s, TILT.fadeStart, TILT.fadeEnd)
    if (panel) {
      // At rest write NO transform: a per-frame 3D string — even an identity
      // one — pins the panel to a composited layer and its text rasterizes
      // soft. The resting hero must stay pixel-crisp; transforms resume the
      // moment scroll progress moves the panel.
      if (e < 0.0005) {
        panel.style.transform = ''
        panel.style.opacity = ''
        panel.style.pointerEvents = ''
      } else {
        panel.style.transform = `translate3d(${tx.toFixed(3)}vw, ${ty.toFixed(3)}vh, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) scale(${sc.toFixed(4)})`
        panel.style.opacity = op.toFixed(3)
        panel.style.pointerEvents = op < 0.05 ? 'none' : ''
      }
    }

    // —— hero copy exit: as the scroll begins the text lifts out in a
    // stagger (title → lead → stats → CTAs → trust strip), ahead of the
    // panel's spin. Progress-driven, so it plays in reverse on the way back
    // up. Every member of the copy stack must appear here: the CTA row was
    // once omitted, so it stayed at full opacity while everything around it
    // lifted away, leaving an orphaned button floating in a bare panel until
    // the panel's own fade began at s=0.62. ——
    const exits = [
      [titleRef.current, 0, 0.18],
      [copyBlockRef.current, 0.05, 0.23],
      [statsRef.current, 0.08, 0.26],
      [ctasRef.current, 0.11, 0.29],
      [bottomRef.current, 0.14, 0.32],
    ]
    for (const [el, from, to] of exits) {
      if (!el) continue
      const t = easeInOutCubic(range(s, from, to))
      if (t < 0.0005) {
        el.style.opacity = ''
        el.style.transform = ''
        el.style.pointerEvents = ''
      } else {
        el.style.opacity = (1 - t).toFixed(3)
        el.style.transform = `translate3d(0, ${(-46 * t).toFixed(1)}px, 0)`
        el.style.pointerEvents = t > 0.5 ? 'none' : ''
      }
    }

    // —— the hero card: wipes photo→mint, slides to center, grows,
    // upright, shrinks, then falls into the coverflow's first card slot ——
    if (card) {
      // Restore the local-main choreography: the familiar slanted portrait
      // opens into the wider services canvas during the final merge.
      // The unified journey clock is already smoothed. Map the size across the
      // complete services rise instead of easing it through a short subrange:
      // this cuts peak width velocity by more than half and, with no secondary
      // time follower, reverses as soon as the scroll clock reverses.
      const cardExpansion = rise
      heroHandoff.cardExpansion = cardExpansion
      // Real geometry changes only on the same coarse cadence as the services
      // deck. A continuous compositor scale below bridges those layout steps,
      // so the visible edge still glides every display frame without forcing
      // width/height reflow every display frame.
      const geomExpansion =
        Math.round(cardExpansion * CARD_GEOM_STEPS) / CARD_GEOM_STEPS
      const portraitW = Math.min(490, Math.max(360, vw * 0.26))
      const portraitH = Math.min(portraitW * 1.27, vh * 0.70)
      const wideW = Math.min(DESKTOP_WIDE_CARD.maxW, vw * DESKTOP_WIDE_CARD.vw)
      const wideH =
        vh <= 820
          ? Math.min(500, vh * 0.62)
          : Math.min(DESKTOP_WIDE_CARD.maxH, vh * DESKTOP_WIDE_CARD.vh)
      const liveW = lerp(portraitW, wideW, cardExpansion)
      const liveH = lerp(portraitH, wideH, cardExpansion)
      const liveRadius = lerp(26, 34, cardExpansion)
      const layoutW = lerp(portraitW, wideW, geomExpansion)
      const layoutH = lerp(portraitH, wideH, geomExpansion)
      const fitX = liveW / layoutW
      const fitY = liveH / layoutH
      // Geometry writes dirty layout; only touch them at a shared coarse step.
      const geomKey = `${layoutW.toFixed(1)}|${layoutH.toFixed(1)}|${geomExpansion.toFixed(4)}`
      if (frame.geomKey !== geomKey) {
        frame.geomKey = geomKey
        card.style.width = `${layoutW.toFixed(1)}px`
        card.style.height = `${layoutH.toFixed(1)}px`
        card.style.marginTop = `${(-layoutH / 2).toFixed(1)}px`
        card.style.setProperty('--pm2-card-pad', `${lerp(22, 30, geomExpansion).toFixed(1)}px`)
        card.style.setProperty('--pm2-card-radius', `${lerp(26, 34, geomExpansion).toFixed(1)}px`)
        card.style.setProperty('--pm2-card-title', `${lerp(36, 46, geomExpansion).toFixed(1)}px`)
        card.style.setProperty('--pm2-card-copy', `${lerp(14, 16, geomExpansion).toFixed(1)}px`)
      }

      // The desktop ghost is viewport-fixed outside the sticky/perspective
      // stage. Its layout offsets are therefore viewport coordinates and
      // native or magnetic scrolling cannot move it between animation frames.
      // The card is RIGHT-anchored, so a geometry step moves its layout centre.
      // The measured offsets are one frame stale, but the right edge is
      // invariant: derive the new layout centre from that edge and the stepped
      // width. The corrective scale grows around this centre, so the centre
      // itself remains continuous through every step.
      const restCX = cardL + cardW - layoutW / 2
      const restCY = vh / 2
      // ONE simultaneous motion with the panel's spin: slide + grow + swivel
      const eG = easeInOutCubic(range(s, CARD_JOURNEY.slideFrom, CARD_JOURNEY.slideTo))
      const eUp = easeInOutCubic(range(s, CARD_JOURNEY.uprightFrom, CARD_JOURNEY.uprightTo))
      // Keep travel at one stable scale. The previous grow-then-settle layer
      // overlapped the services geometry morph, so rapid reversals could make
      // two independent size systems change direction on adjacent frames.
      // Width and height now have exactly one owner: cardExpansion below.
      const cardScale = 1
      const gr = -4 * (1 - eUp)
      // slides from the panel slot to the stage center
      const cx = lerp(restCX, vw / 2, eG)

      // —— the sliding wipe: the mint face rises from the card's bottom edge ——
      const w = easeInOutCubic(range(s, CARD_JOURNEY.wipeFrom, CARD_JOURNEY.wipeTo))
      if (wipe) {
        if (w >= 0.9995) {
          // The card itself is the final clip owner. Once the wipe has fully
          // opened, release this second rounded clip so it is not repainted at
          // every fractional height during the services resize.
          if (!frame.wipeSettled) {
            frame.wipeSettled = true
            wipe.style.clipPath = 'none'
            wipe.style.willChange = 'auto'
          }
        } else {
          if (frame.wipeSettled) {
            frame.wipeSettled = false
            wipe.style.willChange = 'clip-path'
          }
          wipe.style.clipPath = `inset(${((1 - w) * 100).toFixed(2)}% 0 0 0 round ${liveRadius.toFixed(1)}px)`
        }
      }
      // the photo drifts up gently as the wipe passes beneath it
      if (photo) {
        if (w < 0.0005) {
          photo.style.transform = ''
          photo.style.opacity = ''
        } else {
          photo.style.transform = `translateY(${(-8 * w).toFixed(2)}%)`
          photo.style.opacity = (1 - 0.35 * w).toFixed(3)
        }
      }

      // The horizontal slot is stable and can be measured directly. Before
      // the services section pins, however, its Y position rises with the
      // section. Chasing that moving target made the card dip and rebound by
      // hundreds of pixels during the height morph, with wheel-sized jumps at
      // faster input speeds. The final slot is exactly the viewport centre, so
      // hold the card there while it resizes and let the section arrive under
      // it. Travel remains unchanged; only the resize interval is Y-stable.
      // Keep horizontal alignment on the same long, eased merge window; the
      // Y axis intentionally remains fixed throughout the resize.
      const eM = easeInOutCubic(range(rise, 0.27, 0.97))
      const goalX = lerp(vw / 2, slotX, eM)
      const goalY = vh / 2
      const c = cardCur.current
      c.x = lerp(c.x, px * CARD_PARALLAX.translate, CARD_PARALLAX.lerp)
      c.y = lerp(c.y, py * CARD_PARALLAX.translate, CARD_PARALLAX.lerp)
      c.r = lerp(c.r, px * CARD_PARALLAX.rotate, CARD_PARALLAX.lerp)
      const gx = cx - restCX + (goalX - vw / 2) + c.x * idle
      // The fixed ghost has no document-scroll displacement to compensate.
      const gy = goalY - restCY + c.y * idle
      // content morph: the coverflow face slides over the ghost's own mid-fall
      const m = easeInOutCubic(range(rise, 0.38, 0.94))
      // The read phase latches ownership only at the one pixel-identical
      // state: centred, wide, and deck progress zero.
      const cOp = heroHandoff.phase === 'journey' ? 1 : 0

      // same rest rule as the panel: identity transforms are cleared so the
      // resting card (and everything it contains) rasterizes crisp
      const cardAtRest =
        s < 0.0005 &&
        rise < 0.0005 &&
        Math.abs(px) < 0.004 &&
        Math.abs(py) < 0.004 &&
        Math.abs(c.x) < 0.05 &&
        Math.abs(c.y) < 0.05 &&
        Math.abs(c.r) < 0.02
      if (cardAtRest) {
        card.style.transform = ''
        card.style.opacity = ''
      } else {
        // Travel and the continuous resize stay on the compositor. The actual
        // box relayouts only at CARD_GEOM_STEPS shared points; fitX/fitY bridge
        // those points with no visible width or height pop in either direction.
        card.style.transform = `translate3d(${gx.toFixed(2)}px, ${gy.toFixed(2)}px, 0) rotate(${gr.toFixed(3)}deg) scale(${(cardScale * fitX).toFixed(4)}, ${(cardScale * fitY).toFixed(4)})`
        card.style.opacity = cOp.toFixed(3)
      }
      // Once the handoff ghost has disappeared, release its hit area so the
      // real left-side carousel card underneath receives hover and clicks.
      card.style.pointerEvents = cOp <= 0.01 ? 'none' : 'auto'
      // The transparent hero section is still stacked above the carousel, so
      // its viewport-sized box must become click-through along with the ghost.
      setHeroPassThrough(cOp <= 0.01)
      card.style.setProperty('--m', m.toFixed(4))
      // the coverflow keeps its own first card hidden until we've landed
      heroHandoff.ghostOpacity = s >= CARD_JOURNEY.slideFrom ? cOp : 0
      heroHandoff.copyReveal = ghostCopyIn(m)
    }
  })

  // THE card: photo face on top, the mint brand face wiping in from the
  // bottom. Desktop: stage-level (escapes the panel's spin), slides out of
  // the panel slot, grows, swivels upright, then falls into the coverflow.
  // Mobile: rests scaled-down inside the panel's open field, then flies
  // into the same slot. It is never replaced by a new card.
  const heroCard = (
    <div className="pm2-hero-card" ref={cardRef}>
      {/* entrance wrapper: twists and falls into place on load */}
      <div className="pm2-hero-card-enter">
        <div className="pm2-hero-card-float">
          {/* the showreel face — the card IS the video player: muted inline
              preview in the card's own shape; a "View" cursor chip trails the
              pointer on hover; clicking opens the glass lightbox with sound */}
          <div className="pm2-hero-card-reveal" ref={photoRef}>
            <HeroVideo />
          </div>
          {/* wipe face — the scroll wipe reveals it bottom→top; it IS the
              first coverflow card's face (same component, same theme
              class) so the seating swap is invisible */}
          <div
            className={`pm2-hero-card-wipe pm2-carousel-card--${faceTheme(CARD0)} ${CARD0.image ? 'pm2-carousel-card--image' : ''}${CARD0.slug === 'website-design' ? ' pm2-carousel-card--website' : ''}`}
            ref={wipeRef}
            aria-hidden="true"
          >
            {/* the coverflow card's face, slides in with --m */}
            <span className="pm2-hero-ghost-faceB" aria-hidden="true">
              <CardFace card={CARD0} />
            </span>
            {/* the wipe face's own identity, slides out with --m */}
            <span className="pm2-hero-ghost-faceA" aria-hidden="true">
              <Sparkle size={26} color="#0a140f" className="pm2-hero-ghost-sparkle" />
              <span className="pm2-hero-ghost-labelMask">
                <span className="pm2-mask-in pm2-hero-ghost-label">Browse our services</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="pm2-hero" id="top" ref={sectionRef}>
      <div className="pm2-hero-stage">
        {/* the forest panel that spins ~90° away on scroll */}
        <div className="pm2-hero-panel" ref={panelRef}>
          <div className="pm2-hero-inner">
            <div className="pm2-hero-head" ref={titleRef}>
              <span className="pm2-hero-eyebrow">
                <Sparkle size={11} color="#8beec0" className="pm2-hero-eyebrow-mark" />
                {HERO.eyebrow}
              </span>
              <h1 className="pm2-hero-title">
                <span className="pm2-hero-line">
                  <span className="pm2-hero-line-in">{HERO.line1}</span>
                </span>
                <span className="pm2-hero-line pm2-hero-line--accent">
                  <span className="pm2-hero-line-in">{HERO.line2}</span>
                </span>
                <span className="pm2-hero-line">
                  <span className="pm2-hero-line-in">{HERO.line3}</span>
                </span>
              </h1>
            </div>

            <div className="pm2-hero-copy" ref={copyBlockRef}>
              <p className="pm2-hero-lead">{HERO.lead}</p>
            </div>

            {/* proof ledger: the claim above is abstract, these are not. It
                sits between the lead and the CTA because that is the order the
                visitor needs it in — claim, evidence, action. */}
            <dl className="pm2-hero-stats" ref={statsRef}>
              {HERO.stats.map(stat => (
                <div className="pm2-hero-stat" key={stat.label}>
                  <dt className="pm2-hero-stat-value">{stat.value}</dt>
                  <dd className="pm2-hero-stat-label">{stat.label}</dd>
                </div>
              ))}
            </dl>

            <div className="pm2-hero-mid" ref={ctasRef}>
              <div className="pm2-hero-ctas">
                <a
                  className="pm2-pill pm2-pill--white"
                  href={HERO.primaryCta.href}
                  onClick={e => {
                    e.preventDefault()
                    navigate?.(HERO.primaryCta.href)
                  }}
                >
                  <span>{HERO.primaryCta.label}</span>
                  <span className="pm2-hero-cta-icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20">
                      <path d="M4 10h11M11 6l4 4-4 4" />
                    </svg>
                  </span>
                </a>
                <a className="pm2-hero-text-link" href={HERO.secondaryCta.href}>
                  <span>{HERO.secondaryCta.label}</span>
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <path d="M4 14 14 4M7 4h7v7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* mobile only: the open field in the panel's lower half — the
                card's rest slot; the rAF scale-fits the card into it */}
            {isMobile && (
              <div className="pm2-hero-cardSlot" ref={slotRef}>
                {heroCard}
              </div>
            )}

            <div className="pm2-hero-bottom" ref={bottomRef}>
              <div className="pm2-hero-trust">
                <span className="pm2-hero-trust-label">{HERO.trust}</span>
                <span className="pm2-hero-logos">
                  {HERO.logos.map(logo => (
                    <span className="pm2-hero-logo" key={logo.name}>
                      {logo.mark && (
                        <img
                          src={logo.mark}
                          alt=""
                          className={logo.chip ? 'is-chip' : 'is-mark'}
                          width="22"
                          height="22"
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                        />
                      )}
                      {logo.word ? (
                        <img
                          src={logo.word}
                          alt={logo.name}
                          className="is-word"
                          height="15"
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                        />
                      ) : (
                        <span className="pm2-hero-logo-name">{logo.name}</span>
                      )}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* Desktop: keep the moving card outside the sticky perspective stage.
          This makes it genuinely viewport-fixed, so asynchronous native or
          magnetic scroll cannot move it between our read and write frames. */}
      {!isMobile && heroCard}
    </section>
  )
}
