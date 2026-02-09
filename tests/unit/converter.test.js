const { test } = require('node:test');
const assert = require('node:assert');
const { convertCurrency, RATES_TO_USD } = require('../../program.js');

/**
 * Unit tests for specific currency conversions
 * Validates: Requirements 4.1
 */

test('Convert 1000 THB to BTC', () => {
  const result = convertCurrency(1000, 'THB', 'BTC');
  
  // Calculate expected value: 1000 THB * 0.032 USD/THB / 69000 USD/BTC
  const expected = (1000 * RATES_TO_USD['THB']) / RATES_TO_USD['BTC'];
  
  assert.strictEqual(result, expected, 
    `Expected ${expected} BTC, got ${result} BTC`);
});

test('Convert 50 USD to THB', () => {
  const result = convertCurrency(50, 'USD', 'THB');
  
  // Calculate expected value: 50 USD * 1.0 / 0.032 USD/THB
  const expected = (50 * RATES_TO_USD['USD']) / RATES_TO_USD['THB'];
  
  assert.strictEqual(result, expected,
    `Expected ${expected} THB, got ${result} THB`);
});

test('Convert 0.01 BTC to USD', () => {
  const result = convertCurrency(0.01, 'BTC', 'USD');
  
  // Calculate expected value: 0.01 BTC * 69000 USD/BTC / 1.0
  const expected = (0.01 * RATES_TO_USD['BTC']) / RATES_TO_USD['USD'];
  
  assert.strictEqual(result, expected,
    `Expected ${expected} USD, got ${result} USD`);
});
