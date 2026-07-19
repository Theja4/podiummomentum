---
kind: external_dependency
name: Vercel deployment platform
slug: vercel
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

### Vercel
- Deployment target: SPA rewrites configured in `vercel.json` route all non-asset paths to `/index.html`, enabling client-side routing.
- Build pipeline: `vite build` output (`dist/`) is ignored; Vercel runs the same scripts declared in `package.json`.
- Direction: deploy artifacts are produced locally via `pnpm build` and pushed to origin/main.