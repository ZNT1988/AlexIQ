
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';
// Integration Tests for HustleFinderIA API
import { expect } from 'chai';
import request from 'supertest';
import express from 'express';

// Import app components
import { setupGlobalTests } from '../setup.js';

describe('HustleFinderIA API Integration Tests', function() {
  setupGlobalTests();
  
  let apiUrl;

  before(function() {
    apiUrl = global.testConfig.apiUrl;
  });

  describe('Health Check Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(apiUrl)
        .get('/health')
        .expect(200);

      expect(response.body).to.have.property('status', 'healthy');
      expect(response.body).to.have.property('timestamp');
      expect(response.body).to.have.property('version');
      expect(response.body).to.have.property('uptime');
    });

    it('should return detailed health check', async () => {
      const response = await request(apiUrl)
        .get('/api/health/detailed')
        .expect(200);

      expect(response.body).to.have.property('status');
      expect(response.body).to.have.property('checks');
      expect(response.body.checks).to.have.property('database');
      expect(response.body.checks).to.have.property('cache');
      expect(response.body.checks).to.have.property('memory');
    });

    it('should return performance metrics', async () => {
      const response = await request(apiUrl)
        .get('/api/metrics')
        .expect(200);

      expect(response.body).to.have.property('requests');
      expect(response.body).to.have.property('memory');
      expect(response.body).to.have.property('cache');
      expect(response.body).to.have.property('uptime');
    });
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
      it('should reject invalid credentials', async () => {
        const response = await request(apiUrl)
          .post('/api/auth/login')
          .send({
            email: 'invalid@example.com'
            password: process.env.TEST_PASSWORD || 'secure_test_password'
          })
          .expect(401);

        expect(response.body).to.have.property(STR_ERROR);
      });

      it('should accept valid test credentials', async () => {
        const response = await request(apiUrl)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com'
            password: process.env.TEST_PASSWORD || 'secure_test_password'
          })
          .expect(200);

        expect(response.body).to.have.property('token');
        expect(response.body).to.have.property('user');
        expect(response.body.user).to.have.property('id');
        expect(response.body.user).to.have.property('email', 'test@example.com');
      });

      it('should validate email format', async () => {
        const response = await request(apiUrl)
          .post('/api/auth/login')
          .send({
            email: 'invalid-email'
            password: process.env.TEST_PASSWORD || 'secure_test_password'
          })
          .expect(400);

        expect(response.body).to.have.property(STR_ERROR);
        expect(response.body.error).to.include('email');
      });

      it('should require password', async () => {
        const response = await request(apiUrl)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com'
          })
          .expect(400);

        expect(response.body).to.have.property(STR_ERROR);
        expect(response.body.error).to.include('password');
      });
    });

    describe('GET /api/auth/me', () => {
      let authToken;

      before(async () => {
        const loginResponse = await request(apiUrl)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com'
            password: process.env.TEST_PASSWORD || 'secure_test_password'
          });
        authToken = loginResponse.body.token;
      });

      it('should return user profile with valid token', async () => {
        const response = await request(apiUrl)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('email');
        expect(response.body).to.have.property('firstName');
        expect(response.body).to.have.property('lastName');
      });

      it('should reject requests without token', async () => {
        await request(apiUrl)
          .get('/api/auth/me')
          .expect(401);
      });

      it('should reject requests with invalid token', async () => {
        await request(apiUrl)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });
  });

  describe('Ideas Endpoints', () => {
    let authToken;

    before(async () => {
      const loginResponse = await request(apiUrl)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          password: process.env.TEST_PASSWORD || 'secure_test_password'
        });
      authToken = loginResponse.body.token;
    });

    describe('GET /api/ideas', () => {
      it('should return ideas list with authentication', async () => {
        const response = await request(apiUrl)
          .get('/api/ideas')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).to.be.an('array');
        expect(response.headers).to.have.property('x-total-count');
        expect(response.headers).to.have.property('x-page');
        expect(response.headers).to.have.property('x-limit');
      });

      it('should support pagination', async () => {
        const response = await request(apiUrl)
          .get('/api/ideas?
      page=1&limit=5')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.at.most(5);
        expect(response.headers['x-page']).to.equal('1');
        expect(response.headers['x-limit']).to.equal('5');
      });

      it('should support filtering by domain', async () => {
        const response = await request(apiUrl)
          .get('/api/ideas?domain=technology')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).to.be.an('array');
        response.body.forEach(idea => {
          expect(idea).to.have.property('domain', 'technology');
        });
      });

      it('should require authentication', async () => {
        await request(apiUrl)
          .get('/api/ideas')
          .expect(401);
      });
    });

    describe('POST /api/ideas', () => {
      const validIdea = {
        title :
       'AI-Powered Task Manager'
      description: 'An intelligent task management system that uses AI to prioritize and organize tasks automatically based on user behavior and deadlines.'
      domain: 'technology'
      targetMarket: 'Busy professionals and small business owners'
      uniqueValue: 'Machine learning algorithms that learn from user behavior'
      investmentRequired: '10000-50000'
      timeToMarket: 6
      riskLevel: 'medium'
      scalabilityPotential: 8
      marketSize: 'large'
      businessModel: 'subscription'
      };

      it('should create a new idea with valid data', async () => {
        const response = await request(apiUrl)
          .post('/api/ideas')
          .set('Authorization', `Bearer ${authToken}`)
          .send(validIdea)
          .expect(201);

        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title', validIdea.title);
        expect(response.body).to.have.property('domain', validIdea.domain);
        expect(response.body).to.have.property('userId');
        expect(response.body).to.have.property('createdAt');
      });

      it('should validate required fields', async () => {
        const response = await request(apiUrl)
          .post('/api/ideas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Incomplete Idea'
            // Missing required fields
          })
          .expect(400);

        expect(response.body).to.have.property(STR_ERROR);
        expect(response.body).to.have.property('details');
      });

      it('should validate business domain', async () => {
        const response = await request(apiUrl)
          .post('/api/ideas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...validIdea
            domain: 'invalid-domain'
          })
          .expect(400);

        expect(response.body).to.have.property(STR_ERROR);
        expect(response.body.error).to.include('domain');
      });

      it('should validate investment range', async () => {
        const response = await request(apiUrl)
          .post('/api/ideas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...validIdea
            investmentRequired: 'invalid-range'
          })
          .expect(400);

        expect(response.body).to.have.property(STR_ERROR);
        expect(response.body.error).to.include('investment');
      });

      it('should require authentication', async () => {
        await request(apiUrl)
          .post('/api/ideas')
          .send(validIdea)
          .expect(401);
      });
    });

    describe('GET /api/ideas/:id', () => {
      let ideaId;

      before(async () => {
        const createResponse = await request(apiUrl)
          .post('/api/ideas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Idea for Retrieval'
            description: 'A test idea to verify GET endpoint functionality'
            domain: 'technology'
            targetMarket: 'Test market'
            uniqueValue: 'Test value'
            investmentRequired: '1000-5000'
            timeToMarket: 3
            riskLevel: 'low'
            scalabilityPotential: 5
            marketSize: 'medium'
            businessModel: 'b2b'
          });
        ideaId = createResponse.body.id;
      });

      it('should return idea details', async () => {
        const response = await request(apiUrl)
          .get(`/api/ideas/${ideaId}')
          .set('Authorization', 'Bearer ${authToken}`)
          .expect(200);

        expect(response.body).to.have.property('id', ideaId);
        expect(response.body).to.have.property('title');
        expect(response.body).to.have.property('description');
        expect(response.body).to.have.property('domain');
      });

      it('should return 404 for non-existent idea', async () => {
        await request(apiUrl)
          .get('/api/ideas/nonexistent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should require authentication', async () => {
        await request(apiUrl)
          .get(`/api/ideas/${ideaId}`)
          .expect(401);
      });
    });
  });

  describe('AI Endpoints', () => {
    let authToken;

    before(async () => {
      const loginResponse = await request(apiUrl)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          password: process.env.TEST_PASSWORD || 'secure_test_password'
        });
      authToken = loginResponse.body.token;
    });

    describe('POST /api/ai/generate-ideas', () => {
      const validProfile = {
        profile: {
          skills: ['JavaScript'
      'React'
      'Node.js']
      experience: 5
      interests: ['Technology'
      'Automation'
      'Productivity']
      budget: '10000-50000'
      timeCommitment: 'part-time'
      riskTolerance: 'medium'
      preferredDomains: ['technology'
      'services']
        }
        count: 3
      };

      it('should generate ideas with valid profile', async () => {
        const response = await request(apiUrl)
          .post('/api/ai/generate-ideas')
          .set('Authorization', `Bearer ${authToken}`)
          .send(validProfile)
          .expect(200);

        expect(response.body).to.have.property('ideas');
        expect(response.body.ideas).to.be.an('array');
        expect(response.body.ideas.length).to.be.at.most(validProfile.count);
        
        response.body.ideas.forEach(idea => {
          expect(idea).to.have.property('title');
          expect(idea).to.have.property('description');
          expect(idea).to.have.property('domain');
          expect(idea).to.have.property('score');
        });
      });

      it('should validate profile skills', async () => {
        const response = await request(apiUrl)
          .post('/api/ai/generate-ideas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            profile: {
              ...validProfile.profile
              skills: [] // Empty skills array
            }
          })
          .expect(400);

        expect(response.body).to.have.property(STR_ERROR);
        expect(response.body.error).to.include('skills');
      });

      it('should validate experience range', async () => {
        const response = await request(apiUrl)
          .post('/api/ai/generate-ideas')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            profile: {
              ...validProfile.profile
              experience: -1 // Invalid experience
            }
          })
          .expect(400);

        expect(response.body).to.have.property(STR_ERROR);
      });

      it('should require authentication', async () => {
        await request(apiUrl)
          .post('/api/ai/generate-ideas')
          .send(validProfile)
          .expect(401);
      });
    });

    describe('POST /api/ai/chat', () => {
      const validChatRequest = {
        message: 'How can I improve my business idea?'
        context: {
          ideaId: 'test-idea-123'
        }
      };

      it('should respond to chat messages', async () => {
        const response = await request(apiUrl)
          .post('/api/ai/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send(validChatRequest)
          .expect(200);

        expect(response.body).to.have.property('response');
        expect(response.body).to.have.property('timestamp');
        expect(response.body).to.have.property('messageId');
        expect(response.body.response).to.be.a('string');
        expect(response.body.response.length).to.be.greaterThan(0);
      });

      it('should validate message content', async () => {
        const response = await request(apiUrl)
          .post('/api/ai/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            message: '' // Empty message
          })
          .expect(400);

        expect(response.body).to.have.property(STR_ERROR);
      });

      it('should require authentication', async () => {
        await request(apiUrl)
          .post('/api/ai/chat')
          .send(validChatRequest)
          .expect(401);
      });
    });
  });

  describe('Performance Tests', () => {
    let authToken;

    before(async () => {
      const loginResponse = await request(apiUrl)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          password: process.env.TEST_PASSWORD || 'secure_test_password'
        });
      authToken = loginResponse.body.token;
    });

    it('should handle concurrent requests', async function() {
      this.timeout(10000);

      const requests = Array(20).fill().map(() =>
        request(apiUrl)
          .get('/api/ideas')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).to.equal(200);
      });
    });

    it('should respond within acceptable time limits', async function() {
      this.timeout(5000);

      const startTime = Date.now();
      
      await request(apiUrl)
        .get('/api/ideas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.below(1000); // Should respond within 1 second
    });

    it('should handle rate limiting gracefully', async function() {
      this.timeout(15000);

      // Make many requests quickly to trigger rate limiting
      const requests = Array(60).fill().map(() =>
        request(apiUrl)
          .post('/api/ai/chat')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ message: 'Test message' })
      );

      const responses = await Promise.allSettled(requests);
      
      // Some requests should succeed, some may be rate limited
      const successful = responses.filter(r => r.status === 'fulfilled' && r.value.status === 200);
      const rateLimited = responses.filter(r => r.status === 'fulfilled' && r.value.status === 429);
      
      expect(successful.length).to.be.greaterThan(0);
      expect(successful.length + rateLimited.length).to.equal(responses.length);
    });
  });

  describe('Error Handling', () => {
    it('should return JSON error responses', async () => {
      const response = await request(apiUrl)
        .get('/api/nonexistent-endpoint')
        .expect(404);

      expect(response.body).to.have.property(STR_ERROR);
      expect(response.body).to.have.property('timestamp');
      expect(response.headers['content-type']).to.include(STR_JSON_CONTENT);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(apiUrl)
        .post('/api/ideas')
        .set('Content-Type', STR_JSON_CONTENT)
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).to.have.property(STR_ERROR);
    });

    it('should include request ID in error responses', async () => {
      const response = await request(apiUrl)
        .get('/api/nonexistent-endpoint')
        .expect(404);

      expect(response.headers).to.have.property('x-request-id');
      expect(response.body).to.have.property('requestId');
    });
  });
});