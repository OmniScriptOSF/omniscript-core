import { OSFDocument } from './parser';

export function serialize(doc: OSFDocument): string {
  return doc.lines.join('\n');
}
