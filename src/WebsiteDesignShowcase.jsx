import React, { useEffect, useRef } from 'react'
import './website-design-showcase.css'

const SHOWCASE_CARDS = [
  {
    eyebrow: 'Product clarity',
    title: 'Make complex products feel',
    accent: 'beautifully simple.',
    description:
      'We turn dense product stories into calm, intuitive journeys, then build every page to stay fast, responsive, and focused on the next action.',
    project: 'Finix Banking',
    meta: 'Fintech · Responsive · Conversion',
    style: {
      '--web-card-bg': '#eef6ff',
      '--web-card-accent': '#3f63df',
      '--web-card-index': 1,
    },
    video: '/assets/services/website-design-showcase/finix-banking.mp4',
    poster: '/assets/services/website-design-showcase/finix-banking-poster.jpg',
  },
  {
    eyebrow: 'Motion in production',
    title: 'Turn product value into a',
    accent: 'cinematic story.',
    description:
      'Purposeful pacing, expressive type, and product focused motion are implemented to guide attention without compromising responsiveness, accessibility, or speed.',
    project: 'X Trade',
    meta: 'Product story · Motion · Dark UI',
    style: {
      '--web-card-bg': '#fff1ea',
      '--web-card-accent': '#ba4c24',
      '--web-card-index': 2,
    },
    video: '/assets/services/website-design-showcase/trade-investing.mp4',
    poster: '/assets/services/website-design-showcase/trade-investing-poster.jpg',
  },
  {
    eyebrow: 'Scalable foundations',
    title: 'Give every page one',
    accent: 'unmistakable visual language.',
    description:
      'Flexible grids, reusable components, and a practical CMS keep large websites coherent while making future pages and campaigns easier to ship.',
    project: 'Wollo Analytics',
    meta: 'SaaS · Data · Visual system',
    style: {
      '--web-card-bg': '#fbfedf',
      '--web-card-accent': '#75851b',
      '--web-card-index': 3,
    },
    video: '/assets/services/website-design-showcase/wollo-analytics.mp4',
    poster: '/assets/services/website-design-showcase/wollo-analytics-poster.jpg',
  },
  {
    eyebrow: 'Interactive experience',
    title: 'Design moments people',
    accent: 'remember and return to.',
    description:
      'We blend brand, interface, and engineering into one living experience. It feels distinctive on the first visit, dependable on every device, and ready to evolve.',
    project: 'HackerRank AI',
    meta: 'Developer platform · Interactive · AI',
    style: {
      '--web-card-bg': '#fff0fa',
      '--web-card-accent': '#bd3d82',
      '--web-card-index': 4,
    },
    video: '/assets/services/website-design-showcase/hackerrank-ai.mp4',
    poster: '/assets/services/website-design-showcase/hackerrank-ai-poster.jpg',
  },
]

export function WebsiteDesignShowcase() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const videos = Array.from(section?.querySelectorAll('video') || [])
    if (!videos.length) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      videos.forEach(video => {
        if (reduceMotion) video.pause()
        else video.play().catch(() => {})
      })
      return undefined
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target
          if (entry.isIntersecting) video.play().catch(() => {})
          else video.pause()
        })
      },
      { threshold: 0.24, rootMargin: '10% 0px 10% 0px' },
    )

    videos.forEach(video => observer.observe(video))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="web-showcase" id="service-intro" ref={sectionRef} aria-labelledby="web-showcase-title">
      <div className="svc-container">
        <header className="web-showcase-intro">
          <h2 id="web-showcase-title" data-split="words">
            Websites that make the product impossible to ignore.
          </h2>
          <p data-reveal="up">
            Each website is created end to end. Strategy, story, visual system, implementation, and launch all work as one.
          </p>
        </header>

        <div className="web-showcase-stack" data-reveal-group="showcase">
          {SHOWCASE_CARDS.map((card, index) => (
            <article
              className="web-showcase-card"
              key={card.project}
              style={card.style}
              data-reveal="card"
            >
              <div className="web-showcase-copy">
                <div>
                  <div className="web-showcase-pill">
                    <span>{card.eyebrow}</span>
                    <i aria-hidden="true" />
                    <i aria-hidden="true" />
                    <i aria-hidden="true" />
                  </div>
                  <h3>
                    {card.title} <em>{card.accent}</em>
                  </h3>
                  <p>{card.description}</p>
                </div>

                <div className="web-showcase-card-footer">
                  <div>
                    <strong>{card.project}</strong>
                    <span>{card.meta}</span>
                  </div>
                  <span className="web-showcase-count">
                    {String(index + 1).padStart(2, '0')} / {String(SHOWCASE_CARDS.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div className="web-showcase-media">
                <video
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={card.poster}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <source src={card.video} type="video/mp4" />
                </video>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
