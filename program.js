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

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPPORTED_CURRENCIES,
    RATES_TO_USD,
    handleError,
    parseArguments,
    validateInput,
    convertCurrency
  };
}
