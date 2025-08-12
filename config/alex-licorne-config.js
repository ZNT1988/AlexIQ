const path = require('path');

class AlexLicorneConfig {
    constructor() {
        this.config = this.loadConfiguration();
        this.validateConfiguration();
    }

    loadConfiguration() {
        return {
            system: {
                name: 'Alex Licorne System',
                version: '1.0.0-licorne',
                environment: process.env.NODE_ENV || 'development',
                debug: process.env.DEBUG === 'true',
                timezone: 'Europe/Paris'
            },

            server: {
                port: parseInt(process.env.PORT) || 3001,
                host: process.env.HOST || 'localhost',
                cors: {
                    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                    credentials: true
                },
                rateLimit: {
                    windowMs: 15 * 60 * 1000,
                    max: process.env.RATE_LIMIT_MAX || 1000
                }
            },

            database: {
                type: 'sqlite',
                path: process.env.DB_PATH || './db/hustlefinder.sqlite',
                backup: {
                    enabled: true,
                    interval: 24 * 60 * 60 * 1000,
                    retention: 30,
                    path: './db/backups'
                }
            },

            orchestrator: {
                enabled: true,
                maxConcurrentTasks: 100,
                taskTimeout: 30000,
                retryAttempts: 3,
                modules: {
                    consciousness: {
                        enabled: true,
                        priority: 'high',
                        timeout: 15000
                    },
                    intelligence: {
                        enabled: true,
                        priority: 'high',
                        timeout: 10000
                    },
                    creativity: {
                        enabled: true,
                        priority: 'medium',
                        timeout: 20000
                    },
                    specialized: {
                        enabled: true,
                        priority: 'medium',
                        timeout: 15000
                    },
                    core: {
                        enabled: true,
                        priority: 'critical',
                        timeout: 5000
                    }
                }
            },

            monitoring: {
                enabled: true,
                interval: 5000,
                metrics: {
                    system: true,
                    performance: true,
                    business: true,
                    consciousness: true
                },
                alerts: {
                    email: process.env.ALERT_EMAIL || null,
                    webhook: process.env.ALERT_WEBHOOK || null,
                    thresholds: {
                        cpu: 80,
                        memory: 85,
                        responseTime: 2000,
                        errorRate: 5
                    }
                },
                dashboard: {
                    enabled: true,
                    refreshInterval: 1000,
                    historicalData: 7 * 24 * 60 * 60 * 1000
                }
            },

            multiTenant: {
                enabled: true,
                isolation: 'database',
                defaultTenant: 'default',
                tenantHeader: 'x-tenant-id',
                resourceLimits: {
                    maxRequestsPerHour: 10000,
                    maxConcurrentConnections: 100,
                    maxDataStorage: 1024 * 1024 * 1024
                },
                pricing: {
                    tiers: {
                        free: {
                            requests: 1000,
                            storage: 100 * 1024 * 1024,
                            features: ['basic_ai', 'basic_monitoring']
                        },
                        pro: {
                            requests: 50000,
                            storage: 1024 * 1024 * 1024,
                            features: ['advanced_ai', 'full_monitoring', 'custom_modules']
                        },
                        enterprise: {
                            requests: -1,
                            storage: -1,
                            features: ['all_features', 'dedicated_support', 'custom_deployment']
                        }
                    }
                }
            },

            consciousness: {
                enabled: true,
                levels: {
                    awareness: {
                        enabled: true,
                        threshold: 0.7,
                        updateInterval: 1000
                    },
                    selfReflection: {
                        enabled: true,
                        depth: 5,
                        frequency: 60000
                    },
                    learning: {
                        enabled: true,
                        adaptationRate: 0.1,
                        memoryRetention: 0.9
                    },
                    creativity: {
                        enabled: true,
                        randomness: 0.3,
                        noveltyThreshold: 0.8
                    }
                },
                measurement: {
                    enabled: true,
                    metrics: [
                        'awareness_score',
                        'creativity_index',
                        'learning_rate',
                        'decision_quality',
                        'emotional_intelligence'
                    ],
                    reportingInterval: 300000
                }
            },

            security: {
                authentication: {
                    enabled: true,
                    jwtSecret: process.env.JWT_SECRET || 'alex-licorne-secret-key',
                    expiresIn: '24h'
                },
                encryption: {
                    algorithm: 'aes-256-gcm',
                    keyLength: 32
                },
                rateLimit: {
                    enabled: true,
                    windowMs: 15 * 60 * 1000,
                    max: 1000
                },
                cors: {
                    enabled: true,
                    origins: ['http://localhost:3000']
                }
            },

            business: {
                analytics: {
                    enabled: true,
                    trackingLevel: 'detailed',
                    retention: 90 * 24 * 60 * 60 * 1000
                },
                billing: {
                    enabled: true,
                    currency: 'EUR',
                    provider: 'stripe',
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
                },
                revenue: {
                    tracking: true,
                    reporting: {
                        daily: true,
                        weekly: true,
                        monthly: true
                    }
                }
            },

            performance: {
                optimization: {
                    enabled: true,
                    caching: {
                        enabled: true,
                        ttl: 300000,
                        maxSize: 1000
                    },
                    compression: {
                        enabled: true,
                        level: 6
                    }
                },
                scaling: {
                    enabled: true,
                    autoScale: {
                        enabled: process.env.NODE_ENV === 'production',
                        minInstances: 1,
                        maxInstances: 10,
                        scaleThreshold: 80
                    }
                }
            },

            logging: {
                level: process.env.LOG_LEVEL || 'info',
                format: 'json',
                destinations: [
                    {
                        type: 'file',
                        path: './logs/alex-licorne.log',
                        maxSize: 10 * 1024 * 1024,
                        maxFiles: 5
                    },
                    {
                        type: 'console',
                        enabled: true
                    }
                ]
            },

            integrations: {
                openai: {
                    enabled: !!process.env.OPENAI_API_KEY,
                    apiKey: process.env.OPENAI_API_KEY,
                    model: 'gpt-4',
                    maxTokens: 4000
                },
                anthropic: {
                    enabled: !!process.env.ANTHROPIC_API_KEY,
                    apiKey: process.env.ANTHROPIC_API_KEY,
                    model: 'claude-3-sonnet'
                },
                stripe: {
                    enabled: !!process.env.STRIPE_SECRET_KEY,
                    secretKey: process.env.STRIPE_SECRET_KEY,
                    publicKey: process.env.STRIPE_PUBLIC_KEY
                }
            }
        };
    }

