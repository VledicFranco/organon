/**
 * organon export — Export knowledge graph as structured JSON.
 */

import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { resolveConfig, resolveProjectRoot } from '../../core/config.js';
import { exportKnowledgeGraph } from '../../core/export.js';
import { NodeFileSystem } from '../../core/node-fs.js';

interface ExportArgs {
  'project-root': string;
  config?: string;
  pretty: boolean;
}

export const exportCommand: CommandModule<{}, ExportArgs> = {
  command: 'export',
  describe: 'Export organon knowledge graph as structured JSON',

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
      .option('pretty', {
        describe: 'Pretty-print JSON output',
        type: 'boolean',
        default: true,
      })
      .example('$0 export', 'Export knowledge graph as JSON')
      .example('$0 export --no-pretty', 'Export compact JSON (for piping)');
  },

  handler: async (args) => {
    const fs = new NodeFileSystem();
    const projectRoot = await resolveProjectRoot(args['project-root'], fs);
    const config = await resolveConfig(projectRoot, fs, args.config);

    // Read version: try package.json first, then methodology_version from config
    let version = '0.0.0';
    try {
      const pkgContent = await fs.readFile(`${projectRoot}/package.json`);
      const pkg = JSON.parse(pkgContent);
      if (pkg.version) {
        version = pkg.version;
      }
    } catch {
      // Fall through to config-based version
    }
    if (version === '0.0.0') {
      try {
        const cfgContent = await fs.readFile(`${projectRoot}/organon.config.json`);
        const cfg = JSON.parse(cfgContent);
        if (cfg.methodology_version) {
          version = cfg.methodology_version;
        }
      } catch {
        // Use default version
      }
    }

    const result = await exportKnowledgeGraph({
      projectRoot,
      config,
      fs,
      version,
    });

    if (args.pretty) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify(result));
    }

    // Summary to stderr so it doesn't pollute JSON output
    console.error(
      chalk.dim(
        `Exported: ${result.entities.length} entities, ${result.assertions.length} assertions, ${result.relationships.length} relationships, ${result.rules.length} rules`,
      ),
    );
  },
};
