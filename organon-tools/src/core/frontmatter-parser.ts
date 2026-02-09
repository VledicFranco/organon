/**
 * YAML frontmatter extraction utility.
 *
 * Parses the --- delimited YAML block at the top of organon files.
 * Returns typed Frontmatter or null if missing/invalid.
 */

import { parse as parseYaml } from 'yaml';
import type { Frontmatter, ParsedOrganonFile } from './types.js';

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---/;

export interface ParseResult {
  frontmatter: Frontmatter | null;
  rawFrontmatter: string;
  body: string;
}

/**
 * Extract and parse YAML frontmatter from file content.
 */
export function parseFrontmatter(content: string): ParseResult {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) {
    return { frontmatter: null, rawFrontmatter: '', body: content };
  }

  const rawFrontmatter = match[1];
  const body = content.slice(match[0].length).replace(/^\r?\n/, '');

  try {
    const parsed = parseYaml(rawFrontmatter);
    if (parsed === null || typeof parsed !== 'object') {
      return { frontmatter: null, rawFrontmatter, body };
    }
    return { frontmatter: parsed as Frontmatter, rawFrontmatter, body };
  } catch {
    return { frontmatter: null, rawFrontmatter, body };
  }
}

/**
 * Build a ParsedOrganonFile from raw file content and path.
 */
export function parseOrganonFile(path: string, content: string): ParsedOrganonFile {
  const { frontmatter, rawFrontmatter, body } = parseFrontmatter(content);
  return { path, frontmatter, rawFrontmatter, body, content };
}

/**
 * Estimate token count from content.
 * Heuristic: ~4 characters per token (aligns with frontmatter-system.md spec).
 */
export function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

/**
 * Count entries in a numbered/bulleted section.
 * Matches patterns like:
 *   1. **Name.**
 *   ### 1. Name
 *   - **Name.**
 *   ### Invariant 1:
 */
export function countSectionEntries(sectionContent: string): number {
  const lines = sectionContent.split('\n');
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    // Match numbered entries: "1. **", "1. ", "### 1."
    if (/^\d+\.\s/.test(trimmed)) {
      count++;
    }
    // Match heading-style entries: "### Invariant 1:", "### Name"
    else if (/^#{2,4}\s+(?:Invariant\s+)?\d+/i.test(trimmed)) {
      count++;
    }
  }
  return count;
}

/**
 * Extract a specific ## section from markdown content.
 * Returns the content between the matched heading and the next ## heading (or EOF).
 */
export function extractSection(content: string, heading: string): string | null {
  // Escape special regex characters in heading but allow flexible whitespace
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^##\\s+${escapedHeading}.*$`,
    'm'
  );
  const match = content.match(pattern);
  if (!match || match.index === undefined) return null;

  const start = match.index + match[0].length;
  const rest = content.slice(start);

  // Find next ## heading
  const nextHeading = rest.match(/^##\s+/m);
  const sectionContent = nextHeading && nextHeading.index !== undefined
    ? rest.slice(0, nextHeading.index)
    : rest;

  return sectionContent.trim();
}

/**
 * Count rows in a markdown table (excluding header and separator rows).
 */
export function countTableRows(sectionContent: string): number {
  const lines = sectionContent.split('\n');
  let inTable = false;
  let headerSeen = false;
  let count = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        continue; // header row
      }
      if (!headerSeen) {
        // separator row (|---|---|)
        if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
          headerSeen = true;
          continue;
        }
      }
      if (headerSeen) {
        count++;
      }
    } else {
      inTable = false;
      headerSeen = false;
    }
  }
  return count;
}
