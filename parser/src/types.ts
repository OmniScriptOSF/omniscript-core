export interface MetaBlock {
  type: 'meta';
  props: Record<string, any>;
}

export interface DocBlock {
  type: 'doc';
  content: string;
}

export interface SlideBlock {
  type: 'slide';
  title?: string;
  layout?: string;
  bullets?: string[];
  [key: string]: any;
}

export interface SheetBlock {
  type: 'sheet';
  name?: string;
  cols?: string[];
  data?: Record<string, any>;
  formulas?: { cell: [number, number]; expr: string }[];
  [key: string]: any;
}

export type OSFBlock = MetaBlock | DocBlock | SlideBlock | SheetBlock;

export interface OSFDocument {
  blocks: OSFBlock[];
}
