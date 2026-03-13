---
type: rationale
scope: meta
name: three-layer-architecture
version: "1.4"
summary: The enforcement loop — protocols, bindings, tools, and verification connect organon constraints to code and tests
token_estimate: 12200
inherits_from: [meta-organon]
load_priority: high
required_for:
  - protocol_creation
  - tool_creation
  - methodology_enforcement
audience: [llm, human, tooling]
related_files:
  - patterns.md
  - invariant-tracking.md
  - ETHOS.md
---

# The Enforcement Loop: Protocols → Workflows → Tools

> How the Organon methodology becomes executable. Protocols define what must happen, workflows bind protocols to LLM execution, tools perform atomic operations, and verification closes the loop.

---

## The Problem

Documentation that isn't enforced becomes fiction. Organon files can define constraints, principles, and procedures — but without a mechanism to execute and verify them, they drift:

| Symptom | Cause |
|---------|-------|
| LLM ignores invariants during implementation | No binding between organon constraints and agent behavior |
| Protocol steps skipped or reordered | Protocols are prose, not executable workflows |
| Verification happens manually (or not at all) | No automated tools to check invariant compliance |
| Methodology is "known" but not followed | No enforcement loop — knowledge exists but isn't actionable |
| Each session reinvents the process | No persistent workflow that carries methodology across interactions |

**The core problem:** Declarative knowledge (organons) sits disconnected from imperative execution (what the LLM actually does). Without a binding layer, methodology compliance depends on the LLM "remembering" to follow the rules.

---

## The Solution: Three Layers, One Loop

Three layers bind declarative knowledge to executable behavior. Together they form a closed enforcement loop:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌───────────────────────┐                                     │
│   │  PROTOCOLS            │  Layer 1: Declarative Knowledge     │
│   │  (Organon Files)      │  "WHAT must happen"                 │
│   │                       │  PROTOCOLS.md in organon hierarchy   │
│   │  - Numbered steps     │  Technology: Markdown (universal)    │
│   │  - Automation tier    │                                     │
│   │  - Verification gates │                                     │
│   └───────────┬───────────┘                                     │
│               │ codifies as                                     │
│               ▼                                                 │
│   ┌───────────────────────┐                                     │
│   │  WORKFLOWS            │  Layer 2: Agent Binding             │
│   │  (Agent Config)       │  "HOW to orchestrate"               │
│   │                       │  Agent-specific workflow bindings     │
│   │  - Tool sequencing    │  Technology: Varies by agent        │
│   │  - Error handling     │                                     │
│   │  - Context loading    │                                     │
│   └───────────┬───────────┘                                     │
│               │ invokes                                         │
│               ▼                                                 │
│   ┌───────────────────────┐                                     │
│   │  TOOLS                │  Layer 3: Atomic Operations         │
│   │  (Project Infra)      │  "HOW to execute"                   │
│   │                       │  CLI commands, MCP tools, scripts   │
│   │  - Idempotent         │  Technology: Varies by project      │
│   │  - Fast feedback      │                                     │
│   │  - Composable         │                                     │
│   └───────────┬───────────┘                                     │
│               │ produces results                                │
│               ▼                                                 │
│   ┌───────────────────────┐                                     │
│   │  VERIFICATION         │  The Loop Closer                    │
│   │                       │  "DID it work?"                     │
│   │  - Invariant checks   │  Tools verify organon compliance    │
│   │  - Reference validity │  Results feed back to LLM + human   │
│   │  - Freshness gates    │                                     │
│   └───────────┬───────────┘                                     │
│               │ feeds back to                                   │
│               └──────────────────────────────────────── ↑ ──────┘
```

**The enforcement loop is what makes organons real.** Without it, organons are suggestions. With it, they're enforced constraints.

---

## Layer 1: Protocols (Declarative Knowledge)

**What they are:** Natural language procedures documented in PROTOCOLS.md files within the organon hierarchy. Technology-agnostic — they describe *what must happen*, not *how to execute it*.

**Where they live:** `organon/methodology/<domain>/PROTOCOLS.md`, `organon/domains/<domain>/PROTOCOLS.md`

**What they contain:**

```yaml
# In PROTOCOLS.md frontmatter
protocols:
  - id: PROTO-DEPLOY-1
    name: Deploy to Production
    steps: 4
    automation_tier: automated    # automated | semi-automated | manual
    tools: [organon:verify, organon:health, deploy:run]
    complexity: medium
