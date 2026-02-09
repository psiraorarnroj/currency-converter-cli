#!/usr/bin/env node

// Supported currencies
const SUPPORTED_CURRENCIES = ['THB', 'USD', 'EUR', 'BTC'];

// Exchange rates relative to USD as base currency
const RATES_TO_USD = {
  'USD': 1.0,
  'THB': 0.027,      // 1 THB = 0.027 USD
  'EUR': 1.10,       // 1 EUR = 1.10 USD
  'BTC': 45000.0     // 1 BTC = 45000 USD
};

// Basic error handling utility
function handleError(errorMessage) {
  console.error(errorMessage);
  process.exit(1);
}

// Argument parser
function parseArguments(args) {
  // Verify exactly 4 arguments provided
  if (args.length !== 4) {
    return null;
  }

  // Verify third argument is "to"
  if (args[2] !== 'to') {
    return null;
  }

  // Parse amount as number
  const amount = parseFloat(args[0]);
  
  // Check if amount is valid number
  if (isNaN(amount)) {
    return null;
  }

  // Convert currency codes to uppercase
  const fromCurrency = args[1].toUpperCase();
  const toCurrency = args[3].toUpperCase();

  return {
    amount,
    fromCurrency,
    toCurrency
  };
}

// Input validator
function validateInput(parsed) {
  // Check if amount is a valid positive number
  if (typeof parsed.amount !== 'number' || isNaN(parsed.amount)) {
    return {
      valid: false,
      error: 'Invalid amount. Please provide a positive number.'
    };
  }

  // Check if amount is non-negative
  if (parsed.amount < 0) {
    return {
      valid: false,
      error: 'Invalid amount. Please provide a positive number.'
    };
  }

  // Check if fromCurrency is supported
  if (!SUPPORTED_CURRENCIES.includes(parsed.fromCurrency)) {
    return {
      valid: false,
      error: `Unsupported currency: ${parsed.fromCurrency}. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`
    };
  }

  // Check if toCurrency is supported
  if (!SUPPORTED_CURRENCIES.includes(parsed.toCurrency)) {
    return {
      valid: false,
      error: `Unsupported currency: ${parsed.toCurrency}. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`
    };
  }

  return {
    valid: true
  };
}

// Currency converter
function convertCurrency(amount, from, to) {
  // Handle identity case (same currency)
  if (from === to) {
    return amount;
  }

  // Convert from source currency to USD
  const amountInUSD = amount * RATES_TO_USD[from];

  // Convert from USD to target currency
  const result = amountInUSD / RATES_TO_USD[to];

  return result;
}

// Output formatter
function formatOutput(amount, from, result, to) {
  // Format numbers with appropriate decimal places (up to 4, remove trailing zeros)
  const formatNumber = (num) => {
    // Convert to string with up to 4 decimal places
    let formatted = num.toFixed(4);
    // Remove trailing zeros
    formatted = formatted.replace(/\.?0+$/, '');
    return formatted;
  };

  // Ensure currency codes are uppercase
  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();

  // Build output string in format: <amount> <FROM> = <result> <TO>
  return `${formatNumber(amount)} ${fromUpper} = ${formatNumber(result)} ${toUpper}`;
}

// Main program flow
function main() {
  // Get command-line arguments (skip first 2: node and script path)
  const args = process.argv.slice(2);

  // Handle argument count errors
  if (args.length !== 4) {
    handleError('Usage: node program.js <amount> <from_currency> to <to_currency>');
    return;
  }

  // Parse arguments
  const parsed = parseArguments(args);

  // Handle format errors (third arg not "to" or invalid amount)
  if (!parsed) {
    handleError('Invalid format. Expected: <amount> <from_currency> to <to_currency>');
    return;
  }

  // Validate input
  const validation = validateInput(parsed);
  if (!validation.valid) {
    handleError(validation.error);
    return;
  }

  // Perform conversion
  const result = convertCurrency(parsed.amount, parsed.fromCurrency, parsed.toCurrency);

  // Format output
  const output = formatOutput(parsed.amount, parsed.fromCurrency, result, parsed.toCurrency);

  // Write to stdout
  console.log(output);

  // Exit with code 0 on success
  process.exit(0);
}

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPPORTED_CURRENCIES,
    RATES_TO_USD,
    handleError,
    parseArguments,
    validateInput,
    convertCurrency,
    formatOutput,
    main
  };
}

// Program entry point - call main() when script is executed directly
if (require.main === module) {
  main();
}
