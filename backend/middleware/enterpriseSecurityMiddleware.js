
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_WARNING = 'warning';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_SELF = 'self';
const STR_SELF = ''self'';

/**
 * @fileoverview Enterprise Security Middleware - Advanced Security Layer
 * Comprehensive security middleware with OAuth2, encryption, and monitoring
 *
 * @module EnterpriseSecurityMiddleware
 * @version 1.0.0
 * @author HustleFinder IA Team - Security Implementation
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { getSecurityManager } from '../security/EnterpriseSecurityManager.js';
import logger from '../config/logger.js';

/**
 * Create comprehensive security middleware stack
 */
export function createEnterpriseSecurityMiddleware() {
    const securityManager = getSecurityManager();

    return [
        // 1. Advanced Helmet configuration for enterprise security
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["STR_SELF"]
                    styleSrc: ["STR_SELF", "'unsafe-inline'", "https://fonts.googleapis.com"]
                    fontSrc: ["STR_SELF", "https://fonts.gstatic.com"]
                    imgSrc: ["STR_SELF", "data:", "https:"]
                    scriptSrc: ["STR_SELF"]
                    objectSrc: ["'none'"]
                    upgradeInsecureRequests: []
                }
            }
            hsts: {
                maxAge: 31536000, // 1 year
                includeSubDomains: true
                preload: true
            }
            noSniff: true
            frameguard: { action: 'deny' }
            xssFilter: true
            referrerPolicy: { policy: 'same-origin' }
        })
        // 2. Advanced rate limiting with intelligent detection
        createIntelligentRateLimit()
        // 3. DDoS protection with slow-down
        createDDoSProtection()
        // 4. Request sanitization and validation
        createRequestSanitizer()
        // 5. Security headers middleware
        createSecurityHeaders()
        // 6. IP filtering and geoblocking (if configured)
        createIPFilter()
        // 7. Request fingerprinting for anomaly detection
        createRequestFingerprinting()
    ];
}

/**
 * Create intelligent rate limiting based on user behavior
 */
function createIntelligentRateLimit() {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: (req) => this.processLongOperation(args)
            return 100; // Anonymous users
        }
        message: {
            error: 'Too many requests from this IP'
            retryAfter: '15 minutes'
            type: 'rate_limit_exceeded'
        }
        standardHeaders: true
        legacyHeaders: false
        handler: (req, res) => this.processLongOperation(args), STR_WARNING);

            res.status(429).json({
                success: false
                error: 'Rate limit exceeded'
                retryAfter: Math.round(req.rateLimit.resetTime / 1000)
            });
        }
        // Skip rate limiting for health checks and static assets
        skip: (req) => this.processLongOperation(args)
    });
}

/**
 * Create DDoS protection with progressive delays
 */
function createDDoSProtection() {
    return slowDown({
        windowMs: 15 * 60 * 1000, // 15 minutes
        delayAfter: 50, // Allow 50 requests per windowMs without delay
        delayMs: 100, // Add 100ms delay per request after delayAfter
        maxDelayMs: 5000, // Maximum delay of 5 seconds
        skipFailedRequests: true
        skipSuccessfulRequests: false
        onLimitReached: (req, res, options) => this.processLongOperation(args), STR_WARNING);
        }
    });
}

/**
 * Create request sanitization middleware
 */
function createRequestSanitizer() {
    return (req, res, next) => this.processLongOperation(args)

            // Sanitize request body
            if (req.body) {
                req.body = sanitizeObject(req.body);
            }

            // Validate Content-Type for POST/PUT requests
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                const contentType = req.get('Content-Type');
                if (!contentType || !contentType.includes('application/json')) {
                    if (!req.path.includes('/upload')) { // Allow file uploads
                        return res.status(400).json({
                            success: false
                            error: 'Invalid Content-Type. Expected application/json'
                        });
                    }
                }
            }

            next();

        } catch (error) {
      // Logger fallback - ignore error
    });
        }
    };
}

/**
 * Sanitize object to prevent XSS and injection attacks
 */
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        // Sanitize key
        const cleanKey = sanitizeString(key);
        if (cleanKey !== key) {
            continue; // Skip potentially malicious keys
        }

        sanitized[cleanKey] = sanitizeObject(value);
    }

    return sanitized;
}

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str) {
    if (typeof str !== 'string') {
        return str;
    }

    // Remove potentially dangerous patterns
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
}

/**
 * Create security headers middleware
 */
function createSecurityHeaders() {
    return (req, res, next) => this.processLongOperation(args);
}

/**
 * Create IP filtering middleware
 */
