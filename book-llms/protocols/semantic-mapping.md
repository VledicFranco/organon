---
type: procedures
scope: meta
name: semantic-mapping
version: "1.0"
summary: How to connect generated Scala catalogs to organon meaning — bridging raw type info to domain concepts
token_estimate: 1800
protocols_count: 1
protocols:
  - id: PROTO-SEMMAP-1
    name: Semantic Mapping
    steps: 4
    automation_tier: manual
    tools: []
    complexity: medium
inherits_from: [meta-organon]
audience: [llm, human]
---

# Protocol: Semantic Mapping

> How to connect generated Scala catalogs to organon meaning.

---

## Goal

Create a semantic mapping that bridges raw Scala type information to domain-specific meaning.

---

## Preconditions

- [ ] Generated catalog exists for the relevant package (`docs/generated/*.md`)
- [ ] Component/feature ETHOS.md exists
- [ ] Understanding of what the Scala types represent in the domain

---

## Steps

### 1. Add Semantic Mapping Section

In the component or feature ETHOS.md, add a Semantic Mapping section after Identity:

```markdown
## Semantic Mapping

| Scala Artifact | Domain Meaning |
|----------------|----------------|
| `ClassName` | What this class represents in domain terms |
| `ObjectName` | What this singleton represents |
| `TraitName` | What this interface represents |

For raw signatures, see [generated catalog](/docs/generated/package.name.md).
```

### 2. Map Key Types

For each important type in the package:
1. Find it in the generated catalog
2. Write a one-line description of its domain meaning
3. Add to the mapping table

**Focus on:**
- Public API types (what users interact with)
- Core domain types (what the feature is about)
- Configuration types (what users can customize)

**Skip:**
- Internal implementation details
- Utility types
- Generated companion objects

### 3. Add Invariants with References

For behavioral invariants, add implementation and test references:

```markdown
## Invariants

### 1. [Invariant name]

[Description of the invariant]

| Aspect | Reference |
|--------|-----------|
| Implementation | `path/to/file.scala#symbolName` |
| Test | `path/to/test.scala#test name` |
```

**Reference format:** `relative/path/to/file.scala#symbolOrTestName`

### 4. Link to Generated Catalog

At the end of the Semantic Mapping section, add:

```markdown
For complete type signatures, see [generated catalog](/docs/generated/package.name.md).
```

---

## Verification

After adding semantic mappings:

- [ ] All key domain types are mapped
- [ ] Mapping descriptions are concise (one line each)
- [ ] Invariant references use correct format (`file#symbol`)
- [ ] Link to generated catalog is valid
- [ ] `organon verify` passes (if invariants have references)

---

## Recovery

If something goes wrong:

| Failure | Recovery Action |
|---------|-----------------|
| Generated catalog doesn't exist | Run catalog generation tool first, then retry |
| Component ETHOS.md doesn't exist | Create minimal ETHOS using templates.md |
| Invalid file#symbol reference | Verify symbol exists in source file; use fully qualified name if needed |
| Broken catalog link | Regenerate catalog; verify file path is correct |

---

## Example

```markdown
# Runtime Ethos

## Identity

- **IS:** Execution engine for compiled pipelines
- **IS NOT:** A compiler, parser, or HTTP server

## Semantic Mapping

| Scala Artifact | Domain Meaning |
|----------------|----------------|
| `ModuleBuilder` | Factory for creating pipeline modules |
| `Module[I, O]` | An executable unit in the pipeline DAG |
| `Constellation` | Runtime container that holds registered modules |
| `CValue` | Runtime representation of typed pipeline data |
| `ExecutionContext` | State and configuration for a pipeline execution |

For complete type signatures, see [generated catalog](/docs/generated/io.constellation.md).

## Invariants

### 1. Modules are pure functions

Module implementations must not have side effects beyond their declared IO type.

| Aspect | Reference |
|--------|-----------|
| Implementation | `modules/runtime/src/main/scala/io/constellation/ModuleBuilder.scala#implementationPure` |
| Test | `modules/runtime/src/test/scala/io/constellation/ModuleBuilderSpec.scala#pure modules` |
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Mapping every type | Noise, maintenance burden | Map only key domain types |
| Copying scaladoc | Duplication | Write domain meaning, not API description |
| Vague descriptions | Doesn't help understanding | Be specific about domain role |
| Missing catalog link | Reader can't find details | Always link to generated catalog |
