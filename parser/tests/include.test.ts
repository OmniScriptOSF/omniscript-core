// File: tests/include.test.ts
// What: Tests for @include directive
// Why: Ensure file composition works correctly
// Related: parser.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parse } from '../src/parser';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import type { IncludeDirective } from '../src/types';

const testDir = join(__dirname, 'test-includes');

describe('@include directive', () => {
  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });
  
  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });
  
  it('should parse include directive without resolving', () => {
    const osf = '@include { path: "./section.osf"; }';
    const doc = parse(osf);
    
    expect(doc.includes).toHaveLength(1);
    expect(doc.includes?.[0]?.path).toBe('./section.osf');
    expect(doc.includes?.[0]?.type).toBe('include');
  });
  
  it('should parse multiple includes', () => {
    const osf = `
@include { path: "./intro.osf"; }
@include { path: "./body.osf"; }
@include { path: "./conclusion.osf"; }
`;
    
    const doc = parse(osf);
    expect(doc.includes).toHaveLength(3);
    expect(doc.includes?.[0]?.path).toBe('./intro.osf');
    expect(doc.includes?.[1]?.path).toBe('./body.osf');
    expect(doc.includes?.[2]?.path).toBe('./conclusion.osf');
  });
  
  it('should resolve simple include', () => {
    const sectionPath = join(testDir, 'section.osf');
    writeFileSync(sectionPath, '@doc { # Section\nContent here }');
    
    const mainOsf = '@include { path: "./section.osf"; }';
    const mainPath = join(testDir, 'main.osf');
    writeFileSync(mainPath, mainOsf);
    
    const content = mainOsf;
    const doc = parse(content, {
      resolveIncludes: true,
      basePath: testDir
    });
    
    expect(doc.includes).toHaveLength(1);
    const include = doc.includes?.[0] as IncludeDirective;
    expect(include.resolved).toBeDefined();
    expect(include.resolved?.blocks).toHaveLength(1);
    expect(include.resolved?.blocks[0]?.type).toBe('doc');
  });
  
  it('should resolve nested includes', () => {
    const innerPath = join(testDir, 'inner.osf');
    writeFileSync(innerPath, '@doc { # Inner\nInner content }');
    
    const middlePath = join(testDir, 'middle.osf');
    writeFileSync(middlePath, '@include { path: "./inner.osf"; }');
    
    const mainOsf = '@include { path: "./middle.osf"; }';
    
    const doc = parse(mainOsf, {
      resolveIncludes: true,
      basePath: testDir
    });
    
    expect(doc.includes).toHaveLength(1);
    const firstInclude = doc.includes?.[0] as IncludeDirective;
    expect(firstInclude.resolved).toBeDefined();
    expect(firstInclude.resolved?.includes).toHaveLength(1);
    
    const nestedInclude = firstInclude.resolved?.includes?.[0] as IncludeDirective;
    expect(nestedInclude.resolved).toBeDefined();
    expect(nestedInclude.resolved?.blocks[0]?.type).toBe('doc');
  });
  
  it('should detect excessive depth (circular reference protection)', () => {
    const aPath = join(testDir, 'a.osf');
    const bPath = join(testDir, 'b.osf');
    
    writeFileSync(aPath, '@include { path: "./b.osf"; }');
    writeFileSync(bPath, '@include { path: "./a.osf"; }');
    
    const mainOsf = '@include { path: "./a.osf"; }';
    
    expect(() => {
      parse(mainOsf, {
        resolveIncludes: true,
        basePath: testDir,
        maxDepth: 5
      });
    }).toThrow(/depth exceeded|circular/i);
  });
  
  it('should throw error for missing file', () => {
    const osf = '@include { path: "./nonexistent.osf"; }';
    
    expect(() => {
      parse(osf, {
        resolveIncludes: true,
        basePath: testDir
      });
    }).toThrow(/Failed to resolve include/);
  });
  
  it('should work with includes and regular blocks together', () => {
    const sectionPath = join(testDir, 'section.osf');
    writeFileSync(sectionPath, '@doc { # Included\nIncluded content }');
    
    const osf = `
@meta { title: "Main Document"; }
@include { path: "./section.osf"; }
@doc { # Local\nLocal content }
`;
    
    const doc = parse(osf, {
      resolveIncludes: true,
      basePath: testDir
    });
    
    expect(doc.blocks).toHaveLength(2); // meta and local doc
    expect(doc.includes).toHaveLength(1);
    expect(doc.includes?.[0]?.resolved?.blocks).toHaveLength(1);
  });
});
