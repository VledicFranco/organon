import { describe, it, expect } from 'vitest';
import { parseProtocols } from './add-protocols-array.js';

describe('parseProtocols', () => {
  it('parses protocol entries from markdown', () => {
    const content = `
### PROTO-RFC-1: RFC Implementation

1. Create RFC document
2. Write impact section
3. Get review
4. Implement
5. Update organon
6. Merge

Automation tier: automated
Workflow: implement-rfc
Tools: [rfc:context, rfc:verify]
`;

    const protocols = parseProtocols(content);
    expect(protocols).toHaveLength(1);
    expect(protocols[0].id).toBe('PROTO-RFC-1');
    expect(protocols[0].name).toBe('RFC Implementation');
    expect(protocols[0].steps).toBe(6);
    expect(protocols[0].automation_tier).toBe('automated');
    expect(protocols[0].workflow).toBe('implement-rfc');
    expect(protocols[0].tools).toEqual(['rfc:context', 'rfc:verify']);
  });

  it('parses multiple protocols', () => {
    const content = `
### PROTO-REV-1: Code Review

1. Load constraints
2. Check violations
3. Report

### PROTO-DEP-1: Deploy

1. Build
2. Test
3. Deploy
4. Verify
5. Monitor
`;

    const protocols = parseProtocols(content);
    expect(protocols).toHaveLength(2);
    expect(protocols[0].id).toBe('PROTO-REV-1');
    expect(protocols[1].id).toBe('PROTO-DEP-1');
  });

  it('infers complexity from steps and tier', () => {
    const content = `
### PROTO-SIMPLE-1: Simple Task

1. Do thing

### PROTO-COMPLEX-1: Complex Task

1. Step 1
2. Step 2
3. Step 3
4. Step 4
5. Step 5
6. Step 6
7. Step 7
8. Step 8
`;

    const protocols = parseProtocols(content);
    expect(protocols[0].complexity).toBe('low');
    expect(protocols[1].complexity).toBe('high');
  });

  it('returns empty for no protocols', () => {
    const content = '# Just a heading\n\nSome content.';
    const protocols = parseProtocols(content);
    expect(protocols).toHaveLength(0);
  });

  it('defaults to manual automation tier', () => {
    const content = `
### PROTO-MAN-1: Manual Process

1. Think about it
2. Do it
`;

    const protocols = parseProtocols(content);
    expect(protocols[0].automation_tier).toBe('manual');
  });
});
