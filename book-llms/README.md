# Organon Book for LLMs

This directory contains the **technical reference** for the Organon Methodology, optimized for LLM consumption (Claude, GPT-4, etc.).

## Purpose

Organon is a documentation methodology that:
- Treats **code as the single source of truth**
- Uses **auto-generation** to prevent documentation drift
- Provides **dual mapping** (by layer + by feature) for flexible navigation
- Enforces **verification gates** to ensure freshness (<24 hours)

This book defines the patterns, templates, and protocols for implementing Organon in any codebase.

## Structure

- **[ETHOS.md](./ETHOS.md)** — Immutable invariants and guiding principles
- **[PHILOSOPHY.md](./PHILOSOPHY.md)** — Design decisions and trade-offs
- **[patterns.md](./patterns.md)** — Common patterns and anti-patterns
- **[scopes.md](./scopes.md)** — Scope hierarchy (product → domain → feature)
- **[templates.md](./templates.md)** — Templates for ETHOS.md, PHILOSOPHY.md, PROTOCOLS.md
- **[protocols/](./protocols/)** — Operational procedures (how to author, implement, verify)

## Audience

**Primary:** LLMs (Claude, GPT-4) implementing Organon in codebases

**Secondary:** Human developers who want technical depth

**For humans:** See [../book-humans/](../book-humans/) for narrative-focused introduction (planned)

## Quick Start for LLMs

When implementing Organon in a new codebase:

1. **Read ETHOS.md** — Understand core invariants
2. **Read patterns.md** — Learn common patterns
3. **Read templates.md** — Get ETHOS.md/PHILOSOPHY.md/PROTOCOLS.md templates
4. **Use organon-tools** — Auto-generate and verify organons

```bash
cd your-project
npx @organon/tools generate --all
npx @organon/tools verify
```

## Token Budget

Estimated token count per file (for LLM context loading):
- ETHOS.md: ~2,500 tokens
- PHILOSOPHY.md: ~3,000 tokens
- patterns.md: ~4,000 tokens
- scopes.md: ~2,000 tokens
- templates.md: ~2,500 tokens

**Total core content:** ~14,000 tokens (fits comfortably in most LLM contexts)

## Reference Implementation

[Agent Tavern](https://github.com/VledicFranco/agent-tavern) is the canonical implementation of Organon. See:
- `agent-tavern/organon/` — Full organon hierarchy
- `agent-tavern/organon/methodology/` — Methodology organons (meta-level)
- `agent-tavern/organon/domains/` — Domain organons (genesis, agents, quests, etc.)
- `agent-tavern/organon/features/` — Feature organons (tool-registry, context-management, etc.)

## Contributing

This book evolves with the methodology. Contributions should:
- Preserve invariants (ETHOS.md is immutable constraints)
- Add patterns based on real implementations
- Include examples from Agent Tavern
- Maintain LLM-optimized structure (clear sections, consistent formatting)

## License

MIT
