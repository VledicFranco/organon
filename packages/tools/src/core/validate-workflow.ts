/**
 * Workflow quality validation.
 *
 * Checks workflow files against the quality attributes defined in
 * workflow-authoring.md: completeness, context sufficiency, error
 * recoverability, and tool references.
 *
 * Registered as the 'workflow-quality' verification gate.
 */

import { parseFrontmatter, extractSection } from './frontmatter-parser.js';
import { joinPath } from './config.js';
import type {
  DiagnosticMessage,
  FileSystem,
  OrganonConfig,
  WorkflowFileResult,
  WorkflowValidationResult,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface ValidateWorkflowOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOADS_SIZE_THRESHOLD = 10;
const TABLE_ROW_RE = /^\|[^|]+\|[^|]+\|/m;
const STEP_RE = /^\d+\.\s/gm;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function validateWorkflow(
  options: ValidateWorkflowOptions,
): Promise<WorkflowValidationResult> {
  const { projectRoot, config, fs } = options;
  const allErrors: DiagnosticMessage[] = [];
  const allWarnings: DiagnosticMessage[] = [];
  const results: WorkflowFileResult[] = [];

  // Discover workflow files
  const workflowFiles = await discoverWorkflowFiles(projectRoot, config, fs);

  for (const file of workflowFiles) {
    const fileErrors: DiagnosticMessage[] = [];
    const fileWarnings: DiagnosticMessage[] = [];

    const absPath = joinPath(projectRoot, file);
    let content: string;
    try {
      content = await fs.readFile(absPath);
    } catch {
      fileErrors.push({
        severity: 'error',
        code: 'FILE_READ_ERROR',
        message: `Cannot read workflow file: ${file}`,
        file,
      });
      results.push({ file, valid: false, errors: fileErrors, warnings: fileWarnings });
      allErrors.push(...fileErrors);
      continue;
    }

    const { frontmatter, body } = parseFrontmatter(content);

    // --- Schema checks (errors) ---

    const protocolId = frontmatter?.['protocol_id'] as string | undefined;
    const protocolFile = frontmatter?.['protocol_file'] as string | undefined;
    const tools = frontmatter?.['tools'] as string[] | undefined;
    const loads = frontmatter?.['loads'] as string[] | undefined;

    if (!protocolId) {
      fileErrors.push({
        severity: 'error',
        code: 'WORKFLOW_MISSING_PROTOCOL_ID',
        message: 'Workflow is missing required field: protocol_id',
        file,
        suggestion: 'Add protocol_id to frontmatter referencing the protocol this workflow implements',
      });
    }

    if (!protocolFile) {
      fileErrors.push({
        severity: 'error',
        code: 'WORKFLOW_MISSING_PROTOCOL_FILE',
        message: 'Workflow is missing required field: protocol_file',
        file,
        suggestion: 'Add protocol_file to frontmatter with the path to the protocol source',
      });
    }

    if (!tools || !Array.isArray(tools) || tools.length === 0) {
      fileErrors.push({
        severity: 'error',
        code: 'WORKFLOW_MISSING_TOOLS',
        message: 'Workflow is missing required field: tools (must be a non-empty array)',
        file,
        suggestion: 'Add tools array listing the tools this workflow orchestrates',
      });
    }

    if (!loads || !Array.isArray(loads) || loads.length === 0) {
      fileErrors.push({
        severity: 'error',
        code: 'WORKFLOW_MISSING_LOADS',
        message: 'Workflow is missing required field: loads (must be a non-empty array)',
        file,
        suggestion: 'Add loads array listing organon files to load before execution',
      });
    }

    // --- Loads sufficiency checks (errors) ---

    if (loads && Array.isArray(loads)) {
      for (const loadPath of loads) {
        const absLoadPath = joinPath(projectRoot, loadPath);
        const exists = await fs.exists(absLoadPath);
        if (!exists) {
          fileErrors.push({
            severity: 'error',
            code: 'WORKFLOW_BROKEN_LOADS_REF',
            message: `Loads path '${loadPath}' does not resolve to an existing file`,
            file,
            suggestion: `Check the path or remove '${loadPath}' from loads array`,
          });
        }
      }

      // Loads overload warning
      if (loads.length > LOADS_SIZE_THRESHOLD) {
        fileWarnings.push({
          severity: 'warning',
          code: 'WORKFLOW_LOADS_OVERLOAD',
          message: `Loads array has ${loads.length} entries (threshold: ${LOADS_SIZE_THRESHOLD}). Consider narrowing to only required files.`,
          file,
        });
      }
    }

    // --- Error recovery check (warnings) ---

    const recoverySection = extractSection(body, 'Error Recovery')
      ?? extractSection(body, 'Recovery');

    if (!recoverySection) {
      fileWarnings.push({
        severity: 'warning',
        code: 'WORKFLOW_NO_ERROR_RECOVERY',
        message: 'Workflow has no ## Error Recovery or ## Recovery section',
        file,
        suggestion: 'Add an error recovery section with a failure/recovery table',
      });
    } else if (!TABLE_ROW_RE.test(recoverySection)) {
      fileWarnings.push({
        severity: 'warning',
        code: 'WORKFLOW_RECOVERY_NO_TABLE',
        message: 'Error recovery section exists but has no failure/recovery table',
        file,
        suggestion: 'Add a table with | Failure | Recovery Action | columns',
      });
    }

    // --- Step coverage check (warnings) ---

    if (protocolFile && protocolId) {
      const stepCount = await getProtocolStepCount(projectRoot, protocolFile, protocolId, fs);
      if (stepCount !== null) {
        const stepsSection = extractSection(body, 'Steps');
        if (stepsSection) {
          const workflowSteps = countSteps(stepsSection);
          if (workflowSteps < stepCount) {
            fileWarnings.push({
              severity: 'warning',
              code: 'WORKFLOW_STEP_COUNT_LOW',
              message: `Workflow has ${workflowSteps} steps but protocol ${protocolId} has ${stepCount}`,
              file,
              suggestion: 'Add missing steps or document why they are skipped',
            });
          }
        }
      }
    }

    // --- Tool reference check (warnings) ---

    if (tools && Array.isArray(tools)) {
      for (const tool of tools) {
        if (!body.includes(tool)) {
          fileWarnings.push({
            severity: 'warning',
            code: 'WORKFLOW_UNREFERENCED_TOOL',
            message: `Tool '${tool}' is listed in tools array but not referenced in workflow body`,
            file,
            suggestion: `Reference '${tool}' in the Steps section or remove it from the tools array`,
          });
        }
      }
    }

    const valid = fileErrors.length === 0;
    results.push({ file, valid, errors: fileErrors, warnings: fileWarnings });
    allErrors.push(...fileErrors);
    allWarnings.push(...fileWarnings);
  }

  return {
    success: allErrors.length === 0,
    workflowsChecked: workflowFiles.length,
    workflowsWithErrors: results.filter((r) => !r.valid).length,
    workflowsWithWarnings: results.filter((r) => r.warnings.length > 0).length,
    results,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countSteps(stepsSection: string): number {
  const matches = stepsSection.match(STEP_RE);
  return matches ? matches.length : 0;
}

async function getProtocolStepCount(
  projectRoot: string,
  protocolFile: string,
  protocolId: string,
  fs: FileSystem,
): Promise<number | null> {
  const absPath = joinPath(projectRoot, protocolFile);
  try {
    const content = await fs.readFile(absPath);
    const { frontmatter } = parseFrontmatter(content);
    if (frontmatter?.protocols && Array.isArray(frontmatter.protocols)) {
      const proto = frontmatter.protocols.find(
        (p: { id?: string }) => p.id === protocolId,
      );
      if (proto && typeof proto.steps === 'number') {
        return proto.steps;
      }
    }
  } catch {
    // Protocol file not found or unreadable — skip this check
  }
  return null;
}

async function discoverWorkflowFiles(
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): Promise<string[]> {
  const files = new Set<string>();
  const paths = config.workflowPaths;

  const searchPaths = [
    paths.claudeCode,
    paths.cursor,
    paths.generic,
  ].filter((p): p is string => p !== undefined);

  for (const dir of searchPaths) {
    const fullDir = joinPath(projectRoot, dir);
    if (await fs.exists(fullDir)) {
      const matches = await fs.glob('**/*.md', {
        cwd: fullDir,
        ignore: [],
      });
      for (const m of matches) {
        files.add(joinPath(dir, m));
      }
    }
  }

  return [...files].sort();
}
