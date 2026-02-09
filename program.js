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

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPPORTED_CURRENCIES,
    RATES_TO_USD,
    handleError
  };
}
