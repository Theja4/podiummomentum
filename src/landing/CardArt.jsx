// Bespoke card artwork — one animated scene per service, built like real
// product artifacts rather than abstract illustration:
//   website-design    → "The Strip"  — a clean filmstrip of REAL shipped
//                        landing pages (no fake browser chrome, no badges),
//                        rolling to the next shot every second
//   ai-agents         → "The Dial"   — a rotating tri-color arc ring around
//                        a layered dark lens, curved labels drifting on the
//                        outer orbit, static centre pill
//   digital-marketing → "The Surge"  — one message, writ large: pill bars
//                        climbing, a thick trend line shooting past them,
//                        and a headline +248% — all mint, all legible small
//   branding          → "The Wall"   — a 3×3 grid of logomark tiles that
//                        light up in brand color one after another
// Scenes fill the viewBox edge to edge — big elements, no dead margins.
// All motion is CSS (card-art.css) on transforms/opacity/dashes/fills.
// Scenes must hold a composed static state (off-centre cards + the hero's
// ghost face render without animation), so every scene's base = final frame.
import { useId } from 'react'

const VB = '0 0 326 340'

// —— shared bits ————————————————————————————————————————————————

// four-point concave star path (waist ratio matches Sparkle.jsx), centred at
// (cx, cy) with outer radius r
function starPath(cx, cy, r, waist = 0.2333) {
  const k = r * waist
  return (
    `M${cx} ${cy - r}Q${cx + k} ${cy - k} ${cx + r} ${cy}` +
    `Q${cx + k} ${cy + k} ${cx} ${cy + r}` +
    `Q${cx - k} ${cy + k} ${cx - r} ${cy}` +
    `Q${cx - k} ${cy - k} ${cx} ${cy - r}Z`
  )
}

// —— 1 · Website Design — "The Strip" (light ice card) ————————————————
// Nothing but the work: three real landing pages in a vertical filmstrip
// that rolls one slot every second. The first TWO shots repeat at the end:
// the wrap lands on the duplicate of shot 1 with shot 2's duplicate peeking
// below — pixel-identical to the loop start, so the seam is invisible even
// mid-slide. Each shot is a plain rounded image with a hairline border — no
// chrome, no gadgets.

const SITE_SHOTS = [
  '/assets/service-card-sites/site-noola.jpg',
  '/assets/service-card-sites/site-kumo.jpg',
  '/assets/service-card-sites/site-northstar.jpg',
]

const STRIP_X = 13
const STRIP_W = 300
const SLOT_H = 190
const SLOT_STEP = 200 // slot + gap — card-art.css reel keyframes step by this
const STRIP_Y = 10
const STRIP_H = 320

function ArtWebsite() {
  const uid = useId().replace(/:/g, '')
  const slots = [...SITE_SHOTS, SITE_SHOTS[0], SITE_SHOTS[1]]
  return (
    <svg className="pm2-art pm2-art--web" viewBox={VB} aria-hidden="true">
      <defs>
        <clipPath id={`wf${uid}`}>
          <rect x={STRIP_X} y={STRIP_Y} width={STRIP_W} height={STRIP_H} rx="18" />
        </clipPath>
        {slots.map((_, i) => (
          <clipPath key={i} id={`ws${uid}${i}`}>
            <rect x={STRIP_X} y={STRIP_Y + i * SLOT_STEP} width={STRIP_W} height={SLOT_H} rx="14" />
          </clipPath>
        ))}
      </defs>

      <g clipPath={`url(#wf${uid})`}>
        <g className="pm2-art-web-reel">
          {slots.map((src, i) => (
            <g key={i}>
              <image
                clipPath={`url(#ws${uid}${i})`}
                href={src}
                x={STRIP_X}
                y={STRIP_Y + i * SLOT_STEP}
                width={STRIP_W}
                height={SLOT_H}
                preserveAspectRatio="xMidYMid slice"
              />
              <rect
                x={STRIP_X + 0.5}
                y={STRIP_Y + i * SLOT_STEP + 0.5}
                width={STRIP_W - 1}
                height={SLOT_H - 1}
                rx="13.5"
                fill="none"
                stroke="rgba(10,20,15,0.16)"
              />
            </g>
          ))}
        </g>
      </g>
    </svg>
  )
}

