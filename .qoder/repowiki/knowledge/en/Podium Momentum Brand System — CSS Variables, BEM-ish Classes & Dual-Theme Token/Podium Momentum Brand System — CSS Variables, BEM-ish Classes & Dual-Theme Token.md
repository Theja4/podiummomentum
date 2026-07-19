---
kind: frontend_style
name: Podium Momentum Brand System — CSS Variables, BEM-ish Classes & Dual-Theme Tokens
category: frontend_style
scope:
    - '**'
source_files:
    - src/styles.css
    - src/landing/tokens.css
    - src/button-system.css
    - src/main.jsx
---

## What system/approach is used

The site uses a **pure-CSS design-token + component-class approach** with no CSS-in-JS, Tailwind, or SCSS preprocessor. Styling is split across:

- A single large `src/styles.css` that defines the global token layer, layout primitives, and every page section (hero, work, services, testimonials, contact, footer).
- A dedicated landing revamp under `src/landing/tokens.css` that re-declares a scoped `.pm2` token set for full-bleed dark sections.
- A final authority file `src/button-system.css` that normalizes every button-like control across routes.
- Route-scoped stylesheets imported from `src/main.jsx`: `contact-us.css`, `industry.css`, `services-pages.css`, plus polish files (`header-polish.css`, `footer-redesign.css`, `enterprise-sharpness.css`, `solution-section.css`, `section-card-motion.css`, `button-bubble.css`).

There is **no build-time CSS processor** — Vite just bundles the plain CSS files in import order.

## Key files and packages

- `src/styles.css` — root tokens, typography, layout, all page sections, light/dark theme overrides, motion primitives.
- `src/landing/tokens.css` — `.pm2` scoped token palette and landing-only atoms (`.pm2-pill`, `.pm2-rise`, `.pm2-kicker`).
- `src/button-system.css` — canonical interaction system for `.pill`, `.cu-btn`, `.submit`, `.menu`, `.who-play`, etc.
- `src/main.jsx` — central CSS import manifest; also drives `motion-ready` / `page-loaded` / `pm2-active` body classes.
- `public/fonts/MazzardM-{Regular,Medium,SemiBold}.ttf` — custom Mazzard font declared via `@font-face`.

## Architecture and conventions

### Design tokens (CSS custom properties)

Two parallel token sets coexist:

| Layer | Scope | Prefix | Examples |
|-------|-------|--------|----------|
| Global brand | `:root` | `--ink`, `--paper`, `--ice`, `--emerald`, `--aquamarine`, `--celadon`, `--brand-forest`, `--btn-*` | Mint/emerald ramp over near-black |
| Landing revamp | `.pm2` | `--v-black`, `--v-core`, `--v-bright`, `--v-glow`, `--v-haze`, `--v-pale`, `--v-ease`, `--v-font` | Same palette, scoped to prevent bleed into shared header/footer |

Tokens are consumed everywhere via `var(--name)` — no hardcoded colors in component rules beyond fallbacks.

### Theme strategy

- Light mode is default; `html[data-theme="dark"]` flips the entire palette by redefining the same `:root` variables.
- The landing route toggles `body.pm2-active` to force a full-bleed dark run and override the shared footer's card treatment.
- `prefers-reduced-motion: reduce` blocks all transitions/animations globally.

### Class naming

BEM-ish, descriptive class names without a framework:

- Layout shells: `.hero`, `.panel`, `.clients`, `.services`, `.contact-panel`, `.testimonial-track`, `.marquee`, `.project`.
- Component variants: `.pill-light`, `.pill-dark`, `.pm2-pill--solid`, `.pm2-pill--ghost`.
- State hooks driven by JS: `.is-inview`, `.is-open`, `.is-started`, `.is-playing`, `.header-hidden`, `.header-scrolled`, `.motion-ready`, `.page-loaded`, `.pm2-active`.

### Motion model

A lightweight reveal system lives entirely in CSS, triggered by IntersectionObserver in React:

- `[data-reveal="up"|"line"|"scale"|"panel"|"service"|"card"]` selectors define initial hidden states.
- `.motion-ready [data-reveal].is-inview` applies opacity/transform/clip-path transitions with stagger via `--delay` / `--reveal-order` CSS vars.
- Shared cubic-bezier `cubic-bezier(0.16, 1, 0.3, 1)` is reused as `--v-ease` / `--pm-btn-ease`.

### Button system contract

`src/button-system.css` is loaded last so it wins specificity wars against older fidelity sheets. It enforces:

- One pill geometry (`min-height: 3.15rem`, `border-radius: 999px`) for `.pill`, `.cu-btn`, `.submit`, `.choices button`, `.menu`, `.who-play`, `.subscribe-action`, `.track-control button`, `.tcx-btn`, etc.
- A left-to-right brand-wipe hover using an absolutely positioned pseudo-layer (`::before` or `.pill-wipe`).
- A unified `outline: 3px solid var(--pm-btn-aqua)` focus-visible ring.
- Final contrast guarantees under `#root` that disable decorative wipes when they would break legibility.

### Responsive strategy

- Fluid type via `calc()` breakpoints on `html { font-size }` plus `clamp()` inside components.
- Single breakpoint at `max-width: 900px` (mobile/tablet) where grids collapse to 1 column, nav becomes a slide-out drawer, and hero switches to a natural vertical stack.
- The landing's mobile hero is fully owned under one `@media(max-width:900px)` block with explicit comments calling it the "single source of truth."

### Asset & font handling

- Custom Mazzard font loaded from `/fonts/` via `@font-face` with `font-display: swap`.
- All images/SVGs live under `public/assets/` and are referenced through a `const A = '/assets/'` constant in JSX.

## Rules developers should follow

1. **Never hard-code brand colors.** Use `--emerald`, `--aquamarine`, `--celadon`, `--brand-forest`, `--ink`, `--paper`, `--ice` (or their `--v-*` equivalents inside `.pm2`).
2. **Use the token-driven button classes.** New interactive controls should adopt `.pill` (+ `-light` / `-dark`) or `.cu-btn` / `.submit`; do not invent new button shapes.
3. **Animate with the reveal primitives.** Add `data-reveal="up"|"line"|"scale"|"panel"` and let the existing CSS handle the transition; only toggle `.is-inview` via IntersectionObserver.
4. **Respect the 900px breakpoint.** Mobile layouts should be written under `@media(max-width:900px)` and avoid duplicating desktop rules.
5. **Keep motion respectful.** Wrap any new animation in a `prefers-reduced-motion` guard; the site already has blanket suppression.
6. **Do not fight `button-system.css`.** If a component looks wrong on some route, fix it by adding a more specific selector rather than overriding the canonical file.
7. **Landing-only styles stay under `.pm2`.** Do not leak `.pm2` tokens into global scope; use them only inside the landing route wrapper.
