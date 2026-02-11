/**
 * organon mcp — Start the MCP server (stdio transport).
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';

interface McpArgs {
  'project-root': string;
  config?: string;
}

export const mcpCommand: CommandModule<{}, McpArgs> = {
  command: 'mcp',
  describe: 'Start the Organon MCP server (stdio transport)',

  builder: (yargs) => {
    return yargs
      .option('project-root', {
        describe: 'Project root directory',
        type: 'string',
        default: process.cwd(),
      })
      .option('config', {
        describe: 'Path to organon.config.json',
        type: 'string',
      })
      .example('$0 mcp', 'Start MCP server on stdio');
  },

  handler: async (args) => {
    // Dynamic import to avoid loading MCP SDK unless this command is used
    const { startServer } = await import('../../mcp/server.js');
    await startServer(args['project-root'], args.config);
  },
};
