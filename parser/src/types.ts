export type OSFValue = string | number | boolean | OSFValue[] | { [key: string]: OSFValue };

export interface MetaBlock {
  type: 'meta';
  props: Record<string, OSFValue>;
}

export interface DocBlock {
  type: 'doc';
  content: string;
}

export interface StyledText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

export type TextRun = string | StyledText | Link | Image;

export interface Paragraph {
  type: 'paragraph';
  content: TextRun[];
}

export interface Link {
  type: 'link';
  text: string;
  url: string;
}

export interface Image {
  type: 'image';
  alt: string;
  url: string;
}

export interface ListItem {
  type: 'list_item';
  content: TextRun[];
}

export interface OrderedList {
  type: 'ordered_list';
  items: ListItem[];
}

export interface UnorderedList {
  type: 'unordered_list';
  items: ListItem[];
}

export interface CodeBlock {
  type: 'code';
  language?: string;
  content: string;
}

export interface Blockquote {
  type: 'blockquote';
  content: Paragraph[];
}

export type ContentBlock = Paragraph | OrderedList | UnorderedList | CodeBlock | Blockquote | Image;

export interface SlideBlock {
  type: 'slide';
  title?: string;
  layout?: string;
  content?: ContentBlock[];
  bullets?: string[];
}

export interface SheetBlock {
  type: 'sheet';
  name?: string;
  cols?: string[];
  data?: Record<string, OSFValue>;
  formulas?: { cell: [number, number]; expr: string }[];
  [key: string]: OSFValue | undefined;
}

export interface ChartDataSeries {
  label: string;
  values: number[];
}

export interface ChartOptions {
  xAxis?: string;
  yAxis?: string;
  legend?: boolean;
  colors?: string[];
}

export interface ChartBlock {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  title: string;
  data: ChartDataSeries[];
  options?: ChartOptions;
}

export interface DiagramBlock {
  type: 'diagram';
  diagramType: 'flowchart' | 'sequence' | 'gantt' | 'mindmap';
  engine: 'mermaid' | 'graphviz';
  code: string;
  title?: string;
}

export interface OSFCodeBlock {
  type: 'osfcode';
  language: string;
  caption?: string;
  lineNumbers?: boolean;
  highlight?: number[];
  code: string;
}

export interface TableCell {
  text: string;
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableBlock {
  type: 'table';
  caption?: string;
  style?: 'bordered' | 'striped' | 'minimal';
  alignment?: ('left' | 'center' | 'right')[];
  headers: string[];
  rows: TableRow[];
}

export type OSFBlock =
  | MetaBlock
  | DocBlock
  | SlideBlock
  | SheetBlock
  | ChartBlock
  | DiagramBlock
  | OSFCodeBlock
  | TableBlock;

export interface IncludeDirective {
  type: 'include';
  path: string;
  resolved?: OSFDocument;
}

export interface ParseOptions {
  resolveIncludes?: boolean;
  basePath?: string;
  maxDepth?: number;
}

export interface OSFDocument {
  version?: string;
  blocks: OSFBlock[];
  includes?: IncludeDirective[];
}
