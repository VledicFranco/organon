/**
 * In-memory FileSystem for testing core functions.
 */

import type { FileSystem, FileStat } from './types.js';

interface MemoryFile {
  content: string;
  mtime: Date;
}

export class MemoryFileSystem implements FileSystem {
  private files = new Map<string, MemoryFile>();
  private throwPaths = new Set<string>();
  private throwReadPaths = new Set<string>();

  constructor(files?: Record<string, string>) {
    if (files) {
      for (const [path, content] of Object.entries(files)) {
        this.addFile(path, content);
      }
    }
  }

  addFile(path: string, content: string, mtime?: Date): void {
    this.files.set(normalize(path), {
      content,
      mtime: mtime ?? new Date(),
    });
  }

  /** Make exists() and readFile() throw for any path containing this substring. */
  throwOn(pathSubstring: string): void {
    this.throwPaths.add(pathSubstring);
  }

  /** Make only readFile() throw for any path containing this substring (exists() still works). */
  throwOnRead(pathSubstring: string): void {
    this.throwReadPaths.add(pathSubstring);
  }

  private checkThrow(path: string): void {
    for (const sub of this.throwPaths) {
      if (path.includes(sub)) {
        throw new Error(`EPERM: permission denied, '${path}'`);
      }
    }
  }

  private checkThrowRead(path: string): void {
    for (const sub of this.throwReadPaths) {
      if (path.includes(sub)) {
        throw new Error(`EPERM: permission denied, '${path}'`);
      }
    }
  }

  async readFile(path: string): Promise<string> {
    this.checkThrow(path);
    this.checkThrowRead(path);
    const file = this.files.get(normalize(path));
    if (!file) throw new Error(`ENOENT: ${path}`);
    return file.content;
  }

  async readDir(dirPath: string): Promise<string[]> {
    const dir = normalize(dirPath);
    const entries = new Set<string>();
    for (const key of this.files.keys()) {
      if (key.startsWith(dir + '/')) {
        const rest = key.slice(dir.length + 1);
        const firstSegment = rest.split('/')[0];
        entries.add(firstSegment);
      }
    }
    return [...entries];
  }

  async exists(path: string): Promise<boolean> {
    this.checkThrow(path);
    const norm = normalize(path);
    // Check exact file match
    if (this.files.has(norm)) return true;
    // Check if it's a directory (any file starts with this path)
    for (const key of this.files.keys()) {
      if (key.startsWith(norm + '/')) return true;
    }
    return false;
  }

  async glob(pattern: string, options?: { cwd: string; ignore?: string[] }): Promise<string[]> {
    const cwd = options?.cwd ? normalize(options.cwd) : '';
    const ignorePatterns = options?.ignore ?? [];

    const results: string[] = [];
    for (const key of this.files.keys()) {
      // Files in cwd
      const relative = cwd ? (key.startsWith(cwd + '/') ? key.slice(cwd.length + 1) : null) : key;
      if (relative === null) continue;

      // Simple glob matching
      if (matchGlob(relative, pattern)) {
        // Check ignore patterns
        const ignored = ignorePatterns.some((ip) => matchGlob(relative, ip));
        if (!ignored) {
          results.push(relative);
        }
      }
    }
    return results.sort();
  }

  async stat(path: string): Promise<FileStat> {
    const file = this.files.get(normalize(path));
    if (!file) throw new Error(`ENOENT: ${path}`);
    return { mtime: file.mtime, size: file.content.length };
  }
}

function normalize(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '');
}

/**
 * Simple glob matcher supporting:
 *   **  = any path segments
 *   *   = any characters except /
 */
