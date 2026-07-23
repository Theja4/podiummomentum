import React, { useEffect, useRef, useState } from 'react'
import './voice-experiences.css'

const VOICES = [
  { id: 'kim', name: 'Kim', gender: 'Female', flag: '🇺🇸', language: 'English (US)', tone: 'Soft', industry: 'Airlines', avatar: 'https://www.cognigy.com/hs-fs/hubfs/Generative%20Voice%20AI%20-%20Video%20Player%20Agent%20Voices/agent-kim-avatar.png?width=280&height=280&name=agent-kim-avatar.png', video: 'https://www.cognigy.com/hubfs/1.%20Airline%20-%20KIm%20720p.mp4' },
  { id: 'dave', name: 'Dave', gender: 'Male', flag: '🇬🇧', language: 'English (UK)', tone: 'Excited', industry: 'Retail', avatar: 'https://www.cognigy.com/hs-fs/hubfs/Generative%20Voice%20AI%20-%20Video%20Player%20Agent%20Voices/agent-dave-avatar.png?width=280&height=280&name=agent-dave-avatar.png', video: 'https://www.cognigy.com/hubfs/2.%20Retail%20-%20Dave%20720p.mp4' },
  { id: 'stephanie', name: 'Stephanie', gender: 'Female', flag: '🇩🇪', language: 'German (DE)', tone: 'Friendly', industry: 'Logistics', avatar: 'https://www.cognigy.com/hs-fs/hubfs/Generative%20Voice%20AI%20-%20Video%20Player%20Agent%20Voices/agent-stephanie-avatar.png?width=280&height=280&name=agent-stephanie-avatar.png', video: 'https://www.cognigy.com/hubfs/5.%20Logistics%20-%20DE%20720p.mp4' },
  { id: 'ana', name: 'Ana', gender: 'Female', flag: '🇪🇸', language: 'Spanish (ES)', tone: 'Helpful', industry: 'Banking', avatar: 'https://www.cognigy.com/hs-fs/hubfs/Generative%20Voice%20AI%20-%20Video%20Player%20Agent%20Voices/agent-ana-avatar.png?width=280&height=280&name=agent-ana-avatar.png', video: 'https://www.cognigy.com/hubfs/3.%20Banking%20-%20Ana%20ES%20720p.mp4' },
  { id: 'dan', name: 'Dan', gender: 'Male', flag: '🇳🇱', language: 'Dutch (NL)', tone: 'Professional', industry: 'Telco', avatar: 'https://www.cognigy.com/hs-fs/hubfs/Generative%20Voice%20AI%20-%20Video%20Player%20Agent%20Voices/agent-dan-avatar.png?width=280&height=280&name=agent-dan-avatar.png', video: 'https://www.cognigy.com/hubfs/6.%20Telco%20-%20NL%20720p.mp4' },
  { id: 'aksel', name: 'Aksel', gender: 'Male', flag: '🇩🇰', language: 'Danish (DK)', tone: 'Calm', industry: 'Healthcare', avatar: 'https://www.cognigy.com/hs-fs/hubfs/Generative%20Voice%20AI%20-%20Video%20Player%20Agent%20Voices/agent-axel-avatar.png?width=280&height=280&name=agent-axel-avatar.png', video: 'https://www.cognigy.com/hubfs/4.%20Healthcare%20-%20DK%20720p.mp4' },
]

const FIRST_POSTER = 'https://www.cognigy.com/hubfs/Generative%20Voice%20AI%20-%20Video%20Player%20Agent%20Voices/agent-first-video-poster-01.png'

function formatTime(value) {
  if (!Number.isFinite(value)) return '00:00'
  const seconds = Math.max(0, Math.floor(value))
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function PlayIcon({ paused = false }) {
  return paused ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 7.5v9M15 7.5v9" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 7.2v9.6l8-4.8-8-4.8Z" fill="currentColor" /></svg>
  )
}

function VolumeIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 10v4h3l4 3V7l-4 3H5Z" fill="currentColor" />
      {muted
        ? <path d="m16 10 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        : <path d="M16 9.2c1.6 1.6 1.6 4 0 5.6m2.4-8c3 3 3 7.4 0 10.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
    </svg>
  )
}

