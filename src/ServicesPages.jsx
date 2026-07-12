import React, { useState } from 'react'
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

const CONTACT_PATH = '/contact-us'
const A = '/assets/'
const E = '/assets/eloqwnt/'

function go(path, navigate) {
  if (typeof navigate === 'function') navigate(path)
}

function Pill({ children, href, navigate, dark = false, icon = 'wave' }) {
  let src = `${E}hand-wave-ref.avif`
  if (icon === 'pricing' || icon === 'brand') src = `${E}pricing-icon.avif`
  if (dark && icon === 'wave') src = `${E}pricing-icon.avif`
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

function DotLabel({ children }) {
  return (
    <div className="svc-dot-label">
      <span className="svc-dot" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

function ServiceFaq({ faqs }) {
  const [active, setActive] = useState(null)
  return (
    <div className="svc-faq-list">
      {faqs.map((item, i) => {
        const open = active === i
        return (
          <div className={`svc-faq-item ${open ? 'is-open' : ''}`} key={item.q} data-reveal="card">
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
        <h2 data-reveal="line">{title}</h2>
        <p data-reveal="up">{body}</p>
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
          <p className="svc-hub-solutions" data-reveal="line">
            {hubIntro.heroLine}
          </p>
          <DotLabel>{hubIntro.offeringsLabel}</DotLabel>
          <h1 data-reveal="line">{hubIntro.title}</h1>
        </div>
      </section>

      <section className="svc-hub-list-wrap" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-hub-list">
            {serviceCatalog.map((s, i) => (
              <a
                key={s.slug}
                className="svc-hub-row"
                href={getServicePath(s.slug)}
                data-reveal="service"
                onClick={e => {
                  e.preventDefault()
                  go(getServicePath(s.slug), navigate)
                }}
              >
                <span className="svc-hub-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="svc-hub-title-stack">
                  <b className="svc-hub-title-main">{s.title}</b>
                  <b className="svc-hub-title-ghost" aria-hidden="true">
                    {s.title}
                  </b>
                </div>
                <p>{s.hubBlurb}</p>
                <i aria-hidden="true">
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
            <h2 data-reveal="line">Check Our Featured Projects</h2>
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
            <h2 data-reveal="line">{hubExpertise.title}</h2>
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
          <div className="svc-testimonial-track">
            {hubTestimonials.map(t => (
              <article key={t.name} data-reveal="card">
                <p>{t.quote}</p>
                <div className="svc-testimonial-person">
                  <img src={t.image} alt={t.name} loading="lazy" />
                  <div>
                    <b>{t.name}</b>
                    <span>{t.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
          <h2 data-reveal="line">The right partner at the right moment changes everything.</h2>
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
    <div className="svc-page">
      <section className="svc-detail-hero" data-reveal="panel">
        <div className="svc-container svc-detail-hero-grid">
          <div className="svc-detail-hero-copy">
            <p className="svc-detail-lead" data-reveal="line">
              {service.heroLead}
            </p>
            <div className="svc-detail-chip" data-reveal="up">
              {service.heroEyebrow}
            </div>
          </div>
          <div className="svc-detail-hero-media" data-reveal="card">
            <img src={heroImg} alt="" loading="eager" />
          </div>
        </div>
      </section>

      <section className="svc-detail-intro" data-reveal="panel">
        <div className="svc-container svc-detail-intro-grid">
          <div>
            <h2 data-reveal="line">{service.heroHeadline}</h2>
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
            <h2 data-reveal="line">
              {service.title} Services — Seamless, Results-Driven Experiences
            </h2>
          </div>
          <ol className="svc-cap-list">
            {service.capabilities.map((cap, i) => (
              <li key={cap.title} data-reveal="service">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{cap.title}</h3>
                  <p>{cap.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="svc-work-strip" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-section-head svc-section-head-row">
            <DotLabel>Works</DotLabel>
            <h2 data-reveal="line">Selected projects</h2>
          </div>
          <div className="svc-work-strip-scroll">
            {works.map(p => (
              <article key={p.name} data-reveal="card">
                <div className="svc-featured-media">
                  <img src={p.image} alt={p.name} loading="lazy" />
                </div>
                <div className="svc-work-strip-meta">
                  <h3>
                    {p.name}
                    {p.year ? <span> — {p.year}</span> : null}
                  </h3>
                </div>
              </article>
            ))}
          </div>
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

      <section className="svc-process" data-reveal="panel">
        <div className="svc-container">
          <div className="svc-section-head">
            <DotLabel>Our process</DotLabel>
            <h2 data-reveal="line">How we work</h2>
          </div>
          <div className="svc-process-grid">
            {service.process.map((step, i) => (
              <article key={step.title} data-reveal="card" style={{ '--i': i }}>
                <span>Step {i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
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
            <h2 data-reveal="line">Keep exploring</h2>
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