```

```markdown
# In PROTOCOLS.md body

## Protocol 1: Deploy to Production

### Phase 0: Pre-flight
1. Run organon verify — all gates must pass
2. Run organon health — score must be ≥ 80

### Phase 1: Deploy
1. Run deploy:run with target environment

### Phase 2: Verification
1. Run smoke tests against deployed environment
2. Confirm all critical paths respond

### Phase 3: Completion
1. Tag the release, update deployment log
```

**Key properties:**
- **Authoritative:** The protocol is the source of truth for the procedure. Workflows implement it; they don't redefine it.
- **Technology-agnostic:** Protocols describe *what*, not *which npm script*. Tools are referenced by logical name, not by invocation syntax.
- **Versioned:** Protocol changes are tracked via organon version markers.
- **Automation-tiered:** Every protocol declares how much automation it supports.

### Automation Tiers

Not every protocol needs a workflow. Use these criteria:

| Tier | Criteria | Workflow? | Tool? | Example |
|------|----------|-----------|-------|---------|
| **Automated** | ≥5 steps, cross-domain, error-prone, frequent | Yes | Yes | Release pipeline (5 phases, frequent) |
| **Semi-automated** | 1-2 steps, single tool, infrequent | No | Yes | Regenerate components.md |
| **Manual** | Judgment required, context-dependent | No | No | Emergency hotfix decisions |

**Decision factors:**
- **Complexity:** ≥5 steps → strong candidate for workflow
- **Frequency:** Daily/weekly → automate; monthly → maybe; rare → no
- **Error risk:** Many edge cases → automate for consistency
- **Cross-domain:** Touches multiple systems → orchestration value is high
- **Judgment:** Requires human context → keep manual

**Decision flowchart** (priority order):

```
1. Does it require human judgment/discretion at each execution?
   → YES: Manual (no tools, no workflow)

2. Is it <3 steps AND infrequent (<monthly)?
   → YES: Manual

3. Is it a single tool invocation (1-2 steps)?
   → YES: Semi-automated (tool only, no workflow)

4. Is it ≥5 steps OR daily/weekly OR error-prone OR cross-domain?
   → YES: Automated (workflow + tools)

5. Otherwise:
   → Semi-automated or Manual (lean toward manual)
