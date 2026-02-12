import { describe, it, expect } from 'vitest';
import {
  assertExportsPresent,
  ExportsPresentResolverError,
  ExportsPresentAssertionError,
  extractExportNames,
} from '../src/core/assert-exports-present.js';
import { MockFileSystem } from './test-helpers.js';

describe('extractExportNames (pure)', () => {
  it('extracts export function', () => {
    const names = extractExportNames(`export function foo() {}`);
    expect(names).toContain('foo');
  });

  it('extracts export async function', () => {
    const names = extractExportNames(`export async function bar() {}`);
    expect(names).toContain('bar');
  });

  it('extracts export class', () => {
    const names = extractExportNames(`export class MyClass {}`);
    expect(names).toContain('MyClass');
  });

  it('extracts export interface', () => {
    const names = extractExportNames(`export interface MyInterface {}`);
    expect(names).toContain('MyInterface');
  });

  it('extracts export type', () => {
    const names = extractExportNames(`export type MyType = string;`);
    expect(names).toContain('MyType');
  });

  it('extracts export const', () => {
    const names = extractExportNames(`export const MY_CONST = 42;`);
    expect(names).toContain('MY_CONST');
  });

  it('extracts export let', () => {
    const names = extractExportNames(`export let myVar = 0;`);
    expect(names).toContain('myVar');
  });

  it('extracts export enum', () => {
    const names = extractExportNames(`export enum Direction { Up, Down }`);
    expect(names).toContain('Direction');
  });

  it('extracts export list { a, b }', () => {
    const names = extractExportNames(`export { foo, bar, baz };`);
    expect(names).toContain('foo');
    expect(names).toContain('bar');
    expect(names).toContain('baz');
  });

  it('extracts export list with "as" aliases', () => {
    const names = extractExportNames(`export { foo as myFoo, bar };`);
    expect(names).toContain('foo');
    expect(names).toContain('bar');
  });

  it('extracts export list with type keyword', () => {
    const names = extractExportNames(`export { type MyType, MyClass };`);
    expect(names).toContain('MyType');
    expect(names).toContain('MyClass');
  });

  it('extracts re-exports from other modules', () => {
    const names = extractExportNames(`export { foo, bar } from './other.js';`);
    expect(names).toContain('foo');
    expect(names).toContain('bar');
  });

  it('extracts multiple exports from multi-line content', () => {
    const content = [
      `export function foo() {}`,
      `export const BAR = 1;`,
      `export class Baz {}`,
    ].join('\n');

    const names = extractExportNames(content);
    expect(names).toContain('foo');
    expect(names).toContain('BAR');
    expect(names).toContain('Baz');
  });

  it('returns empty array for files without exports', () => {
    const names = extractExportNames(`const x = 1;\nfunction foo() {}`);
    expect(names).toHaveLength(0);
  });

  it('handles trailing commas in export list', () => {
    const names = extractExportNames(`export { foo, bar, };`);
    expect(names).toContain('foo');
    expect(names).toContain('bar');
    expect(names).toHaveLength(2);
  });

  it('handles export var', () => {
    const names = extractExportNames(`export var legacy = true;`);
    expect(names).toContain('legacy');
  });
});

describe('assertExportsPresent (high-level)', () => {
  it('passes when all expected exports are found', async () => {
    const fs = new MockFileSystem({
      'src/index.ts': [
        `export function foo() {}`,
        `export const bar = 1;`,
        `export class Baz {}`,
      ].join('\n'),
    });

    await expect(
      assertExportsPresent({
        file: 'src/index.ts',
        expectedExports: ['foo', 'bar', 'Baz'],
        fs,
      }),
    ).resolves.toBeUndefined();
  });

  it('throws when an expected export is missing', async () => {
    const fs = new MockFileSystem({
      'src/index.ts': `export function foo() {}`,
    });

    await expect(
      assertExportsPresent({
        file: 'src/index.ts',
        expectedExports: ['foo', 'missing'],
        fs,
      }),
    ).rejects.toThrow(ExportsPresentAssertionError);
  });

  it('throws when file cannot be read', async () => {
    const fs = new MockFileSystem({});

    await expect(
      assertExportsPresent({
        file: 'missing.ts',
        expectedExports: ['foo'],
        fs,
      }),
    ).rejects.toThrow(ExportsPresentResolverError);
  });

  it('throws when expectedExports is empty', async () => {
    const fs = new MockFileSystem({
      'src/index.ts': `export const x = 1;`,
    });

    await expect(
      assertExportsPresent({
        file: 'src/index.ts',
        expectedExports: [],
        fs,
      }),
    ).rejects.toThrow(ExportsPresentResolverError);
  });

  it('resolves file path relative to cwd', async () => {
    const fs = new MockFileSystem({
      'project/src/index.ts': `export function foo() {}`,
    });

    await expect(
      assertExportsPresent({
        file: 'src/index.ts',
        expectedExports: ['foo'],
        cwd: 'project',
        fs,
      }),
    ).resolves.toBeUndefined();
  });
});
