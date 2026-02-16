---
type: rationale
scope: product
name: epistemic-model
version: "1.0"
status: implemented
summary: Formalize organon's implicit epistemic categories (constraint/assertion/rule) and add knowledge export for interoperability
token_estimate: 2200
author: Claude Opus 4.6
created: "2026-02-15"
primary_rfcs: []
secondary_rfcs: [1, 5]
audience: [llm, human, tooling]
---

# RFC 009: Epistemic Model & Knowledge Interoperability

> Formalize the implicit epistemology in organon files so external knowledge systems can interoperate without coupling to file structure.

---

## Problem Statement

Organon already models three epistemic categories implicitly:

- **ETHOS invariants** = Constraints (what should be true)
- **Observations** = Assertions (what is empirically observed)
- **Verification gates** = Rules (what must hold, checked automatically)

This maps directly to knowledge systems like axiom-db's fact/should/rule separation. But the methodology doesn't formally recognize this — the type system uses artifact types (`constraints`/`rationale`/`procedures`), not epistemic categories.

**Current state:** Organon data is locked in file structure. External tools must parse frontmatter YAML and directory conventions to extract knowledge.

**Desired state:** A formal epistemic model documented in the methodology, plus a structured export format that any knowledge system can consume.

---

## Proposed Solution

### 1. Formalize three epistemic categories

| Category | Definition | Maps to | Example |
|----------|-----------|---------|---------|
| **Constraint** | What should be true — normative declarations | ETHOS.md invariants | "Cache TTL max 24h" |
| **Assertion** | What is empirically observed — descriptive claims | Observation files | "Two review passes is optimal" |
| **Rule** | What must hold, checked automatically — enforcement logic | Verification gates, protocols | "Frontmatter counts match content" |

These are not new artifact types — they are an epistemic lens on existing artifacts.

### 2. Add `organon query --category` filter

Map the category filter to existing frontmatter:

| Category | Filter logic |
|----------|-------------|
| `constraint` | `type === 'constraints'` |
| `assertion` | `type === 'rationale'` AND path contains `observations/` |
| `rule` | `type === 'procedures'` |

### 3. Add `organon export` command

Produce a structured JSON knowledge graph:

```json
{
  "version": "0.4.1",
  "exported_at": "2026-02-15T...",
  "entities": [...],
  "assertions": [...],
  "relationships": [...],
  "rules": [...]
}
```

This is the interoperability surface. External tools consume export output instead of parsing organon files directly.

### 4. Add observation `status` lifecycle field

```yaml
status: signal | pattern | actionable | resolved
```

Purely additive — existing observations without `status` remain valid.

---

## Organon Impact

### Update

- `book-llms/three-layer-architecture.md` — Add `## Epistemic Categories` section after enforcement loop
- `book-llms/frontmatter-system.md` — Document observation `status` field and export format
- `packages/tools/src/core/types.ts` — Add `EpistemicCategory` type, `ExportResult` interface, observation status
- `packages/tools/src/core/query.ts` — Add `category` filter
- `packages/tools/src/cli/commands/query.ts` — Add `--category` flag
- `packages/tools/src/mcp/tools.ts` — Add `category` param to `organon_query`, add `organon_export` tool

### Create

- `rfcs/009-epistemic-model.md` — This RFC
- `packages/tools/src/core/export.ts` — Export logic
- `packages/tools/src/core/export.test.ts` — Export tests
- `packages/tools/src/cli/commands/export.ts` — CLI command

---

## Technical Implementation

### `organon query --category`

One new filter block in the existing query pipeline. The `category` filter is applied after standard filters (scope, type, priority) and before sorting:

```typescript
if (options.category) {
  filtered = filtered.filter((f) => classifyCategory(f) === options.category);
}
```

Classification function:

```typescript
function classifyCategory(file: ParsedOrganonFile): EpistemicCategory | null {
  if (file.frontmatter?.type === 'constraints') return 'constraint';
  if (file.frontmatter?.type === 'rationale' && file.path.includes('observations/')) return 'assertion';
  if (file.frontmatter?.type === 'procedures') return 'rule';
  return null;
}
```

### `organon export`

Reuses existing infrastructure:
- `discoverOrganonFiles()` for file discovery
- `parseFrontmatter()` for metadata extraction
- Gate metadata from verify config for rules

Output sections:
- **entities**: One per organon file (id, kind, name, scope, type, category)
- **assertions**: Extracted from ETHOS invariants (constraints) and observation content (assertions)
- **relationships**: `inherits_from`, `loads`, `related_domains` from frontmatter
- **rules**: Verification gates with their targets

---

## What We Did NOT Do

- No new artifact types — epistemic categories are a lens, not a new type system
- No semantic search or embeddings — that's external tool territory
- No knowledge database — organon stays file-based; export is the interop surface
- No axiom-db integration code — axiom-db consumes the export format independently
- No observation management CLI (`organon observe`) — future RFC if status field proves useful

---

## Success Metrics

1. `organon query --category constraint` returns only ETHOS.md files
2. `organon query --category assertion` returns only observation files
3. `organon export` produces valid JSON with all four sections populated
4. All existing tests continue to pass (backward compatible)
5. New tests cover category filter and export logic

---

## Related Files

| File | Relationship |
|------|-------------|
| [001-testing-framework.md](./001-testing-framework.md) | Established tier-4 testing; export makes invariant data portable |
| [005-observation-synthesis-loop.md](./005-observation-synthesis-loop.md) | Established observations; this RFC adds lifecycle tracking |
| [../book-llms/three-layer-architecture.md](../book-llms/three-layer-architecture.md) | Updated with epistemic categories section |
| [../book-llms/frontmatter-system.md](../book-llms/frontmatter-system.md) | Updated with observation status field |
