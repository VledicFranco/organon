---
type: rationale
scope: meta
name: three-layer-architecture
version: "1.2"
summary: The enforcement loop — protocols, workflows, tools, and verification (tiered testing, drift detection, violation handling) bind organons to LLM execution
token_estimate: 10800
inherits_from: [meta-organon]
load_priority: high
required_for:
  - protocol_creation
  - workflow_creation
  - tool_creation
  - methodology_evolution
  - methodology_enforcement
audience: [llm, human, tooling]
related_files:
  - patterns.md
  - workflow-authoring.md
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
  - id: PROTO-RFC-1
    name: RFC Implementation
    steps: 5
    automation_tier: automated    # automated | semi-automated | manual
    workflow: implement-rfc       # workflow binding name
    tools: [rfc:context, rfc:verify, organon:generate]
    complexity: high
```

```markdown
# In PROTOCOLS.md body

## Protocol 1: RFC Implementation

### Phase 0: Context Loading
1. Read product organons (/ETHOS.md, /PHILOSOPHY.md)
2. Read RFC Section 1 (Organon Impact)
3. Load affected domain organons

### Phase 1: Code Changes
1. Implement domain layer first
2. Write tests proving invariants hold

### Phase 2: Organon Updates
1. Create/update organons declared in Section 1
2. Regenerate auto-generated docs

### Phase 3: Verification
1. Run all verification gates
2. All gates must pass

### Phase 4: Completion
1. Update status, increment versions, commit
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
| **Automated** | ≥5 steps, cross-domain, error-prone, frequent | Yes | Yes | RFC implementation (5 phases, weekly) |
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
- "RFC implementation" → 5 phases, weekly, cross-domain → **Automated** (needs workflow orchestration)
- "Emergency hotfix decision" → Judgment required → **Manual** (no automation)

---

## Layer 2: Workflows (Agent Binding)

**What they are:** The binding layer that translates "what must happen" (protocol) into "what the agent does" (tool invocations in sequence). A workflow can be an agent skill, a system prompt directive, a runbook, a CI/CD pipeline, or any other discoverable mechanism.

### What counts as a workflow

A workflow is any **easily discoverable mechanism** that guides an LLM in instantiating a protocol. The key properties: the agent can find it, it references a protocol, and it orchestrates tools. Different environments offer different workflow mechanisms:

| Workflow Mechanism | Example | Discovery Method | Best For |
|--------------------|---------|------------------|----------|
| **Agent skills** | Claude Code `.claude/skills/`, Cursor `.cursor/rules/` | Loaded by agent framework | Structured, multi-step protocols |
| **System prompt directives** | `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md` | Auto-loaded at session start | Always-on constraints and simple protocols |
| **Runbooks** | `organon/workflows/<name>.md` | Agent reads as context | Any LLM, no framework dependency |
| **Custom assistants** | OpenAI Assistants, Custom GPTs | Pre-configured in platform | Dedicated single-purpose agents |
| **CI/CD pipeline definitions** | GitHub Actions, GitLab CI jobs | Triggered by events | Enforcement outside the agent session |
| **Git hooks** | pre-commit, pre-push scripts | Triggered by git operations | Automated gate enforcement |

**Agent skills are the most common workflow mechanism** because they are the most structured and discoverable form. But a plain markdown runbook that an LLM reads and follows is equally valid — the universal contract applies regardless of mechanism.

### The universal contract

Regardless of which mechanism hosts them, all workflow bindings must:

1. **Reference their protocol** — via protocol ID and file path (bidirectional traceability)
2. **Specify tool orchestration** — which tools to run, in what order, with what arguments
3. **Provide context loading guidance** — which organon files to load (`loads` array) before execution
4. **Handle errors** — what to do when tools fail or gates don't pass
5. **Be discoverable** — the agent can find and invoke the workflow (by command, auto-load, slash command, or autonomous detection)

### Agent-specific locations

