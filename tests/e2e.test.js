const { parse } = require('../parser/dist');
const { readFileSync } = require('fs');
const input = readFileSync('./tests/fixtures/input.osf', 'utf8');
const expected = JSON.parse(readFileSync('./tests/fixtures/expected_output.json', 'utf8'));
const doc = parse(input);
if (JSON.stringify(doc) !== JSON.stringify(expected)) {
  throw new Error('e2e mismatch');
}
