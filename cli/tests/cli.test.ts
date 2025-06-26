import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const CLI_PATH = join(__dirname, '../dist/osf.js');
const TEST_FIXTURES_DIR = join(__dirname, 'fixtures');

// Sample OSF content for testing
const SAMPLE_OSF = `@meta {
  title: "Test Document";
  author: "Test Author";
  date: "2025-01-01";
}

@doc {
  # Test Document
  This is a test document with **bold** text.
}

@slide {
  title: "Test Slide";
  layout: TitleAndBullets;
  bullets {
    "First bullet";
    "Second bullet";
  }
}

@sheet {
  name: "TestSheet";
  cols: [Column1, Column2, Growth];
  data {
    (2,1) = "Q1";
    (2,2) = 100;
    (3,1) = "Q2";
    (3,2) = 115;
  }
  formula (2,3): "=(B2-100)/100*100";
  formula (3,3): "=(B3-100)/100*100";
}`;

const INVALID_OSF = `@meta {
  title: "Unclosed Block"
  // Missing closing brace`;

describe('OSF CLI', () => {
  const testFile = join(TEST_FIXTURES_DIR, 'test.osf');
  const invalidFile = join(TEST_FIXTURES_DIR, 'invalid.osf');
  const outputFile = join(TEST_FIXTURES_DIR, 'output.tmp');

  beforeEach(() => {
    // Ensure fixtures directory exists
    if (!existsSync(TEST_FIXTURES_DIR)) {
      execSync(`mkdir -p "${TEST_FIXTURES_DIR}"`);
    }

    // Create test files
    writeFileSync(testFile, SAMPLE_OSF, 'utf8');
    writeFileSync(invalidFile, INVALID_OSF, 'utf8');
  });

  afterEach(() => {
    // Clean up test files
    [testFile, invalidFile, outputFile].forEach(file => {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    });
  });

  describe('help and version', () => {
    it('should show help when --help is passed', () => {
      const result = execSync(`node "${CLI_PATH}" --help`, { encoding: 'utf8' });

      expect(result).toContain('OmniScript Format (OSF) CLI');
      expect(result).toContain('Usage: osf <command>');
      expect(result).toContain('Commands:');
      expect(result).toContain('parse');
      expect(result).toContain('lint');
      expect(result).toContain('diff');
      expect(result).toContain('render');
      expect(result).toContain('export');
      expect(result).toContain('format');
    });

    it('should show version when --version is passed', () => {
      const result = execSync(`node "${CLI_PATH}" --version`, { encoding: 'utf8' });

      expect(result.trim()).toBe('0.1.0');
    });

    it('should show help when no arguments are passed', () => {
      const result = execSync(`node "${CLI_PATH}"`, { encoding: 'utf8' });

      expect(result).toContain('OmniScript Format (OSF) CLI');
    });
  });

  describe('parse command', () => {
    it('should parse a valid OSF file', () => {
      const result = execSync(`node "${CLI_PATH}" parse "${testFile}"`, { encoding: 'utf8' });

      const parsed = JSON.parse(result);
      expect(parsed.blocks).toHaveLength(4);
      expect(parsed.blocks[0].type).toBe('meta');
      expect(parsed.blocks[1].type).toBe('doc');
      expect(parsed.blocks[2].type).toBe('slide');
      expect(parsed.blocks[3].type).toBe('sheet');
    });

    it('should fail with invalid OSF syntax', () => {
      expect(() => {
        execSync(`node "${CLI_PATH}" parse "${invalidFile}"`, { encoding: 'utf8' });
      }).toThrow();
    });

    it('should fail when file does not exist', () => {
      expect(() => {
        execSync(`node "${CLI_PATH}" parse "nonexistent.osf"`, { encoding: 'utf8' });
      }).toThrow();
    });
  });

  describe('lint command', () => {
    it('should pass linting for valid OSF file', () => {
      const result = execSync(`node "${CLI_PATH}" lint "${testFile}"`, { encoding: 'utf8' });

      expect(result).toContain('✅ Lint passed');
    });

    it('should fail linting for invalid OSF file', () => {
      expect(() => {
        execSync(`node "${CLI_PATH}" lint "${invalidFile}"`, { encoding: 'utf8' });
      }).toThrow();
    });
  });

  describe('format command', () => {
    it('should format an OSF file to stdout', () => {
      const result = execSync(`node "${CLI_PATH}" format "${testFile}"`, { encoding: 'utf8' });

      expect(result).toContain('@meta {');
      expect(result).toContain('@doc {');
      expect(result).toContain('@slide {');
      expect(result).toContain('@sheet {');
    });

    it('should format an OSF file to output file', () => {
      execSync(`node "${CLI_PATH}" format "${testFile}" --output "${outputFile}"`, {
        encoding: 'utf8',
      });

      expect(existsSync(outputFile)).toBe(true);
      const content = readFileSync(outputFile, 'utf8');
      expect(content).toContain('@meta {');
      expect(content).toContain('@doc {');
    });
  });

  describe('render command', () => {
    it('should render OSF to HTML', () => {
      const result = execSync(`node "${CLI_PATH}" render "${testFile}"`, { encoding: 'utf8' });

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<title>OSF Document</title>');
      expect(result).toContain('<h1>Test Document</h1>');
      expect(result).toContain('<strong>Author:</strong> Test Author');
      expect(result).toContain('<section class="slide">');
      expect(result).toContain('<table>');
    });

    it('should render OSF to HTML file', () => {
      execSync(`node "${CLI_PATH}" render "${testFile}" --output "${outputFile}"`, {
        encoding: 'utf8',
      });

      expect(existsSync(outputFile)).toBe(true);
      const content = readFileSync(outputFile, 'utf8');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<h1>Test Document</h1>');
    });

    it('should fail with unknown format', () => {
      expect(() => {
        execSync(`node "${CLI_PATH}" render "${testFile}" --format xml`, { encoding: 'utf8' });
      }).toThrow();
    });
  });

  describe('export command', () => {
    it('should export OSF to Markdown', () => {
      const result = execSync(`node "${CLI_PATH}" export "${testFile}"`, { encoding: 'utf8' });

      expect(result).toContain('---');
      expect(result).toContain('title: Test Document');
      expect(result).toContain('# Test Document');
      expect(result).toContain('## Test Slide');
      expect(result).toContain('- First bullet');
      expect(result).toContain('| Column1 | Column2 | Growth |');
    });

    it('should export OSF to JSON', () => {
      const result = execSync(`node "${CLI_PATH}" export "${testFile}" --target json`, {
        encoding: 'utf8',
      });

      const exported = JSON.parse(result);
      expect(exported.meta).toBeDefined();
      expect(exported.docs).toHaveLength(1);
      expect(exported.slides).toHaveLength(1);
      expect(exported.sheets).toHaveLength(1);
    });

    it('should export OSF to file', () => {
      execSync(`node "${CLI_PATH}" export "${testFile}" --output "${outputFile}"`, {
        encoding: 'utf8',
      });

      expect(existsSync(outputFile)).toBe(true);
      const content = readFileSync(outputFile, 'utf8');
      expect(content).toContain('# Test Document');
    });

    it('should fail with unknown target', () => {
      expect(() => {
        execSync(`node "${CLI_PATH}" export "${testFile}" --target xml`, { encoding: 'utf8' });
      }).toThrow();
    });
  });

  describe('diff command', () => {
    it('should show no differences for identical files', () => {
      const testFile2 = join(TEST_FIXTURES_DIR, 'test2.osf');
      writeFileSync(testFile2, SAMPLE_OSF, 'utf8');

      try {
        const result = execSync(`node "${CLI_PATH}" diff "${testFile}" "${testFile2}"`, {
          encoding: 'utf8',
        });
        expect(result).toContain('✅ No differences found');
      } finally {
        if (existsSync(testFile2)) {
          unlinkSync(testFile2);
        }
      }
    });

    it('should show differences for different files', () => {
      const differentOSF = `@meta {
        title: "Different Document";
      }`;
      const testFile2 = join(TEST_FIXTURES_DIR, 'different.osf');
      writeFileSync(testFile2, differentOSF, 'utf8');

      try {
        execSync(`node "${CLI_PATH}" diff "${testFile}" "${testFile2}"`, { encoding: 'utf8' });
        throw new Error('diff should fail');
      } catch (err: any) {
        const output = (err.stdout || '') as string;
        expect(output).toContain('❌ Documents differ');
        expect(output).toContain('title');
      } finally {
        if (existsSync(testFile2)) {
          unlinkSync(testFile2);
        }
      }
    });
  });

  describe('error handling', () => {
    it('should show error for unknown command', () => {
      expect(() => {
        execSync(`node "${CLI_PATH}" unknown`, { encoding: 'utf8' });
      }).toThrow();
    });

    it('should show error for missing required arguments', () => {
      expect(() => {
        execSync(`node "${CLI_PATH}" parse`, { encoding: 'utf8' });
      }).toThrow();
    });

    it('should show detailed error in DEBUG mode', () => {
      try {
        execSync(`node "${CLI_PATH}" parse "${invalidFile}"`, {
          encoding: 'utf8',
          env: { ...process.env, DEBUG: '1' },
        });
      } catch (error: any) {
        expect(error.stdout || error.stderr).toContain('Error in parse:');
      }
    });
  });
});
