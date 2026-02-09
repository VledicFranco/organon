/**
 * Auto-generate frontmatter from file content.
 *
 * Analyzes the file's content to infer type, scope, name, version,
 * summary, token_estimate, and type-specific counts. Can be used to
 * bootstrap frontmatter for new files or update stale counts.
 */

import { parseFrontmatter, estimateTokens, extractSection, countSectionEntries, countTableRows } from './frontmatter-parser.js';
import { parseProtocols } from './add-protocols-array.js';
import { joinPath, baseName, dirName } from './config.js';
import { stringify as yamlStringify } from 'yaml';
import type {
  DiagnosticMessage,
  FileSystem,
  Frontmatter,
  FrontmatterScope,
  FrontmatterType,
  GenerateFrontmatterResult,
  OrganonConfig,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface GenerateFrontmatterOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
  /** File to generate frontmatter for (project-relative path) */
  file: string;
  /** If true, write updated frontmatter back to file */
  update?: boolean;
  /** Override auto-detected type */
  type?: FrontmatterType;
  /** Override auto-detected scope */
  scope?: FrontmatterScope;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function generateFrontmatter(
  options: GenerateFrontmatterOptions,
): Promise<GenerateFrontmatterResult> {
  const { projectRoot, fs, file } = options;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];

  const absPath = joinPath(projectRoot, file);
  let content: string;
  try {
    content = await fs.readFile(absPath);
  } catch {
    return {
      success: false,
      file,
      generated: {},
      errors: [{
        severity: 'error',
        code: 'FILE_READ_ERROR',
        message: `Cannot read file: ${file}`,
        file,
      }],
      warnings: [],
    };
  }

  const existing = parseFrontmatter(content);
  const body = existing.body || content;
  const existingFm = existing.frontmatter;

  // Infer fields from content and path
  const type = options.type ?? existingFm?.type ?? inferType(file);
  const scope = options.scope ?? existingFm?.scope ?? inferScope(file);
  const name = existingFm?.name ?? inferName(file);
  const version = existingFm?.version ?? '1.0';
  const summary = existingFm?.summary ?? inferSummary(body);
  const tokenEstimate = estimateTokens(content);

  const generated: Partial<Frontmatter> = {
    type,
    scope,
    name,
    version,
    summary,
    token_estimate: tokenEstimate,
  };

  // Type-specific fields
  if (type === 'constraints') {
    const invariantsSection = extractSection(body, 'Invariants');
    if (invariantsSection) {
      generated.invariants_count = countSectionEntries(invariantsSection);
    }
    const principlesSection = extractSection(body, 'Principles');
    if (principlesSection) {
      generated.principles_count = countSectionEntries(principlesSection);
    }
    const heuristicsSection = extractSection(body, 'Decision Heuristics');
    if (heuristicsSection) {
      generated.heuristics_count = countTableRows(heuristicsSection);
    }
  }

  if (type === 'rationale') {
    const decisionsSection = extractSection(body, 'Design Decisions');
    if (decisionsSection) {
      generated.decision_count = countSectionEntries(decisionsSection);
    }
  }

  if (type === 'procedures') {
    const protocols = parseProtocols(body);
    if (protocols.length > 0) {
      generated.protocols_count = protocols.length;
      generated.protocols = protocols;
    }
  }

  if (type === 'navigation') {
    generated.provides = inferProvides(body);
    generated.parent = inferParent(file);
  }

  // Preserve existing relationship fields
  if (existingFm) {
    if (existingFm.inherits_from) generated.inherits_from = existingFm.inherits_from;
    if (existingFm.related_domains) generated.related_domains = existingFm.related_domains;
    if (existingFm.related_features) generated.related_features = existingFm.related_features;
    if (existingFm.primary_rfcs) generated.primary_rfcs = existingFm.primary_rfcs;
    if (existingFm.secondary_rfcs) generated.secondary_rfcs = existingFm.secondary_rfcs;
    if (existingFm.load_priority) generated.load_priority = existingFm.load_priority;
    if (existingFm.required_for) generated.required_for = existingFm.required_for;
    if (existingFm.audience) generated.audience = existingFm.audience;
    if (existingFm.last_reviewed) generated.last_reviewed = existingFm.last_reviewed;
    if (existingFm.methodology_version) generated.methodology_version = existingFm.methodology_version;
  }

  return {
    success: errors.length === 0,
    file,
    generated,
    errors,
    warnings,
  };
}

/**
 * Serialize generated frontmatter as a YAML block (with --- delimiters).
 */
export function serializeFrontmatter(fm: Partial<Frontmatter>): string {
  const yaml = yamlStringify(fm, { lineWidth: 120 });
  return `---\n${yaml}---\n`;
}

// ---------------------------------------------------------------------------
// Inference helpers
// ---------------------------------------------------------------------------

function inferType(file: string): FrontmatterType {
  const name = baseName(file).toUpperCase();
  if (name === 'ETHOS.MD') return 'constraints';
  if (name === 'PHILOSOPHY.MD') return 'rationale';
  if (name === 'PROTOCOL.MD' || name === 'PROTOCOLS.MD') return 'procedures';
  if (name === 'README.MD') return 'navigation';
  if (name === 'COMPONENTS.MD') return 'mapping';
  // Default based on content — but since we don't have content here, pick constraints
  return 'constraints';
}

function inferScope(file: string): FrontmatterScope {
  const path = file.replace(/\\/g, '/');
  if (path.includes('/domains/')) return 'domain';
  if (path.includes('/features/')) return 'feature';
  if (path.includes('/components/')) return 'component';
  if (path.includes('/methodology/')) return 'methodology';
  if (path.includes('book-llms/') || path.includes('book-humans/')) return 'meta';
  // Top-level files are product scope
  const depth = path.split('/').length;
  if (depth <= 2) return 'product';
  return 'meta';
}

function inferName(file: string): string {
  const dir = dirName(file);
  const parts = dir.replace(/\\/g, '/').split('/');
  const parentDir = parts[parts.length - 1];
  if (parentDir && parentDir !== '.' && parentDir !== '') {
    return parentDir.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  // Fallback: use filename without extension
  const filename = baseName(file);
  return filename.replace(/\.md$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function inferSummary(body: string): string {
  // Look for the first line that's not a heading, empty, or horizontal rule
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('---')) continue;
    if (trimmed.startsWith('>')) {
      // Blockquote — use as summary
      const text = trimmed.replace(/^>\s*/, '');
      if (text.length > 200) return text.slice(0, 197) + '...';
      return text;
    }
    // First paragraph line
    if (trimmed.length > 200) return trimmed.slice(0, 197) + '...';
    return trimmed;
  }
  return 'No summary available';
}

function inferProvides(body: string): string[] {
  const provides: string[] = [];
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for links or list items
    const linkMatch = trimmed.match(/^\-\s*\[([^\]]+)\]/);
    if (linkMatch) {
      provides.push(linkMatch[1]);
    }
  }
  return provides.length > 0 ? provides : ['contents'];
}

function inferParent(file: string): string {
  const dir = dirName(file);
  const parts = dir.replace(/\\/g, '/').split('/');
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return 'root';
}
