/**
 * MCP Resource registrations — 4 resources exposing the organon hierarchy.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FileSystem, OrganonConfig } from '../core/types.js';
import { query } from '../core/query.js';
import { health } from '../core/health.js';
import { joinPath } from '../core/config.js';
import { parseFrontmatter } from '../core/frontmatter-parser.js';

export function registerResources(
  server: McpServer,
  projectRoot: string,
  config: OrganonConfig,
  fs: FileSystem,
): void {
  // 1. Index — all organon files with frontmatter summaries
  server.resource(
    'organon-index',
    'organon://index',
    async (uri) => {
      const result = await query({
        projectRoot,
        config,
        fs,
        verbose: false,
      });

      const index = result.files.map((f) => ({
        path: f.path,
        type: f.frontmatter?.type,
        scope: f.frontmatter?.scope,
        name: f.frontmatter?.name,
        summary: f.frontmatter?.summary,
        token_estimate: f.frontmatter?.token_estimate,
        load_priority: f.frontmatter?.load_priority,
      }));

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(index, null, 2),
        }],
      };
    },
  );

  // 2. File — read individual organon file by path
  server.resource(
    'organon-file',
    'organon://file/{path}',
    async (uri) => {
      const filePath = uri.pathname.replace(/^\//, '');
      const absPath = joinPath(projectRoot, filePath);

      try {
        const content = await fs.readFile(absPath);
        return {
          contents: [{
            uri: uri.href,
            mimeType: 'text/markdown',
            text: content,
          }],
        };
      } catch {
        return {
          contents: [{
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Error: File not found: ${filePath}`,
          }],
        };
      }
    },
  );

  // 3. Scope — all organons at a scope level
  server.resource(
    'organon-scope',
    'organon://scope/{scope}',
    async (uri) => {
      const scope = uri.pathname.replace(/^\//, '') as any;
      const result = await query({
        projectRoot,
        config,
        fs,
        scope,
        verbose: false,
      });

      const scopeData = result.files.map((f) => ({
        path: f.path,
        type: f.frontmatter?.type,
        name: f.frontmatter?.name,
        summary: f.frontmatter?.summary,
        token_estimate: f.frontmatter?.token_estimate,
      }));

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(scopeData, null, 2),
        }],
      };
    },
  );

  // 4. Health — quick health summary
  server.resource(
    'organon-health',
    'organon://health',
    async (uri) => {
      const result = await health({
        projectRoot,
        config,
        fs,
        fixSuggestions: true,
      });

      const summary = {
        score: result.score,
        coverage: result.coverage,
        validation: result.validation,
        tokens: result.tokens,
        freshness: {
          fresh: result.freshness.fresh,
          stale: result.freshness.stale,
          unknown: result.freshness.unknown,
        },
        topIssues: result.issues.slice(0, 10),
      };

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(summary, null, 2),
        }],
      };
    },
  );
}
