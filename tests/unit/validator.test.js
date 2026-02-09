const { test } = require('node:test');
const assert = require('node:assert');
const { validateInput } = require('../../program.js');

/**
 * Unit tests for validation edge cases
 * Requirements: 6.4
 */

test('should reject negative amount', () => {
  const result = validateInput({
    amount: -100,
    fromCurrency: 'USD',
    toCurrency: 'EUR'
  });
  
  assert.strictEqual(result.valid, false);
  assert.ok(result.error);
  assert.ok(result.error.includes('positive number'));
});

test('should accept zero amount', () => {
  const result = validateInput({
    amount: 0,
    fromCurrency: 'USD',
    toCurrency: 'EUR'
  });
  
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.error, undefined);
});

test('should reject NaN amount', () => {
  const result = validateInput({
    amount: NaN,
    fromCurrency: 'USD',
    toCurrency: 'EUR'
  });
  
  assert.strictEqual(result.valid, false);
  assert.ok(result.error);
  assert.ok(result.error.includes('positive number'));
});
