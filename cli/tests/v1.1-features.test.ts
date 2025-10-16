// File: cli/tests/v1.1-features.test.ts
// What: Test v1.1 CLI features (extended rendering, security fixes)
// Why: Ensure new v1.1 CLI capabilities work correctly
// RELEVANT FILES: osf.ts, cli.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const CLI_PATH = join(__dirname, '../dist/osf.js');
const TEST_FIXTURES_DIR = join(__dirname, 'fixtures');

describe('v1.1 CLI Features', () => {
  beforeEach(() => {
    if (!existsSync(TEST_FIXTURES_DIR)) {
      execSync(`mkdir -p "${TEST_FIXTURES_DIR}"`);
    }
  });

  afterEach(() => {
    // Clean up test files
    const testFiles = ['test_v11.osf', 'output.html', 'output.md'];
    testFiles.forEach(file => {
      const filePath = join(TEST_FIXTURES_DIR, file);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    });
  });

  describe('Extended HTML Rendering', () => {
    it('should render ordered lists in HTML', () => {
      const osf = `@slide {
  title: "Test";
  1. First item
  2. Second item
  3. Third item
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" render "${testFile}"`, {
        encoding: 'utf8',
      });

      expect(result).toContain('<ol>');
      expect(result).toContain('<li>First item</li>');
      expect(result).toContain('<li>Second item</li>');
    });

    it('should render blockquotes in HTML', () => {
      const osf = `@slide {
  title: "Quotes";
  > This is a quote
  > Second line
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" render "${testFile}"`, {
        encoding: 'utf8',
      });

      expect(result).toContain('<blockquote>');
      expect(result).toContain('This is a quote');
    });

    it('should render code blocks in HTML', () => {
      const osf = `@slide {
  title: "Code";
  \`\`\`javascript
  console.log("hello");
  \`\`\`
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" render "${testFile}"`, {
        encoding: 'utf8',
      });

      expect(result).toContain('<pre><code');
      expect(result).toContain('language-javascript');
      expect(result).toContain('console.log');
    });

    it('should render strikethrough in HTML', () => {
      const osf = `@slide {
  title: "Pricing";
  ~~$99~~ **$79** today!
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" render "${testFile}"`, {
        encoding: 'utf8',
      });

      expect(result).toContain('<s>$99</s>');
      expect(result).toContain('<strong>$79</strong>');
    });
  });

  describe('HTML Security (XSS Prevention)', () => {
    it('should escape HTML in meta properties', () => {
      const osf = `@meta {
  title: "<script>alert('xss')</script>";
  author: "<img src=x onerror=alert(1)>";
}

@doc { test }`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" render "${testFile}"`, {
        encoding: 'utf8',
      });

      // Verify dangerous tags are escaped
      expect(result).not.toContain('<script>alert');
      expect(result).toContain('&lt;script&gt;');

      // Verify event handlers are escaped (the = sign is escaped as part of attribute)
      expect(result).not.toContain('<img src=x onerror=alert(1)>');
      expect(result).toContain('&lt;img');
    });

    it('should escape HTML in doc content', () => {
      const osf = `@doc {
  # Test
  <script>alert("xss")</script>
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" render "${testFile}"`, {
        encoding: 'utf8',
      });

      expect(result).not.toContain('<script>alert');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should escape HTML in slide content', () => {
      const osf = `@slide {
  title: "XSS Test <script>alert(1)</script>";
  - Item with <b>html</b>
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" render "${testFile}"`, {
        encoding: 'utf8',
      });

      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;b&gt;html&lt;/b&gt;');
    });
  });

  describe('Enhanced Markdown Export', () => {
    it('should export ordered lists to Markdown', () => {
      const osf = `@slide {
  title: "Steps";
  1. First step
  2. Second step
  3. Third step
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" export "${testFile}" --target md`, {
        encoding: 'utf8',
      });

      expect(result).toContain('1. First step');
      expect(result).toContain('2. Second step');
      expect(result).toContain('3. Third step');
    });

    it('should export blockquotes to Markdown', () => {
      const osf = `@slide {
  title: "Quote";
  > This is a quote
  > Multiple lines
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" export "${testFile}" --target md`, {
        encoding: 'utf8',
      });

      expect(result).toContain('> This is a quote');
      expect(result).toContain('> Multiple lines');
    });

    it('should export code blocks to Markdown', () => {
      const osf = `@slide {
  title: "Code";
  \`\`\`python
  def hello():
      print("world")
  \`\`\`
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" export "${testFile}" --target md`, {
        encoding: 'utf8',
      });

      expect(result).toContain('```python');
      expect(result).toContain('def hello()');
      expect(result).toContain('```');
    });

    it('should export strikethrough to Markdown', () => {
      const osf = `@slide {
  title: "Format";
  Text with **bold**, *italic*, __underline__, and ~~strike~~.
}`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      const result = execSync(`node "${CLI_PATH}" export "${testFile}" --target md`, {
        encoding: 'utf8',
      });

      expect(result).toContain('**bold**');
      expect(result).toContain('*italic*');
      expect(result).toContain('__underline__');
      expect(result).toContain('~~strike~~');
    });
  });

  describe('Error Position Tracking', () => {
    it('should show line:column in parse errors', () => {
      const osf = `@meta {\n  title: "Test";\n`;
      const testFile = join(TEST_FIXTURES_DIR, 'test_v11.osf');
      writeFileSync(testFile, osf, 'utf8');

      try {
        execSync(`node "${CLI_PATH}" parse "${testFile}"`, { encoding: 'utf8' });
        expect.fail('Should have thrown error');
      } catch (err: any) {
        const output = (err.stderr || err.stdout) as string;
        expect(output).toMatch(/at \d+:\d+/);
      }
    });
  });
});
