export interface Token {
  type: string;
  value: string;
}

export function tokenize(input: string): Token[] {
  const lines = input.split(/\r?\n/);
  return lines.map(line => ({ type: 'line', value: line }));
}
