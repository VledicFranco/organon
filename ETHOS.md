# Meta-Organon Ethos

> Constraints for creating organons.

---

## Identity

### What an Organon IS

- A complete guidance system (philosophy + ethos + protocol)
- Behavioral constraints encoded for LLM consumption
- Scoped to a project, domain, feature, or component
- Persistent context, not per-request instructions

### What an Organon IS NOT

- Not a README or getting-started guide
- Not API documentation or type signatures
- Not a tutorial or learning path
- Not a development methodology (Agile, Scrum)
- Not prompt engineering

---

## Invariants

1. **Ethos is required.** Philosophy and protocol are optional. An organon without an ethos is not an organon.

2. **Identity comes first.** Every ethos begins with IS/IS NOT statements.

3. **Principles are prioritized.** Numbered list, highest priority first. When principles conflict, higher wins.

4. **Child scopes inherit, never contradict.** A feature ethos can add constraints beyond the product ethos, but cannot relax them.

5. **Code is the source of truth.** When an organon conflicts with code, fix one or the other. Never leave conflicts.

6. **Token efficiency matters.** Ethos documents are injected into LLM context repeatedly. Every unnecessary word costs tokens across thousands of interactions.

---

## Principles (Prioritized)

1. **Clarity over completeness.** A short, clear ethos beats a comprehensive but vague one.

2. **Constraints over explanations.** State what to do, not why. Put "why" in philosophy.

3. **Specificity over generality.** "Never force-push to master" beats "Be careful with git."

4. **Actionable over aspirational.** "Run tests before merging" beats "Maintain code quality."

5. **Explicit over implicit.** If it matters, write it down. Don't assume shared understanding.

---

## Decision Heuristics

### When writing an ethos

| Situation | Action |
|-----------|--------|
| Unsure if a constraint belongs | Ask: "Would violating this cause real harm?" If yes, include it. |
| Constraint feels obvious | Include it anyway. LLMs have no "obvious." |
| Two constraints might conflict | Add priority numbers or explicit "X trumps Y" statement. |
| Ethos exceeds 150 lines | Split into child scopes or tighten language. |

### When writing philosophy

| Situation | Action |
|-----------|--------|
| Decision seems arbitrary | Write philosophy explaining trade-offs. |
| Multiple valid approaches exist | Document why you chose this one. |
| You might reconsider later | Note the conditions under which you'd change. |

### When writing protocols

| Situation | Action |
|-----------|--------|
| Task must be done the same way every time | Write protocol. |
| Errors in execution have significant consequences | Write protocol with verification steps. |
| Task requires judgment calls | Don't write protocol; put guidance in ethos. |

---

## File Conventions

| File | Required | Max Lines | Content |
|------|----------|-----------|---------|
| `ETHOS.md` | Yes | 150 | Behavioral constraints |
| `PHILOSOPHY.md` | No | 200 | Reasoning and trade-offs |
| `PROTOCOL.md` | No | 100 | Single protocol |
| `protocols/*.md` | No | 100 each | Multiple protocols |

**Naming:** All uppercase for organon files. This signals "meta-documentation."

**Location:** Organon files live at the root of their scope (repo root, `docs/`, `features/X/`).

---

## Structure Templates

### Ethos (Required Sections)

```
# [Scope] Ethos
## Identity (IS / IS NOT)
## Invariants
## Principles (Prioritized)
## Decision Heuristics
```

### Ethos (Optional Sections)

```
## Out of Scope
## Failure Modes
## Anti-Patterns
```

### Philosophy (Required Sections)

```
# [Scope] Philosophy
## The Problem
## The Bet (or "The Solution")
## Trade-offs
```

### Protocol (Required Sections)

```
# Protocol: [Name]
## Goal
## Preconditions
## Steps
## Verification
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Ethos with no IS/IS NOT | LLM doesn't know boundaries | Add identity section first |
| Unprioritized principles | LLM can't resolve conflicts | Number by priority |
| Philosophy without trade-offs | Decisions seem arbitrary | Document what you sacrificed |
| Protocol with judgment calls | Can't be followed literally | Move judgment to ethos |
| Ethos longer than 150 lines | Token-inefficient, hard to parse | Split into child scopes |
| Duplicating constraints across scopes | Maintenance burden, divergence | Child inherits from parent |

---

## Verification Checklist

Before publishing an organon:

- [ ] Ethos has IS/IS NOT identity section
- [ ] Principles are numbered by priority
- [ ] No conflicts between parent and child scope
- [ ] File sizes within limits
- [ ] Cross-references are valid
- [ ] Code and organon are consistent
