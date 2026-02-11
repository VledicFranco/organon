---
type: navigation
scope: product
name: organon-self-governance
version: "1.0"
summary: Navigation for the Organon project's own organon hierarchy — self-governance constraints and protocols
token_estimate: 250
provides: [project-ethos, development-protocols]
parent: organon-root
---

# Organon Self-Governance

This project's own organon hierarchy. The Organon methodology dogfoods itself — these files formalize the constraints and protocols that govern development of the methodology specification and tooling.

## Contents

| Path | Type | Description |
|------|------|-------------|
| [ETHOS.md](./ETHOS.md) | constraints | Project-level invariants with stable IDs (INV-ORG-1 through INV-ORG-6) |
| [protocols/](./protocols/) | procedures | Development protocols backing the 7 workflow bindings |

## Relationship to CLAUDE.md

`CLAUDE.md` is the agent-facing entry point (read first, always loaded). This ETHOS.md formalizes the same invariants with stable IDs for machine traceability. The two must stay in sync — CLAUDE.md is the authoritative source, ETHOS.md adds IDs and enforcement mechanisms.

## Relationship to book-llms/

`book-llms/` defines the methodology specification (meta-scope). This directory applies that methodology to *this project* (product-scope). The meta-organon constrains how organons are written; this organon constrains how *this particular project* operates.
