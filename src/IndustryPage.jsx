import React, { useEffect, useRef, useState } from 'react'
import { industryList, getIndustry, matchIndustryRoute } from './industries.js'
import { usePageMotion } from './usePageMotion.js'
import './industry.css'

export { matchIndustryRoute }

const CONTACT_PATH = '/contact-us'
const BRAND = 'Podium Momentum'

function Pill({ children, href = '#', onNavigate, dark = false }) {
  return (
    <a
      className={`pill ${dark ? 'pill-dark' : 'pill-light'}`}
      href={href}
      onClick={e => {
        if (href.startsWith('/') || href.startsWith('#')) {
          e.preventDefault()
          onNavigate?.(href)
        }
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

function SplitWords({ text, className = '' }) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  return (
    <span className={`ind-split ${className}`}>
      {words.map((w, i) => (
        <span className="ind-split-word" style={{ '--wi': i }} key={`${w}-${i}`}>
          <span>{w}</span>
        </span>
      ))}
    </span>
  )
}

function DotLabel({ children }) {
  return (
    <div className="ind-dot-label">
      <span className="ind-dot" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export default function IndustryPage({ slug, navigate }) {
  const industry = getIndustry(slug)
  const [expOpen, setExpOpen] = useState(0)
  const [clientIdx, setClientIdx] = useState(0)
  const [heroIn, setHeroIn] = useState(false)
  const clientRef = useRef(null)
  const videoRef = useRef(null)

  usePageMotion([slug], '.ind-main')

  useEffect(() => {
    document.title = industry
      ? `${industry.label} Design Agency | ${BRAND}`
      : `Industry | ${BRAND}`
    requestAnimationFrame(() => setHeroIn(true))
    window.scrollTo(0, 0)
    setExpOpen(0)
    setClientIdx(0)
  }, [industry, slug])

  // Sticky client blurb: advance on scroll through the sticky zone
  useEffect(() => {
    if (!industry?.blurbs?.length) return undefined
    const el = clientRef.current
    if (!el) return undefined
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const view = window.innerHeight
      const total = Math.max(1, el.offsetHeight - view)
      const scrolled = Math.min(total, Math.max(0, -rect.top))
      const progress = scrolled / total
      const idx = Math.min(
        industry.blurbs.length - 1,
        Math.floor(progress * industry.blurbs.length),
      )
      setClientIdx(idx)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [industry, slug])

  // Ensure muted autoplay
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    const p = v.play()
    if (p?.catch) p.catch(() => {})
  }, [slug, industry?.video])

  if (!industry) {
    return (
      <div className="ind-main ind-missing">
        <h1>Industry not found</h1>
        <p>That industry page doesn’t exist.</p>
        <Pill href="/" onNavigate={navigate}>Back home</Pill>
      </div>
    )
  }

  const blurbs = industry.blurbs?.length
    ? industry.blurbs
    : [`We partner with ambitious ${industry.label.toLowerCase()} teams to close the gap between what they are and how the market reads them.`]

  return (
    <div className={`ind-main ${heroIn ? 'is-ready' : ''}`}>
      {/* —— HERO: fullscreen title + video —— */}
      <section className="ind-hero-fs">
        <div className="ind-hero-shell">
          <header className="ind-hero-head">
            <h1 className="ind-h1">
              <SplitWords text={industry.h1} />
            </h1>
            <p className="ind-hero-tag">
              <SplitWords text={industry.tagline} className="ind-split-fade" />
            </p>
            <div className="ind-hero-cta">
              <Pill href={CONTACT_PATH} onNavigate={navigate}>Let’s chat</Pill>
            </div>
          </header>

          <div className="ind-video-wrap" id="video">
            {industry.video ? (
              <video
                ref={videoRef}
                className="ind-video"
                playsInline
                muted
                loop
                autoPlay
                poster={industry.cover}
              >
                <source src={industry.video} type="video/mp4" />
              </video>
            ) : (
              <img className="ind-video-fallback" src={industry.cover} alt="" />
            )}
            <div className="ind-video-shade" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* —— APPROACH: 4 tall cards —— */}
      <section className="ind-section ind-section-white" data-reveal="panel">
        <div className="ind-container">
          <div className="ind-section-head ind-section-head-row">
            <DotLabel>About</DotLabel>
            <h2 className="ind-h2" data-reveal="line">{industry.approachTitle}</h2>
          </div>
          <div className="ind-approach-grid">
            {industry.steps.map((step, i) => (
              <article
                className="ind-approach-card"
                data-reveal="card"
                style={{ '--i': i }}
                key={step.title}
              >
                <div className="ind-approach-top">
                  <span className="ind-approach-num">{step.num || String(i + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                </div>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* —— EXPERTISE: large centered accordion —— */}
      <section className="ind-section ind-section-white ind-expertise-sec" data-reveal="panel">
        <div className="ind-container ind-container-narrow">
          <DotLabel>Expertise</DotLabel>
          <div className="ind-exp-list">
            {industry.expertise.map((item, i) => {
              const open = expOpen === i
              return (
                <button
                  type="button"
                  key={item.title}
                  className={`ind-exp-item ${open ? 'is-open' : ''}`}
                  aria-expanded={open}
                  onClick={() => setExpOpen(open ? -1 : i)}
                  data-reveal="up"
                >
                  <span className="ind-exp-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="ind-exp-body">
                    <span className="ind-exp-title">{item.title}</span>
                    <span className={`ind-exp-desc ${open ? 'is-open' : ''}`}>
                      <span>{item.body}</span>
                    </span>
                  </span>
                  <span className="ind-exp-num is-right" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* —— FEATURED WORK: alternating rows —— */}
      <section className="ind-section ind-section-ice" id="work" data-reveal="panel">
        <div className="ind-container">
          <div className="ind-section-head ind-section-head-row">
            <DotLabel>Featured Works</DotLabel>
            <h2 className="ind-h2" data-reveal="line">
              We create solutions but most importantly we identify problems.
            </h2>
          </div>

          <div className="ind-work-list">
            {industry.projects.map((project, i) => (
              <article
                className={`ind-work-row ${i % 2 === 1 ? 'is-reverse' : ''}`}
                data-reveal="card"
                key={`${project.name}-${i}`}
              >
                <div className="ind-work-copy">
                  <DotLabel>{project.sector || industry.label}</DotLabel>
                  <h3 className="ind-work-title">
                    <span>{project.name}</span>
                    <i className="ind-work-line" aria-hidden="true" />
                  </h3>
                  {project.desc ? <p className="ind-work-desc">{project.desc}</p> : null}
                  <a
                    className="ind-work-link"
                    href={CONTACT_PATH}
                    onClick={e => { e.preventDefault(); navigate?.(CONTACT_PATH) }}
                  >
                    Explore project
                    <img src="/assets/industry-ui/arrow-right-black-round.svg" alt="" />
                  </a>
                </div>
                <div className="ind-work-media">
                  <img src={project.image} alt={project.name} loading="lazy" />
                  <span className="ind-work-shine" aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>

          <div className="ind-work-footer" data-reveal="up">
            <Pill href="/#work" onNavigate={path => navigate?.(path.startsWith('/') ? path : '/')} dark>
              All projects
            </Pill>
          </div>
        </div>
      </section>

      {/* —— OUR CLIENTS: sticky rotating blurbs —— */}
      <section
        className="ind-section ind-section-white ind-clients-sec"
        ref={clientRef}
        style={{ '--blurb-count': blurbs.length }}
        data-reveal="panel"
      >
        <div className="ind-container ind-clients-sticky">
          <DotLabel>Our clients</DotLabel>
          <div className="ind-clients-stage">
            {blurbs.map((b, i) => (
              <p
                key={i}
                className={`ind-client-blurb ${i === clientIdx ? 'is-active' : ''}`}
              >
                {b}
              </p>
            ))}
          </div>
          <div className="ind-clients-progress" aria-hidden="true">
            {blurbs.map((_, i) => (
              <span key={i} className={i === clientIdx ? 'is-active' : ''} />
            ))}
          </div>
        </div>
      </section>

      {/* —— WHO WE ARE —— */}
      <section className="ind-section ind-section-white ind-who" data-reveal="panel">
        <div className="ind-container">
          <DotLabel>Who we are</DotLabel>
          <div className="ind-who-grid">
            {(industry.who || []).map((src, i) => (
              <div className="ind-who-card" data-reveal="scale" key={src + i}>
                <img src={src} alt="" loading="lazy" />
              </div>
            ))}
            <div className="ind-who-stats" data-reveal="card">
              <div><strong>60+</strong><span>Successful projects</span></div>
              <div><strong>5+</strong><span>Years of experience</span></div>
              <div><strong>4.9</strong><span>Average client rating</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* —— MORE INDUSTRIES —— */}
      <section className="ind-section ind-section-ice" data-reveal="panel">
        <div className="ind-container">
          <div className="ind-section-head">
            <DotLabel>Industries</DotLabel>
            <h2 className="ind-h2" data-reveal="line">Explore other industries we serve.</h2>
          </div>
          <div className="ind-more-rail">
            {industryList.filter(x => x.slug !== slug).map(item => (
              <a
                key={item.slug}
                href={item.path}
                className="ind-more-tile"
                onClick={e => { e.preventDefault(); navigate?.(item.path) }}
                data-reveal="card"
              >
                <img src={`/assets/industries/${item.slug}.avif`} alt="" loading="lazy" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* —— CTA —— */}
      <section className="ind-cta-band" data-reveal="panel">
        <div className="ind-container ind-cta-inner">
          <div>
            <DotLabel>Contact us</DotLabel>
            <h2 className="ind-h2">The right partner at the right moment changes everything.</h2>
            <p>Tell us about your next stage in {industry.label.toLowerCase()} — brand, product, or growth.</p>
          </div>
          <Pill href={CONTACT_PATH} onNavigate={navigate}>Start a conversation</Pill>
        </div>
      </section>
    </div>
  )
}

