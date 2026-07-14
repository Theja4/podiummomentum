import React, { useEffect, useRef, useState } from 'react'
import ClientLogo from './ClientLogo.jsx'

const TC = '/assets/tc-contact/'
const A = '/assets/'
const BRAND = 'Podium Momentum'
const CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/xojgvvjv'

// Same client logos used on the landing page.
const clientLogos = ['a9cc6fba12268e37', '43201ae504d0ad9f', 'cfecff048b60daa1', 'baa053d3454375d0', 'd2c8ca3a50aba890', 'ab3a9a6cf9778c11', '9a6b3e2b11136ee0', 'c90888271d904160', 'e72cc835698ff331']
const invertInDark = new Set(['d2c8ca3a50aba890', 'e72cc835698ff331'])

const expectItems = [
  ['icon-website.svg', 'Website Performance Reality Check', 'We’ll walk through your current site and identify what’s not working.'],
  ['icon-case.svg', 'Case Studies From Your Space', 'See before-and-after transformations from similar companies.'],
  ['icon-timeline.svg', 'Timeline & Investment Clarity', 'Get realistic timelines and a ballpark investment for your project.'],
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

// Randomly picked from the landing-page client logos (accuracy isn't the point here).
const pipeline = [
  ['80%', 'Increase in demo requests', 'a9cc6fba12268e37'],
  ['60%', 'Increase in organic traffic', 'cfecff048b60daa1'],
  ['35%', 'Increase in clicks and impressions', 'ab3a9a6cf9778c11'],
  ['30%', 'Increase in demo requests', 'c90888271d904160'],
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

const budgetOptions = [
  { value: '$0 to $5k', label: '$0 to $5k', hint: 'Getting started' },
  { value: '$5k to $15k', label: '$5k to $15k', hint: 'Focused build' },
  { value: '$15k to $25k', label: '$15k to $25k', hint: 'Growth project' },
  { value: '$25k to $50k', label: '$25k to $50k', hint: 'Full engagement' },
]

function BudgetDropdown({ value, onChange, hasError }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  // -1 means no option is keyboard-active; nothing gets force-highlighted on open.
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef(null)
  const menuRef = useRef(null)
  const selected = budgetOptions.find(option => option.value === value)
  const selectedIndex = budgetOptions.findIndex(option => option.value === value)

  const updatePlacement = () => {
    const root = rootRef.current
    if (!root) return
    const trigger = root.querySelector('.cu-budget-trigger')
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const menuHeight = menuRef.current?.offsetHeight || 240
    const gap = 10
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const spaceAbove = rect.top - gap
    // Prefer down when it fits; flip up when bottom space is tight
    const shouldOpenUp = spaceBelow < menuHeight && spaceAbove > spaceBelow
    setOpenUp(shouldOpenUp)
    // Cap the menu to the space actually available so it never spills past the
    // viewport edge; it scrolls internally instead of getting clipped.
    const available = Math.max(shouldOpenUp ? spaceAbove : spaceBelow, 140)
    menuRef.current?.style.setProperty('--cu-menu-max', `${available}px`)
  }

  const openMenu = (next = true) => {
    if (next) {
      updatePlacement()
      setOpen(true)
      // Re-measure after paint so real menu height is used
      requestAnimationFrame(() => {
        updatePlacement()
      })
    } else {
      setOpen(false)
    }
  }

  useEffect(() => {
    const closeOnOutsideClick = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    updatePlacement()
    const onReposition = () => updatePlacement()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  const choose = index => {
    onChange(budgetOptions[index].value)
    setActiveIndex(index)
    setOpen(false)
    rootRef.current?.querySelector('.cu-budget-trigger')?.focus()
  }

  const onTriggerKeyDown = event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const selectedIndex = budgetOptions.findIndex(option => option.value === value)
      setActiveIndex(current => open
        ? (current + direction + budgetOptions.length) % budgetOptions.length
        : selectedIndex >= 0 ? selectedIndex : direction > 0 ? 0 : budgetOptions.length - 1)
      openMenu(true)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActiveIndex(event.key === 'Home' ? 0 : budgetOptions.length - 1)
      openMenu(true)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) choose(activeIndex)
      else {
        const selectedIndex = budgetOptions.findIndex(option => option.value === value)
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
        openMenu(true)
      }
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  const onOptionKeyDown = (event, index) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index + direction + budgetOptions.length) % budgetOptions.length)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActiveIndex(event.key === 'Home' ? 0 : budgetOptions.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      choose(index)
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      setOpen(false)
      if (event.key === 'Escape') {
        event.preventDefault()
        rootRef.current?.querySelector('.cu-budget-trigger')?.focus()
      }
    }
  }

  return (
    <div className={`cu-budget ${open ? 'is-open' : ''} ${openUp ? 'opens-up' : 'opens-down'}`} ref={rootRef}>
      <span className="cu-budget-label" id="budget-label">Budget range</span>
      <button
        className="cu-budget-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="budget-label budget-value"
        aria-controls="budget-options"
        aria-activedescendant={open ? `budget-option-${activeIndex}` : undefined}
        aria-invalid={hasError || undefined}
        onClick={() => { if (!open) setActiveIndex(selectedIndex); openMenu(!open) }}
        onKeyDown={onTriggerKeyDown}
      >
        <span id="budget-value" className={selected ? 'has-value' : ''}>{selected?.label || 'Select a range'}</span>
        <span className="cu-budget-arrow" aria-hidden="true">↓</span>
      </button>
      <div
        className="cu-budget-menu"
        id="budget-options"
        role="listbox"
        aria-labelledby="budget-label"
        ref={menuRef}
        onMouseLeave={() => setActiveIndex(selectedIndex)}
      >
        {budgetOptions.map((option, index) => (
          <button
            key={option.value}
            className={`cu-budget-option ${open && index === activeIndex ? 'is-active' : ''}`}
            id={`budget-option-${index}`}
            type="button"
            role="option"
            aria-selected={value === option.value}
            tabIndex={-1}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => choose(index)}
            onKeyDown={event => onOptionKeyDown(event, index)}
          >
            <span>{option.label}</span>
            <small>{option.hint}</small>
            <i aria-hidden="true">→</i>
          </button>
        ))}
      </div>
      {hasError && <span className="cu-budget-error" role="alert">Choose a budget range</span>}
    </div>
  )
}

