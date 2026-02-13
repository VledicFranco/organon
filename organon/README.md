---
type: navigation
scope: product
name: organon-self-governance
version: "1.2"
summary: Navigation for the Organon project's own organon hierarchy — self-governance constraints, protocols, domains, and observations
token_estimate: 300
provides: [project-ethos, development-protocols]
parent: organon-root
---

# Organon Self-Governance

This project's own organon hierarchy. The Organon methodology dogfoods itself — these files formalize the constraints and protocols that govern development of the methodology specification and tooling.

## Contents

| Path | Type | Description |
|------|------|-------------|
| [ETHOS.md](./ETHOS.md) | constraints | Project-level invariants with stable IDs (INV-ORG-1 through INV-ORG-6) |
| [protocols/](./protocols/) | procedures | Development protocols (11 protocols, 9 with workflow bindings) |
| [domains/](./domains/) | scopes | Bounded contexts — product domains with their own organon files |
| [observations/](./observations/) | observation | Empirical observations from dogfooding and real work sessions |

## Domains

| Domain | Purpose | Status |
|--------|---------|--------|
| [tools](./domains/tools/) | CLI and MCP server — verification, generation, discovery | Active |
| [testing](./domains/testing/) | Semantic testing framework for tier-4 invariant verification | Created (RFC 001) |

## Relationship to CLAUDE.md

`CLAUDE.md` is the agent-facing entry point (read first, always loaded). This ETHOS.md formalizes the same invariants with stable IDs for machine traceability. The two must stay in sync — CLAUDE.md is the authoritative source, ETHOS.md adds IDs and enforcement mechanisms.

## Relationship to book-llms/

`book-llms/` defines the methodology specification (meta-scope). This directory applies that methodology to *this project* (product-scope). The meta-organon constrains how organons are written; this organon constrains how *this particular project* operates.

## Relationship to packages/

All organon files (ETHOS.md, PHILOSOPHY.md) live here at the project level under `domains/`. The `packages/` directory contains only implementation code — no organon governance files.
