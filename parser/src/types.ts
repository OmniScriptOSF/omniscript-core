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
