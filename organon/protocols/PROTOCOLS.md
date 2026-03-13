---
type: procedures
scope: product
name: protocols
version: "1.4"
summary: Eleven development protocols covering the 4-phase enforcement loop plus onboarding, publishing, and book authoring
token_estimate: 9000
protocols_count: 11
protocols:
  - id: PROTO-ORG-2
    name: Tool Development
    steps: 10
    automation_tier: automated
    workflow: organon-tools-developer
    tools: [organon-verify, npm-test]
    complexity: high
  - id: PROTO-ORG-3
    name: Methodology Evolution
    steps: 12
    automation_tier: automated
    workflow: methodology-spec-evolution
    tools: [organon-verify, organon-find, organon-health]
    complexity: high
  - id: PROTO-ORG-4
    name: Verification and Health
    steps: 5
    automation_tier: automated
    workflow: verify-and-health
    tools: [organon-verify, organon-health]
    complexity: low
  - id: PROTO-ORG-6
    name: Organon File Creation
    steps: 8
    automation_tier: automated
    workflow: organon-file-creation
    tools: [organon-generate, organon-validate, organon-verify]
    complexity: medium
  - id: PROTO-ORG-7
    name: Quality Review
    steps: 10
    automation_tier: automated
    workflow: quality-review
    tools: [organon-verify, organon-validate, organon-health]
    complexity: high
  - id: PROTO-ORG-8
    name: Project Initialization
    steps: 5
    automation_tier: semi-automated
    workflow: null
    tools: [organon-init, organon-verify]
    complexity: low
  - id: PROTO-ORG-9
    name: Project Upgrade
    steps: 6
    automation_tier: semi-automated
    workflow: null
    tools: [organon-upgrade, organon-verify]
    complexity: medium
  - id: PROTO-ORG-10
    name: Pre-Publish QA
    steps: 8
    automation_tier: automated
    workflow: pre-publish-qa
    tools: [organon-verify, organon-health, npm-test, npm-build]
    complexity: medium
  - id: PROTO-ORG-11
    name: Release Publish
    steps: 7
    automation_tier: semi-automated
    workflow: release-publish
    tools: [organon-verify, npm-test, release-script, gh-cli]
    complexity: medium
  - id: PROTO-ORG-12
    name: Chapter Drafting
    steps: 8
    automation_tier: manual
    workflow: null
    tools: []
    complexity: medium
  - id: PROTO-ORG-13
    name: Book Compilation
    steps: 4
    automation_tier: semi-automated
    workflow: null
    tools: [pandoc, typst, make]
    complexity: low
inherits_from: [organon-project]
audience: [llm, human, tooling]
related_files:
  - ../ETHOS.md
  - ../../CLAUDE.md
  - ../../book-llms/three-layer-architecture.md
---

# Organon Development Protocols

> Step-by-step procedures for all development activities in the Organon methodology repository. Each protocol has a corresponding workflow binding or direct tool invocation.

---

## Enforcement Loop Coverage

```
DEFINE:    PROTO-ORG-6  Organon File Creation .......... organon-file-creation
BIND:      PROTO-ORG-6  Organon File Creation .......... organon-file-creation
EXECUTE:   PROTO-ORG-2  Tool Development ............... organon-tools-developer
           PROTO-ORG-3  Methodology Evolution .......... methodology-spec-evolution
           PROTO-ORG-12 Chapter Drafting ............... manual (organon/domains/book-humans/ETHOS.md)
VERIFY:    PROTO-ORG-4  Verification and Health ........ verify-and-health
           PROTO-ORG-7  Quality Review ................. quality-review
           PROTO-ORG-13 Book Compilation ............... semi-automated (Makefile)
ONBOARD:   PROTO-ORG-8  Project Initialization ......... organon init (tool)
           PROTO-ORG-9  Project Upgrade ................ organon upgrade (tool)
PUBLISH:   PROTO-ORG-10 Pre-Publish QA ................. pre-publish-qa
           PROTO-ORG-11 Release Publish ................ release-publish
```

---

## PROTO-ORG-2: Tool Development

> Develop organon-tools CLI commands, verification gates, and MCP tools following the tool's own ETHOS.md constraints.

### Goal

Ship a tested, documented CLI command or verification gate that follows all 6 organon-tools invariants.

