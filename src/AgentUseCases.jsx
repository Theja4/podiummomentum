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

function CardArtwork({ type }) {
  if (type === 'outbound') {
    return (
      <div className="auc-artwork auc-artwork--outbound" aria-hidden="true">
        <svg viewBox="0 0 260 116" fill="none">
          <defs>
            <linearGradient id="auc-outbound-card" x1="18" y1="15" x2="100" y2="104" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#E1DBFF" />
            </linearGradient>
            <linearGradient id="auc-outbound-button" x1="151" y1="25" x2="229" y2="97" gradientUnits="userSpaceOnUse">
              <stop stopColor="#30206F" />
              <stop offset="1" stopColor="#7159E8" />
            </linearGradient>
          </defs>
          <rect x="8" y="11" width="94" height="94" rx="22" fill="url(#auc-outbound-card)" stroke="#CFC5FF" />
          <circle cx="37" cy="41" r="14" fill="#7357E8" />
          <circle cx="37" cy="37" r="4.5" fill="white" />
          <path d="M28.5 49c1.8-5.1 15.2-5.1 17 0" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <rect x="59" y="31" width="29" height="6" rx="3" fill="#8D79EB" opacity=".72" />
          <rect x="59" y="42" width="21" height="5" rx="2.5" fill="#B8ACEF" />
          <g className="auc-outbound-lead auc-outbound-lead--one">
            <rect x="21" y="67" width="67" height="19" rx="9.5" fill="white" />
            <circle cx="32" cy="76.5" r="4" fill="#FF8C6B" />
            <rect x="41" y="74" width="34" height="5" rx="2.5" fill="#B0A5DE" />
          </g>
          <path className="auc-outbound-route" d="M108 58C132 58 137 58 151 58" stroke="#7357E8" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 7" />
          <g className="auc-outbound-spark">
            <circle cx="129" cy="58" r="6" fill="#FF8C6B" />
            <path d="M126.5 58h5M129 55.5v5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <g className="auc-outbound-booking">
            <rect x="156" y="17" width="96" height="88" rx="22" fill="url(#auc-outbound-button)" />
            <rect x="174" y="34" width="60" height="53" rx="13" fill="white" />
            <path d="M174 48h60" stroke="#D7D0FF" strokeWidth="2" />
            <path d="M188 30v9M220 30v9" stroke="#FFAB77" strokeWidth="5" strokeLinecap="round" />
            <circle cx="204" cy="67" r="11" fill="#75DEA8" />
            <path className="auc-outbound-check" d="m198.5 67 4 4 7-8" stroke="#173C2A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    )
  }
  if (type === 'inbound') {
    return (
      <div className="auc-artwork auc-artwork--inbound" aria-hidden="true">
        <svg viewBox="0 0 260 116" fill="none">
          <defs>
            <linearGradient id="auc-inbound-panel" x1="12" y1="14" x2="240" y2="104" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#C9F2DE" />
            </linearGradient>
            <linearGradient id="auc-inbound-phone" x1="102" y1="25" x2="158" y2="89" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0B5A3A" />
              <stop offset="1" stopColor="#14A36B" />
            </linearGradient>
          </defs>
          <rect x="8" y="11" width="244" height="94" rx="24" fill="url(#auc-inbound-panel)" stroke="#B8E5CF" />
          <g className="auc-inbound-wave auc-inbound-wave--one">
            <rect x="27" y="46" width="6" height="24" rx="3" fill="#55C392" />
            <rect x="39" y="37" width="6" height="42" rx="3" fill="#159A62" />
            <rect x="51" y="43" width="6" height="30" rx="3" fill="#76D7AC" />
          </g>
          <path d="M67 58h26" stroke="#159A62" strokeWidth="3" strokeLinecap="round" />
          <path d="m87 51 7 7-7 7" stroke="#159A62" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <g className="auc-inbound-phone">
            <rect x="101" y="20" width="58" height="76" rx="18" fill="url(#auc-inbound-phone)" />
            <rect x="109" y="29" width="42" height="48" rx="11" fill="#E9FFF4" />
            <path d="M121 44c0 9 6 15 15 15" stroke="#159A62" strokeWidth="3" strokeLinecap="round" />
            <path d="M120 40c-2 0-4 1-4 3 0 11 9 20 20 20 2 0 3-2 3-4l-6-3-3 3c-5-2-8-5-10-10l3-3-3-6z" fill="#159A62" />
            <circle cx="130" cy="86" r="3" fill="#8DFFC3" />
          </g>
          <path d="M169 58h20" stroke="#159A62" strokeWidth="3" strokeLinecap="round" />
          <path d="m183 51 7 7-7 7" stroke="#159A62" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <g className="auc-inbound-calendar">
            <rect x="197" y="28" width="42" height="58" rx="12" fill="white" stroke="#A9DEC4" />
            <path d="M197 43h42" stroke="#C6E9D7" strokeWidth="2" />
            <path d="M208 25v8M228 25v8" stroke="#159A62" strokeWidth="4" strokeLinecap="round" />
            <path className="auc-inbound-check" d="m208 63 6 6 13-15" stroke="#159A62" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    )
  }
  return (
    <div className="auc-artwork auc-artwork--reviews" aria-hidden="true">
      <svg viewBox="0 0 260 116" fill="none">
        <defs>
          <linearGradient id="auc-review-panel" x1="15" y1="12" x2="247" y2="106" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFE0D0" />
          </linearGradient>
          <linearGradient id="auc-review-star" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFD34E" />
            <stop offset="1" stopColor="#FF8A3D" />
          </linearGradient>
        </defs>
        <rect x="8" y="11" width="244" height="94" rx="24" fill="url(#auc-review-panel)" stroke="#FFC8AC" />
        <g className="auc-review-score">
          <rect x="21" y="25" width="56" height="66" rx="18" fill="#85361F" />
          <text x="49" y="60" textAnchor="middle" fill="white" fontSize="24" fontWeight="700">5.0</text>
          <text x="49" y="75" textAnchor="middle" fill="#FFD6C5" fontSize="8" fontWeight="700" letterSpacing="1.4">RATING</text>
        </g>
        <g className="auc-review-stars">
          {[0, 1, 2, 3, 4].map((star) => (
            <path
              key={star}
              className="auc-review-star"
              style={{ '--star-i': star }}
              d={`M${101 + (star * 29)} 40l4.1 8.3 9.2 1.3-6.7 6.5 1.6 9.2-8.2-4.3-8.2 4.3 1.6-9.2-6.7-6.5 9.2-1.3L${101 + (star * 29)} 40z`}
              fill="url(#auc-review-star)"
            />
          ))}
        </g>
        <rect x="90" y="79" width="122" height="6" rx="3" fill="#EAAE91" opacity=".7" />
        <rect x="90" y="90" width="82" height="5" rx="2.5" fill="#F2C9B5" />
        <path className="auc-review-shine" d="M91 31 195 91" stroke="white" strokeWidth="12" strokeLinecap="round" opacity=".48" />
        <g className="auc-review-confetti" fill="#EE7040">
          <circle cx="230" cy="26" r="3" />
          <path d="m218 22 3-7 4 6-7 1z" fill="#7357E8" />
          <path d="m236 76 7 2-5 5-2-7z" fill="#159A62" />
        </g>
      </svg>
    </div>
  )
}

function LoopConnector() {
  return (
    <div className="auc-connector" aria-hidden="true">
      <svg viewBox="0 0 40 24" fill="none">
        <path className="auc-connector-path" d="M4 12h28m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      className={`auc-card auc-card--${item.id}`}
      ref={ref}
      style={{ '--auc-i': index }}
      aria-labelledby={`auc-title-${item.id}`}
    >
      <div className="auc-card-glow" aria-hidden="true" />
      <div className="auc-card-inner">
        <div className="auc-card-top">
          <CardArtwork type={item.icon} />
          <span className="auc-card-index" aria-hidden="true">0{index + 1}</span>
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
        <div className="auc-ambient" aria-hidden="true"><span /><span /></div>
        <div className="auc-head">
          <span className="auc-eyebrow" data-reveal="up">The growth loop</span>
          <h2 id="auc-heading" data-reveal="line">A loop that feeds itself.</h2>
          <p className="auc-sub" data-reveal="up">
            Outbound converts your leads. Inbound books them. The review engine turns happy customers into Google reviews that bring in the next wave. It never stops.
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
            <div className="auc-result-copy">
              <span className="auc-result-label">The result</span>
              <p>A self feeding growth engine. More bookings, happier patients, and a rising Google rating that pulls in new leads while you sleep.</p>
            </div>
            <ul className="auc-result-metrics" aria-label="Growth loop advantages">
              <li>Always on</li>
              <li>CRM connected</li>
              <li>Self feeding</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
