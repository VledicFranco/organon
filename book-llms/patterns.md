# Organon Patterns

> Common patterns for human-machine collaborative projects.

---

## Documentation Layers

Three documentation layers serve different consumers:

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: CODE                            │
│   Inline comments, docstrings, type signatures              │
│   Consumer: Compilers, IDEs, developers                     │
│   Truth: AUTHORITATIVE                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 LAYER 2: LLM DOCUMENTATION                  │
│   Structured knowledge base (docs/)                         │
│   Consumer: LLMs, agents, tools                             │
│   Truth: DERIVED from code                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                LAYER 3: HUMAN DOCUMENTATION                 │
│   Narratives, tutorials, marketing (website/docs/)          │
│   Consumer: Humans                                          │
│   Truth: INTERPRETED                                        │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Optimization | Key Constraint |
|-------|--------------|----------------|
| Code | Correctness | Must compile/run |
| LLM docs | Token efficiency | Small files, navigable tree |
| Human docs | Understanding | Progressive disclosure, visuals |

**Consistency rule:** When layers conflict, code wins. Fix docs to match code.

---

## README as Router

Every directory has a `README.md` that serves as navigation:

```markdown
# Directory Name

Brief summary (1-2 sentences).

## Contents

| Path | Description |
|------|-------------|
| [child-a/](./child-a/) | What child-a covers |
| [child-b.md](./child-b.md) | What child-b covers |
```

**Purpose:** LLMs navigate by reading READMEs to decide which child to explore. Minimizes tokens loaded.

**Constraint:** README files < 100 lines.

---

## Component Cross-References

Feature docs link to implementation without duplicating:

```markdown
## Components Involved

| Component | Role | Key Files |
|-----------|------|-----------|
| runtime | Cache execution | `CacheExecutor.scala` |
| compiler | Option validation | `OptionValidator.scala` |
```

**Purpose:** Bridges "what it does" (features) to "where it's implemented" (components).

---

## Small File Pattern

| File Type | Target Lines | Max Lines |
|-----------|--------------|-----------|
| README (router) | 50-80 | 100 |
| Content file | 100-150 | 200 |
| Philosophy | 80-120 | 200 |
| Ethos | 80-120 | 150 |
| Protocol | 50-80 | 100 |

**Rationale:** Token efficiency. LLMs load only what's needed.

**Action when exceeded:** Split into child files or tighten language.

---

## Ethos-First Development

When starting a new feature or domain:

```
1. Write ETHOS.md first
   - Forces clarity about constraints
   - Defines identity boundaries
   - Establishes decision heuristics

2. Implement the feature
   - Ethos guides decisions
   - Violations surface early

3. Write PHILOSOPHY.md
   - Explains decisions made during implementation
   - Documents trade-offs discovered

4. Write protocols as patterns emerge
   - Repeatable tasks get protocols
   - One-off tasks stay in ethos heuristics
```

---

## Identity Boundary Pattern

Every ethos starts with explicit boundaries:

```markdown
## Identity

### What [This] IS
- [Positive definition 1]
- [Positive definition 2]

### What [This] IS NOT
- [Exclusion 1]
- [Exclusion 2]
```

**Purpose:** Prevents scope creep. LLMs know what's out of bounds.

**Test:** For any proposed action, can you answer "Does this fit the IS and avoid the IS NOT?" If unclear, boundaries need refinement.

---

## Prioritized Principles Pattern

Principles are numbered by priority:

```markdown
## Principles (Prioritized)

1. **Safety over speed.** Never sacrifice correctness for performance.
2. **Explicit over implicit.** Prefer verbose clarity over clever brevity.
3. **Simple over complete.** Solve the common case well before edge cases.
```

**Conflict resolution:** When principles conflict, higher number wins.

**Example conflict:** "Make it fast" vs "Make it safe" → Safety wins (principle 1).

---

## Decision Heuristic Pattern

Pre-computed answers for recurring ambiguous situations:

```markdown
## Decision Heuristics

| Situation | Action |
|-----------|--------|
| When cache TTL is unspecified | Use 5 minutes |
| When two approaches seem equal | Choose the simpler one |
| When blocked by external dependency | Document blocker, move to next task |
```

