// File: omniscript-core/parser/src/lexer/strings.ts
// What: String parsing and escaping utilities
// Why: Handle quoted strings with escape sequences
// Related: lexer/index.ts, serializers/text.ts

export function parseString(str: string, i: number): { value: string; index: number } {
  let j = i + 1;
  let out = '';
  while (j < str.length && str[j] !== '"') {
    if (str[j] === '\\' && j + 1 < str.length) {
      // Handle escape sequences
      const nextChar = str[j + 1];
      switch (nextChar) {
        case '"':
          out += '"';
          j += 2;
          break;
        case '\\':
          out += '\\';
          j += 2;
          break;
        case 'n':
          out += '\n';
          j += 2;
          break;
        case 't':
          out += '\t';
          j += 2;
          break;
        case 'r':
          out += '\r';
          j += 2;
          break;
        case 'b':
          out += '\b';
          j += 2;
          break;
        case 'f':
          out += '\f';
          j += 2;
          break;
        case 'v':
          out += '\v';
          j += 2;
          break;
        case '0':
          out += '\0';
          j += 2;
          break;
        case '/':
          out += '/';
          j += 2;
          break;
        case 'u':
          // Parse \uXXXX (4-digit hex unicode)
          if (j + 5 < str.length) {
            const hex = str.slice(j + 2, j + 6);
            if (/^[0-9A-Fa-f]{4}$/.test(hex)) {
              out += String.fromCharCode(parseInt(hex, 16));
              j += 6;
              break;
            }
          }
          // Invalid \u sequence, preserve as-is
          out += str[j] + (nextChar || '');
          j += 2;
          break;
        case 'x':
          // Parse \xXX (2-digit hex ascii)
          if (j + 3 < str.length) {
            const hex = str.slice(j + 2, j + 4);
            if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
              out += String.fromCharCode(parseInt(hex, 16));
              j += 4;
              break;
            }
          }
          // Invalid \x sequence, preserve as-is
          out += str[j] + (nextChar || '');
          j += 2;
          break;
        default:
          // For unknown escape sequences, preserve the backslash and character
          out += str[j] + (nextChar || '');
          j += 2;
          break;
      }
    } else {
      out += str[j];
      j++;
    }
  }
  if (j >= str.length || str[j] !== '"') {
    throw new Error('Unterminated string literal');
  }
  return { value: out, index: j + 1 };
}

export function escapeString(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x1F\x7F-\uFFFF\\"]/g, ch => {
    switch (ch) {
      case '\\':
        return '\\\\';
      case '"':
        return '\\"';
      case '\n':
        return '\\n';
      case '\t':
        return '\\t';
      case '\r':
        return '\\r';
      case '\b':
        return '\\b';
      case '\f':
        return '\\f';
      case '\v':
        return '\\v';
      case '\0':
        return '\\0';
      default: {
        const code = ch.charCodeAt(0);
        if (code < 0x20 || code > 0x7e) {
          if (code <= 0xff) {
            return `\\x${code.toString(16).padStart(2, '0').toUpperCase()}`;
          }
          return `\\u${code.toString(16).padStart(4, '0').toUpperCase()}`;
        }
        return ch;
      }
    }
  });
}
