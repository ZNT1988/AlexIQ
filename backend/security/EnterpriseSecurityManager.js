
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_OAUTH2 = 'oauth2';

/**
 * @fileoverview EnterpriseSecurityManager - Enterprise-Grade Security System
 * Advanced security framework with OAuth2, encryption, and audit trails
 *
 * @module EnterpriseSecurityManager
 * @version 1.0.0
 * @author HustleFinder IA Team - Security Implementation
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import { EventEmitter } from 'events';
import logger from '../config/logger.js';

/**
 * @class EnterpriseSecurityManager
 * @description Comprehensive enterprise security management system
 */
export class EnterpriseSecurityManager extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            jwtSecret: process.env.JWT_SECRET || this.generateSecureSecret()
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
      refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
      encryptionKey: process.env.ENCRYPTION_KEY || this.generateEncryptionKey()
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
      // OAuth2 Configuration
            oauth2: {
                clientID: process.env.OAUTH2_CLIENT_ID
      clientSecret: process.env.OAUTH2_CLIENT_SECRET
      authorizationURL: process.env.OAUTH2_AUTH_URL
      tokenURL: process.env.OAUTH2_TOKEN_URL
      callbackURL: process.env.OAUTH2_CALLBACK_URL || '/api/auth/oauth2/callback'
      scope: process.env.OAUTH2_SCOPE || 'read:user read:email'
            }
            // Security Policies
            policies: {
                passwordMinLength: 12
                passwordRequireSpecialChars: true
                passwordRequireNumbers: true
                passwordRequireUppercase: true
                passwordRequireLowercase: true
                maxLoginAttempts: 5
                lockoutDuration: 30 * 60 * 1000, // 30 minutes
                sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
                requireMFA: process.env.REQUIRE_MFA === 'true'
                auditLogging: true
            }
            ...options
        };

        this.auditLog = [];
        this.activeSessions = new Map();
        this.failedAttempts = new Map();
        this.lockedAccounts = new Map();

        this.initializePassport();
        this.setupAuditLogging();

        try {
      logger.info('🔒 Enterprise Security Manager initialized');

        } catch (error) {
    // Logger fallback - ignore error
  }}

    /**
     * Generate secure random secret
     */
    generateSecureSecret() {
        return crypto.randomBytes(64).toString('hex');
    }

    /**
     * Generate encryption key
     */
    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Initialize Passport OAuth2 strategy
     */
    initializePassport() {
        if (this.config.oauth2.clientID && this.config.oauth2.clientSecret) {
            passport.use(STR_OAUTH2, new OAuth2Strategy({
                authorizationURL: this.config.oauth2.authorizationURL
                tokenURL: this.config.oauth2.tokenURL
                clientID: this.config.oauth2.clientID
                clientSecret: this.config.oauth2.clientSecret
                callbackURL: this.config.oauth2.callbackURL
                scope: this.config.oauth2.scope
            }, async (accessToken, refreshToken, profile, done) => {
                try {
                    // Process OAuth2 user profile
                    const user = await this.processOAuth2User(profile, accessToken, refreshToken);
                    this.auditLog('oauth2_login', { userId: user.id, provider: STR_OAUTH2 });
                    return done(null, user);
                } catch (error) {
      // Logger fallback - ignore error
    });
                    return done(error, null);
                }
            }));

            try {
      logger.info('🔐 OAuth2 authentication strategy configured');

            } catch (error) {
    // Logger fallback - ignore error
  }} else {
            try {
      logger.warn('⚠️ OAuth2 credentials not configured, using fallback authentication');

            } catch (error) {
    // Logger fallback - ignore error
  }}
    }

    /**
     * Setup audit logging
     */
    setupAuditLogging() {
        if (this.config.policies.auditLogging) {
            this.on('security_event', (event) => {
                this.auditLog.push({
                    timestamp: new Date().toISOString()
                    event: event.type
                    details: event.details
                    severity: event.severity || STR_INFO
                    source: event.source || 'security_manager'
                });

                // Keep only last 10000 audit entries
                if (this.auditLog.length > 10000) {
                    this.auditLog = this.auditLog.slice(-10000);
                }

                try {
      logger.info(`🔍 Security Event: ${event.type}`, event.details);

                } catch (error) {
    // Logger fallback - ignore error
  }});

            try {
      logger.info('📝 Security audit logging enabled');

            } catch (error) {
    // Logger fallback - ignore error
  }}
    }

    /**
     * Audit logging helper
     */
    auditLog(eventType, details = {}, severity = STR_INFO) {
        this.emit('security_event', {
            type: eventType
            details
            severity
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Create JWT token with enhanced security
     */
    async createJWT(payload, options = {}) {
        try {
            const tokenPayload = {
                ...payload
                iat: Math.floor(Date.now() / 1000)
                jti: crypto.randomUUID(), // Unique token ID for revocation
                iss: 'hustlefinder-ia', // Issuer
                aud: 'hustlefinder-users' // Audience
            };

            const tokenOptions = {
                expiresIn: options.expiresIn || this.config.jwtExpiresIn
                algorithm: 'HS256'
                ...options
            };

            const token = jwt.sign(tokenPayload, this.config.jwtSecret, tokenOptions);

            this.auditLog('jwt_created', {
                userId: payload.userId
                jti: tokenPayload.jti
                expiresIn: tokenOptions.expiresIn
            });

            return token;

        } catch (error) {
      // Logger fallback - ignore error
    }, STR_ERROR);
            throw new Error('Token creation failed');
        }
    }

    /**
     * Verify JWT token with security checks
     */
    async verifyJWT(token) {
        try {
            const decoded = jwt.verify(token, this.config.jwtSecret);

            // Check if token is revoked (implement token blacklist if needed)
            if (await this.isTokenRevoked(decoded.jti)) {
                throw new Error('Token has been revoked');
            }

            // Check session validity
            if (decoded.sessionId && !this.activeSessions.has(decoded.sessionId)) {
                throw new Error('Session expired or invalid');
            }

            this.auditLog('jwt_verified', {
                userId: decoded.userId
                jti: decoded.jti
            });

            return decoded;

        } catch (error) {
      // Logger fallback - ignore error
    }, STR_WARNING);
            throw error;
        }
    }

    /**
     * Hash password with enterprise-grade security
     */
    async hashPassword(password) {
        try {
            // Validate password strength
            this.validatePasswordStrength(password);

            const salt = await bcrypt.genSalt(this.config.saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            this.auditLog('password_hashed', { saltRounds: this.config.saltRounds });

            return hashedPassword;

        } catch (error) {
      // Logger fallback - ignore error
    }, STR_ERROR);
            throw error;
        }
    }

    /**
     * Verify password with security checks
     */
    async verifyPassword(password, hashedPassword, userId) {
        try {
            // Check for account lockout
            if (this.isAccountLocked(userId)) {
                this.auditLog('login_attempt_locked_account', { userId }, STR_WARNING);
                throw new Error('Account is temporarily locked due to multiple failed attempts');
            }

            const isValid = await bcrypt.compare(password, hashedPassword);

            if (isValid) {
                // Reset failed attempts on successful login
                this.failedAttempts.delete(userId);
                this.auditLog('password_verified', { userId });
                return true;
            } else {
                // Track failed attempts
                this.trackFailedAttempt(userId);
                this.auditLog('password_verification_failed', { userId }, STR_WARNING);
                return false;
            }

        } catch (error) {
      // Logger fallback - ignore error
    }, STR_ERROR);
            throw error;
        }
    }

    /**
     * Validate password strength
     */
    validatePasswordStrength(password) {
        const policies = this.config.policies;
        const errors = [];

        if (password.length < policies.passwordMinLength) {
            errors.push(`Password must be at least ${policies.passwordMinLength} characters long`);
        }

        if (policies.passwordRequireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (policies.passwordRequireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (policies.passwordRequireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (policies.passwordRequireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?
      ]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        if (errors.length > 0) {
            throw new Error(`Password does not meet security requirements :
       ${errors.join(', ')}`);
        }
    }

    /**
     * Track failed login attempts
     */
    trackFailedAttempt(userId) {
        const attempts = this.failedAttempts.get(userId) || { count: 0, firstAttempt: Date.now() };
        attempts.count++;
        attempts.lastAttempt = Date.now();

        this.failedAttempts.set(userId, attempts);

        if (attempts.count >= this.config.policies.maxLoginAttempts) {
            this.lockAccount(userId);
        }
    }

    /**
     * Lock account due to failed attempts
     */
    lockAccount(userId) {
        const lockUntil = Date.now() + this.config.policies.lockoutDuration;
        this.lockedAccounts.set(userId, lockUntil);

        this.auditLog('account_locked', {
            userId
            lockDuration: this.config.policies.lockoutDuration
            lockUntil: new Date(lockUntil).toISOString()
        }, STR_WARNING);

        // Auto-unlock after lockout duration
        setTimeout(() => {
            this.unlockAccount(userId);
        }, this.config.policies.lockoutDuration);
    }

    /**
     * Unlock account
     */
    unlockAccount(userId) {
        this.lockedAccounts.delete(userId);
        this.failedAttempts.delete(userId);
        this.auditLog('account_unlocked', { userId });
    }

    /**
     * Check if account is locked
     */
    isAccountLocked(userId) {
        const lockUntil = this.lockedAccounts.get(userId);
        if (lockUntil && Date.now() < lockUntil) {
            return true;
        } else if (lockUntil) {
            // Auto-unlock expired locks
            this.unlockAccount(userId);
        }
        return false;
    }

    /**
     * Encrypt sensitive data
     */
    encrypt(text) {
        try {
            const encrypted = CryptoJS.AES.encrypt(text, this.config.encryptionKey).toString();
            this.auditLog('data_encrypted');
            return encrypted;
        } catch (error) {
            logger.error('Encryption error:', error);
            this.auditLog('encryption_error', { error: error.message }, STR_ERROR);
            throw error;
        }
    }

    /**
     * Decrypt sensitive data
     */
    decrypt(encryptedText) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedText, this.config.encryptionKey);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            this.auditLog('data_decrypted');
            return decrypted;
        } catch (error) {
            logger.error('Decryption error:', error);
            this.auditLog('decryption_error', { error: error.message }, STR_ERROR);
            throw error;
        }
    }

    /**
     * Create secure session
     */
    createSession(userId, metadata = {}) {
        const sessionId = crypto.randomUUID();
        const session = {
            id: sessionId
            userId
            createdAt: new Date()
            expiresAt: new Date(Date.now() + this.config.policies.sessionTimeout)
            metadata: {
                userAgent: metadata.userAgent
                ipAddress: metadata.ipAddress
                ...metadata
            }
            active: true
        };

        this.activeSessions.set(sessionId, session);

        this.auditLog('session_created', {
            sessionId
            userId
            expiresAt: session.expiresAt.toISOString()
        });

        // Auto-expire session
        setTimeout(() => {
            this.expireSession(sessionId);
        }, this.config.policies.sessionTimeout);

        return session;
    }

    /**
     * Expire session
     */
    expireSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.active = false;
            this.activeSessions.delete(sessionId);
            this.auditLog('session_expired', { sessionId, userId: session.userId });
        }
    }

    /**
     * Check if token is revoked (implement token blacklist)
     */
    async isTokenRevoked(jti) {
        // Implement token blacklist logic here
        // For now, return false (no revocation)
        return false;
    }

    /**
     * Process OAuth2 user profile
     */
    async processOAuth2User(profile, accessToken, refreshToken) {
        // Process OAuth2 user profile and create/update user
        // This is a placeholder implementation
        return {
            id: profile.id
            email: profile.emails?.[0]?.value
            name: profile.displayName
            provider: STR_OAUTH2
            accessToken
            refreshToken
        };
    }

    /**
     * Get security status and metrics
     */
    getSecurityStatus() {
        return {
            status: 'active'
            activeSessions: this.activeSessions.size
            lockedAccounts: this.lockedAccounts.size
            auditLogEntries: this.auditLog.length
            policies: {
                ...this.config.policies
                jwtExpiresIn: this.config.jwtExpiresIn
                refreshTokenExpiresIn: this.config.refreshTokenExpiresIn
            }
            oauth2Enabled: Boolean(this.config.oauth2.clientID)
            encryptionEnabled: Boolean(this.config.encryptionKey)
            auditingEnabled: this.config.policies.auditLogging
            features: [
                'enterprise_authentication'
                'oauth2_integration'
                'advanced_encryption'
                'audit_trails'
                'session_management'
                'account_lockout_protection'
                'password_strength_validation'
                'jwt_security'
            ]
        };
    }

    /**
     * Get audit log (filtered for security)
     */
    getAuditLog(limit = 100, severity = null) {
        let logs = this.auditLog;

        if (severity) {
            logs = logs.filter(log => log.severity === severity);
        }

        return logs
            .slice(-limit)
            .map(log => ({
                ...log
                // Remove sensitive data from audit logs
                details: this.sanitizeAuditDetails(log.details)
            }));
    }

    /**
     * Sanitize audit details for external consumption
     */
    sanitizeAuditDetails(details) {
        const sanitized = { ...details };

        // Remove sensitive fields
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.accessToken;
        delete sanitized.refreshToken;
        delete sanitized.encryptionKey;

        return sanitized;
    }

    /**
     * Shutdown security manager
     */
    async shutdown() {
        // Expire all active sessions
        for (const [sessionId] of this.activeSessions) {
            this.expireSession(sessionId);
        }

        // Clear sensitive data
        this.activeSessions.clear();
        this.failedAttempts.clear();
        this.lockedAccounts.clear();

        this.auditLog('security_manager_shutdown');
        try {
      logger.info('🔒 Enterprise Security Manager shutdown complete');

        } catch (error) {
    // Logger fallback - ignore error
  }}
}

// Singleton instance
let securityManagerInstance = null;

/**
 * Get singleton security manager instance
 */
export function getSecurityManager() {
    if (!securityManagerInstance) {
        securityManagerInstance = new EnterpriseSecurityManager();
    }
    return securityManagerInstance;
}

export default EnterpriseSecurityManager;