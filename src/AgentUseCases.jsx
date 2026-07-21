import React, { useEffect, useRef } from 'react'
import './agent-use-cases.css'

/**
 * AgentUseCases — Growth loop cards for the AI Agents page.
 * Outbound converts leads → Inbound books them → Reviews boost visibility → loop repeats.
 */

const LOOP_STEPS = [
  {
    id: 'outbound',
    icon: 'outbound',
    tag: 'Step 1 · Outbound',
    title: 'Convert leads before they go cold',
    body: 'Your agent pulls leads from your CRM, calls past patients and new enquiries, follows up, reminds them about their next visit, and gets them booked. No more leads sitting in a list going nowhere.',
    steps: ['Agent pulls leads from your CRM', 'Natural conversation, not a robocall', 'Books them in or warms them for your team'],
  },
  {
    id: 'inbound',
    icon: 'inbound',
    tag: 'Step 2 · Inbound',
    title: 'Catch every call, book every patient',
    body: 'When they call back, your agent picks up instantly. It pulls up their record from your CRM, answers questions, handles rescheduling, takes messages, and books appointments around the clock. Your front desk finally gets breathing room.',
    steps: ['Patient calls your clinic', 'AI pulls up their CRM record instantly', 'Books, answers, or routes to your team'],
  },
  {
    id: 'reviews',
    icon: 'reviews',
    tag: 'Step 3 · Review Engine',
    title: 'Turn happy patients into 5 star reviews',
    body: 'After their visit, your agent calls to ask how it went. If they had a great experience, it sends them a Google review link via SMS. More reviews, higher Google rating, stronger local search presence. And that Google visibility brings in the next wave of leads.',
    steps: ['Agent calls after their visit', 'Asks about the experience', 'Sends a Google review link via SMS'],
  },
]

function LoopIcon({ type }) {
  if (type === 'outbound') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <path d="M18 20c0-3.3 2.7-6 6-6s6 2.7 6 6v2c0 3.3-2.7 6-6 6s-6-2.7-6-6v-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 28v4m0 0c-4 0-7 1.5-7 4h14c0-2.5-3-4-7-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M33 15l3-3m0 0l3 3m-3-3v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === 'inbound') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
        <path d="M24 14v10l6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 32c2.5 2.5 5.5 4 9 4s6.5-1.5 9-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 18l-3-3m0 0l3-3m-3 3h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
      <path d="M24 15l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L24 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 35h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <path d="M34 20l2.5-1.5M35 25l3-.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

function LoopConnector() {
  return (
    <div className="auc-connector" aria-hidden="true">
      <svg viewBox="0 0 40 24" fill="none">
        <path d="M4 12h28m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function LoopCard({ item, index }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-inview')
        io.unobserve(el)
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <article
      className="auc-card"
      ref={ref}
      style={{ '--auc-i': index }}
      aria-labelledby={`auc-title-${item.id}`}
    >
      <div className="auc-card-glow" aria-hidden="true" />
      <div className="auc-card-inner">
        <div className="auc-icon-wrap">
          <LoopIcon type={item.icon} />
          <span className="auc-icon-pulse" aria-hidden="true" />
        </div>
        <span className="auc-tag">{item.tag}</span>
        <h3 id={`auc-title-${item.id}`}>{item.title}</h3>
        <p>{item.body}</p>
        <ol className="auc-steps">
          {item.steps.map((step, si) => (
            <li key={si} style={{ '--step-i': si }}>
              <span className="auc-step-dot" aria-hidden="true">{si + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}

export default function AgentUseCases() {
  return (
    <section className="auc-section" id="agent-use-cases" aria-labelledby="auc-heading" data-reveal="panel">
      <div className="auc-card-shell">
        <div className="auc-head">
          <span className="auc-eyebrow" data-reveal="up">The growth loop</span>
          <h2 id="auc-heading" data-reveal="line">One agent. Three moves. A loop that feeds itself.</h2>
          <p className="auc-sub" data-reveal="up">
            Outbound converts your leads. Inbound books them. The review engine turns happy patients into Google reviews that bring in the next wave. It never stops.
          </p>
        </div>

        <div className="auc-loop">
          {LOOP_STEPS.map((item, i) => (
            <React.Fragment key={item.id}>
              <LoopCard item={item} index={i} />
              {i < LOOP_STEPS.length - 1 && <LoopConnector />}
            </React.Fragment>
          ))}
        </div>

        <div className="auc-loop-return" data-reveal="up" aria-hidden="true">
          <svg viewBox="0 0 600 48" fill="none" preserveAspectRatio="none">
            <path d="M560 8c20 0 32 8 32 16s-12 16-32 16H40c-20 0-32-8-32-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 6" />
            <path d="M12 18l-4 6 4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="auc-loop-return-label">More reviews → higher Google ranking → more leads → loop repeats</span>
        </div>

        <div className="auc-result" data-reveal="up">
          <div className="auc-result-inner">
            <span className="auc-result-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p>
              <strong>The result:</strong> A self feeding growth engine. More bookings, happier patients, and a rising Google rating that pulls in new leads while you sleep.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
