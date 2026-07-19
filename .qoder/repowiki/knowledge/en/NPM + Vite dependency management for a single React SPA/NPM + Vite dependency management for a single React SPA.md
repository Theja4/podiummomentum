---
kind: dependency_management
name: NPM + Vite dependency management for a single React SPA
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - pnpm-workspace.yaml
---

This repository manages dependencies as a single NPM project built with Vite and React. The approach is straightforward: one `package.json` declares runtime and dev dependencies, and a `package-lock.json` lockfile pins the full transitive tree for reproducible installs.

**System / toolchain**
- Package manager: **NPM** (lockfile version 3). A `pnpm-workspace.yaml` exists at the root but contains only a placeholder `allowBuilds` key and no workspace packages; it has no effect on resolution here.
- Build tool: **Vite 5** (`vite`, `@vitejs/plugin-react`) drives both development and production builds.
- Runtime: **React 18** (`react`, `react-dom`).
- Optional runtime dep: **three.js** (`^0.185.1`) for 3D visuals.
- Dev-only dep: **puppeteer-core** (`^25.3.0`) used by scripts under `scripts/` and `tmp/` for screenshot/QA automation.

**Key files**
- `package.json` — sole manifest declaring `dependencies` and `devDependencies`; also defines `dev`, `build`, `preview` scripts that delegate to Vite.
- `package-lock.json` — generated lockfile (v3) pinning every installed package and its integrity hash; committed to the repo so CI and teammates resolve an identical tree.
- `pnpm-workspace.yaml` — present but unused as a workspace; effectively ignored by NPM.
- `node_modules/` — local install directory (not committed).
- `dist/` — Vite build output (static assets deployed to Vercel via `vercel.json`).

**Architecture & conventions**
- Single-package layout: no monorepo or sub-packages; all code lives under `src/` and depends on the flat `node_modules` tree.
- Versioning style mixes exact versions (`"4.3.4"`, `"18.3.1"`, `"5.4.11"`) for core tooling with caret ranges (`"^0.185.1"`, `"^25.3.0"`) for optional/dev deps, letting minor/patch updates flow automatically while keeping the build stack pinned.
- No vendoring strategy (no `vendor/`, no `yarn.lock`/`pnpm-lock.yaml` usage); relies entirely on the npm registry plus the committed lockfile.
- No private registry, `.npmrc`, or scoped-auth configuration is present — all packages are pulled from the public npm registry.

**Rules developers should follow**
- Add new packages through NPM (`npm i <pkg>` / `npm i -D <pkg>`) so the lockfile stays in sync; do not edit `package-lock.json` by hand.
- Keep `package.json` as the single source of truth for dependency declarations; avoid ad-hoc `require('path/to/node_modules/...')` imports.
- Prefer exact versions for framework/build-tool deps (`vite`, `@vitejs/plugin-react`, `react`, `react-dom`) to keep the build deterministic; use caret ranges only for optional or dev-only packages.
- Do not commit `node_modules/`; rely on the lockfile for reproducible installs in CI and local dev.