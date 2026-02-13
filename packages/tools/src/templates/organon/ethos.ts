/**
 * ETHOS.md scaffold template for organon init.
 */

export function ethosTemplate(projectName: string): string {
  return `---
type: constraints
scope: product
name: ${projectName}
version: "1.0"
summary: Behavioral constraints for ${projectName} — edit this to define your product's identity and invariants
token_estimate: 850
invariants_count: 3
principles_count: 3
heuristics_count: 3
inherits_from: []
load_priority: high
audience: [llm, human]
---

# Project Ethos

> Behavioral constraints for agents working on this project. Edit this file to define your product's identity and rules.

---

## Identity

### What This Project IS

- [Describe what your project does — be specific]
- [What problem does it solve?]
- [What technology does it use?]

### What This Project IS NOT

- [What does it explicitly NOT do?]
- [What is out of scope?]
- [What should developers NOT build here?]

---

## Invariants

1. **[Invariant name].** [Describe a hard constraint that must always hold. What breaks if this is violated?]

2. **[Invariant name].** [Another constraint. Each invariant should be testable and enforceable.]

3. **[Invariant name].** [A third constraint. Enforced by: specify how (tests, gates, reviews).]

---

## Principles (Prioritized)

1. **[Priority 1] over [alternative].** [One-line explanation. This wins when principles conflict.]

2. **[Priority 2] over [alternative].** [Second priority. Yields to principle 1 in conflicts.]

3. **[Priority 3] over [alternative].** [Third priority.]

---

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| [Common decision 1] | [What to do] |
| [Common decision 2] | [What to do] |
| [Common decision 3] | [What to do] |
`;
}

/** @deprecated Use ethosTemplate(projectName) instead. */
export const ETHOS_TEMPLATE = ethosTemplate('my-project');
