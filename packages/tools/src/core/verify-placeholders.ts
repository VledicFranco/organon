/**
 * Placeholder detection gate (advisory).
 *
 * Detects template placeholders like [Describe what your project does]
 * that indicate the user hasn't customized their organon files yet.
 *
 * @organon-invariant INV-TOOLS-2 every-command-has-tests
 */

import { joinPath } from './config.js';
import type {
  DiagnosticMessage,
  FileSystem,
  OrganonConfig,
} from './types.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLACEHOLDER_RE = /\[(?:Describe|Your|Invariant name|Define|List|Add|Common decision|Decision Name|Choice|What you|Priority|Evidence point)[\w\s.,?!-]*\]/g;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlaceholderResult {
  success: boolean;
  filesChecked: number;
  filesWithPlaceholders: number;
  totalPlaceholders: number;
  results: PlaceholderFileResult[];
  errors: DiagnosticMessage[];
  warnings: DiagnosticMessage[];
}

export interface PlaceholderFileResult {
  file: string;
  placeholders: string[];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function verifyPlaceholders(options: {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}): Promise<PlaceholderResult> {
  const { projectRoot, config, fs } = options;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];
  const results: PlaceholderFileResult[] = [];

  const files = await discoverOrganonFiles(projectRoot, config, fs);

  for (const file of files) {
    const absPath = joinPath(projectRoot, file);
    let content: string;
    try {
      content = await fs.readFile(absPath);
    } catch {
      continue;
    }

    const matches = content.match(PLACEHOLDER_RE);
    if (matches && matches.length > 0) {
      const unique = [...new Set(matches)];
      results.push({ file, placeholders: unique });

      for (const placeholder of unique) {
        warnings.push({
          severity: 'warning',
          code: 'PLACEHOLDER_DETECTED',
          message: `Template placeholder not customized: ${placeholder}`,
          file,
          suggestion: `Replace ${placeholder} with project-specific content`,
        });
      }
    }
  }

  const filesWithPlaceholders = results.length;
  const totalPlaceholders = results.reduce((sum, r) => sum + r.placeholders.length, 0);

  return {
    success: true, // Advisory gate — always passes
    filesChecked: files.length,
    filesWithPlaceholders,
    totalPlaceholders,
    results,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function discoverOrganonFiles(
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): Promise<string[]> {
  const allFiles = new Set<string>();

  for (const organonPath of config.organonPaths) {
    for (const pattern of config.organonGlobs) {
      const fullPattern = organonPath === '.' ? pattern : `${organonPath}/${pattern}`;
      const matches = await fs.glob(fullPattern, {
        cwd: projectRoot,
        ignore: config.ignorePatterns,
      });
      for (const m of matches) {
        allFiles.add(m);
      }
    }
  }

  return [...allFiles].sort();
}
