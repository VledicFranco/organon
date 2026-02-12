---
type: rationale
scope: meta
name: workflow-context-field-collision
version: "1.0"
summary: Resolve naming collision between organon's workflow `context` field (files to load) and Claude Code's `context` field (fork/inline execution mode)
token_estimate: 5500
status: implemented
created: 2026-02-11
author: Claude Opus 4.6
related_files:
  - ../book-llms/three-layer-architecture.md
  - ../book-llms/workflow-authoring.md
  - ../book-llms/templates.md
  - ../book-llms/frontmatter-system.md
load_priority: high
audience: [llm, human]
---

# RFC 004: Workflow Context Field Collision

> Resolve the naming collision between organon's universal workflow contract `context` field and Claude Code's reserved `context` frontmatter field — two different semantics occupying the same key.

---

## Status

**Current State:** Implemented

| Transition | Date | Notes |
|------------|------|-------|
| → Draft | 2026-02-11 | Initial RFC created after discovering collision during skill family implementation |
| → Implemented | 2026-02-11 | Option A (`loads`) implemented across spec, tooling, and all 7 skills |

---

## Problem Statement

**The universal workflow contract defines `context` as a YAML array of organon file paths. Claude Code defines `context` as an execution mode selector. Both use the same frontmatter key name with incompatible semantics.**

### Current State

The organon methodology defines a universal workflow contract in `three-layer-architecture.md`:

```yaml
# Organon's definition (three-layer-architecture.md, templates.md)
context:                               # Organon files to load before execution
  - organon/methodology/rfcs/PROTOCOLS.md
  - /ETHOS.md
```

Claude Code's skill system reserves `context` for a different purpose:

```yaml
# Claude Code's definition (skill frontmatter)
context: fork    # Run in forked subagent (vs inline in main conversation)
```

These two meanings cannot coexist in the same frontmatter block. A skill file cannot simultaneously declare `context: fork` and `context: [file1.md, file2.md]`.

### Desired State

A single, unambiguous field naming convention that:
1. Satisfies the universal workflow contract (file paths for context loading)
2. Doesn't collide with agent-technology-specific reserved fields
3. Works across all workflow mechanisms (Claude skills, Cursor rules, runbooks, CI/CD, git hooks)
4. Can be validated by `organon verify --gate workflow-quality`

---

## Discovery Context

This collision was discovered during implementation of the 7-skill enforcement loop family (commit `0dd7ff2`). The two pre-existing skills (`domain-feature-design`, `organon-tools-developer`) had `context: fork` and `agent: general-purpose` — Claude Code fields for running in a forked subagent. Adding the organon `context:` array overwrote those fields, breaking the skills' execution behavior.

The interim fix was renaming the organon field to `organon_context:` — functional but unprincipled. This RFC proposes a proper resolution.

---

## Impact Analysis

### Files That Define `context` as "files to load"

| File | Usage | Lines |
|------|-------|-------|
| `book-llms/three-layer-architecture.md` | Universal contract requirement #3, frontmatter example | 218, 244 |
| `book-llms/workflow-authoring.md` | Quality attribute "context sufficiency", gate checks, anti-patterns | 42, 53, 207, 213, 234, 239 |
| `book-llms/templates.md` | Workflow template scaffold | 331 |
| `book-llms/frontmatter-system.md` | Lists `context` as workflow-specific field | 76 |

### Files That Use `context` with Claude Code Semantics

| File | Value |
|------|-------|
| `.claude/skills/domain-feature-design/SKILL.md` | `context: fork` |
| `.claude/skills/organon-tools-developer/SKILL.md` | `context: fork` |

### Files Using Interim `organon_context` Workaround

All 7 skills currently use `organon_context:` for the file path list.

### Verification Gate Impact

The `workflow-quality` gate checks:
- `context` array present and non-empty → `WORKFLOW_MISSING_CONTEXT` (error)
- Each path in `context` resolves to a file → `WORKFLOW_BROKEN_CONTEXT_REF` (error)
- `context` array has ≤ 10 entries → `WORKFLOW_CONTEXT_OVERLOAD` (warning)

If the field is renamed, all three checks must update to match.

---

## Proposed Solutions

### Option A: Rename in Organon Spec to `loads`

**Change:** Replace `context` → `loads` in the universal workflow contract. Update all spec files, templates, and gate checks.

