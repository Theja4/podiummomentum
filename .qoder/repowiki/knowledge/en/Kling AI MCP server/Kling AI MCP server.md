---
kind: external_dependency
name: Kling AI MCP server
slug: kling-ai
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

### Kling AI
- HTTP MCP endpoint registered at `https://kling.ai/mcp`; provides video-generation capabilities consumed by the local MCP client.
- Frames/screenshots from Kling runs live under `tmp/kling-frames/` (gitignored).