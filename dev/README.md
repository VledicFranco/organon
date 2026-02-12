---
type: navigation
scope: product
name: organon-tools-dev
version: "1.0"
summary: Development documentation — design ideas, RFCs, and future work for organon-tools
token_estimate: 150
provides: [design-docs, rfcs, tool-ideas]
parent: organon-tools
---

# Organon Tools Development

> Design documentation, RFCs, and future work.

This directory contains pre-implementation design work and ideas for organon-tools evolution.

---

## Contents

- **[tool-ideas.md](./tool-ideas.md)** — Brainstormed tools for project adoption (initialization, testing framework, discovery, CI/CD integration)
- **[TEMPLATE-design-doc.md](./TEMPLATE-design-doc.md)** — Template for new design documents

---

## Status

| Document | Status | Next Action |
|----------|--------|-------------|
| tool-ideas.md | Draft | Prioritize and create RFCs for Phase 1 tools |

---

## How to Use This Directory

1. **Brainstorming** → Create a design doc using the template
2. **Design refinement** → Iterate on the design with stakeholders
3. **RFC (if needed)** → Convert mature designs to formal RFCs in `organon/methodology/rfcs/`
4. **Implementation** → Once approved, implement in `src/`
5. **Archive** → Mark design doc as implemented and reference the PR

---

## Contribution Guidelines

- Use the design doc template for consistency
- Include frontmatter with proper token estimates
- Reference related ETHOS.md and PHILOSOPHY.md invariants
- Link to related book-llms/ methodology docs where applicable
