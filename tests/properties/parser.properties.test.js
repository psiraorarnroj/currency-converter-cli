const { test } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');
const { parseArguments, SUPPORTED_CURRENCIES } = require('../../program.js');

/**
 * Property 1: Argument Parsing Correctness
 * Feature: currency-converter-cli
 * Validates: Requirements 1.1, 1.2
 * 
 * For any valid command-line arguments in the format 
 * `<amount> <from_currency> to <to_currency>`, the parser should correctly 
 * extract the amount as a number, and both currency codes as uppercase strings.
 */
test('Property 1: Argument Parsing Correctness', () => {
  fc.assert(
    fc.property(
      fc.double({ min: 0, max: 1e10, noNaN: true }),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      fc.constantFrom('lower', 'upper', 'mixed'),
      (amount, fromCurrency, toCurrency, caseStyle) => {
        // Apply case style to currency codes
        const applyCaseStyle = (currency, style) => {
          if (style === 'lower') return currency.toLowerCase();
          if (style === 'upper') return currency.toUpperCase();
          // mixed case
          return currency.split('').map((c, i) => 
            i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
          ).join('');
        };

        const fromInput = applyCaseStyle(fromCurrency, caseStyle);
        const toInput = applyCaseStyle(toCurrency, caseStyle);
        
        const args = [amount.toString(), fromInput, 'to', toInput];
        const result = parseArguments(args);

        // Should successfully parse
        assert.notStrictEqual(result, null, 'Parser should not return null for valid input');
        
        // Amount should be parsed correctly
        assert.strictEqual(typeof result.amount, 'number', 'Amount should be a number');
        assert.ok(Math.abs(result.amount - amount) < 1e-10, 'Amount should match input');
        
        // Currency codes should be uppercase
        assert.strictEqual(result.fromCurrency, fromCurrency.toUpperCase(), 
          'From currency should be uppercase');
        assert.strictEqual(result.toCurrency, toCurrency.toUpperCase(), 
          'To currency should be uppercase');
      }
    ),
    { numRuns: 100 }
  );
});