function StrategySignal() {
  return (
    <div className="cu-success-visual" aria-hidden="true">
      <svg className="cu-success-signal" viewBox="0 0 560 250" fill="none">
        <defs>
          <linearGradient id="cu-signal-line" x1="70" y1="34" x2="480" y2="220" gradientUnits="userSpaceOnUse">
            <stop stopColor="#AFF9C9" stopOpacity=".16" />
            <stop offset=".48" stopColor="#67E0A3" />
            <stop offset="1" stopColor="#7CF0BD" stopOpacity=".12" />
          </linearGradient>
          <radialGradient id="cu-signal-core" cx="0" cy="0" r="1" gradientTransform="translate(280 125) rotate(90) scale(56)">
            <stop stopColor="#7CF0BD" stopOpacity=".32" />
            <stop offset="1" stopColor="#67E0A3" stopOpacity="0" />
          </radialGradient>
          <filter id="cu-signal-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feColorMatrix in="blur" values="0 0 0 0 0.404 0 0 0 0 0.878 0 0 0 0 0.639 0 0 0 .65 0" />
          </filter>
        </defs>

        <g className="cu-signal-grid">
          <path d="M44 70H516M44 125H516M44 180H516" />
          <path d="M120 35V215M200 35V215M280 35V215M360 35V215M440 35V215" />
        </g>

        <ellipse className="cu-signal-ring cu-signal-ring-outer" cx="280" cy="125" rx="176" ry="82" />
        <ellipse className="cu-signal-ring cu-signal-ring-inner" cx="280" cy="125" rx="116" ry="54" />
        <path className="cu-signal-route" d="M58 177C121 177 118 82 190 82C246 82 237 167 305 167C371 167 366 73 446 73C478 73 494 91 510 108" />
        <path className="cu-signal-flow" d="M58 177C121 177 118 82 190 82C246 82 237 167 305 167C371 167 366 73 446 73C478 73 494 91 510 108" />

        <g className="cu-signal-node cu-signal-node-one">
          <circle cx="104" cy="137" r="10" />
          <circle cx="104" cy="137" r="3" />
        </g>
        <g className="cu-signal-node cu-signal-node-two">
          <circle cx="190" cy="82" r="10" />
          <circle cx="190" cy="82" r="3" />
        </g>
        <g className="cu-signal-node cu-signal-node-three">
          <circle cx="446" cy="73" r="10" />
          <circle cx="446" cy="73" r="3" />
        </g>
        <g className="cu-signal-node cu-signal-node-four">
          <circle cx="475" cy="86" r="10" />
          <circle cx="475" cy="86" r="3" />
        </g>

        <circle className="cu-signal-halo" cx="280" cy="125" r="58" fill="url(#cu-signal-core)" />
        <circle className="cu-signal-core-glow" cx="280" cy="125" r="31" />
        <g className="cu-signal-core">
          <circle cx="280" cy="125" r="29" />
          <circle cx="280" cy="125" r="22" />
          <path d="M268.5 125.5L276.5 133.5L292.5 116.5" />
        </g>

        <g className="cu-signal-corners">
          <path d="M48 52V40H60M500 40H512V52M48 198V210H60M500 210H512V198" />
        </g>
      </svg>
      <span className="cu-success-badge">Interest confirmed</span>
    </div>
  )
}

