import { describe, it, expect } from 'vitest';
import {
  parseFrontmatter,
  parseOrganonFile,
  estimateTokens,
  countSectionEntries,
  extractSection,
  countTableRows,
} from './frontmatter-parser.js';

describe('parseFrontmatter', () => {
  it('parses valid YAML frontmatter', () => {
    const content = `---
type: constraints
scope: domain
name: test
version: "1.0"
summary: A test file
token_estimate: 500
---

# Content here`;

    const result = parseFrontmatter(content);
    expect(result.frontmatter).not.toBeNull();
    expect(result.frontmatter!.type).toBe('constraints');
    expect(result.frontmatter!.scope).toBe('domain');
    expect(result.frontmatter!.name).toBe('test');
    expect(result.frontmatter!.version).toBe('1.0');
    expect(result.body).toContain('# Content here');
    expect(result.rawFrontmatter).toContain('type: constraints');
  });

  it('returns null frontmatter for files without frontmatter', () => {
    const content = '# Just a markdown file\n\nNo frontmatter here.';
    const result = parseFrontmatter(content);
    expect(result.frontmatter).toBeNull();
    expect(result.rawFrontmatter).toBe('');
    expect(result.body).toBe(content);
  });

  it('returns null frontmatter for invalid YAML', () => {
    const content = `---
{{not: valid: yaml: [}}
---

# Content`;
    const result = parseFrontmatter(content);
    expect(result.frontmatter).toBeNull();
  });

  it('handles frontmatter with arrays and nested objects', () => {
    const content = `---
type: procedures
scope: methodology
name: test-proto
version: "1.0"
summary: Test
token_estimate: 300
protocols:
  - id: PROTO-TEST-1
    name: Test Protocol
    steps: 5
    automation_tier: manual
    complexity: medium
---

# Content`;

    const result = parseFrontmatter(content);
    expect(result.frontmatter!.protocols).toHaveLength(1);
    expect(result.frontmatter!.protocols![0].id).toBe('PROTO-TEST-1');
  });

  it('handles Windows-style line endings', () => {
    const content = '---\r\ntype: constraints\r\nname: test\r\n---\r\n\r\n# Content';
    const result = parseFrontmatter(content);
    expect(result.frontmatter).not.toBeNull();
    expect(result.frontmatter!.type).toBe('constraints');
  });
});

describe('parseOrganonFile', () => {
  it('returns a complete ParsedOrganonFile', () => {
    const content = `---
type: constraints
scope: meta
name: test
version: "1.0"
summary: Test
token_estimate: 200
---

# Body`;

    const result = parseOrganonFile('book-llms/ETHOS.md', content);
    expect(result.path).toBe('book-llms/ETHOS.md');
    expect(result.frontmatter).not.toBeNull();
    expect(result.body).toContain('# Body');
    expect(result.content).toBe(content);
  });
});

describe('estimateTokens', () => {
  it('estimates ~1 token per 3.5 characters', () => {
    const content = 'a'.repeat(400);
    expect(estimateTokens(content)).toBe(115); // ceil(400/3.5) = 115
  });

  it('rounds up', () => {
    const content = 'a'.repeat(5);
    expect(estimateTokens(content)).toBe(2); // ceil(5/3.5) = 2
  });
});

describe('countSectionEntries', () => {
  it('counts numbered entries', () => {
    const section = `
1. **Rule one.** Description.
2. **Rule two.** Description.
3. **Rule three.** Description.
`;
    expect(countSectionEntries(section)).toBe(3);
  });

  it('counts heading-style entries', () => {
    const section = `
### 1. First heading
Content.

### 2. Second heading
Content.
`;
    expect(countSectionEntries(section)).toBe(2);
  });

  it('returns 0 for empty section', () => {
    expect(countSectionEntries('')).toBe(0);
  });

  it('ignores non-numbered lines', () => {
    const section = `
Some text before.
- bullet point
* another bullet
1. **Actual entry.** Real one.
More text.
`;
    expect(countSectionEntries(section)).toBe(1);
  });
});

describe('extractSection', () => {
  it('extracts a section by heading', () => {
    const content = `## Identity

Some identity content.

## Invariants

1. **Rule 1.** Description.
2. **Rule 2.** Description.

## Principles

1. **Principle 1.** Description.
`;

    const section = extractSection(content, 'Invariants');
    expect(section).not.toBeNull();
    expect(section).toContain('Rule 1');
    expect(section).toContain('Rule 2');
    expect(section).not.toContain('Principle 1');
    expect(section).not.toContain('Some identity');
  });

  it('returns null for missing section', () => {
    const content = '## Identity\n\nContent.';
    expect(extractSection(content, 'Invariants')).toBeNull();
  });

  it('extracts the last section (no next heading)', () => {
    const content = `## First

First content.

## Last

Last content here.
`;
    const section = extractSection(content, 'Last');
    expect(section).not.toBeNull();
    expect(section).toContain('Last content here.');
  });
});

describe('countTableRows', () => {
  it('counts data rows excluding header and separator', () => {
    const section = `
| Situation | Action |
|-----------|--------|
| When X | Do Y |
| When A | Do B |
| When C | Do D |
`;
    expect(countTableRows(section)).toBe(3);
  });

  it('returns 0 for no table', () => {
    expect(countTableRows('Just plain text')).toBe(0);
  });

  it('handles multiple tables', () => {
    const section = `
| Col1 | Col2 |
|------|------|
| A | B |

Some text between.

| Col1 | Col2 |
|------|------|
| C | D |
| E | F |
`;
    expect(countTableRows(section)).toBe(3);
  });
});
