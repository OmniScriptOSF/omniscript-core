import { describe, it, expect } from 'vitest';
import { parse, serialize } from '../src/parser';
import { OSFDocument, MetaBlock, DocBlock, SlideBlock, SheetBlock } from '../src/types';

describe('OSF Parser', () => {
  describe('parse', () => {
    it('should parse a simple meta block', () => {
      const input = `@meta {
        title: "Test Document";
        author: "Test Author";
        date: "2025-01-01";
      }`;

      const result = parse(input);

      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0]?.type).toBe('meta');

      const metaBlock = result.blocks[0] as MetaBlock;
      expect(metaBlock.props.title).toBe('Test Document');
      expect(metaBlock.props.author).toBe('Test Author');
      expect(metaBlock.props.date).toBe('2025-01-01');
    });

    it('should parse a doc block', () => {
      const input = `@doc {
        # Test Document
        This is a test document with **bold** text.
      }`;

      const result = parse(input);

      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0]?.type).toBe('doc');

      const docBlock = result.blocks[0] as DocBlock;
      expect(docBlock.content).toContain('# Test Document');
      expect(docBlock.content).toContain('**bold**');
    });

    it('should parse a slide block with bullets', () => {
      const input = `@slide {
        title: "Test Slide";
        layout: TitleAndBullets;
        bullets {
          "First bullet";
          "Second bullet";
          "Third bullet";
        }
      }`;

      const result = parse(input);

      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0]?.type).toBe('slide');

      const slideBlock = result.blocks[0] as SlideBlock;
      expect(slideBlock.title).toBe('Test Slide');
      expect(slideBlock.layout).toBe('TitleAndBullets');
      expect(slideBlock.bullets).toEqual(['First bullet', 'Second bullet', 'Third bullet']);
    });

    it('should parse a sheet block with data and formulas', () => {
      const input = `@sheet {
        name: "TestSheet";
        cols: [Column1, Column2, Column3];
        data {
          (1,1) = "A1";
          (1,2) = 100;
          (2,1) = "A2";
          (2,2) = 200;
        }
        formula (1,3): "=B1*2";
        formula (2,3): "=B2*2";
      }`;

      const result = parse(input);

      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0]?.type).toBe('sheet');

      const sheetBlock = result.blocks[0] as SheetBlock;
      expect(sheetBlock.name).toBe('TestSheet');
      expect(sheetBlock.cols).toEqual(['Column1', 'Column2', 'Column3']);
      expect(sheetBlock.data).toEqual({
        '1,1': 'A1',
        '1,2': 100,
        '2,1': 'A2',
        '2,2': 200,
      });
      expect(sheetBlock.formulas).toEqual([
        { cell: [1, 3], expr: '=B1*2' },
        { cell: [2, 3], expr: '=B2*2' },
      ]);
    });

    it('should parse multiple blocks', () => {
      const input = `@meta {
        title: "Multi-block Document";
      }
      
      @doc {
        This is the document content.
      }
      
      @slide {
        title: "Slide Title";
      }`;

      const result = parse(input);

      expect(result.blocks).toHaveLength(3);
      expect(result.blocks[0]?.type).toBe('meta');
      expect(result.blocks[1]?.type).toBe('doc');
      expect(result.blocks[2]?.type).toBe('slide');
    });

    it('should handle comments in blocks', () => {
      const input = `@meta {
        // This is a comment
        title: "Test"; // Another comment
        author: "Author";
      }`;

      const result = parse(input);

      expect(result.blocks).toHaveLength(1);
      const metaBlock = result.blocks[0] as MetaBlock;
      expect(metaBlock.props.title).toBe('Test');
      expect(metaBlock.props.author).toBe('Author');
    });

    it('should throw error for malformed blocks', () => {
      const input = `@meta {
        title: "Test"
        // Missing closing brace`;

      expect(() => parse(input)).toThrow('Missing closing } for block meta');
    });

    it('should handle empty blocks', () => {
      const input = `@doc {}`;

      const result = parse(input);

      expect(result.blocks).toHaveLength(1);
      const docBlock = result.blocks[0] as DocBlock;
      expect(docBlock.content).toBe('');
    });
  });

  describe('serialize', () => {
    it('should serialize a meta block', () => {
      const doc: OSFDocument = {
        blocks: [
          {
            type: 'meta',
            props: {
              title: 'Test Document',
              author: 'Test Author',
              date: '2025-01-01',
            },
          } as MetaBlock,
        ],
      };

      const result = serialize(doc);

      expect(result).toContain('@meta {');
      expect(result).toContain('title: "Test Document";');
      expect(result).toContain('author: "Test Author";');
      expect(result).toContain('date: "2025-01-01";');
    });

    it('should serialize a doc block', () => {
      const doc: OSFDocument = {
        blocks: [
          {
            type: 'doc',
            content: '# Test\nThis is content.',
          } as DocBlock,
        ],
      };

      const result = serialize(doc);

      expect(result).toContain('@doc {');
      expect(result).toContain('# Test\nThis is content.');
    });

    it('should serialize a slide block with bullets', () => {
      const doc: OSFDocument = {
        blocks: [
          {
            type: 'slide',
            title: 'Test Slide',
            layout: 'TitleAndBullets',
            bullets: ['First', 'Second'],
          } as SlideBlock,
        ],
      };

      const result = serialize(doc);

      expect(result).toContain('@slide {');
      expect(result).toContain('title: "Test Slide";');
      expect(result).toContain('layout: "TitleAndBullets";');
      expect(result).toContain('bullets {');
      expect(result).toContain('"First";');
      expect(result).toContain('"Second";');
    });

    it('should serialize a sheet block', () => {
      const doc: OSFDocument = {
        blocks: [
          {
            type: 'sheet',
            name: 'TestSheet',
            cols: ['A', 'B'],
            data: {
              '1,1': 'Value1',
              '1,2': 100,
            },
            formulas: [{ cell: [1, 3], expr: '=A1+B1' }],
          } as SheetBlock,
        ],
      };

      const result = serialize(doc);

      expect(result).toContain('@sheet {');
      expect(result).toContain('name: "TestSheet";');
      expect(result).toContain('cols: ["A", "B"];');
      expect(result).toContain('data {');
      expect(result).toContain('(1,1) = "Value1";');
      expect(result).toContain('(1,2) = 100;');
      expect(result).toContain('formula (1,3): "=A1+B1";');
    });
  });

  describe('round-trip parsing', () => {
    it('should maintain consistency through parse-serialize-parse cycle', () => {
      const original = `@meta {
  title: "Round Trip Test";
  author: "Tester";
}

@doc {
# Test Document
This is **test** content.
}

@slide {
  title: "Test Slide";
  bullets {
    "Item 1";
    "Item 2";
  }
}

@sheet {
  name: "Data";
  cols: ["Col1", "Col2"];
  data {
    (1,1) = "A";
    (1,2) = 100;
  }
  formula (1,3): "=B1*2";
}`;

      const parsed1 = parse(original);
      const serialized = serialize(parsed1);
      const parsed2 = parse(serialized);

      expect(parsed2.blocks).toHaveLength(parsed1.blocks.length);
      expect(JSON.stringify(parsed2)).toBe(JSON.stringify(parsed1));
    });
  });
});
