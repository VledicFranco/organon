/**
 * MCP Prompt registrations — 4 methodology workflow prompts.
 *
 * These encode the Organon methodology workflows so fresh agents
 * can follow correct procedures without prior context.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerPrompts(server: McpServer): void {
  // 1. implement-feature — Ethos-first feature development
  server.prompt(
    'implement-feature',
    'Guide through ethos-first feature development: load context, create ETHOS.md, implement, verify',
    {
      featureName: z.string().describe('Name of the feature to implement'),
      domain: z.string().optional().describe('Target domain (if known)'),
    },
    (args) => {
      const domain = args.domain ? `in the **${args.domain}** domain` : '';
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `# Implement Feature: ${args.featureName}

Follow the Organon ethos-first development workflow ${domain}:

## Step 1: Load Context
1. Use \`organon_query\` with \`scope: "product"\` to load product-level constraints
${args.domain ? `2. Use \`organon_query\` with \`scope: "domain"\` and \`name: "${args.domain}"\` to load domain constraints` : '2. Use `organon_find` to identify which domain this feature belongs to'}
3. Use \`organon_query\` with \`task: "${args.featureName.toLowerCase().replace(/\s+/g, '_')}"\` to find relevant organons
4. Check token budget — keep organon context under 15K tokens

## Step 2: Create Feature ETHOS.md (if new)
If this is a new feature, create its ETHOS.md first:
1. Create \`organon/features/${args.featureName.toLowerCase().replace(/\s+/g, '-')}/ETHOS.md\`
2. Include: Identity (IS/IS NOT), Invariants, Principles (prioritized), Decision Heuristics
3. Use \`organon_generate_frontmatter\` to add proper frontmatter
4. Use \`organon_validate_frontmatter\` to verify

## Step 3: Implement
1. Write code that satisfies the constraints from loaded organons
2. Follow the priority order: invariants > principles (lower number wins)
3. When uncertain, consult Decision Heuristics tables

## Step 4: Verify
1. Use \`organon_verify\` to run all verification gates
2. Use \`organon_health\` to check overall system health
3. Ensure no new violations were introduced

## Step 5: Update Organons
1. If implementation changes any constraints, update the affected ETHOS.md
2. Use \`organon_validate_frontmatter\` to verify counts are still accurate
3. Organon updates happen in the SAME PR as implementation (never deferred)`,
          },
        }],
      };
    },
  );

  // 2. review-changes — Review against invariants
  server.prompt(
    'review-changes',
    'Review code changes against organon constraints: load relevant organons, check invariant violations, run verification',
    {
      scope: z.string().optional().describe('Limit review to this scope'),
    },
    (args) => {
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `# Review Changes Against Organon Constraints

## Step 1: Identify Affected Organons
1. Look at the files changed in this PR/commit
2. Use \`organon_find\` with \`--file\` for each changed file to identify governing organons
3. Load all identified organons${args.scope ? ` (filtered to scope: ${args.scope})` : ''}

## Step 2: Check Invariant Compliance
For each governing organon:
1. Read the \`## Invariants\` section
2. Verify that NONE of the changes violate any invariant
3. If an invariant is violated, this is a blocking issue — changes must be revised

## Step 3: Check Principle Alignment
1. Read the \`## Principles\` section
2. Verify changes align with principles (lower number = higher priority)
3. If principles conflict, the lower-numbered principle wins

## Step 4: Run Automated Verification
1. Use \`organon_verify\` to run all verification gates
2. Report any failures — these must be fixed before merge

## Step 5: Check Organon Freshness
1. Use \`organon_health\` to check if any affected organons are stale
2. If organon and code have diverged, flag for review
3. Ensure frontmatter counts are still accurate

## Review Output Format
Provide:
- List of governing organons consulted
- Invariant compliance: PASS / FAIL (with details)
- Principle alignment: notes on any tensions
- Verification gates: all PASS / specific failures
- Recommendations: any organon updates needed`,
          },
        }],
      };
    },
  );

  // 3. create-organon — Create new organon artifact
  server.prompt(
    'create-organon',
    'Guide creation of a new organon artifact with correct structure and frontmatter',
    {
      artifactType: z.enum(['ethos', 'philosophy', 'protocol']).describe('Type of artifact to create'),
      scope: z.enum(['product', 'domain', 'feature', 'component', 'methodology']).describe('Scope level'),
      name: z.string().describe('Name for the organon (kebab-case)'),
    },
    (args) => {
      const structures: Record<string, string> = {
        ethos: `## Identity

### What ${args.name} IS
- [Core identity statement]

### What ${args.name} IS NOT
- [Boundary statement]

## Invariants

1. **[Rule name].** [Rule description.]

## Principles (Prioritized)

1. **[Highest priority].** [Description.]

## Decision Heuristics

| Situation | Action |
|-----------|--------|
| When [X] | Do [Y] |`,
        philosophy: `## The Problem

[Describe the challenge this solves.]

## The Bet

[Core approach chosen.]

## Design Decisions

### 1. [Decision Name]
[What and why.]
**Rationale:** [Reasoning.]

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| [Choice] | [Gain] | [Sacrifice] |`,
        protocol: `## Goal

[What successful completion achieves.]

## Preconditions

Before starting, verify:
- [ ] [Required condition]

## Steps

1. **[Step name].** [Action.]
2. **[Step name].** [Action.]

## Verification

After completion, confirm:
- [ ] [Observable outcome]`,
      };

      const typeMap: Record<string, string> = {
        ethos: 'constraints',
        philosophy: 'rationale',
        protocol: 'procedures',
      };

      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `# Create ${args.artifactType.toUpperCase()}.md for "${args.name}"

## Step 1: Check Parent Scope
1. Use \`organon_find\` with \`scope: "product"\` to load product-level constraints
2. This new organon must inherit from and never contradict parent constraints
3. Add \`inherits_from\` in frontmatter referencing the parent

## Step 2: Create File
Create \`organon/${args.scope === 'domain' ? 'domains' : args.scope === 'feature' ? 'features' : args.scope + 's'}/${args.name}/${args.artifactType.toUpperCase()}.md\`

## Step 3: Add Frontmatter
\`\`\`yaml
---
type: ${typeMap[args.artifactType]}
scope: ${args.scope}
name: ${args.name}
version: "1.0"
summary: [One sentence, max 200 chars]
token_estimate: [Will be calculated]
inherits_from: [product]
---
\`\`\`

## Step 4: Add Structure
Use this template:

${structures[args.artifactType]}

## Step 5: Generate & Validate
1. Use \`organon_generate_frontmatter\` to calculate counts and token_estimate
2. Use \`organon_validate_frontmatter\` to verify the file passes all 4 stages
3. Fix any issues before committing`,
          },
        }],
      };
    },
  );

  // 4. evolve-organon — Modify existing constraints
  server.prompt(
    'evolve-organon',
    'Guide organon evolution with RFC-awareness for constraint changes',
    {
      organonPath: z.string().describe('Path to the organon file to evolve'),
      changeType: z.enum(['add-invariant', 'modify-invariant', 'add-principle', 'update-counts', 'add-heuristic']).describe('Type of change'),
    },
    (args) => {
      const needsRfc = ['add-invariant', 'modify-invariant', 'add-principle'].includes(args.changeType);

      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `# Evolve Organon: ${args.organonPath}
Change type: **${args.changeType}**

${needsRfc ? `## RFC Required
This change type (${args.changeType}) modifies constraints. Per the RFC-Driven Evolution pattern:
- **New product-level invariants** require an RFC
- **Constraint modifications** require an RFC
- An RFC documents the rationale and impact

### RFC Checklist
1. Create an RFC document describing the change and rationale
2. Include an "Organon Impact" section listing files to create/update/delete
3. Get the RFC reviewed and accepted before proceeding

` : '## Direct Edit Allowed\nThis change type does not require an RFC (it\'s a non-constraint update).\n\n'}## Step 1: Load Current State
1. Read the current file at \`${args.organonPath}\`
2. Use \`organon_validate_frontmatter\` with the file to check current validity
3. Note current counts in frontmatter

## Step 2: Make the Change
Apply the ${args.changeType} change to the file content.

## Step 3: Update Frontmatter
1. Use \`organon_generate_frontmatter\` to recalculate counts and token_estimate
2. Bump the version number (minor version for additions, patch for corrections)
3. Update \`last_reviewed\` to today's date

## Step 4: Verify
1. Use \`organon_validate_frontmatter\` to verify the updated file
2. Use \`organon_verify\` to check nothing is broken system-wide
3. Check that child organons don't contradict the updated constraints

## Step 5: Same-PR Principle
Organon updates must be in the SAME commit/PR as any related code changes.
Never defer organon updates to a follow-up PR.`,
          },
        }],
      };
    },
  );
}
