---
kind: build_system
name: Vite + React SPA Build & Vercel Deployment
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.js
    - vercel.json
    - index.html
    - pnpm-workspace.yaml
    - scripts/qa-screenshots.mjs
---

This project is a single-page application built with Vite and React, producing a static dist/ bundle deployed to Vercel. The build system is intentionally minimal — there are no Makefiles, Dockerfiles, or CI pipelines in the repository. All build orchestration lives in three files:

### Build toolchain
- Vite 5 (vite.config.js) with the official @vitejs/plugin-react. Configured as an SPA (appType: 'spa'). The dev server ignores qa-*.html files so that QA screenshot helpers writing temporary HTML do not trigger full-page reloads.
- pnpm workspaces (pnpm-workspace.yaml) is present but only contains a placeholder allowBuilds.esbuild flag; this repo is a flat single-package project (no workspace packages).
- Node ESM ("type": "module") throughout — all scripts and config use native ES modules.

### Scripts
Three npm scripts in package.json cover the lifecycle:
- pnpm dev -> vite (HMR dev server on port 4713)
- pnpm build -> vite build (production asset pipeline into dist/)
- pnpm preview -> vite preview (serve dist/ locally)

No lint, test, or type-check steps are wired in.

### Static assets & entry
- index.html is the Vite HTML entry; it mounts <div id="root"> and loads /src/main.jsx as a module script.
- All images, fonts, videos, and brand assets live under public/assets/ and are served verbatim by Vite/Vercel without bundling.

### Runtime routing for SPA hosting
vercel.json rewrites every non-assets/ request back to /index.html, enabling client-side routing on Vercel's static hosting.

### Visual-QA / screenshot harness
The scripts/ directory holds Node/Electron-style Puppeteer scripts (qa-screenshots.mjs, capture-endcard.mjs, check-services.mjs, check-eloqwnt-parity.mjs) that launch headless Chrome against the local dev server, scroll through the page at fixed percentages, capture JPEG screenshots, and log console/page errors. These are developer-only tools used during iteration; they are not part of the production build.

### What is NOT present
- No CI configuration (.github/workflows, GitHub Actions, etc.)
- No containerization (Dockerfile, .dockerignore)
- No Makefile or shell-based build wrappers
- No versioning strategy beyond a static "version": "1.0.0" in package.json
- No separate staging/prod environments — Vercel handles deployment via the vercel.json rewrite rule

### Conventions for developers
- Add new pages/components under src/; Vite will pick them up automatically.
- Place large media assets in public/assets/<category>/ so they bypass bundling.
- If you add client-side routes, keep the Vercel rewrite in vercel.json unchanged.
- Use pnpm dev for development; pnpm build produces the deployable artifact.