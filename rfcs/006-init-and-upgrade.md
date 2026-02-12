---
type: rationale
scope: product
name: init-and-upgrade
version: "1.0"
summary: Introduces organon init (project scaffolding + skill installation), organon upgrade (incremental version migration), and aligns all components to 0.3.0
token_estimate: 1500
status: implemented
created: 2026-02-12
author: Claude Opus 4.6
related_files:
  - ../organon/domains/tools/ETHOS.md
  - ../organon/domains/tools/PHILOSOPHY.md
  - ../packages/tools/src/core/init.ts
  - ../packages/tools/src/core/upgrade.ts
load_priority: high
audience: [llm, human]
primary_rfcs: []
---

# RFC 006: `organon init`, `organon upgrade`, and Skills as First-Class Citizens

> Bootstrap new projects and keep existing ones current.

---

## Problem Statement

The Organon methodology has 7 working skills, verified CLI tooling, and a testing framework — but no way to bootstrap a new project or keep existing projects current.

**Current pain points:**

1. **Blank-slate syndrome.** New projects face no starting point — every adoption requires manual file creation, skill copying, and config authoring.
2. **No migration path.** Existing projects with old methodology versions have no incremental upgrade mechanism.
3. **Manual skill distribution.** Skills (Layer 2 workflows) must be manually copied between projects and adapted by hand.
4. **Version misalignment.** @organon/tools is 0.1.0, @organon/testing is 0.2.0-beta, and the methodology has no formal version.

---

## Proposed Solution

### `organon init`

**Purpose:** Bootstrap a new project with Organon structure + Claude Code skills.

**Usage:**
```bash
organon init [target-dir]
# --skills     Install Claude Code skills (default: true)
# --force      Overwrite existing files
# --dry-run    Show what would be created
# --format     Output format (human | json)
```

**Generated file tree:**
```
target/
├── organon.config.json
├── organon/
│   ├── ETHOS.md
│   ├── PHILOSOPHY.md
│   ├── README.md
│   └── protocols/
│       └── PROTOCOLS.md
├── .claude/
│   └── skills/
│       ├── domain-feature-design/SKILL.md
│       ├── organon-file-creation/SKILL.md
│       ├── quality-review/SKILL.md
│       ├── session-compounding/SKILL.md
│       └── verify-and-health/SKILL.md
```

**Core function:** `src/core/init.ts`
- Pure function: `init(options) => InitResult`
- Returns file tree as `Map<string, string>` (path → content)
- Never writes directly — CLI handler applies the result
- Idempotent: re-running on existing project is safe (skips existing, reports)

### `organon upgrade`

**Purpose:** Detect version drift, show diff report, apply selected changes.

**Usage:**
```bash
organon upgrade [target-dir]
# Default: show diff report without applying (dry-run behavior)
# --apply      Apply all changes
# --skills     Upgrade skills only
# --format     Output format (human | json)
```

**Core functions:** `src/core/upgrade.ts`
- `detectVersion()` — reads methodology_version from config
- `computeUpgradePlan()` — diffs current against CLI's bundled version
- `applyUpgrade()` — applies selected changes

### Version Alignment

All versions move to **0.3.0**:

| Component | Before | After |
|-----------|--------|-------|
| Methodology | (unversioned) | 0.3.0 |
| @organon/tools | 0.1.0 | 0.3.0 |
| @organon/testing | 0.2.0-beta | 0.3.0 |

---

## Design Decisions

1. **Skills bundled as templates in CLI.** Skills live in `packages/tools/src/templates/skills/` as TypeScript template strings. `organon init` renders them. `organon upgrade` diffs against them. Single source of truth for distributable skills.

2. **5 generic skills, 2 repo-specific.** Generic skills reference only files that `organon init` creates. Repo-specific skills (methodology-spec-evolution, organon-tools-developer) stay in this repo only.

3. **Adapted `loads:` arrays.** Generic skills can't reference `book-llms/` (only exists in methodology repo). Adapted versions reference `organon/ETHOS.md` and `CLAUDE.md` instead.

4. **Config-based version tracking.** `methodology_version` in organon.config.json is the canonical version source. Upgrade reads this to detect drift.

5. **Dry-run default for upgrade.** Upgrade shows report without applying. User explicitly opts in.

---

## Organon Impact

### Create

- `packages/tools/src/core/init.ts` — Pure init logic
- `packages/tools/src/core/upgrade.ts` — Pure upgrade logic
- `packages/tools/src/cli/commands/init.ts` — CLI wrapper
- `packages/tools/src/cli/commands/upgrade.ts` — CLI wrapper
- `packages/tools/src/templates/skills/*.ts` — 5 adapted skill templates
- `packages/tools/src/templates/organon/*.ts` — Organon scaffold templates
- `packages/tools/src/templates/config.ts` — Config template

### Update

- `organon/protocols/PROTOCOLS.md` — Add PROTO-ORG-8 (Project Initialization) and PROTO-ORG-9 (Project Upgrade)
- `organon/domains/tools/ETHOS.md` — Update IS list to mention init/upgrade capabilities
- `CLAUDE.md` — Add heuristic for when to use init vs upgrade
- `rfcs/README.md` — Add RFC 006 row
- `packages/tools/package.json` — Version bump to 0.3.0
- `packages/testing/package.json` — Version bump to 0.3.0
- `organon.config.json` — Add methodology_version field
- `dev/tool-ideas.md` — Mark organon init as implemented

### Delete

- None

---

## What We Are NOT Doing

- No `organon discover` (codebase analysis — separate RFC)
- No `organon migrate` (doc conversion — separate RFC)
- No CI/CD templates (separate from init — can be added later)
- No interactive wizard prompts (keep init non-interactive for v1)
- No Cursor rules generation (Claude Code skills only for now)
- No MCP server changes
- No book-llms/ specification changes

---

## Success Metrics

- [ ] `organon init /tmp/test` creates valid structure that passes `organon verify`
- [ ] `organon upgrade --dry-run` shows correct diff report
- [ ] All existing tests continue to pass
- [ ] Package versions are 0.3.0 across tools and testing
- [ ] Skills installed by init have valid frontmatter
