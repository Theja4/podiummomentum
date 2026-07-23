# Build and Deployment

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [vite.config.js](file://vite.config.js)
- [vercel.json](file://vercel.json)
- [index.html](file://index.html)
- [README.md](file://README.md)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [scripts/capture-endcard.mjs](file://scripts/capture-endcard.mjs)
- [scripts/check-eloqwnt-parity.mjs](file://scripts/check-eloqwnt-parity.mjs)
- [scripts/check-services.mjs](file://scripts/check-services.mjs)
- [scripts/qa-screenshots.mjs](file://scripts/qa-screenshots.mjs)
</cite>

## Update Summary
**Changes Made**
- Updated dependency management section to reflect pnpm adoption with pnpm-lock.yaml (712 lines) and pnpm-workspace.yaml configuration
- Enhanced build process documentation to include core-js build permissions and improved dependency resolution
- Updated package scripts section to document pnpm-specific workflows and enhanced dependency management
- Added comprehensive coverage of pnpm workspace configuration for better dependency isolation and build performance
- Maintained existing structure while incorporating infrastructure improvements for enhanced build processes

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document provides comprehensive build and deployment guidance for the PodiumMinds application. It covers Vite build configuration, optimization settings, plugin usage, bundle analysis, and end-to-end deployment to Vercel including environment configuration, custom domains, and CI/CD pipelines. The project now utilizes pnpm for enhanced dependency management with improved build permissions and workspace configuration. It also documents QA scripts for testing, screenshot capture, and quality assurance, along with performance optimization strategies and production best practices.

## Project Structure
The repository follows a standard Vite + React layout with enhanced dependency management through pnpm and additional tooling for QA and deployment:
- Root configuration files define build and deployment behavior through Vite and Vercel configurations.
- Source code resides under src/, organized by feature and assets.
- Static assets are served from public/.
- Scripts under scripts/ support QA workflows such as screenshots and parity checks.
- pnpm workspace configuration enables enhanced dependency management and build performance.
- Vercel deployment is configured via vercel.json.

```mermaid
graph TB
A["Repository Root"] --> B["src/ (React source)"]
A --> C["public/ (static assets)"]
A --> D["scripts/ (QA utilities)"]
A --> E["vite.config.js (build config)"]
A --> F["vercel.json (deployment config)"]
A --> G["index.html (entry HTML)"]
A --> H["package.json (dependencies & scripts)"]
A --> I["pnpm-lock.yaml (dependency lock)"]
A --> J["pnpm-workspace.yaml (workspace config)"]
```

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

## Core Components
- Build system: Vite with a dedicated configuration file for optimizations and plugins.
- Dependency management: pnpm with enhanced workspace configuration and improved build permissions.
- Entry point: index.html bootstraps the React app.
- Deployment target: Vercel, configured via vercel.json.
- QA tooling: Node scripts for automated testing, screenshot capture, and content parity checks.

Key responsibilities:
- vite.config.js defines build targets, optimization flags, plugins, and output behavior.
- vercel.json controls serverless routing, headers, rewrites, and environment variable mapping.
- package.json centralizes dependency management and exposes npm/pnpm scripts for local dev, build, and QA tasks.
- pnpm-lock.yaml ensures consistent dependency resolution across environments.
- pnpm-workspace.yaml configures workspace-level dependency management and build permissions.
- index.html initializes the client-side app and references the built entry.

**Section sources**
- [vite.config.js](file://vite.config.js)
- [vercel.json](file://vercel.json)
- [package.json](file://package.json)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [index.html](file://index.html)

## Architecture Overview
The application uses a static-site architecture powered by Vite and deployed to Vercel's edge network. The build pipeline leverages pnpm for enhanced dependency management with improved build permissions, compiles and optimizes assets, while Vercel serves the resulting static files globally. QA scripts run locally or in CI to validate UI and content consistency.

```mermaid
graph TB
Dev["Developer Machine"] --> |pnpm install| Pnpm["pnpm Dependency Manager"]
Pnpm --> |Enhanced Permissions| Cache["Improved Build Cache"]
Dev --> |pnpm build| Vite["Vite Build Pipeline"]
Vite --> Dist["dist/ Output"]
Dist --> Vercel["Vercel Platform"]
Vercel --> CDN["Global Edge Cache"]
User["End Users"] --> CDN
QA["QA Scripts"] --> |Run locally or in CI| Vite
```

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

## Detailed Component Analysis

### Vite Build Configuration
The build configuration centralizes optimization and plugin setup. Typical areas covered include:
- Build targets and minification settings
- Asset handling and image optimization
- Code splitting and chunk naming
- Plugins for CSS processing, fonts, and asset optimization
- Environment variables injection into the client bundle
- Bundle analysis integration (e.g., rollup-plugin-visualizer)

Recommended checklist:
- Ensure production builds enable minification and tree-shaking.
- Configure asset preloading and prefetching where appropriate.
- Use deterministic chunk names for long-term caching.
- Inject only necessary environment variables to the client.
- Integrate a visualizer to analyze bundle composition during builds.

**Section sources**
- [vite.config.js](file://vite.config.js)

### Enhanced Dependency Management with pnpm
**Updated** The project now utilizes pnpm for enhanced dependency management with significant improvements:

- **pnpm-lock.yaml**: Comprehensive dependency lock file (712 lines) ensuring consistent dependency resolution across all environments
- **pnpm-workspace.yaml**: Workspace configuration enabling enhanced dependency isolation and improved build performance
- **Build Permissions**: Improved core-js build permissions preventing permission-related build failures
- **Dependency Resolution**: Faster and more reliable dependency installation with content-addressable storage

Key benefits:
- Deterministic builds through strict dependency locking
- Improved disk space efficiency with hard links and symlinks
- Enhanced security with isolated node_modules structure
- Better performance with parallel dependency installation
- Workspace-level configuration for consistent development experience

**Section sources**
- [pnpm-lock.yaml](file://pnpm-lock.yaml)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [package.json](file://package.json)

### Vercel Deployment Configuration
Deployment is driven by vercel.json, which typically includes:
- Rewrites and redirects for SPA routing
- Headers for security, caching, and performance
- Build command overrides if needed
- Environment variable mappings for runtime use
- Framework detection and output directory targeting

Best practices:
- Define explicit rewrites for client-side routes.
- Set cache-control headers for static assets and API responses.
- Keep build commands minimal; rely on Vercel's framework detection when possible.
- Map environment variables securely through Vercel's dashboard or CI secrets.

**Section sources**
- [vercel.json](file://vercel.json)

### Package Scripts and Workflows
**Updated** package.json should expose scripts optimized for pnpm workflows:
- Development server with hot reload
- Production build with enhanced dependency resolution
- Linting and type checks
- QA tasks (screenshots, parity checks)
- Optional bundle analysis
- pnpm-specific commands for workspace operations

Example script categories:
- dev: Start local development server with pnpm
- build: Run optimized production build with enhanced dependency management
- preview: Preview production build locally
- lint/typecheck: Quality gates before build
- qa:*: Screenshot capture and content validation
- install: pnpm-specific dependency installation with improved permissions

Ensure consistent lockfiles and install commands across environments using pnpm's deterministic dependency resolution.

**Section sources**
- [package.json](file://package.json)

### QA Scripts
The scripts directory contains Node-based utilities for QA:
- capture-endcard.mjs: Captures end-card visuals for review
- check-eloqwnt-parity.mjs: Validates fidelity against reference designs
- check-services.mjs: Verifies services page content and links
- qa-screenshots.mjs: Orchestrates full-page or section screenshots

Usage patterns:
- Run locally after building to validate UI changes
- Integrate into CI to enforce visual regression and content parity
- Generate artifacts for review and audit trails

Operational notes:
- Pin browser versions for reproducible screenshots
- Use headless execution in CI
- Store screenshots deterministically and diff against baselines

**Section sources**
- [scripts/capture-endcard.mjs](file://scripts/capture-endcard.mjs)
- [scripts/check-eloqwnt-parity.mjs](file://scripts/check-eloqwnt-parity.mjs)
- [scripts/check-services.mjs](file://scripts/check-services.mjs)
- [scripts/qa-screenshots.mjs](file://scripts/qa-screenshots.mjs)

### Application Entry Point
index.html initializes the React application and loads the built entry. Ensure:
- Correct base path for deployments under subpaths
- Proper meta tags for SEO and social sharing
- Minimal inline code to reduce initial payload

**Section sources**
- [index.html](file://index.html)

### Configuration Management Approach
**Updated** The project now uses a streamlined configuration approach with enhanced dependency management:
- **vite.config.js**: Centralized build configuration, optimization settings, and plugin management
- **vercel.json**: Deployment-specific settings, routing rules, and environment variable mapping
- **package.json**: Dependency management and script definitions optimized for pnpm
- **pnpm-lock.yaml**: Comprehensive dependency lock ensuring consistent builds across environments
- **pnpm-workspace.yaml**: Workspace configuration for enhanced dependency isolation and build permissions
- **Environment variables**: Managed through .env files for local development and Vercel's dashboard for production

This approach eliminates external YAML dependencies while maintaining clear separation between build-time and runtime configuration, with enhanced reliability through pnpm's deterministic dependency management.

**Section sources**
- [vite.config.js](file://vite.config.js)
- [vercel.json](file://vercel.json)
- [package.json](file://package.json)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)

## Dependency Analysis
At a high level:
- Vite orchestrates the build and development experience.
- pnpm manages dependencies with enhanced permissions and workspace configuration.
- React powers the UI layer.
- Vercel hosts and serves the final static output.
- QA scripts depend on Node.js and may use headless browsers or HTTP clients.

```mermaid
graph LR
Pkg["package.json"] --> PnpmCfg["pnpm-workspace.yaml"]
PnpmCfg --> LockFile["pnpm-lock.yaml"]
LockFile --> ViteCfg["vite.config.js"]
ViteCfg --> Build["Build Artifacts"]
Build --> VercelCfg["vercel.json"]
VercelCfg --> Deploy["Vercel Deployment"]
Pkg --> Scripts["QA Scripts"]
Scripts --> Build
```

**Diagram sources**
- [package.json](file://package.json)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)
- [vite.config.js](file://vite.config.js)
- [vercel.json](file://vercel.json)

**Section sources**
- [package.json](file://package.json)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)
- [vite.config.js](file://vite.config.js)
- [vercel.json](file://vercel.json)

## Performance Considerations
Optimization strategies:
- Enable production minification and dead-code elimination.
- Configure code splitting at route or component boundaries.
- Preload critical resources and defer non-critical ones.
- Optimize images and fonts; consider next-gen formats.
- Use deterministic filenames for long-term caching.
- Analyze bundle size regularly and remove unused dependencies.
- Prefer lazy loading for heavy components and media.
- Leverage pnpm's faster dependency installation and reduced disk usage.

Bundle analysis:
- Integrate a visualizer to identify large modules and vendor bloat.
- Track trends over time to prevent regressions.
- Focus on reducing first-contentful paint and total blocking time.

Caching and delivery:
- Leverage Vercel's global edge cache.
- Set appropriate cache-control headers for immutable assets.
- Use CDN-friendly URLs and avoid query strings for static assets.
- Utilize pnpm's content-addressable storage for faster rebuilds.

**Updated** With pnpm adoption:
- Faster dependency installation through parallel downloads and content-addressable storage
- Reduced disk space usage through hard links and symlinks
- Improved build performance with enhanced caching mechanisms
- More reliable dependency resolution eliminating version conflicts

## Troubleshooting Guide
Common issues and resolutions:
- Missing environment variables: Ensure they are set in Vercel's dashboard or CI secrets and mapped in vercel.json if required.
- SPA routing errors: Verify rewrites in vercel.json to direct unknown routes to the index file.
- Asset 404s: Confirm base path and public folder usage; ensure paths match build output.
- Large bundles: Use bundle analysis to locate oversized dependencies and replace with lighter alternatives.
- Inconsistent screenshots: Pin browser versions and viewport sizes; run in headless mode in CI.
- Build failures: Validate Node version compatibility and lockfile integrity; clear caches between runs.
- Dependency conflicts: Clear pnpm store and reinstall dependencies using `pnpm install --frozen-lockfile`

Environment configuration:
- Separate client and server variables; only inject what the client needs.
- Use .env files for local development and platform-specific secret managers for production.
- Avoid committing secrets; prefer CI/CD secret stores.

**Updated** With pnpm infrastructure improvements:
- Permission issues: Ensure proper core-js build permissions are configured in workspace settings
- Dependency resolution: Use `pnpm install --frozen-lockfile` to maintain consistent dependency trees
- Cache problems: Clear pnpm cache with `pnpm store prune` if experiencing stale dependency issues
- Workspace configuration: Verify pnpm-workspace.yaml settings for proper dependency isolation

**Section sources**
- [vercel.json](file://vercel.json)
- [package.json](file://package.json)
- [pnpm-lock.yaml](file://pnpm-lock.yaml)
- [pnpm-workspace.yaml](file://pnpm-workspace.yaml)

## Conclusion
By centralizing build configuration in Vite, implementing enhanced dependency management through pnpm with improved build permissions and workspace configuration, enforcing quality with QA scripts, and deploying to Vercel with explicit configuration, the PodiumMinds application achieves a reliable, performant, and maintainable delivery pipeline. The adoption of pnpm provides significant improvements in build performance, dependency resolution reliability, and disk space efficiency. Regular bundle analysis, strict environment management, and CI-integrated QA will keep the product stable and fast as it evolves.

## Appendices

### Build and Deployment Checklist
- Local development:
  - Install dependencies with pnpm and start dev server
  - Verify hot reload and environment variables
  - Confirm pnpm workspace configuration is working correctly
- Pre-build:
  - Run linters and type checks
  - Execute QA scripts locally
  - Validate dependency lock file integrity
- Build:
  - Produce optimized artifacts with enhanced dependency resolution
  - Inspect bundle report
  - Verify build permissions are properly configured
- Deploy:
  - Push to main branch or trigger CI
  - Verify environment variables and domain settings
  - Post-deploy smoke tests and screenshot diffs

### Environment Variables
- Client-only variables must be explicitly exposed to the browser by the build tool.
- Server-only variables should never be injected into the client bundle.
- Use distinct values per environment (dev, staging, prod).
- All environment configuration is managed through .env files for local development and Vercel's dashboard for production environments.

### Custom Domain Setup (Vercel)
- Add a custom domain in the Vercel dashboard.
- Configure DNS records as instructed by Vercel.
- Enable HTTPS and verify propagation.
- Test rewrites and headers on the live domain.

### CI/CD Pipelines
- Trigger builds on pull requests and merges.
- Cache pnpm dependencies to speed up builds.
- Use `pnpm install --frozen-lockfile` for consistent dependency resolution.
- Run QA scripts and fail the pipeline on regressions.
- Promote builds to production via approvals or branch rules.

### Configuration File Reference
**Updated** Current configuration files and their purposes:
- **vite.config.js**: Build configuration, optimization settings, plugins, and bundling options
- **vercel.json**: Deployment configuration, routing rules, headers, and environment variable mapping
- **package.json**: Dependencies, scripts, and project metadata optimized for pnpm
- **pnpm-lock.yaml**: Comprehensive dependency lock file ensuring consistent builds across environments
- **pnpm-workspace.yaml**: Workspace configuration for enhanced dependency isolation and build permissions
- **.env files**: Local development environment variables (not committed to version control)
- **index.html**: Application entry point and HTML template

### pnpm Migration Guide
**New** For teams migrating to pnpm:
- Replace `npm install` with `pnpm install`
- Use `pnpm-lock.yaml` instead of `package-lock.json`
- Configure workspace settings in `pnpm-workspace.yaml`
- Leverage pnpm's enhanced dependency resolution and build permissions
- Update CI/CD pipelines to use pnpm commands
- Utilize `--frozen-lockfile` flag for consistent dependency resolution in CI