# Currency Converter CLI

A command-line currency converter that operates offline using hardcoded exchange rates. Supports conversion between THB, USD, EUR, and BTC.

## Features

- **Offline Operation**: No internet connection required
- **Simple CLI Interface**: Easy-to-use command format
- **Case-Insensitive Input**: Accepts currency codes in any case
- **Comprehensive Testing**: Unit tests, property-based tests, and integration tests
- **Clear Error Messages**: Helpful feedback for invalid inputs

## Installation

```bash
npm install
```

## Usage

```bash
node program.js <amount> <from_currency> to <to_currency>
```

### Examples

```bash
# Convert 1000 Thai Baht to Bitcoin
node program.js 1000 THB to BTC
# Output: 1000 THB = 0.0005 BTC

# Convert 50 US Dollars to Euro
node program.js 50 USD to EUR
# Output: 50 USD = 42.0168 EUR

# Case-insensitive currency codes
node program.js 100 usd to thb
# Output: 100 USD = 3125 THB
```

## Supported Currencies

- **THB** - Thai Baht
- **USD** - US Dollar
- **EUR** - Euro
- **BTC** - Bitcoin

## Exchange Rates

All exchange rates are hardcoded relative to USD:
- 1 THB = 0.032 USD
- 1 EUR = 1.19 USD
- 1 BTC = 69,000 USD

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

- **32 tests** covering:
  - Unit tests for specific conversions and edge cases
  - Property-based tests for universal correctness properties
  - Integration tests for complete program execution

### Key Properties Tested

1. **Argument Parsing Correctness**: Valid inputs are parsed correctly
2. **Case-Insensitive Input**: Currency codes work in any case
3. **All Currency Pairs**: All combinations of supported currencies work
4. **Conversion Transitivity**: A→B→C equals A→C
5. **Identity Property**: Converting X→X returns the original amount
6. **Precision Maintenance**: Results maintain at least 4 decimal places
7. **Output Format**: Consistent format across all conversions
8. **Invalid Amount Rejection**: Non-numeric and negative amounts are rejected
9. **Invalid Currency Rejection**: Unsupported currencies are rejected with helpful messages

## Error Handling

The program provides clear error messages for common mistakes:

```bash
# Too few arguments
node program.js 100 USD
# Error: Usage: node program.js <amount> <from_currency> to <to_currency>

# Invalid format (missing "to")
node program.js 100 USD into EUR
# Error: Invalid format. Expected: <amount> <from_currency> to <to_currency>

# Negative amount
node program.js -100 USD to EUR
# Error: Invalid amount. Please provide a positive number.

# Unsupported currency
node program.js 100 JPY to USD
# Error: Unsupported currency: JPY. Supported currencies: THB, USD, EUR, BTC
```

## Design Decisions

### Architecture

The program follows a simple pipeline architecture:
```
Command Line Input → Parser → Validator → Converter → Formatter → Output
```

### Base Currency Approach

All exchange rates are stored relative to USD as the base currency. This design:
- Ensures transitivity (A→B→C = A→C)
- Simplifies rate management (N rates instead of N²)
- Makes updates easier (change one rate to update all conversions)

### Testing Strategy

The project uses a dual testing approach:
- **Unit tests** for specific examples and edge cases
- **Property-based tests** (using fast-check) for universal correctness across all inputs

This combination provides both clear documentation of expected behavior and confidence in correctness across the vast input space.

## Project Structure

```
.
├── program.js                          # Main program
├── package.json                        # Dependencies and scripts
├── tests/
│   ├── unit/                          # Unit tests
│   │   ├── converter.test.js
│   │   ├── validator.test.js
│   │   └── error-handler.test.js
│   ├── properties/                    # Property-based tests
│   │   ├── conversion.properties.test.js
│   │   ├── validation.properties.test.js
│   │   ├── format.properties.test.js
│   │   └── parser.properties.test.js
│   └── integration/                   # Integration tests
│       └── program.integration.test.js
└── README.md                          # This file
```

## Requirements

- Node.js (v18 or higher recommended)
- No external runtime dependencies (only dev dependencies for testing)

## License

ISC
