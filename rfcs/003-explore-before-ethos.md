---
type: rationale
scope: meta
name: explore-before-ethos
version: "1.0"
summary: Add Explore-Before-Ethos pattern for novel domains where technical feasibility is unknown — time-boxed exploration before constraint definition
token_estimate: 6500
status: draft
created: 2026-02-10
author: Claude Sonnet 4.5
related_files:
  - ../book-llms/patterns.md
  - ../book-llms/ETHOS.md
  - ../book-llms/PHILOSOPHY.md
load_priority: high
audience: [llm, human]
---

# RFC 003: Explore-Before-Ethos Pattern

> Add pattern for novel domains where writing ETHOS from first principles is premature — time-boxed exploration discovers constraints before codification. This pattern addresses the DEFINE phase of the enforcement loop (from RFC 002) when technical feasibility is unknown.

---

## Status

**Current State:** Draft

**Next Milestone:** Review and team approval

| Transition | Date | Notes |
|------------|------|-------|
| → Draft | 2026-02-10 | Initial RFC created |

---

## Problem Statement

**The current methodology assumes one constraint definition path for all scenarios.**

### Current Approach: Ethos-First Development (Universal)

From `book-llms/patterns.md`:

```
1. Write ETHOS.md first (with frontmatter)
   - Forces clarity about constraints
   - Defines identity boundaries
   - Establishes decision heuristics

2. Implement the feature
   - Ethos guides decisions
   - Violations surface early
```

This pattern assumes you can articulate invariants **from first principles** before implementation. But this assumption breaks down in certain scenarios.

---

### The Gap: Novel Domains with Technical Uncertainty

**Scenario:** You're designing a new domain/feature where:
- Technology is unfamiliar (new framework, new paradigm)
- Technical feasibility is unknown (can this even be done?)
- Multiple approaches exist with unclear trade-offs
- "First principles" aren't obvious without exploration

**Example from RFC 001 (Testing Framework):**

Writing `testing/ETHOS.md` before any implementation:
```yaml
invariants:
  - id: INV-TEST-1
    name: assertions-are-pure
    text: "All assertion functions are pure (no side effects, no I/O, deterministic)"
```

**Problem:** After implementation begins, you discover:
- Purity constraint makes file I/O assertions impossible (need to read source files)
- Async-only API is more verbose than expected (user friction)
- Framework integration requires global state (conflicts with "no side effects")

**Result:** ETHOS must be rewritten. The "first principles" turned out to be impractical.

---

### Three Failure Modes

**1. Impossible Invariants**
- Declare constraint that tech stack can't satisfy
- Discover during implementation, rewrite ETHOS
- Wasted design effort, rework

**2. Over-Constraining**
- Write overly strict invariants without knowing trade-offs
- Block valid solutions unnecessarily
- Example: "All functions must be pure" when 90% pure + 10% I/O would work

**3. Under-Constraining**
- Miss critical constraints because you don't know what's risky
- Discover violations late (after significant code written)
- Example: Forget "framework-agnostic core" constraint, couple to Vitest too tightly

---

### When Ethos-First Works vs Fails

**Works well:**
- Adding feature to existing system (patterns proven)
- Experienced team with familiar technology
- Constraints are knowable upfront
- Example: Adding new API endpoint, extending existing domain

**Fails (or creates rework):**
- Novel architecture, unfamiliar technology
- Technical feasibility unknown
- First-of-its-kind feature
- Example: RFC 001 (testing framework), integrating new AI model, novel data structure

---

**Current state:** Single pattern (Ethos-First) for all scenarios. No guidance for when exploration is needed.

**Desired state:** Two patterns with clear decision heuristic:
- **Ethos-First Development** (default, for known domains)
- **Explore-Before-Ethos** (for novel domains, technical uncertainty)

---

## Proposed Solution

**Add "Explore-Before-Ethos Pattern" to methodology** as alternative to Ethos-First Development for novel/uncertain domains.

### Core Principle

**Ethos-First is about outcomes, not implementation:**
- ✅ Good invariant: "All assertions must be pure functions" (outcome-based)
- ❌ Bad invariant: "Use Lodash for utilities" (implementation detail)

**When outcomes are knowable upfront:** Use Ethos-First Development.

**When outcomes are uncertain:** Explore to discover constraints, then write ETHOS.

---