### Preconditions

- [ ] `organon/domains/tools/ETHOS.md` has been read (6 invariants, 5 principles)
- [ ] `organon/domains/tools/PHILOSOPHY.md` has been read (design decisions)
- [ ] If adding a gate: `book-llms/three-layer-architecture.md` verification section loaded

### Steps

1. **Load context.** Read `organon/domains/tools/ETHOS.md`, `organon/domains/tools/PHILOSOPHY.md`, and if relevant, `book-llms/three-layer-architecture.md`.

2. **Design.** Answer: What does it do? Is it idempotent? Does it support `--format json`? What exit codes? Does it compose?

3. **Update spec first.** If adding a gate or changing methodology: update `book-llms/` specification before implementation.

4. **Write tests.** Create `src/core/<feature>.test.ts` with test cases covering success, failure, and edge cases.

5. **Implement core logic.** Create `src/core/<feature>.ts` as pure function (no I/O, no console, no process.exit). Return structured results.

6. **Create CLI wrapper.** Create `src/cli/commands/<command>.ts` as thin wrapper: parse args → call core → format output.

7. **Register command.** Add to `src/cli/index.ts` command registry.

8. **Verify invariants.** Check: schema fidelity, tests exist, gates fail not warn, `--format json` works, idempotent, no breaking changes without version bump.

9. **Run test suite.** `npm test`, `npm run build`, `npm run organon verify`, coverage check (>90% core, 100% gates).

10. **Update documentation.** Update README.md with usage example, update CHANGELOG if applicable.

### Verification

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Coverage >90% for core, 100% for gates
- [ ] Command supports `--format json`
- [ ] Command is idempotent
- [ ] `organon verify` passes

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Tests fail | Fix implementation, do not skip tests |
| Coverage below threshold | Add missing test cases for uncovered branches |
| TypeScript errors | Fix type issues, do not use `any` or `@ts-ignore` |
| Gate warns instead of fails | Change to pass/fail exit codes, never soft warnings |

---

## PROTO-ORG-3: Methodology Evolution

> Evolve `book-llms/` methodology specification files with cross-file consistency.

### Goal

Update methodology specification while maintaining consistency across all related files and avoiding stale terminology.

### Preconditions

- [ ] `book-llms/ETHOS.md` loaded (meta-organon constraints)
- [ ] `book-llms/PHILOSOPHY.md` loaded (meta-organon reasoning)
- [ ] `book-llms/overview.md` loaded (methodology overview)
- [ ] `CLAUDE.md` loaded (project constraints)
- [ ] Change scope is understood (which files are affected)

### Steps

1. **Load context.** Read `book-llms/ETHOS.md`, `book-llms/PHILOSOPHY.md`, `book-llms/overview.md`, `CLAUDE.md`.

2. **Assess impact.** Run `organon find` to trace references to the concept being changed. Identify all files that reference the affected terminology or concept.

3. **Check backward compatibility.** Will this change break existing organon implementations? If yes, requires major version bump with CHANGELOG entry.

4. **Make primary change.** Edit the target file in `book-llms/`.

5. **Propagate to scopes.md.** If scope definitions changed, update `book-llms/scopes.md` (known to lag behind).

6. **Propagate to templates.md.** If structure templates changed, update `book-llms/templates.md`.

7. **Propagate to frontmatter-system.md.** If frontmatter schema changed, update `book-llms/frontmatter-system.md`.

8. **Propagate to patterns.md.** If patterns or anti-patterns changed, update `book-llms/patterns.md`.

9. **Propagate to CLAUDE.md.** If project-level guidance changed, update `CLAUDE.md`.

10. **Bump versions.** Update `version` in frontmatter of ALL modified files, not just the primary target.

11. **Grep for stale terminology.** Search ALL files (including CLAUDE.md, README.md) for old terminology that should have been updated.

12. **Run full verification.** `organon verify` (all gates), `organon health`.

### Verification

