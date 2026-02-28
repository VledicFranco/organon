# Roadmap to v0.6.0

> Raw ideas for the next minor version (0.5.2 → 0.6.0). Brainstorm-stage — no commitments yet.

---

## Vision / Theme

(What's the overarching direction for 0.6?)

---

## Architectural Foundation

### 1. All Organons as YAML-First (not Markdown + prose)

Instead of scattered Markdown files with frontmatter, organons are **pure YAML**. Any prose explanation goes INTO yaml as string fields.

```
.organon/domains/tools/
├── ethos.yaml            (domain-level invariants, principles, heuristics)
├── philosophy.yaml       (domain-level reasoning, decisions, bets)
├── protocol.yaml         (domain-level procedures, steps, verification)
├── definitions.yaml      (concept-level definitions)
├── relationships.yaml    (concept-level relationships)
└── implementations.yaml  (code mappings)
```

**YAML structure example (ETHOS.yaml):**
```yaml
type: constraints
scope: domain
name: tools
version: "1.1"

invariants:
  - id: INV-TOOLS-1
    name: schema-fidelity
    statement: "Frontmatter parser must match book-llms/ schema exactly"
    rationale: "Any deviation breaks methodology compatibility"

principles:
  - priority: 1
    name: schema-fidelity-over-convenience
    statement: "When spec conflicts with ease-of-use, spec wins"
    reasoning: "We implement the methodology exactly, not approximations"

heuristics:
  - situation: "Book-llms/ spec unclear"
    action: "File issue in book-llms/, block implementation until clarified"

out_of_scope:
  - "Workflow execution (that's agent-specific)"
  - "Code generation beyond frontmatter"
```

**Benefits:**
- YAML is canonical format (not Markdown + frontmatter hybrid)
- All prose embedded in string fields (`statement:`, `rationale:`, `reasoning:`, `description:`)
- MCP loads pure YAML (no parsing Markdown)
- Tools can auto-generate Markdown docs from YAML for human review
- LLMs can programmatically build/edit YAML (populate fields)
- Everything is queryable and composable
- No format mismatch (RFC.yaml, ETHOS.yaml, definitions.yaml all consistent)

### 2. MCP Query API (programmatic access to YAML organons)

Instead of "LLM reads files," LLM calls MCP tools. MCP loads `.methodology/organon/` YAML files (project-scoped) and `.methodology/organon_def/` Markdown reference, providing query interface:

```typescript
// Domain-level queries (from ethos.yaml, philosophy.yaml, protocol.yaml)
organon_query_domain_invariants(domain: string) → invariants[]
organon_query_domain_principles(domain: string) → principles[]
organon_query_decisions(domain: string) → decisions[]
organon_query_protocols(domain: string) → protocols[]

// Concept-level queries (from definitions.yaml, relationships.yaml, implementations.yaml)
organon_query_definitions(domain: string, search?: string) → definitions[]
organon_query_invariants(definition_id: string) → invariants[]
organon_query_relationships(domain: string) → relationships[]
organon_query_implementations(definition_id: string) → implementations[]

// Cross-level queries
organon_query_by_location(file: string) → {
  domain_invariants: [...],
  domain_principles: [...],
  definitions: [...],
  relationships: [...],
  implementations: [...]
}

// Management operations
organon_add_definition(domain: string, definition: YAML) → validates + persists to definitions.yaml
organon_update_invariant_binding(invariant_id: string, test_binding: object) → updates YAML
organon_validate_completeness(domain: string) → {missing_definitions, unbound_invariants, untested_implementations}
```

**Example LLM workflow:**
```
LLM: "What are the verification gate invariants?"
→ organon_query_definitions(domain: "tools", search: "verification")
→ Returns: {definitions: [{id: DEF-TOOLS-001, invariants: [INV-TOOLS-001, INV-TOOLS-002]}]}
→ LLM has structured data to work with (no file parsing)

LLM: "Add a new definition for Workflow"
→ organon_add_definition(domain: "tools", {id: DEF-TOOLS-003, name: "Workflow", invariants: [...]})
→ MCP validates YAML, checks references, updates definitions.yaml
→ All changes are structured, verifiable, composable
```

---

## Major Features

### Consolidate all organon artifacts under `.methodology/` directory
- **Goal**: Standard location for methodology artifacts. Extensible to multiple methodologies. Clean separation between project usage and methodology specification.
- **Structure**:
  ```
  .methodology/
  ├── organon/                             (THIS PROJECT's Organon usage - YAML, project-scoped)
  │   ├── domains/                         (project's bounded contexts)
  │   │   └── {domain-name}/
  │   │       ├── ethos.yaml              (domain-level constraints)
  │   │       ├── philosophy.yaml         (domain-level reasoning)
  │   │       ├── protocol.yaml           (domain-level procedures)
  │   │       ├── definitions.yaml        (project concepts with invariants)
  │   │       ├── relationships.yaml      (project concept relationships)
  │   │       └── implementations.yaml    (code mappings)
  │   ├── rfcs/                           (project RFCs evolving this organon)
  │   │   └── rfc-NNN.yaml
  │   └── observations/                   (project observations)
  │       └── *.yaml
  │
  ├── organon_def/                        (Organon METHODOLOGY specification - reference material)
  │   ├── ETHOS.md                        (what IS Organon)
  │   ├── PHILOSOPHY.md                   (how Organon thinks)
  │   ├── PROTOCOL.md                     (how to use Organon)
  │   ├── three-layer-architecture.md
  │   ├── frontmatter-system.md
  │   ├── patterns.md
  │   ├── scopes.md
  │   └── definitions.md
  │
  └── {other_methodology}_def/             (other methodologies' specs, future)
      ├── ETHOS.md
      └── ...
  ```
- **Benefits**:
  - Project root stays clean (src/, tests/, docs/, package.json are product code only)
  - Clear separation: project usage (YAML) vs methodology specification (Markdown reference)
  - `.methodology/` is a **standard directory** (like `.git/`, `.vscode/`)
  - **Extensible**: Add `{methodology_name}/` and `{methodology_name}_def/` for other methodologies
  - MCP server config points to `.methodology/{methodology_name}/` for project-scoped queries
  - Methodology specification available locally (no need to refer to external book-llms/)
  - Project organons are YAML (consistent, queryable, LLM-friendly)
  - Methodology reference stays Markdown (human-readable, familiar)
- **Migration path**: RFC + `organon init --create-methodology` creates `.methodology/organon/` structure; `organon upgrade` updates `.methodology/organon_def/` with new methodology versions

### `.methodology/organon/tmp/` for temporal files
- Workspace protocols can dump intermediate files here
- LLM reasoning, plans, context staging areas
- Gitignored by default via `.methodology/.gitignore`
- Follows `.git/`, `.vscode/`, `.venv/` naming convention

### MCP-driven routing: Replace skills with protocol-guided tool chains
- **Problem**: Skills are unreliable — context loading issues, inconsistent invocation
- **Solution**: Use MCP sampling/chaining as primary guidance mechanism
- **Pattern**: Tool returns routing prompt → Claude reads it → calls next tool → gets next routing prompt → etc
- **Implementation**: Create `organon_main` as entry point that returns routing prompt suggesting which tool(s) to use
  - `organon_main` → "You have 3 options: RFC planning, verification, health check" → Claude picks → calls tool → tool returns next instructions
  - `organon_rfc_plan` → returns RFC structure + prompts for each section
  - Similar routing for other major workflows
- **User experience**: Install MCP server, point Claude to it, get guided workflows without loading skill context
- **Design questions**:
  - Which tools become routers vs terminal tools?
  - Format of routing prompts (enum of options vs narrative guidance)?
  - Depth of nesting (flat router → tasks, or multi-level routing)?
  - Fallback if user deviates from suggested path?

---

## Breaking Changes

- **Phased skill deprecation**: Replace 11 individual skills with single `organon_methodology_expert` meta-skill
  - The meta-skill provides routing to MCP tools + Organon summary
  - Existing skills continue to work but are deprecated in docs
  - Migration path: new projects/users go MCP-first, existing projects can migrate incrementally

---

## Nice-to-Haves

(Quality-of-life improvements, optional enhancements)

---

## Dependencies / Blockers

(What needs to be resolved first? What's blocking other work?)

---

## Research / Exploration

(Technical investigations, architectural questions to answer)

---

## Migration Strategy

### Phase 1: Create `organon_methodology_expert` skill
- Single entry point that replaces all 11 existing skills
- Contains:
  - What is Organon? (summary, identity, use cases)
  - How to use the MCP server (setup instructions)
  - Routing guide: which MCP tool to invoke for which task
  - Quick reference table (task → tool → expected output)
- Deployed in v0.6.0
- Existing skills remain functional (deprecated in docs)

### Phase 2: MCP tool maturity
- Ensure all major workflows have MCP tool equivalents
- Test end-to-end chaining patterns
- Collect user feedback on routing effectiveness

### Phase 3: Skill removal (v0.7.0+)
- Deprecate + remove individual skill files
- Update project templates to use only `organon_methodology_expert`

---

## RFC Paradigm Shift: From Prose to Structured Data (MAJOR BREAKING CHANGE)

### Problem: RFC prose allows hallucination and drift
- Current RFCs are Markdown prose → ambiguous interpretation → LLM drift
- "Here's the new ETHOS.md content" (free-form) vs "Create .organon/domains/testing/ethos.yaml with definitions: [DEF-010-01, DEF-010-02]" (unambiguous)
- Can't verify RFC was implemented (definitions → organon → code chain is invisible)
- Manual copy-paste of file content prone to errors
- No structured composition (can't import definitions across RFCs)

### Vision: RFCs as Structured YAML Data (not Markdown prose)

**Core idea:** RFC files are `rfc-NNN.yaml` with machine-readable structure. Definitions, relationships, implementations, and CRUD operations are explicit fields — not prose to interpret.

**RFC.yaml structure** (no Markdown needed):
```yaml
id: rfc-010
status: draft
author: Claude Opus
created: 2026-02-26

definitions:
  - id: DEF-010-01
    name: "Workflow"
    summary: "Agent binding for protocols"
    invariants:
      - id: INV-DEF-010-01
        statement: "automation_tier must be [manual|semi-auto|auto]"
        test_binding: {file: tests/definitions.test.ts, test: test-automation-tier}

relationships:
  - id: REL-010-01
    name: "workflow binds protocol to tool"
    invariants:
      - id: INV-REL-010-01
        statement: "Protocol and Workflow must bidirectionally reference"
        test_binding: {file: tests/relationships.test.ts, test: test-bidirectional}

organon_mutations:
  - operation: create
    file: .methodology/organon/domains/tools/definitions.yaml
    definitions: [DEF-010-01]
    relationships: [REL-010-01]
  - operation: update
    file: .methodology/organon/domains/tools/protocol.yaml
    section: "## Workflows"
    definitions: [DEF-010-01]

code_generation:
  - type: organon_file
    template: definitions.yaml
    output: .organon/domains/tools/definitions.yaml
    definitions: [DEF-010-01]
  - type: test
    template: definitions.test.ts
    output: tests/definitions.test.ts
    invariants: [INV-DEF-010-01]
```

**Key difference vs Markdown RFC:**
- ❌ Old: "Here's the ETHOS.md content:" [400 lines of prose]
- ✅ New: `definitions: [DEF-010-01, DEF-010-02]` (schema validates, tools auto-generate)

### What YAML-structured RFCs enable:

**1. Auto-generation:**
- Tools read `definitions:` array → generate `definitions.yaml` file (source) + optional Markdown docs for review
- Tools read `invariants:` array → generate test stubs
- Tools read `organon_mutations:` → validate + execute mutations
- **Result**: Eliminates manual copy-paste, ensures consistency

**2. Validation:**
- Schema validation: RFC structure is valid YAML with correct types
- Reference validation: All definition IDs are unique, cross-references exist
- Completeness validation: All definitions have ≥1 invariant, all invariants have test bindings
- **Result**: RFCs must be complete before submission

**3. Composition:**
- RFCs can import definitions from other RFCs: `imports: [rfc-009-epistemic-model]`
- Definitions can extend/refine previous definitions
- **Result**: Build RFC chains, not isolated specs

**4. Full traceability:**
- RFC.yaml → definitions[DEF-010-01] → organon_mutations → .organon/domains/tools/definitions.yaml → code tests
- `organon verify` checks every link
- **Result**: Can verify "RFC was fully implemented"

**5. LLM-friendly composition:**
- LLMs populate YAML fields (structured) vs prose (ambiguous)
- Tools validate completeness before LLM proceeds
- **Result**: Prevents hallucination via schema enforcement

---

**Critical insight**: Invariants are *abstraction-specific*, not universal:
- **Definition invariants**: Verify the **concept** (semantic/structural properties — what it IS)
- **Relationship invariants**: Verify the **connection** (constraints, bidirectionality, consistency — what links them)
- **Implementation invariants**: Verify **runtime behavior** (safety, performance, correctness — what it DOES)

**New First-Class Organon Types:**
- `definitions.yaml` — Concept definitions within a domain/RFC
- `relationships.yaml` — How concepts relate (APIs, protocols, dependencies)
- `implementations.yaml` — How concepts map to code (with testable invariances)

**Why:** Enables:
- RFC → Organon linking: "RFC 010 defines these 3 concepts, creates 2 relationships"
- Organon → Code linking: "DEF-domain-001 is implemented at src/module/feature.ts:42-60"
- Verification: `organon verify` checks: RFC definitions exist in organon, organon entries exist in code
- Testing: Each implementation has testable invariances (like current testing framework but for definitions/relationships)

**Implementation approach:**
1. RFC frontmatter: Add `definitions:`, `relationships:`, `implementations:`, `organon_mutations:` sections
   - Each definition/relationship/implementation MUST have ≥1 abstraction-specific invariant
   - Each invariant has `test_binding: {file, test}` reference
   - `organon_mutations:` array specifies CRUD operations (create/update/delete) + which organon file + linked definition/relationship IDs

2. Definitions/Relationships/Implementations sections:
   ```yaml
   definitions:
     - id: DEF-rfc-010-01
       name: "What is a workflow?"
       invariants:
         - id: INV-DEF-010-01
           statement: "automation_tier must be [manual|semi-auto|auto]"
           test_binding: { file: tests/definitions.test.ts, test: test-automation-tier }
   ```

3. Organon Mutations tracking:
   ```yaml
   organon_mutations:
     - operation: create
       file: .methodology/organon/domains/tools/definitions.yaml
       definitions: [DEF-rfc-010-01, DEF-rfc-010-02]
     - operation: update
       file: .methodology/organon/domains/tools/protocol.yaml
       relationships: [REL-rfc-010-01]
   ```

   **Note**: RFCs ONLY mutate `.methodology/organon/` files (project organon). `.methodology/organon_def/` (methodology reference) is updated only by `organon upgrade` CLI command.

4. Export layer: Add DEFINITION, RELATIONSHIP, IMPLEMENTATION to `organon export`
   - Include linked invariants and test bindings (queryable, verifiable)

5. Verification gates:
   - New gate: `organon_mutations` structure validation (all files exist or will be created)
   - New gate: Definition/relationship/implementation invariant coverage (≥1 per item)
   - New gate: All invariants have test bindings
   - New gate: All test bindings pass in CI
   - New gate: RFC definitions actually appear in linked organon files (traceability)

6. Health check:
   - Organon mutation coverage (% of definitions/relationships implemented in organon)
   - Invariant test binding coverage
   - Test pass rate for organon-level invariants

7. Annotation system: `@organon-definition[ID]`, `@organon-relationship[ID]`, `@organon-implementation[ID]` in code

**Invariant binding system:**

RFC 010 Draft:
```
DEF-rfc-010-01: "What is a workflow?"
  ├─ Invariant INV-DEF-010-01: "automation_tier must be one of [manual, semi-auto, auto]"
  │  └─ Test binding: definitions.test.ts::test-automation-tier-enum
  ├─ Invariant INV-DEF-010-02: "every workflow must have a protocol reference"
  │  └─ Test binding: definitions.test.ts::test-workflow-protocol-ref
  └─ [Status: 2/2 invariants have test bindings ✅]

REL-rfc-010-01: "workflow binds protocol to tool"
  ├─ Invariant INV-REL-010-01: "bidirectional references (workflow → protocol, protocol → workflow)"
  │  └─ Test binding: relationships.test.ts::test-bidirectional-refs
  └─ [Status: 1/1 invariant has test binding ✅]

IMPL-rfc-010-01: "Use Queue+Stream pattern for async execution"
  ├─ Invariant INV-IMPL-010-01: "Queue with stream ensures at-least-once semantics"
  │  └─ Test binding: src/queue/queue.test.ts::test-at-least-once
  ├─ Invariant INV-IMPL-010-02: "Memory usage stays <100MB under 1M messages"
  │  └─ Test binding: src/queue/queue.perf.test.ts::test-memory-bounds
  └─ [Status: 2/2 invariants have test bindings ✅]
```

**Health check enhancement:**
```
organon health
├─ Definition coverage: 100% (all definitions have invariants)
├─ Relationship coverage: 100% (all relationships have invariants)
├─ Implementation coverage: 100% (all implementations have invariants)
├─ Invariant test binding: 100% (all invariants reference tests)
├─ Test execution: PASS (all bound tests passing)
└─ Health Score: 100/100 (was 96 before invariant binding gate)
```

---

## Notes

(Scratch space, random thoughts, links to RFCs or issues)

### Paradigm Shift Summary

| Aspect | Current | v0.6.0 |
|--------|---------|--------|
| **RFC Format** | RFC.md with frontmatter | `.methodology/organon/rfcs/rfc-NNN.yaml` (pure YAML) |
| **Project Organon Format** | `organon/domains/{domain}/ETHOS.md` etc. | `.methodology/organon/domains/{domain}/ethos.yaml` etc. (pure YAML) |
| **Methodology Spec** | `book-llms/*.md` (external reference) | `.methodology/organon_def/*.md` (local reference) |
| **Prose Location** | In Markdown sections | In YAML string fields (`statement:`, `rationale:`, `description:`) |
| **Concept Definitions** | Ad-hoc in PHILOSOPHY | `.methodology/organon/domains/{domain}/definitions.yaml` (atomic, queryable) |
| **Directory Standard** | Scattered (`organon/`, `.claude/skills/`, `book-llms/`) | `.methodology/` (standard, extensible, single root) |
| **Data Access** | LLM reads/parses Markdown files | MCP query API (loads YAML, returns JSON) |
| **Automation** | Manual (read → implement) | Automated (validate → generate → test) |
| **Composition** | No (isolated RFCs/organons) | Yes (RFC imports, definition references, relationship links) |
| **Hallucination Risk** | High (prose ambiguous) | Low (YAML schema enforced) |
| **Verification** | Manual (did implementer follow RFC?) | Automated (tools verify RFC→Organon→Code chain) |
| **LLM Workflow** | Generate Markdown prose | Populate YAML fields |
| **Methodology Reference** | External book-llms/ | Local `.methodology/organon_def/` |

**Breaking change**: v0.6.0 introduces `.methodology/` as the standard root. Projects get both `.methodology/organon/` (project-scoped YAML) and `.methodology/organon_def/` (methodology reference). Migration: `organon init` creates structure automatically.

---

## Resolved Design Decisions

✅ **Design Q1: RFC organon_mutations target**
- RFCs ONLY mutate `.methodology/organon/` files (project-scoped organon)
- Never mutate `.methodology/organon_def/` (read-only, updated by CLI only)
- Never mutate `book-llms/` (legacy reference, backwards compat)

✅ **Design Q2: Methodology specification location**
- `.methodology/organon_def/` is the local reference (installed via `organon init`, upgraded via `organon upgrade`)
- `book-llms/` remains unchanged (legacy, external reference)
- No conversion of existing books

---

## Outstanding Design Questions

**Q3: Invariant Inheritance Model**
- How do domain-level invariants (`.methodology/organon/domains/tools/ethos.yaml`) relate to concept-level invariants (`.methodology/organon/domains/tools/definitions.yaml`)?
- Are domain invariants universal constraints on all concepts in that domain?
- Or are they independent (each concept has its own invariants)?

**Q4: Observations File Organization**
- Single `observations.yaml` file or multiple `observations/*.yaml` files?
- How does RFC status interact with observations (linked by RFC ID)?
- Should observations be indexed/queryable via MCP?

**Q5: Auto-Generated Documentation**
- When tools generate Markdown from YAML (definitions, relationships), where do they go?
- `.methodology/organon/docs/` (for LLM reference)?
- Git-tracked or `.gitignore`?
- Regenerated on every `organon verify` or on-demand?

**Q6: Methodology Versioning**
- How is `.methodology/organon_def/` versioned?
- Tied to Organon npm version (v0.6.0)?
- Can projects pin to specific versions or always upgrade to latest?
- What does `organon upgrade` do exactly (fetch from npm, git, local)?

---

### Related Files (load for context)
- `organon/observations/005-epistemic-export-gaps.md` — RFC 009 implementation insights
- `book-llms/three-layer-architecture.md` — Current protocol/workflow/tool model
- `book-llms/frontmatter-system.md` — Current RFC section structure (to be replaced)
- `packages/tools/src/core/export.ts` — Current epistemic export (entities, assertions, relationships, rules)
