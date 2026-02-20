---
type: navigation
scope: product
name: book-humans
version: "2.0"
summary: Navigation for book-humans — philosophical book on LLM nature, best practices, and Organon derivation
token_estimate: 2100
provides: [table-of-contents, reading-guide, chapter-mapping]
parent: organon
audience: [human]
---

# Organon Book for Humans

**Status:** Planned — Outline restructured, content pending

A philosophical study of **LLM nature and best practices** that derives the Organon methodology as its logical conclusion. For anyone working with LLMs — not just Organon adopters. Complements the technical reference in [../book-llms/](../book-llms/).

---

## Reading Guide

The book follows a philosophical arc: **What are LLMs? → Best Practices → Methodology Derivation → Practical Implementation**. Start at the Preface to understand the book's perspective. Parts 1-2 require no prior Organon knowledge. Parts 3+ assume you've read Parts 1-2 or have external knowledge of documentation drift and methodology.

---

## Build System

The book is authored in Markdown and compiled to PDF via Pandoc + Typst.

### Building the Book

```bash
cd organon/book-humans
make build    # Compile all written chapters to PDF in ../../tmp/
make clean    # Remove built PDFs from ../../tmp/
make help     # Show build system help
```

**Output:** PDF file at `tmp/YYYYMMDD-book-humans.pdf` (timestamped with build date).

**Requirements:**
- `pandoc >= 3.1.8` — converts Markdown to Typst
- `typst >= 0.11` — renders Typst to PDF
- `python3` with PyYAML — parses chapter manifest

### Structure

| File | Purpose |
|------|---------|
| `_book.yaml` | Chapter manifest — ordered list of all chapters (source of truth for build order) |
| `Makefile` | Build procedures — `make build`, `make clean`, `make help` |
| `_build/metadata.yaml` | Pandoc book metadata (title, author, fonts, PDF engine settings) |
| `_build/template.typ` | Typst template (page layout, typography, heading styles, title page) |
| `00-preface.md` | First chapter — demonstrates frontmatter format for all chapters |
| `part-*/NN-*.md` | Chapter files in organized directories |

### Writing Chapters

See `../organon/domains/book-humans/` for authoring constraints and design philosophy:
- **ETHOS.md** — 5 invariants, 4 principles, 8-row decision heuristics
- **PHILOSOPHY.md** — Design decisions: why Markdown, why Typst, why manifest

See `../organon/protocols/PROTOCOLS.md` for two protocols:
- **PROTO-ORG-12** — Chapter Drafting (manual tier)
- **PROTO-ORG-13** — Book Compilation (semi-automated tier)

---

## Table of Contents

### Part 0: Preface

- **00-preface.md** — Who this book is for (anyone working with LLMs), what you'll learn (what LLMs are, how to work with them, why Organon follows), what this book is not (a tutorial; a pitch for Organon; a book for LLM developers)

### Part 1: LLM Nature

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 1 | `01-attention-field.md` | What an LLM actually is: probability fields over training data, no stable self beneath the context, the role of attention and learned priors |
| 2 | `02-persona-paradox.md` | The paradox of persona: behavioral specification vs. identity transplant, what a persona actually does, why the illusion of personhood is structural |
| 3 | `03-agreeableness-trap.md` | Why consensus is the weakest signal: RLHF-trained convergence, the Sanhedrin principle, how to engineer disagreement |
| 4 | `04-memory-ephemeral.md` | Context rot and the stateless mind: why memory is not lossless, how context degrades, why sessions are epistemically isolated |

### Part 2: LLM Best Practices

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 5 | `05-specification-problem.md` | The specification problem: why clarity is an epistemic act, Devin's 67%/70% split, how success is partly a property of the specification |
| 6 | `06-engineering-disagreement.md` | Structural dissent in multi-LLM systems: Independent Proposals, the designated contrarian, conviction logging, why disagreement is engineered not hoped for |
| 7 | `07-ephemeral-scaffolding.md` | External scaffolding for stateless minds: context loading strategies, session onboarding, progressive disclosure, token-efficient navigation |