- [ ] All modified files have bumped version numbers
- [ ] `organon verify` passes all gates
- [ ] `organon health` score has not decreased
- [ ] No stale terminology found in grep sweep
- [ ] scopes.md is in sync with core concept changes

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Stale terminology found after commit | Run full grep sweep again, update all instances |
| scopes.md out of sync | Re-read scopes.md, update to match current concepts |
| Version not bumped in a file | Check all files touched in this change, bump any missed |
| Backward compatibility broken | Bump major version, document the breaking change in CHANGELOG.md |
| `organon verify` fails | Fix reported issues before committing |

---

## PROTO-ORG-4: Verification and Health

> Run all verification gates and health checks, interpret results, guide fixes, and re-verify.

### Goal

Confirm project integrity. Surface all issues with actionable fix guidance.

### Preconditions

- [ ] Working directory is the organon repository root
- [ ] `organon-tools` is built and available (`npm run build` in packages/tools/)

### Steps

1. **Run verification.** Execute `organon verify` (all 7 gates: frontmatter, references, triplets, placeholder-detection, freshness, invariant-coverage, version-alignment).

2. **Run health check.** Execute `organon health` for overall project health score.

3. **Interpret failures.** Map each failure to a fix action using the decision table:

   | Gate | Common Failure | Fix |
   |------|---------------|-----|
   | frontmatter | Missing or invalid fields | Add required fields per `frontmatter-system.md` |
   | references | Broken file path | Update path or create missing file |
   | triplets | Orphaned protocol↔test binding | Ensure invariant has `@organon-invariant` test annotation |
   | invariant-coverage | Invariant without test | Create a test annotated with `@organon-invariant(INV-X-N)` |
   | version-alignment | Config methodology version mismatch | Update `organon.config.json` methodology_version |

4. **Guide fixes.** For each failure, provide the specific file, field, and value to add or change.

5. **Re-verify.** After fixes, run `organon verify` again to confirm all gates pass.

### Verification

- [ ] All 7 gates pass
- [ ] Health score is reported
- [ ] No regressions from previous health score

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| `organon verify` command not found | Build organon-tools: `cd packages/tools && npm run build` |
| Gate failure not in decision table | Read gate source code to understand the check, add new entry to table |
| Fix introduces new failure | Re-run full verification, fix cascading issues |

---

## PROTO-ORG-6: Organon File Creation

> Create a new organon file (ETHOS.md, PHILOSOPHY.md, PROTOCOL.md, or README.md) with correct structure, frontmatter, and inheritance.

### Goal

Produce a valid organon file in the correct location with proper frontmatter, section structure, and parent scope references.

### Preconditions

- [ ] Target scope is known (product, domain, feature, component)
- [ ] Parent scope ETHOS.md exists (if not product-level)
- [ ] `book-llms/scopes.md` loaded (scope classification)
- [ ] `book-llms/templates.md` loaded (file templates)

### Steps

1. **Classify scope.** Load `book-llms/scopes.md`. Determine if target is product, domain, feature, or component scope.

2. **Check parent scope.** Load the parent scope's ETHOS.md. New file must inherit, never contradict parent constraints.

3. **Select template.** Load `book-llms/templates.md`. Choose the correct template for the artifact type (ethos, philosophy, protocol, or README router).

4. **Determine file placement.** Place under the correct directory following Pattern A (dedicated `organon/` directory).

5. **Generate frontmatter.** Fill in all required fields: type, scope, name, version, summary, token_estimate. Use `organon generate` if available.

6. **Write content.** Follow the template's section structure exactly. Include identity, invariants, principles, heuristics (for ethos); problem, bet, trade-offs (for philosophy); goal, preconditions, steps, verification, recovery (for protocol).

7. **Validate.** Run `organon validate` with all 4 stages (schema, content, references, relationships).

8. **Check bidirectional references.** If this file references other organon files, ensure those files reference back. If declaring new invariants, ensure tests with `@organon-invariant` annotations exist for each invariant ID.

### Verification

- [ ] `organon validate` passes all 4 stages
- [ ] File is in the correct directory per scope classification
- [ ] Frontmatter has all required fields
- [ ] Section headings match the template for this artifact type
- [ ] Parent scope constraints are inherited, not contradicted

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Wrong scope classification | Re-read `scopes.md`, apply the decision heuristic (≥3 concepts → domain, cross-cutting → feature) |
| `organon validate` fails | Read error messages, fix each reported issue, re-validate |
| Parent scope contradiction | Remove or weaken the contradicting constraint; add constraints only |
| Missing template section | Re-read template, add missing section |