function VoicePill({ voice, active, playing, onSelect }) {
  return (
    <button
      type="button"
      className={`vex-voice-pill ${active ? 'is-active' : ''}`}
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${active && playing ? 'Pause' : 'Play'} ${voice.name}, ${voice.language}, ${voice.industry}`}
    >
      <span className="vex-avatar-shell">
        <img src={voice.avatar} alt="" />
        {active && playing ? <i className="vex-avatar-pulse" aria-hidden="true" /> : null}
      </span>
      <span className="vex-voice-copy">
        <span className="vex-voice-heading">
          <strong>{voice.name}</strong><span aria-hidden="true">{voice.flag}</span><small>{voice.gender}</small>
        </span>
        <span className="vex-tags" aria-hidden="true"><i>{voice.language}</i><i>{voice.tone}</i><i>{voice.industry}</i></span>
      </span>
      <span className="vex-pill-play" aria-hidden="true"><PlayIcon paused={active && playing} /></span>
    </button>
  )
}

export default function VoiceExperiences() {
  const videoRef = useRef(null)
  const playAfterVoiceChangeRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const activeVoice = VOICES[activeIndex]
  const seekPercent = duration ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    const syncTime = () => setCurrentTime(video.currentTime || 0)
    const syncDuration = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0)
    const handleEnded = () => setPlaying(false)
    const handlePlay = () => { setPlaying(true); setBuffering(false) }
    const handlePause = () => setPlaying(false)
    const handleWaiting = () => setBuffering(true)
    const handlePlaying = () => setBuffering(false)
    video.addEventListener('timeupdate', syncTime)
    video.addEventListener('loadedmetadata', syncDuration)
    video.addEventListener('durationchange', syncDuration)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)
    return () => {
      video.removeEventListener('timeupdate', syncTime)
      video.removeEventListener('loadedmetadata', syncDuration)
      video.removeEventListener('durationchange', syncDuration)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
    }
  }, [activeIndex])

  const togglePlayback = async () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      try { await video.play() } catch { setPlaying(false) }
    } else video.pause()
  }

  const selectVoice = async index => {
    const video = videoRef.current
    if (!video) return
    if (index === activeIndex) { await togglePlayback(); return }
    video.pause()
    setPlaying(false)
    setBuffering(true)
    setCurrentTime(0)
    setDuration(0)
    playAfterVoiceChangeRef.current = true
    setActiveIndex(index)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.load()
    if (playAfterVoiceChangeRef.current) {
      playAfterVoiceChangeRef.current = false
      video.play().catch(() => setPlaying(false))
    }
  }, [activeIndex])

  const updateSeek = event => {
    const video = videoRef.current
    if (!video || !duration) return
    const next = Number(event.target.value)
    video.currentTime = next
    setCurrentTime(next)
  }

  const updateVolume = event => {
    const video = videoRef.current
    if (!video) return
    const next = Number(event.target.value)
    video.volume = next
    video.muted = next === 0
    setVolume(next)
    setMuted(next === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    const next = !muted
    video.muted = next
    setMuted(next)
  }

  return (
    <section className="vex-section" id="voice-experiences" aria-labelledby="vex-heading" data-reveal="panel">
      <div className="vex-inner">
        <header className="vex-head">
          <h2 id="vex-heading">Voice Experiences Reimagined</h2>
          <p>A human-like voice conveys warmth, empathy, and understanding that creates a real emotional connection. Listen to the next generation of AI-powered service, designed to sound unmistakably human.</p>
        </header>

        <div className="vex-player-shell" id="voice-player">
          <div className={`vex-video-stage ${buffering ? 'is-buffering' : ''}`}>
            <video ref={videoRef} key={activeVoice.id} preload="metadata" playsInline poster={activeIndex === 0 ? FIRST_POSTER : undefined} aria-label={`${activeVoice.name} ${activeVoice.industry} voice experience`}>
              <source src={activeVoice.video} type="video/mp4" />
            </video>
            <button className="vex-stage-toggle" type="button" onClick={togglePlayback} aria-label={playing ? 'Pause voice experience' : 'Play voice experience'}>
              <span><PlayIcon paused={playing} /></span>
            </button>
            <div className="vex-now-playing" aria-live="polite">
              <img src={activeVoice.avatar} alt="" />
              <span><small>Now playing</small><strong>{activeVoice.name} · {activeVoice.industry}</strong></span>
            </div>
          </div>

          <div className="vex-controls">
            <button type="button" className="vex-main-play" onClick={togglePlayback} aria-label={playing ? 'Pause' : 'Play'}><PlayIcon paused={playing} /></button>
            <span className="vex-time">{formatTime(currentTime)}</span>
            <label className="vex-seek">
              <span className="sr-only">Seek through voice experience</span>
              <input type="range" min="0" max={duration || 0} step="0.05" value={Math.min(currentTime, duration || 0)} onChange={updateSeek} style={{ '--range-progress': `${seekPercent}%` }} />
            </label>
            <span className="vex-time vex-time-total">{formatTime(duration)}</span>
            <div className="vex-volume">
              <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}><VolumeIcon muted={muted} /></button>
              <label><span className="sr-only">Volume</span><input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={updateVolume} style={{ '--range-progress': `${(muted ? 0 : volume) * 100}%` }} /></label>
            </div>
          </div>
        </div>

        <div className="vex-voice-grid" aria-label="Choose an AI voice">
          {VOICES.map((voice, index) => <VoicePill key={voice.id} voice={voice} active={index === activeIndex} playing={playing} onSelect={() => selectVoice(index)} />)}
        </div>
      </div>
    </section>
  )
}
