# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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
