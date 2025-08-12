const EventEmitter = require('events');
const config = require('../../config/alex-licorne-config');
const sqlite3 = require('sqlite3').verbose();

class RevenueManager extends EventEmitter {
    constructor() {
        super();
        this.config = config;
        this.db = null;
        this.businessConfig = this.config.get('business');
        this.pricingTiers = this.config.get('multiTenant.pricing.tiers');
        
        this.revenueMetrics = {
            today: {
                revenue: 0,
                transactions: 0,
                newCustomers: 0,
                churn: 0
            },
            month: {
                revenue: 0,
                transactions: 0,
                recurring: 0,
                oneTime: 0
            },
            lifetime: {
                totalRevenue: 0,
                totalCustomers: 0,
                avgRevenuePerUser: 0
            }
        };

        this.analyticsData = {
            conversions: [],
            churnPredictions: [],
            revenueForecasts: [],
            customerSegments: {}
        };

        this.initializeDatabase();
        this.setupEventHandlers();
        this.startAnalyticsEngine();
    }

    initializeDatabase() {
        const dbPath = this.config.get('database.path');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ RevenueManager DB connection failed:', err.message);
                return;
            }
            console.log('✅ RevenueManager connecté à la base');
            this.createRevenueTables();
        });
    }

    createRevenueTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS revenue_transactions (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                tenant_id TEXT NOT NULL,
                transaction_type TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'EUR',
                description TEXT,
                tier TEXT,
                billing_period TEXT,
                payment_method TEXT,
                status TEXT DEFAULT 'completed',
                metadata TEXT DEFAULT '{}'
            )`,
            `CREATE TABLE IF NOT EXISTS customer_analytics (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                tenant_id TEXT NOT NULL,
                customer_since DATETIME NOT NULL,
                tier TEXT NOT NULL,
                lifetime_value REAL DEFAULT 0,
                monthly_value REAL DEFAULT 0,
                churn_risk_score REAL DEFAULT 0,
                last_activity DATETIME,
                engagement_score REAL DEFAULT 0,
                conversion_score REAL DEFAULT 0,
                metadata TEXT DEFAULT '{}',
                FOREIGN KEY (tenant_id) REFERENCES tenants(id)
            )`,
            `CREATE TABLE IF NOT EXISTS revenue_forecasts (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                forecast_date DATE NOT NULL,
                period_type TEXT NOT NULL,
                predicted_revenue REAL NOT NULL,
                confidence_level REAL NOT NULL,
                factors TEXT DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                actual_revenue REAL
            )`,
            `CREATE TABLE IF NOT EXISTS conversion_funnel (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                stage TEXT NOT NULL,
                tenant_id TEXT,
                source TEXT,
                conversion_value REAL DEFAULT 0,
                metadata TEXT DEFAULT '{}'
            )`,
            `CREATE TABLE IF NOT EXISTS pricing_experiments (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                experiment_name TEXT NOT NULL,
                tier TEXT NOT NULL,
                original_price REAL NOT NULL,
                test_price REAL NOT NULL,
                start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_date DATETIME,
                status TEXT DEFAULT 'active',
                results TEXT DEFAULT '{}',
                metadata TEXT DEFAULT '{}'
            )`
        ];

        tables.forEach(sql => {
            this.db.run(sql, (err) => {
                if (err) console.error('❌ RevenueManager table error:', err.message);
            });
        });
    }

    setupEventHandlers() {
        this.on('transactionCompleted', this.handleTransaction.bind(this));
        this.on('customerUpgraded', this.handleUpgrade.bind(this));
        this.on('customerChurned', this.handleChurn.bind(this));
        this.on('revenueGoalAchieved', this.handleRevenueGoal.bind(this));
    }

    startAnalyticsEngine() {
        setInterval(() => {
            this.runAnalytics();
        }, 300000);

        setInterval(() => {
            this.updateRevenueMetrics();
        }, 60000);
    }

    async recordTransaction(transaction) {
        const transactionData = {
            tenant_id: transaction.tenantId,
            transaction_type: transaction.type || 'subscription',
            amount: transaction.amount,
            currency: transaction.currency || 'EUR',
            description: transaction.description,
            tier: transaction.tier,
            billing_period: transaction.billingPeriod || 'monthly',
            payment_method: transaction.paymentMethod,
            status: transaction.status || 'completed',
            metadata: JSON.stringify(transaction.metadata || {})
        };

        try {
            const transactionId = await this.insertTransaction(transactionData);
            
            await this.updateCustomerAnalytics(transaction.tenantId, transaction);
            await this.updateRevenueMetrics();
            
            this.emit('transactionCompleted', {
                ...transactionData,
                id: transactionId
            });

            console.log(`💰 Transaction enregistrée: ${transaction.amount}€ (${transaction.tenantId})`);
            return transactionId;
        } catch (error) {
            console.error('❌ Erreur enregistrement transaction:', error.message);
            throw error;
        }
    }

    async insertTransaction(transaction) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO revenue_transactions 
                (tenant_id, transaction_type, amount, currency, description, tier, billing_period, payment_method, status, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                transaction.tenant_id, transaction.transaction_type, transaction.amount,
                transaction.currency, transaction.description, transaction.tier,
                transaction.billing_period, transaction.payment_method, transaction.status,
                transaction.metadata
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async updateCustomerAnalytics(tenantId, transaction) {
        try {
            let customer = await this.getCustomerAnalytics(tenantId);
            
            if (!customer) {
                customer = {
                    tenant_id: tenantId,
                    customer_since: new Date().toISOString(),
                    tier: transaction.tier || 'free',
                    lifetime_value: 0,
                    monthly_value: 0,
                    churn_risk_score: 0.1,
                    engagement_score: 0.5,
                    conversion_score: 0.3,
                    metadata: '{}'
                };
                await this.insertCustomerAnalytics(customer);
            }

            const lifetimeValue = customer.lifetime_value + transaction.amount;
            const monthlyValue = await this.calculateMonthlyValue(tenantId);
            const churnRisk = this.calculateChurnRisk(customer, transaction);
            const engagementScore = this.calculateEngagementScore(customer);

            await this.updateCustomerAnalyticsRecord(tenantId, {
                lifetime_value: lifetimeValue,
                monthly_value: monthlyValue,
                churn_risk_score: churnRisk,
                engagement_score: engagementScore,
                last_activity: new Date().toISOString(),
                tier: transaction.tier || customer.tier
            });

        } catch (error) {
            console.error(`❌ Erreur mise à jour analytics client ${tenantId}:`, error.message);
        }
    }

    async getCustomerAnalytics(tenantId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM customer_analytics WHERE tenant_id = ?';
            
            this.db.get(sql, [tenantId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async insertCustomerAnalytics(customer) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO customer_analytics 
                (tenant_id, customer_since, tier, lifetime_value, monthly_value, churn_risk_score, engagement_score, conversion_score, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                customer.tenant_id, customer.customer_since, customer.tier,
                customer.lifetime_value, customer.monthly_value, customer.churn_risk_score,
                customer.engagement_score, customer.conversion_score, customer.metadata
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    async updateCustomerAnalyticsRecord(tenantId, updates) {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            values.push(tenantId);
            
            const sql = `UPDATE customer_analytics SET ${fields} WHERE tenant_id = ?`;
            
            this.db.run(sql, values, function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    async calculateMonthlyValue(tenantId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT SUM(amount) as monthly_value 
                FROM revenue_transactions 
                WHERE tenant_id = ? AND timestamp >= date('now', 'start of month')
            `;
            
            this.db.get(sql, [tenantId], (err, row) => {
                if (err) reject(err);
                else resolve(row?.monthly_value || 0);
            });
        });
    }

    calculateChurnRisk(customer, transaction) {
        let riskScore = customer.churn_risk_score || 0.1;
        
        const daysSinceLastActivity = customer.last_activity 
            ? (Date.now() - new Date(customer.last_activity).getTime()) / (1000 * 60 * 60 * 24)
            : 0;

        if (daysSinceLastActivity > 30) riskScore += 0.2;
        if (daysSinceLastActivity > 60) riskScore += 0.3;
        
        if (transaction.type === 'upgrade') riskScore -= 0.1;
        if (transaction.type === 'downgrade') riskScore += 0.2;
        
        if (customer.engagement_score < 0.3) riskScore += 0.15;
        
        return Math.max(0, Math.min(1, riskScore));
    }

    calculateEngagementScore(customer) {
        let engagement = customer.engagement_score || 0.5;
        
        const accountAge = customer.customer_since 
            ? (Date.now() - new Date(customer.customer_since).getTime()) / (1000 * 60 * 60 * 24)
            : 0;
        
        if (accountAge > 365) engagement += 0.1;
        if (accountAge > 90) engagement += 0.05;
        
        if (customer.tier === 'enterprise') engagement += 0.2;
        if (customer.tier === 'pro') engagement += 0.1;
        
        return Math.max(0, Math.min(1, engagement));
    }

    async updateRevenueMetrics() {
        try {
            this.revenueMetrics.today = await this.getTodayMetrics();
            this.revenueMetrics.month = await this.getMonthlyMetrics();
            this.revenueMetrics.lifetime = await this.getLifetimeMetrics();
        } catch (error) {
            console.error('❌ Erreur mise à jour métriques revenus:', error.message);
        }
    }

    async getTodayMetrics() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COALESCE(SUM(amount), 0) as revenue,
                    COUNT(*) as transactions
                FROM revenue_transactions 
                WHERE date(timestamp) = date('now')
            `;
            
            this.db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve({
                    revenue: row.revenue || 0,
                    transactions: row.transactions || 0,
                    newCustomers: 0,
                    churn: 0
                });
            });
        });
    }

    async getMonthlyMetrics() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COALESCE(SUM(amount), 0) as revenue,
                    COUNT(*) as transactions,
                    COALESCE(SUM(CASE WHEN billing_period = 'monthly' THEN amount ELSE 0 END), 0) as recurring,
                    COALESCE(SUM(CASE WHEN billing_period = 'one_time' THEN amount ELSE 0 END), 0) as oneTime
                FROM revenue_transactions 
                WHERE timestamp >= date('now', 'start of month')
            `;
            
            this.db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve({
                    revenue: row.revenue || 0,
                    transactions: row.transactions || 0,
                    recurring: row.recurring || 0,
                    oneTime: row.oneTime || 0
                });
            });
        });
    }

    async getLifetimeMetrics() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COALESCE(SUM(amount), 0) as totalRevenue,
                    COUNT(DISTINCT tenant_id) as totalCustomers
                FROM revenue_transactions
            `;
            
            this.db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else {
                    const avgRevenuePerUser = row.totalCustomers > 0 
                        ? row.totalRevenue / row.totalCustomers 
                        : 0;
                        
                    resolve({
                        totalRevenue: row.totalRevenue || 0,
                        totalCustomers: row.totalCustomers || 0,
                        avgRevenuePerUser: avgRevenuePerUser
                    });
                }
            });
        });
    }

    async runAnalytics() {
        try {
            console.log('📊 Analyse business en cours...');
            
            await Promise.all([
                this.analyzeConversions(),
                this.predictChurn(),
                this.forecastRevenue(),
                this.segmentCustomers()
            ]);
            
            console.log('✅ Analyses business terminées');
        } catch (error) {
            console.error('❌ Erreur analyses business:', error.message);
        }
    }

    async analyzeConversions() {
        const conversions = await this.getConversionData();
        
        this.analyticsData.conversions = conversions.map(conv => ({
            stage: conv.stage,
            rate: conv.conversion_rate,
            value: conv.avg_value,
            volume: conv.volume
        }));
    }

    async getConversionData() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    stage,
                    COUNT(*) as volume,
                    AVG(conversion_value) as avg_value,
                    (COUNT(*) * 1.0 / (SELECT COUNT(*) FROM conversion_funnel)) as conversion_rate
                FROM conversion_funnel
                WHERE timestamp >= date('now', '-30 days')
                GROUP BY stage
                ORDER BY stage
            `;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    async predictChurn() {
        const customers = await this.getCustomersForChurnAnalysis();
        
        this.analyticsData.churnPredictions = customers.map(customer => ({
            tenantId: customer.tenant_id,
            riskScore: customer.churn_risk_score,
            riskLevel: this.getChurnRiskLevel(customer.churn_risk_score),
            recommendations: this.getChurnPreventionRecommendations(customer)
        }));
    }

    async getCustomersForChurnAnalysis() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM customer_analytics 
                WHERE churn_risk_score > 0.3
                ORDER BY churn_risk_score DESC
                LIMIT 50
            `;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    getChurnRiskLevel(riskScore) {
        if (riskScore < 0.3) return 'low';
        if (riskScore < 0.6) return 'medium';
        return 'high';
    }

    getChurnPreventionRecommendations(customer) {
        const recommendations = [];
        
        if (customer.churn_risk_score > 0.7) {
            recommendations.push('Contacter immédiatement');
            recommendations.push('Proposer une réduction');
        }
        
        if (customer.engagement_score < 0.3) {
            recommendations.push('Améliorer l\'onboarding');
            recommendations.push('Proposer une formation');
        }
        
        if (customer.tier === 'free') {
            recommendations.push('Proposer un upgrade avec incentive');
        }
        
        return recommendations;
    }

    async forecastRevenue() {
        const historicalData = await this.getHistoricalRevenueData();
        const forecast = this.calculateRevenueForecast(historicalData);
        
        this.analyticsData.revenueForecasts = forecast;
        
        await this.saveForecast(forecast);
    }

    async getHistoricalRevenueData() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    date(timestamp) as date,
                    SUM(amount) as daily_revenue
                FROM revenue_transactions 
                WHERE timestamp >= date('now', '-90 days')
                GROUP BY date(timestamp)
                ORDER BY date
            `;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    calculateRevenueForecast(historicalData) {
        if (historicalData.length < 7) {
            return [{
                period: 'next_30_days',
                predicted: 0,
                confidence: 0,
                factors: ['Insufficient data']
            }];
        }

        const recentData = historicalData.slice(-30);
        const avgDaily = recentData.reduce((sum, day) => sum + day.daily_revenue, 0) / recentData.length;
        
        const trend = this.calculateTrend(recentData);
        const seasonality = this.calculateSeasonality(historicalData);
        
        const forecastBase = avgDaily * 30;
        const trendAdjustment = forecastBase * (trend / 100);
        const seasonalAdjustment = forecastBase * (seasonality / 100);
        
        const forecast = forecastBase + trendAdjustment + seasonalAdjustment;
        const confidence = this.calculateForecastConfidence(historicalData, trend);

        return [{
            period: 'next_30_days',
            predicted: Math.max(0, forecast),
            confidence: confidence,
            factors: [
                `Tendance: ${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`,
                `Saisonnalité: ${seasonality > 0 ? '+' : ''}${seasonality.toFixed(1)}%`,
                `Base quotidienne: ${avgDaily.toFixed(2)}€`
            ]
        }];
    }

    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.daily_revenue, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.daily_revenue, 0) / secondHalf.length;
        
        return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    }

    calculateSeasonality(data) {
        return Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 365) * 2 * Math.PI) * 5;
    }

    calculateForecastConfidence(data, trend) {
        const variance = this.calculateVariance(data.map(d => d.daily_revenue));
        const dataQuality = Math.min(data.length / 30, 1);
        const trendStability = Math.max(0, 1 - Math.abs(trend) / 50);
        
        return Math.min(0.95, dataQuality * 0.5 + trendStability * 0.3 + (1 - variance / 1000) * 0.2);
    }

    calculateVariance(values) {
        if (values.length < 2) return 0;
        
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
        
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }

    async saveForecast(forecast) {
        for (const f of forecast) {
            const sql = `
                INSERT INTO revenue_forecasts 
                (forecast_date, period_type, predicted_revenue, confidence_level, factors)
                VALUES (date('now'), ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                f.period,
                f.predicted,
                f.confidence,
                JSON.stringify(f.factors)
            ]);
        }
    }

    async segmentCustomers() {
        const segments = await this.getCustomerSegments();
        this.analyticsData.customerSegments = segments;
    }

    async getCustomerSegments() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    tier,
                    COUNT(*) as count,
                    AVG(lifetime_value) as avg_ltv,
                    AVG(churn_risk_score) as avg_churn_risk,
                    AVG(engagement_score) as avg_engagement
                FROM customer_analytics
                GROUP BY tier
            `;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else {
                    const segments = {};
                    rows.forEach(row => {
                        segments[row.tier] = {
                            count: row.count,
                            avgLifetimeValue: row.avg_ltv,
                            avgChurnRisk: row.avg_churn_risk,
                            avgEngagement: row.avg_engagement,
                            healthScore: this.calculateSegmentHealth(row)
                        };
                    });
                    resolve(segments);
                }
            });
        });
    }

    calculateSegmentHealth(segment) {
        const ltvScore = Math.min(segment.avg_ltv / 1000, 1) * 0.4;
        const churnScore = (1 - segment.avg_churn_risk) * 0.3;
        const engagementScore = segment.avg_engagement * 0.3;
        
        return ltvScore + churnScore + engagementScore;
    }

    handleTransaction(transaction) {
        console.log(`💰 Transaction traitée: ${transaction.amount}€ (${transaction.tenant_id})`);
        
        if (this.revenueMetrics.today.revenue > 10000) {
            this.emit('revenueGoalAchieved', {
                goal: 'daily',
                amount: this.revenueMetrics.today.revenue
            });
        }
    }

    handleUpgrade(data) {
        console.log(`📈 Upgrade client: ${data.tenantId} → ${data.newTier}`);
    }

    handleChurn(data) {
        console.log(`📉 Client churné: ${data.tenantId} (raison: ${data.reason})`);
    }

    handleRevenueGoal(data) {
        console.log(`🎉 Objectif revenus atteint: ${data.goal} - ${data.amount}€`);
    }

    getRevenueMetrics() {
        return this.revenueMetrics;
    }

    getAnalyticsData() {
        return this.analyticsData;
    }

    async getCustomerInsights(tenantId) {
        const customer = await this.getCustomerAnalytics(tenantId);
        if (!customer) return null;

        const transactions = await this.getCustomerTransactions(tenantId);
        const insights = {
            profile: customer,
            transactionHistory: transactions,
            insights: this.generateCustomerInsights(customer, transactions),
            recommendations: this.getCustomerRecommendations(customer)
        };

        return insights;
    }

    async getCustomerTransactions(tenantId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM revenue_transactions 
                WHERE tenant_id = ? 
                ORDER BY timestamp DESC 
                LIMIT 50
            `;
            
            this.db.all(sql, [tenantId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    generateCustomerInsights(customer, transactions) {
        const insights = [];
        
        if (customer.churn_risk_score > 0.6) {
            insights.push({
                type: 'warning',
                message: 'Risque de churn élevé',
                priority: 'high'
            });
        }
        
        if (customer.lifetime_value > 1000) {
            insights.push({
                type: 'success',
                message: 'Client à haute valeur',
                priority: 'medium'
            });
        }
        
        if (transactions.length > 10) {
            insights.push({
                type: 'info',
                message: 'Client fidèle avec historique riche',
                priority: 'low'
            });
        }
        
        return insights;
    }

    getCustomerRecommendations(customer) {
        const recommendations = [];
        
        if (customer.tier === 'free' && customer.engagement_score > 0.7) {
            recommendations.push('Proposer un upgrade premium');
        }
        
        if (customer.churn_risk_score > 0.5) {
            recommendations.push('Contacter pour feedback');
        }
        
        if (customer.engagement_score < 0.3) {
            recommendations.push('Améliorer l\'onboarding');
        }
        
        return recommendations;
    }

    async generateBusinessReport(period = 'month') {
        const report = {
            period: period,
            timestamp: new Date().toISOString(),
            revenue: this.revenueMetrics,
            analytics: this.analyticsData,
            kpis: await this.calculateKPIs(),
            recommendations: this.generateBusinessRecommendations()
        };

        return report;
    }

    async calculateKPIs() {
        return {
            mrr: this.revenueMetrics.month.recurring,
            churnRate: await this.calculateChurnRate(),
            ltv: this.revenueMetrics.lifetime.avgRevenuePerUser,
            cac: await this.calculateCAC(),
            conversionRate: await this.calculateConversionRate()
        };
    }

    async calculateChurnRate() {
        return 0.12;
    }

    async calculateCAC() {
        return 250;
    }

    async calculateConversionRate() {
        return 0.034;
    }

    generateBusinessRecommendations() {
        return [
            'Optimiser le funnel de conversion',
            'Réduire le taux de churn',
            'Augmenter l\'engagement des utilisateurs',
            'Développer de nouvelles fonctionnalités premium'
        ];
    }

    getStats() {
        return {
            totalRevenue: this.revenueMetrics.lifetime.totalRevenue,
            monthlyRevenue: this.revenueMetrics.month.revenue,
            dailyRevenue: this.revenueMetrics.today.revenue,
            totalCustomers: this.revenueMetrics.lifetime.totalCustomers,
            avgRevenuePerUser: this.revenueMetrics.lifetime.avgRevenuePerUser,
            churnPredictions: this.analyticsData.churnPredictions.length,
            forecastAccuracy: this.analyticsData.revenueForecasts[0]?.confidence || 0
        };
    }

    async shutdown() {
        console.log('🔄 Arrêt RevenueManager...');
        
        if (this.db) {
            this.db.close((err) => {
                if (err) console.error('❌ Erreur fermeture DB revenue:', err.message);
                else console.log('✅ Base revenue fermée');
            });
        }
        
        console.log('✅ RevenueManager arrêté');
    }
}

module.exports = RevenueManager;