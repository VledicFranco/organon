---
type: rationale
scope: product
name: rfc-007-v040-release
version: "1.0"
summary: v0.4.0 release — init/verify polish, new verification gates, CLI ergonomics
token_estimate: 1200
status: implementing
author: Claude Opus 4.6
created: 2026-02-13
---

# RFC 007: v0.4.0 — Init/Verify Polish, New Gates, CLI Ergonomics

## Problem Statement

RFC 006 delivered `organon init` and `organon upgrade`, and v0.3.0 was published to npm. Real-world usage (GitHub Issue #2 from argent-forge) exposed 5 friction points in the init-to-first-green-health experience. Additionally, three verification gaps and four CLI ergonomic issues were identified during release planning.

## Proposed Solution

Consolidate 12 improvements into a coordinated v0.4.0 release across 3 phases:

### Phase 1: Init & Verify Polish (Issue #2)
- **A1:** Infer project name during init (package.json → Cargo.toml → directory basename)
- **A2:** Template placeholder detection gate (advisory, penalizes health score)
- **A3:** Pre-existing skill detection during init (info diagnostics for unbound skills)
- **A4:** Allow `tools: []` for agent-tier workflows (`automation_tier: agent`)
- **A5:** Content-aware field recommendations (only warn about missing counts when section exists)

### Phase 2: New Verification Gates
- **B1:** References gate (blocking) — validates `inherits_from`, `related_domains`, workflow `loads:`, `protocol_file`
- **B2:** Version alignment gate (advisory) — checks methodology_version drift and monorepo sync
- **B3:** Tighten token estimate tolerance from 100% to 50%

### Phase 3: CLI Ergonomics
- **C1:** Config directory walking (`findProjectRoot` walks up to `organon.config.json` or `.git`)
- **C2:** `testGlobs`/`testIgnorePatterns` in generated config template
- **C3:** Expose `organon suggest` CLI command
- **C4:** `organon release` CLI command (replaces `scripts/release.mjs`)

## Design Decisions

### 1. Advisory vs Blocking Gates
**Choice:** Placeholder detection and version alignment are advisory (always pass). References gate is blocking.
**Rationale:** Placeholders in a newly init'd project shouldn't prevent verification. Broken references indicate real structural issues.

### 2. Health Score Penalty vs Gate Failure
**Choice:** Placeholders reduce health score (-5 per file, capped at -20) rather than failing a gate.
**Rationale:** Graduated feedback is more useful than binary pass/fail for customization progress.

### 3. Directory Walking vs Config Flag
**Choice:** Walk up directories looking for `organon.config.json`, stopping at `.git`.
**Rationale:** Matches behavior users expect from tools like `eslint`, `prettier`, `cargo`.

## What We Are NOT Doing
- No interactive init wizard
- No auto-scaffolding protocol stubs for unbound skills
- No breaking CLI API changes
- No book-llms/ specification changes
