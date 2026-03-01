# Idea: Organon-Native RAG for Prompt Augmentation

> Status: Brainstorm — open questions unresolved. Do not implement until design is settled.

---

## Core Insight

Organon already does most of what RAG systems build from scratch:

| What RAG builds | What Organon already has |
|-----------------|--------------------------|
| Document index | `frontmatter` on every file |
| Chunk metadata | `type`, `scope`, `summary`, `token_estimate` |
| Relationships graph | `relationships`, `required_for` |
| Relevance signals | `scope` hierarchy + bidirectional refs |
| Size budgeting | `token_estimate` per file |

Instead of **probabilistic** retrieval via embeddings, organon enables
**deterministic, structured** retrieval via the frontmatter graph. This is a
meaningful architectural difference: explicit relationships rather than inferred ones.

---

## What This Could Look Like

A new CLI command or MCP tool that takes a task description and returns a ranked,
budget-aware set of files ready to inject into the prompt:

```bash
organon context --task "add a new CLI command" --budget 8000
```

Internally it would:
1. Parse the task → identify relevant scopes (e.g. `tools`)
2. Traverse frontmatter graph following `relationships` and `required_for`
3. Rank by scope proximity + content type relevance
4. Respect `token_estimate` to stay within `--budget`
5. Output ready-to-inject context (summaries first, full files if budget allows)

---

## Open Questions

1. **Graph traversal vs. embeddings** — Frontmatter gives deterministic retrieval
   but misses semantic relationships not explicitly declared. Is that a limitation
   or a feature? Explicit relationships may be more reliable for methodology content.

2. **Where does augmentation happen?** — Is `organon context` a pre-prompt step
   a human runs before a session, or an MCP tool an agent calls mid-task? Both
   are valid but imply different architectures and trust models.

3. **Output format** — Raw file content? A structured bundle? A pre-formatted
   prompt block with XML tags ready to inject into a `<context>` element?

4. **Hybrid retrieval** — Should the `summary` frontmatter field be embedded for
   lightweight semantic fallback when graph traversal isn't sufficient? This would
   combine structural (frontmatter graph) and semantic (embeddings on summaries)
   retrieval without embedding full documents.

5. **Relationship to the MCP server** — The existing MCP server already exposes
   organon files to agents. Is `organon context` a new primitive, or an enhancement
   to existing MCP tools?

---

## Connection to Other 0.6.0 Ideas

- **Advanced prompting**: retrieved context feeds into structured prompt templates
  (the `<context>` block in system prompts)
- **Experimentation/measurement**: retrieval quality and token efficiency are
  natural metrics for measuring organon's contribution to agent task outcomes