The workflow layer is the only layer that varies by agent technology. The protocol and tool layers are universal.

| Agent Technology | Workflow Location | Format |
|------------------|-------------------|--------|
| Claude Code | `.claude/skills/<name>/skill.md` | Markdown with YAML frontmatter |
| Cursor | `.cursor/rules/<name>.md` or `.cursorrules` | Markdown rules |
| Custom LLM agent | `workflows/<name>.md` or agent config | Varies |
| OpenAI Assistants | Instructions or function definitions | JSON/text |
| Any LLM (generic) | `organon/workflows/<name>.md` | Markdown (read by LLM directly) |

### Workflow frontmatter contract

Regardless of agent technology, workflow definitions should include:

```yaml
---
name: implement-rfc                    # Workflow identifier
protocol_id: PROTO-RFC-1              # ← References protocol (REQUIRED)
protocol_file: organon/methodology/rfcs/PROTOCOLS.md  # ← Protocol source (REQUIRED)
tools: [rfc:context, rfc:verify, organon:generate]     # Tools orchestrated
loads:                                 # Organon files to load before execution
  - organon/methodology/rfcs/PROTOCOLS.md
  - /ETHOS.md
---
```

### Example: Claude Code skill binding

```markdown
---
name: implement-rfc
invocation: /implement-rfc
user-invocable: true
protocol_id: PROTO-RFC-1
protocol_file: organon/methodology/rfcs/PROTOCOLS.md
tools: [rfc:context, rfc:verify, organon:generate]
loads:
  - organon/methodology/rfcs/PROTOCOLS.md
  - /ETHOS.md
  - /PHILOSOPHY.md
---

# RFC Implementation Workflow

Implements PROTO-RFC-1 from `organon/methodology/rfcs/PROTOCOLS.md`.

## Phase 0: Context Loading
1. Load product organons:
   ```bash
   cat /ETHOS.md && cat /PHILOSOPHY.md
   ```
2. Load RFC context:
   ```bash
   npm run rfc:context -- --rfc=<N>
   ```

## Phase 1: Code Changes
(Project-specific — implement domain layer, write tests proving invariants hold)

## Phase 2: Organon Updates
1. Regenerate docs:
   ```bash
   npm run organon:generate
   ```
2. Validate frontmatter:
   ```bash
   npm run organon:validate-frontmatter
   ```
...
```

### Example: Generic LLM workflow (no specific agent)

For LLMs without a native skill system, a workflow can be a plain markdown file the LLM reads:

```markdown
---
name: implement-rfc
protocol_id: PROTO-RFC-1
protocol_file: organon/methodology/rfcs/PROTOCOLS.md
tools: [rfc:context, rfc:verify, organon:generate]
---

# RFC Implementation Workflow

When implementing an RFC, follow these steps exactly:

## Phase 0: Context Loading
Read: /ETHOS.md, /PHILOSOPHY.md, and the RFC file.
Run: `rfc:context --rfc=<N>` to load affected domain organons.

## Phase 1: Code Changes
Implement domain layer first. Write tests proving invariants hold.

## Phase 2: Organon Updates
Run: `organon:generate` to regenerate auto-generated docs.
Run: `organon:validate-frontmatter` to check metadata.

## Phase 3: Verification
Run: `rfc:verify --rfc=<N>` to check all gates.
If any gate fails, fix the issue and re-run.
```

