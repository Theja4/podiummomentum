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
  useProgress,
  usePointer,
  clamp01,
  lerp,
  range,
  easeInOutCubic,
  easeOutBack,
} from './motion.js'
import Sparkle from './Sparkle.jsx'
import HeroVideo from './HeroVideo.jsx'
import { CardFace, faceTheme } from './Carousel.jsx'
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
  uprightFrom: 0.15,
  uprightTo: 0.75,
  wipeFrom: 0.12, // the mint face wipes in bottom→top (reverse of the load wipe)
  wipeTo: 0.55,
  seatFrom: 0.86, // shrinks to the exact coverflow card size, fully upright
  seatTo: 1,
  // the fall into the coverflow's first-card slot is driven live by that
  // section's rise (see the rAF loop): merge across rise 0.62→0.97, then a
  // hard one-frame swap at rise 0.96 (faces are pixel-identical by then)
}
const IDLE_TILT_RANGE = 0.12 // sticky-progress range over which card parallax dies
const CARD_PARALLAX = { translate: 0, rotate: 0, lerp: 0.12 } // px / deg / per-frame
// (parallax disabled: any residual sub-pixel rotate/translate composites the
// card face soft — the user wants it razor sharp; the float + journey motion
// already carry the liveliness)
const PROGRESS_SMOOTH = 0.14
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
  openFrom: 0.72,
  openTo: 0.965,
}