```

**Examples:**
- "Run `organon generate components.md`" → 1 step, infrequent → **Semi-automated** (tool exists, no workflow needed)
- "Release pipeline" → 5 phases, frequent, cross-domain → **Automated** (needs workflow orchestration)
- "Emergency hotfix decision" → Judgment required → **Manual** (no automation)

---

## Layer 2: Bindings (Agent Execution)

**What they are:** The mechanism that connects protocol declarations to LLM execution. A binding can be an agent skill, a system prompt directive, a runbook, a CI/CD pipeline, or any other discoverable format — Organon does not prescribe the format.

**What Organon cares about:** The protocol declares intent (`PROTO-DEPLOY-1: Deploy to Production`). The binding connects that declaration to execution. The specific format is up to the project and the agent technology.

**The minimal contract:** Any binding should reference its protocol (by ID or file path) so the traceability chain is intact: Protocol → Binding → Tools → Verification.

| Binding format | Example |
|----------------|---------|
| Agent skill | `.claude/skills/deploy/skill.md` |
| System prompt | `CLAUDE.md` inline instructions |
| Runbook | `organon/workflows/deploy.md` |
| CI/CD job | GitHub Actions workflow |
| Git hook | `pre-push` script |

The protocol and tool layers are universal. The binding layer is the only layer that varies by agent technology.

---

## Layer 3: Tools (Atomic Operations)

**What they are:** Individual executable operations that perform specific tasks. Each tool does ONE thing. Workflows compose tools into procedures.

**The universal contract:** Regardless of implementation technology, all tools must:

1. **Be atomic** — one tool, one operation
2. **Be idempotent** — safe to re-run (regenerate, validate, verify)
3. **Provide fast feedback** — most complete in <10 seconds
4. **Be composable** — tools combine via workflows to form procedures
5. **Use consistent naming** — `domain:action` pattern (e.g., `organon:verify`, `rfc:context`)

### Tool implementations by technology

| Technology | Example | When to use |
|------------|---------|-------------|
| npm scripts | `"organon:verify": "tsx scripts/organon/verify.ts"` | Node.js projects |
| CLI commands | `organon verify --gate=dual-mapping` | Published CLI tools |
| MCP tools | MCP server exposing `organon_verify` | IDE integration |
| Shell scripts | `./scripts/verify-organon.sh` | Polyglot projects |
| Makefile targets | `make organon-verify` | C/C++/Go projects |
| Python scripts | `python scripts/organon/verify.py` | Python projects |

### Tool categories for Organon enforcement

Any project using Organon should have tools for:

| Category | Purpose | Example tools |
|----------|---------|---------------|
| **Generation** | Create/update derived files | `organon:generate`, `organon:generate-frontmatter` |
| **Verification** | Check invariant compliance | `organon:verify`, `organon:validate-frontmatter` |
| **Discovery** | Navigate the organon hierarchy | `organon:find`, `organon:query` |
| **Health** | Monitor system integrity | `organon:health`, `organon:test-coverage` |
| **Triplet integrity** | Verify protocol↔workflow↔tool bindings | `organon:verify-triplets` |
| **Automation analysis** | Identify protocols that should be automated | `organon:suggest-tools` |

---

## The Enforcement Loop

The three layers form a closed loop that makes the methodology self-enforcing:

```
┌──────────────────────────────────────────────────────────────┐
│  1. DEFINE                                                   │
│     Human encodes intent as organon constraints + protocols  │
│     → ETHOS.md, PROTOCOLS.md                                 │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  2. BIND                                                     │
│     Code and tests reference invariant IDs                   │
│     → @organon-invariant annotations, binding layer          │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  3. EXECUTE                                                  │
│     LLM works within the encoded constraints                 │
│     → Implements code, writes tests, invokes tools           │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  4. VERIFY                                                   │
│     Tools check organon compliance, invariants hold          │
│     → Verification results: pass/fail per gate               │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       └──────────────── back to DEFINE ───────→
```

### Why the loop matters

**Without the loop:** Organons are documentation. LLMs read them, maybe follow them, maybe don't. No way to know. Drift accumulates silently.

**With the loop:** Organons are enforced constraints. Every implementation goes through Define → Bind → Execute → Verify. Violations are caught by tools, flagged by verification, and fed back to the LLM.

### The LLM's role in the loop

The LLM is the **runtime** that executes the enforcement loop. It is the interface between:

- **Human intent** — captured in organons (ETHOS, PHILOSOPHY, PROTOCOLS)
- **Automated enforcement** — performed by tools (verify, generate, test)
- **Code changes** — the actual implementation work

The human's job is to **define** (write organons) and **review** (approve results). The LLM's job is to **execute** (follow workflows, invoke tools) and **report** (surface verification results). The tools' job is to **enforce** (check invariants, validate references, gate merges).

This is what makes Organon **LLM-centric**: the methodology is designed to be consumed and executed by LLMs, with humans as authors and reviewers, not as the execution engine.

---

## Epistemic Categories

Organon files implicitly encode three epistemic categories — types of knowledge that serve different purposes in the enforcement loop. Making these explicit enables interoperability with external knowledge systems and provides an alternative query lens on existing data.

### The three categories

| Category | Definition | What it captures | Organon mapping |
|----------|-----------|-----------------|-----------------|
| **Constraint** | Normative declaration — what *should* be true | Design intent, architectural boundaries, behavioral limits | ETHOS.md invariants (`type: constraints`) |
| **Assertion** | Descriptive claim — what *is* empirically observed | Learnings, measured outcomes, discovered patterns | User-defined rationale files |
| **Rule** | Enforcement logic — what *must* hold, checked automatically | Verification gates, protocol steps, CI checks | PROTOCOL.md procedures (`type: procedures`) |

**These are not new artifact types.** They are an epistemic lens on existing artifacts. An ETHOS.md file is still `type: constraints` — but its epistemic category is "constraint."

### Lifecycle through the enforcement loop

Each category maps to specific phases of the enforcement loop:

```
Category        Primary loop phase      How it enters the loop
─────────────   ──────────────────      ──────────────────────
Constraint      DEFINE                  Human writes ETHOS.md invariant
Rule            VERIFY                  Gate checks constraint against code
Assertion       (user-defined)          External to the core loop
```

**Constraints** are created in DEFINE and consumed in VERIFY (gates check whether code satisfies them). **Rules** are created alongside tools in the BIND/EXECUTE phases and operate in VERIFY. **Assertions** are optional user-defined learnings — Organon provides the export format but does not prescribe how they are captured.

### Knowledge interoperability

The `organon export` command produces a structured JSON representation classified by epistemic category. This is the interoperability surface — external knowledge systems consume this instead of parsing organon files directly.

**Export format:**

```json
{
  "version": "0.5.2",
  "exported_at": "2026-02-15T...",
  "entities": [
    { "id": "organon:domains/tools/ETHOS", "kind": "organon-file", "name": "tools", "scope": "domain", "type": "constraints", "category": "constraint" }
  ],
  "assertions": [
    { "id": "inv:INV-TOOLS-1", "category": "constraint", "source": "organon/domains/tools/ETHOS.md", "predicate": "declares_invariant", "content": "..." }
  ],
  "relationships": [
    { "source": "organon:domains/tools/ETHOS", "predicate": "inherits_from", "target": "organon:ETHOS" }
  ],
  "rules": [
    { "id": "gate:frontmatter", "predicate": "validates", "targets": ["all organon files"], "type": "blocking" }
  ]
}
```

**Design principle:** The export format is a projection, not a database. It contains enough structure for external tools to build their own indexes, but organon files remain the source of truth. Re-exporting always produces a fresh snapshot.

---

## Bidirectional References (Invariant)

Organon files and code must reference each other. This is a hard invariant — not optional.

**Protocol → Test:** A protocol declaring an invariant must have at least one `@organon-invariant` annotated test verifying it.

**Test → Protocol:** Each annotated test references a stable invariant ID (`INV-SCOPE-N`) that exists in an ETHOS.md file.

**Organon → Code:** Domain organons reference the code they constrain (via components.md or direct paths).

**Why bidirectional:** Prevents orphaned constraints (invariant declared but never tested), phantom coverage (test references a non-existent invariant), and silent drift between what the organon says and what the code does.

---

## Verification: The Loop Closer

Verification is what distinguishes an enforcement loop from wishful thinking. Without automated verification, the loop is open — protocols say what should happen, but nothing checks whether it did.

### Verification categories

| Category | What it checks | Example |
|----------|----------------|---------|
| **Reference integrity** | File paths and organon references resolve | `organon:verify` |
| **Frontmatter truthfulness** | Counts match actual content, token estimates are accurate | `organon:validate-frontmatter` |
| **Freshness** | Auto-generated files are not stale | Timestamp checks on components.md |
| **Invariant coverage** | Every invariant in ETHOS.md has a corresponding `@organon-invariant` test | `organon:test-coverage` |
| **Health** | Overall system integrity score | `organon:health` |

### Verification as CI gate

Verification should fail builds, not just warn:

```
PR opened → CI runs verification tools → Pass: merge allowed. Fail: merge blocked.
```

This is the ultimate enforcement: code cannot land if the organon is violated.

### Tiered testing

A universal 4-tier model, technology-agnostic:

| Tier | Scope | Coverage Target | What It Tests |
|------|-------|-----------------|---------------|
| **Tier 1: Unit** | Individual functions | >90% | Behavior of isolated units |
| **Tier 2: Integration** | Cross-module interactions | >80% | Module boundaries and contracts |
| **Tier 3: End-to-end** | Critical user paths | Key paths covered | System behavior from external perspective |
| **Tier 4: Organon** | Invariant compliance | 100% invariant coverage | That organon constraints hold in code |

**Tier 4 is the novel concept.** Organon tests verify that the codebase satisfies the invariants declared in ETHOS.md files. They come in two sub-types:

**Structural organon tests** — verify metadata, references, and file organization. Automatable from frontmatter and directory structure alone. Universal across projects.

- "Every domain has an ETHOS.md" → test scans directory structure
- "All automated protocols have workflow bindings" → test checks frontmatter cross-references
- "No orphaned workflows" → test validates bidirectional references
- "Frontmatter counts match actual content" → test parses and counts

**Semantic organon tests** — verify that code *behavior* satisfies declared invariants. Require understanding what the invariant means in code. Project-specific — someone must write the mapping from invariant to code assertion.

- "Cache TTL max 24h" → test asserts no config value exceeds 86400
- "Modules are pure functions" → test asserts no side-effect imports in module files
- "All public APIs are backwards-compatible" → test compares exported signatures against baseline

Structural tests are cheap and universal. Semantic tests are expensive and project-specific. But semantic tests are the only defense against behavioral drift — where code changes violate an invariant without any structural signal.

**Reference implementation:** `@organon-methodology/testing` (TypeScript, `packages/testing/`) provides pre-built assertions for common semantic test patterns (`assertMaxValue`, `assertNoSideEffects`, `assertFileExists`). The `testInvariant()` wrapper links each test to its invariant ID for coverage tracking. See [invariant-tracking.md](./invariant-tracking.md) for the full specification.

**Heuristic:** When writing a new invariant, ask: "Can a test verify this against code?" If yes, write the semantic test. If no, it's a judgment-call invariant — document how humans should review it.

**Language-agnostic annotation:** Mark tier-4 tests with an `@organon-invariant` annotation (or language-equivalent: decorator, tag, comment convention) referencing the specific invariant they verify. This enables coverage tracking — every invariant in ETHOS.md should map to at least one test (structural or semantic).

**Test organization and discovery:**

- **File location:** Tier-4 tests live alongside tier 1-3 tests in the project's test suite (e.g., `test/organon/`, `__tests__/organon/`, `spec/organon_spec.rb`)
- **Discovery:** Test runner finds tier-4 tests via annotation scan (search test files for `@organon-invariant` pattern)
- **Naming convention:** Prefix test names with scope for clarity: `test_{scope}_{invariant_name}` where scope = frontmatter scope (product, meta, domain, feature, component) and invariant_name = kebab-case description (e.g., `test_product_cache_ttl_max_24h`, `test_meta_ethos_required`)
- **Failure format:** When tier-4 test fails, error message must include:
  - Invariant ID violated (e.g., `INV-CACHE-3`)
  - Invariant description from ETHOS.md
  - Specific violation (file, line, value that failed)
  - Example: `FAIL: INV-CACHE-3 (Cache TTL max 24h) - config/cache.yml:12 sets ttl=172800 (exceeds 86400)`

**Coverage reporting:** The `organon coverage` tool scans test files for `@organon-invariant` annotations and reports which invariants lack tests. See [invariant-tracking.md](./invariant-tracking.md) for annotation contract details.

### Verification gates (pre-merge)

A universal checklist for CI gates. Adapt per project:

| Gate | What It Checks | Blocks Merge? |
|------|----------------|---------------|
| **All tests pass** | Tiers 1-4 | Yes |
| **Coverage targets met** | Per-tier thresholds | Yes |
| **Invariant coverage** | Every ETHOS.md invariant has ≥1 tier-4 test | Yes |
| **Reference integrity** | File paths and organon refs exist | Yes |
| **Freshness** | Auto-generated files match current state | Yes |
| **Frontmatter truthfulness** | Counts, token estimates, relationships are accurate | Yes |

**Principle:** Verification gates **fail builds**, not just warn. A warning is an invitation to ignore. A failed build is a constraint.

### Gate Implementation Details

**Running gates:**
- `organon verify` — runs all blocking gates in sequence
- `organon verify --gate <name>` — runs specific gate (e.g., `--gate invariant-coverage`)
- `organon verify --non-blocking` — includes warnings-only gates (V2 feature)

**Gate dependencies:**
1. **Frontmatter truthfulness** must pass before **invariant coverage** (can't check coverage if frontmatter is invalid)
2. **Reference integrity** must pass before **freshness** (broken refs prevent regeneration)
3. All others can run in parallel

**Error codes:** Each gate produces structured output for CI reporting:
- `GATE_PASS` — Gate passed, no issues
- `GATE_FAIL` — Gate failed with errors (blocks merge)
- `GATE_WARN` — Gate passed with warnings (info only, doesn't block)

Gates use structured diagnostic codes for CI reporting (e.g., `FRONTMATTER_MISSING_FIELD`, `REFERENCE_BROKEN_PATH`, `INVARIANT_UNCOVERED`).

### Drift detection

Auto-generated files (e.g., `components.md`, mapping files) are derived from code. They drift when code changes but the file isn't regenerated.

**Detection pattern:**
1. CI regenerates the file from current code (idempotent tool)
2. CI compares generated output with the committed version
3. Any diff = drift. Build fails.

```
CI step: regenerate → diff → pass/fail
```

**Freshness window:** Some projects allow a configurable staleness threshold (e.g., 24 hours) before failing. This is a tunable parameter — strict projects set it to zero (no staleness allowed), pragmatic projects allow a buffer.

**Key property:** The committed file is always the source of comparison. The tool regenerates and diffs, never overwrites silently.

### Organon staleness

Drift detection (above) covers auto-generated files. But manual organon files (ETHOS.md, PHILOSOPHY.md) can also go stale — when the codebase evolves around them without anyone updating the constraints.

**Two complementary mechanisms:**

**1. `last_reviewed` frontmatter field** — An optional field recording when a human last confirmed the organon still reflects reality.

```yaml
last_reviewed: "2025-03-15"   # ISO 8601 date
```

CI can warn when an organon hasn't been reviewed in >N months (configurable per project). Simple, explicit, no false positives — but calendar-based, not change-aware.

**2. Code churn detection** — Correlate git history against organon scope. When files in a domain's scope change significantly (new exports, renamed files, components.md regenerated with new entries) but the domain's organon wasn't updated, surface a review advisory.

```
Tool reads: git log for domain's source files (via code-to-organon mapping)
Compares:   last organon modification date vs code churn volume
Surfaces:   "Domain X: 23 files changed since last organon update — review recommended"
```

**Why both:** `last_reviewed` catches dormant organons forgotten entirely. Churn detection catches active domains where the organon is falling behind code evolution. Together they cover calendar-based and change-based staleness.

**Advisory, not blocking.** Most code changes genuinely don't require organon updates. A blocking check would create noise that erodes trust in the verification system. Surface staleness as a warning in health checks, not as a merge gate.

### Violation handling

When verification detects a violation, severity determines response:

| Severity | Condition | Response |
|----------|-----------|----------|
| **Critical** | Code violates an ETHOS.md invariant | Stop. Fix immediately. No workarounds. |
| **High** | Organon out of sync > freshness threshold | Block PR. Regenerate and recommit. |
| **Medium** | Broken references (file paths, RFC refs) | Block PR. Update references. |
| **Low** | Documentation gaps, missing optional sections | Warn. Create follow-up issue. |

**Escalation path:**
1. CI blocks the merge
2. Author fixes the violation
3. Reviewer validates the fix
4. If the violation reveals an architectural issue → update the organon and discuss in PR review

**Principle:** Critical and high violations are never deferred. They block merges. Low violations create tracked follow-ups so they don't accumulate silently.

---

## Implementation Guidance

### 1. Start with protocols

Document procedures in PROTOCOLS.md BEFORE creating workflows or tools:

```yaml
protocols:
  - id: PROTO-EXAMPLE-1
    name: Example Procedure
    steps: 3
    automation_tier: manual    # Start manual, promote later
    tools: []
    complexity: low
