// File: omniscript-core/cli/src/commands/render.ts
// What: Render command implementation - convert OSF to various formats
// Why: Handle the 'render' CLI command with multiple output formats
// Related: osf.ts, renderers/*.ts

import { writeFileSync } from 'fs';
import { parse, ParseOptions } from 'omniscript-parser';
import { ConverterOptions } from 'omniscript-converters';
import { loadFile, saveFile } from '../utils/file-ops';
import { renderHtml, renderPdf, renderDocx, renderPptx, renderXlsx } from '../renderers';

export async function renderCommand(
  file: string,
  format: string = 'html',
  outputFile?: string,
  theme: string = 'default',
  options: ParseOptions = {}
): Promise<void> {
  const doc = parse(loadFile(file), options);

  switch (format) {
    case 'html': {
      const htmlOutput = renderHtml(doc);
      if (outputFile) {
        saveFile(outputFile, htmlOutput);
      } else {
        console.log(htmlOutput);
      }
      break;
    }
    case 'pdf': {
      const pdfBuffer = await renderPdf(doc, { theme } as ConverterOptions);
      if (outputFile) {
        writeFileSync(outputFile, pdfBuffer);
        console.log(`PDF written to ${outputFile}`);
      } else {
        process.stdout.write(pdfBuffer);
      }
      break;
    }
    case 'docx': {
      const docxBuffer = await renderDocx(doc, { theme } as ConverterOptions);
      if (outputFile) {
        writeFileSync(outputFile, docxBuffer);
        console.log(`DOCX written to ${outputFile}`);
      } else {
        process.stdout.write(docxBuffer);
      }
      break;
    }
    case 'pptx': {
      const pptxBuffer = await renderPptx(doc, { theme } as ConverterOptions);
      if (outputFile) {
        writeFileSync(outputFile, pptxBuffer);
        console.log(`PPTX written to ${outputFile}`);
      } else {
        process.stdout.write(pptxBuffer);
      }
      break;
    }
    case 'xlsx': {
      const xlsxBuffer = await renderXlsx(doc, { theme } as ConverterOptions);
      if (outputFile) {
        writeFileSync(outputFile, xlsxBuffer);
        console.log(`XLSX written to ${outputFile}`);
      } else {
        process.stdout.write(xlsxBuffer);
      }
      break;
    }
    default:
      throw new Error(`Unknown format: ${format}. Supported: html, pdf, docx, pptx, xlsx`);
  }
}