```yaml
# Before
context:
  - /ETHOS.md
  - organon/protocols/PROTOCOLS.md

# After
loads:
  - /ETHOS.md
  - organon/protocols/PROTOCOLS.md
```

**Pros:**
- Short, clear verb — "this workflow loads these files"
- No collision with any known agent technology
- Clean break — no ambiguity about which `context` is meant
- Easy to grep for and validate

**Cons:**
- Breaking change to the universal workflow contract (spec version bump required)
- All existing organon implementations using `context:` must migrate
- `loads` is less semantically precise than "context loading guidance"

**Migration:** Additive phase (accept both `loads` and `context` for one version), then deprecate `context` in next major.

---

### Option B: Rename in Organon Spec to `organon_context`

**Change:** Adopt the interim fix as the permanent solution.

```yaml
organon_context:
  - /ETHOS.md
  - organon/protocols/PROTOCOLS.md
```

**Pros:**
- Already implemented in all 7 skills — zero additional work
- Unambiguously organon-specific (namespaced)
- No collision possible with any agent technology

**Cons:**
- Verbose — 16 characters vs 7 for `context` or 5 for `loads`
- Feels like a workaround, not a design decision
- Namespace prefix is redundant in organon frontmatter (everything is organon)

---

### Option C: Agent-Technology Adapter Layer

**Change:** Keep `context` in the organon spec. Define an "adapter" convention where agent technologies that reserve `context` use a mapped field name.

```yaml
# In organon spec (unchanged)
context:
  - /ETHOS.md

# In Claude Code skill (adapter mapping documented)
# Claude Code reserves `context`, so organon's `context` maps to `organon_context`
organon_context:
  - /ETHOS.md
context: fork    # Claude Code's native field
```

**Pros:**
- Spec stays clean — `context` remains the canonical name
- Each agent technology only adapts where collisions exist
- No breaking change for implementations without collisions (runbooks, CI/CD, etc.)

**Cons:**
- Two names for the same concept depending on where you look
- Gate checks need technology-aware logic (check `context` OR `organon_context`)
- Documentation complexity — must explain the mapping for each agent tech
- Violates "one canonical name" principle

---

### Option D: Namespace All Workflow Fields

**Change:** Prefix all organon-specific workflow fields with `organon_` to avoid any future collisions.

```yaml
organon_protocol_id: PROTO-ORG-1
organon_protocol_file: organon/protocols/PROTOCOLS.md
organon_tools: [organon-verify, organon-validate]
organon_context:
  - /ETHOS.md
```

**Pros:**
- Prevents all future collisions, not just `context`
- Clear which fields are organon's vs the host technology's
- Consistent convention

**Cons:**
- Very verbose
- Over-engineers for a single known collision (`context`)
- `protocol_id` and `tools` don't currently collide with anything
- Breaking change across all workflow fields

---

## Recommendation

**Option A (`loads`)** is the recommended solution, for these reasons:

1. **Clean semantics.** "loads" describes exactly what the field does — list files the workflow loads before execution. It's a verb, matching the imperative nature of workflows.

2. **No collision.** Short, common English word with no reserved meaning in Claude Code, Cursor, GitHub Actions, or other agent technologies surveyed.

3. **Minimal spec disruption.** Only 4 files in `book-llms/` need updating. The change is a field rename, not a structural change.

4. **Migration path.** Accept both `loads` and `context` during a transition period (minor version), then deprecate `context` in the next major version.

5. **Avoids over-engineering.** Options C and D add complexity for a single-field problem. Option B works but feels like a patch promoted to a decision.

---

## Organon Impact

### Update

**`book-llms/three-layer-architecture.md`**
- Universal contract requirement #3: "Provide context loading guidance" → update field name in examples
- Workflow frontmatter contract example: `context:` → `loads:`

**`book-llms/workflow-authoring.md`**
- Quality attribute "context sufficiency": `context` array → `loads` array
- Gate checks table: update field name in 3 rows (MISSING_CONTEXT → MISSING_LOADS, BROKEN_CONTEXT_REF → BROKEN_LOADS_REF, CONTEXT_OVERLOAD → LOADS_OVERLOAD)
- Anti-patterns: "context overload", "implicit context" → update field references
- How-to-apply section: update field name references

**`book-llms/templates.md`**
- Workflow template scaffold: `context:` → `loads:`

**`book-llms/frontmatter-system.md`**
- Line 76: workflow-specific fields list → replace `context` with `loads`

