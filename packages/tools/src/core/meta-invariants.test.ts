/**
 * Structural invariant tests for META-organon and project-level (ORG) invariants.
 *
 * These scan the actual repository to verify structural constraints hold.
 *
 * @organon-invariant INV-META-3 principles-prioritized
 * @organon-invariant INV-META-6 every-file-has-frontmatter
 * @organon-invariant INV-META-7 standardized-section-headings
 * @organon-invariant INV-META-9 enforcement-loop-closable
 * @organon-invariant INV-ORG-1 dogfood-methodology
 * @organon-invariant INV-ORG-2 code-is-source-of-truth
 * @organon-invariant INV-ORG-3 every-file-has-frontmatter
 * @organon-invariant INV-ORG-4 three-artifact-separation
 * @organon-invariant INV-ORG-6 bidirectional-references
 */

import { describe, expect } from 'vitest';
import { testInvariant } from '@organon-methodology/testing/vitest';
import { resolve } from 'node:path';
import { readFile, readdir, access } from 'node:fs/promises';
import { parseFrontmatter, extractSection } from './frontmatter-parser.js';

const repoRoot = resolve(import.meta.dirname, '../../../..');

async function readOrganonFile(relPath: string): Promise<string> {
  return readFile(resolve(repoRoot, relPath), 'utf-8');
}

