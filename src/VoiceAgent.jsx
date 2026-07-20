import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useWebchat } from '@blandsdk/client/react'
import './voice-agent.css'

/**
 * VoiceAgent — Bland-powered live voice agent section.
 * White card matching site layout, with orb, mute/end controls,
 * 60s auto-end, and post-call CTA.
 */

// ─── Configuration ─────────────────────────────────────────────────────────────
const BLAND_AGENT_ID = import.meta.env.VITE_BLAND_AGENT_ID || '03fd8c97-c390-4790-a651-13f9a919fa42'
const MAX_CALL_SECONDS = 60

const AGENT = {
  sector: 'Healthcare',
  title: 'Clinic Reception',
  description: 'Booking, rescheduling & clinic FAQs',
}

// ─── Animated Orb ──────────────────────────────────────────────────────────────
function AgentOrb({ active, onClick }) {
  return (
    <button
      className={`va-orb ${active ? 'va-orb--active' : ''}`}
      onClick={onClick}
      type="button"
      aria-label={active ? 'Agent is speaking' : 'Start voice conversation'}
    >
      <div className="va-orb-swirl" />
      <div className="va-orb-swirl va-orb-swirl--2" />
      <div className="va-orb-ring" />
      {!active && (
        <span className="va-orb-play">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      )}
      {active && (
        <div className="va-orb-wave">
          <span /><span /><span /><span /><span />
        </div>
      )}
    </button>
  )
}

