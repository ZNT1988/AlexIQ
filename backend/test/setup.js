import crypto from 'crypto';
// Test Setup and Configuration for HustleFinderIA
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load test environment variables

// Constantes pour chaînes dupliquées (optimisation SonarJS)
import logger from '../config/logger.js';

const STR_TEST_USER_123 = 'test-user-123';
const STR_TECHNOLOGY = 'technology';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env.test, fallback to regular .env
try {
  config({ path: join(__dirname, '..', '.env.test') });
} catch {
  config({ path: join(__dirname, '..', '.env') });
}

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random available port for tests
process.env.CLERK_SECRET_KEY = 'sk_test_mock_key_for_testing';

// Global test configuration
global.testConfig = {
  timeout: 10000
  apiUrl: `http://localhost:${process.env.PORT || 5001}`
  testDb: ':memory:', // In-memory SQLite for tests
  mockAuth: true
  enableCache: false
  enableRateLimit: false
};

// Mock external services
global.mocks = {
  clerk: {
    verifyToken: () => Promise.resolve({ userId: STR_TEST_USER_123 })
    getUser: () => Promise.resolve({
      id: STR_TEST_USER_123
      firstName: 'Test'
      lastName: 'User'
      emailAddresses: [{ emailAddress: 'test@example.com' }]
    })
  }
  database: {
    isConnected: true
    query: () => Promise.resolve([])
    execute: () => Promise.resolve({ affectedRows: 1 })
  }
  ai: {
    generateIdeas: () => Promise.resolve([
      {
        title: 'Test Business Idea'
        description: 'A test business idea for testing'
        score: 8.5
        domain: STR_TECHNOLOGY
      }
    ])
    analyzeMarket: () => Promise.resolve({
      marketSize: 'large'
      competition: 'medium'
      trends: ['positive']
    })
  }
};

// Global test utilities
global.testUtils = {
  // Create test user
  createTestUser: () => ({
    id: STR_TEST_USER_123
    email: 'test@example.com'
    firstName: 'Test'
    lastName: 'User'
    createdAt: new Date().toISOString()
  })
  // Create test idea
  createTestIdea: () => ({
    id: 'test-idea-123'
    title: 'Test Business Idea'
    description: 'A comprehensive test business idea for validation'
    domain: STR_TECHNOLOGY
    targetMarket: 'Small businesses looking for automation'
    uniqueValue: 'AI-powered solution with no setup required'
    investmentRequired: '10000-50000'
    timeToMarket: 6
    riskLevel: 'medium'
    scalabilityPotential: 8
    marketSize: 'large'
    businessModel: 'subscription'
    userId: STR_TEST_USER_123
    createdAt: new Date().toISOString()
  })
  // Create test project
  createTestProject: () => ({
    id: 'test-project-123'
    ideaId: 'test-idea-123'
    name: 'Test Project'
    description: 'A test project for validation'
    status: 'planning'
    progress: 0
    budget: {
      initial: 10000
      monthly: 1000
      spent: 0
    }
    timeline: {
      startDate: new Date().toISOString()
      expectedEndDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
    userId: STR_TEST_USER_123
    createdAt: new Date().toISOString()
  })
  // Generate test headers
  getTestHeaders: (withAuth = true) => {
    const headers = {
      'Content-Type': 'application/json'
      'User-Agent': 'HustleFinderIA-Test/1.0'
    };

    if (withAuth) {
      headers['Authorization'] = 'Bearer test-token-123';
    }

    return headers;
  }
  // Wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
  // Generate random test data
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * chars.length));
    }
    return result;
  }
  randomEmail: () => `test${Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 10000)}@example.com'
  randomPhone: () => '+1${Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 9000000000) + 1000000000}`
  // Validate response structure
  validateResponse: (response, expectedStatus = 200) => {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    return response.data;
  }
  // Validate error response
  validateError: (error, expectedStatus = 400) => {
    if (!error.response) {
      throw new Error('Expected HTTP error response');
    }
    if (error.response.status !== expectedStatus) {
      throw new Error(`Expected error status ${expectedStatus}, got ${error.response.status}`);
    }
    return error.response.data;
  }
};

// Simplified test hooks without dynamic imports
export const setupGlobalTests = () => {
  logger.debug('Test setup initialized - Mock environment ready');

  beforeEach(function() {
    // Reset mocks before each test
    global.mocks.database.query = () => Promise.resolve([]);
    global.mocks.database.execute = () => Promise.resolve({ affectedRows: 1 });
  });
};

// Custom test matchers
export const customMatchers = {
  toBeValidId: (received) => {
    const isValid = typeof received === 'string' && received.length > 0;
    return {
      message: () => `Expected ${received} to be a valid ID`
      pass: isValid
    };
  }
  toBeValidEmail: (received) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(received);
    return {
      message: () => `Expected ${received} to be a valid email`
      pass: isValid
    };
  }
  toBeValidDate: (received) => {
    const date = new Date(received);
    const isValid = !isNaN(date.getTime());
    return {
      message: () => `Expected ${received} to be a valid date`
      pass: isValid
    };
  }
  toBeValidBusinessDomain: (received) => {
    const validDomains = [
      STR_TECHNOLOGY, 'healthcare', 'education', 'finance', 'retail'
      'manufacturing', 'services', 'entertainment', 'food', 'real-estate'
    ];
    const isValid = validDomains.includes(received);
    return {
      message: () => `Expected ${received} to be a valid business domain`
      pass: isValid
    };
  }
};

// Performance testing utilities
export const performanceUtils = {
  measureTime: async (fn) => {
    const start = process.hrtime();
    const result = await fn();
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    return { result, duration };
  }
  benchmarkEndpoint: async (url, options = {}, iterations = 10) => {
    const times = [];
    const { default: axios } = await import('axios');
    
    for (let i = 0; i < iterations; i++) {
      const { duration } = await performanceUtils.measureTime(async () => {
        return await axios(url, options);
      });
      times.push(duration);
    }

    return {
      min: Math.min(...times)
      max: Math.max(...times)
      average: times.reduce((sum, time) => sum + time, 0) / times.length
      median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)]
      iterations
    };
  }
};

// Database test utilities
export const dbTestUtils = {
  clearDatabase: async () => {
    // Implementation would clear test database
    try {
      logger.debug('Test database cleared');

    } catch (error) {
      // Logger fallback - ignore error
    }}
  seedTestData: async () => {
    // Implementation would seed test data
    try {
      logger.debug('Test data seeded');

    } catch (error) {
    // Logger fallback - ignore error
  }}
  createTestTables: async () => {
    // Implementation would create test tables
    try {
      logger.debug('Test tables created');

    } catch (error) {
    // Logger fallback - ignore error
  }}
};

export default {
  setupGlobalTests
  customMatchers
  performanceUtils
  dbTestUtils
};