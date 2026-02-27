/**
 * Test sampling utilities — validates LLM analysis requests work correctly.
 */

import { describe, it, expect, vi } from 'vitest';
import { analyzeVerificationIssues } from './sampling.js';
import type { DiagnosticMessage } from '../core/types.js';

describe('analyzeVerificationIssues', () => {
  it('should format verification issues into a structured prompt', async () => {
    const mockServer = {
      request: vi.fn().mockResolvedValue({
        result: {
          content: {
            type: 'text',
            text: 'Root cause: missing invariant coverage in domain ETHOS.md. Recommend adding 2 missing invariants.',
          },
        },
      }),
    };

    const errors: DiagnosticMessage[] = [
      {
        severity: 'error',
        code: 'MISSING_INVARIANT',
        message: 'Invariant coverage incomplete: 3/5 covered',
        file: 'organon/domains/api/ETHOS.md',
      },
    ];

    const warnings: DiagnosticMessage[] = [
      {
        severity: 'warning',
        code: 'STALE_FRONTMATTER',
        message: 'Token estimate is 3 weeks old',
        file: 'organon/domains/api/PHILOSOPHY.md',
      },
    ];

    const result = await analyzeVerificationIssues(mockServer as any, {
      errors,
      warnings,
      failedGates: ['invariant-coverage', 'freshness'],
    });

    expect(result).toContain('Root cause');
    expect(mockServer.request).toHaveBeenCalledOnce();

    // Validate the sampling request structure
    const call = mockServer.request.mock.calls[0][0];
    expect(call.method).toBe('sampling/createMessage');
    expect(call.params.messages).toHaveLength(1);
    expect(call.params.messages[0].role).toBe('user');
    expect(call.params.messages[0].content.text).toContain('Verification failed');
    expect(call.params.systemPrompt).toContain('Organon methodology');
    expect(call.params.maxTokens).toBe(500);
  });

  it('should handle sampling errors gracefully', async () => {
    const mockServer = {
      request: vi.fn().mockRejectedValue(new Error('Sampling not supported')),
    };

    const result = await analyzeVerificationIssues(mockServer as any, {
      errors: [
        {
          severity: 'error',
          code: 'TEST_ERROR',
          message: 'Test error for error handling',
        },
      ],
      warnings: [],
      failedGates: ['test-gate'],
    });

    expect(result).toContain('Sampling unavailable');
    expect(result).toContain('Sampling not supported');
  });

  it('should include model preferences in sampling request', async () => {
    const mockServer = {
      request: vi.fn().mockResolvedValue({
        result: {
          content: { type: 'text', text: 'Analysis result' },
        },
      }),
    };

    await analyzeVerificationIssues(mockServer as any, {
      errors: [],
      warnings: [],
      failedGates: [],
    });

    const call = mockServer.request.mock.calls[0][0];
    expect(call.params.modelPreferences).toBeDefined();
    expect(call.params.modelPreferences.intelligencePriority).toBe(0.8);
    expect(call.params.modelPreferences.speedPriority).toBe(0.3);
    expect(call.params.modelPreferences.hints).toEqual([{ name: 'claude' }]);
  });

  it('should limit error and warning display to avoid token bloat', async () => {
    const mockServer = {
      request: vi.fn().mockResolvedValue({
        result: {
          content: { type: 'text', text: 'Analysis' },
        },
      }),
    };

    const manyErrors = Array.from({ length: 20 }, (_, i) => ({
      severity: 'error' as const,
      code: `ERROR_${i}`,
      message: `Error ${i}`,
    }));

    await analyzeVerificationIssues(mockServer as any, {
      errors: manyErrors,
      warnings: [],
      failedGates: [],
    });

    const call = mockServer.request.mock.calls[0][0];
    const prompt = call.params.messages[0].content.text;

    // Should mention "first 5" for errors
    expect(prompt).toContain('first 5');
    // Should not include all 20 errors in the prompt
    expect(prompt).not.toContain('Error 19');
  });
});
