# MCP Query API + Protocol-Guided Routing

> Design proposal for v0.6.0. Two related ideas: (1) a programmatic MCP query API that gives
> LLMs structured access to YAML organon data instead of raw file reading, and (2) replacing
> the skills-based workflow guidance with MCP protocol-guided tool chains.
>
> These are coupled: YAML-first makes organons queryable, the MCP API is how you query them,
> and routing replaces skills as the workflow guidance mechanism.

---

## Part 1: MCP Query API

### The Problem

Current LLM workflow: read files, parse Markdown, extract relevant sections, reason about
content. This is fragile — files can be large, structures vary, and the LLM does all the
parsing work. Every agent that needs to know "what are the invariants for this domain?"
re-reads and re-parses the same files.

### The Solution

MCP server loads `.methodology/organon/` YAML files and exposes a structured query interface.
LLMs call tools instead of reading files. Results are typed objects, not raw text.

```typescript
// Domain-level queries (from ethos.yaml, philosophy.yaml, protocol.yaml)
organon_query_domain_invariants(domain: string) → invariants[]
organon_query_domain_principles(domain: string) → principles[]
organon_query_decisions(domain: string) → decisions[]
organon_query_protocols(domain: string) → protocols[]

// Concept-level queries (from definitions.yaml, relationships.yaml, implementations.yaml)
organon_query_definitions(domain: string, search?: string) → definitions[]
organon_query_invariants(definition_id: string) → invariants[]
organon_query_relationships(domain: string) → relationships[]
organon_query_implementations(definition_id: string) → implementations[]

// Cross-level queries
organon_query_by_location(file: string) → {
  domain_invariants: [...],
  domain_principles: [...],
  definitions: [...],
  relationships: [...],
  implementations: [...]
}

// Management operations
organon_add_definition(domain: string, definition: YAML) → validates + persists to definitions.yaml
organon_update_invariant_binding(invariant_id: string, test_binding: object) → updates YAML
organon_validate_completeness(domain: string) → {missing_definitions, unbound_invariants, untested_implementations}
```

### Example LLM Workflow

```
LLM: "What are the verification gate invariants?"
→ organon_query_definitions(domain: "tools", search: "verification")
→ Returns: {definitions: [{id: DEF-TOOLS-001, invariants: [INV-TOOLS-001, INV-TOOLS-002]}]}
→ LLM has structured data to work with — no file parsing

LLM: "Add a new definition for Workflow"
→ organon_add_definition(domain: "tools", {id: DEF-TOOLS-003, name: "Workflow", invariants: [...]})
→ MCP validates YAML, checks references, updates definitions.yaml
→ All changes are structured, verifiable, composable
```

### Benefits Over File Reading

- No file parsing — LLM receives typed objects
- Query scope is explicit — ask for exactly what you need
- Mutations are validated — `organon_add_definition` checks schema before writing
- Completeness is queryable — `organon_validate_completeness` surfaces gaps
- Cacheable — MCP can cache loaded YAML; repeated queries are fast
- Composable — query results chain naturally into subsequent tool calls

---

## Part 2: MCP-Driven Routing (Skills Replacement)

### The Problem

Skills have persistent reliability issues: context loading failures, inconsistent invocation,
11 separate files to maintain, no clear entry point. An agent loading the wrong skill — or
failing to load one — silently degrades workflow quality with no feedback.

### The Solution

Replace skills with **protocol-guided MCP tool chains**. Each tool returns a routing prompt
that tells Claude what to do next. The methodology guidance lives inside the tools themselves,
not in skill files loaded at session start.

**Pattern:**
```
organon_main
  → "You have 3 options: RFC planning, verification, health check"
  → Claude picks → calls tool
    → tool returns structured result + routing prompt for next step
      → Claude follows routing prompt → calls next tool
        → etc.
```

**Entry point:**
- `organon_main` → routing prompt suggesting which tool(s) to use for the current task
- `organon_rfc_plan` → returns RFC structure + prompts for each section
- `organon_verify_guided` → runs gates, returns failures with fix guidance + next-step routing
- Similar routing for all major workflows

**User experience:** Install MCP server, point Claude to it. Guided workflows without loading
skill context files. First call to `organon_main` bootstraps the session.

### Open Design Questions

- **Which tools become routers vs terminal tools?** Terminal tools return data; router tools
  return data + routing prompt. Should all tools be routers, or only entry points?
- **Format of routing prompts:** Enum of options (structured, predictable) vs narrative guidance
  (flexible, harder to parse)?
- **Depth of nesting:** Flat router → tasks, or multi-level routing trees?
- **Deviation fallback:** If user deviates from suggested path, how does routing recover?

---

## Part 3: Phased Skill Deprecation

### Breaking Change: `organon_methodology_expert` Meta-Skill

Replace 11 individual skills with a single `organon_methodology_expert` meta-skill:
- What is Organon? (summary, identity, use cases)
- How to use the MCP server (setup instructions)
- Routing guide: which MCP tool to invoke for which task
- Quick reference table (task → tool → expected output)

Existing skills continue to work but are deprecated in docs. New projects use MCP-first.

### Migration Strategy

**Phase 1 (v0.6.0): Create meta-skill**
- Deploy `organon_methodology_expert` as single entry point
- All 11 existing skills remain functional
- Documentation updated: point new users to meta-skill + MCP
- Collect feedback on routing completeness

**Phase 2 (v0.6.x): MCP tool maturity**
- Ensure all major workflows have MCP tool equivalents
- Test end-to-end tool chaining patterns
- Validate routing prompt format across different Claude versions
- Fix gaps surfaced by Phase 1 feedback

**Phase 3 (v0.7.0+): Skill removal**
- Deprecate + remove individual skill files
- Update project templates to use only `organon_methodology_expert`
- Migration guide for projects on old skills