```

### 2. Build tools incrementally

Create tools for frequently repeated operations:

```bash
# Whatever your project's tool technology is
npm run organon:verify          # Node.js
make organon-verify             # Makefile
./scripts/organon-verify.sh     # Shell
python -m organon.verify        # Python
```

### 3. Close the loop with verification

Add verification tools that check binding integrity:
- Does every invariant have a `@organon-invariant` test?
- Do all referenced tools exist?
- Are all file paths in organons valid?

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Three-layer separation | Clear responsibility boundaries | Three artifacts to maintain per procedure |
| Agent-specific workflow layer | Works with any LLM technology | Workflow must be reimplemented per agent |
| Bidirectional references | Full traceability, no orphans | Reference maintenance overhead |
| Verification as CI gate | Hard enforcement, not suggestions | Slower CI, potential false positives |
| Automation tiers | Prevents over-engineering | Requires periodic tier reassessment |
| LLM as execution runtime | Consistent behavior, scalable | Dependent on LLM understanding the workflow |

**Key trade-off:** The workflow layer is the only non-universal layer. Protocols and tools are technology-agnostic, but each LLM agent technology needs its own workflow format. This is intentional — the binding must be native to the agent to be effective.

---

## Example Implementation Pattern

A full three-layer architecture implementation typically includes:

| Layer | Example Implementation | Typical Scale |
|-------|----------------------|---------------|
| **Protocols** | `organon/*/PROTOCOLS.md` | 5-15 protocol files, 15-50 individual protocols |
| **Bindings** | Agent skills, system prompts, runbooks, CI jobs | Project-specific |
| **Tools** | Project scripts (npm, make, bash, Python) | 20-50 tools |
| **Verification** | Multi-gate system (frontmatter, coverage, references, freshness) | 5-8 gates targeting 100% invariant coverage |

**Expected Benefits:**
- Protocol execution time reduced 30-50% (consistency, fewer mistakes)
- Protocol violations prevented by verification gates
- Faster onboarding (workflows guide new contributors through complex procedures)
- High frontmatter coverage (90-100% across organon files)

**Key tool categories for enforcement loop:**

| Tool | Purpose |
|------|---------|
| `organon:generate` | Auto-generate components.md (dual mapping) |
| `organon:verify` | Check file references and organon integrity |
| `organon:validate-frontmatter` | Validate YAML frontmatter truthfulness |
| `organon:generate-frontmatter` | Auto-generate frontmatter from content |
| `organon:query` | Query frontmatter for context budget planning |
| `organon:health` | Health dashboard (coverage, freshness, validation) |
| `organon:coverage` | Invariant-to-test coverage report |

---

## Related Patterns

- **[Progressive Disclosure](./patterns.md#progressive-disclosure-pattern)** — Frontmatter enables discovery without loading
- **[Frontmatter System](./frontmatter-system.md)** — YAML metadata schema for organon files
- **[Code-to-Organon Mapping](./patterns.md#code-to-organon-mapping-pattern)** — Auto-generated `components.md` for bidirectional code↔organon navigation (drift detection verifies these)
- **[Context Loading Strategy](./patterns.md#context-loading-strategy-pattern)** — Token-budget-aware organon loading for LLM sessions
- **Invariant Traceability** — ETHOS.md invariant → `@organon-invariant` test → coverage gate, fully linked

## Related Files

| File | Relationship |
|------|--------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [invariant-tracking.md](./invariant-tracking.md) | Invariant-to-test tracking (verification tier 4) |
| [templates.md](./templates.md) | Organon file templates |
