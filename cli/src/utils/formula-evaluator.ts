// File: omniscript-core/cli/src/utils/formula-evaluator.ts
// What: Spreadsheet formula evaluation engine
// Why: Calculate cell values based on formulas with circular reference detection
// Related: renderers/html.ts, renderers/markdown.ts, renderers/json.ts

import { FormulaDefinition, CellValue, SpreadsheetData } from '../types';

// Formula evaluator for spreadsheet calculations
export class FormulaEvaluator {
  private data: SpreadsheetData;
  private formulas: Map<string, string>;
  private computed: Map<string, CellValue>;
  private evaluating: Set<string>; // For circular reference detection

  constructor(data: SpreadsheetData, formulas: FormulaDefinition[]) {
    this.data = { ...data };
    this.formulas = new Map();
    this.computed = new Map();
    this.evaluating = new Set();

    // Convert formulas to map with string keys
    for (const formula of formulas) {
      const key = `${formula.cell[0]},${formula.cell[1]}`;
      this.formulas.set(key, formula.expr);
    }
  }

  // Convert cell reference (like "A1", "B2") to row,col coordinates
  private cellRefToCoords(cellRef: string): [number, number] {
    const match = cellRef.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid cell reference: ${cellRef}`);
    }

    const colStr = match[1];
    const rowStr = match[2];

    if (!colStr || !rowStr) {
      throw new Error(`Invalid cell reference: ${cellRef}`);
    }

    // Convert column letters to number (A=1, B=2, ..., Z=26, AA=27, etc.)
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64); // A=1, B=2, etc.
    }

    const row = parseInt(rowStr, 10);
    return [row, col];
  }

  // Convert row,col coordinates to cell reference
  private coordsToCellRef(row: number, col: number): string {
    let colStr = '';
    let temp = col;
    while (temp > 0) {
      temp--;
      colStr = String.fromCharCode(65 + (temp % 26)) + colStr;
      temp = Math.floor(temp / 26);
    }
    return `${colStr}${row}`;
  }

  // Get cell value, evaluating formulas if needed
  getCellValue(row: number, col: number): CellValue {
    const key = `${row},${col}`;

    // Check for circular reference
    if (this.evaluating.has(key)) {
      throw new Error(`Circular reference detected at cell ${this.coordsToCellRef(row, col)}`);
    }

    // Return cached computed value if available
    if (this.computed.has(key)) {
      const cached = this.computed.get(key);
      if (cached !== undefined) {
        return cached;
      }
    }

    // Check if there's a formula for this cell
    if (this.formulas.has(key)) {
      this.evaluating.add(key);
      try {
        const formula = this.formulas.get(key);
        if (formula) {
          const result = this.evaluateFormula(formula);
          this.computed.set(key, result);
          this.evaluating.delete(key);
          return result;
        }
      } catch (error) {
        this.evaluating.delete(key);
        throw error;
      }
    }

    // Return raw data value or empty string
    return this.data[key] ?? '';
  }

  // Evaluate a formula expression
  private evaluateFormula(expr: string): CellValue {
    // Remove leading = if present
    if (expr.startsWith('=')) {
      expr = expr.slice(1);
    }

    // Replace cell references with actual values
    const cellRefRegex = /\b([A-Z]+\d+)\b/g;
    const processedExpr = expr.replace(cellRefRegex, match => {
      const [row, col] = this.cellRefToCoords(match);
      const value = this.getCellValue(row, col);

      // Convert to number if possible, otherwise use as string
      if (typeof value === 'number') {
        return value.toString();
      } else if (typeof value === 'string' && !isNaN(Number(value))) {
        return value;
      } else {
        // For string values in formulas, wrap in quotes
        return `"${value}"`;
      }
    });

    try {
      // Evaluate the mathematical expression
      return this.evaluateExpression(processedExpr);
    } catch (error) {
      throw new Error(`Formula evaluation error: ${(error as Error).message}`);
    }
  }

  // Safe expression evaluator supporting basic arithmetic
  private evaluateExpression(expr: string): number {
    // Remove whitespace
    expr = expr.replace(/\s+/g, '');

    // Handle parentheses first
    while (expr.includes('(')) {
      const innerMatch = expr.match(/\(([^()]+)\)/);
      if (!innerMatch) break;

      const innerExpr = innerMatch[1];
      const fullMatch = innerMatch[0];
      if (innerExpr && fullMatch) {
        const innerResult = this.evaluateExpression(innerExpr);
        expr = expr.replace(fullMatch, innerResult.toString());
      }
    }

    // Handle multiplication and division (left to right, same precedence)
    expr = this.evaluateOperatorsLeftToRight(expr, ['*', '/']);

    // Handle addition and subtraction (left to right, same precedence)
    expr = this.evaluateOperatorsLeftToRight(expr, ['+', '-']);

    // Parse final result
    const result = parseFloat(expr);
    if (isNaN(result)) {
      throw new Error(`Invalid expression: ${expr}`);
    }

    return result;
  }

  // Evaluate operators with left-to-right precedence
  private evaluateOperatorsLeftToRight(expr: string, operators: string[]): string {
    // Create a regex that matches any of the operators
    const opPattern = operators.map(op => `\\${op}`).join('|');
    const regex = new RegExp(`(-?\\d+(?:\\.\\d+)?)(${opPattern})(-?\\d+(?:\\.\\d+)?)`, 'g');

    // Keep evaluating until no more matches
    while (regex.test(expr)) {
      regex.lastIndex = 0; // Reset regex
      expr = expr.replace(regex, (_, left, op, right) => {
        const leftNum = parseFloat(left);
        const rightNum = parseFloat(right);
        let result: number;

        switch (op) {
          case '+':
            result = leftNum + rightNum;
            break;
          case '-':
            result = leftNum - rightNum;
            break;
          case '*':
            result = leftNum * rightNum;
            break;
          case '/':
            if (rightNum === 0) throw new Error('Division by zero');
            result = leftNum / rightNum;
            break;
          default:
            throw new Error(`Unknown operator: ${op}`);
        }

        return result.toString();
      });
    }

    return expr;
  }

  // Get all computed values for a sheet
  getAllComputedValues(maxRow: number, maxCol: number): SpreadsheetData {
    const result: SpreadsheetData = {};

    for (let r = 1; r <= maxRow; r++) {
      for (let c = 1; c <= maxCol; c++) {
        const key = `${r},${c}`;
        try {
          const value = this.getCellValue(r, c);
          if (value !== '') {
            result[key] = value;
          }
        } catch (error) {
          // Store error message for cells that can't be computed
          result[key] = `#ERROR: ${(error as Error).message}`;
        }
      }
    }

    return result;
  }
}
