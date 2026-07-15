import React, { useEffect, useRef, useState } from 'react'
import { industryList, getIndustry, matchIndustryRoute } from './industries.js'
import { usePageMotion } from './usePageMotion.js'
import { aliasProjectName, aliasProjectText } from './projectBrands.js'
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

const getRawClientsDataForSlug = (slug, blurbs) => {
  if (slug === 'healthcare') {
    return [
      { name: 'Get Talky', testimonial: blurbs[0], image: '/assets/industry-projects/healthcare-get-talky-0.avif', bgText: 'Get Talky' },
      { name: 'Frado', testimonial: blurbs[1], image: '/assets/industry-projects/healthcare-frado-1.avif', bgText: 'Frado' },
      { name: 'ReadyRX', testimonial: blurbs[2], image: '/assets/industry-projects/healthcare-readyrx-2.avif', bgText: 'ReadyRX' },
      { name: 'Sofia Therapy', testimonial: blurbs[3], image: '/assets/industry-projects/healthcare-sofia-therapy-3.avif', bgText: 'Sofia' },
      { name: 'Hey.md', testimonial: blurbs[4], image: '/assets/industry-projects/hey-md-7.avif', bgText: 'Hey.md' },
      { name: 'BeU', testimonial: blurbs[5], image: '/assets/industry-projects/healthcare-beedew-4.avif', bgText: 'BeU' },
      { name: 'Foothills', testimonial: blurbs[6], image: '/assets/industry-projects/healthcare-serenity-5.avif', bgText: 'Foothills' },
    ];
  }
  if (slug === 'fintech') {
    return [
      { name: 'Alpha Ledger', testimonial: blurbs[0], image: '/assets/industry-projects/fintech-alpha-ledger-0.avif', bgText: 'Alpha' },
      { name: 'Pie Assets', testimonial: blurbs[1], image: '/assets/industry-projects/fintech-pie-assets-1.avif', bgText: 'Pie Assets' },
      { name: 'Rahmat', testimonial: blurbs[2], image: '/assets/industry-projects/fintech-rahmat-2.avif', bgText: 'Rahmat' },
      { name: 'Reddex', testimonial: blurbs[3], image: '/assets/industry-projects/fintech-reddex-3.avif', bgText: 'Reddex' },
      { name: 'Vanquish', testimonial: blurbs[4], image: '/assets/industry-projects/fintech-vantir-7.avif', bgText: 'Vanquish' },
      { name: 'Planet9', testimonial: blurbs[5], image: '/assets/industry-projects/fintech-planet9-ui-ux-4.avif', bgText: 'Planet9' },
      { name: 'Multibank', testimonial: blurbs[6], image: '/assets/industry-projects/ft-multibank-8.avif', bgText: 'Multibank' },
      { name: 'Multikassa', testimonial: blurbs[8], image: '/assets/industry-projects/ft-multikassa-10.avif', bgText: 'Multikassa' },
      { name: 'UzOman', testimonial: blurbs[9], image: '/assets/industry-projects/corporate-uzoman-3.avif', bgText: 'UzOman' },
    ];
  }
  if (slug === 'web3') {
    return [
      { name: 'Taraxa', testimonial: blurbs[0], image: '/assets/industry-projects/web3-taraxa-0.avif', bgText: 'Taraxa' },
      { name: 'SuperMeme', testimonial: blurbs[1], image: '/assets/industry-projects/web3-supermeme-1.avif', bgText: 'SuperMeme' },
      { name: 'Pie Assets', testimonial: blurbs[2], image: '/assets/industry-projects/web3-pie-assets-2.avif', bgText: 'Pie Assets' },
      { name: 'Liquild', testimonial: blurbs[3], image: '/assets/industry-projects/web3-liquild-3.avif', bgText: 'Liquild' },
      { name: 'Fractalized', testimonial: blurbs[4], image: '/assets/industry-projects/web3-neurofall-4.avif', bgText: 'Fractalized' },
      { name: 'Sophisticated Traders', testimonial: blurbs[5], image: '/assets/industry-projects/web3-sophisticated-traders-7.avif', bgText: 'Traders' },
      { name: 'Freeport Markets', testimonial: blurbs[6], image: '/assets/industry-projects/web3-freeport-markets-5.avif', bgText: 'Freeport' },
    ];
  }
  if (slug === 'technology') {
    return [
      { name: 'Shaka', testimonial: blurbs[0], image: '/assets/industry-projects/technology-shaka-0.avif', bgText: 'Shaka' },
      { name: 'Alpha Ledger', testimonial: blurbs[1], image: '/assets/industry-projects/technology-alpha-ledger-1.avif', bgText: 'Alpha' },
      { name: 'Incipet', testimonial: blurbs[2], image: '/assets/industry-projects/technology-incipet-2.avif', bgText: 'Incipet' },
      { name: 'Modern Vivo', testimonial: blurbs[3], image: '/assets/industry-projects/technology-modern-vivo-3.avif', bgText: 'Vivo' },
      { name: 'Hybrid', testimonial: blurbs[4], image: '/assets/industry-projects/hybrid-6.avif', bgText: 'Hybrid' },
      { name: 'PATtech', testimonial: blurbs[5], image: '/assets/industry-projects/pattech-7.avif', bgText: 'PATtech' },
      { name: 'Sarwisi', testimonial: blurbs[6], image: '/assets/industry-projects/sarwisi-2.avif', bgText: 'Sarwisi' },
      { name: 'Scalemont', testimonial: blurbs[7], image: '/assets/industry-projects/technology-titanx-5.avif', bgText: 'Scalemont' },
      { name: 'QDT', testimonial: blurbs[8], image: '/assets/industry-projects/technology-xim-4.avif', bgText: 'QDT' },
      { name: 'Vyvo', testimonial: blurbs[9], image: '/assets/industry-projects/innrevai-1.avif', bgText: 'Vyvo' },
    ];
  }
  if (slug === 'corporate') {
    return [
      { name: 'Pie Assets', testimonial: blurbs[0], image: '/assets/industry-projects/corporate-pie-assets-0.avif', bgText: 'Pie Assets' },
      { name: 'Alpha Ledger', testimonial: blurbs[1], image: '/assets/industry-projects/corporate-alpha-ledger-1.avif', bgText: 'Alpha' },
      { name: 'HCG', testimonial: blurbs[2], image: '/assets/industry-projects/corporate-hcg-2.avif', bgText: 'HCG' },
      { name: 'UzOman', testimonial: blurbs[3], image: '/assets/industry-projects/corporate-uzoman-3.avif', bgText: 'UzOman' },
      { name: 'Multibank', testimonial: blurbs[4], image: '/assets/industry-projects/multibank-5.avif', bgText: 'Multibank' },
      { name: 'PATtech', testimonial: blurbs[5], image: '/assets/industry-projects/pattech-7.avif', bgText: 'PATtech' },
      { name: 'Builtly', testimonial: blurbs[6], image: '/assets/industry-projects/bultly-7.avif', bgText: 'Builtly' },
      { name: 'Multikassa', testimonial: blurbs[7], image: '/assets/industry-projects/ft-multikassa-10.avif', bgText: 'Multikassa' },
      { name: 'Rahmat', testimonial: blurbs[9], image: '/assets/industry-projects/rahmat-2.avif', bgText: 'Rahmat' },
    ];
  }
  if (slug === 'ai') {
    return [
      { name: 'ContinuOS', testimonial: blurbs[0], image: '/assets/industry-projects/ai-continuos-0.avif', bgText: 'ContinuOS' },
      { name: 'InnRev', testimonial: blurbs[1], image: '/assets/industry-projects/ai-innrevai-1.avif', bgText: 'InnRev' },
      { name: 'Sarwisi', testimonial: blurbs[2], image: '/assets/industry-projects/ai-sarwisi-2.avif', bgText: 'Sarwisi' },
      { name: 'Incipet', testimonial: blurbs[3], image: '/assets/industry-projects/ai-incipet-3.avif', bgText: 'Incipet' },
      { name: 'Jogg', testimonial: blurbs[4], image: '/assets/industry-projects/ai-jogg-ai-5.avif', bgText: 'Jogg' },
      { name: 'Vyvo', testimonial: blurbs[5], image: '/assets/industry-projects/ai-oasira-ui-ux-4.avif', bgText: 'Vyvo' },
      { name: 'Hybrid', testimonial: blurbs[6], image: '/assets/industry-projects/ai-hybrid-mind-7.avif', bgText: 'Hybrid' },
      { name: 'Scalemont', testimonial: blurbs[7], image: '/assets/industry-projects/ai-vertus-ai-6.avif', bgText: 'Scalemont' },
      { name: 'Frado AI', testimonial: blurbs[8], image: '/assets/industry-projects/healthcare-frado-1.avif', bgText: 'Frado' },
      { name: 'Get Talky', testimonial: blurbs[9], image: '/assets/industry-projects/healthcare-get-talky-0.avif', bgText: 'Get Talky' },
    ];
  }
  if (slug === 'real-estate') {
    return [
      { name: 'Pie Assets', testimonial: blurbs[0], image: '/assets/industry-projects/real-estate-pie-assets-0.avif', bgText: 'Pie Assets' },
      { name: 'Dubai Realty', testimonial: blurbs[1], image: '/assets/industry-projects/real-estate-dubai-realty-1.avif', bgText: 'Dubai Realty' },
    ];
  }
  if (slug === 'e-commerce') {
    return [
      { name: 'SAAKINUN', testimonial: blurbs[0], image: '/assets/industry-projects/e-commerce-saakinun-0.avif', bgText: 'SAAKINUN' },
      { name: 'Glowskin', testimonial: blurbs[1], image: '/assets/industry-projects/e-commerce-glowskin-1.avif', bgText: 'Glowskin' },
      { name: 'NS Store', testimonial: blurbs[2], image: '/assets/industry-projects/e-commerce-ns-store-2.avif', bgText: 'NS Store' },
      { name: 'Creatine Gummies', testimonial: blurbs[3], image: '/assets/industry-projects/e-commerce-creatine-gummies-3.avif', bgText: 'Creatine' },
    ];
  }
  if (slug === 'fmcg') {
    return [
      { name: 'HFactor', testimonial: blurbs[0], image: '/assets/industry-projects/fmcg-hfactor-0.avif', bgText: 'HFactor' },
    ];
  }
  if (slug === 'hospitality') {
    return [
      { name: 'InnRev', testimonial: blurbs[0], image: '/assets/industry-projects/hospitality-innrevai-0.avif', bgText: 'InnRev' },
    ];
  }
  return blurbs.map((b, i) => ({
    name: `Client ${i + 1}`,
    testimonial: b,
    image: '',
    bgText: `Client ${i + 1}`
  }));
}

