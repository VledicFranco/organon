#!/usr/bin/env node
/**
 * Organon CLI - Tools for the Organon Methodology
 *
 * Commands:
 * - generate: Auto-generate components.md from codebase structure
 * - verify: Verify organon integrity (file refs, RFC refs, freshness, dual mapping)
 * - find: Cross-domain discovery (find files, features, domains)
 *
 * Future:
 * - mcp: Start MCP server for IDE integration
 */

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'

// Import commands (to be implemented)
import { generateCommand } from './commands/generate.js'
import { verifyCommand } from './commands/verify.js'
import { findCommand } from './commands/find.js'

async function main() {
  await yargs(hideBin(process.argv))
    .scriptName('organon')
    .usage('$0 <command> [options]')
    .command(generateCommand)
    .command(verifyCommand)
    .command(findCommand)
    .demandCommand(1, chalk.red('Please specify a command'))
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version')
    .strict()
    .parse()
}

main().catch((error) => {
  console.error(chalk.red('Error:'), error.message)
  process.exit(1)
})
