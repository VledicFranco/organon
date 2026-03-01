# Advanced Claude Prompting Techniques — Research & Examples

> Research collected 2026-02-28. Techniques for getting the most out of Claude models,
> relevant to improving agent prompts in organon tooling and workflows.

---

## Key Techniques (2026)

### 1. Adaptive Thinking

Claude 4 models can dynamically decide when and how much to reason before responding.

- **Claude Opus 4.6**: `thinking: {type: "adaptive"}` — Claude decides on its own. Outperforms fixed budgets.
- **Claude Sonnet 4.6**: Supports both adaptive and manual extended thinking with interleaved mode.
- Enable interleaved thinking via beta header: `interleaved-thinking-2025-05-14`

Use for: complex reasoning, math, multi-step planning, agentic workflows.

### 2. Interleaved Thinking + Tool Use

Claude 4 models reason **between tool calls**, not just before them:
- Reason about a tool result before deciding the next action
- Chain multiple tools with reasoning steps in between
- More nuanced agentic decision-making in long-horizon workflows

### 3. Structured Prompts (Contract Style)

Treat system prompts like a spec document — explicit, bounded, checkable:
- State constraints as enumerable rules
- Define output format explicitly
- Front-load domain context so Claude doesn't have to infer it

### 4. Chain of Thought via XML Tags

Use `<thinking>` tags inside prompts (and few-shot examples) to signal when deep
reasoning is needed. Claude generalizes the reasoning style shown in examples.

Trigger phrases: "Consider all possible scenarios", "Explore alternative methodologies".

### 5. Explicit Uncertainty Permission

Tell Claude it's OK to say "I don't know" — reduces hallucinations significantly.
> "If you are unsure about something, say so — do not guess."

### 6. Token Budget Management

- Minimum thinking budget: **1,024 tokens** — start here, increase incrementally
- For budgets above **32K tokens**: use batch processing to avoid network issues
- Adaptive thinking removes the need to manually tune budgets for most workloads

---

## Well-Structured Prompt Example

A complete example demonstrating all techniques, using a CLI architecture task.

### System Prompt

```xml
<system>
You are a senior software architect specializing in CLI tooling and documentation systems.

<context>
You are working on a TypeScript CLI package (@organon-methodology/tools).
The codebase uses yargs for CLI argument parsing.
Commands live in src/commands/ and must be self-contained.
All output must be machine-parsable (JSON by default, human-readable with --pretty).
</context>

<constraints>
- Never add runtime dependencies without explicit approval
- Every new command must have a corresponding test file
- Output schema must be stable across patch versions (breaking changes = major bump)
- If a requirement is ambiguous, state your assumption explicitly before proceeding
- If you are unsure about something, say so — do not guess
</constraints>

<output_format>
Respond in two sections:
1. <analysis> — your reasoning about the problem
2. <implementation> — the actual code or solution
Keep analysis concise. Code must be complete and runnable, not pseudocode.
</output_format>
</system>
```

### User Message

```xml
<task>
Add a new CLI command: `organon diff`

It should compare two organon files and report:
- Fields present in one but not the other
- Fields with the same key but different values
- A summary score (% similarity)

Input: two file paths. Output: JSON diff report.
</task>

<examples>
<example>
  <input>organon diff organon/ETHOS.md organon/PHILOSOPHY.md</input>
  <output>
  {
    "similarity": 0.72,
    "only_in_a": ["invariants"],
    "only_in_b": ["principles"],
    "value_diffs": [
      { "key": "version", "a": "1.0.0", "b": "1.1.0" }
    ]
  }
  </output>
</example>
</examples>

<thinking>
Consider edge cases before writing code:
- What if one file has no frontmatter?
- What if both files are identical?
- What should the exit code be on diff found vs. no diff?
</thinking>
```

### Why Each Part Works

| Technique | Where Used |
|-----------|-----------|
| Structured contract | `<constraints>` block — explicit, checkable rules |
| Front-loaded context | `<context>` — domain knowledge upfront |
| Uncertainty permission | `"If you are unsure, say so — do not guess"` |
| Output control | `<output_format>` with named sections |
| Chain of thought | `<thinking>` tag prompting edge-case reasoning |
| Few-shot example | `<examples>` with concrete input/output |
| Adaptive thinking trigger | The `<thinking>` block signals Claude to reason deeply before coding |

---

## Sources

- [Prompt Engineering Overview — Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Extended Thinking Tips — Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/extended-thinking-tips)
- [Adaptive Thinking — Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
- [Building with Extended Thinking — Claude Docs](https://docs.claude.com/en/docs/build-with-claude/extended-thinking)
- [Claude: 7 Advanced Prompt Techniques](https://creatoreconomy.so/p/claude-7-advanced-ai-prompting-tips)
- [Anthropic's Interactive Prompt Engineering Tutorial (GitHub)](https://github.com/anthropics/prompt-eng-interactive-tutorial)
