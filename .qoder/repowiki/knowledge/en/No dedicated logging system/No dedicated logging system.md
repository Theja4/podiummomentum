---
kind: logging_system
name: No dedicated logging system
category: logging_system
scope:
    - '**'
---

This repository does not implement a logging system. The application is a Vite + React single-page site with no server-side runtime, and the codebase contains no structured logging framework (no Winston, Pino, Bunyan, loglevel, Sentry, Datadog, etc.). Logging is limited to ad-hoc `console.error` / `console.warn` calls in a few components (e.g., ContactUs.jsx, Beyond.jsx, main.jsx) for error reporting during development. There are no log levels, structured fields, sinks, or centralized logger configuration anywhere in the project.