// File: tests/security.test.ts
// What: Security tests for v1.2.0 - path traversal, XSS, ReDoS
// Why: Ensure security fixes work correctly
// Related: parser.ts, block-parsers/table.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parse } from '../src/parser';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const testDir = join(__dirname, 'security-test');

describe('Security Tests', () => {
  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, 'safe'), { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('Path Traversal Protection', () => {
    it('should reject include path with ../ escape', () => {
      // Create a file outside safe directory
      const outsideFile = join(testDir, 'secret.osf');
      writeFileSync(outsideFile, '@doc { # Secret\nShould not be accessible }');

      const malicious = '@include { path: "../secret.osf"; }';

      expect(() => {
        parse(malicious, {
          resolveIncludes: true,
          basePath: join(testDir, 'safe'),
        });
      }).toThrow(/Security.*outside base directory/);
    });

    it('should reject include path with multiple ../', () => {
      const malicious = '@include { path: "../../../../etc/passwd"; }';

      expect(() => {
        parse(malicious, {
          resolveIncludes: true,
          basePath: testDir,
        });
      }).toThrow(/Security.*outside base directory/);
    });

    it('should reject absolute paths in includes', () => {
      const malicious = '@include { path: "/etc/passwd"; }';

      expect(() => {
        parse(malicious, {
          resolveIncludes: true,
          basePath: testDir,
        });
      }).toThrow(/Security.*outside base directory/);
    });

    it('should allow valid relative paths within basePath', () => {
      const validFile = join(testDir, 'safe', 'allowed.osf');
      writeFileSync(validFile, '@doc { # Allowed\nThis is safe }');

      const valid = '@include { path: "./allowed.osf"; }';

      const doc = parse(valid, {
        resolveIncludes: true,
        basePath: join(testDir, 'safe'),
      });

      expect(doc.includes).toHaveLength(1);
      expect(doc.includes?.[0]?.resolved).toBeDefined();
    });

    it('should reject path with null bytes', () => {
      const malicious = '@include { path: "file.osf\u0000.txt"; }';

      // Path with null byte should fail during file read if not caught earlier
      expect(() => {
        parse(malicious, {
          resolveIncludes: true,
          basePath: testDir,
        });
      }).toThrow();
    });
  });

  describe('Table Column Count Validation', () => {
    it('should reject table with inconsistent row columns', () => {
      const malformed = `@table {
  | Name | Age |
  | --- | --- |
  | John | 30 |
  | Jane | 25 | Extra |
}`;

      expect(() => parse(malformed)).toThrow(/row.*3 columns.*expected 2/i);
    });

    it('should reject table with too few columns in row', () => {
      const malformed = `@table {
  | Name | Age | City |
  | --- | --- | --- |
  | John | 30 | NYC |
  | Jane |
}`;

      expect(() => parse(malformed)).toThrow(/row.*1 column.*expected 3/i);
    });

    it('should accept table with consistent columns', () => {
      const valid = `@table {
  | Name | Age |
  | --- | --- |
  | John | 30 |
  | Jane | 25 |
}`;

      const doc = parse(valid);
      expect(doc.blocks).toHaveLength(1);
      expect(doc.blocks[0]?.type).toBe('table');
    });
  });

  describe('Table Alignment Validation', () => {
    it('should reject invalid alignment values', () => {
      const malicious = `@table {
  alignment: ["left", "evil", "right"];
  
  | A | B | C |
  | --- | --- | --- |
  | 1 | 2 | 3 |
}`;

      expect(() => parse(malicious)).toThrow(/Invalid alignment.*"evil"/);
    });

    it('should reject alignment array with wrong length', () => {
      const malformed = `@table {
  alignment: ["left", "right"];
  
  | A | B | C |
  | --- | --- | --- |
  | 1 | 2 | 3 |
}`;

      expect(() => parse(malformed)).toThrow(/Alignment array length.*2.*must match.*3/);
    });

    it('should accept valid alignment values', () => {
      const valid = `@table {
  alignment: ["left", "center", "right"];
  
  | A | B | C |
  | --- | --- | --- |
  | 1 | 2 | 3 |
}`;

      const doc = parse(valid);
      expect(doc.blocks[0]).toBeDefined();
    });
  });

  describe('ReDoS Protection', () => {
    it('should handle normal spacing in includes', () => {
      // Reasonable spacing should work fine
      const normalSpacing = '@include  {  path:  "x";  }';

      const start = Date.now();
      const doc = parse(normalSpacing);
      const elapsed = Date.now() - start;

      // Should complete quickly
      expect(elapsed).toBeLessThan(100); // 100ms max
      expect(doc.includes).toHaveLength(1);
    });

    it('should not hang on many includes with normal spacing', () => {
      // Many includes should still be fast (bounded quantifiers prevent ReDoS)
      const manyIncludes = Array(100).fill('@include { path: "x"; }').join('\n');

      const start = Date.now();
      const doc = parse(manyIncludes);
      const elapsed = Date.now() - start;

      // Should complete quickly even with many includes
      expect(elapsed).toBeLessThan(1000); // 1 second for 100 includes
      expect(doc.includes).toHaveLength(100);
    });

    it('should reject include with excessive spacing (bounded regex)', () => {
      // More than 20 spaces should not match with bounded regex
      const tooManySpaces = '@include' + ' '.repeat(50) + '{ path: "x"; }';

      const doc = parse(tooManySpaces);
      // Should not find any includes due to regex bounds
      expect(doc.includes || []).toHaveLength(0);
    });
  });

  describe('Number Parsing Edge Cases', () => {
    it('should parse negative numbers correctly', () => {
      const valid = '@sheet { data: { "1,1": -123 }; }';
      const doc = parse(valid);
      expect(doc.blocks[0]).toBeDefined();
      expect(doc.blocks[0]?.type).toBe('sheet');
    });

    it('should reject infinite numbers', () => {
      // Our improved number parser rejects Infinity
      const huge = '@meta { value: ' + '9'.repeat(1000) + '; }';

      // Should reject because Number() produces Infinity which we validate against
      expect(() => parse(huge)).toThrow(/Invalid number/);
    });

    it('should handle negative numbers correctly', () => {
      const valid = '@meta { value: -123; }';
      const doc = parse(valid);
      expect(doc.blocks[0]).toBeDefined();
    });
  });

  describe('basePath Validation', () => {
    it('should require basePath when resolving includes', () => {
      // Mock environment without process.cwd
      const originalProcess = global.process;
      (global as any).process = { cwd: undefined };

      try {
        const osf = '@include { path: "./file.osf"; }';
        expect(() => {
          parse(osf, { resolveIncludes: true });
        }).toThrow(/basePath is required/);
      } finally {
        (global as any).process = originalProcess;
      }
    });

    it('should not require basePath when not resolving', () => {
      const osf = '@include { path: "./file.osf"; }';
      const doc = parse(osf, { resolveIncludes: false });

      expect(doc.includes).toHaveLength(1);
      expect(doc.includes?.[0]?.resolved).toBeUndefined();
    });
  });
});
