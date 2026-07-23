import React, { useEffect, useRef } from 'react'
import { hubTestimonials, serviceCatalog } from './servicesData.js'
import { industryList } from './industries.js'
import { usePageMotion } from './usePageMotion.js'

const IMPACT = [
  { value: '3.3×', label: 'conversion increase', client: 'JobPosted' },
  { value: '2.3×', label: 'conversion lift', client: 'After rebrand' },
  { value: '4:1', label: 'ROAS in three weeks', client: 'LikeOn' },
  { value: '50%+', label: 'order value growth', client: 'LikeOn' },
  { value: '30%', label: 'margin gain', client: 'After rebrand' },
]

// Deliberately editable headline metrics for the AI agents story.
const AI_AGENT_METRICS = [
  { value: '3.4×', label: 'more leads reached' },
  { value: '68%', label: 'faster first response' },
  { value: '41%', label: 'more qualified conversations' },
  { value: '24/7', label: 'revenue coverage' },
]

const MEDIA = [
  {
    video: '/assets/industry-videos/technology.mp4',
    poster: '/assets/industries/technology.avif',
    label: 'Technology',
  },
  {
    video: '/assets/industry-videos/healthcare.mp4',
    poster: '/assets/industries/healthcare.avif',
    label: 'Healthcare',
  },
  {
    video: '/assets/industry-videos/fintech.mp4',
    poster: '/assets/industries/fintech.avif',
    label: 'Fintech',
  },
]

function AboutLink({ href, navigate, children, dark = false }) {
  return (
    <a
      className={`pill ${dark ? 'pill-dark' : 'pill-light'}`}
      href={href}
      data-reveal="up"
      onClick={event => {
        event.preventDefault()
        navigate(href)
      }}
    >
      {dark ? (
        <>
          <span className="pill-base" aria-hidden="true" />
          <span className="pill-wipe" aria-hidden="true" />
        </>
      ) : (
        <span className="pill-wipe pill-wipe-dark" aria-hidden="true" />
      )}
      <span className="pill-label">{children}</span>
      <span className={`pill-icon-shell ${dark ? 'is-dark' : 'is-light'}`} aria-hidden="true">
        <img
          className={`pill-icon ${dark ? 'pill-brand' : 'pill-handwave'}`}
          src={dark ? '/assets/brand-mark.svg' : '/assets/hand-wave.avif'}
          alt=""
        />
      </span>
    </a>
  )
}

function MediaCard({ item, className = '' }) {
  return (
    <figure className={`about-media-card ${className}`} data-reveal="card">
      <video
        src={item.video}
        poster={item.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`${item.label} client work montage`}
      />
      <figcaption>{item.label}</figcaption>
    </figure>
  )
}

