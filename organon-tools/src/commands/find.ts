/**
 * Find Command - Cross-domain discovery
 *
 * Search modes:
 * - By file: Find which domain owns a file
 * - By feature: Find which domains implement a feature
 * - By domain: Show domain overview (layer + feature breakdown)
 *
 * Usage:
 *   organon find --file=GenesisStore.ts
 *   organon find --feature=tool-registry
 *   organon find --domain=genesis
 *
 * To be migrated from:
 *   agent-tavern/scripts/organon/find.ts
 */

import type { CommandModule } from 'yargs'
import chalk from 'chalk'

interface FindArgs {
  file?: string
  feature?: string
  domain?: string
}

export const findCommand: CommandModule<{}, FindArgs> = {
  command: 'find',
  describe: 'Cross-domain discovery (find files, features, domains)',

  builder: (yargs) => {
    return yargs
      .option('file', {
        describe: 'Find which domain owns a file',
        type: 'string'
      })
      .option('feature', {
        describe: 'Find which domains implement a feature',
        type: 'string'
      })
      .option('domain', {
        describe: 'Show domain overview (layer + feature breakdown)',
        type: 'string'
      })
      .conflicts('file', ['feature', 'domain'])
      .conflicts('feature', ['file', 'domain'])
      .conflicts('domain', ['file', 'feature'])
      .check((argv) => {
        if (!argv.file && !argv.feature && !argv.domain) {
          throw new Error('Please specify --file, --feature, or --domain')
        }
        return true
      })
      .example('$0 find --file=GenesisStore.ts', 'Find which domain owns GenesisStore.ts')
      .example('$0 find --feature=tool-registry', 'Find domains implementing tool-registry')
      .example('$0 find --domain=genesis', 'Show genesis domain overview')
  },

  handler: async (args) => {
    console.log(chalk.blue('🔍 Organon Find'))
    console.log()

    if (args.file) {
      console.log(chalk.yellow(`Searching for file: ${args.file}`))
      console.log()
      console.log(chalk.dim('  📁 genesis (domain layer)'))
      console.log(chalk.dim('     packages/server/src/domain/genesis/GenesisStore.ts'))
    } else if (args.feature) {
      console.log(chalk.yellow(`Searching for feature: ${args.feature}`))
      console.log()
      console.log(chalk.dim('  ✅ Implemented by 1 domain(s):'))
      console.log(chalk.dim('     📁 genesis'))
      console.log(chalk.dim('        3 file(s)'))
    } else if (args.domain) {
      console.log(chalk.yellow(`Domain: ${args.domain}`))
      console.log()
      console.log(chalk.dim('  📊 By Layer:'))
      console.log(chalk.dim('     Domain:      8 file(s)'))
      console.log(chalk.dim('     Application: 2 file(s)'))
      console.log(chalk.dim('     Transport:   3 file(s)'))
    }

    console.log()
    console.log(chalk.dim('Note: Full implementation to be migrated from agent-tavern'))
  }
}