**`packages/tools/` (verification gates)**
- `workflow-quality` gate: check `loads` instead of `context`
- Accept both `loads` and `context` during transition (minor version compatibility)

**All 7 skill files (`.claude/skills/*/SKILL.md`)**
- Replace `organon_context:` → `loads:`

---

## Technical Implementation

### Phase 1: Spec Update

- [ ] Update `three-layer-architecture.md` — rename field in universal contract and examples
- [ ] Update `workflow-authoring.md` — rename field in quality attributes, gate checks, anti-patterns
- [ ] Update `templates.md` — rename field in workflow template
- [ ] Update `frontmatter-system.md` — rename field in workflow-specific fields list
- [ ] Bump version on all 4 files

### Phase 2: Tooling Update

- [ ] Update `workflow-quality` gate to check for `loads` (primary) or `context` (deprecated, accepted)
- [ ] Update diagnostic codes: `WORKFLOW_MISSING_LOADS`, `WORKFLOW_BROKEN_LOADS_REF`, `WORKFLOW_LOADS_OVERLOAD`
- [ ] Add deprecation warning when `context` array is found: "Use `loads` instead of `context` — see RFC 004"
- [ ] Update tests

### Phase 3: Skill Migration

- [ ] Replace `organon_context:` → `loads:` in all 7 skill files
- [ ] Verify all skills pass `organon verify --gate workflow-quality`

### Phase 4: Deprecation (Next Major Version)

- [ ] Remove `context` array acceptance from gate
- [ ] Remove deprecation warning (becomes error)
- [ ] Update migration guide

---

## Success Metrics

- [ ] **No field collision** — `context` in Claude Code skills means fork/inline; `loads` in organon means file paths
- [ ] **All 7 skills pass `organon verify`** — workflow-quality gate validates `loads` field
- [ ] **Spec is internally consistent** — all 4 spec files use `loads` consistently
- [ ] **Backward compatibility during transition** — both `loads` and `context` accepted for one minor version

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Other agent technologies reserve `loads` | Medium | Surveyed Claude Code, Cursor, GitHub Actions, no collision found. If discovered, namespace as `organon_loads`. |
| Existing external organon implementations use `context` | High | Transition period accepts both. Announce deprecation clearly. |
| `loads` is ambiguous (loads code? loads data?) | Low | Field is inside workflow frontmatter, which establishes context. Documentation clarifies "organon files to load." |

---

## Open Questions

### Resolved (Pre-RFC)

1. **Should we just use `organon_context` permanently?** → No. Namespace prefix is redundant in organon frontmatter and feels like a patch, not a design decision. `loads` is cleaner.

2. **Should we namespace ALL workflow fields?** → No. Over-engineers for a single collision. `protocol_id`, `protocol_file`, and `tools` don't collide with any known agent technology.

### Still Open

1. **Should the transition period accept `context` as array only, or also `context: fork` without erroring?**
   - **Recommendation:** The gate should distinguish: `context` as array → treat as deprecated `loads`, emit warning. `context` as string → ignore (belongs to agent technology). This avoids false positives on skills with `context: fork`.

2. **Should the diagnostic code rename happen atomically or can old codes be aliases?**
   - **Recommendation:** Rename atomically. Gate consumers should not depend on specific diagnostic code strings.

3. **Is `loads` the best verb? Alternatives: `requires`, `reads`, `depends_on`, `preload`.**
   - **Recommendation:** Prototype during implementation. `loads` is the leading candidate but `reads` is also strong. Reject `requires` (implies hard dependency), `depends_on` (too verbose), `preload` (implies timing semantics).

---

## Dependencies

**Blocks:**
- Organon-tools gate update (must know the field name to implement)
- Future workflow skills (must know which field name to use)

**Blocked by:**
- Nothing — this is a naming decision with clear migration path

**Related work:**
- Skill family implementation (commit `0dd7ff2`) — provides 7 test subjects for prototyping

---

## Related Files

| File | Relationship |
|------|-------------|
| [three-layer-architecture.md](../book-llms/three-layer-architecture.md) | Defines universal workflow contract with `context` field |
| [workflow-authoring.md](../book-llms/workflow-authoring.md) | Defines `workflow-quality` gate that checks `context` |
| [templates.md](../book-llms/templates.md) | Workflow template uses `context` |
| [frontmatter-system.md](../book-llms/frontmatter-system.md) | Lists `context` as workflow-specific field |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-11 | Initial draft | Claude Opus 4.6 |