### The Pattern

```
EXPLORE-BEFORE-ETHOS PATTERN (Novel Domains)

1. EXPLORE (time-boxed: 1-2 days max)
   Goal: Discover technical constraints, not production code
   Activities:
   - Build throwaway spike/prototype
   - Answer: What's possible? What's not? What's expensive?
   - Test competing approaches
   - Identify real constraints (tech limits) vs preferences (design choices)

2. DOCUMENT CONSTRAINTS
   Goal: Capture learnings before codification
   Activities:
   - Write exploration findings (markdown doc in tmp/ or similar)
   - List discovered constraints: "X is possible," "Y is impossible," "Z requires trade-off A vs B"
   - Identify which are invariants (must) vs principles (should)

3. WRITE ETHOS
   Goal: Codify validated constraints
   Activities:
   - Create ETHOS.md with invariants grounded in exploration
   - Principles reflect trade-offs discovered
   - Decision heuristics based on real scenarios encountered
   - Now writing from experience, not speculation

4. IMPLEMENT PROPERLY
   Goal: Follow validated ETHOS
   Activities:
   - Standard implementation (ETHOS guides decisions)
   - ETHOS can still evolve during implementation (Same-PR principle)
   - But major constraints already validated (less rework)
```

---

### Integration with Existing Patterns

**Still follows Same-PR Principle:**
- Exploration code is THROWAWAY (not committed to PR branch)
- Final PR includes: ETHOS.md + PHILOSOPHY.md + implementation (all together)
- ETHOS can evolve during implementation (based on further learnings)

**Difference from Ethos-First:**
- Ethos-First: Branch created → Write ETHOS → Implement → PR (ETHOS + code)
- Explore-Before-Ethos: Explore (throwaway) → Branch created → Write ETHOS → Implement → PR (ETHOS + code)

Exploration happens **before the PR branch**, not during implementation.

---

### Decision Heuristic: Which Pattern to Use?

| Situation | Pattern | Rationale |
|-----------|---------|-----------|
| Adding feature to existing system with proven patterns | **Ethos-First** | Constraints knowable upfront, patterns proven |
| Novel architecture, unfamiliar technology | **Explore-Before-Ethos** | Technical feasibility unknown, need to discover constraints |
| First-of-its-kind feature for this codebase | **Explore-Before-Ethos** | No prior art, high uncertainty |
| Multiple valid approaches with unclear trade-offs | **Explore-Before-Ethos** | Exploration evaluates options before committing |
| High confidence in constraints (experienced team, familiar domain) | **Ethos-First** | Don't over-optimize for uncertainty |
| Uncertain which pattern applies | **Lightweight Ethos-First** | Write 2-3 core invariants, implement, expand ETHOS as you learn |

**Default:** Ethos-First Development (bias toward action, not analysis paralysis)

**Exception:** Explore-Before-Ethos (when uncertainty is HIGH)

---

### Integration with RFC 002 (Recursive Collaboration Pattern)

**This RFC addresses the DEFINE phase** of the enforcement loop updated in RFC 002:

```
┌─────────────────────────────────────────────────────────┐
│  DEFINE (This RFC affects this phase)                  │
│    Option A: Write ETHOS directly (Ethos-First)        │
│    Option B: EXPLORE → Write ETHOS (Explore-Before)    │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│  BIND → EXECUTE → VERIFY → COMPOUND → EVOLVE           │
│  (RFC 002's Recursive Collaboration Pattern)           │
└─────────────────────────────────────────────────────────┘
```

**Relationship:**
- **RFC 002** defines how to execute work recursively (PLAN → WORK → REVIEW → COMPOUND)
- **RFC 003** defines when to explore before defining constraints (EXPLORE → ETHOS)
- Both support the methodology's recursive nature: exploration findings feed into ETHOS, ETHOS guides implementation, implementation validates ETHOS (self-correcting loop)

**Compounding connection:** Explore-Before-Ethos enables compounding by:
1. **Reducing rework** - Validated constraints mean less ETHOS rewriting
2. **Building knowledge** - Exploration findings become reusable patterns
3. **Progressive automation** - Exploration tools can be created (e.g., `organon explore` scaffold)

This pattern is consistent with RFC 002's principle: **recursive improvement by design**. Exploration is another form of iteration that generates learnings feeding into the next cycle.

---

