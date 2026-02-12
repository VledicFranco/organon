---
type: navigation
scope: domain
name: tools
version: "1.0"
summary: CLI and MCP server for the Organon methodology — validate frontmatter, run verification gates, query organon files
token_estimate: 1700
provides: [architecture, cli-commands, mcp-server, configuration, programmatic-api]
parent: packages
audience: [llm, human]
---

# Organon Tools

CLI tools and MCP server for the **Organon Methodology** — enforce documentation constraints, validate frontmatter, and give agents immediate methodology context.

## Organon (Start Here)

This project uses the Organon methodology to govern its own development:

- **[ETHOS.md](../../organon/domains/tools/ETHOS.md)** — Constraints for developing organon-tools (what rules must never be violated)
- **[PHILOSOPHY.md](../../organon/domains/tools/PHILOSOPHY.md)** — Design decisions and trade-offs (why TypeScript, why CLI, why fail-fast)
- **[dev/](./dev/)** — Design docs, RFCs, and future tool ideas

**For contributors:** Read ETHOS.md first to understand invariants and principles. Read PHILOSOPHY.md to understand why the tool is built this way.

## Architecture

```
packages/tools/src/
├── core/               ← Pure logic (no I/O, no console, no process.exit)
│   ├── types.ts        ← FileSystem interface, result types, config
│   ├── config.ts       ← Convention-based config discovery
│   ├── frontmatter-parser.ts
│   ├── node-fs.ts      ← NodeFileSystem implementation
│   ├── validate-frontmatter.ts   ← 4-stage validation
│   ├── generate-frontmatter.ts   ← Auto-generate from content
│   ├── query.ts        ← Filter by scope/type/priority/budget
│   ├── health.ts       ← Coverage, validation, tokens, freshness
│   ├── find.ts         ← Cross-domain discovery
│   ├── verify-triplets.ts  ← Protocol↔workflow↔tool bindings
│   ├── suggest-tools.ts    ← Automation tier suggestions
│   └── verify.ts       ← Gate registry orchestrator
├── cli/                ← Thin yargs adapter
│   └── commands/       ← validate, generate, query, health, find, verify, mcp
├── mcp/                ← Thin MCP adapter
│   ├── server.ts       ← stdio transport
│   ├── tools.ts        ← 8 MCP tools
│   ├── resources.ts    ← 4 MCP resources
│   └── prompts.ts      ← 4 MCP prompts
└── index.ts            ← Public API
```

## CLI Commands

```bash
# Validate frontmatter (schema, references, truthfulness, consistency)
organon validate
organon validate book-llms/ETHOS.md
organon validate --stages 1 3

# Generate frontmatter from file content
organon generate book-llms/ETHOS.md
organon generate book-llms/ETHOS.md --update

# Query organon files by metadata
organon query --scope=meta
organon query --budget=20000
organon query --task=genesis_tool_impl

# Health dashboard
organon health
organon health --detailed --fix-suggestions

# Cross-domain discovery
organon find --file=src/domain/genesis/Store.ts
organon find --scope=domain
organon find --name=frontmatter

# Run verification gates
organon verify
organon verify --gate frontmatter triplets

# Start MCP server
organon mcp
```

## MCP Server

Start with `organon mcp`. Exposes:

**8 Tools:** `organon_validate_frontmatter`, `organon_generate_frontmatter`, `organon_query`, `organon_health`, `organon_find`, `organon_verify_triplets`, `organon_suggest_tools`, `organon_verify`

**4 Resources:** `organon://index`, `organon://file/{path}`, `organon://scope/{scope}`, `organon://health`

**4 Prompts:** `implement-feature`, `review-changes`, `create-organon`, `evolve-organon`

### Claude Code Integration

```json
{
  "mcpServers": {
    "organon": {
      "command": "npx",
      "args": ["tsx", "packages/tools/src/cli/index.ts", "mcp", "--project-root", "."]
    }
  }
}
```

## Configuration

Place `organon.config.json` at your project root:

```json
{
  "organonPaths": ["book-llms", "organon", "."],
  "organonGlobs": ["**/ETHOS.md", "**/PHILOSOPHY.md", "**/PROTOCOL.md", "**/README.md"],
  "ignorePatterns": ["node_modules/**", "dist/**"],
  "workflowPaths": {
    "claudeCode": ".claude/skills",
    "cursor": ".cursor/rules"
  },
  "freshnessThresholdHours": 720
}
```

Without a config file, conventions are used: scans for `organon/` and `book-llms/` directories automatically.

## Programmatic API

```typescript
import { validateFrontmatter, resolveConfig, NodeFileSystem } from '@organon/tools';

const fs = new NodeFileSystem();
const config = await resolveConfig('.', fs);
const result = await validateFrontmatter({ projectRoot: '.', config, fs });
```

## Development

```bash
npm install
npm run build
npm run dev          # watch mode
npm test             # vitest
npm run organon      # run CLI locally
```

## License

MIT
