// API service tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiService from '../services/api.js';

// Mock fetch
global.fetch = vi.fn();

describe('APIService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('health check', () => {
    it('should return health status', async () => {
      const mockResponse = { status: 'OK', timestamp: new Date().toISOString() };
      
      fetch.mockResolvedValueOnce({
        ok: true
        json: async () => mockResponse
      });

      const result = await apiService.health();
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/health'
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  });

  describe('ideas API', () => {
    it('should fetch ideas successfully', async () => {
      const mockIdeas = {
        ideas: [
          { id: 1, title: 'Test Idea', content: 'Test content' }
        ]
        total: 1
      };
      
      fetch.mockResolvedValueOnce({
        ok: true
        json: async () => mockIdeas
      });

      const result = await apiService.getIdeas();
      
      expect(result).toEqual(mockIdeas);
    });

    it('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
        status: 500
        json: async () => ({ error: 'Server error' })
      });

      await expect(apiService.getIdeas()).rejects.toThrow('Server error');
    });
  });

  describe('AI chat API', () => {
    it('should send chat message successfully', async () => {
      const mockResponse = {
        response: 'AI response'
        type: 'chat'
        model: 'alex'
      };
      
      fetch.mockResolvedValueOnce({
        ok: true
        json: async () => mockResponse
      });

      const result = await apiService.chatWithAI('Hello');
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/ai/chat'
        expect.objectContaining({
          method: 'POST'
          body: JSON.stringify({
            message: 'Hello'
            type: 'chat'
            context: {}
          })
        })
      );
    });
  });
});