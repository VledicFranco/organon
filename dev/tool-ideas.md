---
type: rationale
scope: product
name: adoption-tools
version: "1.0"
summary: Brainstormed tools to accelerate Organon methodology adoption in new and existing projects
token_estimate: 7100
related_files:
  - ../organon/domains/tools/ETHOS.md
  - ../book-llms/three-layer-architecture.md
  - ../book-llms/frontmatter-system.md
  - ../book-llms/invariant-tracking.md
load_priority: medium
audience: [llm, human]
---

# Adoption Tools: Accelerating Organon Integration

> Brainstormed tools to help new and existing projects adopt the Organon methodology with minimal friction. Focus: automation-first, reduce time-to-value.

---

## Context

**Problem:** While `organon-tools` provides verification and validation, it lacks tools for **project onboarding** and **incremental adoption**. Projects face:
- Blank slate syndrome (new projects don't know where to start)
- Migration paralysis (existing projects overwhelmed by conversion work)
- Testing gaps (no reusable tier-4 test infrastructure)
- CI integration friction (how to wire up verification gates?)

**Goal:** Build tools that reduce time-to-first-organon from hours to minutes, and make enforcement feel native, not bolted on.

---

## High-Impact Tools (Build First)

### 1. Project Initialization (`organon init`)

**Problem:** New projects face a blank slate. No clear starting point.

**Solution:** Interactive initialization wizard

```bash
organon init
# Interactive prompts:
# - Project type? (TypeScript, Python, Rust, Polyglot)
# - Existing docs? (migrate vs fresh start)
# - Team size? (solo, small, large)
# - CI provider? (GitHub Actions, GitLab CI, none)

# Generates:
# - organon/ directory structure (domains/, features/, protocols/)
# - /ETHOS.md, /PHILOSOPHY.md templates
# - organon.config.json
# - .gitignore entries (ignore node_modules in organon globs)
# - CI workflow files (.github/workflows/organon.yml)
# - Pre-commit hooks (optional)
# - README.md with Organon overview
```

**Implementation notes:**
- Core: `src/core/init.ts` (pure function generating file tree)
- CLI: `src/cli/commands/init.ts` (prompts via `enquirer` or `prompts`)
- Templates: `src/core/templates/` (ethos, philosophy, config, ci workflows)
- Test: Generate in-memory FS, verify structure

**Why high-impact:** Reduces time-to-first-organon from 2-4 hours to 5 minutes. Removes "I don't know where to start" blocker.

**Estimated effort:** 2-3 weeks (includes templates for 3 languages + CI providers)

---

### 2. Semantic Testing Framework (`@organon/testing`)

**Problem:** Projects must write tier-4 tests from scratch. No reusable patterns for common invariants (max values, no side effects, backwards compatibility).

**Solution:** TypeScript-native testing library with common assertion patterns

**Package structure:**
```
@organon/testing/
├── core/
│   ├── invariant-test.ts      # testInvariant() wrapper
│   ├── assertions/
│   │   ├── max-value.ts       # assertMaxValue() - numeric bounds
│   │   ├── no-side-effects.ts # assertNoSideEffects() - forbidden imports
│   │   ├── file-exists.ts     # assertFileExists() - structural checks
│   │   ├── backwards-compat.ts # assertBackwardsCompat() - API stability
│   │   └── custom.ts          # assertCustom() - user-defined
│   ├── discovery/
│   │   ├── scan-ethos.ts      # Parse ETHOS.md for invariant IDs
│   │   ├── scan-tests.ts      # Find @organon-invariant annotations
│   │   └── coverage.ts        # Report uncovered invariants
│   └── reporters/
│       ├── console.ts         # Human-readable output
│       └── json.ts            # Machine-parsable (for organon coverage)
├── adapters/
│   ├── vitest.ts              # Vitest integration
│   ├── jest.ts                # Jest integration
│   └── mocha.ts               # Mocha integration
└── index.ts
```

**Usage example (Vitest):**
```typescript
// tests/organon/invariants.test.ts
import { describe } from 'vitest';
import { testInvariant, assertMaxValue, assertNoSideEffects } from '@organon/testing';

describe('Product Invariants', () => {
  testInvariant('INV-PROD-1', 'cache TTL max 24h', async () => {
    await assertMaxValue({
      files: ['src/config/*.ts'],
      pattern: /cacheTTL\s*=\s*(\d+)/,
      maxValue: 86400,
      unit: 'seconds',
    });
  });

  testInvariant('INV-PROD-2', 'core modules are pure', async () => {
    await assertNoSideEffects({
      files: ['src/core/**/*.ts'],
      forbiddenImports: ['fs', 'http', 'child_process'],
      forbiddenGlobals: ['window', 'document'],
    });
  });

  testInvariant('INV-PROD-3', 'all exports documented', async () => {
    await assertCustom(async () => {
      const exports = await findExports('src/**/*.ts');
      const docs = await findJSDocs('src/**/*.ts');
      expect(exports.every(e => docs.has(e.name))).toBe(true);
    });
  });
});
```

**Auto-generate test scaffolds:**
```bash
organon generate-tests
# Reads /ETHOS.md invariants array
# For each invariant, suggests test template based on heuristics:
# - "max X" / "limit" → assertMaxValue template
# - "pure" / "no side effects" → assertNoSideEffects template
# - "backwards compatible" → assertBackwardsCompat template
# - Generic → assertCustom placeholder

# Generates tests/organon/invariants.test.ts with TODOs
# User fills in specific patterns/files
```

**Implementation notes:**
- Start with TypeScript support only (Phase 1)
- Language adapters later: `@organon/testing-py`, `@organon/testing-rust` (Phase 4)
- Integration with `organon coverage`: testing library writes coverage metadata to `.organon/coverage.json`
- Each assertion is a pure function (testable independently)

**Why critical:** This is the missing bridge between "declare invariant" and "verify invariant in code." Currently every project must invent tier-4 testing from scratch.

**Estimated effort:** 4-6 weeks (core + 5 common assertions + vitest adapter + test generator)

---

### 3. Code-to-Organon Discovery (`organon discover`)

**Problem:** Existing codebases don't know where to start. Which domains? What boundaries? What invariants?

**Solution:** Static analysis + heuristics to suggest organon structure

```bash
organon discover
# Analyzes codebase:
# - Module boundaries (directory structure, import graph)
# - Coupling metrics (suggests domain split points via community detection)
# - Naming patterns (suggests feature groupings)
# - Test patterns (extracts candidate invariants from test descriptions)
# - Configuration patterns (finds max values, TTLs, limits)

# Outputs:
# - Suggested organon/ structure (domains, features)
# - Draft ETHOS.md files with candidate invariants
# - components.md mapping (code files → domains)
# - Confidence scores per suggestion
```

**Interactive mode:**
```bash
organon discover --interactive
# Shows suggestions one at a time
# User approves/rejects/edits
# Iteratively refines domain model
# Generates final structure
```

**Analysis heuristics:**
- **Domain detection:** Directories with low external coupling, high internal cohesion
- **Feature detection:** Cross-cutting imports (e.g., `logging`, `auth` imported everywhere)
- **Invariant extraction:**
  - Find `max`/`limit` constants → suggest max-value invariants
  - Find test names like "should not have side effects" → suggest purity invariant
  - Find `forbidden`/`restricted` comments → suggest constraint invariants

**Implementation notes:**
- Use `typescript-estree` for TS parsing
- Use Madge or similar for dependency graph
- Community detection for domain boundaries (Louvain algorithm)
- Core: `src/core/discover.ts` (pure, takes parsed AST)
- CLI: `src/cli/commands/discover.ts` (interactive prompts)

**Why high-impact:** Existing codebases are the hardest adoption case. This turns "overwhelming migration" into "guided discovery."

**Estimated effort:** 6-8 weeks (complex analysis, needs good heuristics)

---

### 4. CI/CD Integration Templates

**Problem:** Teams want verification gates in CI but don't know how to wire them up.

**Solution:** Pre-built CI configs + git hooks

```bash
organon init --ci=github-actions
# Generates .github/workflows/organon.yml:
# - Triggered on pull_request
# - Runs: organon verify --all-gates
# - Fails build on violations
# - Posts coverage report as PR comment
# - Uploads JSON results as artifact

organon init --ci=gitlab-ci
# Generates .gitlab-ci.yml job for Organon verification

organon init --git-hooks
# Generates (via husky or git hooks):
# - pre-commit: organon validate (fast checks, < 5s)
# - pre-push: organon verify (full gates, < 30s)
# - Warns on uncovered invariants, blocks on critical violations
```

**Templates for:**
- GitHub Actions (most common)
- GitLab CI
- CircleCI
- Jenkins (Jenkinsfile)
- Pre-commit framework (`.pre-commit-config.yaml`)
- Husky (npm projects)

**Each template includes:**
- Fast caching (node_modules, organon cache)
- Parallel gate execution where possible
- Structured error output (annotations on GitHub)
- Coverage diff (comment on PR with coverage change)

**Implementation notes:**
- Templates in `src/core/templates/ci/`
- Template interpolation (project-specific paths)
- Detection of existing CI config (merge, don't overwrite)

**Why valuable:** Removes "how do I integrate this?" friction. Copy-paste → working enforcement in 5 minutes.

**Estimated effort:** 2 weeks (5 CI providers + git hooks)

---

## Medium-Impact Tools (Build After Core)

### 5. Migration Assistant (`organon migrate`)

**Problem:** Existing documentation (ADRs, coding standards, runbooks) should become organons, but manual conversion is tedious.

**Solution:** Convert existing docs to Organon format

```bash
organon migrate docs/ARCHITECTURE.md --type=philosophy
# Parses existing markdown doc
# Suggests frontmatter fields (scope, name, summary)
# Identifies sections matching organon patterns:
#   - "Problem" / "Background" → ## The Problem
#   - "Solution" / "Approach" → ## The Bet
#   - "Trade-offs" / "Pros/Cons" → ## Trade-offs
# Generates draft PHILOSOPHY.md with frontmatter
# Flags sections that need manual mapping
```

**Conversion targets:**
- ADRs (Architecture Decision Records) → `PHILOSOPHY.md`
- Coding standards / style guides → `ETHOS.md`
- Runbooks / procedures → `PROTOCOL.md`
- README files → `README.md` (add frontmatter)

**Implementation notes:**
- Heuristic section matching (fuzzy header matching)
- LLM-assisted mode (optional): uses LLM to map non-standard sections
- Batch mode: `organon migrate docs/*.md --type=auto` (auto-detect type)

**Estimated effort:** 3-4 weeks (heuristics are tricky, needs good defaults)

---

### 6. Workflow Generator (`organon generate-workflow`)

**Problem:** Workflows must be maintained separately for each agent (Claude Code, Cursor, generic). Duplication and drift.

**Solution:** Generate agent-specific workflows from protocols (single source of truth)

```bash
organon generate-workflow organon/protocols/rfc-implementation.md \
  --formats=claude-skill,cursor-rule,runbook

# Generates three bindings from one protocol:
# - .claude/skills/implement-rfc/skill.md (Claude Code format)
# - .cursor/rules/implement-rfc.md (Cursor format)
# - organon/workflows/implement-rfc.md (generic runbook)
```

**Protocol → Workflow mapping:**
- Protocol steps → Workflow phases
- Tool references → Agent-specific invocations
- Verification steps → Exit criteria

**Implementation notes:**
- Core: `src/core/generate-workflow.ts`
- Templates: `src/core/templates/workflows/` (per agent format)
- Bidirectional binding: Generated workflows reference protocol_id

**Why valuable:** Reduces workflow maintenance burden. Protocol is source of truth; workflows are derived artifacts.

**Estimated effort:** 2-3 weeks (3 agent formats + templates)

---

### 7. LSP Server (IDE Integration)

**Problem:** Editing organon files is just plain markdown. No validation, autocomplete, or navigation.

**Solution:** Language Server Protocol implementation for organon files

**Features:**
- **Autocomplete:** Frontmatter field suggestions (type enums, scope enums)
- **Validation:** Inline errors (broken references, invalid enums, count mismatches)
- **Navigation:** Jump to referenced files (`inherits_from`, `related_domains`)
- **Hover:** Show related invariants, token estimates, summaries
- **Code actions:** "Generate frontmatter", "Add invariant ID", "Update counts"
- **Diagnostics:** Red squiggles for violations, warnings for staleness

**Integrates with:**
- VS Code (via extension)
- Neovim (via nvim-lspconfig)
- Emacs (via lsp-mode)
- Any LSP-compatible editor

**Implementation notes:**
- Use `vscode-languageserver` + `vscode-languageserver-textdocument`
- Reuse existing validation logic from `validate-frontmatter.ts`
- Separate package: `@organon/language-server`

**Estimated effort:** 4-6 weeks (LSP protocol + VS Code extension)

---

### 8. Visualization Dashboard (`organon viz`)

**Problem:** Hard to see organon hierarchy, coverage, and health at a glance.

**Solution:** Web UI for exploring organon structure

```bash
organon viz --serve
# Starts server at http://localhost:3000
```

**Views:**
- **Tree view:** Organon hierarchy (product → domains → features → components)
- **Dependency graph:** Visualize `inherits_from`, `related_domains`, `primary_rfcs`
- **Coverage heatmap:** Which organons lack tier-4 tests (red = uncovered)
- **Freshness timeline:** Stale organons (by `last_reviewed` or code churn)
- **Triplet integrity:** Protocol ↔ workflow ↔ tool bindings (orphans highlighted)
- **Health dashboard:** Overall score + gates status

**Export formats:**
- SVG (for embedding in docs)
- PNG (for presentations)
- Mermaid diagram (for markdown)
- GraphViz dot file

**Implementation notes:**
- Backend: Express + existing core functions
- Frontend: React + D3.js or Cytoscape.js
- Static export: Pre-render to HTML (no server needed for read-only)

**Estimated effort:** 6-8 weeks (web UI + graph rendering)

---

## Advanced Automation (Experimental)

### 9. Invariant Synthesizer (AI-powered)

**Problem:** Teams don't know what invariants they should have. Existing constraints are implicit.

**Solution:** Analyze codebase and suggest invariants using LLM

```bash
organon synthesize src/
# Uses LLM to:
# 1. Read code patterns (via static analysis summaries)
# 2. Identify constraints (max values, forbidden patterns, naming conventions)
# 3. Draft invariant text (natural language)
# 4. Generate corresponding tier-4 test
# 5. Present for human approval (with confidence scores)
```

**Example output:**
```yaml
# Suggested invariant for src/cache/
- id: INV-CACHE-1
  name: ttl-max-24h
  text: "Cache TTL must not exceed 24 hours (86400 seconds)"
  confidence: 0.92
  evidence:
    - "Found ttl=86400 in cache.config.ts (line 12)"
    - "Test 'cache expires after 24h' suggests upper bound"
    - "No values > 86400 found in codebase"
  suggested_test: |
    testInvariant('INV-CACHE-1', 'ttl max 24h', async () => {
      await assertMaxValue({
        files: ['src/config/*.ts'],
        pattern: /cacheTTL\s*=\s*(\d+)/,
        maxValue: 86400,
      });
    });
```

**Implementation notes:**
- LLM-agnostic (supports Anthropic, OpenAI, local models)
- Requires API key (user-provided)
- Batches code summaries to fit context window
- Human-in-the-loop: all suggestions require approval

**Estimated effort:** 6-10 weeks (prompt engineering + validation)

---

### 10. Drift Monitor (Continuous)

**Problem:** Organons go stale when code evolves around them. No proactive alerts.

**Solution:** Background daemon watching for organon staleness

```bash
organon monitor --daemon
# Runs in background (or as cron job)
# Watches git commits (via git log polling)
# When code changes:
#   1. Map changed files → affected organons (via components.md)
#   2. Calculate churn score (lines changed, files affected)
#   3. Check if organon was updated in same PR
#   4. If not: surface review advisory
```

**Integrations:**
- **GitHub Issues:** Creates "Review organon X" issues when staleness threshold exceeded
- **Slack:** Posts to #eng-docs channel with staleness alerts
- **Jira:** Creates tickets for organon review
- **Email:** Digest of stale organons (weekly)

**Configuration:**
```json
{
  "monitor": {
    "churnThreshold": 500,  // lines changed
    "stalenessWindow": 90,  // days since last review
    "notifications": ["github-issues", "slack"]
  }
}
```

**Implementation notes:**
- Daemon mode: `organon monitor --daemon` (long-running process)
- CI mode: `organon monitor --check` (runs in CI, fails if staleness detected)
- Webhook support: GitHub webhooks trigger checks on push

**Estimated effort:** 4-6 weeks (git integration + notification adapters)

---

## Prioritized Implementation Order

For **maximum adoption impact**, build in this order:

### Phase 1: Onboarding (Weeks 1-4)
1. ✅ **`organon init`** - Scaffolding wizard
2. ✅ **CI templates** - GitHub Actions + pre-commit hooks
3. ✅ **`organon discover`** - Codebase analysis for migration

**Outcome:** New projects start instantly. Existing projects have migration path.

**Dependencies:** None (can build in parallel)

---

### Phase 2: Enforcement (Weeks 5-8)
4. ✅ **`@organon/testing`** - Semantic testing framework (TypeScript first)
5. ✅ **Test generator** - From ETHOS.md invariants → test scaffolds
6. ✅ **Enhanced coverage** - Integrate testing library with `organon coverage`

**Outcome:** Projects can actually enforce their invariants automatically.

**Dependencies:** Requires Phase 1 complete (projects need init before they need tests)

---

### Phase 3: Developer Experience (Weeks 9-12)
7. ✅ **LSP server** - IDE integration
8. ✅ **Workflow generator** - Protocol → multi-format workflows
9. ✅ **Migration assistant** - ADRs/docs → organon files

**Outcome:** Daily workflow is smooth. Organon feels native, not bolted on.

**Dependencies:** Requires Phase 1-2 (needs projects using Organon before DX matters)

---

### Phase 4: Advanced (Weeks 13+)
10. ✅ **Visualization dashboard** - Web UI
11. ✅ **Invariant synthesizer** - AI-powered suggestions
12. ✅ **Drift monitor** - Continuous staleness tracking

**Outcome:** Organon becomes proactive, not just reactive.

**Dependencies:** Requires Phase 1-3 mature (advanced features for established users)

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Build testing framework first | Closes critical gap (enforcement) | Delays onboarding tools |
| TypeScript-only Phase 1 | Faster initial delivery | Python/Rust users must wait |
| Interactive CLI over GUI | Works in CI, scriptable | Less discoverable for beginners |
| LLM-optional (Phase 4) | No API key required for core tools | Advanced features require setup |
| Monorepo vs separate packages | Easier development, shared code | Larger dependency footprint |

**Mitigation strategies:**
- Keep `@organon/testing` as optional peer dependency (doesn't block core CLI)
- Provide escape hatches (custom assertions, manual test writing)
- Document migration path for each tool (don't force all-or-nothing adoption)

---

## Open Questions

1. **Monorepo vs separate repos?** Keep `@organon/testing` in organon-tools monorepo or separate package?
   - **Recommendation:** Monorepo (shared code, easier versioning) with separate npm packages

2. **Language support priority?** TypeScript → Python → Rust or different order?
   - **Recommendation:** TypeScript first (widest adoption), then Python (data science), then Rust

3. **LLM provider for synthesizer?** Lock to Anthropic or support multiple?
   - **Recommendation:** Start with Anthropic (dogfood Claude), add OpenAI later

4. **Visualization: static or dynamic?** Pre-rendered HTML or live server?
   - **Recommendation:** Both (static for docs, live for exploration)

5. **Testing framework: separate package or builtin?** Ship with organon-tools or publish separately?
   - **Recommendation:** Separate package (`@organon/testing`) but linked via monorepo

---

## Related Files

| File | Relationship |
|------|--------------|
| [../organon/domains/tools/ETHOS.md](../organon/domains/tools/ETHOS.md) | Tools must follow invariants (schema fidelity, idempotent, machine-parsable) |
| [../organon/domains/tools/PHILOSOPHY.md](../organon/domains/tools/PHILOSOPHY.md) | Design decisions (fail-fast, testability, clarity) apply to new tools |
| [../book-llms/three-layer-architecture.md](../book-llms/three-layer-architecture.md) | Tools implement Layer 3 (atomic operations) |
| [../book-llms/invariant-tracking.md](../book-llms/invariant-tracking.md) | Testing framework implements tier-4 testing spec |
| [../book-llms/frontmatter-system.md](../book-llms/frontmatter-system.md) | Init/discover tools must generate valid frontmatter |

---

## Next Steps

1. **Review and prioritize** - Stakeholder alignment on Phase 1 tools
2. **Create RFCs** - For each Phase 1 tool, write detailed RFC in `organon/methodology/rfcs/`
3. **Spike `organon init`** - Quick prototype to validate approach
4. **Design `@organon/testing` API** - Get feedback on assertion interface
5. **Prototype discovery heuristics** - Test domain detection on 3-5 codebases

**Status:** Draft / Awaiting Review
