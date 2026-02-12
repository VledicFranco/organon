# Glossary

Key terms used throughout the Organon methodology, listed alphabetically.

---

**Artifact type** — One of the three organon document types: ETHOS.md (constraints), PHILOSOPHY.md (rationale), or PROTOCOL.md (procedures). Each has a distinct purpose and standardized section structure.

**Automation tier** — A protocol's level of automation. *Manual*: requires human judgment. *Semi-automated*: 1-2 steps using a single tool. *Automated*: 5+ steps orchestrated by a workflow.

**Bidirectional reference** — A requirement that when file A references file B, file B must reference A back. Prevents orphaned workflows and broken traceability.

**Compound** — The practice of reserving 5-10% of a work session to improve the system itself (tools, workflows, protocols). Distinct from *evolve*, which updates constraints.

**Decision heuristic** — A pre-computed "when X, do Y" rule in an ETHOS.md file. Eliminates per-decision reasoning for recurring ambiguous situations.

**Enforcement loop** — The closed cycle that makes organons executable: Define (organon) -> Bind (workflow) -> Execute (tools) -> Verify (automated checks) -> Evolve (update organon). Without this loop, organons are suggestions.

**ETHOS.md** — The constraints artifact. Contains identity boundaries (IS/IS NOT), invariants, prioritized principles, and decision heuristics. The only required artifact type — an organon without an ETHOS.md is not an organon.

**Evolve** — Updating organon constraints (ETHOS.md, PHILOSOPHY.md) based on learnings. Happens less frequently than compounding. Requires an RFC for significant changes.

**Frontmatter** — YAML metadata at the top of every organon file. Provides type, scope, name, version, summary, and token_estimate so agents can discover and filter files without loading full content (~25-50 tokens per file).

**Gate** — An automated verification check that blocks or warns. Examples: frontmatter truthfulness, triplet integrity, invariant coverage. Gates fail builds, not just warn.

**Health score** — A 0-100 metric produced by `organon health` reflecting overall organon system integrity: frontmatter coverage, validation status, token analysis, and freshness.

**Inherits_from** — A frontmatter field declaring which parent organon's constraints this file inherits. Child scopes add constraints but cannot contradict parent constraints.

**Invariant** — A rule in an ETHOS.md file that must never be violated. Identified by a stable ID (e.g., `INV-META-1`) and optionally flagged as `judgment_call: true` if it requires human review rather than automated testing.

**Invariant coverage** — The percentage of declared invariants (in ETHOS.md frontmatter) that have corresponding tier-4 tests marked with `@organon-invariant` annotations.

**Judgment call** — An invariant that requires human review rather than automated verification. Flagged with `judgment_call: true` in frontmatter. Not counted as "uncovered" in coverage reports.

**MCP (Model Context Protocol)** — A protocol for IDE integration. The `organon mcp` command starts a server exposing tools, resources, and prompts that IDEs can consume.

**Meta-organon** — An organon that documents the organon system itself. This project's `book-llms/ETHOS.md` is the meta-organon — it defines the rules for writing organons.

**Organon** — (From Greek organon, "tool" or "instrument.") A complete guidance system consisting of at minimum an ETHOS.md, optionally a PHILOSOPHY.md and PROTOCOL.md, scoped to a project, domain, feature, or component.

**PHILOSOPHY.md** — The rationale artifact. Explains *why* decisions were made. Contains: The Problem, The Bet, Design Decisions, Trade-offs. Optional — write when decisions need documented reasoning.

**Progressive disclosure** — The core mechanism for token efficiency. Files support layered access: README-as-router (~50 tokens) -> frontmatter (~25-50 tokens) -> section headings (~100 tokens) -> specific section (variable) -> full file (full cost).

**PROTOCOL.md** — The procedures artifact. Contains numbered steps, preconditions, verification checklists. Written when a task must be done the same way every time.

**RFC (Request for Comments)** — A formal proposal for changes to organon constraints or significant features. Declares organon impact upfront (Create/Update/Delete) and follows a lifecycle: Draft -> Review -> Accepted -> Implementing -> Implemented.

**Same-PR principle** — Organon changes happen in the same PR as implementation, never deferred. Prevents drift between what the organon says and what the code does.

**Scope** — The hierarchy level an organon applies to. From broadest to narrowest: *product* (entire repo), *domain* (business bounded context), *feature* (cross-cutting capability), *component* (implementation unit). Also: *meta* (organon about organons) and *methodology* (how-we-build processes).

**Three-layer architecture** — The enforcement structure: Layer 1 (protocols) defines what must happen, Layer 2 (workflows) binds protocols to agent execution, Layer 3 (tools) performs atomic operations.

**Token estimate** — A frontmatter field (`token_estimate`) indicating the approximate full-file token cost. Used by agents for the load-or-skip decision and context budget planning.

**Triplet** — A complete protocol-workflow-tool binding. Verification checks that all automated protocols have workflows, all workflows reference valid protocols, and all referenced tools exist.

**Workflow** — The generic term for the agent binding layer (Layer 2). A workflow translates a protocol into executable steps. Implementations include Claude Code skills, Cursor rules, system prompt directives, runbooks, CI/CD pipelines, and git hooks. Never use "skill" as the generic term — always "workflow."