### Part 3: The Derivation

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 8 | `08-documentation-drift.md` | Why traditional documentation fails: manual updates, drift, staleness, the real cost of outdated architecture docs — grounded in LLM nature |
| 9 | `09-organon-thesis.md` | The Organon bet: LLM-centric enforceable documentation that stays true by design, derived from understanding LLM nature |

### Part 4: Foundations

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 10 | `10-three-artifacts.md` | ETHOS, PHILOSOPHY, PROTOCOL — the three artifact types, their identity boundaries, and prioritized principles |
| 11 | `11-progressive-disclosure.md` | Frontmatter, layered access, and token-efficient navigation — how agents load only what they need |
| 12 | `12-scopes-and-inheritance.md` | The product → domain → feature hierarchy, inheritance rules, and when to create new scopes |

### Part 5: Enforcement

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 13 | `13-three-layer-architecture.md` | Protocols → workflows → tools: how the methodology becomes executable through the enforcement loop |
| 14 | `14-verification.md` | Testing tiers, CI gates, drift detection, staleness signals, and violation handling |
| 15 | `15-evolution.md` | RFC-driven evolution, the same-PR principle, and methodology scope |

### Part 6: Practice

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 16 | `16-getting-started.md` | Tutorial: your first organon — create an ETHOS.md, add frontmatter, run verification |
| 17 | `17-patterns-catalog.md` | Key patterns with worked examples: code mapping, context loading, enforcement loop |
| 18 | `18-anti-patterns.md` | Common mistakes and how to avoid them, drawn from real-world adoption |

### Part 7: At Scale

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 19 | `19-case-study.md` | Agent Tavern: a real-world Organon implementation walkthrough |
| 20 | `20-adopting-organon.md` | Migration strategy, team onboarding, version pinning for existing projects |

### Appendices

| Appendix | File | Contents |
|----------|------|----------|
| A | `a-template-library.md` | Copy-paste scaffolds for all artifact types |
| B | `b-frontmatter-reference.md` | Quick-reference schema for YAML frontmatter |
| C | `c-glossary.md` | Terms and definitions |

---

## Chapter-to-Source Mapping

Each chapter draws from specific sources:

| Chapter | Primary source(s) | Key concepts introduced |
|---------|-------------------|------------------------|
| 01 | Transformer architecture + attention theory | Probability fields, training data priors, the attention field |
| 02 | EXP-001 series, persona-design research (EMNLP 2024) | Behavioral specification, emergent identity, persona as CoT trigger |
| 03 | EXP-001 series, Sanhedrin principle | RLHF-trained agreeableness, the agreeableness ceiling, structural dissent |
| 04 | Context window literature, session empirical findings | Context as non-lossless, information degradation, epistemic isolation |
| 05 | Devin 2024 research, specification theory | Specification quality as success factor, prompt engineering as epistemology |
| 06 | EXP-001 series, safety engineering precedents (aviation CRM) | Independent Proposals, designated contrarian, conviction logging |
| 07 | organon patterns.md (Progressive Disclosure), argent-forge sessions | Context loading strategies, session onboarding, token efficiency |
| 08 | PHILOSOPHY.md (The Problem) | Documentation drift, staleness, grounded in LLM nature |
| 09 | PHILOSOPHY.md (The Bet) | LLM-centric design, enforcement through automation, methodology derivation |
| 10 | ETHOS.md (Structure Templates) | Three artifact types, identity boundaries, prioritized principles |
| 11 | patterns.md (Progressive Disclosure), frontmatter-system.md | Frontmatter, layered access, token efficiency |
| 12 | scopes.md | Scope hierarchy, inheritance rules, when to create scopes |
| 13 | three-layer-architecture.md (Layers 1-3) | Protocols, workflows, tools, universal contracts |
| 14 | three-layer-architecture.md (Verification) | Tier-4 tests, CI gates, drift detection, violation handling |
| 15 | patterns.md (RFC-Driven Evolution, Methodology Scope) | Organon evolution, same-PR principle |
| 16 | templates.md | Hands-on tutorial: create ETHOS.md, add frontmatter, verify |
| 17 | patterns.md (selected patterns) | Code mapping, context loading, enforcement loop |
| 18 | ETHOS.md + patterns.md (anti-patterns) | Common mistakes with fix guidance |
| 19 | Reference implementation sections | Agent Tavern walkthrough |
| 20 | patterns.md (Onboarding, Version Pinning) | Adoption strategy, migration |

