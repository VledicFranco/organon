import { describe, it, expect } from 'vitest';
import {
  validateNamingConvention,
  NamingConventionAssertionError,
  matchesConvention,
} from '../src/core/assertions/naming-convention.js';
import type { ExtractedString } from '../src/core/resolvers/string-resolver.js';

describe('matchesConvention', () => {
  it('validates kebab-case', () => {
    expect(matchesConvention('foo-bar', 'kebab-case')).toBe(true);
    expect(matchesConvention('foo', 'kebab-case')).toBe(true);
    expect(matchesConvention('foo-bar-baz', 'kebab-case')).toBe(true);
    expect(matchesConvention('FooBar', 'kebab-case')).toBe(false);
    expect(matchesConvention('foo_bar', 'kebab-case')).toBe(false);
    expect(matchesConvention('fooBar', 'kebab-case')).toBe(false);
  });

  it('validates camelCase', () => {
    expect(matchesConvention('fooBar', 'camelCase')).toBe(true);
    expect(matchesConvention('foo', 'camelCase')).toBe(true);
    expect(matchesConvention('fooBarBaz', 'camelCase')).toBe(true);
    expect(matchesConvention('FooBar', 'camelCase')).toBe(false);
    expect(matchesConvention('foo-bar', 'camelCase')).toBe(false);
    expect(matchesConvention('foo_bar', 'camelCase')).toBe(false);
  });

  it('validates PascalCase', () => {
    expect(matchesConvention('FooBar', 'PascalCase')).toBe(true);
    expect(matchesConvention('Foo', 'PascalCase')).toBe(true);
    expect(matchesConvention('FooBarBaz', 'PascalCase')).toBe(true);
    expect(matchesConvention('fooBar', 'PascalCase')).toBe(false);
    expect(matchesConvention('foo-bar', 'PascalCase')).toBe(false);
  });

  it('validates SCREAMING_SNAKE_CASE', () => {
    expect(matchesConvention('FOO_BAR', 'SCREAMING_SNAKE_CASE')).toBe(true);
    expect(matchesConvention('FOO', 'SCREAMING_SNAKE_CASE')).toBe(true);
    expect(matchesConvention('FOO_BAR_BAZ', 'SCREAMING_SNAKE_CASE')).toBe(true);
    expect(matchesConvention('fooBar', 'SCREAMING_SNAKE_CASE')).toBe(false);
    expect(matchesConvention('foo_bar', 'SCREAMING_SNAKE_CASE')).toBe(false);
  });

  it('validates snake_case', () => {
    expect(matchesConvention('foo_bar', 'snake_case')).toBe(true);
    expect(matchesConvention('foo', 'snake_case')).toBe(true);
    expect(matchesConvention('foo_bar_baz', 'snake_case')).toBe(true);
    expect(matchesConvention('fooBar', 'snake_case')).toBe(false);
    expect(matchesConvention('FOO_BAR', 'snake_case')).toBe(false);
  });
});

describe('validateNamingConvention (pure assertion)', () => {
  it('passes when no strings are provided', () => {
    expect(() => validateNamingConvention([], 'kebab-case')).not.toThrow();
  });

  it('passes when all strings match the convention', () => {
    const strings: ExtractedString[] = [
      { file: 'a.ts', value: 'foo-bar', line: 0 },
      { file: 'b.ts', value: 'baz-qux', line: 0 },
    ];

    expect(() =>
      validateNamingConvention(strings, 'kebab-case'),
    ).not.toThrow();
  });

  it('throws when a string violates the convention', () => {
    const strings: ExtractedString[] = [
      { file: 'foo-bar.ts', value: 'foo-bar', line: 0 },
      { file: 'FooBar.ts', value: 'FooBar', line: 0 },
    ];

    expect(() =>
      validateNamingConvention(strings, 'kebab-case'),
    ).toThrow(NamingConventionAssertionError);
  });

  it('includes violation details', () => {
    const strings: ExtractedString[] = [
      { file: 'BadName.ts', value: 'BadName', line: 0 },
    ];

    try {
      validateNamingConvention(strings, 'kebab-case');
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as NamingConventionAssertionError;
      expect(error.violations).toHaveLength(1);
      expect(error.violations[0].value).toBe('BadName');
      expect(error.violations[0].convention).toBe('kebab-case');
    }
  });

  it('reports all violations', () => {
    const strings: ExtractedString[] = [
      { file: 'a.ts', value: 'FooBar', line: 1 },
      { file: 'b.ts', value: 'good-name', line: 0 },
      { file: 'c.ts', value: 'BazQux', line: 3 },
    ];

    try {
      validateNamingConvention(strings, 'kebab-case');
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as NamingConventionAssertionError;
      expect(error.violations).toHaveLength(2);
    }
  });

  it('respects exceptions', () => {
    const strings: ExtractedString[] = [
      { file: 'a.ts', value: 'FooBar', line: 0 },
      { file: 'b.ts', value: 'good-name', line: 0 },
    ];

    expect(() =>
      validateNamingConvention(strings, 'kebab-case', ['FooBar']),
    ).not.toThrow();
  });

  it('error message includes location for line-level checks', () => {
    const strings: ExtractedString[] = [
      { file: 'src/foo.ts', value: 'BAD_NAME', line: 42 },
    ];

    try {
      validateNamingConvention(strings, 'camelCase');
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as NamingConventionAssertionError;
      expect(error.message).toContain('src/foo.ts:42');
    }
  });

  it('error message uses file path for file-level checks', () => {
    const strings: ExtractedString[] = [
      { file: 'src/BAD_NAME.ts', value: 'BAD_NAME', line: 0 },
    ];

    try {
      validateNamingConvention(strings, 'kebab-case');
      expect.unreachable('Should have thrown');
    } catch (err) {
      const error = err as NamingConventionAssertionError;
      expect(error.message).toContain('src/BAD_NAME.ts');
      expect(error.message).not.toContain(':0');
    }
  });

  it('error has name NamingConventionAssertionError', () => {
    const strings: ExtractedString[] = [
      { file: 'BAD.ts', value: 'BAD', line: 0 },
    ];

    try {
      validateNamingConvention(strings, 'kebab-case');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect((err as Error).name).toBe('NamingConventionAssertionError');
    }
  });
});