## Example: RFC 001 Testing Framework (Hypothetical)

### Scenario A: Ethos-First (Current Approach)

```
Day 1: Create branch, write testing/ETHOS.md
  - Invariant: "All assertions are pure functions"
  - Invariant: "All assertions return Promise<void>"
  - Principle: "Fail-fast over forgiving"

Day 2-3: Start implementation
  - Discover: assertFileExists needs file I/O (violates purity)
  - Discover: Pure assertions make some patterns impossible
  - Decision: Relax purity constraint or redesign API?

Day 4: Rewrite ETHOS.md
  - Update INV-TEST-1: "Core assertions are pure; file operations isolated in separate module"
  - Add principle: "Purity where practical, isolation where necessary"

Day 5-10: Continue implementation (with revised ETHOS)

Day 11: PR ready (ETHOS + code)
```

**Result:** ETHOS rewritten mid-implementation. Wasted 2 days on invalid constraints.

---

### Scenario B: Explore-Before-Ethos (Proposed)

```
Day 1: Exploration (no branch yet, throwaway code)
  - Spike 1: Try pure assertion API
    - Learning: Pure functions work for numeric checks, fail for file I/O
  - Spike 2: Try impure assertion API
    - Learning: Works but makes testing harder (side effects)
  - Spike 3: Hybrid approach (pure core + isolated I/O)
    - Learning: Best of both worlds, slightly more complex

  - Document findings in tmp/testing-exploration.md:
    - Constraint discovered: "Pure core + isolated I/O" is practical
    - Constraint validated: "Always async" works (no sync/async confusion)
    - Trade-off identified: Purity vs convenience (chose purity with escape hatch)

Day 2: Create branch, write testing/ETHOS.md (validated constraints)
  - Invariant: "Core assertions are pure; file operations isolated"
  - Invariant: "All assertions return Promise<void>"
  - Principle: "Purity where practical, isolation where necessary"
  - (These are now grounded in exploration, not speculation)

Day 3-10: Implement (ETHOS guides, minimal revisions needed)

Day 11: PR ready (ETHOS + code)
```

**Result:** ETHOS written once, based on validated constraints. Saved 2 days of rework.

---

## Organon Impact

> This RFC updates methodology documentation to add Explore-Before-Ethos pattern.

### Create

None (all changes are updates to existing methodology files).

---

### Update

**`book-llms/patterns.md`** — Add Explore-Before-Ethos Pattern

Add new section after "Ethos-First Development" pattern (line ~254):

```markdown
## Explore-Before-Ethos Pattern

**When to use:** Technical feasibility unknown, novel domain, high technical risk.

**When NOT to use:** Well-understood domain, proven patterns, adding to existing system.

### The Problem

Ethos-First Development assumes you can articulate invariants from first principles. But in novel domains, you don't know what's possible until you try. Writing ETHOS prematurely risks:

- **Impossible invariants** — Discovered during implementation, requiring ETHOS rewrites
- **Over-constraining** — Overly strict invariants block valid solutions
- **Under-constraining** — Missing critical constraints because risks aren't obvious
- **Rework cost** — Rewriting ETHOS mid-implementation wastes design effort

### The Solution

Time-boxed exploration before committing to constraints:

```
1. EXPLORE (time-boxed: 1-2 days max)
   - Build throwaway spike/prototype
   - Answer: What's possible? What's not? What's expensive?
   - Test competing approaches
   - Goal: Discover technical constraints, not production code

2. DOCUMENT CONSTRAINTS
   - Capture learnings: "X is possible," "Y is impossible," "Z requires trade-off"
   - Identify which constraints are real (tech limits) vs preferences (design choices)
   - Write findings in tmp/ or similar (throwaway documentation)

3. WRITE ETHOS
   - Codify real constraints as invariants
   - Document design choices as principles
   - Decision heuristics based on real scenarios encountered
   - Now grounded in reality, not speculation

4. IMPLEMENT PROPERLY
   - Follow ETHOS (now validated)
   - Standard Ethos-First Development from here
   - ETHOS can still evolve (Same-PR principle)
   - But major constraints already validated (less rework)
