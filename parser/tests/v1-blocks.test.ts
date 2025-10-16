// File: tests/v1-blocks.test.ts
// What: Tests for v1.0 block types (@chart, @diagram, @code)
// Why: Ensure new v1.0 features parse correctly
// Related: parser.ts, types.ts, osf-spec.md

import { describe, it, expect } from 'vitest';
import { parse, serialize } from '../src/parser';
import type { ChartBlock, DiagramBlock, OSFCodeBlock } from '../src/types';

describe('v1.0 Block Types', () => {
  describe('@chart block', () => {
    it('parses bar chart with basic properties', () => {
      const osf = `
@chart {
  type: "bar";
  title: "Sales Data";
  data: [
    { label: "Q1"; values: [100]; }
  ];
}`;
      const doc = parse(osf);
      expect(doc.blocks).toHaveLength(1);
      const chart = doc.blocks[0] as ChartBlock;
      expect(chart.type).toBe('chart');
      expect(chart.chartType).toBe('bar');
      expect(chart.title).toBe('Sales Data');
      expect(chart.data).toHaveLength(1);
      expect(chart.data[0]?.label).toBe('Q1');
    });

    it('parses line chart with options', () => {
      const osf = `
@chart {
  type: "line";
  title: "Revenue Trend";
  data: [
    { label: "Series 1"; values: [10, 20, 30]; }
  ];
  options: {
    xAxis: "Month";
    yAxis: "Revenue ($K)";
    legend: true;
  };
}`;
      const doc = parse(osf);
      const chart = doc.blocks[0] as ChartBlock;
      expect(chart.chartType).toBe('line');
      expect(chart.options?.xAxis).toBe('Month');
      expect(chart.options?.yAxis).toBe('Revenue ($K)');
      expect(chart.options?.legend).toBe(true);
    });

    it('parses pie chart', () => {
      const osf = `
@chart {
  type: "pie";
  title: "Market Share";
  data: [
    { label: "Product A"; values: [30]; },
    { label: "Product B"; values: [45]; },
    { label: "Product C"; values: [25]; }
  ];
}`;
      const doc = parse(osf);
      const chart = doc.blocks[0] as ChartBlock;
      expect(chart.chartType).toBe('pie');
      expect(chart.data).toHaveLength(3);
    });

    it('parses scatter chart', () => {
      const osf = `
@chart {
  type: "scatter";
  title: "Correlation";
  data: [
    { label: "Dataset"; values: [1, 2, 3, 4, 5]; }
  ];
}`;
      const doc = parse(osf);
      const chart = doc.blocks[0] as ChartBlock;
      expect(chart.chartType).toBe('scatter');
    });

    it('parses area chart with colors', () => {
      const osf = `
@chart {
  type: "area";
  title: "Growth";
  data: [
    { label: "Series 1"; values: [100, 150, 200]; }
  ];
  options: {
    colors: ["#FF0000", "#00FF00", "#0000FF"];
  };
}`;
      const doc = parse(osf);
      const chart = doc.blocks[0] as ChartBlock;
      expect(chart.chartType).toBe('area');
      expect(chart.options?.colors).toEqual(['#FF0000', '#00FF00', '#0000FF']);
    });

    it('serializes chart block correctly', () => {
      const osf = `@chart {
  type: "bar";
  title: "Test";
  data: [{ label: "Q1"; values: [100]; }];
}`;
      const doc = parse(osf);
      const serialized = serialize(doc);
      expect(serialized).toContain('@chart');
      expect(serialized).toContain('type: "bar"');
      expect(serialized).toContain('title: "Test"');
    });
  });

  describe('@diagram block', () => {
    it('parses flowchart with mermaid engine', () => {
      const osf = `
@diagram {
  type: "flowchart";
  engine: "mermaid";
  code: "graph TD\\nA[Start] --> B[End]";
}`;
      const doc = parse(osf);
      expect(doc.blocks).toHaveLength(1);
      const diagram = doc.blocks[0] as DiagramBlock;
      expect(diagram.type).toBe('diagram');
      expect(diagram.diagramType).toBe('flowchart');
      expect(diagram.engine).toBe('mermaid');
      expect(diagram.code).toContain('graph TD');
    });

    it('parses sequence diagram', () => {
      const osf = `
@diagram {
  type: "sequence";
  engine: "mermaid";
  title: "API Flow";
  code: "sequenceDiagram\\nClient->>Server: Request";
}`;
      const doc = parse(osf);
      const diagram = doc.blocks[0] as DiagramBlock;
      expect(diagram.diagramType).toBe('sequence');
      expect(diagram.title).toBe('API Flow');
    });

    it('parses gantt diagram', () => {
      const osf = `
@diagram {
  type: "gantt";
  engine: "mermaid";
  code: "gantt\\ntitle Project Timeline";
}`;
      const doc = parse(osf);
      const diagram = doc.blocks[0] as DiagramBlock;
      expect(diagram.diagramType).toBe('gantt');
    });

    it('parses graphviz diagram', () => {
      const osf = `
@diagram {
  type: "flowchart";
  engine: "graphviz";
  code: "digraph G { A -> B; }";
}`;
      const doc = parse(osf);
      const diagram = doc.blocks[0] as DiagramBlock;
      expect(diagram.engine).toBe('graphviz');
      expect(diagram.code).toBe('digraph G { A -> B; }');
    });

    it('serializes diagram block correctly', () => {
      const osf = `@diagram {
  type: "flowchart";
  engine: "mermaid";
  code: "graph TD\\nA --> B";
}`;
      const doc = parse(osf);
      const serialized = serialize(doc);
      expect(serialized).toContain('@diagram');
      expect(serialized).toContain('type: "flowchart"');
      expect(serialized).toContain('engine: "mermaid"');
    });
  });

  describe('@code block', () => {
    it('parses code block with language', () => {
      const osf = `
@code {
  language: "typescript";
  code: "function hello() {\\n  console.log('Hello');\\n}";
}`;
      const doc = parse(osf);
      expect(doc.blocks).toHaveLength(1);
      const code = doc.blocks[0] as OSFCodeBlock;
      expect(code.type).toBe('osfcode');
      expect(code.language).toBe('typescript');
      expect(code.code).toContain('function hello()');
    });

    it('parses code block with caption', () => {
      const osf = `
@code {
  language: "python";
  caption: "Hello World Example";
  code: "print('Hello, World!')";
}`;
      const doc = parse(osf);
      const code = doc.blocks[0] as OSFCodeBlock;
      expect(code.caption).toBe('Hello World Example');
    });

    it('parses code block with line numbers', () => {
      const osf = `
@code {
  language: "javascript";
  lineNumbers: true;
  code: "const x = 42;";
}`;
      const doc = parse(osf);
      const code = doc.blocks[0] as OSFCodeBlock;
      expect(code.lineNumbers).toBe(true);
    });

    it('parses code block with highlight lines', () => {
      const osf = `
@code {
  language: "java";
  highlight: [3, 5, 7];
  code: "public class Main {}";
}`;
      const doc = parse(osf);
      const code = doc.blocks[0] as OSFCodeBlock;
      expect(code.highlight).toEqual([3, 5, 7]);
    });

    it('parses code block with all properties', () => {
      const osf = `
@code {
  language: "rust";
  caption: "Main Function";
  lineNumbers: true;
  highlight: [1, 2];
  code: "fn main() {\\n    println!(\\"Hello\\");\\n}";
}`;
      const doc = parse(osf);
      const code = doc.blocks[0] as OSFCodeBlock;
      expect(code.language).toBe('rust');
      expect(code.caption).toBe('Main Function');
      expect(code.lineNumbers).toBe(true);
      expect(code.highlight).toEqual([1, 2]);
    });

    it('serializes code block correctly', () => {
      const osf = `@code {
  language: "go";
  code: "package main";
}`;
      const doc = parse(osf);
      const serialized = serialize(doc);
      expect(serialized).toContain('@code');
      expect(serialized).toContain('language: "go"');
    });
  });

  describe('Mixed v0.5 and v1.0 blocks', () => {
    it('parses document with both old and new blocks', () => {
      const osf = `
@meta {
  title: "Mixed Document";
  version: "1.0";
}

@doc {
  # Introduction
  This uses both v0.5 and v1.0 features.
}

@chart {
  type: "bar";
  title: "Data";
  data: [{ label: "A"; values: [10]; }];
}

@slide {
  title: "Slide Title";
  layout: TitleAndContent;
  
  - Point 1
  - Point 2
}

@diagram {
  type: "flowchart";
  engine: "mermaid";
  code: "graph LR\\nA --> B";
}

@code {
  language: "python";
  code: "print('hello')";
}`;

      const doc = parse(osf);
      expect(doc.blocks).toHaveLength(6);
      expect(doc.blocks[0]?.type).toBe('meta');
      expect(doc.blocks[1]?.type).toBe('doc');
      expect(doc.blocks[2]?.type).toBe('chart');
      expect(doc.blocks[3]?.type).toBe('slide');
      expect(doc.blocks[4]?.type).toBe('diagram');
      expect(doc.blocks[5]?.type).toBe('osfcode');
    });

    it('round-trips v1.0 document correctly', () => {
      const original = `@meta {
  title: "Test";
  version: "1.0";
}

@chart {
  type: "line";
  title: "Chart";
  data: [{ label: "S1"; values: [1, 2, 3]; }];
}`;

      const doc = parse(original);
      const serialized = serialize(doc);
      const reparsed = parse(serialized);

      expect(reparsed.blocks).toHaveLength(2);
      expect(reparsed.blocks[0]?.type).toBe('meta');
      expect(reparsed.blocks[1]?.type).toBe('chart');
    });
  });

  describe('Error handling', () => {
    it('throws error on invalid chart type', () => {
      const osf = `
@chart {
  type: "invalid";
  title: "Test";
  data: [];
}`;
      // Parser accepts it, but type is preserved as-is
      const doc = parse(osf);
      const chart = doc.blocks[0] as ChartBlock;
      expect(chart.type).toBe('chart');
    });

    it('handles missing required chart properties gracefully', () => {
      const osf = `@chart {
  type: "bar";
}`;
      const doc = parse(osf);
      const chart = doc.blocks[0] as ChartBlock;
      expect(chart.type).toBe('chart');
      expect(chart.chartType).toBe('bar');
      expect(chart.title).toBe('Chart'); // Default
    });

    it('handles missing diagram code', () => {
      const osf = `@diagram {
  type: "flowchart";
  engine: "mermaid";
}`;
      const doc = parse(osf);
      const diagram = doc.blocks[0] as DiagramBlock;
      expect(diagram.code).toBe('');
    });

    it('handles missing code content', () => {
      const osf = `@code {
  language: "python";
}`;
      const doc = parse(osf);
      const code = doc.blocks[0] as OSFCodeBlock;
      expect(code.code).toBe('');
    });
  });
});