    validateConfiguration() {
        const required = [
            'system.name',
            'server.port',
            'database.path'
        ];

        for (const key of required) {
            if (!this.get(key)) {
                throw new Error(`Configuration manquante: ${key}`);
            }
        }

        if (this.get('server.port') < 1 || this.get('server.port') > 65535) {
            throw new Error('Port serveur invalide');
        }

        if (this.get('orchestrator.maxConcurrentTasks') < 1) {
            throw new Error('maxConcurrentTasks doit être >= 1');
        }
    }

    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value !== undefined ? value : defaultValue;
    }

    set(key, value) {
        const keys = key.split('.');
        let target = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!target[k] || typeof target[k] !== 'object') {
                target[k] = {};
            }
            target = target[k];
        }
        
        target[keys[keys.length - 1]] = value;
    }

    getServerConfig() {
        return this.get('server');
    }

    getDatabaseConfig() {
        return this.get('database');
    }

    getOrchestratorConfig() {
        return this.get('orchestrator');
    }

    getMonitoringConfig() {
        return this.get('monitoring');
    }

    getMultiTenantConfig() {
        return this.get('multiTenant');
    }

    getConsciousnessConfig() {
        return this.get('consciousness');
    }

    getSecurityConfig() {
        return this.get('security');
    }

    getBusinessConfig() {
        return this.get('business');
    }

    getPerformanceConfig() {
        return this.get('performance');
    }

    getLoggingConfig() {
        return this.get('logging');
    }

    getIntegrationsConfig() {
        return this.get('integrations');
    }

    isProduction() {
        return this.get('system.environment') === 'production';
    }

    isDevelopment() {
        return this.get('system.environment') === 'development';
    }

    isDebugEnabled() {
        return this.get('system.debug') === true;
    }

    toJSON() {
        const config = JSON.parse(JSON.stringify(this.config));
        
        if (config.security?.authentication?.jwtSecret) {
            config.security.authentication.jwtSecret = '[REDACTED]';
        }
        if (config.integrations?.openai?.apiKey) {
            config.integrations.openai.apiKey = '[REDACTED]';
        }
        if (config.integrations?.anthropic?.apiKey) {
            config.integrations.anthropic.apiKey = '[REDACTED]';
        }
        if (config.integrations?.stripe?.secretKey) {
            config.integrations.stripe.secretKey = '[REDACTED]';
        }
        
        return config;
    }

    reload() {
        this.config = this.loadConfiguration();
        this.validateConfiguration();
        console.log('✅ Configuration rechargée');
    }
}

const config = new AlexLicorneConfig();

module.exports = config;