---

## Differences from docs/ and book-llms/

`docs/` provides practical, task-oriented developer documentation (how to install, how to use the CLI, how to write organon files). `book-llms/` is the formal methodology specification. `book-humans/` is different — it's a philosophical study that starts with the nature of LLMs themselves, derives best practices from that understanding, and shows how Organon follows as the logical conclusion.

| Resource | Focus | Style | Audience |
|----------|-------|-------|----------|
| `docs/` | How to use Organon | Task-oriented, example-driven | Practitioners |
| `book-humans/` | What LLMs are → Best practices → Organon derivation | Philosophical, narrative | Anyone working with LLMs |
| `book-llms/` | Formal methodology spec | Technical reference, prescriptive | LLMs + advanced developers |

## Structure Comparison

| Aspect | book-llms/ | book-humans/ |
|--------|-----------|-------------|
| **Opening** | Invariants and constraints | LLM nature: what these systems actually are |
| **Arc** | Reference hierarchy | Philosophical journey: nature → practice → methodology |
| **Examples** | Code-heavy, schema-focused | Philosophy + narrative + empirical grounding |
| **Tone** | Prescriptive ("you must") | Explanatory ("here's why") |
| **Prerequisite knowledge** | Assumes understanding of docs drift | None — starts from LLM fundamentals |
| **Design philosophy** | "How to apply Organon" | "Why Organon makes sense for LLMs" |

---

## Directory Structure

```
book-humans/
├── README.md                          ← You are here
├── 00-preface.md
├── part-1-llm-nature/
│   ├── 01-attention-field.md
│   ├── 02-persona-paradox.md
│   ├── 03-agreeableness-trap.md
│   └── 04-memory-ephemeral.md
├── part-2-best-practices/
│   ├── 05-specification-problem.md
│   ├── 06-engineering-disagreement.md
│   └── 07-ephemeral-scaffolding.md
├── part-3-derivation/
│   ├── 08-documentation-drift.md
│   └── 09-organon-thesis.md
├── part-4-foundations/
│   ├── 10-three-artifacts.md
│   ├── 11-progressive-disclosure.md
│   └── 12-scopes-and-inheritance.md
├── part-5-enforcement/
│   ├── 13-three-layer-architecture.md
│   ├── 14-verification.md
│   └── 15-evolution.md
├── part-6-practice/
│   ├── 16-getting-started.md
│   ├── 17-patterns-catalog.md
│   └── 18-anti-patterns.md
├── part-7-at-scale/
│   ├── 19-case-study.md
│   └── 20-adopting-organon.md
└── appendices/
    ├── a-template-library.md
    ├── b-frontmatter-reference.md
    └── c-glossary.md
```

---

## Timeline

**Phase 1** (Q1 2026): Outline restructured (new LLM-nature-first arc), Chapter 1 draft
**Phase 2** (Q2 2026): Part 1-2 (Chapters 1-7, LLM nature + best practices)
**Phase 3** (Q3 2026): Part 3-5 (Chapters 8-15, Derivation + Enforcement)
**Phase 4** (Q4 2026): Part 6-7 + appendices (Chapters 16-20), editing, publication

## Contributing

Interested in helping write the human-friendly book? We're looking for:
- Technical writers
- Developers who've adopted Organon
- Illustrators (for diagrams)
- Early readers for feedback

Reach out: [VledicFranco/organon/issues](https://github.com/VledicFranco/organon/issues)

## License

MIT (same as book-llms/ and packages/)
