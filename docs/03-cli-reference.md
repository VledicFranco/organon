# CLI Reference

Complete reference for the `organon` CLI. All commands share common global options and follow the same patterns: structured output, non-zero exit codes on failure, and `--project-root` for monorepo support.

---

## Table of Contents

- [Global Options](#global-options)
- [Validation Commands](#validation-commands)
  - [validate](#validate)
  - [verify](#verify)
  - [health](#health)
- [Discovery Commands](#discovery-commands)
  - [find](#find)
  - [query](#query)
- [Generation Commands](#generation-commands)
  - [generate](#generate)
  - [generate-tests](#generate-tests)
- [Coverage Commands](#coverage-commands)
  - [coverage](#coverage)
- [Integration Commands](#integration-commands)
  - [export](#export)
  - [mcp](#mcp)
- [Configuration](#configuration)

---

## Global Options

These options are available on all commands:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--project-root` | string | Current directory | Project root directory. Required when running from a subdirectory. |
| `--config` | string | Auto-detected | Path to `organon.config.json`. |
| `--help` | boolean | | Show help for the command. |
| `--version` | boolean | | Show CLI version. |

---

## Validation Commands

### validate

Validate organon frontmatter through 4 stages: schema, references, truthfulness, and consistency.

```bash
organon validate                          # Validate all organon files
organon validate book-llms/ETHOS.md       # Validate a specific file
organon validate --stages 1 3             # Run only schema + truthfulness
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `[files..]` | positional | Specific files to validate (all if omitted) |
| `--stages` | number[] | Validation stages: 1=schema, 2=references, 3=truthfulness, 4=consistency |

**Validation stages:**

1. **Schema** — Required fields present, types match enums, name is kebab-case
2. **References** — `inherits_from` organons exist, related domains/features exist
3. **Truthfulness** — `invariants_count` matches actual invariants, `token_estimate` is reasonable
4. **Consistency** — `name` matches directory, `scope` matches location, bidirectional references

**Exit codes:** 0 = all files valid, 1 = one or more files failed.

---

### verify

Run verification gates. Gates are blocking checks that enforce organon integrity.

```bash
organon verify                            # Run all gates
organon verify --gate frontmatter         # Run only frontmatter gate
organon verify --gate frontmatter triplets  # Run specific gates
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `--gate` | string[] | Run specific gate(s) by name |

**Available gates:**

| Gate | What it checks |
|------|----------------|
| `frontmatter` | Frontmatter schema, truthfulness, and consistency |
| `references` | `inherits_from`, `loads:`, `protocol_file` paths resolve correctly |
| `domain-binding` | Every stable domain/feature has at least one `@organon-implements` source claim |
| `triplets` | Protocol → test binding integrity (invariant declared ↔ `@organon-invariant` annotation) |
| `placeholder-detection` | Template placeholders have been replaced with real content |
| `freshness` | Organon files are not stale relative to code changes |
| `invariant-coverage` | Every ETHOS.md invariant has a corresponding `@organon-invariant` test |
| `implementation-coverage` | % of invariants with `@organon-implements` source claims meets configured threshold |
| `protocol-coverage` | % of semi-automated/automated protocols with `@organon-implements` meets configured threshold |
| `version-alignment` | Config methodology version matches CLI version |

**Exit codes:** 0 = all gates passed, 1 = one or more gates failed.

---

### health

Show an overall health dashboard with a 0-100 score.

```bash
organon health                            # Quick summary
organon health --detailed                 # Show issue breakdown
organon health --detailed --fix-suggestions  # Include fix guidance
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `--detailed` | boolean | Show detailed issue breakdown |
| `--fix-suggestions` | boolean | Include fix suggestions for each issue |

**Output sections:**

- **Score** — 0-100 composite score
- **Coverage** — How many files have valid frontmatter
- **Validation** — Passing/failing/warning counts
- **Tokens** — Total tokens, average per file, largest file
- **Freshness** — Fresh/stale/unknown file counts

---

## Discovery Commands

### find

Cross-domain discovery. Find organon files by file path, scope, type, or name.

```bash
organon find --file=src/domain/genesis/Store.ts   # Find governing organons
organon find --scope=domain                        # List all domain organons
organon find --type=constraints                    # List all ETHOS.md files
organon find --name=frontmatter                    # Search by name substring
```

**Options:**

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `--file` | string | | Find organons governing this source file path |
| `--scope` | string | product, domain, feature, component, meta, methodology | List organons at this scope |
| `--type` | string | navigation, constraints, rationale, procedures, mapping | List organons of this type |
| `--name` | string | | Find organons matching this name (substring) |

At least one option is required.

---

### query

Filter organon files by frontmatter metadata. Useful for context budget planning.

```bash
organon query --scope=meta                   # List all meta-scope organons
organon query --budget=20000                 # Plan loading within 20K tokens
organon query --task=genesis_tool_impl       # Find organons for a task
organon query --priority=high --verbose      # Show high-priority files with content
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `--scope` | string | Filter by scope (product, domain, feature, etc.) |
| `--type` | string | Filter by type (constraints, rationale, etc.) |
| `--priority` | string | Filter by load_priority (high, medium, low) |
| `--task` | string | Filter by `required_for` task type |
| `--budget` | number | Maximum total token budget |
| `--name` | string | Filter by name (substring) |
| `--related` | string | Filter by related domain or feature |
| `--verbose` | boolean | Show full file content |

**Output:** File paths with type, scope, token estimates, priority, and summaries. Total token count at the bottom.

---

## Generation Commands

### generate

Auto-generate YAML frontmatter from file content. Extracts counts, estimates tokens, infers scope from directory structure.

```bash
organon generate book-llms/ETHOS.md           # Dry run (show generated frontmatter)
organon generate book-llms/ETHOS.md --update  # Write frontmatter to file
organon generate README.md --type=navigation  # Override auto-detected type
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `<file>` | positional (required) | File to generate frontmatter for |
| `--update` | boolean | Write generated frontmatter back to the file |
| `--type` | string | Override auto-detected type |
| `--scope` | string | Override auto-detected scope |

By default, runs as a dry run — shows what would be generated without modifying the file.

---

### generate-tests

Generate test scaffolds for invariants that lack tier-4 test coverage.

```bash
organon generate-tests                            # Scaffold all uncovered invariants
organon generate-tests --invariant INV-META-1     # Scaffold for specific invariant
organon generate-tests --out-dir tests/organon    # Write files to directory
organon generate-tests --json                     # Machine-readable output
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `--invariant` | string[] | Generate for specific invariant ID(s) |
| `--out-dir` | string | Directory to write generated test files |
| `--json` | boolean | Output machine-readable JSON |

Generated scaffolds include:
- The invariant ID and name
- Suggested assertion type (e.g., `assertMaxValue`, `assertFileExists`)
- A ready-to-use test file with `testInvariant()` wrapper and `@organon-invariant` annotation

---

## Coverage Commands

### coverage

Analyze invariant test coverage. Reports which invariants have tests, which are judgment calls, and which are uncovered.

```bash
organon coverage                  # Human-readable coverage report
organon coverage --json           # Machine-readable JSON output
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `--json` | boolean | Output as JSON |

**Output columns:**

| Column | Description |
|--------|-------------|
| ID | Invariant ID (e.g., `INV-META-1`) |
| Name | Short kebab-case label |
| Status | `covered`, `judgment` (judgment_call), or `uncovered` |
| Tests | File(s) containing tests for this invariant |

**Exit codes:** 0 = all testable invariants covered, 1 = uncovered invariants exist.

---

## Integration Commands

### export

Export the organon knowledge graph as structured JSON, classified by epistemic category. Produces entities, assertions, relationships, and rules for consumption by external knowledge systems.

```bash
organon export                  # Pretty-printed JSON to stdout
organon export --no-pretty      # Compact JSON (for piping)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--pretty` | boolean | `true` | Pretty-print JSON output |

**Output format:**

```json
{
  "version": "0.5.2",
  "exported_at": "2026-02-15T...",
  "entities": [{ "id": "organon:...", "kind": "organon-file", "category": "constraint" }],
  "assertions": [{ "id": "inv:INV-...", "category": "constraint", "predicate": "declares_invariant" }],
  "relationships": [{ "source": "organon:...", "predicate": "inherits_from", "target": "organon:..." }],
  "rules": [{ "id": "gate:frontmatter", "predicate": "validates", "type": "blocking" }]
}
```

**Exit codes:** `0` on success, `1` on error.

---

### mcp

Start the Organon MCP (Model Context Protocol) server on stdio transport. Enables IDE integration.

```bash
organon mcp                      # Start MCP server
organon mcp --project-root .     # Explicit project root
```

**Exposed capabilities:**

| Type | Count | Examples |
|------|-------|---------|
| Tools | 9 | `organon_validate_frontmatter`, `organon_verify`, `organon_health`, `organon_find`, `organon_query`, `organon_generate_frontmatter`, `organon_verify_triplets`, `organon_suggest_tools`, `organon_export` |
| Resources | 4 | `organon://index`, `organon://file/{path}`, `organon://scope/{scope}`, `organon://health` |
| Prompts | 4 | `implement-feature`, `review-changes`, `create-organon`, `evolve-organon` |

**Claude Code integration:**

Add to your `.claude/settings.json` or project MCP config:

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

---

## Configuration

Place `organon.config.json` at your project root to customize behavior.

### Minimal configuration

```json
{
  "organonPaths": ["organon"],
  "ignorePatterns": ["node_modules/**", "dist/**"]
}
```

### Full configuration

```json
{
  "organonPaths": ["book-llms", "organon", "."],
  "organonGlobs": [
    "**/ETHOS.md",
    "**/PHILOSOPHY.md",
    "**/PROTOCOL.md",
    "**/PROTOCOLS.md",
    "**/README.md",
    "**/components.md"
  ],
  "ignorePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.git/**",
    "**/coverage/**"
  ],
  "workflowPaths": {
    "claudeCode": ".claude/skills",
    "cursor": ".cursor/rules",
    "generic": "organon/workflows"
  },
  "freshnessThresholdHours": 720
}
```

### Configuration fields

| Field | Type | Description |
|-------|------|-------------|
| `organonPaths` | string[] | Directories to scan for organon files |
| `organonGlobs` | string[] | File patterns to match as organon files |
| `ignorePatterns` | string[] | Glob patterns to exclude from scanning |
| `workflowPaths` | object | Agent-specific workflow directories |
| `freshnessThresholdHours` | number | Hours before a file is considered stale (default: 720 = 30 days) |

Without a config file, the CLI uses conventions: it scans for `organon/` and `book-llms/` directories automatically.
