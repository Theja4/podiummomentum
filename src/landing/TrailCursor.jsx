// TrailCursor — a glass chip that replaces the native cursor over a hover
// zone and trails the pointer with a soft lerp ("View" over the showreel,
// "Explore" over the service cards). Two elements on purpose: the outer
// mover carries ONLY the per-frame JS translation, while the inner chip
// owns the opacity/scale bloom. Folding the bloom's scale into the mover's
// transform chain scales the translate as well, so the chip would spring
// from the layer's origin corner instead of opening under the pointer.
// The owner feeds viewport coords through moveRef ({x, y} on mousemove).
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './trail-cursor.css'

const cursorArrowPath = arrow => {
  if (arrow === 'left') return 'M13 8H3M7 4 3 8l4 4'
  if (arrow === 'right') return 'M3 8h10M9 4l4 4-4 4'
  return 'M4 12 12 4M6 4h6v6'
}

export default function TrailCursor({ label, show, moveRef, lerp = 0.22, arrow = false }) {
  const moverRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!show) return undefined
    // snap to the entry point first: the bloom opens exactly ON the pointer,
    // the lerp only takes over as the pointer actually moves
    pos.current.x = moveRef.current.x
    pos.current.y = moveRef.current.y
    let raf = 0
    const tick = () => {
      const p = pos.current
      p.x += (moveRef.current.x - p.x) * lerp
      p.y += (moveRef.current.y - p.y) * lerp
      if (moverRef.current) {
        moverRef.current.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [show, moveRef, lerp])

  return createPortal(
    <div
      ref={moverRef}
      className={`pm2-trail-cursor ${arrow ? `pm2-trail-cursor--arrow pm2-trail-cursor--arrow-${arrow}` : ''} ${show ? 'is-on' : ''}`}
      aria-hidden="true"
    >
      <span className="pm2-trail-cursor-chip">
        <span>{label}</span>
        {arrow && (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d={cursorArrowPath(arrow)} />
          </svg>
        )}
      </span>
    </div>,
    document.body,
  )
}
