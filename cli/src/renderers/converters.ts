// File: omniscript-core/cli/src/renderers/converters.ts
// What: Bridge to omniscript-converters for PDF/DOCX/PPTX/XLSX rendering
// Why: Provide clean interface to external converter library
// Related: commands/render.ts

import { OSFDocument } from 'omniscript-parser';
import {
  PDFConverter,
  DOCXConverter,
  PPTXConverter,
  XLSXConverter,
  ConverterOptions,
} from 'omniscript-converters';

// Advanced format renderers using omniscript-converters
export async function renderPdf(doc: OSFDocument, options?: ConverterOptions): Promise<Buffer> {
  const converter = new PDFConverter();
  const result = await converter.convert(doc, options || {});
  return result.buffer;
}

export async function renderDocx(doc: OSFDocument, options?: ConverterOptions): Promise<Buffer> {
  const converter = new DOCXConverter();
  const result = await converter.convert(doc, options || {});
  return result.buffer;
}

export async function renderPptx(doc: OSFDocument, options?: ConverterOptions): Promise<Buffer> {
  const converter = new PPTXConverter();
  const result = await converter.convert(doc, options || {});
  return result.buffer;
}

export async function renderXlsx(doc: OSFDocument, options?: ConverterOptions): Promise<Buffer> {
  const converter = new XLSXConverter();
  const result = await converter.convert(doc, options || {});
  return result.buffer;
}
