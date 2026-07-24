// HeroVideo — the hero card's face: the 2025 showreel as a muted inline
// preview, framed by the card itself (same shape, radius, entrance).
// Hovering trades the native cursor for a glass "View" chip that trails the
// pointer (TrailCursor — the bloom opens on the pointer itself); clicking
// opens a glassmorphism lightbox that continues the reel with sound —
// closed via its X button, a backdrop click, or Escape.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import TrailCursor from './TrailCursor.jsx'
import './hero-video.css'

// Two cuts of one reel. The card is a PORTRAIT box (aspect ~0.81), so the
// 16:9 master lost 54% of every frame's width to object-fit: cover — slicing
// type mid-word — and 28% of its running time was near-blank at that crop, so
// the hero's centrepiece regularly rendered as a flat white slab. PREVIEW is a
// purpose-built vertical cut: six segments chosen to survive the portrait
// frame, each with its own crop offset, every flash and blank run removed.
// 18.6s / 2.8MB against the master's 111s / 35MB.
const PREVIEW_SRC = '/assets/showreel-2025-portrait.mp4'
const PREVIEW_POSTER = '/assets/showreel-2025-portrait-poster.jpg'
// The lightbox still plays the full 16:9 master, with sound and nothing cropped.
const FULL_SRC = '/assets/showreel-2025.mp4'

// Where each preview segment was lifted from in the master, so opening and
// closing the lightbox still continues from the frame on screen rather than
// jumping. Keep in sync with the ffmpeg trim list that built the preview.
const SEGMENTS = [
  { out: 0.0, src: 29.9, dur: 2.2 },
  { out: 2.2, src: 8.6, dur: 3.2 },
  { out: 5.4, src: 60.2, dur: 3.2 },
  { out: 8.6, src: 71.8, dur: 2.8 },
  { out: 11.4, src: 84.8, dur: 3.6 },
  { out: 15.0, src: 99.8, dur: 3.6 },
]

// preview timeline → master timeline
function previewToFull(t) {
  if (!Number.isFinite(t)) return 0
  for (const s of SEGMENTS) {
    if (t >= s.out && t < s.out + s.dur) return s.src + (t - s.out)
  }
  return SEGMENTS[0].src
}

// master timeline → preview timeline. The master runs 111s and the preview
// only samples 18.6s of it, so a viewer who scrubs the lightbox into footage
// the preview never shows has no exact seat: fall back to the start of the
// segment nearest in the MASTER's timeline. Note SEGMENTS is ordered by `out`,
// not by `src` (the preview opens on footage from 29.9s), so this has to
// search by distance rather than assume the list is sorted by source time.
function fullToPreview(t) {
  if (!Number.isFinite(t)) return 0
  for (const s of SEGMENTS) {
    if (t >= s.src && t < s.src + s.dur) return s.out + (t - s.src)
  }
  let best = SEGMENTS[0]
  let bestGap = Infinity
  for (const s of SEGMENTS) {
    const gap = t < s.src ? s.src - t : t - (s.src + s.dur)
    if (gap < bestGap) {
      bestGap = gap
      best = s
    }
  }
  return best.out
}

export default function HeroVideo() {
  const videoRef = useRef(null)
  const modalVideoRef = useRef(null)
  const moveRef = useRef({ x: 0, y: 0 }) // viewport coords for the cursor chip
  const [hovering, setHovering] = useState(false)
  const [open, setOpen] = useState(false)

  // muted inline autoplay — set as a property; the attribute alone is flaky.
  // The loop pauses while scrolled out of view: a forever-decoding video
  // competes with the galaxy's WebGL work for GPU time all the way down the
  // page (and it is invisible anyway). Playback resumes where it left off.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.muted = true
          v.play().catch(() => {})
        } else {
          v.pause()
        }
      },
      { rootMargin: '160px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const onEnter = e => {
    moveRef.current = { x: e.clientX, y: e.clientY }
    setHovering(true)
  }

  const openModal = () => {
    const v = videoRef.current
    const t = v && Number.isFinite(v.currentTime) ? v.currentTime : 0
    v?.pause()
    setOpen(true)
    // continue from the frame on screen, now uncropped and with sound
    requestAnimationFrame(() => {
      const mv = modalVideoRef.current
      if (!mv) return
      try { mv.currentTime = previewToFull(t) } catch {}
      mv.muted = false
      mv.play().catch(() => {})
    })
  }

  const closeModal = () => {
    const mv = modalVideoRef.current
    const t = mv && Number.isFinite(mv.currentTime) ? mv.currentTime : 0
    mv?.pause()
    setOpen(false)
    // hand the position back to the muted preview so the reel never restarts
    const v = videoRef.current
    if (v) {
      try { v.currentTime = fullToPreview(t) } catch {}
      v.muted = true
      v.play().catch(() => {})
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('pm2-video-modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('pm2-video-modal-open')
    }
  }, [open])

  return (
    <>
      <div
        className={['pm2-hero-video-wrap', hovering ? 'is-cursor-on' : '']
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabIndex={0}
        aria-label="Play the Podium Momentum showreel"
        onMouseEnter={onEnter}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={e => {
          moveRef.current.x = e.clientX
          moveRef.current.y = e.clientY
        }}
        onClick={openModal}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openModal()
          }
        }}
      >
        {/* the mat: the reel is a window into OTHER brands' palettes, so it
            gets a neutral card-stock surround rather than bleeding straight
            into the forest field */}
        <div className="pm2-hero-video-frame">
          <video
            ref={videoRef}
            className="pm2-hero-video"
            src={PREVIEW_SRC}
            poster={PREVIEW_POSTER}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
        {/* caption bar — also the only PERSISTENT play affordance: the "View"
            cursor chip is pointer-only, so on touch nothing previously showed
            that the card opens anything */}
        <span className="pm2-hero-video-cap">
          <span className="pm2-hero-video-cap-label">Showreel 2025</span>
          <span className="pm2-hero-video-cap-play" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M9 7.5v9l7.5-4.5z" />
            </svg>
          </span>
        </span>
      </div>
      <TrailCursor label="View" show={hovering && !open} moveRef={moveRef} />
      {createPortal(
        <>
          {open && (
            <div
              className="pm2-video-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Podium Momentum showreel"
              onClick={e => {
                if (e.target === e.currentTarget) closeModal()
              }}
            >
              <div className="pm2-video-modal-frame">
                <video
                  ref={modalVideoRef}
                  className="pm2-video-modal-vid"
                  src={FULL_SRC}
                  controls
                  playsInline
                  autoPlay
                  preload="auto"
                />
                <button
                  type="button"
                  className="pm2-video-modal-close"
                  onClick={closeModal}
                  aria-label="Close showreel"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>,
        document.body,
      )}
    </>
  )
}
