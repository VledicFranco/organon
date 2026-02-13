---
type: navigation
scope: domain
name: tools-domain
version: "1.0"
summary: Tools domain — CLI and MCP server for organon verification, generation, and discovery
token_estimate: 80
provides: [tools-domain-navigation]
parent: organon-self-governance
audience: [llm, human]
---

# Tools Domain

> CLI tooling and MCP server for the Organon methodology. Verification gates, frontmatter generation, invariant tracking, and cross-domain discovery.

---

## Status

**Implementation:** Active development (8 CLI commands, 5 verification gates, 132 tests)

---

## Files

| File | Purpose | Status |
|------|---------|--------|
| [ETHOS.md](./ETHOS.md) | Domain identity, invariants, principles | Created |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | Design decisions, trade-offs, reasoning | Created |

---

## Domain Scope

**Published as:** `@organon-methodology/tools` (npm package)

**Code location:** `packages/tools/`

**Concepts:**
- Verification gates (frontmatter, references, triplets, coverage, workflow-quality)
- Frontmatter generation and validation
- Health scoring
- Cross-domain discovery (find, query)
- MCP server for IDE integration

---

## Related Files

| File | Relationship |
|------|--------------|
| [../../ETHOS.md](../../ETHOS.md) | Project-level constraints (tools domain inherits these) |
| [../../../packages/tools/](../../../packages/tools/) | Implementation source code |
| [../testing/](../testing/) | Sibling domain — semantic testing library |
