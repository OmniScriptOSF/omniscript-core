import { describe, it, expect } from 'vitest';
import { parse, serialize } from '../src/parser';
import { OSFDocument, SlideBlock } from '../src/types';

describe('OSF Parser', () => {
  describe('parse', () => {
    it('should parse a slide with all content types', () => {
      const input =
        '@slide {\n' +
        '  title: "Comprehensive Slide";\n\n' +
        '  This is a paragraph with **bold**, *italic*, and __underlined__ text.\n\n' +
        '  - Unordered item 1\n' +
        '  - Unordered item 2\n\n' +
        '  1. Ordered item 1\n' +
        '  2. Ordered item 2\n\n' +
        '  > This is a blockquote.\n\n' +
        '  ```javascript\n' +
        '  console.log("Hello, World!");\n' +
        '  ```\n\n' +
        '  ![An image alt text](https://example.com/image.png)\n\n' +
        '  [A link to somewhere](https://example.com)\n' +
        '}';

      const result = parse(input);

      expect(result.blocks).toHaveLength(1);
      const slide = result.blocks[0] as SlideBlock;

      expect(slide.title).toBe('Comprehensive Slide');
      expect(slide.content).toBeDefined();
      expect(slide.content).toHaveLength(7);

      // Paragraph
      expect(slide.content?.[0].type).toBe('paragraph');

      // Unordered List
      expect(slide.content?.[1].type).toBe('unordered_list');

      // Ordered List
      expect(slide.content?.[2].type).toBe('ordered_list');

      // Blockquote
      expect(slide.content?.[3].type).toBe('blockquote');

      // Code Block
      expect(slide.content?.[4].type).toBe('code');

      // Image
      expect(slide.content?.[5].type).toBe('image');

      // Paragraph with link
      expect(slide.content?.[6].type).toBe('paragraph');
    });
  });

  describe('serialize', () => {
    it('should serialize a slide with all content types', () => {
      const doc: OSFDocument = {
        blocks: [
          {
            type: 'slide',
            title: 'Comprehensive Slide',
            content: [
              {
                type: 'paragraph',
                content: [
                  { text: 'A paragraph with ', bold: false, italic: false, underline: false },
                  { text: 'bold', bold: true, italic: false, underline: false },
                  { text: ', ', bold: false, italic: false, underline: false },
                  { text: 'italic', bold: false, italic: true, underline: false },
                  { text: ', and ', bold: false, italic: false, underline: false },
                  { text: 'underlined', bold: false, italic: false, underline: true },
                  { text: ' text.', bold: false, italic: false, underline: false },
                ],
              },
              {
                type: 'unordered_list',
                items: [
                  { type: 'list_item', content: [{ text: 'Unordered item 1' }] },
                  { type: 'list_item', content: [{ text: 'Unordered item 2' }] },
                ],
              },
              {
                type: 'ordered_list',
                items: [
                  { type: 'list_item', content: [{ text: 'Ordered item 1' }] },
                  { type: 'list_item', content: [{ text: 'Ordered item 2' }] },
                ],
              },
              {
                type: 'blockquote',
                content: [{ type: 'paragraph', content: [{ text: 'This is a blockquote.' }] }],
              },
              {
                type: 'code',
                language: 'javascript',
                content: 'console.log("Hello, World!");',
              },
              {
                type: 'image',
                alt: 'An image alt text',
                url: 'https://example.com/image.png',
              },
              {
                type: 'paragraph',
                content: [
                  { type: 'link', text: 'A link to somewhere', url: 'https://example.com' },
                ],
              },
            ],
          } as SlideBlock,
        ],
      };

      const result = serialize(doc);

      expect(result).toContain('@slide {\n  title: "Comprehensive Slide";');
      expect(result).toContain('A paragraph with **bold**, *italic*, and __underlined__ text.');
      expect(result).toContain('- Unordered item 1');
      expect(result).toContain('1. Ordered item 1');
      expect(result).toContain('> This is a blockquote.');
      expect(result).toContain('```javascript');
      expect(result).toContain('![An image alt text](https://example.com/image.png)');
      expect(result).toContain('[A link to somewhere](https://example.com)');
    });
  });

  describe('round-trip parsing', () => {
    it('should maintain consistency through parse-serialize-parse cycle', () => {
      const original =
        '@slide {\n' +
        '  title: "Round Trip Test";\n\n' +
        '  A paragraph with **bold** and *italic*.\n\n' +
        '  - Item 1\n' +
        '  - Item 2\n\n' +
        '  1. First\n' +
        '  2. Second\n\n' +
        '  > A quote\n\n' +
        '  ```\n' +
        '  some code\n' +
        '  ```\n\n' +
        '  ![alt](url)\n\n' +
        '  [link](url)\n' +
        '}';

      const parsed1 = parse(original);
      const serialized = serialize(parsed1);
      const parsed2 = parse(serialized);

      expect(JSON.stringify(parsed2)).toBe(JSON.stringify(parsed1));
    });
  });
});
