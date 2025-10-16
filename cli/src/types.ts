// File: cli/src/types.ts
// What: Type definitions for CLI rendering options
// Why: Centralize types to avoid 'any' and improve type safety
// Related: osf.ts, render/converters.ts

export interface RenderOptions {
  theme?: string;
  output?: string;
  [key: string]: unknown;
}

export interface FormulaCell {
  row: number;
  col: number;
  formula: string;
  deps: Set<string>;
}
