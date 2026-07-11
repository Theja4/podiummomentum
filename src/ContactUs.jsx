import React, { useEffect, useState } from 'react'

const TC = '/assets/tc-contact/'
const BRAND = 'Podium Momentum'

const logos = [
  ['logo-amazon-grey.svg', 'is-amazon'],
  ['logo-razorpay-grey.svg', 'is-razorpay'],
  ['logo-z47-grey.svg', 'is-z47'],
  ['logo-factors-grey.svg', 'is-factors'],
  ['logo-roommaster-grey.svg', 'is-roommaster'],
  ['logo-storylane-grey.svg', 'is-storylane'],
  ['logo-zamp.svg', 'is-zamp'],
  ['logo-wizcom.svg', 'is-wiz'],
]

const expectItems = [
  ['icon-website.svg', 'Website Performance Reality Check', "We'll walk through your current site and identify what's not working"],
  ['icon-case.svg', 'Case Studies From Your Space', 'See before/after transformations from similar companies'],
  ['icon-timeline.svg', 'Timeline & Investment Clarity', 'Get realistic timelines and ballpark investment for your project'],
]

const testimonialsCol1 = [
  {
    logo: 'logo-amazon.svg', flag: 'flag-in.webp', tag: 'SAAS',
    quote: 'The team is thoughtful, responsive, and has exceptional design sensibility. Bringing our collective brand vision to life wasn’t easy, but the results speak for themselves - it looks amazing!',
    avatar: 'person-pinto.webp', name: 'Darryl Pinto', role: 'Growth Marketing Manager, Amazon',
  },
  {
    logo: 'logo-coka.webp', flag: 'flag-us.png', tag: 'SERVICES',
    quote: `"${BRAND} created a website that helped us look credible in the space."`,
    avatar: 'person-matthew.jpg', name: 'Matthew', role: 'Coka',
  },
  {
    logo: 'logo-tripledart.png', flag: 'flag-in.webp', tag: 'SAAS',
    quote: `"${BRAND} has been our go-to partner for numerous SaaS client projects. They tackle each challenge with unmatched expertise and creativity, exceeding our expectations."`,
    avatar: 'person-shiyam.webp', name: 'Shiyam Sunder', role: 'Co-founder, Tripledart',
  },
]

const testimonialsCol2 = [
  {
    logo: 'logo-factors.svg', flag: 'flag-in.webp', tag: 'MARTECH',
    quote: `"${BRAND} was always responsive, quick to act, and highly collaborative. The final output exceeded our expectations - modern, clean, and exactly what we envisioned."`,
    avatar: 'person-tanvi.jpeg', name: 'Tanvi', role: 'Product Marketing Lead, Factors AI',
  },
  {
    logo: 'logo-deductive.svg', flag: 'flag-in.webp', tag: 'AI',
    quote: `"${BRAND} made our brand and website communicate our product effectively. The feedback has been amazing; people keep telling us how polished and engaging the site and the brand looks."`,
    avatar: 'person-sameer.webp', name: 'Sameer Agarwal', role: 'Co-Founder & CTO, Deductive.ai',
  },
  {
    logo: 'logo-skyroot.webp', flag: 'flag-in.webp', tag: 'SAAS',
    quote: `"The result of working with ${BRAND} was instantly visible - the site is very unique to our industry and showcases all our capabilities well."`,
    avatar: 'person-sumil.jpg', name: 'Sumil Sudhakaran', role: 'Skyroot Aerospace',
  },
]

const testimonialsCol3 = [
  {
    logo: 'logo-storylane.svg', flag: 'flag-in.webp', tag: 'MARTECH',
    quote: `"The ${BRAND} team is responsive, meets deadlines, and goes beyond expectations - it's a solid partner for any B2B company looking to scale their brand."`,
    avatar: 'person-anand.webp', name: 'Anand Vatsya', role: 'Product Marketing, Outbound, Storylane',
  },
  {
    logo: 'logo-overpass.svg', flag: 'flag-uk.png', tag: 'SERVICES',
    quote: `"${BRAND}'s speed of execution, high-quality work, and transparent communication make them stand out. It's rare to find an agency this reliable, and that's why we keep coming back."`,
    avatar: 'person-matt.webp', name: 'Matt Cope', role: 'Co-founder, Overpass Studio',
  },
  {
    logo: 'logo-rezolv.svg', flag: 'flag-in.webp', tag: 'FINTECH',
    quote: `As an early-stage company, we needed a clear brand identity and messaging before launching. ${BRAND} delivered exactly that: concise, impactful copy and branding that feels right.`,
    avatar: 'person-karan.webp', name: 'Karan Mehta', role: 'Founder, Rezolv',
  },
]

const withoutPoints = [
  'The site reflects who you were two years ago',
  'You look the same as (or worse than) your competitors',
  "Your team isn't proud to share the website link",
  "Conversions are flat and nobody can explain why",
]

