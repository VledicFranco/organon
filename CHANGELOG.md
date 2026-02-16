# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Fix `FRONTMATTER_NAME_DIR_MISMATCH` false positives for files in collection/container directories (`organon/`, `observations/`, `rfcs/`, `book-llms/`, `protocols/`, `book-humans/`) — closes #11, #2
- `assertExportsPresent` now detects Scala 3 enum case members (`case Foo, Bar`) — closes #8
- Rename `AssertionError` → `OrganonAssertionError` to avoid shadowing `java.lang.AssertionError` — closes #9
- `tier4-tests` gate now recognizes Scala Maven import path (`io.github.vledicfranco.organon.testing`) — closes #10

## [0.5.1] - 2026-02-16

## [0.5.0] - 2026-02-16

### Added
- **`organon export`** — export organon knowledge graph as structured JSON classified by epistemic category (entities, assertions, relationships, rules)
- **`organon query --category`** — filter organon files by epistemic category (`constraint`, `assertion`, `rule`)
- `organon_export` MCP tool and `category` parameter on `organon_query` MCP tool
- Epistemic Categories section in three-layer-architecture.md formalizing the constraint/assertion/rule model
- Observation status lifecycle field (`signal | pattern | actionable | resolved`) in frontmatter spec
- Observation template in templates.md
- RFC 009: Epistemic Model & Knowledge Interoperability (implemented)
- `**/observations/*.md` and `**/rfcs/*.md` added to default organon globs (discovery now covers non-standard files)

### Fixed
- `inherits_from` names in export now resolve to actual entity IDs via name→ID lookup
- `decision_count` warning no longer fires on RFCs and observations (scoped to PHILOSOPHY.md only)
- RFC reference lookup now matches `NNN-slug` filenames (fixes false `BROKEN_RFC_REF` warning)
- Placeholder detection no longer triggers on documentation that quotes the placeholder pattern
- RFC 008 `token_estimate` corrected (2500→1200)

## [0.4.1] - 2026-02-16

### Added
- **Scala 3 testing library** (`packages/testing-scala/`) — port of @organon-methodology/testing with feature parity
  - 6 assertion functions: `assertMaxValue`, `assertNoSideEffects`, `assertFileExists`, `assertNamingConvention`, `assertExportsPresent`, `assertCustom`
  - `testInvariant` wrapper with invariant ID linking and registry
  - MUnit adapter (`OrganonSuite` trait)
  - FileSystem abstraction with os-lib implementation and in-memory test mock
  - Resolver layer: ParallelReader, GlobExpander, ValueResolver, ImportResolver, StringResolver, FileStemResolver
  - 66 tests passing
- Multi-language package organization (sbt project alongside npm workspaces)
- CI job for Scala tests (`test-scala` in GitHub Actions)
- Maven Central publishing via sbt-ci-release in release workflow
- INV-TEST-8 (language-parity) invariant in testing domain
- RFC 008: Scala 3 Testing Library & Multi-Language Package Strategy
- Scoped releases: `--scope tools|testing` flag in release script for individual package publishing
- Conditional CI publishing: tag prefix (`v*`, `tools-v*`, `testing-v*`) controls which packages are published

### Changed
- Release script (`scripts/release.mjs`) now bumps `packages/testing-scala/build.sbt` version
- Version alignment gate no longer warns on cross-package version mismatch (supports independent versioning)

### Fixed
- `discoverOrganonFiles` no longer produces false positives for root-path patterns (#6)

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
