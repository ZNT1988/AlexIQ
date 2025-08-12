import crypto from 'crypto';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_POST = 'POST';
// Unit Tests for Middleware - HustleFinderIA
import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import express from 'express';
import Joi from 'joi';

// Setup Chai plugins
use(sinonChai);

// Import middleware
import security from '../../middleware/security.js';
import errorHandler from '../../middleware/errorHandler.js';

describe('Middleware Tests', () => {
  let app, req, res, next;

  beforeEach(() => {
    app = express();
    req = {
      method: 'GET'
      path: '/test'
      headers: {}
      get: sinon.stub()
      ip: '127.0.0.1'
    };
    res = {
      status: sinon.stub().returnsThis()
      json: sinon.stub().returnsThis()
      setHeader: sinon.stub()
      on: sinon.stub()
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Security Middleware', () => {
    describe('validateRequest', () => {
      it('should set security headers', () => {
        security.validateRequest(req, res, next);

        expect(res.setHeader).to.have.been.calledWith('X-Content-Type-Options', 'nosniff');
        expect(res.setHeader).to.have.been.calledWith('X-Frame-Options', 'DENY');
        expect(res.setHeader).to.have.been.calledWith('X-XSS-Protection', '1; mode=block');
        expect(next).to.have.been.called;
      });

      it('should reject requests that are too large', () => {
        req.get.withArgs('content-length').returns('11000000'); // 11MB

        security.validateRequest(req, res, next);

        expect(res.status).to.have.been.calledWith(413);
        expect(res.json).to.have.been.calledWith({
          error: 'Request too large'
          maxSize: '10MB'
        });
        expect(next).not.to.have.been.called;
      });

      it('should validate Content-Type for POST requests', () => {
        req.method = STR_POST;
        req.get.withArgs('content-type').returns('text/plain');

        security.validateRequest(req, res, next);

        expect(res.status).to.have.been.calledWith(400);
        expect(res.json).to.have.been.calledWith({
          error: 'Invalid Content-Type'
          expected: STR_JSON_CONTENT
        });
        expect(next).not.to.have.been.called;
      });

      it('should allow valid POST requests', () => {
        req.method = STR_POST;
        req.get.withArgs('content-type').returns(STR_JSON_CONTENT);
        req.get.withArgs('content-length').returns('1000');

        security.validateRequest(req, res, next);

        expect(next).to.have.been.called;
      });
    });

    describe('validateApiKey', () => {
      beforeEach(() => {
        process.env.VALID_API_KEYS = 'key1,key2,key3';
      });

      it('should reject requests without API key', () => {
        req.headers = {};

        security.validateApiKey(req, res, next);

        expect(res.status).to.have.been.calledWith(401);
        expect(res.json).to.have.been.calledWith({
          error: 'API key required'
          header: 'X-API-Key'
        });
        expect(next).not.to.have.been.called;
      });

      it('should reject invalid API keys', () => {
        req.headers = { 'x-api-key': 'invalid-key' };

        security.validateApiKey(req, res, next);

        expect(res.status).to.have.been.calledWith(401);
        expect(res.json).to.have.been.calledWith({
          error: 'Invalid API key'
        });
        expect(next).not.to.have.been.called;
      });

      it('should accept valid API keys', () => {
        req.headers = { 'x-api-key': 'key1' };

        security.validateApiKey(req, res, next);

        expect(next).to.have.been.called;
      });
    });

    describe('createIPWhitelist', () => {
      it('should allow requests from whitelisted IPs', () => {
        const whitelist = security.createIPWhitelist(['127.0.0.1']);
        req.ip = '127.0.0.1';

        whitelist(req, res, next);

        expect(next).to.have.been.called;
      });

      it('should reject requests from non-whitelisted IPs', () => {
        const whitelist = security.createIPWhitelist(['192.168.1.1']);
        req.ip = '127.0.0.1';

        whitelist(req, res, next);

        expect(res.status).to.have.been.calledWith(403);
        expect(res.json).to.have.been.calledWith({
          error: 'Access denied'
          reason: 'IP not whitelisted'
        });
        expect(next).not.to.have.been.called;
      });

      it('should allow all IPs when whitelist is empty', () => {
        const whitelist = security.createIPWhitelist([]);
        req.ip = '127.0.0.1';

        whitelist(req, res, next);

        expect(next).to.have.been.called;
      });
    });
  });

  describe('Error Handler Middleware', () => {
    let mockLogger;

    beforeEach(() => {
      mockLogger = {
        error: sinon.stub()
        warn: sinon.stub()
        info: sinon.stub()
        debug: sinon.stub()
      };
    });

    describe('Error Classes', () => {
      it('should create AppError with correct properties', () => {
        const error = new errorHandler.AppError('Test error', 400);

        expect(error.message).to.equal('Test error');
        expect(error.statusCode).to.equal(400);
        expect(error.isOperational).to.be.true;
        expect(error.timestamp).to.be.a('string');
      });

      it('should create ValidationError with details', () => {
        const details = { field: 'Invalid value' };
        const error = new errorHandler.ValidationError('Validation failed', details);

        expect(error.statusCode).to.equal(400);
        expect(error.details).to.deep.equal(details);
        expect(error.name).to.equal('ValidationError');
      });

      it('should create AuthenticationError with 401 status', () => {
        const error = new errorHandler.AuthenticationError();

        expect(error.statusCode).to.equal(401);
        expect(error.message).to.equal('Authentication required');
      });

      it('should create NotFoundError with 404 status', () => {
        const error = new errorHandler.NotFoundError('User');

        expect(error.statusCode).to.equal(404);
        expect(error.message).to.equal('User not found');
      });
    });

    describe('asyncHandler', () => {
      it('should catch and forward async errors', async () => {
        const asyncFn = async () => {
          throw new Error('Async error');
        };

        const wrappedFn = errorHandler.asyncHandler(asyncFn);
        await wrappedFn(req, res, next);

        expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error));
      });

      it('should not interfere with successful async operations', async () => {
        const asyncFn = async (req, res) => {
          res.json({ success: true });
        };

        const wrappedFn = errorHandler.asyncHandler(asyncFn);
        await wrappedFn(req, res, next);

        expect(next).not.to.have.been.called;
      });
    });

    describe('notFoundHandler', () => {
      it('should create NotFoundError for unmatched routes', () => {
        req.originalUrl = '/api/nonexistent';

        errorHandler.notFoundHandler(req, res, next);

        expect(next).to.have.been.calledWith(
          sinon.match.instanceOf(errorHandler.NotFoundError)
        );
      });
    });

    describe('validateSchema', () => {
      const schema = Joi.object({
        name: Joi.string().required()
        age: Joi.number().min(0).required()
      });

      it('should validate valid data', () => {
        req.body = { name: 'John', age: 25 };
        const validator = errorHandler.validateSchema(schema);

        validator(req, res, next);

        expect(req.validatedBody).to.deep.equal({ name: 'John', age: 25 });
        expect(next).to.have.been.called;
      });

      it('should reject invalid data', () => {
        req.body = { name: '', age: -5 };
        const validator = errorHandler.validateSchema(schema);

        validator(req, res, next);

        expect(next).to.have.been.calledWith(
          sinon.match.instanceOf(errorHandler.ValidationError)
        );
      });

      it('should strip unknown properties', () => {
        req.body = { name: 'John', age: 25, unknown: 'value' };
        const validator = errorHandler.validateSchema(schema);

        validator(req, res, next);

        expect(req.validatedBody).to.deep.equal({ name: 'John', age: 25 });
        expect(req.validatedBody.unknown).to.be.undefined;
      });
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      app.use(express.json());
      app.use(security.validateRequest);
      app.use(security.securityLogger);
    });

    it('should handle valid requests properly', async () => {
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body).to.deep.equal({ success: true });
    });

    it('should reject oversized requests', async () => {
      app.post('/test', (req, res) => {
        res.json({ success: true });
      });

      await request(app)
        .post('/test')
        .set('Content-Length', '11000000')
        .send({ data: 'test' })
        .expect(413);
    });

    it('should detect suspicious patterns', async () => {
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      // This should trigger security logging
      await request(app)
        .get('/test?
      query=<script>alert("xss")</script>')
        .expect(200);
    });

    it('should handle API key validation', async () => {
      process.env.VALID_API_KEYS = 'test-key-123';
      app.use('/api', security.validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success :
       true });
      });

      // Valid API key
      await request(app)
        .get('/api/test')
        .set('X-API-Key', 'test-key-123')
        .expect(200);

      // Invalid API key
      await request(app)
        .get('/api/test')
        .set('X-API-Key', 'invalid-key')
        .expect(401);

      // Missing API key
      await request(app)
        .get('/api/test')
        .expect(401);
    });
  });

  describe('Performance Tests', () => {
    it('should handle high request volumes', async function() {
      this.timeout(5000);
      
      app.get('/test', (req, res) => {
        res.json({ timestamp: Date.now() });
      });

      const requests = Array(100).fill().map(() => 
        request(app).get('/test').expect(200)
      );

      const responses = await Promise.all(requests);
      expect(responses).to.have.length(100);
    });

    it('should maintain low response times under load', async function() {
      this.timeout(10000);
      
      app.get('/test', (req, res) => {
        // Simulate some processing time
        setTimeout(() => {
          res.json({ success: true });
        }, (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) * 10);
      });

      const startTime = Date.now();
      const requests = Array(50).fill().map(() => 
        request(app).get('/test').expect(200)
      );

      await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / 50;

      expect(avgTime).to.be.below(100); // Average should be under 100ms
    });
  });
});