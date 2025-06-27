export type OSFValue = string | number | boolean | OSFValue[] | { [key: string]: OSFValue };

export interface MetaBlock {
  type: 'meta';
  props: Record<string, OSFValue>;
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
  [key: string]: OSFValue | undefined;
}

export interface SheetBlock {
  type: 'sheet';
  name?: string;
  cols?: string[];
  data?: Record<string, OSFValue>;
  formulas?: { cell: [number, number]; expr: string }[];
  [key: string]: OSFValue | undefined;
}

export type OSFBlock = MetaBlock | DocBlock | SlideBlock | SheetBlock;

export interface OSFDocument {
  blocks: OSFBlock[];
}
