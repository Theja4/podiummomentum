// Shared motion primitives for the Podium Momentum landing (src/landing/*).
// Every scroll/pointer-driven animation reads values from these hooks inside a
// rAF loop and writes styles imperatively — no per-frame React state.
import { useEffect, useRef, useState } from 'react'

export const clamp01 = v => Math.min(1, Math.max(0, v))
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
export const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
// Gentler S-curve: peak slope ~1.57 vs cubic's 3 — for scroll-driven size
// morphs where a steep middle amplifies every wheel tick into a size jump.
export const easeInOutSine = t => (1 - Math.cos(Math.PI * clamp01(t))) / 2
export const easeOutQuart = t => 1 - Math.pow(1 - t, 4)
export const easeOutBack = t => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
// Map progress p through a sub-range [a, b] -> 0..1
export const range = (p, a, b) => clamp01((p - a) / (b - a))

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// —— rAF loop ————————————————————————————————————————————————
// useRafLoop((dt, now) => { ... }) — dt clamped to 50ms, runs until unmount.
// All subscribers share ONE requestAnimationFrame pump in TWO phases:
//   1. read phase (useRafRead)  — every DOM measurement, on layout that is
//      still clean from the previous frame's render, so no read ever forces
//      a mid-frame reflow;
//   2. write phase (useRafLoop) — every style write.
// Interleaved read→write→read across components was forcing multiple
// synchronous layouts per frame right at the hero→services handoff.
const rafReads = new Set()
const rafSubs = new Set()
let rafId = 0
let rafLast = 0
function rafPump(now) {
  rafId = requestAnimationFrame(rafPump)
  const dt = Math.min(50, now - rafLast)
  rafLast = now
  rafReads.forEach(cb => cb(dt, now))
  rafSubs.forEach(cb => cb(dt, now))
}
function useRafPhase(set, callback) {
  const cbRef = useRef(callback)
  cbRef.current = callback
  useEffect(() => {
    const cb = (dt, now) => cbRef.current(dt, now)
    set.add(cb)
    if (rafReads.size + rafSubs.size === 1) {
      rafLast = performance.now()
      rafId = requestAnimationFrame(rafPump)
    }
    return () => {
      set.delete(cb)
      if (rafReads.size + rafSubs.size === 0) cancelAnimationFrame(rafId)
    }
  }, [])
}
export function useRafLoop(callback) {
  useRafPhase(rafSubs, callback)
}
export function useRafRead(callback) {
  useRafPhase(rafReads, callback)
}

// Frame-rate independent smoothing: `smooth` keeps its historical meaning of
// "lerp fraction per 60Hz frame", corrected for the real dt so a 120Hz
// display converges at the same speed (in ms) as a 60Hz one — before this,
// ProMotion screens ran every scroll lag at literally twice the stiffness.
export const smoothFactor = (smooth, dt) => 1 - Math.pow(1 - smooth, dt / 16.667)

// Exponential smoothing absorbs discrete wheel/trackpad steps, but on its own
// it still lets a large scroll jump produce a very fast first frame. Cap the
// follower's velocity as well so every scrubbed sequence has a predictable
// maximum visual speed, independent of the input device or refresh rate.
export function smoothToward(current, target, smooth, dt, maxSpeed = Infinity) {
  const desired = (target - current) * smoothFactor(smooth, dt)
  const maxDelta = Number.isFinite(maxSpeed)
    ? maxSpeed * (Math.min(50, Math.max(0, dt)) / 1000)
    : Infinity
  return current + clamp(desired, -maxDelta, maxDelta)
}

// —— global scroll state (one listener set for the whole page) ————————————
const scrollState = { y: 0, vh: 1, vw: 1 }
let scrollInit = false
function measure() {
  scrollState.y = window.scrollY || window.pageYOffset || 0
  scrollState.vh = window.innerHeight || 1
  scrollState.vw = window.innerWidth || 1
}
export function getScroll() {
  if (!scrollInit && typeof window !== 'undefined') {
    scrollInit = true
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
  }
  return scrollState
}

// —— section progress ——————————————————————————————————————————
// Returns a ref whose .current is smoothed progress 0..1, updated every frame.
// mode 'travel' (default): 0 when section top enters viewport bottom,
//   1 when section bottom leaves viewport top.
// mode 'sticky': for a tall section (e.g. 300vh) with a position:sticky stage
//   inside — 0 when section top hits viewport top, 1 when its bottom hits
//   viewport bottom. Use this for pinned/scrubbed sequences.
// mode 'enter': 0 -> 1 while the section rises through the bottom 65% of the
//   viewport; good for one-way reveals.
export function useProgress(
  ref,
  { smooth = 0.16, mode = 'travel', maxSpeed = 0.9, active = true } = {},
) {
  const out = useRef(0)
  // Read phase: rect reads land on clean layout, and every write-phase
  // consumer sees this frame's fresh value regardless of mount order.
  useRafRead(dt => {
    if (!active) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const { vh } = getScroll()
    let raw
    if (mode === 'sticky') raw = clamp01(-r.top / Math.max(1, r.height - vh))
    else if (mode === 'enter') raw = clamp01((vh - r.top) / (vh * 0.65))
    else raw = clamp01((vh - r.top) / (vh + r.height))
    // Snap to bounds so resting states are exact.
    if (raw === 0 && out.current < 0.001) out.current = 0
    else if (raw === 1 && out.current > 0.999) out.current = 1
    else out.current = smoothToward(out.current, raw, smooth, dt, maxSpeed)
  })
  return out
}

// —— pointer, normalized to viewport center, lerped ————————————————————————
// .current = { x, y } in [-1, 1]; smoothed each frame.
export function usePointer(smooth = 0.075) {
  const out = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  useEffect(() => {
    const onMove = e => {
      out.current.tx = (e.clientX / (window.innerWidth || 1)) * 2 - 1
      out.current.ty = (e.clientY / (window.innerHeight || 1)) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  useRafRead(dt => {
    const p = out.current
    const k = smoothFactor(smooth, dt)
    p.x = lerp(p.x, p.tx, k)
    p.y = lerp(p.y, p.ty, k)
  })
  return out
}

// —— visibility (pause heavy canvases offscreen) ———————————————————————————
export function useVisible(ref, rootMargin = '240px') {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      entries => setVisible(entries[0].isIntersecting),
      { rootMargin, threshold: 0.01 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return visible
}

// —— one-shot in-view class reveal: adds .pm2-in to the element once ————————
export function useReveal(ref, { threshold = 0.18 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          el.classList.add('pm2-in')
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
}
