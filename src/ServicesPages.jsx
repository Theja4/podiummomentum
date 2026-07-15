import React, { useEffect, useRef, useState } from 'react'
import {
  serviceCatalog,
  hubIntro,
  hubFeatured,
  hubPartners,
  hubExpertise,
  hubNumbers,
  hubNumbersHead,
  hubClose,
  hubFaqs,
  hubTestimonials,
  getServiceBySlug,
  getServicePath,
  getRelatedServices,
  SERVICES_PATH,
  matchServicesRoute,
} from './servicesData.js'
import { usePageMotion } from './usePageMotion.js'

export { matchServicesRoute }
import './services-pages.css'
import './eloqwnt-fidelity.css'
import './split-reveal.css'
import './service-motion-redesign.css'

const CONTACT_PATH = '/contact-us'
const A = '/assets/'

function go(path, navigate) {
  if (typeof navigate === 'function') navigate(path)
}

function Pill({ children, href, navigate, dark = false, icon = 'wave' }) {
  let src = `${A}hand-wave.avif`
  if (icon === 'pricing' || icon === 'brand') src = `${A}brand-mark.svg`
  if (dark && icon === 'wave') src = `${A}brand-mark.svg`
  return (
    <a
      className={`pill ${dark ? 'pill-dark' : 'pill-light'}`}
      href={href}
      onClick={e => {
        e.preventDefault()
        go(href, navigate)
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
          className={`pill-icon ${icon === 'pricing' || dark ? 'pill-brand' : 'pill-handwave'}`}
          src={src}
          alt=""
        />
      </span>
    </a>
  )
}

export function DotLabel({ children }) {
  return (
    <div className="svc-dot-label">
      <span className="svc-dot" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

function useAutoRail(speed = 0.7) {
  const ref = useRef(null)
  const paused = useRef(false)

  useEffect(() => {
    const rail = ref.current
    if (!rail || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let interval = 0
    const pause = () => { paused.current = true }
    const resume = () => { paused.current = false }
    const tick = () => {
      if (!paused.current && rail.scrollWidth > rail.clientWidth) {
        rail.scrollLeft += speed
        const loopAt = rail.scrollWidth / 2
        if (rail.scrollLeft >= loopAt) rail.scrollLeft -= loopAt
      }
    }

    rail.addEventListener('pointerenter', pause)
    rail.addEventListener('pointerleave', resume)
    rail.addEventListener('focusin', pause)
    rail.addEventListener('focusout', resume)
    rail.addEventListener('touchstart', pause, { passive: true })
    rail.addEventListener('touchend', resume, { passive: true })
    interval = window.setInterval(tick, 24)

    return () => {
      window.clearInterval(interval)
      rail.removeEventListener('pointerenter', pause)
      rail.removeEventListener('pointerleave', resume)
      rail.removeEventListener('focusin', pause)
      rail.removeEventListener('focusout', resume)
      rail.removeEventListener('touchstart', pause)
      rail.removeEventListener('touchend', resume)
    }
  }, [speed])

  const nudge = direction => {
    const rail = ref.current
    if (!rail) return
    const loopAt = rail.scrollWidth / 2
    if (direction < 0 && rail.scrollLeft < 8) rail.scrollLeft = loopAt
    rail.scrollBy({ left: direction * rail.clientWidth * 0.72, behavior: 'smooth' })
  }

  return { ref, nudge }
}

function RailControls({ label, onPrevious, onNext }) {
  return (
    <div className="svc-rail-controls" aria-label={`${label} carousel controls`}>
      <span className="svc-rail-progress" aria-hidden="true"><i /></span>
      <button type="button" onClick={onPrevious} aria-label={`Previous ${label}`}>←</button>
      <button type="button" onClick={onNext} aria-label={`Next ${label}`}>→</button>
    </div>
  )
}

function ProjectRail({ works, serviceTitle }) {
  const { ref, nudge } = useAutoRail(0.72)
  const loopedWorks = [...works, ...works]
  return (
    <>
      <div className="svc-work-strip-scroll" ref={ref} data-auto-rail="projects">
        {loopedWorks.map((p, i) => (
          <article key={`${p.name}-${i}`} data-reveal="card" aria-hidden={i >= works.length ? 'true' : undefined}>
            <div className="svc-featured-media" data-project-label={p.name}>
              <img src={p.image} alt={i < works.length ? p.name : ''} loading="lazy" />
            </div>
            <div className="svc-work-strip-meta">
              <h3>
                {p.name}
                {p.year ? <span> — {p.year}</span> : null}
              </h3>
              <span className="svc-work-tag">{serviceTitle}</span>
            </div>
          </article>
        ))}
      </div>
      <RailControls label="projects" onPrevious={() => nudge(-1)} onNext={() => nudge(1)} />
    </>
  )
}

function TestimonialsRail({ items }) {
  const { ref, nudge } = useAutoRail(0.52)
  const loopedItems = [...items, ...items]
  return (
    <>
      <div className="svc-testimonial-track" ref={ref} data-auto-rail="testimonials">
        {loopedItems.map((t, i) => (
          <article key={`${t.name}-${i}`} data-reveal="card" aria-hidden={i >= items.length ? 'true' : undefined}>
            <p>{t.quote}</p>
            <div className="svc-testimonial-person">
              <img src={t.image} alt={i < items.length ? t.name : ''} loading="lazy" />
              <div>
                <b>{t.name}</b>
                <span>{t.role}</span>
              </div>
              <i aria-hidden="true">in</i>
            </div>
          </article>
        ))}
      </div>
      <RailControls label="testimonials" onPrevious={() => nudge(-1)} onNext={() => nudge(1)} />
    </>
  )
}

function ServiceProcess({ steps }) {
  const [active, setActive] = useState(null)
  return (
    <div className="svc-process-shell" data-reveal="panel">
      <div className="svc-process-grid">
        {steps.map((step, i) => {
          const open = active === i
          return (
            <article key={step.title} className={open ? 'is-active' : ''} data-reveal="card" style={{ '--i': i }}>
              <span>Step {i + 1}</span>
              <h3>{step.title}</h3>
              <button
                type="button"
                className="svc-process-toggle"
                aria-expanded={open}
                onClick={() => setActive(open ? null : i)}
              >
                <i aria-hidden="true" />
                <span className="sr-only">{open ? 'Hide' : 'Show'} step details</span>
              </button>
              <div className="svc-process-answer">
                <p>{step.body}</p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function ServiceFaq({ faqs }) {
  const [active, setActive] = useState(null)
  return (
    <div className="svc-faq-list">
      {faqs.map((item, i) => {
        const open = active === i
        // NOTE: no data-reveal here. The reveal observer adds `is-inview`
        // imperatively, but React rewrites className on open/close and would
        // wipe it — dropping the toggled item to opacity:0. The FAQ section
        // (data-reveal="panel") already handles the entrance.
        return (
          <div className={`svc-faq-item ${open ? 'is-open' : ''}`} key={item.q}>
            <button type="button" aria-expanded={open} onClick={() => setActive(open ? null : i)}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <b>{item.q}</b>
              <i aria-hidden="true" />
            </button>
            <div className="svc-faq-answer">
              <p>{item.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DualClose({ navigate, label = hubClose.label, title = hubClose.title, body = hubClose.body }) {
  return (
    <section className="svc-close" data-reveal="panel">
      <div className="svc-container svc-close-inner">
        {label ? <DotLabel>{label}</DotLabel> : null}
        <h2 data-split="words">{title}</h2>
        <p data-split="letters">{body}</p>
        <div className="svc-close-actions" data-reveal="up">
          <Pill href={CONTACT_PATH} navigate={navigate} icon="wave">
            {hubClose.primary}
          </Pill>
          <Pill href={CONTACT_PATH} navigate={navigate} dark icon="pricing">
            {hubClose.secondary}
          </Pill>
        </div>
      </div>
    </section>
  )
}

function FeaturedCard({ p }) {
  return (
    <article className="svc-featured-card" data-reveal="card">
      <div className="svc-featured-media">
        <img src={p.image} alt={p.name} loading="lazy" />
      </div>
      <div className="svc-featured-meta">
        <div className="svc-featured-title-row">
          <h3>{p.name}</h3>
          {p.year ? <span className="svc-featured-year">— {p.year}</span> : null}
        </div>
        {p.tags?.length ? (
          <div className="svc-featured-tags">
            {p.tags.map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function ServicesHub({ navigate }) {
  usePageMotion([navigate], '.svc-page')
  const titleLines = hubNumbersHead.titleLines || String(hubNumbersHead.title).split('\n')

  return (
    <div className="svc-page">
      <section className="svc-hub-hero" data-reveal="panel">
        <div className="svc-container">
          <p className="svc-hub-solutions" data-split="letters">
            {hubIntro.heroLine}
          </p>
          <DotLabel>{hubIntro.offeringsLabel}</DotLabel>
          <h1 data-split="words">{hubIntro.title}</h1>
        </div>
      </section>

      <section className="svc-hub-list-wrap" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-hub-list">
            {serviceCatalog.map((s, i) => (
              <a
                key={s.slug}
                className="svc-hub-row service-row-motion"
                href={getServicePath(s.slug)}
                data-reveal="service"
                style={{ '--service-index': i }}
                onClick={e => {
                  e.preventDefault()
                  go(getServicePath(s.slug), navigate)
                }}
              >
                <span className="svc-hub-num service-row-number">{String(i + 1).padStart(2, '0')}</span>
                <div className="svc-hub-title-stack">
                  <b className="svc-hub-title-main service-row-title">{s.title}</b>
                </div>
                <p>{s.hubBlurb}</p>
                <i className="service-row-arrow" aria-hidden="true">
                  <em>→</em>
                  <em>→</em>
                </i>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="svc-featured" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-section-head svc-section-head-row">
            <DotLabel>Our Works</DotLabel>
            <h2 data-split="words">Check Our Featured Projects</h2>
          </div>
          <div className="svc-featured-grid">
            {hubFeatured.map(p => (
              <FeaturedCard key={p.name} p={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="svc-partners" data-reveal="panel">
        <div className="svc-container">
          <DotLabel>Partners</DotLabel>
          <div className="svc-partners-marquee" data-reveal="up">
            <div className="svc-partners-track">
              {[...hubPartners, ...hubPartners].map((src, i) => (
                <img key={`${src}-${i}`} src={src} alt="" loading="lazy" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="svc-expertise" data-reveal="panel">
        <div className="svc-container svc-expertise-grid">
          <div className="svc-expertise-copy">
            <DotLabel>{hubExpertise.label}</DotLabel>
            <h2 data-split="words">{hubExpertise.title}</h2>
            <p data-reveal="up">{hubExpertise.body}</p>
            <div data-reveal="up">
              <Pill href={CONTACT_PATH} navigate={navigate}>
                Let’s talk
              </Pill>
            </div>
          </div>
          <div className="svc-expertise-media" data-reveal="card">
            <img src={hubExpertise.image} alt={hubExpertise.imageAlt} loading="lazy" />
          </div>
        </div>
      </section>

      <section className="svc-numbers" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-numbers-head">
            <div>
              <DotLabel>{hubNumbersHead.label}</DotLabel>
              <h2 data-reveal="line" className="svc-numbers-title">
                {titleLines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < titleLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </h2>
              <p className="svc-numbers-body" data-reveal="up">
                {hubNumbersHead.body}
              </p>
              <div data-reveal="up">
                <Pill href={CONTACT_PATH} navigate={navigate}>
                  Let’s talk
                </Pill>
              </div>
            </div>
            <div className="svc-numbers-grid">
              {hubNumbers.map(n => (
                <article key={n.label} data-reveal="card">
                  {n.index ? <span className="svc-numbers-index">{n.index}</span> : null}
                  <strong>{n.value}</strong>
                  <span>{n.label}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="svc-testimonials" data-reveal="panel">
        <div className="svc-container">
          <DotLabel>Our clients</DotLabel>
          <TestimonialsRail items={hubTestimonials} />
        </div>
      </section>

      <DualClose navigate={navigate} />

      <section className="svc-hub-faq" data-reveal="panel">
        <div className="svc-container svc-faq-grid">
          <div>
            <DotLabel>FAQ</DotLabel>
            <h2 data-reveal="line">
              Frequently
              <br />
              Asked Questions
            </h2>
          </div>
          <ServiceFaq faqs={hubFaqs} />
        </div>
      </section>

      <section className="svc-contact-band" data-reveal="panel">
        <div className="svc-container">
          <DotLabel>Contact us</DotLabel>
          <h2 data-split="words">The right partner at the right moment changes everything.</h2>
          <div data-reveal="up">
            <Pill href={CONTACT_PATH} navigate={navigate}>
              Start a conversation
            </Pill>
          </div>
        </div>
      </section>
    </div>
  )
}

export function ServiceDetail({ slug, navigate }) {
  const service = getServiceBySlug(slug)
  const related = service ? getRelatedServices(service.slug) : []
  const others = serviceCatalog.filter(s => s.slug !== slug)
  usePageMotion([slug], '.svc-page')

  if (!service) {
    return (
      <div className="svc-page">
        <section className="svc-missing">
          <div className="svc-container">
            <h1>Service not found</h1>
            <p>That offering is not in our catalog. Browse all services instead.</p>
            <Pill href={SERVICES_PATH} navigate={navigate}>
              All services
            </Pill>
          </div>
        </section>
      </div>
    )
  }

  const works = service.works?.length ? service.works : hubFeatured.slice(0, 4)
  const heroImg = service.heroImage || hubFeatured[0].image

  return (
    <div className="svc-page is-detail">
      <section className="svc-detail-hero-stage" data-scroll-shrink-stage>
        <div className="svc-detail-hero" data-scroll-shrink>
          <div className="svc-detail-hero-center">
            <h1 data-split="words">{service.heroHeadline}</h1>
            <div className="svc-detail-hero-bottom">
              <p className="svc-detail-lead" data-split="letters">{service.heroLead}</p>
              <a className="svc-scroll-cue" href="#service-intro" aria-label="Scroll to service overview">↓</a>
            </div>
          </div>
        </div>
      </section>

      <section className="svc-detail-intro" id="service-intro" data-reveal="panel">
        <div className="svc-container svc-detail-intro-grid">
          <div className="svc-detail-intro-media-wrap">
            <DotLabel>{service.heroEyebrow}</DotLabel>
            <div className="svc-detail-hero-media" data-reveal="card">
              <img src={heroImg} alt={`${service.title} project preview`} loading="eager" />
            </div>
          </div>
          <div className="svc-detail-intro-copy">
            <h2 data-split="words">{service.heroHeadline}</h2>
            <p data-reveal="up">{service.heroBody}</p>
            <div className="svc-detail-hero-actions" data-reveal="up">
              <Pill href={CONTACT_PATH} navigate={navigate}>
                Let’s talk
              </Pill>
            </div>
          </div>
        </div>
      </section>

      <section className="svc-stats" data-reveal="panel">
        <div className="svc-container">
          <DotLabel>Our expertise in numbers</DotLabel>
          <div className="svc-stats-grid">
            {service.stats.map(stat => (
              <article key={stat.label} data-reveal="card">
                <strong>{stat.value}</strong>
                <b>{stat.label}</b>
                <p>{stat.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="svc-caps" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-section-head svc-caps-head">
            <div className="svc-caps-label-stack">
              <span className="svc-caps-svc">{service.shortTitle}</span>
              <span className="svc-caps-svc-ghost" aria-hidden="true">
                Services
              </span>
            </div>
            <h2 data-split="words">
              {service.title} Services — Seamless, Results-Driven Experiences
            </h2>
          </div>
          <ol className="svc-cap-list">
            {service.capabilities.map((cap, i) => (
              <li
                className="service-row-motion"
                key={cap.title}
                data-reveal="service"
                style={{ '--service-index': i }}
              >
                <span className="service-row-number">{String(i + 1).padStart(2, '0')}</span>
                <div className="service-row-title">
                  <h3>{cap.title}</h3>
                  <p>{cap.body}</p>
                </div>
                <i className="service-row-arrow svc-cap-arrow" aria-hidden="true">
                  <em>→</em>
                  <em>→</em>
                </i>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="svc-work-strip" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-section-head svc-section-head-row">
            <DotLabel>Works</DotLabel>
            <h2 data-split="words">Selected projects</h2>
          </div>
          <ProjectRail works={works} serviceTitle={service.shortTitle} />
        </div>
      </section>

      <section className="svc-pills-nav" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-pills-row" data-reveal="up">
            {others.map(s => (
              <a
                key={s.slug}
                href={getServicePath(s.slug)}
                className="svc-pill-link"
                onClick={e => {
                  e.preventDefault()
                  go(getServicePath(s.slug), navigate)
                }}
              >
                {s.shortTitle}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="svc-testimonials svc-detail-testimonials" data-reveal="panel">
        <div className="svc-container">
          <DotLabel>Testimonials</DotLabel>
          <TestimonialsRail items={hubTestimonials} />
        </div>
      </section>

      <section className="svc-process" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-section-head">
            <DotLabel>Our process</DotLabel>
          </div>
          <ServiceProcess steps={service.process} />
        </div>
      </section>

      <section className="svc-faq" data-reveal="panel">
        <div className="svc-container svc-faq-grid">
          <div>
            <DotLabel>FAQ</DotLabel>
            <h2 data-reveal="line">
              Frequently
              <br />
              Asked Questions
            </h2>
          </div>
          <ServiceFaq faqs={service.faqs} />
        </div>
      </section>

      <section className="svc-related" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-section-head">
            <DotLabel>Related</DotLabel>
            <h2 data-split="words">Keep exploring</h2>
          </div>
          <div className="svc-related-grid">
            {related.map(s => (
              <a
                key={s.slug}
                href={getServicePath(s.slug)}
                data-reveal="card"
                onClick={e => {
                  e.preventDefault()
                  go(getServicePath(s.slug), navigate)
                }}
              >
                <b>{s.title}</b>
                <span>{s.hubBlurb}</span>
                <em>→</em>
              </a>
            ))}
          </div>
        </div>
      </section>

      <DualClose
        navigate={navigate}
        label="What is next"
        title="Let’s work together!"
        body="Let’s bring your vision to life and transform your ideas into a powerful, unforgettable brand that drives growth and success!"
      />
    </div>
  )
}

void A
