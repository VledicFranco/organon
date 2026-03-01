# RFC as Structured Data

> Design proposal for v0.6.0. Replace Markdown prose RFCs with machine-readable YAML files.
> Introduces three new first-class organon artifact types (definitions, relationships,
> implementations) and a full traceability chain from RFC → organon → code → tests.
>
> This is a major breaking change to the RFC format.

---

## Thesis

Current RFCs are Markdown prose. Prose is ambiguous — LLMs interpret it differently, copy-paste
errors occur, and there is no way to verify that an RFC was fully implemented. The chain
RFC → organon → code → tests is invisible.

Structured YAML RFCs make every step of that chain explicit, machine-readable, and verifiable.

---

## The Problem in Detail

- **Prose = ambiguous interpretation** → LLM drift between what RFC says and what gets implemented
- **"Here's the new ETHOS.md content"** (400 lines of free-form prose) vs **`definitions: [DEF-010-01, DEF-010-02]`** (schema validates, tools auto-generate)
- **Can't verify RFC was implemented** — the definitions → organon → code chain is invisible
- **Manual copy-paste** of file content is error-prone
- **No structured composition** — can't import definitions across RFCs or build RFC chains

---

## Vision: RFC.yaml

RFC files are `rfc-NNN.yaml` with machine-readable structure. Definitions, relationships,
implementations, and organon mutations are explicit fields — not prose to interpret.

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
    output: .methodology/organon/domains/tools/definitions.yaml
    definitions: [DEF-010-01]
  - type: test
    template: definitions.test.ts
    output: tests/definitions.test.ts
    invariants: [INV-DEF-010-01]
```

**The key contrast:**
- ❌ Old: `"Here's the ETHOS.md content:"` [400 lines of prose to interpret and copy-paste]
- ✅ New: `definitions: [DEF-010-01, DEF-010-02]` (schema validates, tools auto-generate)

---

## What Structured RFCs Enable

### 1. Auto-generation
- Tools read `definitions:` array → generate `definitions.yaml` + optional Markdown docs for review
- Tools read `invariants:` array → generate test stubs
- Tools read `organon_mutations:` → validate + execute mutations
- **Result:** Eliminates manual copy-paste, ensures consistency

### 2. Validation
- Schema validation: RFC structure is valid YAML with correct types
- Reference validation: All definition IDs are unique, cross-references exist
- Completeness validation: All definitions have ≥1 invariant, all invariants have test bindings
- **Result:** RFCs must be structurally complete before submission

### 3. Composition
- RFCs can import definitions from other RFCs: `imports: [rfc-009-epistemic-model]`
- Definitions can extend/refine previous definitions
- **Result:** Build RFC chains, not isolated specs

### 4. Full Traceability
```
RFC.yaml
  → definitions[DEF-010-01]
    → organon_mutations
      → .methodology/organon/domains/tools/definitions.yaml
        → code with @organon-definition[DEF-010-01] annotation
          → tests/definitions.test.ts::test-automation-tier-enum
```
`organon verify` can check every link in this chain. "Was RFC 010 fully implemented?" becomes
an automated question with a deterministic answer.

### 5. LLM-Friendly Composition
- LLMs populate YAML fields (structured) vs write freeform prose (ambiguous)
- Tools validate completeness before LLM proceeds to the next step
- **Result:** Schema enforcement replaces reliance on LLM discipline

---

## New First-Class Organon Artifact Types

This proposal introduces three new artifact types alongside ethos/philosophy/protocol:

| Artifact | File | Contains | Invariant type |
|----------|------|----------|----------------|
| **Definitions** | `definitions.yaml` | Concept definitions within a domain | What the concept IS (semantic/structural) |
| **Relationships** | `relationships.yaml` | How concepts relate | What links them (constraints, bidirectionality) |
| **Implementations** | `implementations.yaml` | How concepts map to code | What they DO (safety, performance, correctness) |

**Critical insight — invariants are abstraction-specific, not universal:**
- **Definition invariants:** Verify the *concept* — `automation_tier` must be one of three values
- **Relationship invariants:** Verify the *connection* — protocol ↔ workflow must be bidirectional
- **Implementation invariants:** Verify *runtime behavior* — memory usage stays < 100MB under load

This distinction enables:
- RFC → organon linking: "RFC 010 defines these 3 concepts, creates 2 relationships"
- Organon → code linking: "DEF-domain-001 is implemented at `src/module/feature.ts:42-60`"
- Verification: `organon verify` checks RFC definitions exist in organon, organon entries exist in code

---

## Implementation Approach

**Step 1: RFC YAML schema**
Add `definitions:`, `relationships:`, `implementations:`, `organon_mutations:` sections.
Each definition/relationship/implementation MUST have ≥1 abstraction-specific invariant.
Each invariant has `test_binding: {file, test}` reference.

```yaml
definitions:
  - id: DEF-rfc-010-01
    name: "What is a workflow?"
    invariants:
      - id: INV-DEF-010-01
        statement: "automation_tier must be [manual|semi-auto|auto]"
        test_binding: { file: tests/definitions.test.ts, test: test-automation-tier }
```

**Step 2: `organon_mutations` tracking**
Explicit CRUD operations specifying which organon file + which definitions/relationships:
```yaml
organon_mutations:
  - operation: create
    file: .methodology/organon/domains/tools/definitions.yaml
    definitions: [DEF-rfc-010-01, DEF-rfc-010-02]
  - operation: update
    file: .methodology/organon/domains/tools/protocol.yaml
    relationships: [REL-rfc-010-01]
```
**Rule:** RFCs ONLY mutate `.methodology/organon/` files (project organon).
`.methodology/organon_def/` is read-only — updated only by `organon upgrade`.

**Step 3: Export layer**
Add DEFINITION, RELATIONSHIP, IMPLEMENTATION to `organon export` output.
Include linked invariants and test bindings so the full graph is queryable.

**Step 4: New verification gates**
- `organon_mutations` structure validation (all target files exist or will be created)
- Definition/relationship/implementation invariant coverage (≥1 per item)
- All invariants have test bindings
- All test bindings reference passing tests in CI
- RFC definitions appear in linked organon files (traceability check)

**Step 5: Health check additions**
- Organon mutation coverage (% of definitions/relationships implemented in organon)
- Invariant test binding coverage
- Test pass rate for organon-level invariants

**Step 6: Code annotation system**
Mark code implementing organon definitions with annotations:
- `@organon-definition[ID]`
- `@organon-relationship[ID]`
- `@organon-implementation[ID]`

---

## Invariant Binding System — Full Example

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

---

## Health Check Enhancement

```
organon health
├─ Definition coverage:       100% (all definitions have ≥1 invariant)
├─ Relationship coverage:     100% (all relationships have ≥1 invariant)
├─ Implementation coverage:   100% (all implementations have ≥1 invariant)
├─ Invariant test binding:    100% (all invariants reference tests)
├─ Test execution:            PASS (all bound tests passing)
└─ Health Score: 100/100 (was 96 before invariant binding gate)
```
