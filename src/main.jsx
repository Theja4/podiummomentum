import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const A = '/assets/'
const BRAND = 'Podium Momentum'

const projects = [
  {
    sector: 'Career Tech, US', title: 'JobPosted', image: `${A}jobposted-thumb.png`,
    description: 'JobPosted puts job search on autopilot. It matches live roles, tailors each resume, autofills applications, and queues them for review so candidates skip the busywork and focus on interviews.',
    stats: [['3.3×', 'Conversion increase'], ['65%', 'Organic traffic increase'], ['42', 'Articles created']],
  },
  {
    sector: 'Career Tech, US', title: 'Rezoomed', image: `${A}rezoomed-thumb.png`,
    description: 'Rezoomed is an AI resume platform that builds ATS ready resumes, tailors them to any job description in seconds, and scores keyword match before you apply so candidates land interviews, not rejections.',
    stats: [['1M+', 'Resumes optimized'], ['5×', 'More callbacks on average'], ['98%', 'ATS readability hit rate']],
  },
  {
    sector: 'Technology, SE', title: 'Metapic', image: `${A}972304820e19d175.avif`,
    description: "Metapic is Europe's leading influencer marketing platform with 100,000+ creators, major brand partnerships, and a product growing faster than its brand could keep up with.",
    stats: [['50%+', 'Order value growth'], ['100k+', 'Creators on platform'], ['4:1', 'ROAS delivered in 3 months']],
  },
]

const clientLogos = ['a9cc6fba12268e37','43201ae504d0ad9f','cfecff048b60daa1','baa053d3454375d0','518e03fa4e4f8841','d2c8ca3a50aba890','ab3a9a6cf9778c11','9a6b3e2b11136ee0','c90888271d904160','e72cc835698ff331']

const services = ['Website Design', 'Branding', 'UX and UI', 'Motion Design', 'SEO', 'Content Creation', 'Landing Page', 'Webflow Development']
const faqs = [
  [`What does ${BRAND} do`, `${BRAND} is a strategic design partner that helps startups, tech companies, and corporate teams strengthen their brand, website, and digital product experience.`],
  [`Can ${BRAND} help startups as well as established companies`, `Yes. ${BRAND} works with both startups and established companies, especially in tech driven sectors.`],
  [`Who is ${BRAND} best suited for`, 'Founders, CEOs, CMOs, and product leaders at companies going through fundraising, repositioning, expansion, or acquisition.'],
  [`What makes ${BRAND} different from a typical creative agency`, `${BRAND} is built around business outcomes, not just deliverables. Brand, web, and UX are treated as connected systems.`],
  [`When is the right time to hire ${BRAND}`, 'When the business has outgrown its current brand, website, or product experience and needs to present itself at the next level.'],
  [`What does ${BRAND} actually help companies with`, 'Strategy, branding, websites, UX and UI, and design systems that support trust, fundraising, conversion, and growth.'],
]

const testimonials = [
  [`${BRAND} rebuilt The Virtual Slimming Clinic into a brand that finally matches the clinical operation behind it. They gave us a system, with four strategic pillars and a defined voice that the whole team now uses.`, 'Qadir Hussain', 'CEO', `${A}236e08442c17c9f5.avif`],
  [`Our previous website failed to reflect our standard of high end storytelling and technology. After ${BRAND} redesigned the site, it shifted the caliber of partners reaching out.`, 'Halie Graham', 'Executive Producer', `${A}c0bb9a494de2f7b0.png`],
  ['The new website gets lots of trust, and influencers and brand clients get convinced to work with Metapic only by looking at the website :))', 'Jonathan', 'Associate Founder', `${A}ef42fa7cfd41a7e6.avif`],
  ['We needed users to understand what we do just by looking at our website. As a result, we saw stronger interest and an increase in conversion.', 'Lihong Wang', 'CEO', `${A}b6bb0636a8e5a963.avif`],
]

