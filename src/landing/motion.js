// Shared motion primitives for the Podium Momentum landing (src/landing/*).
// Every scroll/pointer-driven animation reads values from these hooks inside a
// rAF loop and writes styles imperatively — no per-frame React state.
import { useEffect, useRef, useState } from 'react'

export const clamp01 = v => Math.min(1, Math.max(0, v))
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
export const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
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
export function useRafLoop(callback) {
  const cbRef = useRef(callback)
  cbRef.current = callback
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = now => {
      const dt = Math.min(50, now - last)
      last = now
      cbRef.current(dt, now)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
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
export function useProgress(ref, { smooth = 0.16, mode = 'travel' } = {}) {
  const out = useRef(0)
  useRafLoop(() => {
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
    else out.current = lerp(out.current, raw, smooth)
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
  useRafLoop(() => {
    const p = out.current
    p.x = lerp(p.x, p.tx, smooth)
    p.y = lerp(p.y, p.ty, smooth)
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