const withPoints = [
  'Positioning that matches where the company actually is today',
  'A distinct brand that makes competitors look generic',
  'Prospects show up to calls already half-sold',
  "CRO-optimized pages with clear data on what's working",
]

const pipeline = [
  ['80%', 'Increase in demo requests', 'logo-roommaster.svg'],
  ['60%', 'Increase in organic traffic', 'logo-z47-grey.svg'],
  ['35%', 'Increase in clicks and impressions', 'logo-clearly.svg'],
  ['30%', 'Increase in demo requests', 'logo-storylane-grey.svg'],
]

function TestimonialCard({ item }) {
  return (
    <article className="cu-tcard">
      <div className="cu-tcard-top">
        <img className="cu-tcard-logo" src={`${TC}${item.logo}`} alt="" />
        <div className="cu-tcard-meta">
          <span className="cu-tcard-flag"><img src={`${TC}${item.flag}`} alt="" /></span>
          <span className="cu-tcard-tag">{item.tag}</span>
        </div>
      </div>
      <p className="cu-tcard-quote">{item.quote}</p>
      <div className="cu-tcard-author">
        <img src={`${TC}${item.avatar}`} alt={item.name} />
        <div>
          <b>{item.name}</b>
          <span>{item.role}</span>
        </div>
      </div>
    </article>
  )
}

function MarqueeColumn({ items, reverse = false }) {
  const loop = [...items, ...items]
  return (
    <div className={`cu-marquee-col ${reverse ? 'is-reverse' : ''}`}>
      <div className="cu-marquee-track">
        {loop.map((item, i) => <TestimonialCard item={item} key={`${item.name}-${i}`} />)}
      </div>
    </div>
  )
}

function ContactForm() {
  const [sent, setSent] = useState(false)
  const onSubmit = e => {
    e.preventDefault()
    setSent(true)
  }
  return (
    <div className="cu-form-card" id="form">
      <div className="cu-form-hosts">
        <div className="cu-form-avatars">
          <img src={`${TC}avatar-ayush.webp`} alt="" />
          <img src={`${TC}avatar-harsh.webp`} alt="" />
        </div>
        <p>Book a free 30-minute strategy session with our team.</p>
      </div>
      {sent ? (
        <div className="cu-form-success">
          <h3>Thanks; you’re on the list.</h3>
          <p>We’ll reach out within one business day to lock your strategy session.</p>
        </div>
      ) : (
        <form className="cu-form" onSubmit={onSubmit}>
          <label>
            <span>Full name*</span>
            <input name="name" required placeholder="Jane Cooper" autoComplete="name" />
          </label>
          <label>
            <span>Work email*</span>
            <input name="email" type="email" required placeholder="jane@company.com" autoComplete="email" />
          </label>
          <label>
            <span>Company*</span>
            <input name="company" required placeholder="Acme Inc." autoComplete="organization" />
          </label>
          <label>
            <span>Website</span>
            <input name="website" type="url" placeholder="https://" autoComplete="url" />
          </label>
          <label>
            <span>What are you looking to achieve?*</span>
            <textarea name="message" required rows={4} placeholder="Rebrand, new website, conversion lift…" />
          </label>
          <label>
            <span>Budget range</span>
            <select name="budget" defaultValue="">
              <option value="" disabled>Select a range</option>
              <option>$10k to $25k</option>
              <option>$25k to $50k</option>
              <option>$50k to $100k</option>
              <option>$100k+</option>
            </select>
          </label>
          <button className="cu-btn" type="submit">Book your strategy session</button>
          <p className="cu-form-note">No spam. No hard pitch. Just a clear next step.</p>
        </form>
      )}
    </div>
  )
}

