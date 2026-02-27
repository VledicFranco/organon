/**
 * MCP Sampling utilities — allows server to request LLM completions via client.
 *
 * When verification issues are found, the server can use sampling to ask
 * the LLM for diagnostic analysis and root cause suggestions.
 *
 * Requires: client must declare `sampling` capability.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DiagnosticMessage } from '../core/types.js';

export interface SamplingRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: {
      type: 'text';
      text: string;
    };
  }>;
  systemPrompt?: string;
  maxTokens?: number;
  modelPreferences?: {
    hints?: Array<{ name: string }>;
    intelligencePriority?: number;
    speedPriority?: number;
    costPriority?: number;
  };
}

export interface SamplingResponse {
  role: 'assistant';
  content: {
    type: 'text';
    text: string;
  };
  model: string;
  stopReason: string;
}

/**
 * Request LLM analysis of project health and strategic recommendations.
 *
 * When organon_health finds issues, this samples the LLM to suggest
 * strategic improvements and prioritized action items.
 */
export async function analyzeProjectHealth(
  server: McpServer,
  healthData: {
    score: number;
    coverage: any;
    validation: any;
    topIssues: DiagnosticMessage[];
  },
): Promise<string> {
  const prompt = `# Organon Project Health Analysis

Current Health Score: ${healthData.score}/100

Coverage:
- Files with frontmatter: ${healthData.coverage.percentage}%

Validation:
- Passing: ${healthData.validation.passing}
- Failing: ${healthData.validation.failing}
- Warnings: ${healthData.validation.warnings}

Top Issues (first 5):
${healthData.topIssues
  .slice(0, 5)
  .map((issue) => `- [${issue.code}] ${issue.message}${issue.file ? ` (${issue.file})` : ''}`)
  .join('\n')}

## Task
Provide strategic recommendations to improve project health:
1. **Top 3 Impact Areas** — Which issues would improve score most if fixed?
2. **Quick Wins** — What can be fixed with minimal effort?
3. **Strategic Direction** — What's the long-term pattern here?
4. **Priority Roadmap** — Ordered list of next steps (short-term, medium-term, long-term)

Be specific and actionable.`;

  try {
    const response = await (server as any).request(
      {
        jsonrpc: '2.0',
        method: 'sampling/createMessage',
        params: {
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text: prompt,
              },
            },
          ],
          systemPrompt:
            'You are a strategic advisor for the Organon methodology. You help projects improve health and maturity. Focus on actionable improvements and long-term thinking. Be direct and prioritize impact.',
          maxTokens: 800,
          modelPreferences: {
            hints: [{ name: 'claude' }],
            intelligencePriority: 0.9,
            speedPriority: 0.2,
          },
        },
      },
    );

    if (response?.result?.content?.type === 'text') {
      return response.result.content.text;
    }

    return '(Health analysis unavailable)';
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Sampling error:', message);
    return `(Health analysis unavailable: ${message})`;
  }
}

/**
 * Request LLM analysis of verification issues.
 *
 * When organon_verify finds errors, this samples the LLM to suggest
 * root causes and remediation strategies.
 */
export async function analyzeVerificationIssues(
  server: McpServer,
  issues: {
    errors: DiagnosticMessage[];
    warnings: DiagnosticMessage[];
    failedGates: string[];
  },
): Promise<string> {
  const errorCount = issues.errors.length;
  const warningCount = issues.warnings.length;

  // Format issues for sampling
  const errorSummary = issues.errors
    .slice(0, 5) // Limit to first 5 for brevity
    .map((e) => `- [${e.code}] ${e.message}${e.file ? ` (${e.file})` : ''}`)
    .join('\n');

  const warningSummary = issues.warnings
    .slice(0, 3) // Limit to first 3
    .map((w) => `- [${w.code}] ${w.message}${w.file ? ` (${w.file})` : ''}`)
    .join('\n');

  const prompt = `# Organon Verification Analysis

Verification failed with ${errorCount} error(s) and ${warningCount} warning(s).
Failed gates: ${issues.failedGates.join(', ')}

## Errors (showing first ${Math.min(5, errorCount)}):
${errorSummary}

## Warnings (showing first ${Math.min(3, warningCount)}):
${warningSummary}

## Task
Analyze these issues and suggest:
1. **Most likely root cause** — what's probably wrong?
2. **Which gate(s) to fix first** — prioritize by impact
3. **Quick diagnosis steps** — what to check in the organon files
4. **Risk of cascade failures** — will fixing one issue unblock others?

Be concise and actionable.`;

  try {
    // Call sampling/createMessage on the client
    const response = await (server as any).request(
      {
        jsonrpc: '2.0',
        method: 'sampling/createMessage',
        params: {
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text: prompt,
              },
            },
          ],
          systemPrompt:
            'You are an expert in the Organon methodology. You help developers understand and fix verification failures in their organon constraints and procedures. Be direct and analytical.',
          maxTokens: 500,
          modelPreferences: {
            hints: [{ name: 'claude' }],
            intelligencePriority: 0.8,
            speedPriority: 0.3,
          },
        },
      },
    );

    if (response?.result?.content?.type === 'text') {
      return response.result.content.text;
    }

    return '(Sampling failed — unable to analyze issues)';
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Sampling error:', message);
    return `(Sampling unavailable: ${message})`;
  }
}
