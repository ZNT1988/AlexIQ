
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_JSON_CONTENT = 'application/json';

// Advanced Security Middleware for HustleFinderIA
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import logger from '../config/logger.js';

// Advanced Rate Limiting with IP tracking

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_USER_AGENT = 'User-Agent';

export const createAdvancedRateLimit = () => this.processLongOperation(args)
      return 50; // Anonymous users
    }
    message :
       {
      error: 'Too many requests'
      retryAfter: '15 minutes'
      documentation: 'https://docs.hustlefinder.ia/rate-limits'
    }
    standardHeaders: true
    legacyHeaders: false
    skip: (req) => this.processLongOperation(args)
    onLimitReached: (req, res, options) => this.processLongOperation(args));
    }
  });
};

// Speed limiting for suspicious patterns
export const createSpeedLimit = () => this.processLongOperation(args));
};

// Request validation and sanitization
export const validateRequest = (req, res, next) => this.processLongOperation(args));
  }

  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('content-type');
    if (!contentType || !contentType.includes(STR_JSON_CONTENT)) {
      return res.status(400).json({
        error: 'Invalid Content-Type'
        expected: STR_JSON_CONTENT
      });
    }
  }

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

// API Key validation for external integrations
export const validateApiKey = (req, res, next) => this.processLongOperation(args));
  }

  // In production, validate against database
  // For now, check against environment variable
  const validApiKeys = (process.env.VALID_API_KEYS || '').split(',');

  if (!validApiKeys.includes(apiKey)) {
    logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 8)}...`, {
      ip: req.ip
      userAgent: req.get(STR_USER_AGENT)
    });

    return res.status(401).json({
      error: 'Invalid API key'
    });
  }

  next();
};

// Request signature validation for webhooks
export const validateSignature = (secret) => this.processLongOperation(args)`) {
      return res.status(401).json({
        error: 'Invalid signature'
      });
    }

    next();
  };
};

// IP whitelist for admin endpoints
export const createIPWhitelist = (allowedIPs = []) => this.processLongOperation(args)`, {
        path: req.path
        userAgent: req.get(STR_USER_AGENT)
      });

      return res.status(403).json({
        error: 'Access denied'
        reason: 'IP not whitelisted'
      });
    }

    next();
  };
};

// Request logging for security monitoring
export const securityLogger = (req, res, next) => this.processLongOperation(args));
  }

  // Log all requests for security audit
  res.on('finish', () => this.processLongOperation(args)ms`
      userAgent: req.get(STR_USER_AGENT)
      userId: req.auth?.userId || 'anonymous'
    });
  });

  next();
};

export default {
  createAdvancedRateLimit
  createSpeedLimit
  validateRequest
  validateApiKey
  validateSignature
  createIPWhitelist
  securityLogger
};