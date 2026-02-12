# Writing Organon Files

This guide covers how to author ETHOS.md, PHILOSOPHY.md, and PROTOCOL.md files with correct frontmatter, standardized sections, and proper scope inheritance.

---

## Table of Contents

- [Three Artifacts: When to Create Each](#three-artifacts-when-to-create-each)
- [Frontmatter](#frontmatter)
- [Writing ETHOS.md](#writing-ethosmd)
- [Writing PHILOSOPHY.md](#writing-philosophymd)
- [Writing PROTOCOL.md](#writing-protocolmd)
- [Scope and Inheritance](#scope-and-inheritance)
- [README-as-Router Pattern](#readme-as-router-pattern)
- [Validating Your Work](#validating-your-work)
- [Common Anti-Patterns](#common-anti-patterns)

---

## Three Artifacts: When to Create Each

| Artifact | Question it answers | When to create |
|----------|-------------------|----------------|
| **ETHOS.md** | "What must be true?" | Always — every scope needs one |
| **PHILOSOPHY.md** | "Why did we choose this?" | When trade-offs need documented reasoning |
| **PROTOCOL.md** | "How do we do this?" | When a task must be done the same way every time |

**The ethos-first workflow:** Write ETHOS.md before implementing. It forces clarity about constraints. After implementation, write PHILOSOPHY.md to explain decisions. Add PROTOCOL.md when repeatable procedures emerge.

---

## Frontmatter

Every organon file starts with YAML frontmatter. This is what makes progressive disclosure work — agents read ~25-50 tokens of metadata to decide whether to load the full file.

### Required fields (all files)

```yaml
---
type: constraints        # constraints | rationale | procedures | navigation | mapping
scope: domain            # product | domain | feature | component | meta | methodology
name: billing            # Kebab-case, must match parent directory name
version: "1.0"           # Semantic version "X.Y"
summary: Behavioral constraints for the billing domain   # Max 200 chars
token_estimate: 800      # Approximate full-file token count
---
```

### ETHOS.md additional fields

```yaml
invariants_count: 5               # Must match actual invariant count
principles_count: 3               # Must match actual principle count
heuristics_count: 4               # Must match actual heuristic table rows
invariants:                       # Stable invariant registry
  - id: INV-BILLING-1
    name: amounts-never-negative
  - id: INV-BILLING-2
    name: currency-always-explicit
    judgment_call: true            # Requires human review, not automated testing
inherits_from: [product]          # Parent scope names
load_priority: high               # high | medium | low
required_for:                     # Task types that need this file
  - billing_implementation
audience: [llm, human]            # Who consumes this
```

### PHILOSOPHY.md additional fields

```yaml
decision_count: 4                 # Number of design decisions
explains_invariants: [INV-BILLING-1, INV-BILLING-2]  # Which invariants this explains
inherits_from: [product]
audience: [llm, human]
```

### PROTOCOL.md additional fields

```yaml
protocols_count: 2                # Number of protocols in this file
protocols:
  - id: PROTO-BILLING-1
    name: Invoice Generation
    steps: 5
    automation_tier: automated    # automated | semi-automated | manual
    workflow: generate-invoice    # Required if automation_tier == automated
    tools: [billing:generate, billing:validate]
    complexity: medium
inherits_from: [product]
audience: [llm, human, tooling]
```

### Relationship fields (optional but recommended)

```yaml
related_domains: [payments, tenants]
related_features: [invoicing, reporting]
primary_rfcs: [5, 12]            # RFCs that shaped this organon
related_files:
  - PHILOSOPHY.md
  - ../features/invoicing/ETHOS.md
```

---

## Writing ETHOS.md

ETHOS.md uses four standardized sections. These headings are a contract — agents rely on them for section-level loading. Do not rename or reorder them.

### Identity (IS / IS NOT)

Start with explicit boundaries. This prevents scope creep and helps LLMs know what's out of bounds.

```markdown
## Identity

### What Billing IS

- The bounded context for all financial transactions
- Owner of invoice lifecycle (creation, payment, cancellation)
- Source of truth for pricing and tax calculations

### What Billing IS NOT

- Not a payment gateway (we integrate with Stripe)
- Not an accounting system (we export to QuickBooks)
- Not responsible for user subscription management (that's the tenants domain)
```

**Test:** For any proposed action, can you answer "Does this fit the IS and avoid the IS NOT?" If unclear, your boundaries need refinement.

### Invariants

Numbered rules that must never be violated. Each invariant should be testable — if it can't be verified, it belongs in principles or heuristics instead.

```markdown
## Invariants

1. **Amounts are never negative.** All monetary amounts (invoice totals, line items, taxes) must be >= 0. Use unsigned types or validation.

2. **Currency is always explicit.** No implicit USD. Every monetary value carries its currency code (ISO 4217).

3. **Invoices are immutable after sending.** Once an invoice is sent to a customer, the original is never modified. Corrections use credit notes.
```

Each invariant in the body must match an entry in the frontmatter `invariants` array. The `invariants_count` must match the actual count.

### Principles (Prioritized)

Guidelines for making decisions. Lower number = higher priority. When principles conflict, lower number wins.

```markdown
## Principles (Prioritized)

1. **Correctness over performance.** A slow correct invoice beats a fast wrong one.

2. **Auditability over convenience.** Every state change must be traceable. No silent mutations.

3. **Defensive calculations.** Round at the end, not at each step. Use decimal types, not floats.
```

### Decision Heuristics

Pre-computed answers for recurring situations. Format: "When [situation], [action]."

```markdown
## Decision Heuristics

| Situation | Action |
|-----------|--------|
| Rounding ambiguity | Round half-up, at the invoice total level |
| Tax rate unknown | Fail the invoice generation (don't default to 0%) |
| Currency mismatch in multi-line invoice | Reject — all lines must use same currency |
| Performance vs accuracy trade-off | Choose accuracy (principle 1) |
```

---

## Writing PHILOSOPHY.md

PHILOSOPHY.md explains *why* things are the way they are. Write one when you've made non-obvious trade-offs that future developers need to understand.

### The Problem

Describe the pain that motivated these decisions.

```markdown
## The Problem

Invoice generation was our most error-prone process:
- Currency conversion bugs caused $47K in losses in Q2
- Floating-point rounding created 1-cent discrepancies on 15% of invoices
- Silent mutation of sent invoices led to audit failures
```

### The Bet

State the core approach and why you believe it works.

```markdown
## The Bet

By treating invoices as immutable events and using decimal arithmetic everywhere,
we eliminate entire categories of financial bugs at the cost of slightly more
complex data models.
```

### Design Decisions

Numbered decisions with rationale. Each decision should connect to an invariant or principle.

```markdown
## Design Decisions

### 1. Decimal Types Over Floats

We use `Decimal` for all monetary calculations, never `number` or `float`.

**Rationale:** IEEE 754 floats cannot represent 0.1 exactly. In financial
calculations, this causes accumulating rounding errors. Decimal types
are slower but correct.

### 2. Immutable Invoice Model

Sent invoices are never modified. Corrections create credit notes.

**Rationale:** Mutating historical financial records violates accounting
principles and audit requirements. The credit note pattern is standard
in accounting software.
```

### Trade-offs

Make costs explicit. Every benefit has a trade-off.

```markdown
## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Decimal arithmetic | Eliminates rounding bugs | 3-5x slower than float math |
| Immutable invoices | Audit-safe, traceable | More complex correction flow |
| Explicit currency | No conversion bugs | Verbose API surface |
```

---

## Writing PROTOCOL.md

PROTOCOL.md contains step-by-step procedures. Write one when a task must be done consistently and has enough steps to warrant documentation.

```markdown
# Protocol: Invoice Generation

> Generate and validate a customer invoice from line items.

---

## Goal

A validated, correctly-calculated invoice ready for sending to the customer.

---

## Preconditions

Before starting, verify:

- [ ] Customer has a valid billing profile
- [ ] All line items have explicit currency codes
- [ ] Tax rates are configured for the customer's jurisdiction

---

## Steps

1. **Load customer profile.** Fetch billing address, tax ID, preferred currency.

2. **Validate line items.** Confirm all items use the customer's currency. Reject on mismatch.

3. **Calculate subtotals.** Sum line items using decimal arithmetic. Do not round yet.

4. **Apply taxes.** Calculate tax per jurisdiction. Add to subtotal.

5. **Round total.** Round the final total to 2 decimal places (half-up).

   **Decision point:** If total is $0.00, flag for review instead of sending.

6. **Generate PDF.** Create invoice document from template.

7. **Store and send.** Persist the immutable invoice record, then send to customer.

---

## Verification

After completion, confirm:

- [ ] Invoice total matches sum of line items + taxes
- [ ] Currency code is explicit on the invoice
- [ ] Invoice record is stored before sending
- [ ] No floating-point types used in calculation path
```

---

## Scope and Inheritance

Organons form a hierarchy. Child scopes inherit all parent constraints and can add new ones but never contradict them.

```
Product ETHOS.md          →  "Use conventional commits"  (everyone follows this)
    ↓ inherits
Domain billing/ETHOS.md   →  "Amounts never negative"   (billing-specific)
    ↓ inherits
Feature invoicing/ETHOS.md →  "Invoices immutable"      (invoicing-specific)
```

**Rules:**
1. Child inherits all parent constraints — don't repeat them
2. Child can add constraints beyond the parent
3. Child can never relax a parent constraint
4. More specific scope wins for ambiguity

**In frontmatter:** Declare inheritance with `inherits_from`:

```yaml
inherits_from: [product]          # For domain-level
inherits_from: [product, billing] # For feature under billing domain
```

---

## README-as-Router Pattern

Every directory with organon files needs a `README.md` that serves as navigation. READMEs are routers, not content — keep them under ~100 lines.

```markdown
---
type: navigation
scope: domain
name: billing
version: "1.0"
summary: Navigation for billing domain organon files
token_estimate: 150
provides: [constraints, rationale, protocols]
parent: domains
audience: [llm, human]
---

# Billing Domain

Organon files for the billing bounded context.

## Contents

| Path | Type | Description |
|------|------|-------------|
| [ETHOS.md](./ETHOS.md) | constraints | Billing invariants and principles |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | rationale | Why billing is designed this way |
| [protocols/](./protocols/) | procedures | Invoice generation, refund processing |
```

---

## Validating Your Work

After creating or editing organon files, run validation:

```bash
# Validate frontmatter (catches schema errors, count mismatches, bad references)
organon validate

# Check overall health score
organon health

# Run all verification gates
organon verify
```

Common validation errors and fixes:

| Error | Fix |
|-------|-----|
| `invariants_count` mismatch | Update the count in frontmatter to match actual invariants |
| `name` doesn't match directory | Change `name` to match the parent directory name (kebab-case) |
| Missing `token_estimate` | Add `token_estimate` (use ~12 tokens/line as heuristic) |
| Broken `inherits_from` reference | Ensure the referenced parent organon exists |

---

## Common Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| ETHOS without IS/IS NOT | LLM doesn't know boundaries | Add Identity section first |
| Unprioritized principles | Can't resolve conflicts | Number by priority |
| Philosophy without trade-offs | Decisions seem arbitrary | Document what you sacrificed |
| Missing frontmatter | Forces all-or-nothing loading | Add frontmatter with required fields |
| Repeating parent constraints | Maintenance burden, divergence risk | Delete duplicates, rely on inheritance |
| Splitting files just for size | Breaks coherence | Keep cohesive content together; use sections |
| Open enforcement loop | Protocol exists but nothing verifies it | Add workflow binding + verification tool |

For the full anti-pattern catalog, see [book-llms/ETHOS.md](../book-llms/ETHOS.md#anti-patterns).

---

## Next Steps

- [Testing Invariants](./05-testing-invariants.md) — Write tier-4 tests to enforce your invariants
- [CLI Reference](./03-cli-reference.md) — Full command documentation
- [Glossary](./07-glossary.md) — Term definitions
