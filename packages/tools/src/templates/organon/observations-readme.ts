/**
 * organon/observations/README.md scaffold for organon init.
 */

export const OBSERVATIONS_README_TEMPLATE = [
  '---',
  'type: navigation',
  'scope: product',
  'name: observations',
  'version: "1.0"',
  'summary: Index of empirical observations from work sessions',
  'token_estimate: 110',
  'provides: [observation-index]',
  'audience: [llm, human]',
  '---',
  '',
  '# Observations',
  '',
  '> Empirical observations recorded during work sessions. Use the `/session-compounding` skill to add entries.',
  '',
  '## Files',
  '',
  '(No observations recorded yet)',
  '',
].join('\n');
