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

const SRC = '/assets/showreel-2025.mp4'
const POSTER = '/assets/showreel-2025-poster.jpg'
const END_CARD_SECONDS = 4

function isEndCardFrame(video, time = video?.currentTime) {
  if (!video || !Number.isFinite(video.duration) || !Number.isFinite(time)) return false
  const remaining = video.duration - time
  return remaining > 0 && remaining <= END_CARD_SECONDS
}

export default function HeroVideo() {
  const videoRef = useRef(null)
  const modalVideoRef = useRef(null)
  const moveRef = useRef({ x: 0, y: 0 }) // viewport coords for the cursor chip
  const [hovering, setHovering] = useState(false)
  const [showingEndCard, setShowingEndCard] = useState(false)
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
    // continue where the preview left off, now with sound
    requestAnimationFrame(() => {
      const mv = modalVideoRef.current
      if (!mv) return
      try { mv.currentTime = t } catch {}
      mv.muted = false
      mv.play().catch(() => {})
    })
  }

  const closeModal = () => {
    const mv = modalVideoRef.current
    const t = mv && Number.isFinite(mv.currentTime) ? mv.currentTime : 0
    mv?.pause()
    setOpen(false)
    // hand the time back to the muted preview so the reel never restarts
    const v = videoRef.current
    if (v) {
      try { v.currentTime = t } catch {}
      v.muted = true
      setShowingEndCard(isEndCardFrame(v, t))
      v.play().catch(() => {})
    }
  }

  const syncInlineFraming = e => {
    setShowingEndCard(isEndCardFrame(e.currentTarget))
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
        className={[
          'pm2-hero-video-wrap',
          hovering ? 'is-cursor-on' : '',
          showingEndCard ? 'is-end-card' : '',
        ].filter(Boolean).join(' ')}
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
        <video
          ref={videoRef}
          className="pm2-hero-video"
          src={SRC}
          poster={POSTER}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          tabIndex={-1}
          aria-hidden="true"
          onLoadedMetadata={syncInlineFraming}
          onDurationChange={syncInlineFraming}
          onTimeUpdate={syncInlineFraming}
          onSeeked={syncInlineFraming}
        />
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
                  src={SRC}
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