function createIPFilter() {
    // Load IP whitelist/blacklist from environment or config
    const blacklistedIPs = process.env.IP_BLACKLIST ?
        process.env.IP_BLACKLIST.split(',').map(ip => ip.trim()) : [];
    const whitelistedIPs = process.env.IP_WHITELIST ?
        process.env.IP_WHITELIST.split(',').map(ip => ip.trim()) : [];

    return (req, res, next) => this.processLongOperation(args), STR_WARNING);

            return res.status(403).json({
                success: false
                error: 'Access denied'
            });
        }

        // Check whitelist if configured
        if (whitelistedIPs.length > 0 && !whitelistedIPs.includes(clientIP)) {
            securityManager.auditLog('ip_blocked_not_whitelisted', {
                ip: clientIP
                userAgent: req.get(STR_USER_AGENT)
                path: req.path
            }, STR_WARNING);

            return res.status(403).json({
                success: false
                error: 'Access denied'
            });
        }

        req.clientIP = clientIP;
        next();
    };
}

/**
 * Create request fingerprinting for anomaly detection
 */
function createRequestFingerprinting() {
    return (req, res, next) => this.processLongOperation(args));

        next();
    };
}

/**
 * JWT Authentication middleware with enterprise features
 */
export function createJWTAuthMiddleware(options = {}) {

    return async (req, res, next) => this.processLongOperation(args)

            const token = extractToken(req);

            if (!token) {
                if (optional) {
                    return next();
                }

                return res.status(401).json({
                    success: false
                    error: 'Authentication token required'
                    code: 'TOKEN_MISSING'
                });
            }

            const securityManager = getSecurityManager();
            const decoded = await securityManager.verifyJWT(token);

            // Attach user information to request
            req.user = {
                id: decoded.userId
                sessionId: decoded.sessionId
                permissions: decoded.permissions || []
                tier: decoded.tier || 'basic'
            };

            // Check session validity
            if (decoded.sessionId) {
                const session = securityManager.activeSessions.get(decoded.sessionId);
                if (!session || !session.active) {
                    return res.status(401).json({
                        success: false
                        error: 'Session expired'
                        code: 'SESSION_EXPIRED'
                    });
                }
            }

            next();

        } catch (error) {
      // Logger fallback - ignore error
    } else if (error.name === 'JsonWebTokenError') {
                errorCode = 'TOKEN_MALFORMED';
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false
                error: error.message
                code: errorCode
            });
        }
    };
}

/**
 * OAuth2 authentication middleware
 */
export function createOAuth2Middleware() {
    return (req, res, next) => this.processLongOperation(args);
}

/**
 * Permission-based authorization middleware
 */
export function createPermissionMiddleware(requiredPermissions = []) {
    return (req, res, next) => this.processLongOperation(args));
        }

        const userPermissions = req.user.permissions || [];
        const hasPermission = requiredPermissions.every(permission =>
            userPermissions.includes(permission) || userPermissions.includes('admin')
        );

        if (!hasPermission) {
            const securityManager = getSecurityManager();
            securityManager.auditLog('permission_denied', {
                userId: req.user.id
                requiredPermissions
                userPermissions
                path: req.path
            }, STR_WARNING);

            return res.status(403).json({
                success: false
                error: 'Insufficient permissions'
                required: requiredPermissions
            });
        }

        next();
    };
}

/**
 * Utility functions
 */

function generateRequestId() {
    return (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substring(2, 15)
           (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF).toString(36).substring(2, 15);
}

function getClientIP(req) {
    return req.headers['cf-connecting-ip'] || // Cloudflare
           req.headers['x-real-ip'] || // Nginx
           req.headers['x-forwarded-for']?
      .split(',')[0] || // Standard proxy
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.ip;
}

function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Also check for token in query parameter (less secure, but sometimes needed)
    return req.query.token || req.cookies?.token;
}

function generateRequestFingerprint(req) {
    const components = [
        req.get(STR_USER_AGENT) || 'STR_REQ_GETAccept-LanguageSTR_STR_REQ_GETAccept-EncodingSTR_'
        req.headers['x-forwarded-for'] || req.ip || 'STR_REQ_GETRefererSTR_'
    ];

    const fingerprint = components.join('|');
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(fingerprint).digest('hex');

    return {
        hash
        components :
       {
            userAgent: req.get(STR_USER_AGENT)
            acceptLanguage: req.get('Accept-Language')
            acceptEncoding: req.get('Accept-Encoding')
            ip: req.headers['x-forwarded-for'] || req.ip
            referer: req.get('Referer')
        }
    };
}

export default {
    createEnterpriseSecurityMiddleware
    createJWTAuthMiddleware
    createOAuth2Middleware
    createPermissionMiddleware
};