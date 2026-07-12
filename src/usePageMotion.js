import { useEffect } from 'react'

/**
 * Shared Eloqwnt-style page motion:
 * - marks document ready for CSS entrance animations
 * - observes [data-reveal] nodes and toggles .is-inview
 */
export function usePageMotion(deps = [], rootSelector = null) {
  useEffect(() => {
    document.documentElement.classList.add('motion-ready')
    const raf = requestAnimationFrame(() => {
      document.body.classList.add('page-loaded')
    })

    const scope = rootSelector
      ? document.querySelector(rootSelector)
      : document
    if (!scope) {
      return () => cancelAnimationFrame(raf)
    }

    // Scope page content; always include shared footer chrome for route pages.
    const nodes = [
      ...scope.querySelectorAll('[data-reveal]'),
      ...document.querySelectorAll('footer[data-reveal]'),
    ]
    const unique = [...new Set(nodes)]
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    )

    unique.forEach((node, i) => {
      node.style.setProperty('--reveal-order', i % 5)
      io.observe(node)
    })

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Pure helper for tests: what selectors a page type should expose. */
export function expectedLandmarks(pageType) {
  const map = {
    home: ['#top', '#about', '#work', '#services', '#faq', 'footer'],
    servicesHub: ['.svc-page', '.svc-hub-hero', '.svc-hub-list', '.svc-featured', '.svc-partners', '.svc-expertise', '.svc-numbers', '.svc-testimonials', '.svc-hub-faq', '.svc-close', '.svc-contact-band'],
    serviceDetail: ['.svc-page', '.svc-detail-hero', '.svc-detail-intro', '.svc-stats', '.svc-caps', '.svc-process', '.svc-work-strip', '.svc-faq', '.svc-close'],
    industry: ['.ind-main', '.ind-hero-fs', '.ind-approach-grid', '.ind-exp-list', '.ind-work-list', '.ind-cta-band'],
    contact: ['.cu-page', '.cu-hero', '#form', 'footer'],
  }
  return map[pageType] || []
}
