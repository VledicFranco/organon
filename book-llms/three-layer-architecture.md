---
type: rationale
scope: meta
name: three-layer-architecture
version: "2.0"
summary: The enforcement loop — how protocols, workflows, and tools bind the methodology to LLM execution, making organons executable and verifiable
token_estimate: 8500
decision_count: 8
inherits_from: [meta-organon]
load_priority: high
required_for:
  - protocol_creation
  - workflow_creation
  - tool_creation
  - methodology_evolution
  - methodology_enforcement
audience: [llm, human, tooling]
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
│   │                       │  Agent-specific skill/workflow files │
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

---

## Layer 2: Workflows (Agent Binding)

**What they are:** Executable implementations of protocols that tell a specific LLM agent how to orchestrate tools. This is the binding layer — it translates "what must happen" (protocol) into "what the agent does" (tool invocations in sequence).

**The universal contract:** Regardless of which LLM or agent system hosts them, all workflow bindings must:

1. **Reference their protocol** — via protocol ID and file path (bidirectional traceability)
2. **Specify tool orchestration** — which tools to run, in what order, with what arguments
3. **Provide context loading guidance** — which organon files to read before execution
4. **Handle errors** — what to do when tools fail or gates don't pass
5. **Be invocable** — the agent can trigger the workflow (by command, slash command, or autonomous detection)

### Agent-specific implementations

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
context:                               # Organon files to load before execution
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
context:
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
│     → Skill/workflow files reference protocol + tools         │
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
│  5. EVOLVE                                                   │
│     Results inform organon updates, new invariants captured  │
│     → Updated ETHOS.md, new protocols, refined heuristics    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       └──────────────── back to DEFINE ───────→
```

### Why the loop matters

**Without the loop:** Organons are documentation. LLMs read them, maybe follow them, maybe don't. No way to know. Drift accumulates silently.

**With the loop:** Organons are enforced constraints. Every implementation goes through Define → Bind → Execute → Verify → Evolve. Violations are caught by tools, flagged by verification, and fed back to the LLM. The methodology gets stronger with each cycle because new invariants capture new learnings.

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
2. Workflow file must exist (in agent-specific location)
3. Workflow must include `protocol_id` matching protocol ID
4. Workflow must include `protocol_file` pointing to PROTOCOLS.md
5. Orphaned workflows (no protocol) are validation errors
6. Phantom automation (protocol claims automated but workflow doesn't exist) are validation errors

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

## Reference Implementation

**Agent Tavern** (first full implementation of the enforcement loop):

| Layer | Implementation | Count |
|-------|---------------|-------|
| **Protocols** | `organon/methodology/*/PROTOCOLS.md` | 8 protocol files, 15+ individual protocols |
| **Workflows** | `.claude/skills/*/skill.md` (Claude Code) | 5 skills |
| **Tools** | `package.json` npm scripts | 47 tools |
| **Verification** | 8-gate system via `rfc:verify` | 100% invariant coverage |

**Results:**
- RFC implementation time reduced ~40%
- Zero protocol violations since workflow introduction
- New contributors onboard faster (workflows guide execution)
- 100% frontmatter coverage across 49 organon files

**Key tools from reference implementation:**

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

- **[Progressive Disclosure](./patterns.md)** — Frontmatter enables discovery without loading
- **[Frontmatter System](./frontmatter-system.md)** — YAML metadata schema for organon files
- **Bidirectional Traceability** — Protocol ↔ workflow ↔ tool, fully linked
- **Progressive Automation** — Manual → tools → workflows as procedures mature
- **Executable Documentation** — Documentation that drives code execution, not just describes it