function ContactForm() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [budget, setBudget] = useState('')
  const [budgetError, setBudgetError] = useState(false)
  const onSubmit = async e => {
    e.preventDefault()
    if (!budget) {
      setBudgetError(true)
      e.currentTarget.querySelector('.cu-budget-trigger')?.focus()
      return
    }

    const form = e.currentTarget
    setSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) throw new Error('Formspree rejected the submission')

      form.reset()
      setBudget('')
      setSent(true)
    } catch (error) {
      console.error('Contact form submission failed:', error)
      setSubmitError('We couldn’t send your request. Please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className={`cu-form-card ${sent ? 'is-sent' : ''}`} id="form">
      <div className="cu-form-intro">
        <div>
          <h2>Tell us what you’re building.</h2>
          <p>We’ll map the clearest next move in a 30-minute strategy session.</p>
        </div>
      </div>
      <div className="cu-form-stage">
        <form className="cu-form" onSubmit={onSubmit} aria-hidden={sent || undefined}>
          <input type="hidden" name="_subject" value="New strategy session request" />
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
            <input name="website" type="text" inputMode="url" placeholder="company.com" autoComplete="url" />
          </label>
          <label className="cu-form-message">
            <span>Describe what you are looking to achieve*</span>
            <textarea name="message" required rows={4} placeholder="Share the goal, the friction, and what success should look like." />
          </label>
          {submitError && (
            <p className="cu-form-status" id="contact-form-error" role="alert">
              {submitError}
            </p>
          )}
          <div className="cu-form-actions">
            <BudgetDropdown
              value={budget}
              hasError={budgetError}
              onChange={nextValue => {
                setBudget(nextValue)
                setBudgetError(false)
              }}
            />
            <input type="hidden" name="budget" value={budget} />
            <button
              className="cu-btn cu-form-submit"
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              aria-describedby={submitError ? 'contact-form-error' : undefined}
            >
              <span>{submitting ? 'Sending…' : 'Book the session'}</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </form>
        {sent && (
          <div className="cu-form-success" role="status" aria-live="polite">
            <StrategySignal />
            <div className="cu-success-copy">
              <h3>Thanks; you’re on the list.</h3>
              <p>We’ll reach out within one business day to lock your strategy session.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContactUs({ onNavigateHome, footer = null }) {
  useEffect(() => {
    document.title = `Book a Demo | ${BRAND}`
    document.body.classList.add('cu-active', 'page-loaded')
    document.documentElement.classList.add('motion-ready')
    window.scrollTo(0, 0)

    const nodes = [
      ...document.querySelectorAll('.cu-page [data-reveal], footer[data-reveal]'),
    ]
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' })
    nodes.forEach((n, i) => {
      n.style.setProperty('--reveal-order', i % 4)
      io.observe(n)
    })

    return () => {
      io.disconnect()
      document.body.classList.remove('cu-active')
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

      <section className="cu-hero" data-reveal="panel">
        <div className="cu-hero-bg" aria-hidden="true">
          <img className="cu-hero-gradient" src={`${TC}gradient-bg.svg`} alt="" />
          <img className="cu-hero-decor" src={`${TC}contact-bg-light.svg`} alt="" />
        </div>
        <div className="cu-container cu-hero-grid">
          <div className="cu-hero-left" data-reveal="up">
            <h1 className="cu-h2">Get a SaaS website that makes your product impossible to ignore</h1>

            <div className="cu-trust">
              <div className="cu-trust-top">
                <p className="cu-trust-title">Trusted by <span>40+</span> B2B Technology Companies</p>
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
                {clientLogos.slice(0, 8).map(id => (
                  <div className="cu-logo-cell" key={id}>
                    <ClientLogo src={`${A}${id}.avif`} alt="" className={invertInDark.has(id) ? 'cu-logo-invert' : ''} forceInvert={invertInDark.has(id)} />
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

          </div>

          <div className="cu-hero-right" data-reveal="card">
            <ContactForm />
          </div>
        </div>

        <div className="cu-container cu-expect-wrap">
          <section className="cu-expect" aria-labelledby="expect-title" data-reveal="panel">
            <div className="cu-expect-intro" data-reveal="up">
              <span className="cu-expect-kicker">Strategy session</span>
              <h2 className="cu-expect-title" id="expect-title">One clear<br /><span>next move.</span></h2>
              <p>Diagnose. Compare. Decide.</p>
              <div className="cu-expect-leave">
                <span aria-hidden="true">↗</span>
                <strong>A prioritized action plan</strong>
              </div>
            </div>

            <ol className="cu-expect-list">
              {expectItems.map(([icon, title, copy], index) => (
                <li className="cu-expect-item" data-reveal="card" key={title}>
                  <div className="cu-expect-bg-num" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="cu-expect-icon"><img src={`${TC}${icon}`} alt="" /></div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </section>
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
                    <ClientLogo src={`${A}${logo}.avif`} alt="" className={invertInDark.has(logo) ? 'cu-logo-invert' : ''} forceInvert={invertInDark.has(logo)} />
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
