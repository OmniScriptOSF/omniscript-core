// File: omniscript-core/parser/src/utils/validation.ts
// What: Runtime type validation helpers
// Why: Ensure type safety for parsed data structures
// Related: block-parsers/chart.ts, block-parsers/diagram.ts

export function validateString(value: unknown, defaultValue: string = ''): string {
  return typeof value === 'string' ? value : defaultValue;
}

export function validateNumber(value: unknown, defaultValue: number = 0): number {
  return typeof value === 'number' ? value : defaultValue;
}

export function validateBoolean(value: unknown, defaultValue: boolean = false): boolean {
  return typeof value === 'boolean' ? value : defaultValue;
}

// eslint-disable-next-line no-unused-vars
export function validateArray<T>(value: unknown, validator: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) return [];
  return value.map(validator);
}

export function validateEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  defaultValue: T
): T {
  if (typeof value === 'string' && (validValues as readonly string[]).includes(value)) {
    return value as T;
  }
  return defaultValue;
}