```

### Decision Heuristic: Which Pattern to Use?

| Situation | Pattern | Rationale |
|-----------|---------|-----------|
| Adding to existing system, proven patterns | **Ethos-First** | Constraints knowable upfront |
| Novel architecture, unfamiliar tech | **Explore-Before-Ethos** | Technical feasibility unknown |
| First-of-its-kind feature | **Explore-Before-Ethos** | No prior art, high uncertainty |
| Multiple approaches with unclear trade-offs | **Explore-Before-Ethos** | Exploration evaluates options |
| High confidence in constraints | **Ethos-First** | Don't over-optimize for uncertainty |
| Uncertain which applies | **Lightweight Ethos-First** | Write 2-3 invariants, expand as you learn |

**Default:** Ethos-First Development (bias toward action, not analysis paralysis)

**Exception:** Explore-Before-Ethos only when uncertainty is HIGH

### Example: Testing Framework

See RFC 003 for full walkthrough comparing Ethos-First vs Explore-Before-Ethos for novel domain.

**Key difference:**
- Ethos-First: Write ETHOS → Implement → Discover constraints invalid → Rewrite ETHOS
- Explore-Before-Ethos: Explore → Validate constraints → Write ETHOS → Implement

**Time saved:** 1-3 days (avoid ETHOS rewrites)

**When it's worth it:** Novel domains (>50% of constraints uncertain). Not worth it for routine work.

### Anti-Pattern: Permanent Prototyping

**Bad:** Prototype indefinitely without committing to constraints
- No ETHOS ever written (exploration becomes implementation)
- Ad-hoc decisions without guiding principles
- Time-box violations (2 days becomes 2 weeks)
- Analysis paralysis (never confident enough to define constraints)

**Good:** Time-boxed exploration → ETHOS → implementation
- Exploration has clear goal (discover constraints)
- Time-box enforced (1-2 days max)
- ETHOS codifies learnings (captures knowledge)
- Implementation follows validated constraints

**Mitigation:** Strict time-boxing (1-2 days). After time-box, must write ETHOS even if some uncertainty remains. Perfect knowledge is impossible; "good enough" knowledge is the goal.

### Integration with Same-PR Principle

Explore-Before-Ethos still follows Same-PR principle:

- **Exploration code:** THROWAWAY (not committed to any branch)
- **Final PR:** ETHOS + PHILOSOPHY + implementation (all together)
- **ETHOS evolution:** Can still evolve during implementation (based on further learning)

**The difference:** Exploration happens BEFORE the PR branch is created, not during implementation on the branch.

**Timeline:**
```
Traditional Ethos-First:
  Create branch → Write ETHOS → Implement → Open PR (ETHOS + code)

Explore-Before-Ethos:
  Explore (no branch) → Create branch → Write ETHOS → Implement → Open PR (ETHOS + code)
```

Exploration is "pre-work" (like RFC writing), not implementation work.

### When This Pattern Adds Value

**High value (use it):**
- Novel architecture (no prior art in this codebase)
- Unfamiliar technology (team learning new framework/paradigm)
- Multiple competing approaches (unclear which is best)
- High-risk constraints (performance, security, correctness concerns)

**Low value (skip it):**
- Routine feature addition (patterns proven)
- Experienced team in familiar domain
- Constraints are obvious (no technical uncertainty)
- Time pressure (ship fast, refine later)

**Cost-benefit:**
- **Cost:** 1-2 days exploration + overhead of managing throwaway code
- **Benefit:** Avoid 1-5 days of ETHOS rewrites + implementation rework
- **Break-even:** If >30% of constraints uncertain, exploration likely pays for itself

### Related Patterns

**Complements:**
- **Ethos-First Development** — Standard pattern, Explore-Before-Ethos is exception
- **Same-PR Principle** — Both patterns follow this (organon + code land together)
- **RFC-Driven Evolution** — RFCs proposing novel domains should declare which pattern used

**Conflicts with:**
- None (this is additive, not replacing existing patterns)
```

---

**`book-llms/ETHOS.md`** — Add decision heuristic

Update "When writing an ethos" section (~line 163):

```markdown
### When writing an ethos

| Situation | Action |
|-----------|--------|
| Starting new domain with uncertain feasibility | Consider Explore-Before-Ethos pattern (1-2 day time-boxed exploration, see patterns.md) |
| Starting new domain with proven patterns | Use Ethos-First Development (standard) |
| Unsure if a constraint belongs | Ask: "Would violating this cause real harm?" If yes, include it. |
| Constraint feels obvious | Include it anyway. LLMs have no "obvious." |
| Two constraints might conflict | Add priority numbers or explicit "X trumps Y" statement. |
| File is growing large | Ensure frontmatter `token_estimate` is accurate. Ensure sections use standardized headings. Do NOT split just for size — split only when content serves different scopes or audiences. |
```