function matchGlob(path: string, pattern: string): boolean {
  // Convert glob to regex
  let regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*\//g, '§§/')   // temp placeholder for **/
    .replace(/\*\*/g, '§§')      // temp placeholder for bare **
    .replace(/\*/g, '[^/]*')      // * matches anything except /
    .replace(/§§\//g, '(.*/)?')   // **/ matches zero or more path segments
    .replace(/§§/g, '.*');        // ** matches anything including /
  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(path);
}

/**
 * Create a minimal ETHOS.md file content for testing.
 */
export function makeEthos(opts?: {
  name?: string;
  scope?: string;
  invariants?: number;
  principles?: number;
  heuristics?: number;
  extra?: Record<string, unknown>;
}): string {
  const {
    name = 'test-ethos',
    scope = 'domain',
    invariants = 3,
    principles = 2,
    heuristics = 2,
    extra = {},
  } = opts ?? {};

  const extraEntries = Object.entries(extra)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  const extraFields = extraEntries.length > 0 ? extraEntries.join('\n') + '\n' : '';

  const invLines = Array.from({ length: invariants }, (_, i) =>
    `${i + 1}. **Rule ${i + 1}.** Description of rule ${i + 1}.`
  ).join('\n');

  const priLines = Array.from({ length: principles }, (_, i) =>
    `${i + 1}. **Principle ${i + 1}.** Description of principle ${i + 1}.`
  ).join('\n');

  const heuristicRows = Array.from({ length: heuristics }, (_, i) =>
    `| Situation ${i + 1} | Action ${i + 1} |`
  ).join('\n');

  const tokenEstimate = Math.ceil(
    (`---\ntype: constraints\nscope: ${scope}\nname: ${name}\nversion: "1.0"\nsummary: Test ethos\ntoken_estimate: 500\ninvariants_count: ${invariants}\nprinciples_count: ${principles}\nheuristics_count: ${heuristics}\n${extraFields}\n---\n\n# ${name}\n\n## Identity\n\n### What ${name} IS\n- A test\n\n### What ${name} IS NOT\n- Not production\n\n## Invariants\n\n${invLines}\n\n## Principles (Prioritized)\n\n${priLines}\n\n## Decision Heuristics\n\n| Situation | Action |\n|-----------|--------|\n${heuristicRows}\n`).length / 4
  );

  return `---
type: constraints
scope: ${scope}
name: ${name}
version: "1.0"
summary: Test ethos
token_estimate: ${tokenEstimate}
invariants_count: ${invariants}
principles_count: ${principles}
heuristics_count: ${heuristics}
${extraFields}---

# ${name}

## Identity

### What ${name} IS
- A test

### What ${name} IS NOT
- Not production

## Invariants

${invLines}

## Principles (Prioritized)

${priLines}

## Decision Heuristics

| Situation | Action |
|-----------|--------|
${heuristicRows}
`;
}

/**
 * Create a minimal PHILOSOPHY.md for testing.
 */
export function makePhilosophy(opts?: { name?: string; decisions?: number }): string {
  const { name = 'test-philosophy', decisions = 2 } = opts ?? {};
  const decisionLines = Array.from({ length: decisions }, (_, i) =>
    `### ${i + 1}. Decision ${i + 1}\nDescription.\n**Rationale:** Because.`
  ).join('\n\n');

  return `---
type: rationale
scope: domain
name: ${name}
version: "1.0"
summary: Test philosophy
token_estimate: 400
decision_count: ${decisions}
---

# ${name}

## The Problem

Test problem.

## The Bet

Test bet.

## Design Decisions

${decisionLines}

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Choice 1 | Gain 1 | Cost 1 |
`;
}

/**
 * Create a minimal README.md for testing.
 */
export function makeReadme(opts?: { name?: string; scope?: string }): string {
  const { name = 'test-readme', scope = 'domain' } = opts ?? {};
  return `---
type: navigation
scope: ${scope}
name: ${name}
version: "1.0"
summary: Test navigation
token_estimate: 100
---

# ${name}

- [ETHOS.md](ETHOS.md)
- [PHILOSOPHY.md](PHILOSOPHY.md)
`;
}

/**
 * Create a minimal workflow file for testing.
 */
export function makeWorkflow(opts?: {
  name?: string;
  protocolId?: string;
  protocolFile?: string;
  tools?: string[];
  loads?: string[];
  includeRecovery?: boolean;
  steps?: number;
}): string {
  const {
    name = 'test-workflow',
    protocolId = 'PROTO-TEST-1',
    protocolFile = 'PROTOCOLS.md',
    tools = ['tool:verify'],
    loads = ['/ETHOS.md'],
    includeRecovery = true,
    steps = 3,
  } = opts ?? {};

  const toolsYaml = tools.map((t) => `  - ${t}`).join('\n');
  const loadsYaml = loads.map((l) => `  - ${l}`).join('\n');

  const stepLines = Array.from({ length: steps }, (_, i) =>
    `${i + 1}. **Step ${i + 1}.** Run \`${tools[0] ?? 'tool:action'}\` to do thing ${i + 1}.`,
  ).join('\n\n');

  const recoverySection = includeRecovery
    ? `\n## Error Recovery\n\n| Failure | Recovery Action |\n|---------|------------------|\n| Tool fails | Re-run after fixing the issue |\n`
    : '';

  return `---
name: ${name}
protocol_id: ${protocolId}
protocol_file: ${protocolFile}
tools:
${toolsYaml}
loads:
${loadsYaml}
---

# Workflow: ${name}

## Context Loading

1. Load product organons

## Steps

${stepLines}

## Verification

Run verification tools.
${recoverySection}`;
}
