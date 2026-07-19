// Four-pointed sparkle (✦) — the signature mark of the landing's visual system.
import { useId } from 'react'

export function sparklePath(size = 100) {
  const s = size / 100
  // Concave quadratic curves between the four tips.
  return `M ${50 * s} 0 Q ${58 * s} ${42 * s} ${100 * s} ${50 * s} Q ${58 * s} ${58 * s} ${50 * s} ${100 * s} Q ${42 * s} ${58 * s} 0 ${50 * s} Q ${42 * s} ${42 * s} ${50 * s} 0 Z`
}

export default function Sparkle({
  size = 24,
  className = '',
  style,
  color = 'currentColor',
  gradient = null, // [from, to] — diagonal brand gradient when set
  stroke = null,
}) {
  const id = useId()
  const fill = gradient ? `url(#${id})` : color
  return (
    <svg
      className={`pm2-sparkle ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={style}
    >
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
      )}
      <path
        d={sparklePath(100)}
        fill={fill}
        stroke={stroke || 'none'}
        strokeWidth={stroke ? 2 : 0}
      />
    </svg>
  )
}