export default function Hero({ navigate }) {
  const sectionRef = useRef(null)
  const panelRef = useRef(null)
  const cardRef = useRef(null)
  const wipeRef = useRef(null)
  const photoRef = useRef(null)
  const titleRef = useRef(null)
  const copyBlockRef = useRef(null)
  const bottomRef = useRef(null)
  const carouselRef = useRef(null)
  const card0Ref = useRef(null)

  const sticky = useProgress(sectionRef, { mode: 'sticky', smooth: PROGRESS_SMOOTH })
  const pointer = usePointer()

  const cardCur = useRef({ x: 0, y: 0, r: 0 })
  // Per-frame write dedupe: geometry writes (width/height/margin) invalidate
  // layout, so they only happen when the value actually changed; one-shot
  // clears are flagged so rest frames write nothing at all.
  const frameCache = useRef({
    geomKey: '',
    staticCleared: false,
    reducedCleared: false,
    heroPointerEvents: '',
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
    const INPUT_GRACE = 70 // ms since last real input before the magnet engages
    const ENGAGE_LO = 0.05
    const ENGAGE_HI = 0.95
    const MID = 0.5
    const PROJECT = 0.16 // s of velocity look-ahead — a flick commits its way

    const anchors = () => {
      if (reducedRef.current || mobileRef.current) return null
      // the magnet is the desktop pinned journey; mobile flies the card through
      // the seam on its own as you scroll, no snap
      const el = sectionRef.current
      const services = document.getElementById('services')
      if (!el || !services) return null
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      if (r.height - vh <= 0) return null
      // restY — hero at rest; seatY — card fully fallen into the coverflow's
      // first-card slot (only complete once services rises to the viewport top).
      const restY = window.scrollY + r.top
      const seatY = window.scrollY + services.getBoundingClientRect().top
      const span = seatY - restY
      if (span <= 0) return null
      return { restY, seatY, span }
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
        window.scrollTo(0, springPos)
        lastY = window.scrollY // our own write must not read back as user velocity
        if (Math.abs(springPos - target) < 0.4 && Math.abs(springVel) < 10) {
          window.scrollTo(0, target)
          endSpring()
        }
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

      // flick-to-commit: project where the residual velocity is headed so a
      // decisive flick toward the seat completes even from just under halfway
      const projected = progress + (velPPS * PROJECT) / a.span
      target = projected >= MID ? a.seatY : a.restY
      springPos = y
      springVel = velPPS // seamless: carry the incoming inertia into the spring
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
    }
  }, [])

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

      // Rest geometry: the card is BUILT at the coverflow's exact mobile
      // card size and scale-fitted into the slot the panel reserves for it
      // (measured live — the wrapper never transforms, so its rect is safe).
      const wrapR = slotRef.current ? slotRef.current.getBoundingClientRect() : null
      const cw = card.offsetWidth || 1
      const ch = card.offsetHeight || 1
      const restS = wrapR
        ? Math.min(M.restMaxS, Math.max(M.restMinS, Math.min(wrapR.width / cw, wrapR.height / ch)))
        : 0.6
      const restCX = wrapR ? wrapR.left + wrapR.width / 2 : vw / 2
      const restCY = wrapR ? wrapR.top + wrapR.height / 2 : vh / 2

      if (reducedRef.current) {
        // reduced motion on mobile: the card holds its rest fit, no journey
        setHeroPassThrough(false)
        heroHandoff.ghostOpacity = 0
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

      // —— the mobile journey: driven by the services section's rise ——
      if (!carouselRef.current) carouselRef.current = document.getElementById('services')
      const cEl = carouselRef.current
      const rise = cEl ? clamp01((vh - cEl.getBoundingClientRect().top) / vh) : 0

      // the coverflow's first-card slot, tracked live from its ACTUAL rect —
      // so the ghost lands exactly on it at any scroll speed
      let slotX = vw / 2
      let slotY = vh / 2
      let seatS = 1
      if (cEl) {
        if (!card0Ref.current || !card0Ref.current.isConnected) {
          card0Ref.current = cEl.querySelector('.pm2-carousel-card')
        }
        if (card0Ref.current) {
          const r = card0Ref.current.getBoundingClientRect()
          if (r.width > 1) {
            slotX = r.left + r.width / 2
            slotY = r.top + r.height / 2
            seatS = r.width / cw
          }
        }
      }

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
      return
    }

    const vw = window.innerWidth || 1
    const vh = window.innerHeight || 1
    frame.staticCleared = false

    // —— frame reads: every layout query happens up front, before any style
    // write in this loop, so no read can force a mid-frame reflow. ———
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
        if (r.width > 1) {
          slotX = r.left + r.width / 2
          slotY = r.top + r.height / 2
        }
      }
    }
    const heroR = sectionRef.current ? sectionRef.current.getBoundingClientRect() : null
    const cardW = card ? card.offsetWidth || 1 : 1
    const cardH = card ? card.offsetHeight || 1 : 1
    const cardL = card ? card.offsetLeft : 0
    const cardT = card ? card.offsetTop : 0

    // —— panel spin (sticky progress 0→1): flat ~90° clockwise rotation ——
    // NOTE: the panel carries ALL the hero copy, so it never 3D-tilts on
    // pointer idle (any non-identity 3D transform composited the panel and
    // rasterized its text soft). Pointer parallax lives on the card only.
    const s = sticky.current
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
    // stagger (title → lead/CTAs/stats → trust strip), ahead of the panel's
    // spin. Progress-driven, so it plays in reverse on the way back up. ——
    const exits = [
      [titleRef.current, 0, 0.18],
      [copyBlockRef.current, 0.05, 0.23],
      [bottomRef.current, 0.1, 0.28],
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
      // opens into the wider services canvas during the final merge. Real
      // dimensions reflow the artwork instead of stretching it with scaleX.
      const cardExpansion = easeInOutCubic(
        range(rise, DESKTOP_WIDE_CARD.openFrom, DESKTOP_WIDE_CARD.openTo),
      )
      heroHandoff.cardExpansion = cardExpansion
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
      // Geometry writes dirty layout; only touch them when the values moved.
      const geomKey = `${liveW.toFixed(1)}|${liveH.toFixed(1)}|${cardExpansion.toFixed(4)}`
      if (frame.geomKey !== geomKey) {
        frame.geomKey = geomKey
        card.style.width = `${liveW.toFixed(1)}px`
        card.style.height = `${liveH.toFixed(1)}px`
        card.style.marginTop = `${(-liveH / 2).toFixed(1)}px`
        card.style.setProperty('--pm2-card-pad', `${lerp(22, 30, cardExpansion).toFixed(1)}px`)
        card.style.setProperty('--pm2-card-radius', `${liveRadius.toFixed(1)}px`)
        card.style.setProperty('--pm2-card-title', `${lerp(36, 46, cardExpansion).toFixed(1)}px`)
        card.style.setProperty('--pm2-card-copy', `${lerp(14, 16, cardExpansion).toFixed(1)}px`)
      }

      // Rest geometry is MEASURED (offsetLeft/offsetTop are layout values,
      // unaffected by the transforms we write), never mirrored from CSS —
      // read once in the frame's read phase above.
      const stickySpan = heroR ? heroR.height - vh : 0
      // sticky stage: pinned at 0 while the section scrolls through, then
      // scrolls up with it after release
      const stageTop = heroR ? (heroR.top > -stickySpan ? 0 : heroR.top + stickySpan) : 0
      const stageLeft = heroR ? heroR.left : 0
      const restCX = stageLeft + cardL + cardW / 2
      const restCY = stageTop + cardT + cardH / 2
      // the coverflow card it will become (mirrors carousel.css card sizing —
      // the hero card is built at the same size, so the seat scale lands 1.0;
      // short desktop viewports use the compact card tune)
      const seatS = liveW / cardW

      // ONE simultaneous motion with the panel's spin: slide + grow + swivel
      const eG = easeInOutCubic(range(s, CARD_JOURNEY.slideFrom, CARD_JOURNEY.slideTo))
      const eUp = easeInOutCubic(range(s, CARD_JOURNEY.uprightFrom, CARD_JOURNEY.uprightTo))
      const eS = easeOutBack(range(s, CARD_JOURNEY.seatFrom, CARD_JOURNEY.seatTo)) // soft snap
      // grown size is capped so the card never fills/stretches past the window
      const gsMax = Math.min(
        CARD_JOURNEY.growScale,
        (vw * 0.86) / cardW,
        (vh * 0.86) / cardH,
      )
      const growS = lerp(1, gsMax, eG)
      const cardScale = lerp(growS, seatS, eS)
      const gr = -4 * (1 - eUp)
      // slides from the panel slot to the stage center
      const cx = lerp(restCX, vw / 2, eG)
      const cy = lerp(restCY, vh / 2, eG)

      // —— the sliding wipe: the mint face rises from the card's bottom edge ——
      const w = easeInOutCubic(range(s, CARD_JOURNEY.wipeFrom, CARD_JOURNEY.wipeTo))
      if (wipe) {
        wipe.style.clipPath = `inset(${((1 - w) * 100).toFixed(2)}% 0 0 0 round ${liveRadius.toFixed(1)}px)`
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

      // The coverflow's first-card slot (slotX/slotY) was tracked from the
      // card's ACTUAL rendered rect in the read phase above — so the ghost
      // lands exactly on it at any scroll speed.
      // The final slide now spans .70 of the services rise instead of .35:
      // exactly twice the scroll distance, with the same settled endpoint.
      const eM = easeInOutCubic(range(rise, 0.27, 0.97))
      const goalX = lerp(vw / 2, slotX, eM)
      const goalY = lerp(vh / 2, slotY, eM)
      const c = cardCur.current
      c.x = lerp(c.x, px * CARD_PARALLAX.translate, CARD_PARALLAX.lerp)
      c.y = lerp(c.y, py * CARD_PARALLAX.translate, CARD_PARALLAX.lerp)
      c.r = lerp(c.r, px * CARD_PARALLAX.rotate, CARD_PARALLAX.lerp)
      const gx = cx - restCX + (goalX - vw / 2) + c.x * idle
      const gy = cy - restCY + (goalY - vh / 2) + c.y * idle
      // content morph: the coverflow face slides over the ghost's own mid-fall
      const m = easeInOutCubic(range(rise, 0.38, 0.94))
      // the faces are pixel-identical by now — a hard one-frame swap
      const cOp = rise < 0.96 ? 1 : 0

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
        card.style.transform = `translate3d(${gx.toFixed(2)}px, ${gy.toFixed(2)}px, 0) rotate(${gr.toFixed(3)}deg) scale(${cardScale.toFixed(4)})`
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

            <div className="pm2-hero-mid">
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

        {/* desktop: the card lives at stage level so it escapes the panel's
            spin and can fly the pinned journey */}
        {!isMobile && heroCard}
      </div>
    </section>
  )
}
