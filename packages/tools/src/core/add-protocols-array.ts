/**
 * Protocol parsing utility.
 *
 * Extracts protocol metadata from PROTOCOL.md / PROTOCOLS.md content
 * by analyzing ## headings, numbered steps, automation tier declarations,
 * and workflow bindings.
 */

import type { AutomationTier, Complexity, ProtocolEntry } from './types.js';

/**
 * Parse protocol entries from markdown content.
 * Looks for patterns like:
 *   ### PROTO-XXX-N: Protocol Name
 *   or ## Protocol: Name
 *   followed by steps, automation tier, etc.
 */
export function parseProtocols(content: string): ProtocolEntry[] {
  const protocols: ProtocolEntry[] = [];

  // Split by protocol headers (### PROTO-XXX-N or ## Protocol N:)
  const protocolPattern = /^#{2,3}\s+(?:Protocol\s*:?\s*)?(?<id>PROTO-[\w-]+(?:-\d+)?)\s*[:\-–—]\s*(?<name>.+)$/gm;
  let match: RegExpExecArray | null;

  const allMatches: { id: string; name: string; startIndex: number }[] = [];
  while ((match = protocolPattern.exec(content)) !== null) {
    allMatches.push({
      id: match.groups!.id,
      name: match.groups!.name.trim(),
      startIndex: match.index + match[0].length,
    });
  }

  for (let i = 0; i < allMatches.length; i++) {
    const current = allMatches[i];
    const endIndex = i + 1 < allMatches.length
      ? allMatches[i + 1].startIndex - allMatches[i + 1].id.length - 10
      : content.length;
    const section = content.slice(current.startIndex, endIndex);

    const steps = countSteps(section);
    const automationTier = detectAutomationTier(section);
    const workflow = extractWorkflow(section);
    const tools = extractTools(section);
    const complexity = inferComplexity(steps, automationTier);

    protocols.push({
      id: current.id,
      name: current.name,
      steps,
      automation_tier: automationTier,
      ...(workflow ? { workflow } : {}),
      ...(tools.length > 0 ? { tools } : {}),
      complexity,
    });
  }

  return protocols;
}

function countSteps(section: string): number {
  const lines = section.split('\n');
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    // Count numbered steps: "1. ", "2. ", etc.
    if (/^\d+\.\s/.test(trimmed)) {
      count++;
    }
  }
  return Math.max(count, 1); // At least 1 step
}

function detectAutomationTier(section: string): AutomationTier {
  const lower = section.toLowerCase();
  if (/automation[_\s]?tier\s*:\s*automated/i.test(section)) return 'automated';
  if (/automation[_\s]?tier\s*:\s*semi[_-]?automated/i.test(section)) return 'semi-automated';
  if (/automation[_\s]?tier\s*:\s*manual/i.test(section)) return 'manual';

  // Infer from content
  if (lower.includes('workflow:') || lower.includes('workflow binding')) return 'automated';
  if (lower.includes('run the') || lower.includes('execute')) return 'semi-automated';
  return 'manual';
}

function extractWorkflow(section: string): string | undefined {
  const match = section.match(/workflow\s*:\s*(\S+)/i);
  return match ? match[1] : undefined;
}

function extractTools(section: string): string[] {
  const match = section.match(/tools?\s*:\s*\[([^\]]+)\]/i);
  if (!match) return [];
  return match[1].split(',').map((t) => t.trim().replace(/['"]/g, '')).filter(Boolean);
}

function inferComplexity(steps: number, tier: AutomationTier): Complexity {
  if (steps >= 8 || tier === 'automated') return 'high';
  if (steps >= 4 || tier === 'semi-automated') return 'medium';
  return 'low';
}
