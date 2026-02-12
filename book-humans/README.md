---
type: navigation
scope: product
name: book-humans
version: "1.0"
summary: Navigation for book-humans — narrative guide for human developers learning the Organon methodology
token_estimate: 1900
provides: [table-of-contents, reading-guide, chapter-mapping]
parent: organon
audience: [human]
---

# Organon Book for Humans

**Status:** Planned — Outline finalized, content pending

A narrative-focused introduction to the Organon Methodology for **human readers** — complementing the technical reference in [../book-llms/](../book-llms/).

---

## Reading Guide

The book follows a progressive arc: **Problem → Concept → Practice → Mastery**. Each chapter builds on the previous, but later chapters are designed to be useful standalone. Start at Chapter 1 if you're new; jump to Part 3 or 4 if you already understand the foundations.

---

## Table of Contents

### Preface

- **00-preface.md** — Who this book is for, what you'll learn, how it relates to book-llms/

### Part 1: Why

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 1 | `01-documentation-drift.md` | Why traditional documentation fails — manual updates, drift, staleness, and the real cost of outdated architecture docs |
| 2 | `02-organon-thesis.md` | The Organon bet: LLM-centric enforceable documentation that stays true by design |

### Part 2: Foundations

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 3 | `03-three-artifacts.md` | ETHOS, PHILOSOPHY, PROTOCOL — the three artifact types, their identity boundaries, and prioritized principles |
| 4 | `04-progressive-disclosure.md` | Frontmatter, layered access, and token-efficient navigation — how agents load only what they need |
| 5 | `05-scopes-and-inheritance.md` | The product → domain → feature hierarchy, inheritance rules, and when to create new scopes |

### Part 3: Enforcement

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 6 | `06-three-layer-architecture.md` | Protocols → workflows → tools: how the methodology becomes executable through the enforcement loop |
| 7 | `07-verification.md` | Testing tiers, CI gates, drift detection, staleness signals, and violation handling |
| 8 | `08-evolution.md` | RFC-driven evolution, the same-PR principle, and methodology scope |

### Part 4: Practice

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 9 | `09-getting-started.md` | Tutorial: your first organon — create an ETHOS.md, add frontmatter, run verification |
| 10 | `10-patterns-catalog.md` | Key patterns with worked examples: code mapping, context loading, enforcement loop |
| 11 | `11-anti-patterns.md` | Common mistakes and how to avoid them, drawn from real-world adoption |

### Part 5: At Scale

| Chapter | File | What you'll learn |
|---------|------|-------------------|
| 12 | `12-case-study.md` | Agent Tavern: a real-world Organon implementation walkthrough |
| 13 | `13-adopting-organon.md` | Migration strategy, team onboarding, version pinning for existing projects |

### Appendices

| Appendix | File | Contents |
|----------|------|----------|
| A | `a-template-library.md` | Copy-paste scaffolds for all artifact types |
| B | `b-frontmatter-reference.md` | Quick-reference schema for YAML frontmatter |
| C | `c-glossary.md` | Terms and definitions |

---

## Chapter-to-Source Mapping

Each chapter draws from specific book-llms/ sources:

| Chapter | Primary book-llms/ source | Key concepts introduced |
|---------|--------------------------|------------------------|
| 01 | PHILOSOPHY.md (The Problem) | Documentation drift, staleness, cost |
| 02 | PHILOSOPHY.md (The Bet) | LLM-centric design, enforcement through automation |
| 03 | ETHOS.md (Structure Templates) | Three artifact types, identity boundaries, prioritized principles |
| 04 | patterns.md (Progressive Disclosure), frontmatter-system.md | Frontmatter, layered access, token efficiency |
| 05 | scopes.md | Scope hierarchy, inheritance rules, when to create scopes |
| 06 | three-layer-architecture.md (Layers 1-3) | Protocols, workflows, tools, universal contracts |
| 07 | three-layer-architecture.md (Verification) | Tier-4 tests, CI gates, drift detection, violation handling |
| 08 | patterns.md (RFC-Driven Evolution, Methodology Scope) | Organon evolution, same-PR principle |
| 09 | templates.md | Hands-on tutorial: create ETHOS.md, add frontmatter, verify |
| 10 | patterns.md (selected patterns) | Code mapping, context loading, enforcement loop |
| 11 | ETHOS.md + patterns.md (anti-patterns) | Common mistakes with fix guidance |
| 12 | Reference implementation sections | Agent Tavern walkthrough |
| 13 | patterns.md (Onboarding, Version Pinning) | Adoption strategy, migration |

---

## Differences from docs/ and book-llms/

`docs/` provides practical, task-oriented developer documentation (how to install, how to use the CLI, how to write organon files). `book-humans/` is different — it's a philosophical narrative guide that explains *why* the methodology works, with progressive storytelling from problem to mastery.

| Resource | Focus | Style |
|----------|-------|-------|
| `docs/` | How to use Organon | Task-oriented, example-driven |
| `book-humans/` | Why Organon works | Narrative, story-driven |
| `book-llms/` | Formal methodology spec | Technical reference, prescriptive |

## Differences from book-llms/

| Aspect | book-llms/ | book-humans/ |
|--------|-----------|-------------|
| **Format** | Technical reference | Narrative guide |
| **Structure** | Invariants → Patterns → Templates | Problem → Concept → Practice → Mastery |
| **Examples** | Code-heavy, schema-focused | Story-driven, "imagine you're..." framing |
| **Tone** | Prescriptive | Explanatory |
| **Audience** | LLMs + advanced devs | All developers |
| **Chapters** | Flat files by concern | Progressive arc with parts |

---

## Directory Structure

```
book-humans/
├── README.md                          ← You are here
├── 00-preface.md
├── part-1-why/
│   ├── 01-documentation-drift.md
│   └── 02-organon-thesis.md
├── part-2-foundations/
│   ├── 03-three-artifacts.md
│   ├── 04-progressive-disclosure.md
│   └── 05-scopes-and-inheritance.md
├── part-3-enforcement/
│   ├── 06-three-layer-architecture.md
│   ├── 07-verification.md
│   └── 08-evolution.md
├── part-4-practice/
│   ├── 09-getting-started.md
│   ├── 10-patterns-catalog.md
│   └── 11-anti-patterns.md
├── part-5-at-scale/
│   ├── 12-case-study.md
│   └── 13-adopting-organon.md
└── appendices/
    ├── a-template-library.md
    ├── b-frontmatter-reference.md
    └── c-glossary.md
```

---

## Timeline

**Phase 1** (Q1 2026): Outline finalized, Chapter 1 draft
**Phase 2** (Q2 2026): Part 1-2 (Chapters 1-5)
**Phase 3** (Q3 2026): Part 3-4 (Chapters 6-11)
**Phase 4** (Q4 2026): Part 5, appendices, editing, publication

## Contributing

Interested in helping write the human-friendly book? We're looking for:
- Technical writers
- Developers who've adopted Organon
- Illustrators (for diagrams)
- Early readers for feedback

Reach out: [VledicFranco/organon/issues](https://github.com/VledicFranco/organon/issues)

## License

MIT (same as book-llms/ and packages/)
