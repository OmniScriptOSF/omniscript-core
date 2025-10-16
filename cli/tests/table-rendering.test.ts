// File: tests/table-rendering.test.ts
// What: Tests for @table block rendering in CLI
// Why: Ensure tables render correctly in HTML and other formats
// Related: renderers/html.ts

import { describe, it, expect } from 'vitest';
import { parse } from 'omniscript-parser';
import { renderHtml } from '../src/renderers';

describe('@table HTML rendering', () => {
  it('should render basic table to HTML', () => {
    const osf = `@table {
  | Name | Age |
  | --- | --- |
  | John | 30 |
  | Jane | 25 |
}`;
    
    const doc = parse(osf);
    const html = renderHtml(doc);
    
    expect(html).toContain('<table');
    expect(html).toContain('<thead>');
    expect(html).toContain('<tbody>');
    expect(html).toContain('Name');
    expect(html).toContain('Age');
    expect(html).toContain('John');
    expect(html).toContain('30');
    expect(html).toContain('Jane');
    expect(html).toContain('25');
  });
  
  it('should render table with caption', () => {
    const osf = `@table {
  caption: "User Data";
  
  | Name | Age |
  | --- | --- |
  | John | 30 |
}`;
    
    const doc = parse(osf);
    const html = renderHtml(doc);
    
    expect(html).toContain('User Data');
    expect(html).toContain('<strong>User Data</strong>');
  });
  
  it('should render table with alignment', () => {
    const osf = `@table {
  alignment: ["left", "right", "center"];
  
  | Name | Age | Status |
  | --- | --- | --- |
  | John | 30 | Active |
}`;
    
    const doc = parse(osf);
    const html = renderHtml(doc);
    
    expect(html).toContain('text-align: left');
    expect(html).toContain('text-align: right');
    expect(html).toContain('text-align: center');
  });
  
  it('should escape HTML in table cells', () => {
    const osf = `@table {
  | Name | Note |
  | --- | --- |
  | Test & Co. | <script>alert("XSS")</script> |
}`;
    
    const doc = parse(osf);
    const html = renderHtml(doc);
    
    expect(html).toContain('Test &amp; Co.');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert');
  });
  
  it('should render table with style class', () => {
    const osf = `@table {
  style: "bordered";
  
  | Name | Age |
  | --- | --- |
  | John | 30 |
}`;
    
    const doc = parse(osf);
    const html = renderHtml(doc);
    
    expect(html).toContain('class="table-bordered"');
  });
});
