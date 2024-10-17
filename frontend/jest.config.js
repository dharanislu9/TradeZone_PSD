module.exports = {
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
    testEnvironment: 'jsdom',  // Ensure you're using a browser-like environment for testing
    transformIgnorePatterns: [
      '/node_modules/(?!axios)',  // This ensures that axios is also transformed
    ],
  };
  