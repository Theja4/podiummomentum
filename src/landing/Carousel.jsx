// Services depth carousel — a tall section whose sticky stage is scrubbed by
// scroll. A soft mint spotlight sits behind the stage; the 5 service cards
// move laterally and recede in depth while preserving their rectangular
// silhouette, and the centred card takes full focus. All motion runs in one rAF loop writing
// transforms imperatively — no per-frame state. prefers-reduced-motion swaps
// in a flat scroll-snap row.
import { useEffect, useRef, useState } from 'react'
import {
  useProgress,
  useRafLoop,
  useVisible,
  clamp,
  clamp01,
  easeInOutCubic,
  lerp,
  reducedMotion,
} from './motion.js'
import { SERVICE_CARDS, CAROUSEL } from './data.js'
import { heroHandoff } from './handoff.js'
import TrailCursor from './TrailCursor.jsx'
import './carousel.css'

// —— tunables ————————————————————————————————————————————————
const N = SERVICE_CARDS.length
const SMOOTH = 0.1 // heavy lerp on scroll progress — butter motion
const SPACING_X = 300
const SPACING_VW = 0.27
const SPACING_WIDE_X = 480
const SPACING_WIDE_VW = 0.39
const SPACING_VW_MOBILE = 0.67 // phone fan: matches the desktop overlap ratio
const DEPTH_Z = 200 // restrained desktop depth; mobile stays on a flat plane
const MAX_DEPTH_STEPS = 3
const ROT_DEG = 24
const ROT_MAX = 42
const MOBILE_BP = 900
const OPACITY_FULL = 0.35 // |d| fully opaque inside this
const OPACITY_GONE = 1.85 // |d| invisible beyond this — neighbours fade fast …
const ACTIVE_D = 0.5 // |d| below which a card counts as centred/clickable
const SNAP_IDLE_MS = 180 // scroll quiet time before the deck glides to a slot
const SNAP_MIN_OFF = 0.02 // dead zone: already close enough to a slot
const FIRST_CARD_COPY_REVEAL_MS = 131.25
const MOBILE_SWIPE_THRESHOLD = 28
const desktopCardGeometry = (vw, vh, expansion) => {
  const compact = vh <= 820
  const portraitW = Math.min(390, vw * 0.76)
  const portraitH = compact ? Math.min(460, vh * 0.60) : Math.min(500, vh * 0.66)
  const wideW = Math.min(700, vw * 0.60)
  const wideH = compact ? Math.min(500, vh * 0.62) : Math.min(550, vh * 0.63)
  return {
    width: lerp(portraitW, wideW, expansion),
    height: lerp(portraitH, wideH, expansion),
  }
}

const FACE_THEMES = new Set(['ice', 'onyx', 'deep', 'glow', 'brand'])
export const faceTheme = card => (FACE_THEMES.has(card.theme) ? card.theme : 'onyx')

