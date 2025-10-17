// File: tests/table.test.ts
// What: Comprehensive tests for @table block
// Why: Ensure table parsing, serialization, and rendering work correctly
// Related: block-parsers/table.ts, serializers/table.ts

import { describe, it, expect } from 'vitest';
import { parse, serialize } from '../src/parser';
import type { TableBlock } from '../src/types';

describe('@table block', () => {
  it('should parse basic table', () => {
    const osf = `@table {
  | Name | Age |
  | --- | --- |
  | John | 30  |
  | Jane | 25  |
}`;

    const doc = parse(osf);
    expect(doc.blocks).toHaveLength(1);
    expect(doc.blocks[0]?.type).toBe('table');

    const table = doc.blocks[0] as TableBlock;
    expect(table.headers).toEqual(['Name', 'Age']);
    expect(table.rows).toHaveLength(2);
    expect(table.rows[0]?.cells[0]?.text).toBe('John');
    expect(table.rows[0]?.cells[1]?.text).toBe('30');
    expect(table.rows[1]?.cells[0]?.text).toBe('Jane');
    expect(table.rows[1]?.cells[1]?.text).toBe('25');
  });

  it('should parse table with caption', () => {
    const osf = `@table {
  caption: "User Data";
  
  | Name | Age |
  | --- | --- |
  | John | 30  |
}`;

    const doc = parse(osf);
    const table = doc.blocks[0] as TableBlock;
    expect(table.caption).toBe('User Data');
    expect(table.headers).toEqual(['Name', 'Age']);
    expect(table.rows).toHaveLength(1);
  });

  it('should parse table with style', () => {
    const osf = `@table {
  style: "bordered";
  
  | Name | Age |
  | --- | --- |
  | John | 30  |
}`;

    const doc = parse(osf);
    const table = doc.blocks[0] as TableBlock;
    expect(table.style).toBe('bordered');
  });

  it('should parse table with alignment', () => {
    const osf = `@table {
  alignment: ["left", "right", "center"];
  
  | Name | Age | Status |
  | --- | --- | --- |
  | John | 30  | Active |
}`;

    const doc = parse(osf);
    const table = doc.blocks[0] as TableBlock;
    expect(table.alignment).toEqual(['left', 'right', 'center']);
  });

  it('should parse table with all properties', () => {
    const osf = `@table {
  caption: "Sales Report";
  style: "striped";
  alignment: ["left", "right"];
  
  | Region | Revenue |
  | --- | --- |
  | North | $100,000 |
  | South | $85,000 |
}`;

    const doc = parse(osf);
    const table = doc.blocks[0] as TableBlock;
    expect(table.caption).toBe('Sales Report');
    expect(table.style).toBe('striped');
    expect(table.alignment).toEqual(['left', 'right']);
    expect(table.headers).toEqual(['Region', 'Revenue']);
    expect(table.rows).toHaveLength(2);
  });

  it('should parse table with special characters', () => {
    const osf = `@table {
  | Name | Note |
  | --- | --- |
  | Test & Co. | "Quoted text" |
}`;

    const doc = parse(osf);
    const table = doc.blocks[0] as TableBlock;
    expect(table.rows[0]?.cells[0]?.text).toBe('Test & Co.');
    expect(table.rows[0]?.cells[1]?.text).toBe('"Quoted text"');
  });

  it('should serialize table correctly', () => {
    const osf = `@table {
  | Name | Age |
  | --- | --- |
  | John | 30 |
  | Jane | 25 |
}`;

    const doc = parse(osf);
    const serialized = serialize(doc);
    expect(serialized).toContain('@table');
    expect(serialized).toContain('| Name | Age |');
    expect(serialized).toContain('| John | 30 |');
    expect(serialized).toContain('| Jane | 25 |');
  });

  it('should round-trip table with caption', () => {
    const osf = `@table {
  caption: "Test Table";
  
  | A | B |
  | --- | --- |
  | 1 | 2 |
}`;

    const doc = parse(osf);
    const serialized = serialize(doc);
    const doc2 = parse(serialized);

    const table1 = doc.blocks[0] as TableBlock;
    const table2 = doc2.blocks[0] as TableBlock;

    expect(table2.caption).toBe(table1.caption);
    expect(table2.headers).toEqual(table1.headers);
    expect(table2.rows.length).toBe(table1.rows.length);
  });

  it('should handle empty cells', () => {
    const osf = `@table {
  | Name | Age | City |
  | --- | --- | --- |
  | John | 30 |  |
  |  | 25 | NYC |
}`;

    const doc = parse(osf);
    const table = doc.blocks[0] as TableBlock;
    expect(table.rows[0]?.cells[2]?.text).toBe('');
    expect(table.rows[1]?.cells[0]?.text).toBe('');
  });

  it('should throw error for table without separator', () => {
    const osf = `@table {
  | Name | Age |
}`;

    expect(() => parse(osf)).toThrow('Table must have at least header and separator rows');
  });

  it('should parse multiple columns', () => {
    const osf = `@table {
  | A | B | C | D | E |
  | --- | --- | --- | --- | --- |
  | 1 | 2 | 3 | 4 | 5 |
  | 6 | 7 | 8 | 9 | 10 |
}`;

    const doc = parse(osf);
    const table = doc.blocks[0] as TableBlock;
    expect(table.headers).toHaveLength(5);
    expect(table.rows[0]?.cells).toHaveLength(5);
    expect(table.rows[1]?.cells).toHaveLength(5);
  });
});