---

## PROTO-ORG-7: Quality Review

> Semantic review of organon files that goes beyond automated gates to check meaning, testability, and completeness.

### Goal

Identify quality issues that automated gates cannot detect: vague invariants, misordered principles, missing heuristics, inconsistent terminology.

### Preconditions

- [ ] Review scope selected (specific file, directory, or project-wide)
- [ ] `book-llms/ETHOS.md` loaded (quality standards)
- [ ] `book-llms/patterns.md` loaded (anti-patterns to check against)

### Steps

1. **Select review scope.** Choose what to review: a single file, a directory, or the entire project.

2. **Run automated gates first.** Execute `organon verify` and `organon validate` on the scope. Fix any automated failures before proceeding to semantic review.

3. **Review invariants.** For each invariant, ask:
   - Is this testable? Can you write a verification gate for it?
   - Is the enforcement mechanism specific and real?
   - Is this a genuine constraint, or a vague aspiration?

4. **Review principle ordering.** For each principle list, ask:
   - If principle 3 conflicts with principle 1, does 1 genuinely win?
   - Are the principles actually prioritized, or just listed?

5. **Review identity statements.** For each IS/IS NOT section, ask:
   - Are the IS statements specific enough to distinguish this from similar things?
   - Are the IS NOT statements defining real boundaries, not obvious negations?

6. **Review heuristics.** For each decision heuristic table, ask:
   - Do these cover the decisions that actually recur?
   - Are there common decisions missing from the table?
   - Are the actions specific enough to follow?

7. **Check cross-file terminology.** Grep for key terms across all organon files. Flag inconsistent usage (e.g., "skill" vs "workflow" for the generic term).

8. **Check anti-patterns.** Compare content against `book-llms/ETHOS.md` and `book-llms/patterns.md` anti-pattern tables. Flag any matches.

9. **Generate review report.** List findings by severity (error, warning, suggestion) with specific file:line references and fix recommendations.

10. **Track improvements.** If fixes are made during the review, re-run automated gates to confirm no regressions.

### Verification

- [ ] All automated gates pass (prerequisite for semantic review)
- [ ] Every invariant passes the "testable?" filter
- [ ] Principle ordering is defensible (1 genuinely beats 2 in conflicts)
- [ ] No anti-pattern matches found
- [ ] Terminology is consistent across all files reviewed

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Invariant is untestable | Rewrite to be more specific, or move to principles (aspirational, not invariant) |
| Principles not truly prioritized | Reorder with explicit trade-off reasoning |
| Identity too generic | Add specifics: names, technologies, scope boundaries |
| Anti-pattern found | Apply the fix from the anti-pattern table |
| Terminology inconsistent | Choose canonical term, grep-and-replace across all files |

---

## PROTO-ORG-8: Project Initialization

> Bootstrap a new project with Organon structure and Claude Code skills.

### Goal

Create a valid organon project structure from scratch, including config, scaffold files, and workflow skills.

### Preconditions

- `@organon-methodology/tools` is installed and available on PATH (or run via `npx`)
- Target directory is writable
- No conflicting `organon.config.json` in parent directories (could cause config resolution confusion)

### Steps

1. **Choose target directory.** Defaults to current directory. Create if it doesn't exist.

2. **Run init.** Execute `organon init [target-dir]`. Use `--dry-run` to preview first.

3. **Review generated files.** Check organon.config.json, organon/ETHOS.md, organon/PHILOSOPHY.md, organon/README.md, organon/protocols/PROTOCOLS.md. If `--skills` was used (default), also check `.claude/skills/`.

4. **Customize scaffolds.** Edit organon/ETHOS.md to define the project's real identity, invariants, principles, and heuristics. Edit organon/PHILOSOPHY.md with actual design rationale.

5. **Verify.** Run `organon verify` to confirm the initialized project passes all gates.

### Verification

- [ ] `organon init` completes without errors
- [ ] All generated files have valid frontmatter
- [ ] `organon verify` passes on the new project
- [ ] ETHOS.md has been customized (not left as scaffold)

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Files already exist | Use `--force` to overwrite, or manually merge |
| `organon verify` fails on generated files | Report as bug — init output should always pass verify |
| Skills not installed | Run `organon init --skills` or `organon upgrade --apply --skills` |