async function exists(relPath: string): Promise<boolean> {
  try {
    await access(resolve(repoRoot, relPath));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// INV-META-3: principles-prioritized
// ---------------------------------------------------------------------------

describe('INV-META-3: principles-prioritized', () => {
  testInvariant('INV-META-3', 'ETHOS.md files have numbered principles', async () => {
    const ethosFiles = [
      'book-llms/ETHOS.md',
      'organon/ETHOS.md',
      'organon/domains/tools/ETHOS.md',
      'organon/domains/testing/ETHOS.md',
    ];

    for (const file of ethosFiles) {
      const content = await readOrganonFile(file);
      const { body } = parseFrontmatter(content);
      const principles = extractSection(body, 'Principles (Prioritized)')
        ?? extractSection(body, 'Principles');
      expect(principles, `${file} must have a ## Principles section`).toBeTruthy();
      // Principles must have numbered entries (1., 2., etc.)
      const numbered = principles!.match(/^\d+\.\s/gm);
      expect(numbered, `${file} principles must be numbered`).toBeTruthy();
      expect(numbered!.length).toBeGreaterThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// INV-META-6 / INV-ORG-3: every-file-has-frontmatter
// ---------------------------------------------------------------------------

describe('INV-META-6 / INV-ORG-3: every-file-has-frontmatter', () => {
  testInvariant('INV-META-6', 'all organon files have YAML frontmatter', async () => {
    const organonFiles = [
      'book-llms/ETHOS.md',
      'book-llms/PHILOSOPHY.md',
      'organon/ETHOS.md',
      'organon/README.md',
      'organon/domains/tools/ETHOS.md',
      'organon/domains/tools/PHILOSOPHY.md',
      'organon/domains/testing/ETHOS.md',
      'organon/domains/testing/PHILOSOPHY.md',
      'organon/protocols/PROTOCOLS.md',
    ];

    for (const file of organonFiles) {
      const content = await readOrganonFile(file);
      const { frontmatter } = parseFrontmatter(content);
      expect(frontmatter, `${file} must have YAML frontmatter`).toBeTruthy();
      expect(frontmatter!.type, `${file} frontmatter must have type`).toBeTruthy();
      expect(frontmatter!.scope, `${file} frontmatter must have scope`).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// INV-META-7: standardized-section-headings
// ---------------------------------------------------------------------------

describe('INV-META-7: standardized-section-headings', () => {
  testInvariant('INV-META-7', 'ETHOS.md files have required sections', async () => {
    const ethosFiles = [
      'organon/ETHOS.md',
      'organon/domains/tools/ETHOS.md',
      'organon/domains/testing/ETHOS.md',
    ];

    const requiredSections = ['Identity', 'Invariants'];

    for (const file of ethosFiles) {
      const content = await readOrganonFile(file);
      const { body } = parseFrontmatter(content);

      for (const section of requiredSections) {
        const found = extractSection(body, section);
        expect(found, `${file} must have ## ${section} section`).toBeTruthy();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// INV-META-9: enforcement-loop-closable
// ---------------------------------------------------------------------------

describe('INV-META-9: enforcement-loop-closable', () => {
  testInvariant('INV-META-9', 'automated protocols have workflow bindings', async () => {
    const content = await readOrganonFile('organon/protocols/PROTOCOLS.md');
    const { frontmatter } = parseFrontmatter(content);
    const protocols = frontmatter?.protocols as Array<{
      id: string;
      automation_tier: string;
      workflow?: string;
    }> | undefined;

    expect(protocols, 'PROTOCOLS.md must have protocols array').toBeTruthy();

    for (const proto of protocols!) {
      if (proto.automation_tier === 'automated') {
        expect(
          proto.workflow,
          `Protocol ${proto.id} is automated but has no workflow binding`,
        ).toBeTruthy();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// INV-ORG-1: dogfood-methodology
// ---------------------------------------------------------------------------

describe('INV-ORG-1: dogfood-methodology', () => {
  testInvariant('INV-ORG-1', 'organon/ directory exists with ETHOS.md', async () => {
    expect(await exists('organon/ETHOS.md')).toBe(true);
  });

  testInvariant('INV-ORG-1', 'organon/protocols/PROTOCOLS.md exists', async () => {
    expect(await exists('organon/protocols/PROTOCOLS.md')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// INV-ORG-2: code-is-source-of-truth
// ---------------------------------------------------------------------------

describe('INV-ORG-2: code-is-source-of-truth', () => {
  testInvariant('INV-ORG-2', 'packages/tools/src/ exists with implementation code', async () => {
    expect(await exists('packages/tools/src/core')).toBe(true);
    const entries = await readdir(resolve(repoRoot, 'packages/tools/src/core'));
    const tsFiles = entries.filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
    expect(tsFiles.length).toBeGreaterThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// INV-ORG-4: three-artifact-separation
// ---------------------------------------------------------------------------

describe('INV-ORG-4: three-artifact-separation', () => {
  testInvariant('INV-ORG-4', 'ETHOS.md files have type: constraints', async () => {
    const ethosFiles = [
      'organon/ETHOS.md',
      'organon/domains/tools/ETHOS.md',
      'organon/domains/testing/ETHOS.md',
    ];

    for (const file of ethosFiles) {
      const content = await readOrganonFile(file);
      const { frontmatter } = parseFrontmatter(content);
      expect(frontmatter?.type, `${file} must be type: constraints`).toBe('constraints');
    }
  });

  testInvariant('INV-ORG-4', 'PHILOSOPHY.md files have type: rationale', async () => {
    const philosophyFiles = [
      'organon/domains/tools/PHILOSOPHY.md',
      'organon/domains/testing/PHILOSOPHY.md',
    ];

    for (const file of philosophyFiles) {
      const content = await readOrganonFile(file);
      const { frontmatter } = parseFrontmatter(content);
      expect(frontmatter?.type, `${file} must be type: rationale`).toBe('rationale');
    }
  });

  testInvariant('INV-ORG-4', 'PROTOCOLS.md files have type: procedures', async () => {
    const content = await readOrganonFile('organon/protocols/PROTOCOLS.md');
    const { frontmatter } = parseFrontmatter(content);
    expect(frontmatter?.type).toBe('procedures');
  });
});

// ---------------------------------------------------------------------------
// INV-ORG-6: bidirectional-references
// ---------------------------------------------------------------------------

describe('INV-ORG-6: bidirectional-references', () => {
  testInvariant('INV-ORG-6', 'automated protocols reference workflows that exist as skills', async () => {
    const content = await readOrganonFile('organon/protocols/PROTOCOLS.md');
    const { frontmatter } = parseFrontmatter(content);
    const protocols = frontmatter?.protocols as Array<{
      id: string;
      automation_tier: string;
      workflow?: string;
    }> | undefined;

    for (const proto of protocols ?? []) {
      if (proto.automation_tier === 'automated' && proto.workflow) {
        const skillPath = `.claude/skills/${proto.workflow}/SKILL.md`;
        expect(
          await exists(skillPath),
          `Workflow "${proto.workflow}" for protocol ${proto.id} must exist at ${skillPath}`,
        ).toBe(true);
      }
    }
  });
});
