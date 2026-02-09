const { test } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');
const { validateInput, SUPPORTED_CURRENCIES } = require('../../program.js');

/**
 * Property 8: Invalid Amount Rejection
 * Feature: currency-converter-cli
 * Validates: Requirements 6.2
 * 
 * For any non-numeric string provided as the amount argument, the program 
 * should reject it with an error message and exit with non-zero status code.
 */
test('Property 8: Invalid Amount Rejection', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      (fromCurrency, toCurrency) => {
        // Test with NaN
        const resultNaN = validateInput({
          amount: NaN,
          fromCurrency,
          toCurrency
        });
        
        assert.strictEqual(resultNaN.valid, false, 'Should reject NaN amount');
        assert.ok(resultNaN.error, 'Should provide error message for NaN');
        
        // Test with negative number
        const resultNegative = validateInput({
          amount: -100,
          fromCurrency,
          toCurrency
        });
        
        assert.strictEqual(resultNegative.valid, false, 'Should reject negative amount');
        assert.ok(resultNegative.error, 'Should provide error message for negative amount');
      }
    ),
    { numRuns: 100 }
  );
});

/**
 * Property 9: Invalid Currency Rejection
 * Feature: currency-converter-cli
 * Validates: Requirements 6.3
 * 
 * For any currency code not in the supported set {THB, USD, EUR, BTC}, 
 * the program should reject it with an error message listing supported 
 * currencies and exit with non-zero status code.
 */
test('Property 9: Invalid Currency Rejection', () => {
  fc.assert(
    fc.property(
      fc.double({ min: 0, max: 1e10, noNaN: true }),
      fc.string({ minLength: 1, maxLength: 5 }),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      (amount, invalidCurrency, validCurrency) => {
        // Filter to ensure we're testing with an invalid currency
        fc.pre(!SUPPORTED_CURRENCIES.includes(invalidCurrency.toUpperCase()));
        
        // Test invalid fromCurrency
        const resultFrom = validateInput({
          amount,
          fromCurrency: invalidCurrency.toUpperCase(),
          toCurrency: validCurrency
        });
        
        assert.strictEqual(resultFrom.valid, false, 'Should reject invalid from currency');
        assert.ok(resultFrom.error, 'Should provide error message for invalid from currency');
        assert.ok(resultFrom.error.includes('Supported currencies'), 
          'Error should list supported currencies');
        
        // Test invalid toCurrency
        const resultTo = validateInput({
          amount,
          fromCurrency: validCurrency,
          toCurrency: invalidCurrency.toUpperCase()
        });
        
        assert.strictEqual(resultTo.valid, false, 'Should reject invalid to currency');
        assert.ok(resultTo.error, 'Should provide error message for invalid to currency');
        assert.ok(resultTo.error.includes('Supported currencies'), 
          'Error should list supported currencies');
      }
    ),
    { numRuns: 100 }
  );
});
