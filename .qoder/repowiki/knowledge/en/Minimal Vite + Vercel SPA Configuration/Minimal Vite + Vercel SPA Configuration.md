---
kind: configuration_system
name: Minimal Vite + Vercel SPA Configuration
category: configuration_system
scope:
    - '**'
source_files:
    - vite.config.js
    - package.json
    - vercel.json
---

This repository is a single-page React application with no dedicated runtime configuration system. Build and deployment configuration is minimal and centralized in three files:

- vite.config.js — Defines the Vite build pipeline using @vitejs/plugin-react, sets appType to spa, and ignores qa-*.html files from dev-server watching to avoid unnecessary reloads during visual QA runs.
- package.json — Declares only the core dependencies (react, react-dom, three, vite, @vitejs/plugin-react) and exposes three scripts: dev, build, preview. No environment-specific script variants exist.
- vercel.json — Configures Vercel's SPA rewrites so all non-asset routes fall back to index.html, enabling client-side hash-based routing on static hosting.

There is no .env file committed (it is gitignored), no config/ directory, no feature-flag library, no runtime config loader, and no use of import.meta.env or process.env anywhere in the source. All site content (services, industries, projects, testimonials, copy) is hardcoded as JavaScript constants inside src/main.jsx and a few data modules (servicesData.js, industries.js, heroClientLogos.js). The app has no concept of per-environment overrides, secrets management, or remote configuration fetching.

Consequently, any configuration changes require editing source code directly and rebuilding.