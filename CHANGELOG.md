# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.4.0] - 2026-02-13

### Added
- `organon suggest` — suggest automation tier upgrades for manual protocols
- `organon release` — version bump, changelog, git tag, and GitHub release from CLI
- **Placeholder detection gate** (advisory) — detects uncustomized template placeholders like `[Describe what your project does]`
- **References gate** (blocking) — validates `inherits_from`, `related_domains`, `related_features`, workflow `loads:` and `protocol_file` paths
- **Version alignment gate** (advisory) — checks `methodology_version` in config matches CLI version
- Project name auto-detection during `organon init` (reads `package.json`, `Cargo.toml`, or directory name)
- Pre-existing skill detection during `organon init` — warns about skills without `protocol_id` bindings
- Config directory walking — all commands now find `organon.config.json` by walking up from cwd (no more `--project-root ../..`)
- `testGlobs` and `testIgnorePatterns` fields in generated `organon.config.json`
- Content-aware field recommendations — only warns about missing `principles_count` when file has `## Principles` section
- **Agent methodology onboarding** (Issue #3):
  - `organon/PRIMER.md` generated during init — condensed methodology primer (~1500 tokens)
  - `organon/methodology-reference.md` generated during init — detailed reference (~3600 tokens)
  - Enriched `CLAUDE.md` template with methodology context, verify failure guidance, and first-session setup checklist
  - Methodology context preambles added to all 5 generated skill templates

### Changed
- Token estimate tolerance tightened from 100% to 50% (warns on 1.5x+ deviation instead of 2x+)
- Allow `tools: []` for agent-tier workflows (`automation_tier: agent` or `tools: ["none"]`)
- Health score now includes placeholder penalty (-5 per file, capped at -20)
- All CLI commands use `resolveProjectRoot()` for automatic config discovery

### Fixed
- Validator no longer warns about `principles_count` when the file has no `## Principles` section

## [0.3.0] - 2026-02-13

### Added
- `organon init` — scaffold new projects with config, organon files, and Claude Code skills
- `organon upgrade` — detect version drift and incrementally update projects
- `@organon-methodology/testing` — semantic testing framework for tier-4 invariant verification
  - 7 assertion functions: `assertMaxValue`, `assertNoSideEffects`, `assertFileExists`, `assertNaming`, `assertDependency`, `assertCustom`, `testInvariant`
  - `organon generate-tests` CLI for scaffolding invariant tests from ETHOS.md
  - Vitest adapter with `testInvariant` helper
- `tier4-tests` verification gate for invariant coverage tracking
- Parallel file scanning across all verification gates
- Version alignment validation between CLI, config, and methodology
- npm publishing infrastructure: CI workflow, release workflow, release script
- MCP server dynamic version from package.json

### Changed
- Verification gates now run with parallel file scanning for improved performance
- Health score calculation includes invariant coverage metrics
- Cross-platform `clean` scripts (Node.js rmSync instead of `rm -rf`)

### Fixed
- `organon verify` no longer scans `node_modules/` directories
- Workspace dependency syntax uses `"*"` (npm) instead of `"workspace:*"` (pnpm)