function Testimonials() {
  const rail = useRef(null)
  const slide = direction => {
    rail.current?.scrollBy({
      left: direction * Math.min(480, rail.current.clientWidth * 0.84),
      behavior: 'smooth',
    })
  }

  return (
    <section id="testimonials" className="about-testimonials" data-reveal="panel">
      <div className="about-section-head">
        <p className="about-kicker">Client perspective</p>
        <h2 data-split="words">What changed on the other side of the work.</h2>
      </div>
      <div className="about-testimonial-rail" ref={rail} data-reveal-group="testimonials">
        {hubTestimonials.map(item => (
          <article key={item.name} data-reveal="card">
            <p>“{item.quote}”</p>
            <div className="about-testimonial-person">
              <img src={item.image} alt="" loading="lazy" />
              <span>
                <b>{item.name}</b>
                <small>{item.role}</small>
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="about-rail-controls" aria-label="Testimonial carousel controls">
        <span aria-hidden="true" />
        <button type="button" onClick={() => slide(-1)} aria-label="Previous testimonial">←</button>
        <button type="button" onClick={() => slide(1)} aria-label="Next testimonial">→</button>
      </div>
    </section>
  )
}

export default function AboutPage({ navigate }) {
  usePageMotion([], '.about-page')

  useEffect(() => {
    document.title = 'About | Podium Momentum'

    const scrollToSection = () => {
      if (!window.location.hash) return
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' })
    }
    const firstFrame = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToSection)
    })
    window.addEventListener('hashchange', scrollToSection)
    return () => {
      cancelAnimationFrame(firstFrame)
      window.removeEventListener('hashchange', scrollToSection)
    }
  }, [])

  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-copy">
          <p className="about-kicker" data-reveal="up">About Podium Momentum · Incorporated 2025</p>
          <h1 id="about-title" data-split="words">Built to move the numbers that matter.</h1>
          <p className="about-hero-lead" data-reveal="up">
            We help ambitious companies turn a clearer story and a stronger digital experience into more customers, healthier margins, and real momentum.
          </p>
          <AboutLink href="/contact-us" navigate={navigate}>
            Start a conversation
          </AboutLink>
        </div>

        <div className="about-hero-media" aria-label="A selection of our industry work">
          <MediaCard item={MEDIA[0]} className="is-wide" />
          <MediaCard item={MEDIA[1]} />
          <MediaCard item={MEDIA[2]} />
        </div>

        <div className="about-facts" data-reveal-group="facts">
          <article data-reveal="card">
            <strong>2025</strong>
            <span>Incorporated</span>
          </article>
          <article data-reveal="card">
            <strong>{serviceCatalog.length}</strong>
            <span>Core offerings</span>
          </article>
          <article data-reveal="card">
            <strong>{industryList.length}</strong>
            <span>Industries served</span>
          </article>
          <article data-reveal="card">
            <strong>40+</strong>
            <span>Brands moved</span>
          </article>
        </div>
      </section>

      <section className="about-ai" data-reveal="panel">
        <div className="about-ai-copy">
          <p className="about-kicker">AI agents</p>
          <h2 data-split="words">The team that never clocks out.</h2>
          <p data-reveal="up">
            Our AI agents answer in seconds, qualify every opportunity, book the next step, and keep following up while your team focuses on closing.
          </p>
          <AboutLink href="/services/ai-agents" navigate={navigate}>
            Meet our AI agents
          </AboutLink>
        </div>
        <div className="about-ai-media" data-reveal="card">
          <video
            src="/assets/service-card-art/ai-agent-call.mp4"
            poster="/assets/service-card-art/ai-agent-call-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="AI agent handling a customer conversation"
          />
          <span>Always on. Always following through.</span>
        </div>
        <div className="about-ai-metrics" data-reveal-group="ai-metrics">
          {AI_AGENT_METRICS.map(metric => (
            <article key={metric.label} data-reveal="card">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="about-impact" data-reveal="panel">
        <div className="about-impact-intro">
          <p className="about-kicker">The work paid back</p>
          <h2 data-split="words">Not a list of technologies. A record of business movement.</h2>
          <p data-reveal="up">These are the outcomes our clients put into market after the work launched.</p>
        </div>
        <div className="about-impact-grid" data-reveal-group="impact">
          {IMPACT.map(item => (
            <article key={`${item.value}-${item.label}`} data-reveal="card">
              <span className="about-impact-client">{item.client}</span>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-founder" data-reveal="panel">
        <div>
          <p className="about-kicker">Founder</p>
          <h2 data-split="words">Theja Ch</h2>
        </div>
        <p data-reveal="up">
          Theja Ch founded Podium Momentum in 2025 with a clear standard: the work should make a business easier to understand, trust, and choose.
        </p>
        <div className="about-founder-mark" aria-hidden="true">
          <img src="/assets/brand-mark.svg" alt="" />
        </div>
      </section>

      <Testimonials />

      <section className="about-close" data-reveal="panel">
        <p className="about-kicker">Your next number</p>
        <h2 data-split="words">Let’s make the next result worth talking about.</h2>
        <AboutLink href="/contact-us" navigate={navigate} dark>
          Book a strategy call
        </AboutLink>
      </section>
    </main>
  )
}
