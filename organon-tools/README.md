# Organon Tools

CLI tools and MCP server for the **Organon Methodology** — a documentation system that treats code as the single source of truth and uses auto-generation to prevent drift.

## What is Organon?

Organon is a methodology for keeping architectural documentation synchronized with code through:
- **Auto-generation**: Components are generated from code structure, never manually edited
- **Dual mapping**: Navigate by layer (domain/application/transport) OR by feature (cross-cutting concerns)
- **Verification**: Automated checks ensure documentation stays fresh (<24 hours after code changes)
- **Discovery**: Fast cross-domain search to find files, features, and domains

See [../book-llms/](../book-llms/) for the full methodology documentation.

## Installation

```bash
npm install @organon/tools
```

Or use directly with `npx`:
```bash
npx @organon/tools generate --all
```

## Commands

### Generate

Auto-generate `components.md` from codebase structure:

```bash
# Regenerate all domains
organon generate --all

# Regenerate specific domain
organon generate genesis

# Regenerate single domain
organon generate --domain=agents
```

**What it does:**
- Scans domain directories (domain/, application/, transport/)
- Detects features via directory naming conventions (fuzzy matching)
- Generates dual-mapped components.md (By Layer + By Feature)
- Adds auto-generated header warning

**Output:** `organon/domains/<domain>/components.md`

### Verify

Verify organon integrity across the codebase:

```bash
# Run all verification gates
organon verify

# Run specific gate
organon verify --gate=dual-mapping
```

**Verification Gates:**
1. **File References**: All file paths in organons exist
2. **RFC References**: All RFC references resolve
3. **Event References**: All EventBus event types exist
4. **Dual Mapping**: components.md has correct structure and freshness (<24 hours)

**Exit codes:**
- `0`: All gates passed ✅
- `1`: One or more gates failed ❌

### Find

Cross-domain discovery and navigation:

```bash
# Find which domain owns a file
organon find --file=GenesisStore.ts

# Find which domains implement a feature
organon find --feature=tool-registry

# Show domain overview (layer + feature breakdown)
organon find --domain=genesis
```

**Search Performance:**
- Target: <500ms for file/feature search
- Strategy: Scans pre-generated components.md files (not source code)
- Scales: Sub-linear performance regardless of codebase size

## Migration from agent-tavern

This package extracts organon tooling from [agent-tavern](https://github.com/VledicFranco/agent-tavern) to make it reusable across projects.

**Current status:** Scaffolding complete, implementation in progress

**Source files to migrate:**
```
agent-tavern/scripts/organon/
├── generate-components.ts    → src/commands/generate.ts
├── verify.ts                 → src/commands/verify.ts
├── find.ts                   → src/commands/find.ts
├── lib/
│   ├── file-scanner.ts       → src/lib/file-scanner.ts
│   ├── feature-detector.ts   → src/lib/feature-detector.ts
│   ├── dual-mapper.ts        → src/lib/dual-mapper.ts
│   └── dual-template.ts      → src/lib/dual-template.ts
└── verify-*.ts               → src/lib/verifiers/
```

## Future: MCP Server

Planned MCP server for IDE integration:

```bash
# Start MCP server (future)
organon mcp --port 3000
```

**Capabilities:**
- Real-time organon verification on file save
- Auto-complete for domain/feature names
- Jump-to-definition for organon references
- Inline warnings for stale documentation

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development (watch mode)
npm run dev

# Run locally
npm run organon:generate
npm run organon:verify
npm run organon:find -- --file=MyFile.ts
```

## License

MIT

## References

- **[Organon Book (LLMs)](../book-llms/)** — Full methodology documentation
- **[Agent Tavern](https://github.com/VledicFranco/agent-tavern)** — Reference implementation
- **[Organon Methodology RFC 027](https://github.com/VledicFranco/agent-tavern/blob/master/rfcs/027-organon-maintenance-tooling.md)** — Tooling design
