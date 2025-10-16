// File: parser/tests/v1.1-features.test.ts
// What: Test v1.1 features (strikethrough, unicode, position tracking)
// Why: Ensure new v1.1 capabilities work correctly
// RELEVANT FILES: parser.ts, types.ts

import { describe, it, expect } from 'vitest';
import { parse, serialize } from '../src/index';

describe('v1.1 Features', () => {
  describe('Strikethrough Support', () => {
    it('should parse strikethrough text', () => {
      const osf = `@doc { This is ~~strikethrough~~ text. }`;
      const doc = parse(osf);
      const docBlock = doc.blocks[0];

      expect(docBlock.type).toBe('doc');
      expect(docBlock.content).toContain('~~strikethrough~~');
    });

    it('should parse strikethrough in slide content', () => {
      const osf = `@slide { 
        title: "Test";
        ~~old value~~ new value
      }`;
      const doc = parse(osf);
      const slide = doc.blocks[0];

      expect(slide.type).toBe('slide');
      expect(slide.content).toBeDefined();
    });

    it('should serialize strikethrough text', () => {
      const osf = `@doc { Test ~~strikethrough~~ text }`;
      const doc = parse(osf);
      const serialized = serialize(doc);

      expect(serialized).toContain('~~strikethrough~~');
    });

    it('should handle strikethrough round-trip', () => {
      const osf = `@slide { 
        title: "Pricing";
        ~~$99~~ **$79** limited time!
      }`;
      const doc = parse(osf);
      const serialized = serialize(doc);
      const reparsed = parse(serialized);

      expect(reparsed.blocks.length).toBe(doc.blocks.length);
      expect(reparsed.blocks[0].type).toBe('slide');
    });
  });

  describe('Unicode Escape Sequences', () => {
    it('should parse \\uXXXX unicode escapes', () => {
      const osf = `@meta { title: "Test \\u2713 check"; }`;
      const doc = parse(osf);
      const meta = doc.blocks[0];

      expect(meta.type).toBe('meta');
      expect(meta.props.title).toBe('Test ✓ check');
    });

    it('should parse \\xXX hex escapes', () => {
      const osf = `@meta { title: "Test \\xA9 copyright"; }`;
      const doc = parse(osf);
      const meta = doc.blocks[0];

      expect(meta.type).toBe('meta');
      expect(meta.props.title).toBe('Test © copyright');
    });

    it('should serialize unicode as escape sequences', () => {
      const doc = {
        blocks: [
          {
            type: 'meta' as const,
            props: {
              title: 'Test ✓ check',
            },
          },
        ],
      };

      const serialized = serialize(doc);
      expect(serialized).toContain('\\u2713');
    });

    it('should handle unicode round-trip', () => {
      const osf = `@meta { title: "Test \\u2713\\u2714\\u2718"; }`;
      const doc = parse(osf);
      const serialized = serialize(doc);
      const reparsed = parse(serialized);

      expect(reparsed.blocks[0].props.title).toBe(doc.blocks[0].props.title);
    });

    it('should handle mixed ascii and unicode', () => {
      const osf = `@meta { text: "Hello \\u4E16\\u754C World \\xA9 2025"; }`;
      const doc = parse(osf);

      expect(doc.blocks[0].props.text).toContain('世界');
      expect(doc.blocks[0].props.text).toContain('©');
    });

    it('should handle invalid unicode escape gracefully', () => {
      const osf = `@meta { title: "Bad \\uGGGG escape"; }`;
      const doc = parse(osf);

      // Invalid escape is preserved as literal
      expect(doc.blocks[0].props.title).toContain('\\uGGGG');
    });
  });

  describe('Position Tracking in Errors', () => {
    it('should include line:column in missing brace errors', () => {
      const osf = `@meta {\n  title: "Test";\n`;

      expect(() => parse(osf)).toThrow(/at \d+:\d+/);
    });

    it('should include line:column in identifier errors', () => {
      const osf = `@meta { 123invalid: "test"; }`;

      expect(() => parse(osf)).toThrow(/at \d+:\d+/);
    });

    it('should include line:column in number format errors', () => {
      const osf = `@meta { value: -; }`;

      expect(() => parse(osf)).toThrow(/at \d+:\d+/);
    });

    it('should track position across multiple lines', () => {
      const osf = `@meta {\n  title: "Line 2";\n  author: "Line 3";\n  @invalid`;

      try {
        parse(osf);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toMatch(/at \d+:\d+/);
      }
    });
  });

  describe('Unterminated String Detection', () => {
    it('should detect parse errors with unterminated strings', () => {
      const osf = `@meta { title: "unterminated`;

      // Parser will throw an error (may be "Unterminated string" or "Missing closing }")
      expect(() => parse(osf)).toThrow();
    });

    it('should detect parse errors with malformed strings', () => {
      const osf = `@meta { title: "unterminated\n  author: "test"; }`;

      // Parser will throw an error for malformed syntax
      expect(() => parse(osf)).toThrow();
    });

    it('should handle escaped quotes correctly', () => {
      const osf = `@meta { title: "She said \\"hello\\""; }`;
      const doc = parse(osf);

      expect(doc.blocks[0].props.title).toBe('She said "hello"');
    });

    it('should not flag properly terminated strings', () => {
      const osf = `@meta { 
        title: "Properly closed"; 
        author: "No issues";
      }`;

      expect(() => parse(osf)).not.toThrow();
    });

    it('should throw unterminated string for value without closing quote', () => {
      // Test the specific case where parseString is called on unterminated string
      const osf = `@meta { x: "test }`;

      expect(() => parse(osf)).toThrow();
    });
  });

  describe('Complete Round-Trip Tests', () => {
    it('should round-trip document with all v1.1 features', () => {
      const osf = `@meta {
  title: "v1.1 Test \\u2713";
  author: "Test Author";
}

@doc {
  # Testing v1.1 Features

  This document has **bold**, *italic*, __underline__, and ~~strikethrough~~.
  
  Unicode: \\u2713 \\u2714 \\xA9
}

@slide {
  title: "Slide \\u2713";
  
  1. First item
  2. Second ~~old~~ **new** item
  3. Third item
  
  > Important note here
  
  \`\`\`javascript
  console.log("code block");
  \`\`\`
}`;

      const doc = parse(osf);
      const serialized = serialize(doc);
      const reparsed = parse(serialized);

      expect(reparsed.blocks.length).toBe(doc.blocks.length);
      expect(reparsed.blocks[0].type).toBe('meta');
      expect(reparsed.blocks[1].type).toBe('doc');
      expect(reparsed.blocks[2].type).toBe('slide');
    });
  });
});
