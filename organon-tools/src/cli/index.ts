#!/usr/bin/env node
/**
 * Organon CLI — Tools for the Organon Methodology.
 *
 * Commands:
 *   validate  — Validate organon frontmatter
 *   generate  — Auto-generate frontmatter from content
 *   query     — Query organons by metadata
 *   health    — Health dashboard
 *   find      — Cross-domain discovery
 *   verify    — Run verification gates
 *   coverage  — Invariant coverage analysis
 *   mcp       — Start MCP server
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';

import { validateCommand } from './commands/validate.js';
import { generateCommand } from './commands/generate.js';
import { queryCommand } from './commands/query.js';
import { healthCommand } from './commands/health.js';
import { findCommand } from './commands/find.js';
import { verifyCommand } from './commands/verify.js';
import { coverageCommand } from './commands/coverage.js';
import { mcpCommand } from './commands/mcp.js';

async function main() {
  await yargs(hideBin(process.argv))
    .scriptName('organon')
    .usage('$0 <command> [options]')
    .command(validateCommand)
    .command(generateCommand)
    .command(queryCommand)
    .command(healthCommand)
    .command(findCommand)
    .command(verifyCommand)
    .command(coverageCommand)
    .command(mcpCommand)
    .demandCommand(1, chalk.red('Please specify a command'))
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version')
    .strict()
    .parse();
}

main().catch((error) => {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
});