---

**`book-llms/PHILOSOPHY.md`** — Add design decision

Add new decision after existing decisions:

```markdown
### 12. Two Constraint Definition Patterns

**Choice:** Provide two patterns (Ethos-First and Explore-Before-Ethos) instead of universal one-size-fits-all

**Benefit:** Flexibility for novel domains without abandoning proven Ethos-First pattern for routine work

**Why we chose two patterns:** Originally, Ethos-First Development was universal. But we observed that novel domains (like testing framework in RFC 001) led to ETHOS rewrites when "first principles" turned out impractical. The alternatives were:
1. Accept ETHOS rewrites as normal (high rework cost)
2. Skip ETHOS until after implementation (loses guidance during development)
3. Add exploration phase before ETHOS (validates constraints upfront)

We chose option 3 for novel domains while keeping option 1 (Ethos-First) as default for known domains.

**When each applies:**
- **Ethos-First (default):** Well-understood domains, proven patterns, constraints knowable upfront
- **Explore-Before-Ethos (exception):** Novel domains, technical uncertainty, unfamiliar technology

**Trade-off:** More complexity (two patterns to choose between) vs better outcomes (less rework in novel domains). Decision heuristic in patterns.md mitigates choice paralysis.

**Risk mitigation:** Strong bias toward Ethos-First as default. Explore-Before-Ethos only when uncertainty is HIGH. Time-boxing (1-2 days) prevents analysis paralysis.

### 13. Time-Boxing Exploration

**Choice:** Strict 1-2 day time-box for exploration phase

**Benefit:** Prevents "permanent prototyping" (exploration without commitment to constraints)

**Why we chose strict time-boxing:** Exploration without limits becomes implementation. The goal of exploration is to discover constraints (learning), not build production code (execution). A strict time-box forces:
- Clear success criteria (what questions must we answer?)
- Decisive constraint codification (even with remaining uncertainty)
- Bias toward action (write ETHOS after 2 days, refine during implementation if needed)

**How to enforce:** Before exploration begins, write down:
1. Key questions to answer (3-5 max)
2. Exploration end date (1-2 days from now)
3. Commitment: "After exploration, we WILL write ETHOS regardless of confidence level"

**What if questions aren't answered?** Write ETHOS with best current knowledge, mark uncertain invariants with `judgment_call: true`, refine during implementation. Perfect knowledge is impossible; exploration gives "good enough" confidence.

**Trade-off:** May still write some imperfect invariants (uncertainty remains). But alternative (no time-box) leads to indefinite exploration, which is worse (no progress, no constraints).
```

---

### Delete

None

---

## Implementation Plan

**This RFC is documentation-only (no code changes).**

### Week 1: Core Pattern Addition

**Day 1: Draft pattern in patterns.md**
- [ ] Write "Explore-Before-Ethos Pattern" section
- [ ] Decision heuristic table (when to use which pattern)
- [ ] Example comparing Ethos-First vs Explore-Before-Ethos
- [ ] Anti-pattern: Permanent Prototyping
- [ ] Integration with Same-PR Principle

**Day 2: Update ETHOS.md**
- [ ] Add decision heuristic for pattern selection
- [ ] Add to "When writing an ethos" section

**Day 3: Update PHILOSOPHY.md**
- [ ] Add design decision: Two Constraint Definition Patterns
- [ ] Add design decision: Time-Boxing Exploration
- [ ] Explain trade-offs (flexibility vs complexity)

**Day 4: Cross-reference validation**
- [ ] Check all internal links work
- [ ] Verify no contradictions with existing patterns
- [ ] Update frontmatter token_estimate fields
- [ ] Run organon:validate-frontmatter

**Day 5: Review preparation**
- [ ] Ensure examples are concrete and actionable
- [ ] Add more decision heuristics if gaps found
- [ ] Prepare review questions for team

**Deliverable:** Methodology updated with Explore-Before-Ethos pattern

---

### Week 2: Review and Refinement