**Format:** "When [situation], [action]"

**Benefit:** Eliminates per-decision reasoning. Saves tokens, ensures consistency.

---

## Protocol Invocation Pattern

Protocols are invoked by name, not embedded:

```markdown
## Heuristics

- Before merging, follow the [Pre-Merge Protocol](./protocols/pre-merge.md)
- When releasing, follow the [Release Protocol](./protocols/release.md)
```

**Purpose:** Ethos stays focused on constraints. Protocols handle procedures.

---

## Verification Checklist Pattern

Both ethos and protocols end with verification:

**Ethos verification:**
```markdown
## Verification Checklist

Before publishing changes:
- [ ] Identity boundaries respected
- [ ] Invariants not violated
- [ ] Principles applied in priority order
```

**Protocol verification:**
```markdown
## Verification

After completion:
- [ ] Tests pass
- [ ] Branch deleted
- [ ] Issue closed
```

---

## Meta-Organon Pattern

A **meta-organon** documents the organon system itself. It's an organon about organons.

```
organon/
  ├── ETHOS.md        ← Meta-level: "How to write organons"
  ├── PHILOSOPHY.md   ← Meta-level: "Why organons work this way"
  ├── README.md       ← Navigation guide
  └── ...             ← Domain/feature organons
```

**Purpose:**
- Self-documenting methodology
- Teaches new contributors how to extend the organon system
- Prevents organon drift by codifying the rules

**Meta-Organon Contents:**

| Section | Content |
|---------|---------|
| Identity | "This organon system IS/IS NOT..." |
| Invariants | File size limits, required sections, version markers |
| Principles | Token efficiency, accuracy over coverage, etc. |
| Heuristics | When to create domain vs feature organon |

**Strong Recommendation:** Every project with organons should have a meta-organon. Without it, the methodology itself becomes tribal knowledge.

**Example Meta-Organon Identity:**
```markdown
## Identity

### What This Organon System IS
- Token-efficient constraint system
- LLM-optimized guidance
- Hierarchical (product → domain → feature)

### What This Organon System IS NOT
- Not tutorials or how-to guides
- Not API reference
- Not version-controlled narrative
```

---

## Organon Directory Structure

Two primary patterns for organizing organon directories:

### Pattern A: Dedicated `organon/` Directory

```
/ETHOS.md                 ← Product-level (root visibility)
/PHILOSOPHY.md            ← Product-level
/organon/
  ├── ETHOS.md            ← Meta-organon
  ├── README.md           ← Navigation
  ├── domains/            ← Business domains (DDD)
  ├── features/           ← User capabilities
  ├── components/         ← Implementation units
  └── protocols/          ← Operational procedures
```

**Recommended when:**
- Project has both LLM docs and human docs
- Clear separation between constraints and documentation needed
- Multiple documentation surfaces exist

### Pattern B: Embedded in `docs/`

```
/docs/
  ├── ETHOS.md            ← Product-level
  ├── PHILOSOPHY.md       ← Product-level
  ├── features/           ← Feature organons
  ├── components/         ← Component organons
  └── protocols/          ← Protocols
```

**Acceptable when:**
- No separate human documentation
- Simpler project structure preferred
- Single documentation surface

**Strong Recommendation:** Place product-level `ETHOS.md` and `PHILOSOPHY.md` at **repository root** for maximum visibility. The first thing any agent (human or LLM) sees should be the constraints.

---

## Anti-Pattern Reference

| Anti-Pattern | Description | Fix |
|--------------|-------------|-----|
| Monolithic ethos | Single 500-line ethos | Split into scoped organons |
| Philosophy without ethos | Explains but doesn't constrain | Write ethos first |
| Ethos with explanations | "Do X because Y" everywhere | Move "because Y" to philosophy |
| Vague boundaries | "Be reasonable" | Specify concrete actions |
| Duplicate content | Same constraint in multiple places | Single source, link elsewhere |
| Stale organon | Contradicts current code | Update organon or code |
| Missing meta-organon | Organon methodology is undocumented | Create `organon/ETHOS.md` for the system itself |
| Buried product ethos | ETHOS.md hidden in subdirectory | Move to repository root |