---

## PROTO-ORG-9: Project Upgrade

> Detect version drift and incrementally upgrade project to latest methodology.

### Goal

Bring an existing organon project up to date with the latest methodology version, skills, and configuration.

### Preconditions

- An existing organon project with `organon.config.json` exists (or was previously initialized)
- `@organon-methodology/tools` is installed at the target version
- Working directory or `--project-root` points to a valid project

### Steps

1. **Check current version.** Run `organon upgrade --dry-run` to see the diff report. Review methodology version, skill changes, and config changes.

2. **Review changes.** Examine each proposed change. Skill updates show [N] for new, [U] for updated.

3. **Decide scope.** Use `--skills` to upgrade skills only, or upgrade everything.

4. **Apply changes.** Run `organon upgrade --apply` to apply all changes. Files are written, methodology_version is updated.

5. **Review customizations.** If any customized files were overwritten, merge your customizations back in.

6. **Verify.** Run `organon verify` to confirm the upgraded project passes all gates.

### Verification

- [ ] `organon upgrade --dry-run` shows accurate diff
- [ ] Applied changes don't break existing functionality
- [ ] `organon verify` passes after upgrade
- [ ] methodology_version in organon.config.json matches CLI version

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Upgrade shows "already up to date" | No action needed — project is current |
| Custom skill was overwritten | Restore from git and manually merge changes |
| `organon verify` fails after upgrade | Check diff report for unexpected changes, fix or revert |

---

## PROTO-ORG-10: Pre-Publish QA

> Comprehensive quality checks before publishing packages to npm. Catches version misalignment, missing files, broken builds, and test failures.

### Goal

Confirm both packages are ready for npm publication — clean builds, passing tests, healthy organon state, correct file lists, and aligned versions.

### Preconditions

- [ ] Working directory is the organon repository root
- [ ] `organon-tools` is built and available
- [ ] Both packages have valid `package.json` with `files` array

### Steps

1. **Clean build both packages.** Build `@organon-methodology/testing` first (dependency), then `@organon-methodology/tools`. Use `npm run clean && npm run build` in each.

2. **Run all tests.** Execute `npm test` in both `packages/testing` and `packages/tools`. All tests must pass.

3. **Run organon verify.** Execute `organon verify` — all 9 gates must pass.

4. **Run organon health.** Execute `organon health` — score must be 100/100.

5. **Check npm pack dry-run.** Run `npm pack --dry-run` in both packages. Verify file lists include `dist/`, `LICENSE`, and `README.md`. No unexpected files.

6. **Verify version alignment.** Confirm these four locations have the same version:
   - `packages/tools/package.json` → `version`
   - `packages/testing/package.json` → `version`
   - `organon.config.json` → `methodology_version`
   - `packages/tools/src/templates/config.ts` → `METHODOLOGY_VERSION`

7. **Verify CHANGELOG.md.** Confirm `CHANGELOG.md` has an entry for the current version with a date.

8. **Check for TODOs.** Grep `src/` in both packages for `TODO` or `FIXME`. None should exist in published code.

### Verification

- [ ] Both packages build without errors
- [ ] All tests pass in both packages
- [ ] `organon verify` passes all gates
- [ ] `organon health` score is 100/100
- [ ] `npm pack --dry-run` shows correct file lists
- [ ] All four version locations are aligned
- [ ] CHANGELOG.md has current version entry
- [ ] No TODOs or FIXMEs in published source

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Build fails | Fix TypeScript errors. Ensure `@organon-methodology/testing` builds before `@organon-methodology/tools`. |
| Tests fail | Fix failing tests before proceeding. Never skip tests for a release. |
| Version misalignment | Use `scripts/release.mjs` which updates all four locations atomically. |
| Missing LICENSE in pack | Ensure `LICENSE` file exists in the package directory and is listed in `files` array. |
| Health score below 100 | Fix organon issues first. Do not publish with degraded health. |

---

## PROTO-ORG-11: Release Publish

> Publish a new version to npm with proper QA, version bumping, and GitHub Release creation.

### Goal

Ship a new version of both packages to npm with proper versioning, changelog, git tag, and GitHub Release.

