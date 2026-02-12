/**
 * CLAUDE.md scaffold template for organon init.
 *
 * This is the standard Claude Code project instructions file.
 */

export const CLAUDE_MD_TEMPLATE = [
  '# Project Instructions',
  '',
  '> Agent guidance for this project. Loaded automatically by Claude Code.',
  '',
  '---',
  '',
  '## Quick Reference',
  '',
  '- Read `organon/ETHOS.md` before working in this codebase',
  '- Run `organon verify` before committing changes',
  '- Run `organon health` to check project integrity',
  '',
  '---',
  '',
  '## Decision Heuristics',
  '',
  '| Situation | Action |',
  '|-----------|--------|',
  '| Starting a work session | Run `organon verify` for baseline check |',
  '| Before committing | Run `organon verify` to ensure nothing is broken |',
  '| Adding a new domain | Use `/domain-feature-design` skill |',
  '| Creating organon files | Use `/organon-file-creation` skill |',
  '| End of work session | Use `/session-compounding` skill |',
  '',
].join('\n');