const chevron = dir => (
  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d={dir < 0 ? 'M10 2.5 4.5 8l5.5 5.5' : 'M6 2.5 11.5 8 6 13.5'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const exploreArrow = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 12 12 4M6 4h6v6" />
  </svg>
)

const AGENT_CALLS = [
  {
    industry: 'Healthcare',
    mode: 'Inbound',
    person: 'Priya',
    opener: 'Thank you for calling Northside Clinic. How can I help?',
    reply: 'I need to see a doctor this week.',
    action: 'Thursday at 2 is available. Would you like me to book it?',
    approval: 'Yes, that works.',
    result: 'Appointment booked · Thursday at 2',
  },
  {
    industry: 'Real estate',
    mode: 'Outbound',
    person: 'Maya',
    opener: 'Hi Maya, I’m calling about the Parkview homes you viewed.',
    reply: 'I’m still interested in a two bedroom.',
    action: 'I can arrange a private visit Saturday at 11. Would that suit you?',
    approval: 'Yes, please book it.',
    result: 'Visit booked · Saturday at 11',
  },
  {
    industry: 'Hospitality',
    mode: 'Outbound',
    person: 'Nina',
    opener: 'Hi Nina, I’m following up on your event dining inquiry.',
    reply: 'I need a table for twelve.',
    action: 'Friday at 8 is available. Would you like me to secure it?',
    approval: 'Yes, please.',
    result: 'Event reserved · Friday at 8',
  },
]

function AgentCallScene({ card }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const host = video?.closest('.pm2-carousel-card')
    if (!video || !host || typeof MutationObserver === 'undefined') return undefined

    const syncPlayback = () => {
      if (host.classList.contains('is-live')) {
        video.play().catch(() => {})
      } else {
        video.pause()
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) video.currentTime = 0
      }
    }

    const observer = new MutationObserver(syncPlayback)
    observer.observe(host, { attributes: true, attributeFilter: ['class'] })
    syncPlayback()

    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [])

  return (
    <div className="pm2-agent-scene" aria-hidden="true">
      <div className="pm2-agent-industries">
        {AGENT_CALLS.map((call, i) => (
          <span key={call.industry} className={`pm2-agent-industry pm2-agent-industry--${i}`}>
            {call.industry}
          </span>
        ))}
      </div>

      <div className="pm2-agent-orbit pm2-agent-orbit--outer" />
      <div className="pm2-agent-orbit pm2-agent-orbit--inner" />

      <div className="pm2-agent-video-shell">
        <video
          ref={videoRef}
          src={card.video}
          poster={card.poster}
          muted
          playsInline
          loop
          preload="metadata"
          disablePictureInPicture
        />
        <span className="pm2-agent-video-glass" />
        <span className="pm2-agent-video-pulse pm2-agent-video-pulse--one" />
        <span className="pm2-agent-video-pulse pm2-agent-video-pulse--two" />
        <span className="pm2-agent-live">
          <i />
          Live call
        </span>
        <span className="pm2-agent-wave">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} style={{ '--wave-index': i }} />
          ))}
        </span>
      </div>

      <div className="pm2-agent-cases">
        {AGENT_CALLS.map((call, i) => (
          <div key={call.industry} className={`pm2-agent-case pm2-agent-case--${i}`}>
            <div className="pm2-agent-bubble pm2-agent-bubble--agent pm2-agent-bubble--one">
              <span>Agent · {call.mode}</span>
              <p>{call.opener}</p>
            </div>
            <div className="pm2-agent-bubble pm2-agent-bubble--person pm2-agent-bubble--two">
              <span>{call.person}</span>
              <p>{call.reply}</p>
            </div>
            <div className="pm2-agent-bubble pm2-agent-bubble--agent pm2-agent-bubble--three">
              <span>Agent · {call.mode}</span>
              <p>{call.action}</p>
            </div>
            <div className="pm2-agent-bubble pm2-agent-bubble--person pm2-agent-bubble--four">
              <span>{call.person}</span>
              <p>{call.approval}</p>
            </div>
            <div className="pm2-agent-result">
              <i>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m3.25 8.15 3.05 3.1 6.45-6.5" />
                </svg>
              </i>
              <span>{call.result}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CardHeroVideo({ card }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const host = video?.closest('.pm2-carousel-card')
    if (!video || !host || typeof MutationObserver === 'undefined') return undefined

    const syncPlayback = () => {
      if (host.classList.contains('is-live') && !reducedMotion()) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    }

    const observer = new MutationObserver(syncPlayback)
    observer.observe(host, { attributes: true, attributeFilter: ['class'] })
    syncPlayback()

    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [])

  return (
    <div className="pm2-carousel-card-bg pm2-carousel-card-bg--video" aria-hidden="true">
      <video
        ref={videoRef}
        src={card.heroVideo}
        poster={card.heroPoster}
        muted
        playsInline
        loop
        preload="metadata"
        disablePictureInPicture
      />
    </div>
  )
}

function CardFramedVideo({ card }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const host = video?.closest('.pm2-carousel-card')
    if (!video || !host || typeof MutationObserver === 'undefined') return undefined

    const syncPlayback = () => {
      if (host.classList.contains('is-live') && !reducedMotion()) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    }

    const observer = new MutationObserver(syncPlayback)
    observer.observe(host, { attributes: true, attributeFilter: ['class'] })
    syncPlayback()

    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [])

  return (
    <div className="pm2-branding-visual" aria-hidden="true">
      <div className="pm2-branding-video-frame">
        <video
          ref={videoRef}
          poster={card.framedPoster}
          muted
          playsInline
          loop
          preload="metadata"
          disablePictureInPicture
        >
          {card.mobileVideo && (
            <source media="(max-width: 600px)" src={card.mobileVideo} type="video/mp4" />
          )}
          <source src={card.framedVideo} type="video/mp4" />
        </video>
      </div>
    </div>
  )
}

function CardFramedImage({ card }) {
  return (
    <div className="pm2-branding-visual pm2-website-visual" aria-hidden="true">
      <div className="pm2-branding-video-frame pm2-website-image-frame">
        <picture>
          {card.mobileImage && (
            <source media="(max-width: 900px)" srcSet={card.mobileImage} />
          )}
          <img
            src={card.image}
            alt=""
            loading="eager"
            fetchpriority="high"
            decoding="async"
            draggable="false"
          />
        </picture>
      </div>
    </div>
  )
}

const cardVisualClass = card =>
  `${card.image ? ' pm2-carousel-card--image' : ''}${
    card.video ? ' pm2-carousel-card--agent' : ''
  }${card.heroVideo ? ' pm2-carousel-card--hero-video' : ''}${
    card.framedVideo ? ' pm2-carousel-card--framed-video' : ''
  }${card.slug === 'website-design' ? ' pm2-carousel-card--website' : ''}`

// Card face: original image art carries the metaphor while every
// communication-critical word stays live, legible HTML. Shared verbatim by
// the hero's ghost face so the handoff swap remains pixel-identical.
export function CardFace({ card }) {
  const isFramedWebsite = card.slug === 'website-design'

  return (
    <>
      {card.image && !isFramedWebsite && (
        <div className="pm2-carousel-card-bg" aria-hidden="true">
          <picture>
            {card.mobileImage && (
              <source media="(max-width: 900px)" srcSet={card.mobileImage} />
            )}
            <img
              src={card.image}
              alt=""
              loading={card.slug === 'website-design' ? 'eager' : 'lazy'}
              fetchpriority={card.slug === 'website-design' ? 'high' : 'auto'}
              decoding="async"
              draggable="false"
            />
          </picture>
        </div>
      )}
      {card.heroVideo && <CardHeroVideo card={card} />}
      <span className="pm2-carousel-card-sheen" aria-hidden="true" />

      <div className="pm2-carousel-card-top">
        <div className="pm2-carousel-card-meta">
          <span>{card.number}</span>
        </div>
        <div className="pm2-mask">
          <div className="pm2-mask-in">
            <h3 className="pm2-carousel-card-title">{card.title}</h3>
          </div>
        </div>
      </div>

      <div className="pm2-carousel-card-mid" aria-hidden="true">
        {isFramedWebsite && <CardFramedImage card={card} />}
        {card.video && <AgentCallScene card={card} />}
        {card.framedVideo && <CardFramedVideo card={card} />}
      </div>

      <div className="pm2-carousel-card-bottom">
        <p className="pm2-carousel-card-line">{card.line}</p>
        <span className="pm2-carousel-card-explore">
          Explore
          {exploreArrow}
        </span>
      </div>
    </>
  )
}

export default function Carousel({ navigate }) {
  const sectionRef = useRef(null)
  const cardRefs = useRef([])
  const fRef = useRef(0) // live float index for click/key handlers
  const liveRef = useRef(-1) // centred card index — its scene plays; others hold
  const firstCardCopyRef = useRef(0)
  // Per-frame write dedupe: geometry (width/height) writes dirty layout, so
  // they only run when the measured values actually changed; the cursor
  // hit-test (elementFromPoint forces layout) only re-runs when the pointer
  // or the deck actually moved.
  const geomKeyRef = useRef('')
  const stageVarRef = useRef('')
  const copyVarRef = useRef('')
  const interactiveRef = useRef([])
  const cursorSyncRef = useRef({ x: -1, y: -1, f: -1 })
  const cursorMoveRef = useRef({ x: 0, y: 0 })
  const cursorInsideStageRef = useRef(false)
  const [cursorAction, setCursorAction] = useState(null)
  const [isReduced] = useState(reducedMotion)
  const [vhPerCard, setVhPerCard] = useState(85)

  useEffect(() => {
    const update = () => {
      setVhPerCard(window.innerWidth <= 900 ? 15 : 85)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const isFlat = isReduced
  const isDownRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const isDraggedRef = useRef(false)
  const flatRowRef = useRef(null)
  const stageRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || isFlat) return

    let isDown = false
    let startX = 0
    let startScrollY = 0
    let isDraggingGesture = false

    const onMouseDown = e => {
      if (e.button !== 0) return
      isDown = true
      startX = e.clientX
      startScrollY = window.scrollY
      isDraggingGesture = false
    }

    const onMouseMove = e => {
      if (!isDown) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 5) {
        isDraggingGesture = true
        isDraggedRef.current = true
      }
      if (isDraggingGesture) {
        e.preventDefault()
        // Map horizontal drag to vertical page scroll
        const scrollAmount = -dx * 5.5
        window.scrollTo(0, startScrollY + scrollAmount)
      }
    }

    const onMouseUpOrLeave = () => {
      if (!isDown) return
      isDown = false
      if (isDraggingGesture) {
        setTimeout(() => {
          isDraggedRef.current = false
        }, 50)
      }
    }

    const onWheel = e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        window.scrollBy(0, e.deltaX * 1.5)
      }
    }

    // Mobile touch choreography is discrete: one gesture advances one card,
    // regardless of how far or fast the finger travels. Both vertical page
    // swipes and horizontal carousel swipes use the same one-slot step.
    let touchStartX = 0
    let touchStartY = 0
    let touchStartIndex = 0
    let touchAxis = null
    let activeTouch = false

    const onTouchStart = e => {
      if (e.touches.length !== 1) return
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      const el = sectionRef.current
      const vh = window.innerHeight || 1
      const rangePx = Math.max(1, (el?.offsetHeight || vh) - vh)
      const rawP = el ? clamp01(-el.getBoundingClientRect().top / rangePx) : 0
      touchStartIndex = Math.round(rawP * (N - 1))
      touchAxis = null
      activeTouch = true
    }

    const onTouchMove = e => {
      if (!activeTouch || e.touches.length !== 1) return
      const dx = e.touches[0].clientX - touchStartX
      const dy = e.touches[0].clientY - touchStartY

      if (!touchAxis && Math.max(Math.abs(dx), Math.abs(dy)) > 10) {
        touchAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        isDraggedRef.current = true
      }

      if (touchAxis && e.cancelable) e.preventDefault()
    }

    const onTouchEnd = e => {
      if (!activeTouch) return
      activeTouch = false
      const touch = e.changedTouches?.[0]
      if (!touch || !touchAxis) return

      const dx = touch.clientX - touchStartX
      const dy = touch.clientY - touchStartY
      const distance = touchAxis === 'x' ? dx : dy

      if (Math.abs(distance) >= MOBILE_SWIPE_THRESHOLD) {
        const direction = distance < 0 ? 1 : -1
        const target = touchStartIndex + direction

        if (target >= 0 && target < N) {
          scrollToIndex(target)
        } else if (touchAxis === 'y') {
          // At either end, a vertical gesture must still let the visitor
          // leave the sticky choreography instead of trapping the page.
          window.scrollBy({
            top: direction * (window.innerHeight || 1) * 0.72,
            behavior: 'smooth',
          })
        }
      }

      setTimeout(() => {
        isDraggedRef.current = false
      }, 50)
    }

    stage.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUpOrLeave)
    stage.addEventListener('mouseleave', onMouseUpOrLeave)
    stage.addEventListener('wheel', onWheel, { passive: false })

    stage.addEventListener('touchstart', onTouchStart, { passive: true })
    stage.addEventListener('touchmove', onTouchMove, { passive: false })
    stage.addEventListener('touchend', onTouchEnd, { passive: true })
    stage.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      stage.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUpOrLeave)
      stage.removeEventListener('mouseleave', onMouseUpOrLeave)
      stage.removeEventListener('wheel', onWheel)

      stage.removeEventListener('touchstart', onTouchStart)
      stage.removeEventListener('touchmove', onTouchMove)
      stage.removeEventListener('touchend', onTouchEnd)
      stage.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [isFlat])

  const handleMouseDown = e => {
    const row = flatRowRef.current
    if (!row) return
    isDownRef.current = true
    isDraggedRef.current = false
    setIsDragging(true)
    startXRef.current = e.pageX - row.offsetLeft
    scrollLeftRef.current = row.scrollLeft
    row.style.scrollSnapType = 'none'
    row.style.scrollBehavior = 'auto'
    row.style.cursor = 'grabbing'
  }

  const handleMouseMove = e => {
    const row = flatRowRef.current
    if (!isDownRef.current || !row) return
    e.preventDefault()
    const x = e.pageX - row.offsetLeft
    const walk = (x - startXRef.current) * 1.5
    if (Math.abs(walk) > 5) {
      isDraggedRef.current = true
    }
    row.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUpOrLeave = () => {
    isDownRef.current = false
    setIsDragging(false)
    const row = flatRowRef.current
    if (!row) return
    row.style.scrollSnapType = ''
    row.style.scrollBehavior = ''
    row.style.cursor = ''
  }

  const progress = useProgress(sectionRef, { mode: 'sticky', smooth: SMOOTH })
  const visible = useVisible(sectionRef)

  // —— idle snap: any scroll (user or our own glide) stamps this; once the
  // page has been quiet for SNAP_IDLE_MS and the deck rests between slots,
  // the rAF loop glides it to the nearest card. Stamping on our own smooth
  // scroll keeps the snap from re-arming mid-glide, and user input cancels
  // a browser smooth scroll natively — no flags needed.
  const lastScrollAt = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      lastScrollAt.current = performance.now()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Off-screen, the centred card would otherwise keep its `is-live` class and
  // its video decoding for the whole session. Drop the class while the deck
  // is out of view; the loop re-applies it on the next visible frame, which
  // resumes playback exactly where the MutationObserver left it.
  useEffect(() => {
    if (visible) return
    cardRefs.current[liveRef.current]?.classList.remove('is-live')
    liveRef.current = -1
  }, [visible])

  const linkProps = href => ({
    href,
    onClick: e => {
      e.preventDefault()
      if (isDraggedRef.current) {
        return
      }
      navigate?.(href)
    },
  })

  // Scroll the section so card `idx` sits dead centre (p = idx / (N-1)).
  const scrollToIndex = idx => {
    const el = sectionRef.current
    if (!el || typeof window === 'undefined') return
    const i = clamp(idx, 0, N - 1)
    const top = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0)
    const vh = window.innerHeight || 1
    const rangePx = Math.max(1, el.offsetHeight - vh)
    window.scrollTo({ top: top + (i / (N - 1)) * rangePx, behavior: 'smooth' })
  }
  const step = dir => scrollToIndex(Math.round(fRef.current) + dir)

  const onStageKey = e => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      step(-1)
    }
  }

  const findVisibleSideCardAtPoint = (clientX, clientY) =>
    cardRefs.current.findIndex((card, index) => {
      if (!card || Math.abs(index - fRef.current) < ACTIVE_D) return false
      const style = window.getComputedStyle(card)
      if (style.visibility === 'hidden' || Number(style.opacity) <= 0.08) return false
      const rect = card.getBoundingClientRect()
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      )
    })

  const cursorActionForIndex = index => {
    if (index < 0) return null
    const distance = index - fRef.current
    if (Math.abs(distance) < ACTIVE_D) return 'Explore'
    return distance < 0 ? 'Previous' : 'Next'
  }

  const cardIndexAtPoint = (clientX, clientY, directTarget) => {
    const directCard =
      directTarget instanceof Element
        ? directTarget.closest('.pm2-carousel-card')
        : null
    const directIndex = directCard ? cardRefs.current.indexOf(directCard) : -1
    if (directIndex >= 0) return directIndex
    return findVisibleSideCardAtPoint(clientX, clientY)
  }

  const syncCursorAction = (clientX, clientY, directTarget) => {
    const nextAction = cursorActionForIndex(
      cardIndexAtPoint(clientX, clientY, directTarget),
    )
    setCursorAction(current => (current === nextAction ? current : nextAction))
  }

  const onStageClickCapture = event => {
    if (isDraggedRef.current) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    const clickedCard =
      event.target instanceof Element
        ? event.target.closest('.pm2-carousel-card')
        : null
    const clickedIndex = clickedCard ? cardRefs.current.indexOf(clickedCard) : -1

    // Resolve side-card clicks before the nested anchor can attempt to
    // navigate. The centred card is allowed through to its normal handler.
    if (clickedIndex >= 0 && Math.abs(clickedIndex - fRef.current) >= ACTIVE_D) {
      event.preventDefault()
      event.stopPropagation()
      scrollToIndex(clickedIndex)
      return
    }
    if (clickedIndex >= 0) return

    // Perspective-transformed side cards can paint beyond the browser's
    // pointer hit plane. If the stage receives a click inside one of those
    // visible card bounds, treat it exactly like a background-card click.
    const targetIndex = findVisibleSideCardAtPoint(event.clientX, event.clientY)
    if (targetIndex >= 0) {
      event.preventDefault()
      event.stopPropagation()
      scrollToIndex(targetIndex)
    }
  }

  const onStagePointerMove = event => {
    cursorInsideStageRef.current = true
    cursorMoveRef.current.x = event.clientX
    cursorMoveRef.current.y = event.clientY
    syncCursorAction(event.clientX, event.clientY, event.target)
  }

  const clearCursorAction = () => {
    cursorInsideStageRef.current = false
    setCursorAction(null)
  }

  const onCardClick = (event, card, i) => {
    event.preventDefault()
    if (isDraggedRef.current) return
    if (Math.abs(i - fRef.current) < ACTIVE_D) navigate?.(card.href)
    else scrollToIndex(i)
  }

  const onCardMove = event => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1)
    const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1)
    event.currentTarget.style.setProperty('--card-shine-x', `${(x * 100).toFixed(1)}%`)
    event.currentTarget.style.setProperty('--card-shine-y', `${(y * 100).toFixed(1)}%`)
    event.currentTarget.style.setProperty('--card-shift-x', `${((x - 0.5) * -8).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--card-shift-y', `${((y - 0.5) * -8).toFixed(2)}px`)
  }

  const onCardLeave = event => {
    event.currentTarget.style.removeProperty('--card-shift-x')
    event.currentTarget.style.removeProperty('--card-shift-y')
  }

  useRafLoop((dt, now) => {
    if (isReduced || !visible) return
    const vw = window.innerWidth || 1
    const mobile = vw <= MOBILE_BP
    const p = progress.current
    const f = p * (N - 1)
    fRef.current = f
    // The hero handoff is intentionally artwork-only. Once its ghost has
    // disappeared into the first real card, reveal the live title and support
    // copy over a near-immediate beat. Reset immediately when reverse-scroll
    // re-enters the handoff so no clipped type can reappear on the moving card.
    const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
    const handoffIsMoving = heroHandoff.ghostOpacity > 0.01
    const handoffIsSeated = !handoffIsMoving && sectionTop <= (window.innerHeight || 1) * 0.08
    if (handoffIsSeated) {
      firstCardCopyRef.current = clamp01(
        firstCardCopyRef.current + dt / FIRST_CARD_COPY_REVEAL_MS,
      )
    } else {
      firstCardCopyRef.current = 0
    }
    const firstCardCopyReveal = easeInOutCubic(firstCardCopyRef.current)
    // The hero finishes opening card zero before the swap. Keep the deck wide
    // after that point; localOpen also supports direct links into this section.
    const localOpen = mobile ? 0 : easeInOutCubic(clamp01(f / 0.36))
    const expansion = mobile ? 0 : Math.max(heroHandoff.cardExpansion || 0, localOpen)
    const geometry = mobile
      ? null
      : desktopCardGeometry(vw, window.innerHeight || 1, expansion)
    if (geometry) {
      const half = `${(geometry.height / 2).toFixed(1)}px`
      if (stageVarRef.current !== half) {
        stageVarRef.current = half
        sectionRef.current?.style.setProperty('--pm2-stage-card-half', half)
      }
    }
    const geomKey = geometry
      ? `${geometry.width.toFixed(1)}|${geometry.height.toFixed(1)}|${expansion.toFixed(4)}`
      : 'mobile'
    const geomChanged = geomKeyRef.current !== geomKey
    if (geomChanged) geomKeyRef.current = geomKey

    // the centred card's scene builds in; off-centre cards hold their
    // composed final state (base styles) — no replay seams while parked
    const centered = Math.round(f)
    if (centered !== liveRef.current) {
      cardRefs.current[liveRef.current]?.classList.remove('is-live')
      cardRefs.current[centered]?.classList.add('is-live')
      liveRef.current = centered
    }

    const spacing = mobile
      ? vw * SPACING_VW_MOBILE
      : lerp(
          Math.min(SPACING_X, vw * SPACING_VW),
          Math.min(SPACING_WIDE_X, vw * SPACING_WIDE_VW),
          expansion,
        )
    for (let i = 0; i < N; i++) {
      const el = cardRefs.current[i]
      if (!el) continue
      if (geomChanged) {
        if (geometry) {
          el.style.width = `${geometry.width.toFixed(1)}px`
          el.style.height = `${geometry.height.toFixed(1)}px`
          el.style.setProperty('--pm2-card-pad', `${lerp(22, 30, expansion).toFixed(1)}px`)
          el.style.setProperty('--pm2-card-radius', `${lerp(26, 34, expansion).toFixed(1)}px`)
          el.style.setProperty('--pm2-card-title', `${lerp(36, 46, expansion).toFixed(1)}px`)
          el.style.setProperty('--pm2-card-copy', `${lerp(14, 16, expansion).toFixed(1)}px`)
        } else {
          el.style.removeProperty('width')
          el.style.removeProperty('height')
          el.style.removeProperty('--pm2-card-pad')
          el.style.removeProperty('--pm2-card-radius')
          el.style.removeProperty('--pm2-card-title')
          el.style.removeProperty('--pm2-card-copy')
        }
      }
      if (i === 0) {
        const reveal = firstCardCopyReveal.toFixed(4)
        if (copyVarRef.current !== reveal) {
          copyVarRef.current = reveal
          el.style.setProperty('--pm2-card-content-reveal', reveal)
          el.style.setProperty(
            '--pm2-card-content-offset',
            `${((1 - firstCardCopyReveal) * 18).toFixed(2)}px`,
          )
        }
      }
      const rawD = i - f
      // Once a card is effectively centred, land it on the exact 3D origin.
      // Tiny residual rotations force the browser to rasterize SVGs and type
      // on fractional planes, which reads as softness after the scroll stops.
      const d = Math.abs(rawD) < 0.02 ? 0 : rawD
      const ad = Math.abs(d)
      // On phones, 3D rotation rasterizes the entire card (including live
      // type) onto an angled texture. Keep the deck flat and pixel-aligned;
      // position and opacity still communicate which card is next.
      const x = mobile ? Math.round(d * spacing) : d * spacing
      const z = mobile ? 0 : -Math.min(ad, MAX_DEPTH_STEPS) * DEPTH_Z
      const ry = mobile ? 0 : clamp(-d * ROT_DEG, -ROT_MAX, ROT_MAX)
      let op = clamp01((OPACITY_GONE - ad) / (OPACITY_GONE - OPACITY_FULL))
      // the hero's ghost card becomes this card — keep the real one hidden
      // until the ghost has landed in the slot (complementary cross-fade)
      if (i === 0) op = Math.min(op, 1 - clamp01(heroHandoff.ghostOpacity))
      // Keep side-card artwork and SVG text sharp at every point in the
      // coverflow; distance is communicated by depth and opacity.
      el.style.transform = mobile
        ? `translate(-50%, -50%) translateX(${x}px)`
        : `translate(-50%, -50%) translate3d(${x.toFixed(
            1,
          )}px, 0, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`
      el.style.opacity = op.toFixed(3)
      el.style.filter = ''
      el.style.zIndex = String(100 - Math.round(ad * 10))
      const isInteractive = ad < ACTIVE_D
      // Keep every visible side card pointer-clickable. `onCardClick` uses
      // the same active threshold to either open the centred service or
      // bring a background card into the centre slot.
      const isPointerClickable = op > 0.08
      el.style.pointerEvents = isPointerClickable ? 'auto' : 'none'
      el.style.visibility = op <= 0.001 ? 'hidden' : 'visible'
      // Attribute writes churn the DOM even when the value is identical —
      // only touch them when a card actually crosses the interactive line.
      if (interactiveRef.current[i] !== isInteractive) {
        interactiveRef.current[i] = isInteractive
        el.tabIndex = isInteractive ? 0 : -1
        el.setAttribute('aria-hidden', isInteractive ? 'false' : 'true')
      }
    }

    // Cards continue moving beneath a stationary pointer while the page
    // scrolls, so keep the cursor label in sync without requiring a mouse
    // nudge after a new card reaches the centre slot. elementFromPoint
    // forces a hit-test (layout) — only re-run it when the pointer or the
    // deck has actually moved since the last sync.
    if (cursorInsideStageRef.current) {
      const { x, y } = cursorMoveRef.current
      const sync = cursorSyncRef.current
      if (sync.x !== x || sync.y !== y || Math.abs(sync.f - f) > 0.001) {
        sync.x = x
        sync.y = y
        sync.f = f
        syncCursorAction(x, y, document.elementFromPoint(x, y))
      }
    }

    // —— idle snap: glide to the nearest slot once scrolling rests off-slot.
    // Raw scroll position (not the lerped f) decides the target, so the snap
    // aims where the page actually stopped, not where the lag is passing.
    if (now - lastScrollAt.current > SNAP_IDLE_MS) {
      const el = sectionRef.current
      if (el) {
        const vh = window.innerHeight || 1
        const rangePx = Math.max(1, el.offsetHeight - vh)
        const rawP = clamp01(-el.getBoundingClientRect().top / rangePx)
        const rawF = rawP * (N - 1)
        const target = Math.round(rawF)
        if (rawP > 0.001 && rawP < 0.999 && Math.abs(rawF - target) > SNAP_MIN_OFF) {
          lastScrollAt.current = now // re-arm only after the glide + next idle
          scrollToIndex(target)
        }
      }
    }
  })

  // —— reduced motion: plain horizontal scroll-snap row ————————————————
  if (isFlat) {
    return (
      <section className="pm2-carousel pm2-carousel--flat" id="services" ref={sectionRef}>
        <div className="pm2-carousel-flat-head">
          <h2 className="pm2-carousel-title">{CAROUSEL.heading}</h2>
        </div>
        <div
          className="pm2-carousel-flat-row"
          role="list"
          ref={flatRowRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {SERVICE_CARDS.map(card => (
            <a
              key={card.slug}
              role="listitem"
              className={`pm2-carousel-card pm2-carousel-card--${faceTheme(card)}${cardVisualClass(card)}`}
              aria-label={`${card.title}: ${card.line}`}
              {...linkProps(card.href)}
            >
              <CardFace card={card} />
            </a>
          ))}
        </div>
        <div className="pm2-carousel-flat-foot">
          <a
            className="pm2-pill pm2-pill--solid pm2-carousel-cta"
            {...linkProps(CAROUSEL.cta.href)}
          >
            {CAROUSEL.cta.label}
          </a>
        </div>
      </section>
    )
  }

  return (
    <section
      className="pm2-carousel"
      id="services"
      ref={sectionRef}
      style={{ height: `${100 + N * vhPerCard}vh` }}
    >
      <div className="pm2-carousel-sticky">
        <h2 className="pm2-carousel-title pm2-carousel-title--stage">{CAROUSEL.heading}</h2>

        <div
          ref={stageRef}
          className={`pm2-carousel-stage${cursorAction ? ' is-cursor-on' : ''}`}
          tabIndex={0}
          role="group"
          aria-label="Services carousel. Use arrow keys to browse"
          onKeyDown={onStageKey}
          onClickCapture={onStageClickCapture}
          onPointerMove={onStagePointerMove}
          onPointerLeave={clearCursorAction}
        >
          {SERVICE_CARDS.map((card, i) => (
            <a
              key={card.slug}
              ref={el => {
                cardRefs.current[i] = el
              }}
              className={`pm2-carousel-card pm2-carousel-card--${faceTheme(card)}${i === 0 ? ' pm2-carousel-card--handoff' : ''}${cardVisualClass(card)}`}
              href={card.href}
              aria-label={`${card.title}: ${card.line}`}
              tabIndex={i === 0 ? 0 : -1}
              onMouseMove={onCardMove}
              onMouseLeave={onCardLeave}
              onClick={event => onCardClick(event, card, i)}
            >
              <CardFace card={card} />
            </a>
          ))}
        </div>

        <div className="pm2-carousel-foot">
          <a
            className="pm2-pill pm2-pill--solid pm2-carousel-cta"
            {...linkProps(CAROUSEL.cta.href)}
          >
            {CAROUSEL.cta.label}
          </a>
        </div>

        <div className="pm2-carousel-nav">
          <button type="button" aria-label="Previous service" onClick={() => step(-1)}>
            {chevron(-1)}
          </button>
          <button type="button" aria-label="Next service" onClick={() => step(1)}>
            {chevron(1)}
          </button>
        </div>
      </div>
      <TrailCursor
        label={cursorAction || ''}
        show={Boolean(cursorAction)}
        moveRef={cursorMoveRef}
        arrow={
          cursorAction === 'Previous'
            ? 'left'
            : cursorAction === 'Next'
              ? 'right'
              : 'up-right'
        }
      />
    </section>
  )
}
