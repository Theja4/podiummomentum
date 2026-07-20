/*
 * Cursor-tracking radial fill behavior for button-shaped controls.
 *
 * A contrasting disc (`.pm-bubble`, styled in button-bubble.css) is placed at
 * the pointer entry point and scaled up until it floods the button; on leave
 * it re-centers on the exit point and collapses. Only `transform` transitions,
 * so re-centering between enter/leave is invisible while the disc covers the
 * button — the fill always grows from, and shrinks into, the cursor.
 *
 * Delegation lives on `document` so it survives client-side route changes and
 * covers portaled controls, without per-button listeners or React refs. The
 * `html.pm-bubble-fx` gate (and all CSS) stays off for touch/coarse pointers
 * and reduced-motion users, who keep the static brand hover states.
 */

const SELECTOR = [
  '.pill',
  '.pm2-pill',
  '.cu-btn',
  '.cu-nav-cta',
  '.submit',
  '.cu-brief-submit',
  '.mobile-nav-cta',
  '.header .nav > a',
  '.nav-dropdown-trigger',
  '.menu',
  '.subscribe-action',
  '.to-top',
  '.elo-footer-bottom > a',
  '.track-control button',
  '.svc-slider-controls button',
  '.svc-rail-controls button',
  '.pm2-carousel-nav button',
  '.svc-pill-link',
  '.svc-all-projects a',
  '.elo-contact-form button',
  '.tcx-btn',
  '.choices button'
].join(',')

const BUBBLE_CLASS = 'pm-bubble'
const ACTIVE_CLASS = 'pm-bubble-in'
const CONTENT_CLASS = 'pm-bubble-content'

function ensureBubble(btn) {
  const existing = btn.querySelector(`:scope > .${BUBBLE_CLASS}`)
  if (existing) return existing

  // Bare text nodes cannot be z-indexed above the disc, so wrap the content
  // once. React mutates its own text nodes in place, so moving them into a
  // wrapper span is safe for state-driven labels (e.g. the menu toggle).
  const hasBareText = Array.from(btn.childNodes).some(
    node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
  )
  if (hasBareText) {
    const content = document.createElement('span')
    content.className = CONTENT_CLASS
    while (btn.firstChild) content.appendChild(btn.firstChild)
    btn.appendChild(content)
  }

  const bubble = document.createElement('span')
  bubble.className = BUBBLE_CLASS
  bubble.setAttribute('aria-hidden', 'true')
  btn.appendChild(bubble)
  return bubble
}

function positionBubble(btn, bubble, event) {
  const rect = btn.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  // The disc must reach the farthest corner from the pointer point.
  const radius =
    Math.ceil(Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y))) + 1
  const size = radius * 2
  bubble.style.left = `${x}px`
  bubble.style.top = `${y}px`
  bubble.style.width = `${size}px`
  bubble.style.height = `${size}px`
}

export function installButtonBubble() {
  if (typeof window === 'undefined' || !window.matchMedia) return
  const rootEl = document.documentElement
  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const isEnabled = () => hoverable.matches && !reducedMotion.matches
  const syncFlag = () => rootEl.classList.toggle('pm-bubble-fx', isEnabled())
  syncFlag()
  hoverable.addEventListener('change', syncFlag)
  reducedMotion.addEventListener('change', syncFlag)

  document.addEventListener('pointerover', event => {
    if (!isEnabled()) return
    const btn =
      event.target instanceof Element ? event.target.closest(SELECTOR) : null
    if (!btn || (event.relatedTarget && btn.contains(event.relatedTarget))) return
    const bubble = ensureBubble(btn)
    positionBubble(btn, bubble, event)
    btn.classList.add(ACTIVE_CLASS)
  })

  document.addEventListener('pointerout', event => {
    if (!isEnabled()) return
    const btn =
      event.target instanceof Element ? event.target.closest(SELECTOR) : null
    if (!btn || (event.relatedTarget && btn.contains(event.relatedTarget))) return
    const bubble = btn.querySelector(`:scope > .${BUBBLE_CLASS}`)
    if (!bubble) return
    positionBubble(btn, bubble, event)
    btn.classList.remove(ACTIVE_CLASS)
  })
}
