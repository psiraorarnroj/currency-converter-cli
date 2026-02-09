const { test } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');

/**
 * Integration tests for complete program execution
 * Tests the entire program flow including argument parsing, validation,
 * conversion, output formatting, exit codes, and stdout/stderr handling
 * 
 * Validates: Requirements 1.3, 5.4, 6.6
 */

// Helper function to execute the program with given arguments
function executeProgram(args) {
  return new Promise((resolve) => {
    const programPath = path.join(__dirname, '..', '..', 'program.js');
    const child = spawn('node', [programPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({
        exitCode: code,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

// Test complete program execution with valid inputs
test('Integration: Convert 1000 THB to USD - valid input', async () => {
  const result = await executeProgram(['1000', 'THB', 'to', 'USD']);
  
  assert.strictEqual(result.exitCode, 0, 'Exit code should be 0 for success');
  assert.match(result.stdout, /^1000 THB = 32 USD$/, 'Output should match expected format');
  assert.strictEqual(result.stderr, '', 'stderr should be empty for successful execution');
});

test('Integration: Convert 50 USD to EUR - valid input', async () => {
  const result = await executeProgram(['50', 'USD', 'to', 'EUR']);
  
  assert.strictEqual(result.exitCode, 0, 'Exit code should be 0 for success');
  assert.match(result.stdout, /^50 USD = 42\.0168 EUR$/, 'Output should match expected format');
  assert.strictEqual(result.stderr, '', 'stderr should be empty for successful execution');
});

test('Integration: Convert 0.01 BTC to THB - valid input', async () => {
  const result = await executeProgram(['0.01', 'BTC', 'to', 'THB']);
  
  assert.strictEqual(result.exitCode, 0, 'Exit code should be 0 for success');
  assert.match(result.stdout, /^0\.01 BTC = 21562\.5 THB$/, 'Output should match expected format');
  assert.strictEqual(result.stderr, '', 'stderr should be empty for successful execution');
});

test('Integration: Convert with lowercase currency codes', async () => {
  const result = await executeProgram(['100', 'usd', 'to', 'eur']);
  
  assert.strictEqual(result.exitCode, 0, 'Exit code should be 0 for success');
  assert.match(result.stdout, /^100 USD = 84\.0336 EUR$/, 'Output should handle case-insensitive input');
  assert.strictEqual(result.stderr, '', 'stderr should be empty for successful execution');
});

test('Integration: Identity conversion (same currency)', async () => {
  const result = await executeProgram(['500', 'USD', 'to', 'USD']);
  
  assert.strictEqual(result.exitCode, 0, 'Exit code should be 0 for success');
  assert.match(result.stdout, /^500 USD = 500 USD$/, 'Identity conversion should return same amount');
  assert.strictEqual(result.stderr, '', 'stderr should be empty for successful execution');
});

// Test complete program execution with various error inputs
test('Integration: Error - insufficient arguments', async () => {
  const result = await executeProgram(['100', 'USD']);
  
  assert.strictEqual(result.exitCode, 1, 'Exit code should be 1 for error');
  assert.strictEqual(result.stdout, '', 'stdout should be empty for error');
  assert.match(result.stderr, /Usage: node program\.js/, 'stderr should contain usage message');
});

test('Integration: Error - too many arguments', async () => {
  const result = await executeProgram(['100', 'USD', 'to', 'EUR', 'extra']);
  
  assert.strictEqual(result.exitCode, 1, 'Exit code should be 1 for error');
  assert.strictEqual(result.stdout, '', 'stdout should be empty for error');
  assert.match(result.stderr, /Usage: node program\.js/, 'stderr should contain usage message');
});

test('Integration: Error - invalid format (missing "to")', async () => {
  const result = await executeProgram(['100', 'USD', 'into', 'EUR']);
  
  assert.strictEqual(result.exitCode, 1, 'Exit code should be 1 for error');
  assert.strictEqual(result.stdout, '', 'stdout should be empty for error');
  assert.match(result.stderr, /Invalid format/, 'stderr should contain format error message');
});

test('Integration: Error - invalid amount (non-numeric)', async () => {
  const result = await executeProgram(['abc', 'USD', 'to', 'EUR']);
  
  assert.strictEqual(result.exitCode, 1, 'Exit code should be 1 for error');
  assert.strictEqual(result.stdout, '', 'stdout should be empty for error');
  assert.match(result.stderr, /Invalid format/, 'stderr should contain error message');
});

test('Integration: Error - negative amount', async () => {
  const result = await executeProgram(['-100', 'USD', 'to', 'EUR']);
  
  assert.strictEqual(result.exitCode, 1, 'Exit code should be 1 for error');
  assert.strictEqual(result.stdout, '', 'stdout should be empty for error');
  assert.match(result.stderr, /Invalid amount/, 'stderr should contain invalid amount error');
});

test('Integration: Error - unsupported source currency', async () => {
  const result = await executeProgram(['100', 'JPY', 'to', 'USD']);
  
  assert.strictEqual(result.exitCode, 1, 'Exit code should be 1 for error');
  assert.strictEqual(result.stdout, '', 'stdout should be empty for error');
  assert.match(result.stderr, /Unsupported currency: JPY/, 'stderr should indicate unsupported currency');
  assert.match(result.stderr, /Supported currencies:/, 'stderr should list supported currencies');
});

test('Integration: Error - unsupported target currency', async () => {
  const result = await executeProgram(['100', 'USD', 'to', 'GBP']);
  
  assert.strictEqual(result.exitCode, 1, 'Exit code should be 1 for error');
  assert.strictEqual(result.stdout, '', 'stdout should be empty for error');
  assert.match(result.stderr, /Unsupported currency: GBP/, 'stderr should indicate unsupported currency');
  assert.match(result.stderr, /Supported currencies:/, 'stderr should list supported currencies');
});

test('Integration: Verify stdout destination for success', async () => {
  const result = await executeProgram(['100', 'USD', 'to', 'THB']);
  
  assert.strictEqual(result.exitCode, 0, 'Exit code should be 0');
  assert.ok(result.stdout.length > 0, 'stdout should contain output');
  assert.strictEqual(result.stderr, '', 'stderr should be empty for success');
});

test('Integration: Verify stderr destination for errors', async () => {
  const result = await executeProgram(['invalid', 'USD', 'to', 'EUR']);
  
  assert.strictEqual(result.exitCode, 1, 'Exit code should be 1');
  assert.strictEqual(result.stdout, '', 'stdout should be empty for error');
  assert.ok(result.stderr.length > 0, 'stderr should contain error message');
});
