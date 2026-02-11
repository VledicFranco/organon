# Organon MCP Server Setup

> Turn Claude Code into an **Organon Methodology Coach** that guides you through proper organon development.

---

## What This Does

The Organon MCP server gives Claude Code 12 capabilities:

**8 Tools** (actionable functions):
1. `organon_validate_frontmatter` — Validate YAML frontmatter (4 stages)
2. `organon_generate_frontmatter` — Auto-generate frontmatter from content
3. `organon_query` — Query organons by metadata (scope, type, task, budget)
4. `organon_health` — System health check (coverage, validation, tokens)
5. `organon_find` — Find which organons govern a file/domain/feature
6. `organon_verify_triplets` — Verify protocol↔workflow↔tool bindings
7. `organon_suggest_tools` — Suggest automation tier for protocols
8. `organon_verify` — Run all verification gates

**4 Prompts** (methodology workflows):
1. `implement-feature` — Ethos-first feature development guide
2. `review-changes` — Review code changes against organon constraints
3. `create-organon` — Create new organon artifact (ETHOS/PHILOSOPHY/PROTOCOL)
4. `evolve-organon` — Modify existing constraints (with RFC awareness)

**4 Resources** (readable organon files):
- Auto-exposes all organon files in your project as MCP resources

---

## Quick Start

### 1. Build the Tools

```bash
cd organon-tools
npm install
npm run build
```

### 2. Configure Claude Desktop

Add to your Claude Desktop config (`~/.claude/config.json` or `%APPDATA%\Claude\config.json`):

```json
{
  "mcpServers": {
    "organon-coach": {
      "command": "node",
      "args": [
        "C:/Users/atfm0/Repositories/organon/organon-tools/dist/cli/index.js",
        "mcp",
        "--project-root",
        "C:/Users/atfm0/Repositories/organon"
      ]
    }
  }
}
```

**Note:** Adjust paths to match your system.

### 3. Restart Claude Desktop

Close and reopen Claude Desktop. The Organon Coach will be available in all conversations.

### 4. Verify It Works

In Claude Desktop, try:

```
Use the implement-feature prompt to guide me through adding a new feature
```

Claude should respond with the methodology workflow!

---

## Usage Examples

### Example 1: Create a New Feature Organon

**You:** "Use the create-organon prompt to help me create an ETHOS.md for a new caching feature"

**Claude (via Organon Coach):**
- Asks for scope (feature), name (caching), type (ethos)
- Guides you through the Identity (IS/IS NOT) section
- Shows you the Invariants, Principles, Heuristics structure
- Generates proper frontmatter using `organon_generate_frontmatter`
- Validates it using `organon_validate_frontmatter`

---

### Example 2: Implement a Feature Following Organon Constraints

**You:** "Use the implement-feature prompt for authentication feature in the users domain"

**Claude (via Organon Coach):**
- Loads product-level organons using `organon_query`
- Loads users domain organon
- Checks token budget (keeps under 15K)
- Guides you to create `organon/features/authentication/ETHOS.md` first
- Reminds you to follow invariants > principles priority
- Runs `organon_verify` after implementation
- Ensures organon updates happen in the SAME PR

---

### Example 3: Review Changes Against Constraints

**You:** "Use the review-changes prompt to check if my API changes violate any organons"

**Claude (via Organon Coach):**
- Uses `organon_find` to identify governing organons for changed files
- Loads relevant organons (product, domain, feature)
- Checks each invariant for violations
- Checks principle alignment
- Runs `organon_verify` gates
- Reports any issues that must be fixed before merge

---

### Example 4: Query What to Read for a Task

**You:** "Use organon_query to find organons I should read before implementing database migrations"

**Claude (via Organon Coach):**
```
organon_query(task: "database_migrations", scope: "product")
```
Returns: List of relevant organons with token estimates, stays within budget

---

### Example 5: Validate Frontmatter After Editing

**You:** "Use organon_validate_frontmatter to check if my ETHOS.md frontmatter is correct"

**Claude (via Organon Coach):**
```
organon_validate_frontmatter(files: ["organon-tools/ETHOS.md"], stages: [1,2,3,4])
```
Returns: Validation report (schema, references, truthfulness, consistency)

---

## How It Works

### Methodology Coach Pattern

The Organon MCP server acts as a **methodology coach** (like a Scrum Master):

1. **Guides process** — Prompts encode methodology workflows
2. **Validates compliance** — Tools check constraints are followed
3. **Provides context** — Resources expose organon files
4. **Prevents drift** — Verification gates catch violations

### Architecture

```
Claude Code
    ↓
MCP Protocol (stdio)
    ↓
Organon MCP Server (organon-tools/dist/cli/index.js mcp)
    ↓
Core Utilities (frontmatter-parser, validate, verify, query, etc.)
    ↓
Your Project's Organon Files
```

---

## Advanced: Claude Code CLI Integration

You can also use the MCP server from Claude Code CLI in a dedicated terminal:

```bash
# Terminal 1: Run Claude Code with Organon Coach
export CLAUDE_MCP_ORGANON="node organon-tools/dist/cli/index.js mcp --project-root ."
claude-code

# Now Claude has access to all 12 Organon capabilities!
```

---

## Troubleshooting

### Server Not Showing Up in Claude Desktop

1. Check config path is correct (`~/.claude/config.json` or `%APPDATA%\Claude\config.json`)
2. Verify absolute paths in config (no relative paths)
3. Check `organon-tools/dist/cli/index.js` exists (run `npm run build`)
4. Restart Claude Desktop completely (close all windows)

### Tool Call Fails

1. Verify `--project-root` points to your project with organons
2. Check organon files have valid frontmatter
3. Run `cd organon-tools && npm test` to verify core utilities work

### Prompt Not Appearing

1. Prompts are templates — ask Claude to "use the [prompt-name] prompt"
2. Example: "Use the implement-feature prompt to guide me"
3. Claude will invoke the prompt and follow the workflow

---

## What Makes This a "Methodology Coach"?

Traditional tools validate after the fact. The Organon Coach guides **during** development:

| Without Coach | With Organon Coach |
|---------------|-------------------|
| Write code → realize you violated invariant | Load constraints first → write compliant code |
| Guess which organons to read | Query by task → get exact context needed |
| Manually check frontmatter counts | Auto-generate → auto-validate |
| Hope you followed the process | Prompt guides each step explicitly |
| Merge → CI fails → fix | Verify before merge → CI passes |

**Result:** Constraints are followed **proactively**, not **reactively**.

---

## Next Steps

1. **Try it!** Use the `implement-feature` prompt for your next feature
2. **Customize prompts** — Edit `src/mcp/prompts.ts` for your workflows
3. **Add tools** — Add project-specific tools to `src/mcp/tools.ts`
4. **Share feedback** — This is v0.1.0, help us improve!

---

## Related Files

- [ETHOS.md](./ETHOS.md) — Constraints for organon-tools development
- [PHILOSOPHY.md](./PHILOSOPHY.md) — Why the tool is built this way
- [../book-llms/three-layer-architecture.md](../book-llms/three-layer-architecture.md) — Verification gates we implement
- [../book-llms/patterns.md](../book-llms/patterns.md) — Methodology patterns