### Preconditions

- [ ] PROTO-ORG-10 (Pre-Publish QA) passes completely
- [ ] On `master` branch with clean working tree
- [ ] `gh` CLI is authenticated
- [ ] npm credentials are configured (for local publish) or `NPM_TOKEN` secret exists (for CI publish)

### Steps

1. **Run pre-publish QA.** Execute PROTO-ORG-10 as prerequisite. All checks must pass before proceeding.

2. **Determine version bump type.** Based on changes since last release:
   - **Patch** (`0.3.1`): Bug fixes only, no new features
   - **Minor** (`0.4.0`): New features, backward-compatible
   - **Major** (`1.0.0`): Breaking changes to CLI commands, API, or methodology

3. **Run release script.** Execute `node scripts/release.mjs <patch|minor|major>`. The script:
   - Updates version in both package.json files, organon.config.json, and METHODOLOGY_VERSION constant
   - Updates CHANGELOG.md with new version header and date
   - Commits as `chore: release v{version}`
   - Creates git tag `v{version}`
   - Pushes commit and tag
   - Creates GitHub Release with auto-generated notes

4. **Verify GitHub Release.** Confirm the release was created at `https://github.com/VledicFranco/organon/releases`.

5. **Monitor CI publish.** The `release.yml` GitHub Action triggers automatically on release publication. Monitor the workflow run for success.

6. **Verify npm availability.** After CI completes, confirm packages are available:
   - `npm info @organon-methodology/tools`
   - `npm info @organon-methodology/testing`

7. **Update README if major version.** For major version bumps, update install instructions in README.md if the package name or usage changed.

### Verification

- [ ] Pre-publish QA passed (PROTO-ORG-10)
- [ ] Release script completed without errors
- [ ] GitHub Release exists with correct tag
- [ ] GitHub Actions publish workflow succeeded
- [ ] Both packages are available on npm at the new version
- [ ] README install instructions are current (for major versions)

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Release script fails on git push | Check remote access. Ensure `master` is not protected from CLI pushes. |
| GitHub Actions publish fails | Check `NPM_TOKEN` secret. Verify provenance permissions (`id-token: write`). |
| Version mismatch in CI | The release workflow verifies tag matches package versions. If mismatch, the release script has a bug — fix and re-release. |
| npm publish fails (403) | Package may already exist at this version. Check if a partial publish occurred. |
| npm publish fails (401) | `NPM_TOKEN` is expired or invalid. Regenerate and update GitHub secret. |

---

## PROTO-ORG-12: Chapter Drafting

> Produce a new chapter for book-humans with correct frontmatter, sound narrative structure, and empirically-grounded claims.

### Goal

Author a new chapter that advances the book's philosophical arc, follows the domain constraints (ETHOS.md + PHILOSOPHY.md), and is ready for editing and integration.

### Preconditions

- [ ] Book outline exists and you know where your chapter fits (`../../book-humans/README.md`)
- [ ] `organon/domains/book-humans/ETHOS.md` has been read (5 invariants, 4 principles, 8 heuristics)
- [ ] `organon/domains/book-humans/PHILOSOPHY.md` has been read (design rationale)
- [ ] Chapter slot is identified (e.g., Part 1, Chapter 2 = `part-1-llm-nature/02-persona-paradox.md`)

### Steps

1. **Verify manuscript position.** Read the book outline in `../../book-humans/README.md`. Understand what chapters come before and after yours. Identify the philosophical thread your chapter should advance.

2. **Update `_book.yaml`.** Edit `../../book-humans/_book.yaml`. If your chapter is in a new directory, create the directory first. Uncomment the line with your chapter filename, or add a new line if the file isn't listed yet.

3. **Create chapter directory if needed.** If writing Part 2 Chapter 5, create `part-2-best-practices/` if it doesn't exist.

4. **Create markdown file with frontmatter.** Create the file (e.g., `part-1-llm-nature/02-persona-paradox.md`) with complete YAML frontmatter:
   ```yaml
   ---
   type: chapter
   scope: book-humans
   part: 1
   part_name: "LLM Nature"
   chapter: 2
   title: "The Persona Paradox: Identity and Behavioral Specification"
   status: planned
   summary: >
     One-sentence summary explaining the chapter's thesis.
   sources: []
   token_estimate: 0
   audience: [human]
   ---
   ```

