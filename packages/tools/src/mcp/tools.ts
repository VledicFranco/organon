/**
 * MCP Tool registrations — 8 tools wrapping core functions.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FileSystem, OrganonConfig } from '../core/types.js';
import { validateFrontmatter } from '../core/validate-frontmatter.js';
import { generateFrontmatter, serializeFrontmatter } from '../core/generate-frontmatter.js';
import { query } from '../core/query.js';
import { health } from '../core/health.js';
import { find } from '../core/find.js';
import { verifyTriplets } from '../core/verify-triplets.js';
import { suggestTools } from '../core/suggest-tools.js';
import { verify } from '../core/verify.js';
import { exportKnowledgeGraph } from '../core/export.js';
import { analyzeVerificationIssues, analyzeProjectHealth } from './sampling.js';

export function registerTools(
  server: McpServer,
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): void {
  // 1. Validate frontmatter
  server.tool(
    'organon_validate_frontmatter',
    'Validate YAML frontmatter in organon files across 4 stages: schema, references, truthfulness, consistency. Use after editing organon files, when frontmatter looks wrong, or to check metadata accuracy before committing.',
    {
      files: z.array(z.string()).optional().describe('Specific files to validate (all if omitted)'),
      stages: z.array(z.number().int().min(1).max(4)).optional().describe('Stages: 1=schema, 2=refs, 3=truth, 4=consistency'),
    },
    async (args) => {
      const result = await validateFrontmatter({
        projectRoot,
        config,
        fs,
        files: args.files,
        stages: args.stages as Array<1 | 2 | 3 | 4> | undefined,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 2. Generate frontmatter
  server.tool(
    'organon_generate_frontmatter',
    'Generate YAML frontmatter for an organon file by analyzing its content. Use when creating new organon files, when a file is missing frontmatter, or to scaffold metadata for a new ETHOS.md, PHILOSOPHY.md, or PROTOCOL.md.',
    {
      file: z.string().describe('File path (project-relative)'),
      type: z.enum(['navigation', 'constraints', 'rationale', 'procedures', 'mapping']).optional(),
      scope: z.enum(['product', 'domain', 'feature', 'component', 'meta', 'methodology']).optional(),
    },
    async (args) => {
      const result = await generateFrontmatter({
        projectRoot,
        config,
        fs,
        file: args.file,
        type: args.type,
        scope: args.scope,
      });
      const yaml = serializeFrontmatter(result.generated);
      return {
        content: [
          { type: 'text' as const, text: `Generated frontmatter for ${args.file}:\n\n${yaml}` },
          { type: 'text' as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );

  // 3. Query
  server.tool(
    'organon_query',
    'Search and filter organon files by metadata. Use to find relevant files for a task, discover what constraints apply to a scope, check token budgets, or list files by epistemic category (constraint, assertion, rule). Supports filtering by scope, type, priority, name, and token budget.',
    {
      scope: z.enum(['product', 'domain', 'feature', 'component', 'meta', 'methodology']).optional(),
      type: z.enum(['navigation', 'constraints', 'rationale', 'procedures', 'mapping']).optional(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
      task: z.string().optional().describe('Filter by required_for task'),
      budget: z.number().optional().describe('Maximum total token budget'),
      name: z.string().optional().describe('Filter by name (substring)'),
      related: z.string().optional().describe('Filter by related domain or feature'),
      category: z.enum(['constraint', 'assertion', 'rule']).optional().describe('Filter by epistemic category'),
      verbose: z.boolean().optional().describe('Include full file content'),
    },
    async (args) => {
      const result = await query({
        projectRoot,
        config,
        fs,
        scope: args.scope,
        type: args.type,
        priority: args.priority,
        task: args.task,
        budget: args.budget,
        namePattern: args.name,
        relatedDomain: args.related,
        relatedFeature: args.related,
        category: args.category,
        verbose: args.verbose,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 4. Health
  server.tool(
    'organon_health',
    'Show project health score and diagnostics. Reports coverage gaps, validation issues, token budgets, file freshness, and an overall score out of 100. Use to check project status, diagnose organon problems, or verify nothing is degraded after changes.',
    {
      fixSuggestions: z.boolean().optional().describe('Include fix suggestions'),
      analyze: z.boolean().optional().describe('Use LLM sampling to get strategic improvement recommendations (requires client sampling capability)'),
    },
    async (args) => {
      const result = await health({
        projectRoot,
        config,
        fs,
        fixSuggestions: args.fixSuggestions,
      });

      // If analysis requested and health is below 100, sample the LLM for recommendations
      let analysis: string | undefined;
      if (args.analyze && result.score < 100) {
        analysis = await analyzeProjectHealth(server, {
          score: result.score,
          coverage: result.coverage,
          validation: result.validation,
          topIssues: result.issues,
        });
      }

      return {
        content: [
          { type: 'text' as const, text: JSON.stringify(result, null, 2) },
          ...(analysis ? [{ type: 'text' as const, text: `## Strategic Recommendations\n\n${analysis}` }] : []),
        ],
      };
    },
  );

  // 5. Find
  server.tool(
    'organon_find',
    'Find which organon files govern a specific file, directory, or domain. Use when you need to know what constraints apply to code you are editing, or to discover organon files by scope, type, or name.',
    {
      file: z.string().optional().describe('Find organons governing this file'),
      scope: z.enum(['product', 'domain', 'feature', 'component', 'meta', 'methodology']).optional(),
      type: z.enum(['navigation', 'constraints', 'rationale', 'procedures', 'mapping']).optional(),
      name: z.string().optional().describe('Search by name (substring)'),
    },
    async (args) => {
      const result = await find({
        projectRoot,
        config,
        fs,
        file: args.file,
        scope: args.scope,
        type: args.type,
        name: args.name,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 6. Verify triplets
  server.tool(
    'organon_verify_triplets',
    'Check that protocol-workflow-tool bindings are consistent and bidirectional. Use to detect orphaned workflows, missing tool references, or broken links between the three architecture layers.',
    {},
    async () => {
      const result = await verifyTriplets({ projectRoot, config, fs });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 7. Suggest tools
  server.tool(
    'organon_suggest_tools',
    'Suggest which manual protocols could be automated. Analyzes protocol complexity and frequency to recommend automation tier upgrades. Use during planning or session compounding to find automation opportunities.',
    {},
    async () => {
      const result = await suggestTools({ projectRoot, config, fs });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 8. Export knowledge graph
  server.tool(
    'organon_export',
    'Export the full organon knowledge graph as structured JSON with entities, assertions, relationships, and rules. Use for knowledge interoperability, external tool consumption, or analysis of the project organon structure.',
    {
      version: z.string().optional().describe('Version to include in export metadata'),
    },
    async (args) => {
      const result = await exportKnowledgeGraph({
        projectRoot,
        config,
        fs,
        version: args.version,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 9. Verify (orchestrator)
  server.tool(
    'organon_verify',
    'Run all 9 verification gates or a specific subset. Checks frontmatter, triplets, references, placeholder detection, freshness, invariant coverage, workflow quality, tier-4 tests, and version alignment. Use before committing, at session start, or to diagnose what is broken.',
    {
      gates: z.array(z.string()).optional().describe('Specific gates to run (all if omitted)'),
      analyze: z.boolean().optional().describe('Use LLM sampling to analyze issues (requires client sampling capability)'),
    },
    async (args) => {
      const result = await verify({
        projectRoot,
        config,
        fs,
        gates: args.gates,
      });

      // If analysis requested and there are errors, sample the LLM for diagnostics
      let analysis: string | undefined;
      if (args.analyze && result.errors.length > 0) {
        const failedGates = result.gates
          .filter((g) => !g.passed)
          .map((g) => g.gate);

        analysis = await analyzeVerificationIssues(server, {
          errors: result.errors,
          warnings: result.warnings,
          failedGates,
        });
      }

      return {
        content: [
          { type: 'text' as const, text: JSON.stringify(result, null, 2) },
          ...(analysis ? [{ type: 'text' as const, text: `## LLM Analysis\n\n${analysis}` }] : []),
        ],
      };
    },
  );
}
