// Test setup file for HustleFinderIA frontend
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:5000'
        VITE_APP_NAME: 'HustleFinder IA Test'
        VITE_NODE_ENV: 'test'
      }
    }
  }
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn()
  observe: vi.fn()
  unobserve: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn()
  observe: vi.fn()
  unobserve: vi.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true
  value: vi.fn().mockImplementation(query => ({
    matches: false
    media: query
    onchange: null
    addListener: vi.fn()
    removeListener: vi.fn()
    addEventListener: vi.fn()
    removeEventListener: vi.fn()
    dispatchEvent: vi.fn()
  }))
});