import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import './styles.css'
import './contact-us.css'
import './industry.css'
import './services-pages.css'
import ContactUs from './ContactUs.jsx'
import { DotLabel, ServiceFaq, ServicesHub, ServiceDetail, matchServicesRoute } from './ServicesPages.jsx'
import { serviceCatalog, getServicePath, getServiceBySlug, SERVICES_PATH } from './servicesData.js'
import IndustryPage from './IndustryPage.jsx'
import { industryList, matchIndustryRoute } from './industries.js'
import ClientLogo from './ClientLogo.jsx'
import './landing-hero.css'
import './header-polish.css'
import './button-system.css'
import './solution-section.css'

const A = '/assets/'
const BRAND = 'Podium Momentum'
const CONTACT_PATH = '/contact-us'

function navigate(path) {
  if (!path || path === '#') return
  if (path.startsWith('#')) {
    const el = document.querySelector(path)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    else window.location.hash = path
    return
  }
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

function usePathname() {
  const [path, setPath] = useState(() => window.location.pathname || '/')
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return path
}

const projects = [
  {
    sector: 'Career Tech, US',
    title: 'JobPosted',
    headline: 'JobPosted: job search on autopilot for serious candidates',
    image: `${A}jobposted-thumb.png`,
    company: 'JobPosted',
    location: 'United States',
    tags: ['#Website Design', '#Brand System', '#Content & SEO'],
    stack: 'Webflow, Figma, SEO, Content ops',
    timeline: '4 weeks',
    description: 'JobPosted puts job search on autopilot. It matches live roles, tailors each resume, autofills applications, and queues them for review so candidates skip the busywork and focus on interviews.',
    stats: [['3.3×', 'Conversion increase'], ['65%', 'Organic traffic increase'], ['42', 'Articles created']],
    results: ['3.3× conversion increase', '65% organic traffic increase', '42 articles created in the system'],
  },
  {
    sector: 'Career Tech, US',
    title: 'Rezoomed',
    headline: 'Rezoomed: AI resumes that land interviews, not rejections',
    image: `${A}rezoomed-thumb.png`,
    company: 'Rezoomed',
    location: 'United States',
    tags: ['#Product UX', '#Website Redesign', '#Motion'],
    stack: 'Figma, React, Motion design',
    timeline: '5 weeks',
    description: 'Rezoomed is an AI resume platform that builds ATS ready resumes, tailors them to any job description in seconds, and scores keyword match before you apply so candidates land interviews, not rejections.',
    stats: [['1M+', 'Resumes optimized'], ['5×', 'More callbacks on average'], ['98%', 'ATS readability hit rate']],
    results: ['1M+ resumes optimized', '5× more callbacks on average', '98% ATS readability hit rate'],
  },
  {
    sector: 'Technology, SE',
    title: 'LikeOn',
    headline: 'LikeOn: influencer platform brand that finally matches scale',
    image: `${A}972304820e19d175.avif`,
    company: 'LikeOn',
    location: 'Sweden / Europe',
    tags: ['#Branding', '#Website Design', '#Growth'],
    stack: 'Brand system, Webflow, CRO',
    timeline: '4 weeks',
    description: "LikeOn is a fast-growing European influencer marketing platform with 100,000+ creators, major brand partnerships, and a product growing faster than its brand could keep up with.",
    stats: [['50%+', 'Order value growth'], ['100k+', 'Creators on platform'], ['4:1', 'ROAS delivered in 3 weeks']],
    results: ['50%+ order value growth', '100k+ creators on platform', '4:1 ROAS delivered in 3 weeks'],
  },
]

const heroClientLogos = [
  { brand: 'rezoomed', src: `${A}brand-logos/rezoomed-mark.jpg`, label: 'Rezoomed' },
  { brand: 'jobposted', src: `${A}brand-logos/jobposted-mark.png`, label: 'JobPosted' },
  { src: `${A}brand-logos/fictional/likeon.png`, alt: 'LikeOn' },
  { src: `${A}brand-logos/fictional/nively-os.png`, alt: 'Nively OS' },
  { src: `${A}brand-logos/fictional/orbitnine.png`, alt: 'OrbitNine' },
  { src: `${A}brand-logos/fictional/vetora-ai.png`, alt: 'Vetora AI' },
]

const clientMarqueeLogos = [
  ...heroClientLogos,
  { src: `${A}brand-logos/fictional/northstar-ledger.png`, alt: 'Northstar Ledger' },
  { src: `${A}brand-logos/fictional/revora-ai.png`, alt: 'Revora AI' },
  { src: `${A}brand-logos/fictional/bricklane-capital.png`, alt: 'Bricklane Capital' },
]

const services = serviceCatalog.map(s => s.title)
const faqs = [
  { q: `What does ${BRAND} do?`, a: `${BRAND} is a strategic design partner that helps startups, tech companies, and corporate teams strengthen their brand, website, and digital product experience.` },
  { q: `Can ${BRAND} help startups as well as established companies?`, a: `Yes. ${BRAND} works with both startups and established companies, especially in tech driven sectors.` },
  { q: `Who is ${BRAND} best suited for?`, a: 'Founders, CEOs, CMOs, and product leaders at companies going through fundraising, repositioning, expansion, or acquisition.' },
  { q: `What makes ${BRAND} different from a typical creative agency?`, a: `${BRAND} is built around business outcomes, not just deliverables. Brand, web, and UX are treated as connected systems.` },
  { q: `When is the right time to hire ${BRAND}?`, a: 'When the business has outgrown its current brand, website, or product experience and needs to present itself at the next level.' },
  { q: `What does ${BRAND} actually help companies with?`, a: 'Strategy, branding, websites, UX and UI, and design systems that support trust, fundraising, conversion, and growth.' },
]

const testimonials = [
  [`${BRAND} rebuilt The Virtual Slimming Clinic into a brand that finally matches the clinical operation behind it. They gave us a system, with four strategic pillars and a defined voice that the whole team now uses.`, 'Marcus Hale', 'CEO', `${A}236e08442c17c9f5.avif`],
  [`Our previous website failed to reflect our standard of high end storytelling and technology. After ${BRAND} redesigned the site, it shifted the caliber of partners reaching out.`, 'Oliver Grant', 'Executive Producer', `${A}c0bb9a494de2f7b0.png`],
  ['The new website gets lots of trust, and influencers and brand clients get convinced to work with LikeOn only by looking at the website :))', 'Claire Bennett', 'Associate Founder', `${A}ef42fa7cfd41a7e6.avif`],
  ['We needed users to understand what we do just by looking at our website. As a result, we saw stronger interest and an increase in conversion.', 'Daniel Brooks', 'CEO', `${A}b6bb0636a8e5a963.avif`],
]

const ratingAvatars = ['236e08442c17c9f5.avif', 'c0bb9a494de2f7b0.png', 'ef42fa7cfd41a7e6.avif', 'b6bb0636a8e5a963.avif']

function RatingStars({ value = 4.9, max = 5 }) {
  const star = 'M12 2.4l2.83 5.94 6.52.86-4.78 4.52 1.21 6.45L12 17.02l-5.78 3.15 1.21-6.45-4.78-4.52 6.52-.86L12 2.4Z'
  const stars = n => Array.from({ length: n }, (_, i) => (
    <svg viewBox="0 0 24 24" key={i}><path d={star} /></svg>
  ))
  return (
    <span className="rating-stars" role="img" aria-label={`Rated ${value} out of ${max} stars`}>
      <span className="rating-stars-base" aria-hidden="true">{stars(max)}</span>
      <span className="rating-stars-fill" style={{ width: `${(value / max) * 100}%` }} aria-hidden="true">{stars(max)}</span>
    </span>
  )
}

const compareRows = [
  ['Consultative approach', 'A strategy partner that looks through your buyer’s lens and co-owns the result.', 'They build exactly what’s briefed, even when the story doesn’t hold together.'],
  ['Premium service', 'Senior-led craft and strategy with one owner from kickoff to launch.', 'Packaged “deliverables” with limited senior time.'],
  ['Mid-market & enterprise focus', 'Built for long buying cycles, stakeholder alignment, and high-stakes credibility.', 'Built for mixed client sizes; enterprise nuance gets missed.'],
  ['Result-oriented strategy', 'We design for clarity, trust, and action, with outcomes you can track.', '“Looks great” is the finish line.'],
  ['In-house strategy team', 'Positioning and messaging are set in-house before design begins.', 'Copy and strategy are outsourced or “added later.”'],
  ['B2B industry expertise', 'B2B-first thinking tailored to evaluation-led buying.', 'Generalist exposure where B2B is one of many.'],
]

function Logo({ variant = 'header' }) {
  if (variant === 'mark') return <img className="logo-mark" src={`${A}brand-mark.svg`} alt={BRAND} />
  return <span className={`logo-lockup logo-${variant}`} aria-label={BRAND}>
    <img className="logo-lockup-mark" src={`${A}brand-mark.svg`} alt="" />
    <span className="logo-wordmark"><b>podium</b><em>momentum</em></span>
  </span>
}

function Button({ children, light = false, href = '#' }) {
  const onClick = e => {
    if (href.startsWith('/') || href.startsWith('#')) {
      e.preventDefault()
      navigate(href)
    }
  }
  return (
    <a className={`pill ${light ? 'pill-light' : 'pill-dark'}`} href={href} onClick={onClick}>
      {light
        ? <span className="pill-wipe pill-wipe-dark" aria-hidden="true" />
        : <>
            <span className="pill-base" aria-hidden="true" />
            <span className="pill-wipe" aria-hidden="true" />
          </>}
      <span className="pill-label">{children}</span>
      <span className={`pill-icon-shell ${light ? 'is-light' : 'is-dark'}`} aria-hidden="true">
        <img
          className={`pill-icon ${light ? 'pill-handwave' : 'pill-brand'}`}
          src={light ? `${A}hand-wave.avif` : `${A}brand-mark.svg`}
          alt=""
        />
      </span>
    </a>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  // Same header reveal as the landing page — every route needs page-loaded
  // or logo/nav stay at opacity:0 from the entrance animation CSS.
  useEffect(() => {
    document.documentElement.classList.add('motion-ready')
    const id = requestAnimationFrame(() => document.body.classList.add('page-loaded'))
    return () => cancelAnimationFrame(id)
  }, [])
  useEffect(() => {
    let previous = window.scrollY
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        const current = window.scrollY
        const delta = current - previous
        const hasScrolled = current > 24
        setScrolled(hasScrolled)
        document.body.classList.toggle('page-scrolled', hasScrolled)
        if (delta > 4 && current > 24) setHidden(true)
        if (delta < -4 || current < 24) setHidden(false)
        previous = current
        frame = 0
      })
    }
    // Sync initial scroll state (service/industry pages often open mid-scroll history)
    const hasInitialScroll = window.scrollY > 24
    setScrolled(hasInitialScroll)
    document.body.classList.toggle('page-scrolled', hasInitialScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
      document.body.classList.remove('page-scrolled')
    }
  }, [])
  const [svcOpen, setSvcOpen] = useState(false)
  const [indOpen, setIndOpen] = useState(false)
  const svcRef = useRef(null)
  const indRef = useRef(null)
  const svcLeaveTimer = useRef(null)
  const indLeaveTimer = useRef(null)

  const clearLeaveTimers = () => {
    if (svcLeaveTimer.current) {
      clearTimeout(svcLeaveTimer.current)
      svcLeaveTimer.current = null
    }
    if (indLeaveTimer.current) {
      clearTimeout(indLeaveTimer.current)
      indLeaveTimer.current = null
    }
  }

  const openServices = () => {
    if (window.innerWidth <= 900) return
    clearLeaveTimers()
    setSvcOpen(true)
    setIndOpen(false)
  }
  const closeServices = () => {
    if (window.innerWidth <= 900) return
    clearLeaveTimers()
    // Small delay so the pointer can cross the trigger→panel bridge
    svcLeaveTimer.current = setTimeout(() => setSvcOpen(false), 160)
  }
  const openIndustries = () => {
    if (window.innerWidth <= 900) return
    clearLeaveTimers()
    setIndOpen(true)
    setSvcOpen(false)
  }
  const closeIndustries = () => {
    if (window.innerWidth <= 900) return
    clearLeaveTimers()
    indLeaveTimer.current = setTimeout(() => setIndOpen(false), 160)
  }

  useEffect(() => () => clearLeaveTimers(), [])

  useEffect(() => {
    if (!svcOpen && !indOpen) return undefined
    const onDoc = e => {
      if (svcOpen && !svcRef.current?.contains(e.target)) setSvcOpen(false)
      if (indOpen && !indRef.current?.contains(e.target)) setIndOpen(false)
    }
    const onKey = e => {
      if (e.key === 'Escape') {
        setSvcOpen(false)
        setIndOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [svcOpen, indOpen])

  const goHomeSection = (e, hash) => {
    e.preventDefault()
    setOpen(false)
    setSvcOpen(false)
    setIndOpen(false)
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      navigate('/')
      setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      return
    }
    navigate(hash)
  }

  return <header className={`header ${hidden ? 'header-hidden' : ''} ${scrolled ? 'header-scrolled' : ''}`}>
    <a href="/" className="logo-link" aria-label={BRAND} onClick={e => { e.preventDefault(); navigate('/'); setOpen(false); setSvcOpen(false); setIndOpen(false) }}><Logo /></a>
    <nav id="primary-navigation" className={open ? 'nav open' : 'nav'}>
      <a href="/" onClick={e => { e.preventDefault(); navigate('/'); setOpen(false) }}>Home</a>
      <a href="#about" onClick={e => goHomeSection(e, '#about')}>About</a>
      <a href="#work" onClick={e => goHomeSection(e, '#work')}>Works</a>
      <a href={getServicePath('ai-agents')} onClick={e => { e.preventDefault(); navigate(getServicePath('ai-agents')); setOpen(false); setSvcOpen(false); setIndOpen(false) }}>AI Agents</a>
      <div
        className={`nav-dropdown nav-dropdown--services ${svcOpen ? 'is-open' : ''}`}
        ref={svcRef}
        onMouseEnter={openServices}
        onMouseLeave={closeServices}
      >
        <button
          type="button"
          className="nav-dropdown-trigger"
          aria-expanded={svcOpen}
          aria-haspopup="true"
          onClick={() => { clearLeaveTimers(); setSvcOpen(v => !v); setIndOpen(false) }}
        >
          <span>Services</span>
          <span className="nav-dropdown-chevron" aria-hidden="true" />
        </button>
        <div className="nav-dropdown-panel nav-dropdown-panel--mega" role="menu">
          <div className="nav-dropdown-panel-card">
            <div className="nav-dropdown-head">
              <span className="nav-dropdown-eyebrow">Offerings</span>
              <a
                className="nav-dropdown-all"
                href={SERVICES_PATH}
                role="menuitem"
                onClick={e => { e.preventDefault(); setSvcOpen(false); setOpen(false); navigate(SERVICES_PATH) }}
              >
                View all <i aria-hidden="true">→</i>
              </a>
            </div>
            <div className="nav-dropdown-list">
              {serviceCatalog.map((s, i) => (
                <a
                  key={s.slug}
                  className="nav-dropdown-item"
                  href={getServicePath(s.slug)}
                  role="menuitem"
                  style={{ '--i': i }}
                  onClick={e => { e.preventDefault(); setSvcOpen(false); setOpen(false); navigate(getServicePath(s.slug)) }}
                >
                  <span className="nav-dropdown-item-bg" aria-hidden="true" />
                  <span className="nav-dropdown-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="nav-dropdown-item-copy">
                    <b>{s.title}</b>
                    <small>{s.hubBlurb}</small>
                  </span>
                  <span className="nav-dropdown-arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`nav-dropdown nav-dropdown--industries ${indOpen ? 'is-open' : ''}`}
        ref={indRef}
        onMouseEnter={openIndustries}
        onMouseLeave={closeIndustries}
      >
        <button
          type="button"
          className="nav-dropdown-trigger"
          aria-expanded={indOpen}
          aria-haspopup="true"
          onClick={() => { clearLeaveTimers(); setIndOpen(v => !v); setSvcOpen(false) }}
        >
          <span>Industries</span>
          <span className="nav-dropdown-chevron" aria-hidden="true" />
        </button>
        <div className="nav-dropdown-panel nav-dropdown-panel--grid" role="menu">
          <div className="nav-dropdown-panel-card">
            <div className="nav-dropdown-head">
              <span className="nav-dropdown-eyebrow">Markets we know</span>
            </div>
            <div className="nav-dropdown-grid">
              {industryList.map((item, i) => (
                <a
                  key={item.slug}
                  className="nav-dropdown-chip"
                  href={item.path}
                  role="menuitem"
                  style={{ '--i': i }}
                  onClick={e => { e.preventDefault(); setIndOpen(false); setOpen(false); navigate(item.path) }}
                >
                  <span className="nav-dropdown-item-bg" aria-hidden="true" />
                  <b>{item.label}</b>
                  <span className="nav-dropdown-arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
    <div className="header-actions">
      <button
        className="menu"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-controls="primary-navigation"
        aria-expanded={open}
      >
        {open ? '×' : '≡'}
      </button>
      <Button light href={CONTACT_PATH}>Let’s chat</Button>
      <button
        className="theme-toggle"
        type="button"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark'
          ? <svg className="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3.5" />
              <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.28 5.28l1.42 1.42M17.3 17.3l1.42 1.42M18.72 5.28 17.3 6.7M6.7 17.3l-1.42 1.42" />
            </svg>
          : <svg className="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.2 15.2A8.4 8.4 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z" />
            </svg>}
      </button>
    </div>
  </header>
}

function Hero() {
  return (
    <section id="top" className="hero pm-landing-hero">
      <div className="hero-inner">
        <h1 className="hero-title">
          <span>Build a <em>10X better website.</em> Become unforgettable.</span>
        </h1>
        <div className="hero-band">
          <div className="hero-media">
            <ShowreelPlayer variant="hero" autoplayOnLoad />
          </div>
          <div className="hero-side">
            <p className="hero-lead">
              We create <em>sharper positioning</em> and websites that give ambitious brands the momentum to take the top spot in their category.
            </p>
            <div className="hero-action">
              <Button light href={CONTACT_PATH}>Book a strategy call</Button>
            </div>
            <div className="hero-rating" role="group" aria-label="4.9 out of 5 average client rating">
              <div className="hero-rating-avatars" aria-hidden="true">
                {ratingAvatars.map(img => (
                  <img src={`${A}${img}`} alt="" loading="lazy" key={img} />
                ))}
              </div>
              <div className="hero-rating-meta">
                <div className="hero-rating-line">
                  <RatingStars value={4.9} />
                  <span className="hero-rating-score">4.9<small>/5</small></span>
                </div>
                <span className="hero-rating-label">Average client rating</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-trust">
          <p>Trusted by 40+ ambitious<br />technology companies</p>
          <div className="hero-logos" aria-hidden="true">
            {heroClientLogos.map(logo => logo.brand ? (
              <span className={`hero-brand-lockup hero-brand-lockup--${logo.brand}`} key={logo.src}>
                <span className="hero-brand-mark">
                  <img src={logo.src} alt="" />
                </span>
                <span className="hero-brand-name">{logo.label}</span>
              </span>
            ) : (
              <ClientLogo
                src={logo.src}
                alt={logo.alt}
                forceInvert={logo.forceInvert}
                key={logo.src}
              />
            ))}
          </div>
        </div>
      </div>
      <MetricsMarquee />
    </section>
  )
}

function MetricsMarquee() {
  const items = ['$10M raised by clients', '+30% margin gain post-rebrand', '2.3x conversion lift post-rebrand', 'Operating tier upgrade · post-Podium']
  return <div className="marquee"><div className="marquee-track">{[...items, ...items].map((x, i) => <span key={i}>/ {x}</span>)}</div></div>
}

function ShowreelThumb() {
  return (
    <div className="who-brand-thumb" aria-hidden="true">
      <p className="who-hi">Hi, we are</p>
      <Logo variant="footer" />
    </div>
  )
}

function ShowreelPlayer({ variant = 'about', autoplayOnLoad = false }) {
  const videoRef = useRef(null)
  const expandedVideoRef = useRef(null)
  const closeButtonRef = useRef(null)
  const autoplayFired = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedTime, setExpandedTime] = useState(0)

  const playMuted = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    setMuted(true)
    video.play().then(() => {
      setStarted(true)
      setPlaying(true)
    }).catch(() => {})
  }

  const togglePlay = e => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.muted = muted
      video.play().then(() => {
        setStarted(true)
        setPlaying(true)
      }).catch(() => {
        video.muted = true
        setMuted(true)
        video.play().then(() => {
          setStarted(true)
          setPlaying(true)
        }).catch(() => {})
      })
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  const toggleMute = e => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return
    const next = !video.muted
    video.muted = next
    setMuted(next)
    if (!next) {
      video.play().then(() => {
        setStarted(true)
        setPlaying(true)
      }).catch(() => {})
    }
  }

  const openExpanded = e => {
    e?.stopPropagation()
    const video = videoRef.current
    const time = video && Number.isFinite(video.currentTime) ? video.currentTime : 0
    video?.pause()
    setPlaying(false)
    setExpandedTime(time)
    setIsExpanded(true)
  }

  const closeExpanded = () => {
    expandedVideoRef.current?.pause()
    setIsExpanded(false)
  }

  useEffect(() => {
    if (!isExpanded) return

    const onKeyDown = e => {
      if (e.key === 'Escape') closeExpanded()
    }

    document.body.classList.add('showreel-modal-open')
    document.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.classList.remove('showreel-modal-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isExpanded])

  // Start at the later of two seconds after landing and the point at which the
  // browser reports that it can play the complete video without buffering.
  useEffect(() => {
    if (!autoplayOnLoad || autoplayFired.current) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const pageStart = performance.now()
    let cancelled = false
    let timer = 0
    let readyOnce = false

    const video = videoRef.current
    if (!video) return

    const launch = () => {
      if (cancelled || autoplayFired.current || readyOnce) return
      readyOnce = true
      const elapsed = performance.now() - pageStart
      const wait = elapsed < 2000 ? 2000 - elapsed : 0
      timer = window.setTimeout(() => {
        if (cancelled || autoplayFired.current) return
        autoplayFired.current = true
        playMuted()
      }, wait)
    }

    const onReady = () => launch()
    video.addEventListener('canplaythrough', onReady, { once: true })
    video.preload = 'auto'
    video.load()
    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) launch()

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      video.removeEventListener('canplaythrough', onReady)
    }
  }, [autoplayOnLoad])

  const shellClass = variant === 'hero' ? 'hero-video' : 'who-video'
  const media = (
    <div className={`${shellClass} ${playing ? 'is-playing' : ''} ${started ? 'is-started' : ''}`}>
      {!started && <ShowreelThumb />}
      <video
        ref={videoRef}
        className={variant === 'hero' ? 'hero-vid' : 'who-vid'}
        src={variant === 'hero' ? `${A}showreel.mp4` : `${A}who-we-are-trimmed.mp4`}
        poster={`${A}showreel-brand-bg.png`}
        playsInline
        muted={muted}
        loop={variant !== 'hero'}
        preload={autoplayOnLoad ? 'auto' : 'metadata'}
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true)
          setStarted(true)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setStarted(false)
          const video = videoRef.current
          if (video) video.currentTime = 0
        }}
        onVolumeChange={e => setMuted(e.currentTarget.muted)}
      />
      <div className="who-controls">
        <button
          type="button"
          className="who-play"
          onClick={togglePlay}
          aria-label={playing ? `Pause ${BRAND} showreel` : `Play ${BRAND} showreel`}
        >
          {playing
            ? <span className="who-play-pause" aria-hidden="true" />
            : <img src={`${A}play-showreel.svg`} alt="" />}
        </button>
        {started && (
          <button
            type="button"
            className="who-mute"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute showreel' : 'Mute showreel'}
            aria-pressed={!muted}
          >
            {muted ? (
              <svg className="who-mute-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" />
                <path d="m16 9.5 5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="who-mute-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18.2 5.8a9 9 0 0 1 0 12.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
      </div>
      {variant === 'hero' && (
        <button
          type="button"
          className="hero-expand"
          onClick={openExpanded}
          aria-label={`Maximize ${BRAND} showreel`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path d="M9 4H4v5M15 4h5v5M20 15v5h-5M4 15v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )

  const expandedViewer = isExpanded && typeof document !== 'undefined' && createPortal(
    <div className="showreel-modal" role="presentation" onClick={closeExpanded}>
      <section
        className="showreel-modal-frame"
        role="dialog"
        aria-modal="true"
        aria-label={`${BRAND} showreel player`}
        onClick={e => e.stopPropagation()}
      >
        <div className="showreel-modal-bar">
          <span>Podium Momentum showreel</span>
          <button
            ref={closeButtonRef}
            type="button"
            className="showreel-modal-close"
            onClick={closeExpanded}
            aria-label="Close showreel"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <video
          ref={expandedVideoRef}
          className="showreel-modal-video"
          src={`${A}showreel.mp4`}
          poster={`${A}showreel-brand-bg.png`}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={e => {
            const duration = e.currentTarget.duration
            e.currentTarget.currentTime = Number.isFinite(duration)
              ? Math.min(expandedTime, duration)
              : expandedTime
          }}
        />
      </section>
    </div>,
    document.body
  )

  if (variant === 'hero') return <>{media}{expandedViewer}</>

  return (
    <>
      <div className="who-vid-wrap" data-reveal="scale">
        {media}
        <div className="who-btm">
          <span>Showreel</span>
          <img src={`${A}brand-mark.svg`} alt="" className="who-logo" />
        </div>
      </div>
      {expandedViewer}
    </>
  )
}

function About() {
  return (
    <section id="about" className="panel who-we-are" data-reveal="panel">
      <div className="who-left">
        <div className="eyebrow" data-reveal="up">● &nbsp; Who we are</div>
        <ShowreelPlayer />
      </div>
      <div className="who-right">
        <h2 className="who-headline who-headline-desktop" data-reveal="line">There's a gap between what you've built and how the market sees you. We close it.</h2>
        <h2 className="who-headline who-headline-mobile" data-reveal="line">The market undersells you. We close that gap.</h2>
        <div className="who-copy">
          <p className="who-copy-desktop" data-reveal="line">{BRAND} is a brand and design agency for technology companies at inflection points: raising, acquiring, expanding, or repositioning. When a brand lags behind its ambition, the cost is real: investors hesitate, deals stall, and top talent signs elsewhere.</p>
          <p className="who-copy-mobile" data-reveal="line">{BRAND} works with tech leaders at inflection points, turning internal truth into market perception.</p>
        </div>
        <div data-reveal="up" className="who-cta"><Button href="#work">See the work</Button></div>
      </div>
    </section>
  )
}

function CaseWords({ text }) {
  return text.split(' ').map((word, i) => (
    <span className="pm-case-word" style={{ '--wi': i }} key={`${word}-${i}`}>
      <span>{word}{'\u00A0'}</span>
    </span>
  ))
}

function ProjectCase({ project, index }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-inview')
        io.unobserve(el)
      }
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <article className="pm-case" ref={ref} style={{ '--case-i': index }}>
      <div className="pm-case-media">
        <div className="pm-case-media-link" data-project={project.title}>
          <img src={project.image} alt={`${project.title} project preview`} loading="lazy" />
        </div>
      </div>
      <div className="pm-case-body">
        <div className="pm-case-topline">
          <span className="pm-case-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="pm-case-topline-rule" aria-hidden="true" />
          <span className="pm-case-sector">{project.sector}</span>
        </div>
        <h3 className="pm-case-title"><CaseWords text={project.headline} /></h3>
        <div className="pm-case-tags">
          {project.tags.map(t => <span key={t}>{t.replace(/^#/, '')}</span>)}
        </div>
        <p className="pm-case-desc">{project.description}</p>
        <div className="pm-case-stats">
          {project.stats.map(([value, label], si) => (
            <div className="pm-case-stat" style={{ '--si': si }} key={label}>
              <span className="pm-case-stat-value">{value}</span>
              <span className="pm-case-stat-label">{label}</span>
            </div>
          ))}
        </div>
        <div className="pm-case-foot">
          <p className="pm-case-facts">
            <span>{project.timeline}</span>
          </p>
          <a
            className="pill pill-light pm-case-cta"
            href={CONTACT_PATH}
            onClick={e => { e.preventDefault(); navigate(CONTACT_PATH) }}
          >
            <span className="pill-wipe pill-wipe-dark" aria-hidden="true" />
            <span className="pill-label">Explore project</span>
            <span className="pm-case-cta-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  )
}

function Work() {
  return (
    <section id="work" className="pm-cases">
      <div className="pm-cases-head">
        <span className="pm-cases-kicker" data-reveal="up">
          <span className="pm-cases-kicker-rule" aria-hidden="true" />
          <span className="pm-cases-kicker-index">Index 01</span>
          <span className="pm-cases-kicker-label">Featured cases</span>
        </span>
        <div className="pm-cases-intro">
          <h2 data-reveal="line">Companies that closed the perception gap, and what changed.</h2>
          <p data-reveal="line">Brand systems, websites, and measurable outcomes for scaling tech teams.</p>
        </div>
      </div>
      <div className="pm-cases-stack">
        {projects.map((p, i) => <ProjectCase project={p} index={i} key={p.title} />)}
      </div>
      <div className="pm-cases-foot" data-reveal="up">
        <Button light href={CONTACT_PATH}>Start a project</Button>
      </div>
    </section>
  )
}

function Clients() {
  const logos = clientMarqueeLogos
  return <section className="panel clients" data-reveal="panel"><div className="eyebrow" data-reveal="up">● &nbsp; Who we work with</div><div className="clients-copy"><h2 data-reveal="line">We work with ambitious brands across every industry, teams whose ambition is ahead of how the market sees them.</h2><p data-reveal="up">Startup or established business, if your brand needs sharper positioning, design, or growth, we are ready.</p></div><div className="client-label" data-reveal="up"><span>Our clients</span><i aria-hidden="true" /></div><div className="logo-marquee"><div>{[...logos, ...logos].map((logo, i) => logo.brand ? (
    <span className={`marquee-brand-lockup marquee-brand-lockup--${logo.brand}`} key={`${logo.src}-${i}`}>
      <span className="marquee-brand-mark"><img src={logo.src} alt="" /></span>
      <span className="marquee-brand-name">{logo.label}</span>
    </span>
  ) : (
    <ClientLogo src={logo.src} alt={logo.alt} className="marquee-fictional-logo" key={`${logo.src}-${i}`} />
  ))}</div></div></section>
}

function Services() {
  return (
    <section id="services" className="panel services" data-reveal="panel">
      <div className="services-head">
        <div className="eyebrow" data-reveal="up">● &nbsp; Our services</div>
        <h2 data-reveal="line">Everything your brand needs to grow, in one team.</h2>
      </div>
      <div className="service-list">
        {serviceCatalog.map((s, i) => (
          <a
            className="service-row-motion"
            href={getServicePath(s.slug)}
            onClick={e => { e.preventDefault(); navigate(getServicePath(s.slug)) }}
            key={s.slug}
            data-reveal="service"
            style={{ '--service-index': i }}
          >
            <span className="service-row-number">{String(i + 1).padStart(2, '0')}</span>
            <b className="service-row-title">{s.title}</b>
            <i className="service-row-arrow"><em>→</em><em>→</em></i>
          </a>
        ))}
      </div>
      <a
        className="services-agent-feature"
        href={getServicePath('ai-agents')}
        onClick={e => { e.preventDefault(); navigate(getServicePath('ai-agents')) }}
        data-reveal="up"
      >
        <div className="services-agent-feature-copy">
          <span className="services-agent-feature-kicker">New capability · AI agent deployments</span>
          <h3>Put your next best conversation on autopilot.</h3>
          <p>Inbound calls, outbound follow-ups, and website chat — designed around the way clinics, real-estate teams, and service businesses actually work.</p>
          <span className="services-agent-feature-link">Explore AI agents <i aria-hidden="true">↗</i></span>
        </div>
        <div className="services-agent-orbit" aria-hidden="true">
          <span className="services-agent-orbit-ring ring-one" />
          <span className="services-agent-orbit-ring ring-two" />
          <span className="services-agent-node node-core">AI</span>
          <span className="services-agent-node node-call">voice</span>
          <span className="services-agent-node node-chat">chat</span>
          <span className="services-agent-node node-book">book</span>
          <span className="services-agent-wave" />
        </div>
      </a>
      <div className="services-cta" data-reveal="up">
        <Button href={SERVICES_PATH}>All Services</Button>
      </div>
    </section>
  )
}

function FAQ() {
  return (
    <section id="faq" className="panel home-faq" data-reveal="panel">
      <div className="svc-faq-grid">
        <div className="home-faq-intro">
          <DotLabel>FAQ</DotLabel>
          <h2 data-reveal="line">
            Frequently
            <br />
            Asked Questions
          </h2>
        </div>
        <ServiceFaq faqs={faqs} />
      </div>
    </section>
  )
}

function Testimonials() {
  const track = useRef(null)
  const slide = direction => track.current?.scrollBy({ left: direction * Math.min(460, track.current.clientWidth * .82), behavior: 'smooth' })
  return <section id="testimonials" className="testimonials"><div className="testimonial-head"><div className="eyebrow" data-reveal="up">● &nbsp; Testimonials</div><h2 data-reveal="line">What our clients say about working with us.</h2></div><div className="testimonial-track" ref={track}>{testimonials.map(([quote, name, role, img]) => <article key={name} data-reveal="card"><p>{quote}</p><div className="person"><img src={img} alt={name} /><div><b>{name}</b><span>{role}</span></div></div></article>)}</div><div className="track-control"><span></span><button onClick={() => slide(-1)} aria-label="Previous testimonial">←</button><button onClick={() => slide(1)} aria-label="Next testimonial">→</button></div></section>
}

function Footer() {
  const companyLinks = [
    { label: 'About', path: '/#about' },
    { label: 'Services', path: SERVICES_PATH },
    { label: 'Projects', path: '/#work' },
    { label: 'For startups', path: CONTACT_PATH },
    { label: 'Contacts', path: CONTACT_PATH },
    { label: 'Testimonials', path: '/#testimonials' },
  ]
  const serviceLinks = serviceCatalog.map(s => ({ label: s.title, path: getServicePath(s.slug) }))
  const industryLinks = industryList.map(item => ({ label: item.label, path: item.path }))
  const onFooterLink = (e, path) => {
    e.preventDefault()
    if (path.startsWith('/#')) {
      const hash = path.slice(1)
      if (window.location.pathname !== '/' && window.location.pathname !== '') {
        navigate('/')
        setTimeout(() => {
          const el = document.querySelector(hash)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      } else {
        navigate(hash)
      }
      return
    }
    navigate(path)
  }
  const goHomeTop = e => {
    e.preventDefault()
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <footer data-reveal="footer">
      <div className="footer-col">
        <b>Company:</b>
        {companyLinks.map((item, i) => (
          <a href={item.path} onClick={e => onFooterLink(e, item.path)} style={{ '--footer-i': i }} key={item.label}>{item.label}</a>
        ))}
      </div>
      <div className="footer-col">
        <b>Services:</b>
        {serviceLinks.map((item, i) => (
          <a href={item.path} onClick={e => onFooterLink(e, item.path)} style={{ '--footer-i': i }} key={item.label}>{item.label}</a>
        ))}
      </div>
      <div className="footer-col">
        <b>Industries:</b>
        {industryLinks.map((item, i) => (
          <a href={item.path} onClick={e => onFooterLink(e, item.path)} style={{ '--footer-i': i }} key={item.label}>{item.label}</a>
        ))}
      </div>
      <div className="subscribe">
        <b>Subscribe to our news and updates</b>
        <label className="subscribe-row">
          <input type="email" aria-label="Email address" placeholder="Your email here" />
          <button className="subscribe-action" type="button" aria-label="Subscribe">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </label>
        <small>By signing up, you agree to our Privacy Policy. We respect your data.</small>
      </div>
      <div className="footer-bottom">
        <a href="/" onClick={goHomeTop} aria-label={BRAND}><Logo variant="footer" /></a>
        <span>© 2026 {BRAND}. All rights reserved &nbsp; ● &nbsp; <b>Privacy Policy</b></span>
        <a href="#top" className="to-top" onClick={goHomeTop}>↑</a>
      </div>
    </footer>
  )
}

function TcxArrow() {
  return <svg viewBox="0 0 18 15" fill="none" aria-hidden="true"><path d="M10.9992 0.311518L17.3608 6.67303C17.4596 6.77153 17.538 6.88858 17.5915 7.01745C17.6451 7.14633 17.6726 7.2845 17.6726 7.42405C17.6726 7.56359 17.6451 7.70176 17.5915 7.83064C17.538 7.95951 17.4596 8.07656 17.3608 8.17506L10.9992 14.5366C10.8001 14.7358 10.5299 14.8477 10.2482 14.8477C9.96654 14.8477 9.6964 14.7358 9.49722 14.5366C9.29804 14.3374 9.18614 14.0672 9.18614 13.7856C9.18614 13.5039 9.29804 13.2337 9.49722 13.0346L14.0484 8.48342L1.06025 8.48342C0.779056 8.48342 0.509377 8.37171 0.310541 8.17288C0.111705 7.97404 0 7.70436 0 7.42316C0 7.14197 0.111705 6.87229 0.310541 6.67345C0.509377 6.47462 0.779056 6.36291 1.06025 6.36291L14.0484 6.36291L9.49633 1.81178C9.29715 1.6126 9.18525 1.34245 9.18525 1.06076C9.18525 0.77908 9.29715 0.508933 9.49633 0.309752C9.69551 0.110571 9.96566 -0.00133025 10.2473 -0.00133027C10.529 -0.00133028 10.7992 0.110571 10.9984 0.309752L10.9992 0.311518Z" fill="currentColor" /></svg>
}

function TcxButton({ children, href = CONTACT_PATH, white = false }) {
  const onClick = e => {
    if (href.startsWith('/') || href.startsWith('#')) {
      e.preventDefault()
      navigate(href)
    }
  }
  return (
    <a className={`tcx-btn ${white ? 'tcx-btn-white' : ''}`} href={href} onClick={onClick}>
      <span className="tcx-btn-text">{children}</span>
      <span className="tcx-btn-icon">
        <span className="tcx-btn-arrows" aria-hidden="true">
          <span className="tcx-btn-arrow"><TcxArrow /></span>
          <span className="tcx-btn-arrow tcx-btn-arrow-abs"><TcxArrow /></span>
        </span>
      </span>
    </a>
  )
}

// "Challenge" band: sticky viewport, staged browser-window cards popping in on
// divider lines around a pulsing centerpiece, ported from the reference GSAP flow.
function Challenge() {
  const ref = useRef(null)
  const challengeCards = [
    // [animation order, position class, message]
    [3, 'is-1', 'Doesn’t reflect the company’s true maturity.'],
    [1, 'is-2', 'Website revamp has been long overdue'],
    [4, 'is-3', 'Site has no personality, looks worse than competitors'],
    [2, 'is-4', 'Not converting / weak CTAs'],
  ]
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cards = [...el.querySelectorAll('[data-tcx-card]')]
      .sort((a, b) => Number(a.dataset.tcxCard) - Number(b.dataset.tcxCard))
    const center = el.querySelector('.tcx-error-center')
    const mobileQuery = window.matchMedia('(max-width: 991px)')
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let cleanupMode = () => {}

    const pulseCenter = () => {
      if (!center) return
      center.classList.remove('is-pulse')
      void center.offsetWidth
      center.classList.add('is-pulse')
    }

    const setupMode = () => {
      cleanupMode()
      el.classList.remove('tcx-static', 'tcx-mobile-live')
      cards.forEach(card => card.classList.remove('is-live'))

      if (reduceQuery.matches) {
        el.classList.add('tcx-static')
        cleanupMode = () => {}
        return
      }

      if (mobileQuery.matches) {
        const io = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return
          el.classList.add('tcx-mobile-live')
          window.setTimeout(pulseCenter, 420)
          io.disconnect()
        }, { threshold: .16, rootMargin: '0px 0px -6% 0px' })
        io.observe(el)
        cleanupMode = () => io.disconnect()
        return
      }

      // Use normalized section progress instead of viewport-specific offsets.
      // This keeps the sticky reveal intact across desktop sizes and live resizes.
      const thresholds = [.04, .28, .52, .76]
      let frame = 0
      let visibleCount = 0
      const check = () => {
        frame = 0
        const rect = el.getBoundingClientRect()
        const range = Math.max(1, rect.height - window.innerHeight)
        const progress = Math.max(0, Math.min(1, -rect.top / range))
        let nextVisibleCount = 0
        cards.forEach((card, i) => {
          const isLive = progress >= thresholds[i]
          card.classList.toggle('is-live', isLive)
          if (isLive) nextVisibleCount += 1
        })
        if (nextVisibleCount > visibleCount) pulseCenter()
        visibleCount = nextVisibleCount
      }
      const requestCheck = () => { if (!frame) frame = requestAnimationFrame(check) }
      window.addEventListener('scroll', requestCheck, { passive: true })
      window.addEventListener('resize', requestCheck, { passive: true })
      check()
      cleanupMode = () => {
        window.removeEventListener('scroll', requestCheck)
        window.removeEventListener('resize', requestCheck)
        if (frame) cancelAnimationFrame(frame)
      }
    }

    setupMode()
    mobileQuery.addEventListener('change', setupMode)
    reduceQuery.addEventListener('change', setupMode)
    return () => {
      cleanupMode()
      mobileQuery.removeEventListener('change', setupMode)
      reduceQuery.removeEventListener('change', setupMode)
    }
  }, [])
  return (
    <section id="challenge" className="tcx tcx-error" ref={ref}>
      <div className="tcx-error-sticky">
        <div className="tcx-error-head" data-reveal="up">
          <div className="tcx-tag tcx-tag-red">Challenge</div>
          <h2 className="tcx-error-heading">Your brand scaled.<br />Your website hasn’t caught up.</h2>
        </div>
        <div className="tcx-error-stage">
          <div className="tcx-error-visual">
            <img className="tcx-error-center" src={`${A}challenge-momentum.svg`} alt="A website interface breaking through constraints with an upward momentum arrow" />
          </div>
          <div className="tcx-error-bg" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6].map(col => (
              <span className={`tcx-divider ${col === 3 ? 'is-center' : ''}`} key={col} />
            ))}
          </div>
          <div className="tcx-error-cards" aria-hidden="true">
            {challengeCards.map(card => (
              <div className={`tcx-error-card ${card[1]}`} data-tcx-card={card[0]} style={{ '--tcx-i': card[0] - 1 }} key={card[0]}>
                <span className="tcx-error-dot" />
                <div className="tcx-error-card-visual">
                  <div className="tcx-dialog-bar" aria-hidden="true">
                    <i /><i /><i />
                  </div>
                  <p>{card[2]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const solutionCards = [
  {
    label: 'Clarity',
    title: 'Make your value easy to see',
    copy: 'We turn a fuzzy offer into a clear, confident story that helps the right clients understand why you are the right choice.',
    image: `${A}solution-strategy.svg`,
    accent: '#15985a',
    soft: '#dff8e9',
  },
  {
    label: 'Impact',
    title: 'Be remembered for the right reasons',
    copy: 'We give your brand the presence and consistency to earn trust, stand apart and make every first impression count.',
    image: `${A}solution-identity.svg`,
    accent: '#6657e8',
    soft: '#ebe8ff',
  },
  {
    label: 'More enquiries',
    title: 'Turn more interest into action',
    copy: 'We remove the friction that makes people hesitate, so more of the right visitors get in touch, book or buy.',
    image: `${A}solution-experience.svg`,
    accent: '#ed5d55',
    soft: '#ffebe6',
  },
  {
    label: 'More headspace',
    title: 'Spend less time keeping things running',
    copy: 'We create a dependable setup your team can manage easily, so you can focus on clients and growth instead of fixes.',
    image: `${A}solution-engineering.svg`,
    accent: '#d9782c',
    soft: '#fff0de',
  },
]

function Solution() {
  const sectionRef = useRef(null)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const cards = [...section.querySelectorAll('.solution-card')]
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers = []

    const revealSection = () => {
      section.classList.add('solution-is-visible')
      timers.push(window.setTimeout(() => section.classList.add('solution-reveal-done'), 1400))
    }
    const revealCard = card => {
      card.classList.add('solution-card-visible')
      const index = Number(card.style.getPropertyValue('--solution-i')) || 0
      timers.push(window.setTimeout(() => card.classList.add('solution-card-reveal-done'), 1150 + index * 90))
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealSection()
      cards.forEach(revealCard)
      return () => timers.forEach(window.clearTimeout)
    }

    const sectionObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      revealSection()
      sectionObserver.disconnect()
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' })
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        revealCard(entry.target)
        cardObserver.unobserve(entry.target)
      })
    }, { threshold: .16, rootMargin: '0px 0px -5% 0px' })

    sectionObserver.observe(section)
    cards.forEach(card => cardObserver.observe(card))
    return () => {
      sectionObserver.disconnect()
      cardObserver.disconnect()
      timers.forEach(window.clearTimeout)
    }
  }, [])

  const moveCard = e => {
    if (window.matchMedia('(hover: none)').matches) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    card.style.setProperty('--ry', `${(x - .5) * 7}deg`)
    card.style.setProperty('--rx', `${(.5 - y) * 7}deg`)
    card.style.setProperty('--mx', `${x * 100}%`)
    card.style.setProperty('--my', `${y * 100}%`)
  }
  const resetCard = e => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }
  return (
    <section className="solution-suite" aria-labelledby="solution-heading" ref={sectionRef}>
      <div className="solution-head">
        <div className="solution-kicker">Solutions</div>
        <div className="solution-heading-wrap">
          <h2 id="solution-heading" className="solution-heading">We solve what gets in the way of <em>more business,</em> and give you time back.</h2>
        </div>
        <p className="solution-intro">Clearer positioning. A stronger brand. A smoother path from interest to enquiry. We fix the gaps that cost you clients, slow down decisions and keep your team tied up.</p>
      </div>
      <div className="solution-grid">
        {solutionCards.map((card, index) => (
          <article
            className="solution-card"
            style={{ '--accent': card.accent, '--accent-soft': card.soft, '--solution-i': index }}
            onPointerMove={moveCard}
            onPointerLeave={resetCard}
            key={card.label}
          >
            <div className="solution-visual">
              <img src={card.image} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="solution-card-copy">
              <div className="solution-card-meta"><span>{String(index + 1).padStart(2, '0')} / {card.label}</span></div>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

// "Why us" comparison table: label rail, highlighted brand column with check
// cells, and a muted "traditional agencies" column.
function Compare() {
  return (
    <section className="tcx tcx-cmp">
      <div className="tcx-cmp-head" data-reveal="up">
        <div className="tcx-tag">Why us</div>
        <h2 className="tcx-cmp-heading"><em>Why us</em> (and not the other 500 agencies)?</h2>
      </div>
      <div className="tcx-cmp-scroll" data-reveal="up">
        <div className="tcx-cmp-table">
          <div className="tcx-cmp-label tcx-cmp-row-head" aria-hidden="true" />
          <div className="tcx-cmp-us tcx-cmp-row-head tcx-cmp-brand">
            <span className="logo-wordmark"><b>podium</b><em>momentum</em></span>
          </div>
          <div className="tcx-cmp-them tcx-cmp-row-head tcx-cmp-them-title">Traditional agencies</div>
          {compareRows.map(([label, us, them]) => (
            <React.Fragment key={label}>
              <div className="tcx-cmp-label"><span>{label}</span></div>
              <div className="tcx-cmp-us">
                <span className="tcx-cmp-check" aria-hidden="true">
                  <svg viewBox="0 0 15 11" fill="none"><path d="M5.33285 10.6913C5.15919 10.8597 4.91317 11 4.69609 11C4.47902 11 4.233 10.8527 4.0521 10.6843L0 6.75574L1.28799 5.50702L4.70333 8.81824L13.7337 0L15 1.26977L5.33285 10.6913Z" fill="currentColor" /></svg>
                </span>
                <span className="tcx-cmp-us-text">{us}</span>
              </div>
              <div className="tcx-cmp-them">{them}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="tcx-cmp-cta" data-reveal="up"><Button light href="#work">View more</Button></div>
    </section>
  )
}

// Checkered CTA banner: mosaic of green tiles framing a dark booking card.
function CtaBanner() {
  return (
    <section className="tcx tcx-cta">
      <div className="tcx-cta-content">
        <span className="tcx-cta-glow" aria-hidden="true" />
        <div className="tcx-cta-inner">
          <div className="tcx-cta-left">
            <h2 className="tcx-cta-heading">Let’s turn your website into <em>the most unfair advantage</em> in your domain.</h2>
            <TcxButton href={CONTACT_PATH} white>Book a call</TcxButton>
          </div>
          <div className="tcx-cta-visual">
            <img src={`${A}podium-momentum-cta-v2.png`} alt="Three ascending glass forms representing digital momentum" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  )
}

function HomePage() {
  useEffect(() => {
    document.documentElement.classList.add('motion-ready')
    requestAnimationFrame(() => document.body.classList.add('page-loaded'))

    const nodes = [...document.querySelectorAll('[data-reveal]')]
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview')
        io.unobserve(entry.target)
      }
    }), { threshold: .12, rootMargin: '0px 0px -7% 0px' })
    nodes.forEach((node, i) => {
      node.style.setProperty('--reveal-order', i % 4)
      io.observe(node)
    })

    const parallaxNodes = [...document.querySelectorAll('[data-parallax]')]
    let frame = 0
    const updateParallax = () => {
      frame = 0
      const center = window.innerHeight / 2
      parallaxNodes.forEach(node => {
        const rect = node.getBoundingClientRect()
        const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - center) / window.innerHeight))
        node.style.setProperty('--parallax', '0px')
      })
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateParallax) }
    updateParallax()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
      document.documentElement.classList.remove('motion-ready')
      document.body.classList.remove('page-loaded')
    }
  }, [])
  return <><Header /><Hero /><main><About /><Challenge /><Solution /><Work /><Clients /><Services /><Compare /><FAQ /><Testimonials /><CtaBanner /></main><Footer /></>
}

function App() {
  const path = usePathname()
  const isContact = path === CONTACT_PATH || path === `${CONTACT_PATH}/`
  const servicesMatch = matchServicesRoute(path)
  const industryMatch = matchIndustryRoute(path)

  if (isContact) {
    return <ContactUs onNavigateHome={() => navigate('/')} footer={<Footer />} />
  }
  if (servicesMatch?.type === 'hub') {
    return (
      <>
        <Header />
        <main className="svc-main svc-main-hub">
          <ServicesHub navigate={navigate} />
        </main>
        <Footer />
      </>
    )
  }
  if (servicesMatch?.type === 'detail') {
    // Unknown slug → hub (graceful fallback)
    if (!getServiceBySlug(servicesMatch.slug)) {
      return (
        <>
          <Header />
          <main className="svc-main">
            <ServicesHub navigate={navigate} />
          </main>
          <Footer />
        </>
      )
    }
    return (
      <>
        <Header />
        <main className="svc-main">
          <ServiceDetail slug={servicesMatch.slug} navigate={navigate} />
        </main>
        <Footer />
      </>
    )
  }
  if (industryMatch?.type === 'detail') {
    return (
      <>
        <Header />
        <IndustryPage slug={industryMatch.slug} navigate={navigate} />
        <Footer />
      </>
    )
  }
  return <HomePage />
}

createRoot(document.getElementById('root')).render(<App />)
