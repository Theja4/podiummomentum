import { useEffect } from 'react'

const REDUCED_MOTION = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Split a plain-text element into per-word or per-letter spans, mirroring the
 * GSAP SplitText utilities the reference uses (words-slide-from-right /
 * letters-fade-in). Only touches leaf text nodes so headings with <br> or
 * nested markup are left untouched. Original text is stored so a route change
 * can restore and re-split cleanly.
 */
function splitElement(el) {
  if (el.dataset.splitDone) return
  // Refuse anything that isn't pure text (e.g. contains <br> or spans).
  if (el.children.length > 0) return
  const original = el.textContent
  if (!original || !original.trim()) return

  el.dataset.splitDone = '1'

  if (REDUCED_MOTION()) {
    el.classList.add('is-inview')
    return
  }

  el.dataset.splitOriginal = original
  const mode = el.getAttribute('data-split') === 'letters' ? 'letters' : 'words'
  const tokens = original.split(/(\s+)/)
  const frag = document.createDocumentFragment()
  let index = 0

  tokens.forEach(token => {
    if (token === '') return
    if (/^\s+$/.test(token)) {
      frag.appendChild(document.createTextNode(token))
      return
    }
    if (mode === 'letters') {
      const word = document.createElement('span')
      word.className = 'split-cword'
      for (const char of token) {
        const span = document.createElement('span')
        span.className = 'split-char'
        span.style.setProperty('--si', index++)
        span.textContent = char
        word.appendChild(span)
      }
      frag.appendChild(word)
    } else {
      const span = document.createElement('span')
      span.className = 'split-word'
      span.style.setProperty('--si', index++)
      span.textContent = token
      frag.appendChild(span)
    }
  })

  el.textContent = ''
  el.appendChild(frag)
}

function restoreElement(el) {
  if (!el.dataset.splitDone) return
  if (el.dataset.splitOriginal != null) el.textContent = el.dataset.splitOriginal
  delete el.dataset.splitDone
  delete el.dataset.splitOriginal
  el.classList.remove('is-inview')
}

/**
 * Shared Eloqwnt-style page motion:
 * - marks document ready for CSS entrance animations
 * - splits [data-split] text into word/letter spans
 * - observes [data-reveal] and [data-split] nodes and toggles .is-inview
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

    // Split headings/leads before observing so their spans exist when the
    // observer toggles .is-inview.
    const splitNodes = [...scope.querySelectorAll('[data-split]')]
    splitNodes.forEach(splitElement)

    // Scope page content; always include shared footer chrome for route pages.
    const nodes = [
      ...scope.querySelectorAll('[data-reveal]'),
      ...splitNodes,
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
      splitNodes.forEach(restoreElement)
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