export default function ContactUs({ onNavigateHome, footer = null }) {
  useEffect(() => {
    document.title = `Book a Demo | ${BRAND}`
    document.body.classList.add('cu-active')
    const prevTheme = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = 'dark'
    window.scrollTo(0, 0)
    return () => {
      document.body.classList.remove('cu-active')
      document.documentElement.dataset.theme = prevTheme || 'dark'
      document.title = `${BRAND} | Brand and Web Design Agency for Tech Companies`
    }
  }, [])

  return (
    <>
    <div className="cu-page">
      <header className="cu-nav">
        <a href="/" className="cu-nav-logo" onClick={e => { e.preventDefault(); onNavigateHome?.() }} aria-label={BRAND}>
          <img src="/assets/brand-mark.svg" alt="" />
          <span><b>podium</b><em>momentum</em></span>
        </a>
        <a className="cu-nav-cta" href="#form">Talk to Us</a>
      </header>

      <section className="cu-hero">
        <div className="cu-hero-bg" aria-hidden="true">
          <img className="cu-hero-gradient" src={`${TC}gradient-bg.svg`} alt="" />
          <img className="cu-hero-decor" src={`${TC}contact-bg-light.svg`} alt="" />
        </div>
        <div className="cu-container cu-hero-grid">
          <div className="cu-hero-left">
            <h1 className="cu-h2">Get a SaaS website that makes your product impossible to ignore</h1>

            <div className="cu-trust">
              <div className="cu-trust-top">
                <p className="cu-trust-title">Trusted by <span>88+</span> B2B Marketing Leaders</p>
                <div className="cu-clutch">
                  <img className="cu-clutch-icon" src={`${TC}clutch-icon.webp`} alt="Clutch" />
                  <div>
                    <div className="cu-clutch-row">
                      <span>Clutch</span>
                      <span className="cu-stars">
                        {Array.from({ length: 5 }, (_, i) => (
                          <img src={`${TC}star.svg`} alt="" key={i} />
                        ))}
                      </span>
                    </div>
                    <span className="cu-clutch-score">4.9 Stars</span>
                  </div>
                </div>
              </div>
              <div className="cu-logo-grid">
                {logos.map(([file, mod]) => (
                  <div className={`cu-logo-cell ${mod}`} key={file}>
                    <img src={`${TC}${file}`} alt="" />
                  </div>
                ))}
              </div>
            </div>

            <div className="cu-stats">
              <div className="cu-stat">
                <strong>50</strong>
                <span>Increase in Leads</span>
              </div>
              <span className="cu-stat-div" aria-hidden="true" />
              <div className="cu-stat">
                <strong>60</strong>
                <span>Increase in User Engagement</span>
              </div>
            </div>

            <div className="cu-expect">
              <h2 className="cu-expect-title">What to expect</h2>
              <div className="cu-expect-list">
                {expectItems.map(([icon, title, copy]) => (
                  <div className="cu-expect-item" key={title}>
                    <img src={`${TC}${icon}`} alt="" />
                    <div>
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cu-hero-right">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="cu-results">
        <div className="cu-container">
          <h2 className="cu-h2 cu-center">Results that speak <span>for themselves.</span></h2>
          <div className="cu-marquee-wrap">
            <MarqueeColumn items={testimonialsCol1} />
            <MarqueeColumn items={testimonialsCol2} reverse />
            <MarqueeColumn items={testimonialsCol3} />
          </div>
        </div>
      </section>

      <section className="cu-change">
        <div className="cu-container">
          <h2 className="cu-h2 cu-center">Still not sure?<br />Here’s what changes.</h2>
          <div className="cu-change-grid">
            <div className="cu-change-card">
              <div className="cu-change-visual">
                <span className="cu-eyebrow is-red">Without {BRAND}</span>
                <img src={`${TC}compare-without.webp`} alt="" />
              </div>
              <ul className="cu-change-list">
                {withoutPoints.map((t, i) => (
                  <li key={t}>
                    <img src={`${TC}icon-cross.svg`} alt="" />
                    <span>{t}</span>
                    {i < withoutPoints.length - 1 && <i className="cu-change-line" />}
                  </li>
                ))}
              </ul>
            </div>
            <div className="cu-change-card">
              <div className="cu-change-visual">
                <span className="cu-eyebrow">With {BRAND}</span>
                <img src={`${TC}compare-with.webp`} alt="" />
              </div>
              <ul className="cu-change-list">
                {withPoints.map((t, i) => (
                  <li key={t}>
                    <img src={`${TC}icon-tick.svg`} alt="" />
                    <span>{t}</span>
                    {i < withPoints.length - 1 && <i className="cu-change-line" />}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="cu-change-cta">
            <a className="cu-btn" href="#form">Book your strategy session</a>
          </div>
        </div>
      </section>

      <section className="cu-pipeline">
        <div className="cu-container">
          <h2 className="cu-h2 cu-center">Results that show up in your pipeline.</h2>
          <div className="cu-pipeline-track">
            <div className="cu-pipeline-row">
              {[...pipeline, ...pipeline].map(([n, label, logo], i) => (
                <article className="cu-pipe-card" key={`${label}-${i}`}>
                  <div className="cu-pipe-top">
                    <strong>{n}</strong>
                    <p>{label}</p>
                  </div>
                  <div className="cu-pipe-logo">
                    <img src={`${TC}${logo}`} alt="" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cu-decide">
        <div className="cu-container cu-decide-inner">
          <div className="cu-decide-copy">
            <h2 className="cu-h2">Can’t decide if {BRAND} is right for your business?</h2>
            <p>You don’t have to figure it out alone. Book a free session and we’ll walk you through exactly why businesses choose us.</p>
            <a className="cu-btn" href="#form">Book a call</a>
          </div>
          <div className="cu-decide-visual">
            <img className="cu-decide-grid" src={`${TC}cta-grid.svg`} alt="" aria-hidden="true" />
            <img className="cu-decide-img" src={`${TC}cta-img.svg`} alt="" />
          </div>
        </div>
      </section>

    </div>
    {footer}
    </>
  )
}