The LLM reads this file as part of its context and follows the instructions. No special agent framework needed.

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
│     Workflow translates protocol into LLM-executable steps   │
│     → Workflow bindings reference protocol + tools             │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  3. EXECUTE                                                  │
│     LLM reads workflow, orchestrates tools in sequence       │
│     → Tool invocations: generate, verify, test               │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  4. VERIFY                                                   │
│     Tools check organon compliance, invariants hold          │
│     → Verification results: pass/fail per gate               │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  5. COMPOUND                                                 │
│     Session learnings captured as persistent observations    │
│     → Observation files in organon/observations/             │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  6. EVOLVE                                                   │
│     Results inform organon updates, new invariants captured  │
│     → Updated ETHOS.md, new protocols, refined heuristics    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       └──────────────── back to DEFINE ───────→
```

### Why the loop matters

**Without the loop:** Organons are documentation. LLMs read them, maybe follow them, maybe don't. No way to know. Drift accumulates silently.

**With the loop:** Organons are enforced constraints. Every implementation goes through Define → Bind → Execute → Verify → Compound → Evolve. Violations are caught by tools, flagged by verification, and fed back to the LLM. The methodology gets stronger with each cycle because new invariants capture new learnings.

**Observations bridge COMPOUND and EVOLVE.** The COMPOUND phase captures session insights as structured observation files (`organon/observations/NNN-name.md`). These persist across sessions, allowing patterns to accumulate. When an observation matures from signal to actionable pattern, it graduates into EVOLVE — becoming an RFC, heuristic addition, or tool improvement. See the [Observation Accumulation Pattern](./patterns.md#observation-accumulation-pattern) for the convention.

### The LLM's role in the loop

The LLM is the **runtime** that executes the enforcement loop. It is the interface between:

- **Human intent** — captured in organons (ETHOS, PHILOSOPHY, PROTOCOLS)
- **Automated enforcement** — performed by tools (verify, generate, test)
- **Code changes** — the actual implementation work

The human's job is to **define** (write organons) and **review** (approve results). The LLM's job is to **execute** (follow workflows, invoke tools) and **report** (surface verification results). The tools' job is to **enforce** (check invariants, validate references, gate merges).

This is what makes Organon **LLM-centric**: the methodology is designed to be consumed and executed by LLMs, with humans as authors and reviewers, not as the execution engine.

---

## Bidirectional References (Invariant)

Workflows and protocols **must reference each other**. This is a hard invariant — not optional.

**Protocol → Workflow (in PROTOCOLS.md frontmatter):**
```yaml
protocols:
  - id: PROTO-RFC-1
    automation_tier: automated
    workflow: implement-rfc    # ← references workflow
```

**Workflow → Protocol (in workflow frontmatter):**
```yaml
protocol_id: PROTO-RFC-1                              # ← references protocol ID
protocol_file: organon/methodology/rfcs/PROTOCOLS.md   # ← references protocol file
```

**Validation rules:**
1. If `automation_tier == "automated"`, `workflow` field is required
2. If `automation_tier == "semi-automated"` or `"manual"`, `workflow` field must be absent (these tiers use tools directly or no automation)
3. Workflow file must exist (in agent-specific location)
4. Workflow must include `protocol_id` matching protocol ID
5. Workflow must include `protocol_file` pointing to PROTOCOLS.md
6. Orphaned workflows (no protocol) are validation errors
7. Phantom automation (protocol claims automated but workflow doesn't exist) are validation errors

**Why bidirectional:** Prevents orphaned workflows, incomplete protocols, and silent drift between what the protocol says and what the workflow does.

---

## Verification: The Loop Closer

Verification is what distinguishes an enforcement loop from wishful thinking. Without automated verification, the loop is open — protocols say what should happen, but nothing checks whether it did.

### Verification categories

| Category | What it checks | Example |
|----------|----------------|---------|
| **Reference integrity** | File paths, RFC references, event references in organons | `organon:verify` |
| **Frontmatter truthfulness** | Counts match actual content, token estimates are accurate | `organon:validate-frontmatter` |
| **Triplet integrity** | Protocol ↔ workflow ↔ tool bindings are complete | `organon:verify-triplets` |
| **Freshness** | Auto-generated files are not stale | Timestamp checks on components.md |
| **Invariant coverage** | Every invariant in ETHOS.md has a corresponding test | `organon:test-coverage` |
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
| **Reference integrity** | File paths, RFC refs, event refs exist | Yes |
| **Freshness** | Auto-generated files match current state | Yes |
| **Frontmatter truthfulness** | Counts, token estimates, relationships are accurate | Yes |
| **RFC status** | If RFC-driven, RFC state matches implementation state | Yes |

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

See [workflow-authoring.md](./workflow-authoring.md) for workflow-quality gate error codes (`WORKFLOW_MISSING_PROTOCOL_ID`, `WORKFLOW_BROKEN_LOADS_REF`, etc.). Other gates use similar diagnostic code patterns.

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
4. If the violation reveals an architectural issue → escalate to RFC

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

### 3. Promote to workflow when criteria met

Once a protocol is complex enough (≥5 steps, error-prone, frequent):

```yaml
protocols:
  - id: PROTO-EXAMPLE-1
    automation_tier: automated   # ← promote
    workflow: example-workflow    # ← add binding
    tools: [example:step1, example:step2]
