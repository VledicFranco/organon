/**
 * PHILOSOPHY.md scaffold template for organon init.
 */

export const PHILOSOPHY_TEMPLATE = `---
type: rationale
scope: product
name: my-project
version: "1.0"
summary: Design rationale for this project — edit this to explain WHY your project is designed the way it is
token_estimate: 400
decision_count: 3
inherits_from: []
load_priority: medium
audience: [llm, human]
---

# Project Philosophy

> Explains WHY this project is designed the way it is. Constraints go in ETHOS.md; reasoning goes here.

---

## The Problem

[Describe the problem your project solves. Why does it exist? What pain point does it address?]

---

## The Bet

**Bet:** [State the core assumption your design rests on. This should be falsifiable.]

**Why this works:**
- [Evidence point 1]
- [Evidence point 2]

---

## Design Decisions

### 1. [Decision Name]

**Choice:** [What you decided]

**Rationale:** [Why you chose this]

**Trade-off:** [What you gave up]

### 2. [Decision Name]

**Choice:** [What you decided]

**Rationale:** [Why you chose this]

**Trade-off:** [What you gave up]

### 3. [Decision Name]

**Choice:** [What you decided]

**Rationale:** [Why you chose this]

**Trade-off:** [What you gave up]

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| [Choice 1] | [What you gain] | [What you give up] |
| [Choice 2] | [What you gain] | [What you give up] |
| [Choice 3] | [What you gain] | [What you give up] |
`;
