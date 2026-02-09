const { test } = require('node:test');
const assert = require('node:assert');
const { handleError } = require('../../program.js');

/**
 * Unit tests for error handling
 * Requirements: 6.6
 */

test('should write error message to stderr', () => {
  // Store original console.error
  const originalConsoleError = console.error;
  
  // Mock console.error to capture output
  let capturedError = '';
  console.error = (msg) => {
    capturedError = msg;
  };
  
  // Mock process.exit to prevent actual exit
  const originalExit = process.exit;
  let exitCode = null;
  process.exit = (code) => {
    exitCode = code;
  };
  
  try {
    // Call handleError
    handleError('Test error message');
    
    // Verify error was written to stderr (console.error)
    assert.strictEqual(capturedError, 'Test error message');
  } finally {
    // Restore original functions
    console.error = originalConsoleError;
    process.exit = originalExit;
  }
});

test('should exit with status code 1', () => {
  // Store original console.error
  const originalConsoleError = console.error;
  console.error = () => {}; // Suppress output
  
  // Mock process.exit to capture exit code
  const originalExit = process.exit;
  let exitCode = null;
  process.exit = (code) => {
    exitCode = code;
  };
  
  try {
    // Call handleError
    handleError('Test error');
    
    // Verify exit code is 1
    assert.strictEqual(exitCode, 1);
  } finally {
    // Restore original functions
    console.error = originalConsoleError;
    process.exit = originalExit;
  }
});

test('should preserve error message content', () => {
  // Store original console.error
  const originalConsoleError = console.error;
  
  // Mock console.error to capture output
  let capturedError = '';
  console.error = (msg) => {
    capturedError = msg;
  };
  
  // Mock process.exit to prevent actual exit
  const originalExit = process.exit;
  process.exit = () => {};
  
  try {
    const errorMessage = 'Invalid amount. Please provide a positive number.';
    handleError(errorMessage);
    
    // Verify the exact error message is preserved
    assert.strictEqual(capturedError, errorMessage);
  } finally {
    // Restore original functions
    console.error = originalConsoleError;
    process.exit = originalExit;
  }
});