// —— 2 · AI Agents — "The Dial" (onyx card) ——————————————————————————
// The strategy dial: a tri-color arc ring turning around a layered dark
// lens, curved labels drifting on the outer orbit, static centre pill.

const DIAL_CX = 163
const DIAL_CY = 170
const RING_R = 76
const RING_C = 2 * Math.PI * RING_R // ≈ 477.5
const ORBIT_R = 118

function ArtAgents() {
  const uid = useId().replace(/:/g, '')
  const arc = (color, angle) => (
    <circle
      cx={DIAL_CX}
      cy={DIAL_CY}
      r={RING_R}
      fill="none"
      stroke={color}
      strokeWidth="17"
      strokeLinecap="round"
      strokeDasharray={`142 ${RING_C - 142}`}
      transform={`rotate(${angle} ${DIAL_CX} ${DIAL_CY})`}
    />
  )
  return (
    <svg className="pm2-art pm2-art--agents" viewBox={VB} aria-hidden="true">
      <defs>
        <radialGradient id={`dg${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#67e0a3" stopOpacity="0.16" />
          <stop offset="1" stopColor="#67e0a3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`dp${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.10" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <path
          id={`dl${uid}`}
          d={`M${DIAL_CX} ${DIAL_CY - ORBIT_R}a${ORBIT_R} ${ORBIT_R} 0 1 1 -0.01 0`}
          fill="none"
        />
      </defs>

      <circle cx={DIAL_CX} cy={DIAL_CY} r="150" fill={`url(#dg${uid})`} />

      {/* outer orbit: thin circle, drifting curved labels + node dots */}
      <circle
        cx={DIAL_CX}
        cy={DIAL_CY}
        r={ORBIT_R}
        fill="none"
        stroke="rgba(175,249,201,0.20)"
        strokeWidth="1.1"
      />
      <g className="pm2-art-ai-labels">
        <text className="pm2-art-font pm2-art-ai-label" fontSize="13.5" letterSpacing="0.06em">
          <textPath href={`#dl${uid}`} startOffset="1%">
            Perceive
          </textPath>
        </text>
        <text className="pm2-art-font pm2-art-ai-label" fontSize="13.5" letterSpacing="0.06em">
          <textPath href={`#dl${uid}`} startOffset="37%">
            Reason
          </textPath>
        </text>
        <text className="pm2-art-font pm2-art-ai-label" fontSize="13.5" letterSpacing="0.06em">
          <textPath href={`#dl${uid}`} startOffset="71%">
            Act
          </textPath>
        </text>
        <circle cx={DIAL_CX + ORBIT_R * 0.766} cy={DIAL_CY - ORBIT_R * 0.643} r="3.2" fill="#0a1510" stroke="rgba(175,249,201,0.55)" strokeWidth="1.2" />
        <circle cx={DIAL_CX - ORBIT_R} cy={DIAL_CY} r="3.2" fill="#0a1510" stroke="rgba(175,249,201,0.55)" strokeWidth="1.2" />
        <circle cx={DIAL_CX + ORBIT_R * 0.5} cy={DIAL_CY + ORBIT_R * 0.866} r="5" fill="#7cf0bd" />
      </g>

      {/* focus pulse rising off the ring */}
      <circle className="pm2-art-ai-pulse pm2-art-ai-pulse--1" cx={DIAL_CX} cy={DIAL_CY} r={RING_R} fill="none" stroke="#67e0a3" strokeWidth="1.6" />
      <circle className="pm2-art-ai-pulse pm2-art-ai-pulse--2" cx={DIAL_CX} cy={DIAL_CY} r={RING_R} fill="none" stroke="#67e0a3" strokeWidth="1.6" />

      {/* the colored ring: dark track + three arcs, turning */}
      <circle cx={DIAL_CX} cy={DIAL_CY} r={RING_R} fill="none" stroke="#0f2016" strokeWidth="17" />
      <g className="pm2-art-ai-ring">
        {arc('#8b7bff', -18)}
        {arc('#67e0a3', 102)}
        {arc('#ffc548', 222)}
      </g>

      {/* layered lens core */}
      <circle cx={DIAL_CX} cy={DIAL_CY} r="64" fill="#0d1a13" />
      <circle cx={DIAL_CX} cy={DIAL_CY} r="55" fill="#0a150e" stroke="rgba(255,255,255,0.10)" />
      <circle cx={DIAL_CX} cy={DIAL_CY} r="45" fill="#070f0a" stroke="rgba(255,255,255,0.08)" />
      <circle cx={DIAL_CX} cy={DIAL_CY} r="33" fill="#040a07" stroke="rgba(255,255,255,0.06)" />
      <path
        d={`M${DIAL_CX - 41} ${DIAL_CY - 42}a58 58 0 0 1 82 0`}
        fill="none"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* centre pill — stays level while everything turns */}
      <g className="pm2-art-ai-pill">
        <rect x="93" y="148" width="140" height="44" rx="22" fill="#0e1611" stroke="rgba(255,255,255,0.13)" />
        <rect x="93" y="148" width="140" height="22" rx="11" fill={`url(#dp${uid})`} />
        <path d={starPath(114, 170, 8)} fill="#7cf0bd" />
        <text x="175" y="176" textAnchor="middle" className="pm2-art-font" fill="#f2fff7" fontSize="16.5" fontWeight="600">
          AI Agents
        </text>
      </g>
    </svg>
  )
}

// —— 3 · Digital Marketing — "The Surge" (deep forest card) ——————————————
// One message, writ large: growth. Five pill bars climb across the full
// card, a thick trend line rides their tops and breaks upward past the
// tallest, and the headline number says the rest. Brand mint only.

const SG_BARS = [
  { x: 42, h: 70 },
  { x: 94, h: 110 },
  { x: 146, h: 152 },
  { x: 198, h: 196 },
  { x: 250, h: 248 },
]
const SG_BASE = 330
const SG_BAR_W = 34
const SG_LINE = 'M42 248C86 232 118 210 158 178C196 148 234 122 272 84'

function ArtMarketing() {
  const uid = useId().replace(/:/g, '')
  return (
    <svg className="pm2-art pm2-art--marketing" viewBox={VB} aria-hidden="true">
      <defs>
        <linearGradient id={`sb${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#67e0a3" />
          <stop offset="1" stopColor="#1e7a50" />
        </linearGradient>
        <linearGradient id={`st${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3fced" />
          <stop offset="1" stopColor="#2fbf7f" />
        </linearGradient>
        <radialGradient id={`sg${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7cf0bd" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7cf0bd" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* headline number — the whole story in one glance */}
      <g className="pm2-art-sg-kpi">
        <text x="24" y="66" className="pm2-art-font" fill="#e3fced" fontSize="44" fontWeight="700" letterSpacing="-0.02em">
          +248%
        </text>
        <text x="26" y="92" className="pm2-art-font" fill="rgba(227,252,237,0.55)" fontSize="13.5">
          organic growth, one quarter
        </text>
      </g>

      {/* baseline */}
      <line x1="24" y1={SG_BASE} x2="302" y2={SG_BASE} stroke="rgba(175,249,201,0.22)" strokeWidth="1.5" />

      {/* glow pooled behind the tallest bar */}
      <ellipse className="pm2-art-sg-glow" cx="267" cy="110" rx="70" ry="60" fill={`url(#sg${uid})`} />

      {/* pill bars climbing */}
      {SG_BARS.map((b, i) => (
        <rect
          key={b.x}
          className={`pm2-art-sg-bar pm2-art-sg-bar--${i}`}
          x={b.x}
          y={SG_BASE - b.h}
          width={SG_BAR_W}
          height={b.h}
          rx={SG_BAR_W / 2}
          fill={i === SG_BARS.length - 1 ? `url(#st${uid})` : `url(#sb${uid})`}
        />
      ))}

      {/* the trend line breaking upward past the bars */}
      <path
        className="pm2-art-sg-line"
        d={SG_LINE}
        fill="none"
        stroke="#e3fced"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength="100"
      />
      <circle className="pm2-art-sg-dot" cx="272" cy="84" r="7" fill="#e3fced" />
      <circle className="pm2-art-sg-dotring" cx="272" cy="84" r="6" fill="none" stroke="#e3fced" strokeWidth="1.6" />
    </svg>
  )
}

// —— 4 · Branding — "The Wall" (glow card) ———————————————————————————
// A wall of logomark tiles; while the card holds focus, tiles take turns
// lighting up in color (reference: the Brand Visual grid). The centre tile
// carries the podium sails and is the composed static state.

// the podium sails + spark — exact geometry from public/assets/brand-mark.svg
const SAILS = [
  'M0 279V253.5A38.5 38.5 0 0 1 77 253.5V279H0Z',
  'M93 279V202A37 37 0 0 1 167 202V279H93Z',
  'M182 279V153A43 43 0 0 1 268 153V279H182Z',
  'M225 1Q235.3 34.7 269 45Q235.3 55.3 225 89Q214.7 55.3 181 45Q214.7 34.7 225 1Z',
]

const TILE = 98
const GAP = 12
const TILE_COLORS = [
  '#ff5a49', // coral
  '#8b7bff', // violet
  '#ffc548', // amber
  '#ee3d8f', // pink
  '#3fda93', // brand mint — centre sails tile
  '#8b7bff', // violet
  '#ffc548', // amber
  '#2dd4bf', // teal
  '#ff5a49', // coral
]

// each glyph is drawn centred on (0,0) in a ~48px box
const TILE_GLYPHS = [
  // 0 · soft concave diamond
  () => <path d={starPath(0, 0, 23, 0.5)} />,
  // 1 · burst — eight petals around a core
  () => (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return <circle key={i} cx={Math.cos(a) * 14.3} cy={Math.sin(a) * 14.3} r="6.6" />
      })}
      <circle r="8" />
    </>
  ),
  // 2 · rotated square, punched
  () => (
    <path
      fillRule="evenodd"
      d="M0 -23L23 0L0 23L-23 0Z M0 -9.4A9.4 9.4 0 1 0 0.01 -9.4Z"
    />
  ),
  // 3 · facing arcs
  () => (
    <g fill="none" strokeWidth="7.5" strokeLinecap="round">
      <path d="M-4.5 -15.5a16.5 16.5 0 0 0 0 31" className="pm2-art-br-stroke" />
      <path d="M4.5 -15.5a16.5 16.5 0 0 1 0 31" className="pm2-art-br-stroke" />
    </g>
  ),
  // 4 · the podium sails (brand mark)
  () => (
    <g transform="translate(-17.5 -18.2) scale(0.13)">
      {SAILS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  ),
  // 5 · lens stack
  () => (
    <>
      <ellipse cx="-2.2" cy="-12" rx="16.5" ry="7" />
      <ellipse cx="2.2" cy="0" rx="16.5" ry="7" />
      <ellipse cx="-2.2" cy="12" rx="16.5" ry="7" />
    </>
  ),
  // 6 · hex nut
  () => (
    <path
      fillRule="evenodd"
      d="M0 -22L19 -11L19 11L0 22L-19 11L-19 -11Z M0 -8.8A8.8 8.8 0 1 0 0.01 -8.8Z"
    />
  ),
  // 7 · orbit ring + moon
  () => (
    <>
      <path
        fillRule="evenodd"
        d="M0 -17.6A17.6 17.6 0 1 0 0.01 -17.6Z M0 -9.9A9.9 9.9 0 1 1 -0.01 -9.9Z"
      />
      <circle cx="15" cy="-15" r="5" />
    </>
  ),
  // 8 · lightning bolt
  () => <path d="M7 -22L-11 2L-3 2L-7 22L13 -4L5 -4Z" />,
]

function ArtBranding() {
  return (
    <svg className="pm2-art pm2-art--branding" viewBox={VB} aria-hidden="true">
      {TILE_GLYPHS.map((Glyph, i) => {
        const x = 4 + (i % 3) * (TILE + GAP)
        const y = 5 + Math.floor(i / 3) * (TILE + GAP)
        return (
          <g
            key={i}
            className={`pm2-art-br-tile pm2-art-br-tile--${i}`}
            style={{ '--lit': TILE_COLORS[i] }}
          >
            <rect className="pm2-art-br-tbg" x={x} y={y} width={TILE} height={TILE} rx="28" />
            <g className="pm2-art-br-glyph" transform={`translate(${x + TILE / 2} ${y + TILE / 2})`}>
              <Glyph />
            </g>
          </g>
        )
      })}
    </svg>
  )
}

// —— registry ————————————————————————————————————————————————————

export const CARD_ART = {
  'website-design': ArtWebsite,
  'ai-agents': ArtAgents,
  'digital-marketing': ArtMarketing,
  branding: ArtBranding,
}