function Logo({ variant = 'header' }) {
  const src = variant === 'footer' ? `${A}logo-footer.png` : variant === 'mark' ? `${A}logo-mark.png` : `${A}logo-header.png`
  return <img className={`logo logo-${variant}`} src={src} alt={BRAND} />
}

function Button({ children, light = false, href = '#' }) {
  return (
    <a className={`pill ${light ? 'pill-light' : 'pill-dark'}`} href={href}>
      {light
        ? <span className="pill-wipe pill-wipe-dark" aria-hidden="true" />
        : <>
            <span className="pill-base" aria-hidden="true" />
            <span className="pill-wipe" aria-hidden="true" />
          </>}
      <span className="pill-label">{children}</span>
      <img
        className={`pill-icon ${light ? 'pill-handwave' : 'pill-brand'}`}
        src={light ? `${A}hand-wave.avif` : `${A}logo-icon.png`}
        alt=""
      />
    </a>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let previous = window.scrollY
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        const current = window.scrollY
        const delta = current - previous
        setScrolled(current > 24)
        if (delta > 4 && current > 140) setHidden(true)
        if (delta < -4 || current < 80) setHidden(false)
        previous = current
        frame = 0
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
  return <header className={`header ${hidden ? 'header-hidden' : ''} ${scrolled ? 'header-scrolled' : ''}`}>
    <a href="#top" className="logo-link" aria-label={BRAND}><Logo /></a>
    <nav className={open ? 'nav open' : 'nav'}>
      <a href="#top">Home</a><a href="#about">About ↓</a><a href="#work">Works ↓</a>
      <a href="#services">Services ↓</a><a href="#contact">For Startups</a><a href="#faq">Resources ↓</a>
    </nav>
    <div className="header-actions"><button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? '×' : '≡'}</button><Button light href="#contact">Let’s chat</Button></div>
  </header>
}

function Hero() {
  return <section id="top" className="hero">
    <Header />
    <div className="hero-inner">
      <h1 className="hero-title">
        <span>Build a <em>10X better website</em> that</span>
        <span>makes your company unforgettable</span>
      </h1>
      <div className="hero-band">
        <div className="hero-media">
          <ShowreelPlayer variant="hero" />
        </div>
        <div className="hero-side">
          <p>{BRAND} helps scaling tech teams turn an outdated brand and website into <em>a credible growth asset that wins serious buyers</em>. We reposition you to reflect what you’ve become, not what you were when you started.</p>
          <div className="hero-action"><Button light href="#contact">Let’s go</Button></div>
          <div className="hero-rating">
            <span className="hero-rating-badge" aria-hidden="true"><img src={`${A}logo-icon.png`} alt="" /></span>
            <div className="hero-rating-copy">
              <span><b>4.9 Stars</b> &nbsp;Average client rating</span>
              <span className="hero-stars" aria-hidden="true">★★★★★</span>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-trust">
        <p>Trusted by 40+ brands that<br />outpaced their “boring” competitors</p>
        <div className="hero-logos">{clientLogos.slice(0, 6).map(id => <img src={`${A}${id}.avif`} alt="Client" key={id} />)}</div>
      </div>
    </div>
    <MetricsMarquee />
  </section>
}

function MetricsMarquee() {
  const items = ['$1B+ RAISED BY CLIENTS', '+30% MARGIN GAIN POST REBRAND', '2.3X CONVERSION LIFT POST REBRAND', 'OPERATING TIER UPGRADE · POST PODIUM']
  return <div className="marquee"><div className="marquee-track">{[...items, ...items].map((x, i) => <span key={i}>/ {x}</span>)}</div></div>
}

function formatShowreelTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function readVideoDuration(video) {
  const d = video?.duration
  if (!Number.isFinite(d) || d <= 0) return 0
  return d
}

function ShowreelThumb() {
  return (
    <div className="who-brand-thumb">
      <p className="who-hi">Hi we are,</p>
      <img className="who-brand-logo" src={`${A}logo-footer.png`} alt={BRAND} />
    </div>
  )
}

