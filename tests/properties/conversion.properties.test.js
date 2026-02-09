const { test } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');
const { convertCurrency, SUPPORTED_CURRENCIES } = require('../../program.js');

/**
 * Property 4: Conversion Transitivity
 * Feature: currency-converter-cli
 * Validates: Requirements 4.2
 * 
 * For any three currencies A, B, C and any positive amount, converting 
 * A→B→C should produce the same result as converting A→C directly 
 * (within floating-point precision tolerance).
 */
test('Property 4: Conversion Transitivity', () => {
  fc.assert(
    fc.property(
      fc.double({ min: 0.01, max: 1e10, noNaN: true }),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      (amount, currencyA, currencyB, currencyC) => {
        // Convert A→B→C
        const amountInB = convertCurrency(amount, currencyA, currencyB);
        const resultViaB = convertCurrency(amountInB, currencyB, currencyC);
        
        // Convert A→C directly
        const resultDirect = convertCurrency(amount, currencyA, currencyC);
        
        // Calculate relative tolerance (0.01% for floating-point precision)
        const tolerance = Math.max(Math.abs(resultDirect) * 1e-10, 1e-10);
        
        // Results should be equal within tolerance
        assert.ok(
          Math.abs(resultViaB - resultDirect) <= tolerance,
          `Transitivity failed: ${amount} ${currencyA}→${currencyB}→${currencyC} = ${resultViaB}, ` +
          `but ${amount} ${currencyA}→${currencyC} = ${resultDirect}`
        );
      }
    ),
    { numRuns: 100 }
  );
});

/**
 * Property 5: Identity Property
 * Feature: currency-converter-cli
 * Validates: Requirements 4.3
 * 
 * For any currency and any positive amount, converting from that currency 
 * to itself should return the original amount unchanged.
 */
test('Property 5: Identity Property', () => {
  fc.assert(
    fc.property(
      fc.double({ min: 0.01, max: 1e10, noNaN: true }),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      (amount, currency) => {
        const result = convertCurrency(amount, currency, currency);
        
        // Result should equal the original amount
        assert.strictEqual(
          result,
          amount,
          `Identity property failed: ${amount} ${currency}→${currency} should equal ${amount}, got ${result}`
        );
      }
    ),
    { numRuns: 100 }
  );
});

/**
 * Property 3: All Currency Pairs Supported
 * Feature: currency-converter-cli
 * Validates: Requirements 2.1, 2.2
 * 
 * For any two currencies from the supported set {THB, USD, EUR, BTC} and 
 * any positive amount, the program should successfully perform the conversion.
 */
test('Property 3: All Currency Pairs Supported', () => {
  fc.assert(
    fc.property(
      fc.double({ min: 0.01, max: 1e10, noNaN: true }),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      (amount, fromCurrency, toCurrency) => {
        // Should not throw an error
        const result = convertCurrency(amount, fromCurrency, toCurrency);
        
        // Result should be a valid number
        assert.strictEqual(typeof result, 'number', 'Result should be a number');
        assert.ok(!isNaN(result), 'Result should not be NaN');
        assert.ok(isFinite(result), 'Result should be finite');
        
        // Result should be non-negative for positive input
        assert.ok(result >= 0, 'Result should be non-negative for positive input');
      }
    ),
    { numRuns: 100 }
  );
});
