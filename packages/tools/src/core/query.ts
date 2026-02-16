/**
 * Query organon files by frontmatter metadata.
 *
 * Supports filtering by scope, type, priority, task, budget, name pattern,
 * and related entities. Returns matching files with frontmatter and total
 * token cost for context budget planning.
 */

import { parseFrontmatter, parseOrganonFile } from './frontmatter-parser.js';
import { joinPath } from './config.js';
import { discoverOrganonFiles } from './discover.js';
import type {
  DiagnosticMessage,
  EpistemicCategory,
  FileSystem,
  FrontmatterScope,
  FrontmatterType,
  LoadPriority,
  OrganonConfig,
  ParsedOrganonFile,
  QueryResult,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface QueryOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
  /** Filter by scope */
  scope?: FrontmatterScope;
  /** Filter by type */
  type?: FrontmatterType;
  /** Filter by load_priority */
  priority?: LoadPriority;
  /** Filter by required_for containing this task */
  task?: string;
  /** Maximum total token budget — stops adding files when budget exceeded */
  budget?: number;
  /** Filter by name pattern (substring match) */
  namePattern?: string;
  /** Filter by related domain name */
  relatedDomain?: string;
  /** Filter by related feature name */
  relatedFeature?: string;
  /** Filter by epistemic category */
  category?: EpistemicCategory;
  /** Include files without frontmatter in results */
  includeInvalid?: boolean;
  /** Return full file content (body) or just frontmatter */
  verbose?: boolean;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function query(options: QueryOptions): Promise<QueryResult> {
  const { projectRoot, config, fs } = options;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];

  // Discover all organon files
  const allFiles = await discoverOrganonFiles(projectRoot, config, fs);

  // Parse frontmatter for all files
  const parsed: ParsedOrganonFile[] = [];
  for (const file of allFiles) {
    const absPath = joinPath(projectRoot, file);
    try {
      const content = await fs.readFile(absPath);
      parsed.push(parseOrganonFile(file, content));
    } catch {
      errors.push({
        severity: 'error',
        code: 'FILE_READ_ERROR',
        message: `Cannot read file: ${file}`,
        file,
      });
    }
  }

  // Apply filters
  let filtered = parsed;

  // Filter out files without frontmatter (unless includeInvalid)
  if (!options.includeInvalid) {
    filtered = filtered.filter((f) => f.frontmatter !== null);
  }

  // Filter by scope
  if (options.scope) {
    filtered = filtered.filter((f) => f.frontmatter?.scope === options.scope);
  }

  // Filter by type
  if (options.type) {
    filtered = filtered.filter((f) => f.frontmatter?.type === options.type);
  }

  // Filter by priority
  if (options.priority) {
    filtered = filtered.filter((f) => f.frontmatter?.load_priority === options.priority);
  }

  // Filter by task (required_for)
  if (options.task) {
    filtered = filtered.filter((f) =>
      f.frontmatter?.required_for?.includes(options.task!),
    );
  }

  // Filter by name pattern
  if (options.namePattern) {
    const pattern = options.namePattern.toLowerCase();
    filtered = filtered.filter((f) =>
      f.frontmatter?.name?.toLowerCase().includes(pattern),
    );
  }

  // Filter by related domain
  if (options.relatedDomain) {
    filtered = filtered.filter((f) =>
      f.frontmatter?.related_domains?.includes(options.relatedDomain!) ||
      f.frontmatter?.name === options.relatedDomain,
    );
  }

  // Filter by related feature
  if (options.relatedFeature) {
    filtered = filtered.filter((f) =>
      f.frontmatter?.related_features?.includes(options.relatedFeature!) ||
      f.frontmatter?.name === options.relatedFeature,
    );
  }

  // Filter by epistemic category
  if (options.category) {
    filtered = filtered.filter((f) => classifyCategory(f) === options.category);
  }

  // Sort by load_priority (high first), then by token_estimate (smallest first)
  filtered.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPri = priorityOrder[a.frontmatter?.load_priority ?? 'medium'];
    const bPri = priorityOrder[b.frontmatter?.load_priority ?? 'medium'];
    if (aPri !== bPri) return aPri - bPri;
    return (a.frontmatter?.token_estimate ?? 0) - (b.frontmatter?.token_estimate ?? 0);
  });

  // Apply budget constraint
  if (options.budget) {
    let tokenSum = 0;
    const budgetFiltered: ParsedOrganonFile[] = [];
    for (const f of filtered) {
      const tokens = f.frontmatter?.token_estimate ?? 0;
      if (tokenSum + tokens <= options.budget) {
        budgetFiltered.push(f);
        tokenSum += tokens;
      } else {
        warnings.push({
          severity: 'warning',
          code: 'BUDGET_EXCEEDED',
          message: `Skipping '${f.path}' (${tokens} tokens) — would exceed budget of ${options.budget}`,
          file: f.path,
        });
      }
    }
    filtered = budgetFiltered;
  }

  // Strip body content if not verbose
  if (!options.verbose) {
    filtered = filtered.map((f) => ({
      ...f,
      body: '',
      content: '',
    }));
  }

  const totalTokens = filtered.reduce(
    (sum, f) => sum + (f.frontmatter?.token_estimate ?? 0),
    0,
  );

  return {
    success: errors.length === 0,
    files: filtered,
    totalTokens,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Epistemic category classification
// ---------------------------------------------------------------------------

/**
 * Classify an organon file into an epistemic category.
 *
 * - constraint: ETHOS.md files (type: constraints)
 * - assertion: Observation files (type: rationale, path in observations/)
 * - rule: Protocol files (type: procedures)
 */
export function classifyCategory(file: ParsedOrganonFile): EpistemicCategory | null {
  if (file.frontmatter?.type === 'constraints') return 'constraint';
  if (file.frontmatter?.type === 'rationale' && file.path.includes('observations/')) return 'assertion';
  if (file.frontmatter?.type === 'procedures') return 'rule';
  return null;
}