```

Then create the workflow in your agent's configuration.

### 4. Close the loop with verification

Add verification tools that check the binding integrity:
- Do all automated protocols have workflows?
- Do all workflows reference valid protocols?
- Do all referenced tools exist?

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
| **Protocols** | `organon/methodology/*/PROTOCOLS.md` | 5-15 protocol files, 15-50 individual protocols |
| **Workflows** | Agent-specific bindings (Claude skills, Cursor rules, runbooks) | 5-10 core workflows |
| **Tools** | Project scripts (npm, make, bash, Python) | 20-50 tools |
| **Verification** | Multi-gate system (frontmatter, triplet-integrity, coverage, freshness) | 5-10 gates targeting 100% invariant coverage |

**Expected Benefits:**
- Protocol execution time reduced 30-50% (consistency, fewer mistakes)
- Protocol violations prevented by verification gates
- Faster onboarding (workflows guide new contributors through complex procedures)
- High frontmatter coverage (90-100% across organon files)

**Key tool categories for enforcement loop:**

| Tool | Purpose |
|------|---------|
| `organon:generate` | Auto-generate components.md (dual mapping) |
| `organon:verify` | Check file/RFC/event references |
| `organon:validate-frontmatter` | Validate YAML frontmatter truthfulness |
| `organon:generate-frontmatter` | Auto-generate frontmatter from content |
| `organon:query` | Query frontmatter for context budget planning |
| `organon:health` | Health dashboard (coverage, freshness, validation) |
| `organon:verify-triplets` | Check protocol↔workflow↔tool binding integrity |
| `organon:suggest-tools` | Identify protocols that should be automated |
| `rfc:context` | Load relevant organon context for RFC work |
| `rfc:verify` | Run 8-gate verification before merge |

---

## Related Patterns

- **[Progressive Disclosure](./patterns.md#progressive-disclosure-pattern)** — Frontmatter enables discovery without loading
- **[Frontmatter System](./frontmatter-system.md)** — YAML metadata schema for organon files
- **[Code-to-Organon Mapping](./patterns.md#code-to-organon-mapping-pattern)** — Auto-generated `components.md` for bidirectional code↔organon navigation (drift detection verifies these)
- **[Context Loading Strategy](./patterns.md#context-loading-strategy-pattern)** — Token-budget-aware organon loading for LLM sessions
- **Bidirectional Traceability** — Protocol ↔ workflow ↔ tool, fully linked
- **Progressive Automation** — Manual → tools → workflows as procedures mature
- **Executable Documentation** — Documentation that drives code execution, not just describes it

## Related Files

| File | Relationship |
|------|--------------|
| [overview.md](./overview.md) | High-level methodology overview |
| [workflow-authoring.md](./workflow-authoring.md) | Workflow quality attributes (Layer 2) |
| [invariant-tracking.md](./invariant-tracking.md) | Invariant-to-test tracking (verification tier 4) |
| [templates.md](./templates.md) | Workflow template scaffold |
