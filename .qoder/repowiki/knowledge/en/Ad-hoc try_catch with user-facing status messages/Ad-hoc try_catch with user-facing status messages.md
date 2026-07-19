---
kind: error_handling
name: Ad-hoc try/catch with user-facing status messages
category: error_handling
scope:
    - '**'
source_files:
    - src/contactForm.js
    - src/ContactUs.jsx
    - src/main.jsx
    - src/IndustryPage.jsx
---

This Vite + React SPA has no centralized error-handling framework, custom error types, or global boundary. Errors are handled locally and informally:

- Network / API errors: `src/contactForm.js` throws a plain `Error('Formspree rejected the submission')` when `response.ok` is false; `src/ContactUs.jsx` catches it in an `async onSubmit`, logs via `console.error`, sets a friendly `submitError` state string, and renders it inside a `<p>` with `role="alert"` and `aria-live="polite"`. Success/failure are also reflected on the submit button (`is-sent`, `is-error` classes) and `disabled` state.
- Browser-API failures (video autoplay): `main.jsx` calls `video.play()` and attaches `.catch(() => {})` to swallow autoplay-rejection promises, falling back to muted play or leaving the video paused — no user-visible feedback beyond the mute/play controls already present.
- Promise cleanup in lazy-loaded assets: `IndustryPage.jsx` guards against unhandled rejections by attaching empty `.catch(() => {})` to dynamically created promises before awaiting them.
- Defensive try/catch blocks around DOM operations (e.g., `ClientLogo.jsx`, `Beyond.jsx`) catch exceptions silently so a single asset or layout glitch does not crash the page.

There is no `ErrorBoundary` component, no `window.onerror` / `unhandledrejection` listener, no logging SDK, and no shared error-code taxonomy. Each feature owns its own local `try/catch` and decides whether to surface a message to the user or suppress it.