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

export function registerTools(
  server: McpServer,
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): void {
  // 1. Validate frontmatter
  server.tool(
    'organon_validate_frontmatter',
    'Validate organon YAML frontmatter (4-stage: schema, references, truthfulness, consistency)',
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
    'Auto-generate YAML frontmatter for an organon file by analyzing its content',
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
    'Query organon files by metadata (scope, type, priority, task, budget, name)',
    {
      scope: z.enum(['product', 'domain', 'feature', 'component', 'meta', 'methodology']).optional(),
      type: z.enum(['navigation', 'constraints', 'rationale', 'procedures', 'mapping']).optional(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
      task: z.string().optional().describe('Filter by required_for task'),
      budget: z.number().optional().describe('Maximum total token budget'),
      name: z.string().optional().describe('Filter by name (substring)'),
      related: z.string().optional().describe('Filter by related domain or feature'),
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
        verbose: args.verbose,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 4. Health
  server.tool(
    'organon_health',
    'Show organon health dashboard (coverage, validation, tokens, freshness, score)',
    {
      fixSuggestions: z.boolean().optional().describe('Include fix suggestions'),
    },
    async (args) => {
      const result = await health({
        projectRoot,
        config,
        fs,
        fixSuggestions: args.fixSuggestions,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 5. Find
  server.tool(
    'organon_find',
    'Cross-domain discovery — find organons by file path, scope, type, or name',
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
    'Verify protocol-workflow-tool binding integrity (3-layer architecture)',
    {},
    async () => {
      const result = await verifyTriplets({ projectRoot, config, fs });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 7. Suggest tools
  server.tool(
    'organon_suggest_tools',
    'Analyze protocols and suggest automation tier upgrades',
    {},
    async () => {
      const result = await suggestTools({ projectRoot, config, fs });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // 8. Verify (orchestrator)
  server.tool(
    'organon_verify',
    'Run verification gates (frontmatter, triplets, freshness — or custom subset)',
    {
      gates: z.array(z.string()).optional().describe('Specific gates to run (all if omitted)'),
    },
    async (args) => {
      const result = await verify({
        projectRoot,
        config,
        fs,
        gates: args.gates,
      });
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );
}