function ShowreelPlayer({ variant = 'about' }) {
  const videoRef = useRef(null)
  const trackRef = useRef(null)
  const savedTime = useRef(0)
  const scrubbing = useRef(false)
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)

  const syncTime = video => {
    if (!video || scrubbing.current) return
    const d = readVideoDuration(video)
    const t = Number.isFinite(video.currentTime) ? video.currentTime : 0
    setCurrent(t)
    setDuration(d)
    setProgress(d ? Math.min(100, (t / d) * 100) : 0)
  }

  const close = () => {
    const video = videoRef.current
    if (video) {
      savedTime.current = video.currentTime || 0
      video.pause()
    }
    setPlaying(false)
    setOpen(false)
  }

  const openPlayer = () => setOpen(true)

  const togglePlay = e => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }

  const seekFromClientX = clientX => {
    const track = trackRef.current
    const video = videoRef.current
    const d = readVideoDuration(video)
    if (!track || !video || !d) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    video.currentTime = ratio * d
    setProgress(ratio * 100)
    setCurrent(video.currentTime)
    setDuration(d)
  }

  const onTrackPointerDown = e => {
    e.preventDefault()
    e.stopPropagation()
    scrubbing.current = true
    seekFromClientX(e.clientX)
    const onMove = ev => seekFromClientX(ev.clientX)
    const onUp = () => {
      scrubbing.current = false
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  useEffect(() => {
    if (!open) return
    const onKey = e => {
      if (e.key === 'Escape') close()
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        togglePlay()
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)

    const video = videoRef.current
    if (video) {
      const resume = Math.min(savedTime.current || 0, readVideoDuration(video) || savedTime.current || 0)
      video.currentTime = resume
      video.play().catch(() => {})
    }

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const playBtn = (
    <span className="who-play" aria-hidden="true">
      <img src={`${A}play-showreel.svg`} alt="" />
    </span>
  )

  const openOnActivate = e => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return
    if (e.type === 'keydown') e.preventDefault()
    openPlayer()
  }

  return (
    <>
      {variant === 'hero'
        ? <div
            className="hero-video is-clickable"
            role="button"
            tabIndex={0}
            onClick={openPlayer}
            onKeyDown={openOnActivate}
            aria-label={`Play ${BRAND} showreel`}
          >
            <ShowreelThumb />
            {playBtn}
          </div>
        : <div className="who-vid-wrap" data-reveal="scale">
            <div
              className="who-video is-clickable"
              role="button"
              tabIndex={0}
              onClick={openPlayer}
              onKeyDown={openOnActivate}
              aria-label={`Play ${BRAND} showreel`}
            >
              <ShowreelThumb />
              {playBtn}
            </div>
            <div className="who-btm">
              <span>Showreel</span>
              <img src={`${A}logo-showreel.png`} alt="" className="who-logo" />
            </div>
          </div>}

      {open && (
        <div className="showreel-modal" role="dialog" aria-modal="true" aria-label={`${BRAND} showreel`} onClick={close}>
          <div className="showreel-frame" onClick={e => e.stopPropagation()}>
            <div className="showreel-glass" aria-hidden="true" />
            <video
              ref={videoRef}
              className="showreel-video"
              src={`${A}showreel.mp4`}
              poster={`${A}showreel-brand-bg.png`}
              playsInline
              preload="metadata"
              onClick={togglePlay}
              onLoadedMetadata={e => syncTime(e.currentTarget)}
              onDurationChange={e => syncTime(e.currentTarget)}
              onTimeUpdate={e => syncTime(e.currentTarget)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => {
                setPlaying(false)
                setProgress(100)
              }}
            />
            <div className="showreel-controls">
              <button type="button" className="showreel-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <span className="showreel-icon-pause" aria-hidden="true" /> : <span className="showreel-icon-play" aria-hidden="true" />}
              </button>
              <div
                className="showreel-track"
                ref={trackRef}
                onPointerDown={onTrackPointerDown}
                role="slider"
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                tabIndex={0}
                onKeyDown={e => {
                  const video = videoRef.current
                  const d = readVideoDuration(video)
                  if (!video || !d) return
                  if (e.key === 'ArrowRight') video.currentTime = Math.min(d, video.currentTime + 5)
                  if (e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5)
                }}
              >
                <div className="showreel-track-rail" />
                <div className="showreel-track-fill" style={{ width: `${progress}%` }} />
                <div className="showreel-thumb" style={{ left: `${progress}%` }} />
              </div>
              <span className="showreel-time">{formatShowreelTime(current)} / {formatShowreelTime(duration)}</span>
              <button type="button" className="showreel-btn showreel-close" onClick={close} aria-label="Close showreel">
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
        </div>
      )}
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
        <h2 data-reveal="line">Most of our clients experience the same gap between what they are and how they're perceived.</h2>
        <div className="who-copy">
          <p data-reveal="line">{BRAND} is a design agency for tech and corporate leaders at turning points: pre raise, post acquisition, market expansion, or a full repositioning. We've seen what happens when a company's brand lags behind its ambition. Investors notice. Deals stall. Talent looks elsewhere.</p>
          <p data-reveal="line">We close that gap by turning internal truth into external perception through clarity, position, signal, proof, and memory.</p>
        </div>
        <div data-reveal="up" className="who-cta"><Button href="#work">About us</Button></div>
      </div>
    </section>
  )
}

function Project({ project, index }) {
  return <article className={`project ${index % 2 ? 'reverse' : ''}`} data-reveal="project">
    <div className="project-copy">
      <div className="eyebrow" data-reveal="up">● &nbsp; {project.sector}</div>
      <h3 data-reveal="line">{project.title}</h3><p data-reveal="line">{project.description}</p>
      <div className="stats">{project.stats.map(([n, l]) => <div key={n}><strong>{n}</strong><span>{l}</span></div>)}</div>
      <a className="explore" href="#contact">Explore &nbsp; →</a>
    </div>
    <div className="project-media" data-reveal="scale" data-parallax><img src={project.image} alt={`${project.title} project preview`} /></div>
  </article>
}

function Work() {
  return <section id="work" className="work-wrap">
    <div className="section-lead"><span data-reveal="up">● &nbsp; Selected Work</span><h2 data-reveal="line">Companies that closed the perception gap and what changed.</h2></div>
    <div className="panel work-panel" data-reveal="panel">{projects.map((p, i) => <Project project={p} index={i} key={p.title} />)}<Button href="#work">All projects</Button></div>
  </section>
}

function Clients() {
  const logos = clientLogos
  return <section className="panel clients" data-reveal="panel"><div className="eyebrow" data-reveal="up">● &nbsp; Who we work with</div><h2 data-reveal="line">We work with ambitious B2B tech companies whose ambition is ahead of how the market reads them, and where that gap is becoming commercial.</h2><p className="client-label" data-reveal="up">OUR CLIENTS</p><div className="logo-marquee"><div>{[...logos, ...logos].map((id, i) => <img src={`${A}${id}.avif`} alt="Client" key={i} />)}</div></div></section>
}

function Services() {
  return <section id="services" className="panel services" data-reveal="panel"><div className="eyebrow" data-reveal="up">● &nbsp; Our services</div><div className="service-body"><h2 data-reveal="line">Everything your brand needs to grow<br /> under one roof.</h2><div className="service-list">{services.map((s, i) => <a href="#contact" key={s} data-reveal="service"><span>{String(i + 1).padStart(2, '0')}</span><b>{s}</b><i><em>→</em><em>→</em></i></a>)}</div><div data-reveal="up"><Button href="#contact">All Services</Button></div></div></section>
}

function FAQ() {
  const [active, setActive] = useState(null)
  return <section id="faq" className="panel faq"><div><div className="eyebrow">● &nbsp; FAQ</div><h2>Frequently<br /> Asked Questions</h2></div><div className="faq-list">{faqs.map(([q, a], i) => <div className={active === i ? 'faq-item active' : 'faq-item'} key={q}><button aria-expanded={active === i} onClick={() => setActive(active === i ? null : i)}><span>{String(i + 1).padStart(2, '0')}</span><b>{q}</b><i aria-hidden="true" /></button><div className="faq-answer"><div><p>{a}</p></div></div></div>)}</div></section>
}

function Testimonials() {
  const track = useRef(null)
  const slide = direction => track.current?.scrollBy({ left: direction * Math.min(460, track.current.clientWidth * .82), behavior: 'smooth' })
  return <section className="testimonials"><div className="eyebrow" data-reveal="up">● &nbsp; Testimonials</div><div className="testimonial-track" ref={track}>{testimonials.map(([quote, name, role, img]) => <article key={name} data-reveal="card"><p>{quote}</p><div className="person"><img src={img} alt={name} /><div><b>{name}</b><span>{role}</span></div><i>in</i></div></article>)}</div><div className="track-control"><span></span><button onClick={() => slide(-1)} aria-label="Previous testimonial">←</button><button onClick={() => slide(1)} aria-label="Next testimonial">→</button></div></section>
}

function Contact() {
  return <section id="contact" className="contact"><div className="contact-lead"><span data-reveal="up">● &nbsp; Contact us</span><h2 data-reveal="line">The right partner at the right moment<br /> changes everything.</h2></div><div className="panel contact-panel" data-reveal="contact-panel"><div className="contact-copy"><span className="outline-pill">Start a conversation</span><h2>Tell us about your<br /> next stage.</h2><p>Our Testimonials:</p><div className="badges"><span>©</span><span>♞</span></div></div><form className="contact-form" onSubmit={e => e.preventDefault()}><div className="field-grid"><label>Name<input placeholder="Evan" /></label><label>Company<input placeholder="Microsoft" /></label><label>Your Email<input type="email" placeholder="evan@microsoft.com" /></label><label>Your Phone<input placeholder="Your phone number" /></label></div><Choice title="I’m interested in..." options={['Branding','Website Design','UX and UI','Motion Design','Landing page','Content Creation','Webflow Development']} /><Choice title="Project Budget (USD)" options={['Under 10k','10k to 30k','30k to 80k','80k+']} /><label className="message-field">Tell us about your project.<textarea placeholder="Write something concise..." /></label><button className="submit" type="submit"><span>Submit</span></button></form></div></section>
}

function Choice({ title, options }) { const [selected, setSelected] = useState(''); return <fieldset><legend>{title}</legend><div className="choices">{options.map(o => <button className={selected === o ? 'selected' : ''} type="button" onClick={() => setSelected(o)} key={o}>{o}</button>)}</div></fieldset> }

function Footer() {
  const cols = [['Company:','About','Services','Projects','For startups','Lab','Blog','Resources','Contacts','Careers','Testimonials'],['Services:','Web Design','Branding','UX and UI','Motion','SEO','Content Creation','Landing Page','Webflow Dev'],['Industries:','Healthcare','Fintech','Web3','Technology','Corporate','AI','Real Estate','Ecommerce','FMCG','Hospitality']]
  return <footer data-reveal="footer">{cols.map(col => <div className="footer-col" key={col[0]}><b>{col[0]}</b>{col.slice(1).map((x, i) => <a href="#top" style={{ '--footer-i': i }} key={x}>{x}</a>)}</div>)}<div className="subscribe"><b>Subscribe to our news and updates</b><label><input placeholder="Your email here" /><span>→</span></label><small>By signing up, you agree to our Privacy Policy. We respect your data.</small><b>Follow us on:</b><div className="socials">{['◉','Bē','●','in','𝕏'].map((x, i) => <span style={{ '--footer-i': i }} key={x}>{x}</span>)}</div></div><div className="footer-bottom"><Logo variant="footer" /><span>© 2026 {BRAND}. All rights reserved &nbsp; ● &nbsp; <b>Privacy Policy</b></span><a href="#top" className="to-top">↑</a></div></footer>
}

function App() {
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
  return <><Hero /><main><About /><Work /><Clients /><Services /><FAQ /><Testimonials /><Contact /></main><Footer /></>
}

createRoot(document.getElementById('root')).render(<App />)
