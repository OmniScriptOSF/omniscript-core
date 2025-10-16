// File: omniscript-core/cli/src/commands/lint.ts
// What: Lint command implementation - validate syntax and schema
// Why: Handle the 'lint' CLI command with JSON schema validation
// Related: osf.ts, parse.ts

import { readFileSync } from 'fs';
import { join } from 'path';
import Ajv from 'ajv';
import { parse } from 'omniscript-parser';
import { loadFile } from '../utils/file-ops';
import { exportJson } from '../renderers';

// Load and compile OSF schema
const schemaPath = join(__dirname, '../../schema/osf.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv();
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
const validateOsf = ajv.compile(schema);

export function lintCommand(fileName: string): void {
  // Basic syntax validation through parsing
  const doc = parse(loadFile(fileName));

  // If parsing succeeds, the document is syntactically valid
  if (doc.blocks.length === 0) {
    console.log('⚠️  Warning: Document contains no blocks');
  }

  // Schema validation
  const obj = exportJson(doc);
  const parsed = JSON.parse(obj);
  if (!validateOsf(parsed)) {
    console.error('❌ Lint failed: Schema validation errors');
    console.error(ajv.errorsText(validateOsf.errors || undefined));
    process.exit(1);
  }

  console.log('✅ Lint passed: Document syntax and schema are valid');
}