**Day 1-3: Stakeholder review**
- [ ] Share with methodology reviewers
- [ ] Gather feedback on decision heuristics (are they clear?)
- [ ] Address concerns about "too much complexity"
- [ ] Iterate on wording/examples

**Day 4: Finalize**
- [ ] Incorporate feedback
- [ ] Final consistency check
- [ ] Update RFC status: Draft → Accepted

**Day 5: Merge**
- [ ] Merge PR with all updates
- [ ] Update RFC 003 status: Accepted → Implemented
- [ ] Update changelog
- [ ] Close RFC

**Deliverable:** RFC completed, methodology updated, team aligned

---

## Design Decisions

### Decision 1: Pattern Addition, Not Pattern Replacement

**Choice:** Add Explore-Before-Ethos as alternative, keep Ethos-First as default

**Rationale:**
- Ethos-First works well for most cases (proven patterns, familiar domains)
- Only novel domains need exploration
- Replacing Ethos-First entirely would be overkill

**Benefit:** Backward compatible, low disruption

**Trade-off:** More complexity (two patterns), but decision heuristic mitigates

---

### Decision 2: Strict Time-Boxing (1-2 Days)

**Choice:** Mandatory time-box, not open-ended exploration

**Rationale:**
- Without time-box, exploration becomes implementation (analysis paralysis)
- Forces decisive constraint codification
- Prevents "we're still exploring" indefinitely

**Benefit:** Bias toward action, predictable timeline

**Trade-off:** May write ETHOS with remaining uncertainty, but preferable to no ETHOS

---

### Decision 3: Exploration Code is Throwaway

**Choice:** Exploration produces knowledge (constraints), not production code

**Rationale:**
- If exploration code is kept, it becomes implementation (no clean separation)
- Throwaway code liberates experimentation (no quality bar, no tests)
- Same-PR principle preserved (PR contains ETHOS + proper implementation)

**Benefit:** Clear phases (explore → define → implement), no "should we keep this spike?" debates

**Trade-off:** Feels wasteful (throwaway work), but exploration cost is low (1-2 days)

---

### Decision 4: Default to Ethos-First

**Choice:** Ethos-First is default, Explore-Before-Ethos is exception

