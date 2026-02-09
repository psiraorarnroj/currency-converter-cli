const { test } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');
const { formatOutput, SUPPORTED_CURRENCIES } = require('../../program.js');

/**
 * Property 7: Output Format Correctness
 * Feature: currency-converter-cli
 * Validates: Requirements 5.1, 5.2, 5.3
 * 
 * For any successful conversion, the output should match the pattern 
 * <amount> <FROM_UPPER> = <result> <TO_UPPER> where currency codes are 
 * in uppercase and numbers are properly formatted.
 */
test('Property 7: Output Format Correctness', () => {
  fc.assert(
    fc.property(
      fc.double({ min: 0.01, max: 1e10, noNaN: true }),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      fc.double({ min: 0.01, max: 1e10, noNaN: true }),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      (amount, fromCurrency, result, toCurrency) => {
        const output = formatOutput(amount, fromCurrency, result, toCurrency);
        
        // Check output matches the expected pattern
        const pattern = /^[\d.]+ [A-Z]{3,4} = [\d.]+ [A-Z]{3,4}$/;
        assert.ok(
          pattern.test(output),
          `Output format incorrect: "${output}" does not match pattern "<amount> <FROM> = <result> <TO>"`
        );
        
        // Verify currency codes are uppercase
        const parts = output.split(' ');
        assert.strictEqual(parts.length, 5, 'Output should have 5 parts');
        assert.strictEqual(parts[2], '=', 'Third part should be "="');
        
        const fromInOutput = parts[1];
        const toInOutput = parts[4];
        
        assert.strictEqual(
          fromInOutput,
          fromInOutput.toUpperCase(),
          `From currency should be uppercase: ${fromInOutput}`
        );
        assert.strictEqual(
          toInOutput,
          toInOutput.toUpperCase(),
          `To currency should be uppercase: ${toInOutput}`
        );
        
        // Verify numbers are properly formatted (no trailing zeros after decimal)
        const amountInOutput = parts[0];
        const resultInOutput = parts[3];
        
        // Check no trailing zeros after decimal point
        if (amountInOutput.includes('.')) {
          assert.ok(
            !amountInOutput.endsWith('0') || !amountInOutput.includes('.'),
            `Amount should not have trailing zeros: ${amountInOutput}`
          );
        }
        if (resultInOutput.includes('.')) {
          assert.ok(
            !resultInOutput.endsWith('0') || !resultInOutput.includes('.'),
            `Result should not have trailing zeros: ${resultInOutput}`
          );
        }
      }
    ),
    { numRuns: 100 }
  );
});

/**
 * Property 2: Case-Insensitive Currency Input
 * Feature: currency-converter-cli
 * Validates: Requirements 2.3
 * 
 * For any valid currency code and any combination of uppercase/lowercase 
 * letters, the program should accept the input and perform the conversion 
 * correctly.
 */
test('Property 2: Case-Insensitive Currency Input', () => {
  const { parseArguments, validateInput, convertCurrency } = require('../../program.js');
  
  // Generator for random case variations of currency codes
  const randomCaseCurrency = fc.constantFrom(...SUPPORTED_CURRENCIES).map(currency => {
    return currency.split('').map(char => 
      fc.sample(fc.boolean(), 1)[0] ? char.toUpperCase() : char.toLowerCase()
    ).join('');
  });
  
  fc.assert(
    fc.property(
      fc.double({ min: 0.01, max: 1e10, noNaN: true }),
      randomCaseCurrency,
      randomCaseCurrency,
      (amount, fromCurrency, toCurrency) => {
        // Parse arguments with random case currencies
        const args = [amount.toString(), fromCurrency, 'to', toCurrency];
        const parsed = parseArguments(args);
        
        // Should successfully parse
        assert.ok(parsed !== null, `Failed to parse with currencies: ${fromCurrency}, ${toCurrency}`);
        
        // Validate input
        const validation = validateInput(parsed);
        
        // Should be valid
        assert.ok(
          validation.valid,
          `Validation failed for case-insensitive input: ${fromCurrency} to ${toCurrency}. Error: ${validation.error}`
        );
        
        // Should successfully convert
        const result = convertCurrency(parsed.amount, parsed.fromCurrency, parsed.toCurrency);
        
        // Result should be valid
        assert.strictEqual(typeof result, 'number', 'Result should be a number');
        assert.ok(!isNaN(result), 'Result should not be NaN');
        assert.ok(isFinite(result), 'Result should be finite');
      }
    ),
    { numRuns: 100 }
  );
});

/**
 * Property 6: Precision Maintenance
 * Feature: currency-converter-cli
 * Validates: Requirements 4.4
 * 
 * For any valid conversion, the result should maintain at least 4 decimal 
 * places of precision when the result requires it.
 */
test('Property 6: Precision Maintenance', () => {
  const { convertCurrency } = require('../../program.js');
  
  fc.assert(
    fc.property(
      fc.double({ min: 0.01, max: 1e10, noNaN: true }),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      fc.constantFrom(...SUPPORTED_CURRENCIES),
      (amount, fromCurrency, toCurrency) => {
        const result = convertCurrency(amount, fromCurrency, toCurrency);
        
        // The result should be a valid number
        assert.ok(typeof result === 'number', 'Result should be a number');
        assert.ok(!isNaN(result), 'Result should not be NaN');
        assert.ok(isFinite(result), 'Result should be finite');
        
        // Format the result with formatOutput to check precision
        const output = formatOutput(amount, fromCurrency, result, toCurrency);
        const parts = output.split(' ');
        const resultStr = parts[3];
        
        // Parse the formatted result back to a number
        const formattedResult = parseFloat(resultStr);
        
        // The formatted result should be close to the actual result
        // We allow for rounding to 4 decimal places
        const tolerance = Math.max(Math.abs(result) * 1e-4, 1e-4);
        
        assert.ok(
          Math.abs(result - formattedResult) <= tolerance,
          `Precision not maintained: original=${result}, formatted=${formattedResult}, diff=${Math.abs(result - formattedResult)}`
        );
        
        // If the result has more than 4 significant decimal places,
        // the formatted output should show up to 4 decimal places (without trailing zeros)
        if (resultStr.includes('.')) {
          const decimalPart = resultStr.split('.')[1];
          assert.ok(
            decimalPart.length <= 4,
            `Formatted result should have at most 4 decimal places: ${resultStr}`
          );
          
          // Should not have trailing zeros
          assert.ok(
            !resultStr.endsWith('0') || !resultStr.includes('.'),
            `Formatted result should not have trailing zeros: ${resultStr}`
          );
        }
      }
    ),
    { numRuns: 100 }
  );
});
