---
type: rationale
scope: product
name: [kebab-case-name]
version: "0.1"
summary: [One sentence describing what this design doc covers]
token_estimate: [estimate]
related_files:
  - ../organon/domains/tools/ETHOS.md
  - ../organon/domains/tools/PHILOSOPHY.md
load_priority: medium
audience: [llm, human]
status: draft  # draft | review | approved | implemented | archived
---

# [Feature/Tool Name]

> [One sentence pitch — what problem does this solve?]

---

## Context

**Problem:** [Describe the problem this design addresses. What pain point exists today?]

**Current state:** [What exists now? What gaps exist?]

**Goal:** [What does success look like?]

---

## Proposed Solution

[High-level description of the approach]

### Key Features

1. **[Feature 1]** - [Description]
2. **[Feature 2]** - [Description]
3. **[Feature 3]** - [Description]

### Example Usage

```bash
# Show what the interface looks like
organon [command] [args]
```

```typescript
// If programmatic API, show code example
import { feature } from '@organon-methodology/tools';
```

---

## Design Details

### Architecture

[Component breakdown, data flow, key abstractions]

```
[ASCII diagram or file structure if relevant]
```

### Implementation Notes

- **Core logic:** Where pure functions live
- **CLI interface:** How commands are exposed
- **MCP integration:** If applicable
- **Testing strategy:** How to verify behavior

---

## Open Questions

1. **[Question 1]** - [Description of uncertainty]
   - Option A: [pros/cons]
   - Option B: [pros/cons]
   - **Recommendation:** [Which option and why]

2. **[Question 2]** - [...]

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| [Decision 1] | [Upside] | [Downside] |
| [Decision 2] | [Upside] | [Downside] |

---

## Success Metrics

- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

---

## Dependencies

- **Blocks:** [What must be built first?]
- **Blocked by:** [What is waiting on this?]
- **Related work:** [Parallel efforts that intersect]

---

## Implementation Plan

### Phase 1: [Name] (Estimated: X weeks)
- [ ] [Milestone 1]
- [ ] [Milestone 2]

### Phase 2: [Name] (Estimated: X weeks)
- [ ] [Milestone 3]
- [ ] [Milestone 4]

---

## Related Files

| File | Relationship |
|------|--------------|
| [../organon/domains/tools/ETHOS.md](../organon/domains/tools/ETHOS.md) | [How this relates to organon-tools invariants] |
| [../organon/domains/tools/PHILOSOPHY.md](../organon/domains/tools/PHILOSOPHY.md) | [How this relates to design principles] |

---

## Status

**Current:** [draft | review | approved | implemented]

**Last Updated:** [YYYY-MM-DD]

**Next Action:** [What needs to happen next?]