**Rationale:**
- Bias toward action (don't over-optimize for uncertainty)
- Most work is routine (proven patterns)
- Exploration adds overhead (only worth it for high uncertainty)

**Benefit:** Low cognitive overhead (most devs use standard Ethos-First)

**Trade-off:** Some teams may under-use Explore-Before-Ethos (miss benefits), but better than over-using it (analysis paralysis)

---

## Success Metrics

- [ ] **Pattern adoption** — ≥3 novel domain RFCs report using Explore-Before-Ethos within 6 months
- [ ] **Reduced rework** — RFCs using Explore-Before-Ethos report <20% ETHOS rewrites (vs historical ~40-60% for novel domains)
- [ ] **Time-box compliance** — ≥80% of explorations complete within 1-2 day time-box
- [ ] **Clarity** — Team surveys report clarity on when to use which pattern (≥8/10 on "I know when to explore vs define")
- [ ] **No over-use** — <30% of RFCs use Explore-Before-Ethos (most use standard Ethos-First, pattern stays exceptional)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Teams over-use exploration (everything is "novel") | High | Strong bias toward Ethos-First as default. Decision heuristic emphasizes "routine work = Ethos-First." |
| Exploration violates time-box (2 days becomes 2 weeks) | High | Mandatory time-box commitment before starting. Write ETHOS after 2 days regardless of confidence level. |
| Exploration code becomes production code (not throwaway) | Medium | Explicit guidance: exploration produces knowledge, not production code. Same-PR principle enforced. |
| Pattern selection paralysis ("Which pattern should I use?") | Medium | Clear decision heuristic table. Default to Ethos-First if uncertain. |
| Teams skip ETHOS entirely ("we're still exploring") | High | Time-box forces transition. After exploration, MUST write ETHOS (even if uncertain). |
| Too much complexity (two patterns vs one) | Medium | Documentation emphasizes "Ethos-First for most work, Explore-Before-Ethos for rare novel domains." Keep it exceptional. |

---

## Open Questions

### Resolved (Pre-RFC)

1. ✅ **Should this be in RFC 002 or separate?** → Separate (different concerns, independent review)
2. ✅ **What's the right time-box?** → 1-2 days (enough to discover constraints, short enough to force decision)
3. ✅ **Should exploration code be kept or thrown away?** → Thrown away (exploration produces knowledge, not production code)

### Still Open

1. **Should RFCs declare which pattern was used?**
   - **Options:**
     - (A) Add to RFC frontmatter: `development_pattern: ethos-first | explore-before-ethos`
     - (B) Optional mention in "Approach" section
     - (C) No declaration (internal choice)
   - **Recommendation:** (B) Optional mention if Explore-Before-Ethos used (helps future RFCs learn), no frontmatter field (too much metadata)

2. **Should organon-tools provide exploration scaffolding?**
   - **Options:**
     - (A) Add `organon explore` command that creates tmp/exploration-YYYYMMDD.md template
     - (B) Just documentation, no tooling
   - **Recommendation:** (B) for V1 (keep it simple), (A) for V2 if pattern is widely adopted

3. **What if exploration reveals the whole RFC approach is wrong?**
   - **Should RFC be withdrawn?**
   - **Or should exploration findings trigger RFC revision?**
   - **Recommendation:** If exploration shows approach is fundamentally flawed, withdraw RFC and start fresh. If exploration just reveals constraints, update RFC's "Proposed Solution" before team review.

---

## Dependencies

**Blocks:**
- Future RFCs proposing novel domains (can reference this pattern)
- Potential tooling for exploration scaffolding (if we build `organon explore`)

**Blocked by:**
- None (can implement immediately)

**Related work:**
- RFC 002 (Recursive Collaboration Pattern) — Affects EXECUTE phase, this RFC affects DEFINE phase (complementary, both support recursive improvement)
- RFC 001 (Testing Framework) — Example of novel domain that could have benefited from exploration

---

## Related Files

| File | Relationship |
|------|--------------|
| [book-llms/patterns.md](../book-llms/patterns.md) | Updated to include Explore-Before-Ethos pattern |
| [book-llms/ETHOS.md](../book-llms/ETHOS.md) | Updated with decision heuristic for pattern selection |
| [book-llms/PHILOSOPHY.md](../book-llms/PHILOSOPHY.md) | Updated with design decisions for two-pattern approach |
| [rfcs/001-testing-framework.md](./001-testing-framework.md) | Example of novel domain that would use Explore-Before-Ethos |
| [rfcs/002-compound-engineering-integration.md](./002-compound-engineering-integration.md) | Complementary RFC: Recursive Collaboration Pattern (affects EXECUTE phase, this affects DEFINE phase) |

---

## Approval Process

**Review criteria:**
- [ ] Pattern is clearly defined with concrete examples (Scenario A vs B comparison)
- [ ] Decision heuristic provides clear guidance (no ambiguity about when to use which pattern)
- [ ] Time-boxing mechanism prevents analysis paralysis (mandatory 1-2 day limit)
- [ ] Integration with RFC 002 is clear (DEFINE phase, supports recursive improvement)
- [ ] Ethos-First remains default (Explore-Before-Ethos stays exceptional, <30% usage expected)
- [ ] Changes are backwards-compatible (existing organons remain valid, additive pattern)
- [ ] No contradictions with existing methodology (aligns with Same-PR principle, dogfooding)
- [ ] Success metrics are measurable (pattern adoption, reduced rework, time-box compliance)

**Reviewers:**
- [ ] @organon-methodology (methodology coherence, pattern consistency)
- [ ] @rfc-authors (practical perspective: would this help?)
- [ ] @early-adopters (user feedback on complexity vs value)

**Timeline:**
- Draft complete: 2026-02-10
- Review period: 1 week (parallel with RFC 002)
- Target acceptance: 2026-02-17
- Implementation start: 2026-02-18
- Delivery: 2026-02-25 (1 week implementation)

---

## Next Steps

1. **Request review** — Share RFC with stakeholders for feedback
2. **Iterate on open questions** — Decide on RFC frontmatter field, tooling, withdrawal criteria
3. **Acceptance vote** — Methodology team approval required to proceed
4. **Begin implementation** — Week 1: Pattern addition, ETHOS/PHILOSOPHY updates
5. **Validate consistency** — Cross-reference checks, frontmatter validation
6. **Merge and close** — Update RFC status to Implemented, merge PR

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-10 | Initial draft | Claude Sonnet 4.5 |
