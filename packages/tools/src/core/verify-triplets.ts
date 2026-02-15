/**
 * Protocol ↔ Workflow ↔ Tool binding verification.
 *
 * Checks that the three-layer architecture is properly connected:
 * - Every automated protocol has a workflow binding
 * - Every workflow references back to its protocol
 * - No orphaned workflows (workflow without a protocol)
 * - No phantom automation (protocol claims automated but workflow is missing)
 */

import { parseFrontmatter } from './frontmatter-parser.js';
import { joinPath } from './config.js';
import { discoverOrganonFiles } from './discover.js';
import type {
  AutomationTier,
  DiagnosticMessage,
  FileSystem,
  Frontmatter,
  OrganonConfig,
  ParsedOrganonFile,
  TripletBinding,
  VerifyTripletsResult,
} from './types.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface VerifyTripletsOptions {
  projectRoot: string;
  config: OrganonConfig;
  fs: FileSystem;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function verifyTriplets(
  options: VerifyTripletsOptions,
): Promise<VerifyTripletsResult> {
  const { projectRoot, config, fs } = options;
  const errors: DiagnosticMessage[] = [];
  const warnings: DiagnosticMessage[] = [];

  // Discover protocol files (type: procedures)
  const organonFiles = await discoverOrganonFiles(projectRoot, config, fs);
  const protocolFiles: ParsedOrganonFile[] = [];
  const allFrontmatter = new Map<string, Frontmatter | null>();

  for (const file of organonFiles) {
    const absPath = joinPath(projectRoot, file);
    try {
      const content = await fs.readFile(absPath);
      const { frontmatter, body } = parseFrontmatter(content);
      allFrontmatter.set(file, frontmatter);
      if (frontmatter?.type === 'procedures') {
        protocolFiles.push({ path: file, frontmatter, rawFrontmatter: '', body, content });
      }
    } catch {
      errors.push({
        severity: 'error',
        code: 'FILE_READ_ERROR',
        message: `Cannot read file: ${file}`,
        file,
      });
    }
  }

  // Discover workflow files
  const workflowFiles = await discoverWorkflowFiles(projectRoot, config, fs);
  const workflowFrontmatter = new Map<string, { protocolId?: string; protocolFile?: string }>();

  for (const wf of workflowFiles) {
    const absPath = joinPath(projectRoot, wf);
    try {
      const content = await fs.readFile(absPath);
      const { frontmatter } = parseFrontmatter(content);
      if (frontmatter) {
        workflowFrontmatter.set(wf, {
          protocolId: frontmatter['protocol_id'] as string | undefined,
          protocolFile: frontmatter['protocol_file'] as string | undefined,
        });
      } else {
        // Try to extract protocol_id from body (some workflows use inline metadata)
        const protoMatch = content.match(/protocol[_\s]?id\s*:\s*(\S+)/i);
        const protoFileMatch = content.match(/protocol[_\s]?file\s*:\s*(\S+)/i);
        workflowFrontmatter.set(wf, {
          protocolId: protoMatch ? protoMatch[1] : undefined,
          protocolFile: protoFileMatch ? protoFileMatch[1] : undefined,
        });
      }
    } catch {
      // Workflow file unreadable — will surface as orphan check issue
    }
  }

  // Build bindings from protocol entries
  const bindings: TripletBinding[] = [];
  const referencedWorkflows = new Set<string>();

  for (const pf of protocolFiles) {
    if (!pf.frontmatter?.protocols) continue;

    for (const proto of pf.frontmatter.protocols) {
      const bindingIssues: DiagnosticMessage[] = [];
      let valid = true;

      if (proto.automation_tier === 'automated') {
        if (!proto.workflow) {
          valid = false;
          bindingIssues.push({
            severity: 'error',
            code: 'TRIPLET_MISSING_WORKFLOW_NAME',
            message: `Protocol ${proto.id} is automated but has no workflow field`,
            file: pf.path,
            suggestion: `Add 'workflow: <name>' to protocol ${proto.id}`,
          });
        } else {
          referencedWorkflows.add(proto.workflow);

          // Find the workflow file
          const wfFile = findWorkflowFile(proto.workflow, workflowFiles);
          if (!wfFile) {
            valid = false;
            bindingIssues.push({
              severity: 'error',
              code: 'TRIPLET_WORKFLOW_NOT_FOUND',
              message: `Protocol ${proto.id} references workflow '${proto.workflow}' but no matching file found`,
              file: pf.path,
              suggestion: `Create workflow file for '${proto.workflow}'`,
            });
          } else {
            // Check bidirectional reference
            const wfData = workflowFrontmatter.get(wfFile);
            if (wfData && wfData.protocolId !== proto.id) {
              valid = false;
              bindingIssues.push({
                severity: 'error',
                code: 'TRIPLET_BACK_REFERENCE_MISMATCH',
                message: `Workflow '${wfFile}' has protocol_id '${wfData.protocolId ?? 'none'}' but expected '${proto.id}'`,
                file: wfFile,
                suggestion: `Update protocol_id in '${wfFile}' to '${proto.id}'`,
              });
            }
          }
        }
      }

      bindings.push({
        protocolId: proto.id,
        protocolFile: pf.path,
        automationTier: proto.automation_tier,
        workflowName: proto.workflow,
        workflowFile: proto.workflow ? findWorkflowFile(proto.workflow, workflowFiles) ?? undefined : undefined,
        tools: proto.tools,
        valid,
        issues: bindingIssues,
      });

      errors.push(...bindingIssues.filter((i) => i.severity === 'error'));
      warnings.push(...bindingIssues.filter((i) => i.severity === 'warning'));
    }
  }

  // Find orphaned workflows (workflow files not referenced by any protocol)
  const orphanedWorkflows: string[] = [];
  for (const wf of workflowFiles) {
    const wfData = workflowFrontmatter.get(wf);
    if (wfData?.protocolId) {
      // Check if any protocol actually has this ID
      const referenced = bindings.some((b) => b.protocolId === wfData.protocolId);
      if (!referenced) {
        orphanedWorkflows.push(wf);
        warnings.push({
          severity: 'warning',
          code: 'TRIPLET_ORPHANED_WORKFLOW',
          message: `Workflow '${wf}' references protocol_id '${wfData.protocolId}' but no matching protocol found`,
          file: wf,
        });
      }
    }
  }

  // Find phantom automation (protocol claims automated but no workflow exists anywhere)
  const phantomAutomation = bindings
    .filter((b) => b.automationTier === 'automated' && !b.valid)
    .map((b) => b.protocolId);

  return {
    success: errors.length === 0,
    bindings,
    orphanedWorkflows,
    phantomAutomation,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findWorkflowFile(workflowName: string, workflowFiles: string[]): string | null {
  const normalized = workflowName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  for (const wf of workflowFiles) {
    const wfNormalized = wf.replace(/\\/g, '/').toLowerCase();
    if (
      wfNormalized.includes(normalized) ||
      wfNormalized.includes(workflowName.toLowerCase())
    ) {
      return wf;
    }
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

