import { describe, it, expect } from 'vitest';
import { validateWorkflow } from './validate-workflow.js';
import { MemoryFileSystem, makeWorkflow } from './test-helpers.js';
import type { OrganonConfig } from './types.js';

function makeConfig(projectRoot: string): OrganonConfig {
  return {
    projectRoot,
    organonPaths: ['.'],
    organonGlobs: ['**/ETHOS.md'],
    ignorePatterns: [],
    workflowPaths: { generic: 'workflows' },
    freshnessThresholdHours: 24,
  };
}

describe('validateWorkflow', () => {
  it('passes for a well-formed workflow', async () => {
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': makeWorkflow(),
      '/project/ETHOS.md': '# ethos',
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
    expect(result.workflowsChecked).toBe(1);
    expect(result.workflowsWithErrors).toBe(0);
  });

  it('succeeds when no workflow files exist', async () => {
    const fs = new MemoryFileSystem({});
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.success).toBe(true);
    expect(result.workflowsChecked).toBe(0);
  });

  it('reports error when protocol_id is missing', async () => {
    const content = makeWorkflow().replace(/protocol_id: .*\n/, '');
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': content,
      '/project/ETHOS.md': '# ethos',
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'WORKFLOW_MISSING_PROTOCOL_ID' }),
    );
  });

  it('reports error when protocol_file is missing', async () => {
    const content = makeWorkflow().replace(/protocol_file: .*\n/, '');
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': content,
      '/project/ETHOS.md': '# ethos',
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'WORKFLOW_MISSING_PROTOCOL_FILE' }),
    );
  });

  it('reports error when tools array is missing', async () => {
    const content = makeWorkflow().replace(/tools:\n  - tool:verify\n/, '');
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': content,
      '/project/ETHOS.md': '# ethos',
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'WORKFLOW_MISSING_TOOLS' }),
    );
  });

  it('reports error when context array is missing', async () => {
    const content = makeWorkflow().replace(/context:\n  - \/ETHOS\.md\n/, '');
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': content,
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'WORKFLOW_MISSING_CONTEXT' }),
    );
  });

  it('reports error when context path does not resolve', async () => {
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': makeWorkflow({ context: ['/nonexistent.md'] }),
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'WORKFLOW_BROKEN_CONTEXT_REF' }),
    );
  });

  it('warns when error recovery section is missing', async () => {
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': makeWorkflow({ includeRecovery: false }),
      '/project/ETHOS.md': '# ethos',
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'WORKFLOW_NO_ERROR_RECOVERY' }),
    );
  });

  it('warns when error recovery section has no table', async () => {
    const content = makeWorkflow({ includeRecovery: false }) + '\n## Error Recovery\n\nJust some text, no table.\n';
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': content,
      '/project/ETHOS.md': '# ethos',
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'WORKFLOW_RECOVERY_NO_TABLE' }),
    );
  });

  it('warns when context array exceeds threshold', async () => {
    const manyContextPaths = Array.from({ length: 12 }, (_, i) => `/file${i}.md`);
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': makeWorkflow({ context: manyContextPaths }),
    });
    // Create all the context files so they resolve
    for (const p of manyContextPaths) {
      fs.addFile(`/project${p}`, '# content');
    }
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'WORKFLOW_CONTEXT_OVERLOAD' }),
    );
  });

  it('warns when a tool in tools array is not referenced in body', async () => {
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': makeWorkflow({ tools: ['tool:verify', 'tool:unused'] }),
      '/project/ETHOS.md': '# ethos',
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: 'WORKFLOW_UNREFERENCED_TOOL',
        message: expect.stringContaining('tool:unused'),
      }),
    );
  });

  it('warns when workflow step count is less than protocol step count', async () => {
    const protocolContent = `---
type: procedures
scope: domain
name: test-protocol
version: "1.0"
summary: Test protocol
token_estimate: 200
protocols_count: 1
protocols:
  - id: PROTO-TEST-1
    name: Test Protocol
    steps: 6
    automation_tier: automated
    workflow: test-workflow
    complexity: medium
---

## Steps
1. Step one
2. Step two
3. Step three
4. Step four
5. Step five
6. Step six
`;
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': makeWorkflow({ steps: 3, protocolFile: 'PROTOCOLS.md', protocolId: 'PROTO-TEST-1' }),
      '/project/PROTOCOLS.md': protocolContent,
      '/project/ETHOS.md': '# ethos',
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'WORKFLOW_STEP_COUNT_LOW' }),
    );
  });

  it('handles workflow files without frontmatter gracefully', async () => {
    const fs = new MemoryFileSystem({
      '/project/workflows/test.md': '# No frontmatter workflow\n\nJust content.',
    });
    const config = makeConfig('/project');
    const result = await validateWorkflow({ projectRoot: '/project', config, fs });
    // Should report errors for missing required fields, not crash
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
