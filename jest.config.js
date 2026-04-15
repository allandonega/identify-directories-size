module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'backend/src/**/*.js',
    '!backend/src/index.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  testMatch: [
    '**/backend/tests/**/*.test.js',
    '**/backend/tests/**/*.spec.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
