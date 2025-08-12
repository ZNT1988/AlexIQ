export default {
  testEnvironment: 'node'
  transform: {}
  testMatch: [
    '**/test/**/*.test.js'
  ]
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
  collectCoverageFrom: [
    'routes/**/*.js'
    'middleware/**/*.js'
    'config/**/*.js'
    'core/**/*.js'
    '!**/node_modules/**'
  ]
  coverageReporters: ['text', 'lcov', 'html']
  testTimeout: 10000
};