5. **Write outline as H2/H3 headings.** Sketch the chapter structure using markdown headings. This is your roadmap.

6. **Write body section by section.** Fill in content under each heading. Ground empirical claims in sources (update `sources:` in frontmatter).

7. **Update `token_estimate`.** When the chapter is ~90% written, count tokens and update the `token_estimate` field.

8. **Set status and commit.** Set `status: draft` in frontmatter. Commit to git. The chapter is now available for editing, review, and compilation.

### Verification

- [ ] File exists in the correct directory (e.g., `part-1-llm-nature/02-persona-paradox.md`)
- [ ] Frontmatter has all required fields (type, scope, part, chapter, title, status, summary, sources, token_estimate, audience)
- [ ] Chapter is listed in `../../book-humans/_book.yaml` (uncommented or added)
- [ ] `make build` in `book-humans/` completes without error (chapter is compilable)
- [ ] Empirical claims are grounded in `sources:` frontmatter or explicitly labeled as reasoning

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| Wrong directory structure | Check `../../book-humans/README.md` for the expected structure. Create any missing directories. |
| Frontmatter validation fails | Ensure all required fields are present and spell-checked (e.g., `token_estimate: 0` not `estimate`). |
| Chapter not in `_book.yaml` | Add or uncomment the chapter line in `../../book-humans/_book.yaml`. |
| `make build` fails | Usually a markdown syntax error. Check for unescaped backticks, unclosed code blocks, or malformed tables. |
| Sources missing | Go back through the chapter. Identify empirical claims. Find sources (papers, experiment results, Organon reference) and add to `sources:` field. |

---

## PROTO-ORG-13: Book Compilation

> Compile all written chapters of book-humans to a clean PDF in the workspace tmp/ directory.

### Goal

Produce a publication-ready PDF combining all completed chapters in correct order.

### Preconditions

- [ ] Working directory is `organon/book-humans/`
- [ ] `pandoc >= 3.1.8` is installed and on PATH
- [ ] `typst >= 0.11` is installed and on PATH
- [ ] `python3` is available with PyYAML package installed
- [ ] At least one chapter file exists (e.g., `00-preface.md`)
- [ ] `_book.yaml`, `Makefile`, `_build/metadata.yaml`, `_build/template.typ` are present

### Steps

1. **Verify tool versions.** In `organon/book-humans/`, run `make help`. It will check pandoc, typst, and python3 versions and report if any are missing or outdated.

2. **Run build.** Execute `make build`. The Makefile will:
   - Extract chapter list from `_book.yaml`
   - Filter to files that exist on disk
   - Pass chapters to Pandoc with Typst engine
   - Output to `../../tmp/YYYYMMDD-book-humans.pdf` (timestamped with today's date)

3. **Confirm output.** Check that the PDF was created: `ls -lh ../../tmp/*-book-humans.pdf`. The file should be recent and have non-zero size.

4. **Note the PDF path.** The output path follows the pattern `tmp/YYYYMMDD-book-humans.pdf` for easy discovery. Share this path when distributing the compiled book.

### Verification

- [ ] `make help` shows all tools are available
- [ ] `make build` completes without errors
- [ ] PDF file exists in `../../tmp/` with correct timestamp
- [ ] PDF has non-zero size (≥50KB for preface + a few chapters)
- [ ] PDF opens and displays chapters in correct order (spot-check first 2 and last 2 chapters)

### Recovery

| Failure | Recovery Action |
|---------|-----------------|
| `pandoc` not found | Install pandoc from https://pandoc.org. Add to PATH. |
| `typst` not found | Install typst from https://typst.app. Add to PATH. |
| `python3` not found | Install Python 3.x. Add to PATH. |
| PyYAML import error | Run `pip install pyyaml`. |
| `make build` reports missing chapters | Check `_book.yaml` for chapters that don't exist. Remove or comment out missing chapters. |
| PDF is 0 bytes or malformed | Check Makefile output for Typst errors. These usually indicate syntax issues in `_build/template.typ`. Fix template and re-run `make build`. |
| PDF is blank or has only title page | Check that chapters are listed in `_book.yaml` and files exist. Rebuild. |
