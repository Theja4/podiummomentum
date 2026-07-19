---
kind: external_dependency
name: Aidesigner MCP server
slug: aidesigner
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

### Aidesigner
- HTTP MCP endpoint registered at `https://api.aidesigner.ai/api/v1/mcp`; used by the local MCP client to drive design-related tooling.
- Artifacts generated under `.aidesigner/` are gitignored except `.gitkeep`.