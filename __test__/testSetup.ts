// testSetup.js
const functionsTest = require('firebase-functions-test')();
const admin = require('firebase-admin');
const functions = require('firebase-functions/v2');

// Mock admin
jest.mock('firebase-admin', () => {
  // Your mock implementation
  return {
    database: jest.fn().mockReturnValue({
      ref: jest.fn().mockReturnValue({
        push: jest.fn().mockReturnValue({
          set: jest.fn().mockResolvedValue(true)
        }),
        update: jest.fn().mockResolvedValue(true)
      })
    }),
    initializeApp: jest.fn()
  };
});

// Mock functions
jest.mock('firebase-functions', () => {
  return {
    https: {
      HttpsError: jest.fn((code, message) => ({ code, message })),
      onCall: jest.fn(handler => handler)
    },
    logger: {
      error: jest.fn()
    }
  };
});

// Export what your test files need
module.exports = {
  functionsTest,
  admin,
  functions,
  firebase: require('firebase-functions')
};