// ─── Countdown Timer Display ───────────────────────────────────────────────────
function TimerBadge({ secondsLeft }) {
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  return (
    <span className="va-timer-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  )
}

// ─── Main VoiceAgent Section ───────────────────────────────────────────────────
export default function VoiceAgent({ navigate }) {
  const [conversationState, setConversationState] = useState('idle')
  const [micPermission, setMicPermission] = useState('unknown')
  const [errorMsg, setErrorMsg] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(MAX_CALL_SECONDS)
  const [muted, setMuted] = useState(false)

  const hasStartedRef = useRef(false)
  const timerRef = useRef(null)

  // Bland Webchat SDK hook
  const { state, start, stop, webchat } = useWebchat({
    agentId: BLAND_AGENT_ID,
    getToken: async () => {
      const res = await fetch('/api/agent-authorize', {
        method: 'POST',
        body: JSON.stringify({ agentId: BLAND_AGENT_ID }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to authorize agent session')
      }
      const data = await res.json()
      return data
    },
  })

  // Sync SDK state to UI
  useEffect(() => {
    if (state === 'connected' || state === 'open') {
      setConversationState('active')
    } else if (state === 'connecting') {
      if (hasStartedRef.current) setConversationState('connecting')
    } else if (state === 'closed' || state === 'ended') {
      if (hasStartedRef.current) {
        setConversationState('ended')
        clearTimer()
      }
    } else if (state === 'error') {
      if (hasStartedRef.current) {
        setConversationState('error')
        setErrorMsg('Connection failed. Please try again.')
        clearTimer()
      }
    }
  }, [state])

  // Check microphone permission on mount
  useEffect(() => {
    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'microphone' }).then(result => {
        setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown')
        result.onchange = () => {
          setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown')
        }
      }).catch(() => {})
    }
  }, [])

  useEffect(() => () => clearTimer(), [])

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function startTimer() {
    setSecondsLeft(MAX_CALL_SECONDS)
    clearTimer()
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearTimer()
          stop()
          setConversationState('ended')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const requestMicAndStart = useCallback(async () => {
    setErrorMsg('')
    setSecondsLeft(MAX_CALL_SECONDS)
    setMuted(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicPermission('granted')
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermission('denied')
        setErrorMsg('Microphone access denied. Please allow microphone permission and try again.')
        setConversationState('error')
        return
      }
      setErrorMsg('Could not access microphone. Please check your device settings.')
      setConversationState('error')
      return
    }

    hasStartedRef.current = true
    setConversationState('connecting')
    try {
      await start()
      startTimer()
    } catch (err) {
      setConversationState('error')
      setErrorMsg(err.message || 'Failed to start conversation.')
      hasStartedRef.current = false
    }
  }, [start])

  const endConversation = useCallback(() => {
    clearTimer()
    stop()
    setConversationState('ended')
    setMuted(false)
  }, [stop])

  const toggleMute = useCallback(() => {
    if (!webchat?.micStream) return
    const tracks = webchat.micStream.getAudioTracks()
    const nextMuted = !muted
    tracks.forEach(t => { t.enabled = !nextMuted })
    setMuted(nextMuted)
  }, [webchat, muted])

  const resetConversation = useCallback(() => {
    hasStartedRef.current = false
    setConversationState('idle')
    setErrorMsg('')
    setSecondsLeft(MAX_CALL_SECONDS)
    setMuted(false)
  }, [])

  const isTalking = conversationState === 'active' || conversationState === 'connecting'

  return (
    <section className="va-section" id="live-demo" aria-labelledby="va-heading">
      <div className="va-card">
        <div className="va-head">
          <span className="va-eyebrow">Live Demo</span>
          <h2 id="va-heading">Talk to our AI agent</h2>
          <p className="va-sub">Experience a real AI voice conversation. Hit play and speak naturally — just like calling the clinic.</p>
        </div>

        {/* Agent Card — animates subtly when live */}
        <div className={`va-agent-box ${isTalking ? 'va-agent-box--live' : ''}`}>
          <AgentOrb active={isTalking} onClick={!isTalking && conversationState !== 'ended' ? requestMicAndStart : undefined} />
          <span className="va-card-sector">{AGENT.sector}</span>
          <strong className="va-card-title">{AGENT.title}</strong>
          <span className="va-card-desc">{AGENT.description}</span>

          {conversationState === 'active' && (
            <div className="va-card-live">
              <span className="va-live-dot" />
              <span className="va-card-live-label">Live</span>
              <TimerBadge secondsLeft={secondsLeft} />
            </div>
          )}
          {conversationState === 'connecting' && (
            <div className="va-card-live va-card-live--connecting">
              <span className="va-spinner" />
              <span className="va-card-live-label">Connecting…</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="va-controls">
          {conversationState === 'idle' && (
            <button className="va-start-btn" onClick={requestMicAndStart} type="button">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
              <span>Click to speak with an agent</span>
            </button>
          )}

          {conversationState === 'active' && (
            <div className="va-call-controls">
              <button
                className={`va-ctrl-btn ${muted ? 'va-ctrl-btn--muted' : ''}`}
                onClick={toggleMute}
                type="button"
                aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {muted ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23A5.98 5.98 0 0 0 19 11z" />
                    <path d="M15 11.16V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.16l6 6zM4.27 3 3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                )}
                <span>{muted ? 'Unmute' : 'Mute'}</span>
              </button>
              <button className="va-ctrl-btn va-ctrl-btn--end" onClick={endConversation} type="button">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.66-1.85.998.998 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
                </svg>
                <span>End call</span>
              </button>
            </div>
          )}

          {conversationState === 'ended' && (
            <div className="va-ended">
              <p className="va-ended-msg">
                That was a quick demo! Interested in having an AI agent for your business?
              </p>
              <div className="va-ended-actions">
                <a
                  className="pill pill-light"
                  href="/contact-us"
                  onClick={e => { e.preventDefault(); if (navigate) navigate('/contact-us') }}
                >
                  <span className="pill-wipe pill-wipe-dark" aria-hidden="true" />
                  <span className="pill-label">Book a call</span>
                  <span className="pill-icon-shell is-light" aria-hidden="true">
                    <img className="pill-icon pill-handwave" src="/assets/hand-wave.avif" alt="" />
                  </span>
                </a>
                <button className="pill pill-dark" onClick={resetConversation} type="button">
                  <span className="pill-base" aria-hidden="true" />
                  <span className="pill-wipe" aria-hidden="true" />
                  <span className="pill-label">Try demo again</span>
                  <span className="pill-icon-shell is-dark" aria-hidden="true">
                    <img className="pill-icon pill-brand" src="/assets/brand-mark.svg" alt="" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {conversationState === 'error' && (
            <div className="va-error">
              <span>{errorMsg || 'Something went wrong.'}</span>
              <button className="pill pill-dark" onClick={resetConversation} type="button">
                <span className="pill-base" aria-hidden="true" />
                <span className="pill-wipe" aria-hidden="true" />
                <span className="pill-label">Try again</span>
                <span className="pill-icon-shell is-dark" aria-hidden="true">
                  <img className="pill-icon pill-brand" src="/assets/brand-mark.svg" alt="" />
                </span>
              </button>
            </div>
          )}

          {micPermission === 'denied' && conversationState === 'idle' && (
            <p className="va-mic-warning">
              Microphone access is blocked. Enable it in your browser settings to use voice chat.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