const getClientsDataForSlug = (slug, blurbs) =>
  getRawClientsDataForSlug(slug, blurbs).map(client => ({
    ...client,
    name: aliasProjectName(client.name),
    bgText: aliasProjectName(client.name),
    testimonial: aliasProjectText(client.testimonial),
  }))

export default function IndustryPage({ slug, navigate }) {
  const industry = getIndustry(slug)
  const [expOpen, setExpOpen] = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [heroIn, setHeroIn] = useState(false)
  const videoRef = useRef(null)

  usePageMotion([slug], '.ind-main')

  useEffect(() => {
    document.title = industry
      ? `${industry.label} Design Agency | ${BRAND}`
      : `Industry | ${BRAND}`
    requestAnimationFrame(() => setHeroIn(true))
    window.scrollTo(0, 0)
    setExpOpen(0)
    setHoveredIdx(null)
  }, [industry, slug])

  // Ensure muted autoplay and custom loop (clip last 4 seconds)
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    const p = v.play()
    if (p?.catch) p.catch(() => {})

    const handleTimeUpdate = () => {
      if (v.duration && !isNaN(v.duration) && v.duration > 4) {
        if (v.currentTime >= v.duration - 4) {
          v.currentTime = 0
          const pPlay = v.play()
          if (pPlay?.catch) pPlay.catch(() => {})
        }
      }
    }

    const handleEnded = () => {
      v.currentTime = 0
      const pPlay = v.play()
      if (pPlay?.catch) pPlay.catch(() => {})
    }

    v.addEventListener('timeupdate', handleTimeUpdate)
    v.addEventListener('ended', handleEnded)
    return () => {
      v.removeEventListener('timeupdate', handleTimeUpdate)
      v.removeEventListener('ended', handleEnded)
    }
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

  const clientsData = getClientsDataForSlug(slug, blurbs)

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
                key={industry.video}
                ref={videoRef}
                className="ind-video"
                playsInline
                muted
                autoPlay
                poster={industry.cover}
                onTimeUpdate={e => {
                  const v = e.currentTarget
                  if (v.duration && !isNaN(v.duration) && v.duration > 4) {
                    if (v.currentTime >= v.duration - 4) {
                      v.currentTime = 0
                      const pPlay = v.play()
                      if (pPlay?.catch) pPlay.catch(() => {})
                    }
                  }
                }}
                onEnded={e => {
                  const v = e.currentTarget
                  v.currentTime = 0
                  const pPlay = v.play()
                  if (pPlay?.catch) pPlay.catch(() => {})
                }}
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
                <div key={item.title} data-reveal="up" style={{ width: '100%' }}>
                  <button
                    type="button"
                    className={`ind-exp-item ${open ? 'is-open' : ''}`}
                    aria-expanded={open}
                    onClick={() => setExpOpen(open ? -1 : i)}
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
                </div>
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
                  </h3>
                  {project.desc ? <p className="ind-work-desc">{project.desc}</p> : null}
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

      {/* —— OUR CLIENTS: interactive hover/tap —— */}
      <section className="ind-section ind-section-white ind-clients-sec" data-reveal="panel">
        <div className="ind-container ind-clients-container">
          
          {/* Watermark/Background Text */}
          <div className={`ind-clients-bg-text ${hoveredIdx !== null ? 'is-visible' : ''}`}>
            {hoveredIdx !== null ? clientsData[hoveredIdx].bgText : ''}
          </div>

          <div className="ind-clients-grid">
            {/* Left Column: Testimonial & label */}
            <div className="ind-clients-left">
              <DotLabel>Our clients</DotLabel>
              <div className={`ind-clients-testimonial-wrap ${hoveredIdx !== null ? 'is-visible' : ''}`}>
                {hoveredIdx !== null ? (
                  <p className="ind-clients-testimonial">
                    {clientsData[hoveredIdx].testimonial}
                  </p>
                ) : (
                  <p className="ind-clients-testimonial-placeholder" aria-hidden="true"></p>
                )}
              </div>
            </div>

            {/* Center Column: List of client names */}
            <div className="ind-clients-center">
              <ul className="ind-clients-list">
                {clientsData.map((client, idx) => (
                  <li
                    key={client.name}
                    className={`ind-clients-item ${hoveredIdx === idx ? 'is-active' : ''}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => setHoveredIdx(hoveredIdx === idx ? null : idx)}
                  >
                    {client.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Thumbnail image */}
            <div className="ind-clients-right">
              <div className={`ind-clients-thumbnail-wrap ${hoveredIdx !== null && clientsData[hoveredIdx].image ? 'is-visible' : ''}`}>
                {hoveredIdx !== null && clientsData[hoveredIdx].image ? (
                  <img
                    src={clientsData[hoveredIdx].image}
                    alt={clientsData[hoveredIdx].name}
                    className="ind-clients-thumbnail"
                    loading="lazy"
                  />
                ) : (
                  <div className="ind-clients-thumbnail-placeholder" aria-hidden="true"></div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* —— WHO WE ARE —— */}
      <section className="ind-section ind-section-white ind-who" data-reveal="panel">
        <div className="ind-container">
          <DotLabel>Who we are</DotLabel>
          <div className="ind-who-grid-new">
            <div className="ind-who-new-card" data-reveal="scale">
              <span className="ind-who-new-card-num">01</span>
              <div className="ind-who-new-card-stat">25+</div>
              <div className="ind-who-new-card-body">Successful {industry.label} Projects</div>
            </div>
            <div className="ind-who-new-card" data-reveal="scale">
              <span className="ind-who-new-card-num">02</span>
              <div className="ind-who-new-card-title">Ongoing Support and Maintenance</div>
              <div className="ind-who-new-card-body">We provide continued assistance post-launch to ensure your solutions remain effective and up-to-date.</div>
            </div>
            <div className="ind-who-new-card" data-reveal="scale">
              <span className="ind-who-new-card-num">03</span>
              <div className="ind-who-new-card-stat">5+</div>
              <div className="ind-who-new-card-title">Years of Experience</div>
              <div className="ind-who-new-card-body">Expertise in helping brands and companies.</div>
            </div>
            <div className="ind-who-new-card" data-reveal="scale">
              <span className="ind-who-new-card-num">04</span>
              <div className="ind-who-new-card-title">Flexible Engagement Models</div>
              <div className="ind-who-new-card-body">We offer flexible partnerships, ranging from project-based work to long-term retainers.</div>
            </div>
            <div className="ind-who-new-card" data-reveal="scale">
              <span className="ind-who-new-card-num">05</span>
              <div className="ind-who-new-card-title">Fast Turnaround</div>
              <div className="ind-who-new-card-body">Delivering projects efficiently without compromising quality.</div>
            </div>
            <div className="ind-who-new-card" data-reveal="scale">
              <span className="ind-who-new-card-num">06</span>
              <div className="ind-who-new-card-title">User-Centric Design Philosophy</div>
              <div className="ind-who-new-card-body">We prioritize user experience to enhance {industry.slug === 'healthcare' ? 'patient' : 'user'} engagement and satisfaction.</div>
            </div>
            <div className="ind-who-new-card" data-reveal="scale">
              <span className="ind-who-new-card-num">07</span>
              <div className="ind-who-new-card-title">Regulatory Compliance</div>
              <div className="ind-who-new-card-body">We design with a focus on industry standards, ensuring both innovation and reliability.</div>
            </div>
            <div className="ind-who-new-card" data-reveal="scale">
              <span className="ind-who-new-card-num">08</span>
              <div className="ind-who-new-card-stat">99%</div>
              <div className="ind-who-new-card-title">Client Satisfaction</div>
              <div className="ind-who-new-card-body">Almost all our clients return, showing our partnerships go beyond single projects.</div>
            </div>
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
