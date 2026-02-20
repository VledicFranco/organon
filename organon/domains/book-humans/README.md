---
type: navigation
scope: domain
domain: book-humans
version: "1.0"
summary: Navigation for book-humans domain — philosophical book on LLM nature, best practices, and Organon derivation methodology
token_estimate: 150
provides: [domain-governance, authoring-constraints, design-philosophy]
parent: organon
related_files:
  - ETHOS.md
  - PHILOSOPHY.md
  - ../../book-humans/README.md
audience: [llm, human]
---

# book-humans Domain

Governance and authoring constraints for the **book-humans** project — the philosophical book on LLM nature, best practices, and the Organon methodology derivation.

## Quick Reference

| File | Purpose |
|------|---------|
| **ETHOS.md** | Authoring constraints, 5 invariants, 4 principles, 8-row decision heuristics |
| **PHILOSOPHY.md** | Design rationale — why Markdown, why Typst, why manifest, why frontmatter |
| `../../book-humans/README.md` | Book TOC, structure, and reading guide |
| `../../book-humans/Makefile` | Build system — `make build` to compile |
| `../../book-humans/_book.yaml` | Chapter manifest (source of truth for chapter order) |

## Build System

```bash
cd organon/book-humans
make build    # Compile all written chapters to PDF in ../../tmp/
make clean    # Remove built PDFs from ../../tmp/
make help     # Show build options
```

Output goes to `../../tmp/YYYYMMDD-book-humans.pdf` (timestamped).

## Key Protocols

- **PROTO-ORG-12**: Chapter Drafting (manual tier) — author a new chapter with correct frontmatter
- **PROTO-ORG-13**: Book Compilation (semi-automated tier) — compile the book to PDF

See `../protocols/PROTOCOLS.md` for full procedures.

## Scope

This domain governs **content creation** for the book-humans project, not the book's technical infrastructure (Makefile, Typst template, metadata). Infrastructure changes are handled at the product level; content authoring is scoped here.

## For Authors

Start here if you're drafting a chapter:

1. Read **ETHOS.md** to understand authoring constraints
2. Read **PHILOSOPHY.md** to understand design decisions
3. Follow **PROTO-ORG-12** (Chapter Drafting) for the procedure
4. See `../../book-humans/README.md` for the chapter list and structure

## For LLMs

Load this README first, then ETHOS.md to understand governance. Load PHILOSOPHY.md if you need to make decisions about chapter structure, formatting, or sourcing.
