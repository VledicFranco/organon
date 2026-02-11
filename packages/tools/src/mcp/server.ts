/**
 * MCP Server — Organon methodology tools exposed via Model Context Protocol.
 *
 * Runs on stdio transport. Started via `organon mcp` command.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { resolveConfig } from '../core/config.js';
import { NodeFileSystem } from '../core/node-fs.js';
import { registerTools } from './tools.js';
import { registerResources } from './resources.js';
import { registerPrompts } from './prompts.js';

export async function startServer(
  projectRoot: string,
  configPath?: string,
): Promise<void> {
  const fs = new NodeFileSystem();
  const config = await resolveConfig(projectRoot, fs, configPath);

  const server = new McpServer({
    name: 'organon',
    version: '0.1.0',
  });

  // Register all MCP capabilities
  registerTools(server, projectRoot, config, fs);
  registerResources(server, projectRoot, config, fs);
  registerPrompts(server);

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
