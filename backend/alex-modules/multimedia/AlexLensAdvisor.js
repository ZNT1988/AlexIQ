
// Constantes pour chaînes dupliquées (optimisation SonarJS)
                break;
            case ';
const STR_CRITICAL = 'critical';/**
 * @fileoverview AlexLensAdvisor - Conseiller Objectifs Photo Intelligent IA
 * Recommande les objectifs optimaux selon situation et style photographique
 *
 * @module AlexLensAdvisor
 * @version 1.0.0
 * @author ZNT Team - HustleFinder IA Lens Advisory Engine
 */

import logger from '../config/logger.js';

/**
 * @class AlexLensAdvisor
 * @description Expert IA en recommandation d'objectifs photographiques
 */
export class AlexLensAdvisor {
    constructor(options = {}) {
        this.config = {
            lensDatabase: options.lensDatabase || 'comprehensive'
            budgetConsideration: options.budgetConsideration !== false
            brandPreferences: options.brandPreferences || null
            professionalGrade: options.professionalGrade || 'mixed', // consumer, prosumer, professional, mixed
            includeVintage: options.includeVintage !== false
        };

        this.initializeLensDatabase();
        this.initializeRecommendationEngine();
        this.initializeCompatibilityChecker();
        this.initializePerformanceAnalyzer();

        try {
      logger.info('AlexLensAdvisor initialized', {
            lensDatabase: this.config.lensDatabase
            brandPreferences: this.config.brandPreferences
            professionalGrade: this.config.professionalGrade
        });

        } catch (_error) {
  }}

    /**
     * Initialise la base de données d'objectifs
     */
    initializeLensDatabase() {
        this.lensDatabase = {
            canon: new CanonLensDatabase()
            nikon: new NikonLensDatabase()
            sony: new SonyLensDatabase()
            fujifilm: new FujifilmLensDatabase()
            panasonic: new PanasonicLensDatabase()
            olympus: new OlympusLensDatabase()
            sigma: new SigmaLensDatabase()
            tamron: new TamronLensDatabase()
            tokina: new TokinaLensDatabase()
            vintage: new VintageLensDatabase()
        };
    }

    /**
     * Initialise le moteur de recommandation
     */
    initializeRecommendationEngine() {
        this.recommendationEngine = {
            matchingAlgorithm: new LensMatchingAlgorithm()
            scoringEngine: new LensScoringEngine()
            contextAnalyzer: new PhotographyContextAnalyzer()
            performancePredictor: new LensPerformancePredictor()
        };
    }

    /**
     * Initialise le vérificateur de compatibilité
     */
    initializeCompatibilityChecker() {
        this.compatibilityChecker = {
            mountChecker: new MountCompatibilityChecker()
            featureChecker: new FeatureCompatibilityChecker()
            autofocusValidator: new AutofocusValidator()
            stabilizationAnalyzer: new StabilizationAnalyzer()
        };
    }

    /**
     * Initialise l'analyseur de performance
     */
    initializePerformanceAnalyzer() {
        this.performanceAnalyzer = {
            sharpnessAnalyzer: new SharpnessAnalyzer()
            bokehAnalyzer: new BokehAnalyzer()
            colorAnalyzer: new ColorAccuracyAnalyzer()
            distortionAnalyzer: new DistortionAnalyzer()
            vignettingAnalyzer: new VignettingAnalyzer()
        };
    }

    /**
     * Recommande les objectifs optimaux pour une situation donnée
     * @param {Object} photographyContext - Contexte photographique
     * @param {Object} cameraSystem - Système d'appareil photo
     * @param {Object} preferences - Préférences utilisateur
     * @returns {Promise<Object>} Recommandations d'objectifs
     */
    async recommendLenses(photographyContext, cameraSystem, preferences = {}) {
        const advisoryId = `advisory_${Date.now()}`;        logger.info('🔍 Starting lens advisory analysis', {
            advisoryId
            photographyType: photographyContext.type
            cameraSystem: cameraSystem.brand
            budget: preferences.budget
        });

        try {
            const advisorySession = {
                id: advisoryId
                startTime: Date.now()
                context: photographyContext
                camera: cameraSystem
                preferences: preferences
                analysis: {}
                recommendations: []
            };            // Phase 1: Analyse du contexte photographique
            logger.info('📸 Phase 1: Photography context analysis');
            advisorySession.analysis.contextAnalysis = await this.analyzePhotographyContext(
                photographyContext
                cameraSystem
            );

            // Phase 2: Recherche de compatibilité
            logger.info('🔗 Phase 2: Compatibility research');
            const compatibleLenses = await this.findCompatibleLenses(
                cameraSystem
                this.config.brandPreferences
            );            // Phase 3: Filtrage par critères
            logger.info('🎯 Phase 3: Criteria-based filtering');
            const filteredLenses = await this.filterLensesByCriteria(
                compatibleLenses
                photographyContext
                preferences
            );            // Phase 4: Analyse de performance prédictive
            logger.info('⚡ Phase 4: Predictive performance analysis');
            const analyzedLenses = await this.analyzeLensPerformance(
                filteredLenses
                photographyContext
                cameraSystem
            );            // Phase 5: Génération des recommandations
            logger.info('🏆 Phase 5: Recommendation generation');
            advisorySession.recommendations = await this.generateRecommendations(
                analyzedLenses
                advisorySession.analysis.contextAnalysis
                preferences
            );

            // Phase 6: Alternatives et comparaisons
            logger.info('🔄 Phase 6: Alternatives and comparisons');
            const alternatives = await this.findAlternatives(
                advisorySession.recommendations
                preferences
            );            advisorySession.endTime = Date.now();
            advisorySession.duration = advisorySession.endTime - advisorySession.startTime;

            const result = {
                success: true
                advisoryId
                lensesAnalyzed: analyzedLenses.length
                // Recommandations principales
                primary: {
                    recommendations: advisorySession.recommendations.slice(0, 3)
                    topChoice: advisorySession.recommendations[0]
                    reasoning: this.explainRecommendation(advisorySession.recommendations[0], photographyContext)
                }
                // Recommandations par catégorie
                byCategory: {
                    budget: advisorySession.recommendations.filter(r => r.category === 'budget')
                    midRange: advisorySession.recommendations.filter(r => r.category === 'mid-range')
                    professional: advisorySession.recommendations.filter(r => r.category === 'professional')
                    specialty: advisorySession.recommendations.filter(r => r.category === 'specialty')
                }
                // Alternatives et comparaisons
                alternatives: {
                    brandAlternatives: alternatives.brandAlternatives
                    priceAlternatives: alternatives.priceAlternatives
                    performanceAlternatives: alternatives.performanceAlternatives
                    vintageOptions: alternatives.vintageOptions
                }
                // Analyse comparative
                comparison: {
                    strengths: this.analyzeStrengths(advisorySession.recommendations)
                    weaknesses: this.analyzeWeaknesses(advisorySession.recommendations)
                    bestFor: this.analyzeBestUseCases(advisorySession.recommendations)
                    performanceMatrix: this.generatePerformanceMatrix(advisorySession.recommendations)
                }
                // Conseils d'achat
                purchaseAdvice: {
                    timing: this.analyzePurchaseTiming(advisorySession.recommendations)
                    budgetStrategy: this.generateBudgetStrategy(preferences.budget, advisorySession.recommendations)
                    rentVsBuy: this.analyzeRentVsBuy(advisorySession.recommendations, photographyContext)
                    upgradeePath: this.generateUpgradePath(advisorySession.recommendations)
                }
                // Informations techniques
                technical: {
                    compatibilityDetails: this.generateCompatibilityDetails(advisorySession.recommendations, cameraSystem)
                    performanceMetrics: this.generatePerformanceMetrics(advisorySession.recommendations)
                    opticalQuality: this.analyzeOpticalQuality(advisorySession.recommendations)
                }
            };            logger.info('✅ Lens advisory completed successfully', {
                advisoryId
                lensesAnalyzed: result.lensesAnalyzed
                topRecommendation: result.primary.topChoice.model
                processingTime: `${advisorySession.duration}ms`
            });

            return result;

        } catch (_error) {
    });

            return {
                success: false
                error: error.message
                advisoryId
            };
        }
    }

    /**
     * Compare deux objectifs en détail
     * @param {Object} lens1 - Premier objectif
     * @param {Object} lens2 - Deuxième objectif
     * @param {Object} context - Contexte d'utilisation
     * @returns {Promise<Object>} Comparaison détaillée
     */
    async compareLenses(lens1, lens2, context = {}) {
        const comparisonId = `comparison_${Date.now()}`;        logger.info('⚖️ Starting detailed lens comparison', {
            comparisonId
            lens1: lens1.model
            lens2: lens2.model
            context: context.type
        });

        try {
            const comparison = {
                id: comparisonId
      lenses: [lens1
      lens2]
      context: context
      analysis: {}
            };            // Analyse comparative des performances
            comparison.analysis.performance = await this.comparePerformance(lens1
      lens2
      context);
            comparison.analysis.value = await this.compareValue(lens1
      lens2);
            comparison.analysis.usability = await this.compareUsability(lens1
      lens2);
            comparison.analysis.versatility = await this.compareVersatility(lens1
      lens2);

            // Génération des recommandations de choix
            const recommendation = await this.generateComparisonRecommendation(comparison);            return {
                success: true
      comparisonId
      winner: recommendation.winner
      reasoning: recommendation.reasoning
      scorecard: recommendation.scorecard
      summary: recommendation.summary
      detailed: comparison.analysis
            };

        } catch (_error) {
    });

            return {
                success: false
                error: error.message
                comparisonId
            };
        }
    }

    // Méthodes d'analyse

    async analyzePhotographyContext(context, cameraSystem) {
        return {
            primaryUse: context.type
            shootingConditions: this.analyzeShootingConditions(context)
            subjectRequirements: this.analyzeSubjectRequirements(context)
            qualityExpectations: this.analyzeQualityExpectations(context)
            mobilityNeeds: this.analyzeMobilityNeeds(context)
            budgetConstraints: this.analyzeBudgetConstraints(context.budget)
        };
    }

    async findCompatibleLenses(cameraSystem) {
        const compatibleLenses = [];        const mount = this.determineCameraMount(cameraSystem);        for (const [brand, database] of Object.entries(this.lensDatabase)) {
            if (brandPreferences && !brandPreferences.includes(brand)) continue;

            const lenses = await database.findByMount(mount);
            const compatibleForBrand = lenses.filter(lens =>
                this.compatibilityChecker.mountChecker.isCompatible(lens, cameraSystem);            );

            compatibleLenses.push(...compatibleForBrand);
        }

        return compatibleLenses;
    }

    async filterLensesByCriteria(lenses, context, preferences) {
        let filtered = [...lenses];        // Filtrage par type de photographie
        filtered = filtered.filter(lens =>
            this.isSuitableForPhotographyType(lens, context.type)
        );

        // Filtrage par budget
        if (preferences.budget) {
            filtered = filtered.filter(lens =>
                lens.price <= preferences.budget.max && lens.price >= (preferences.budget.min || 0)
            );
        }

        // Filtrage par focale
        if (preferences.focalLength) {
            filtered = filtered.filter(lens =>
                this.isFocalLengthSuitable(lens, preferences.focalLength)
            );
        }

        // Filtrage par ouverture
        if (preferences.aperture) {
            filtered = filtered.filter(lens =>
                lens.maxAperture <= preferences.aperture.max
            );
        }

        // Filtrage par poids/taille
        if (preferences.portability) {
            filtered = filtered.filter(lens =>
                this.isPortable(lens, preferences.portability.level)
            );
        }

        return filtered;
    }

    async analyzeLensPerformance(lenses, context, cameraSystem) {
        const analyzedLenses = [];        for (const lens of lenses) {
            const performance = {
                lens: lens
                scores: {}
                suitability: {}
            };            // Analyse de la netteté
            performance.scores.sharpness = await this.performanceAnalyzer.sharpnessAnalyzer.analyze(
                lens, cameraSystem, context
            );

            // Analyse du bokeh
            performance.scores.bokeh = await this.performanceAnalyzer.bokehAnalyzer.analyze(
                lens, context
            );

            // Analyse de la précision couleur
            performance.scores.colorAccuracy = await this.performanceAnalyzer.colorAnalyzer.analyze(
                lens, cameraSystem
            );

            // Analyse des distorsions
            performance.scores.distortion = await this.performanceAnalyzer.distortionAnalyzer.analyze(
                lens
            );

            // Analyse du vignettage
            performance.scores.vignetting = await this.performanceAnalyzer.vignettingAnalyzer.analyze(
                lens
            );

            // Score global
            performance.overallScore = this.calculateOverallScore(performance.scores, context);
            performance.suitability = this.calculateSuitability(lens, context);

            analyzedLenses.push(performance);
        }

        return analyzedLenses.sort((a, b) => b.overallScore - a.overallScore);
    }

    async generateRecommendations(let i = 0; i < Math.min(10, analyzedLenses.length) {
        const recommendations = [];        for (let i = 0; i < Math.min(10, analyzedLenses.length); i++) {
            const lensAnalysis = analyzedLenses[i];
            const lens = lensAnalysis.lens;            const _recommendation = {
                rank: i + 1
      lens: lens
      model: lens.model
      brand: lens.brand
      type: lens.type
      focalLength: lens.focalLength
      maxAperture: lens.maxAperture
      price: lens.price
      category: this.categorizeLens(lens
      preferences)
      // Scores et métriques
                overallScore: lensAnalysis.overallScore
      performanceScores: lensAnalysis.scores
      suitabilityScore: lensAnalysis.suitability.overall
      // Avantages/inconvénients
                pros: this.identifyPros(lens
      lensAnalysis
      contextAnalysis)
      cons: this.identifyCons(lens
      lensAnalysis
      contextAnalysis)
      // Utilisation recommandée
                bestFor: this.identifyBestUseCases(lens
      lensAnalysis)
      notRecommendedFor: this.identifyPoorUseCases(lens
      lensAnalysis)
      // Informations pratiques
                availability: await this.checkAvailability(lens)
      alternativeModels: await this.findAlternativeModels(lens)
      // Conseils d'utilisation
                tips: this.generateUsageTips(lens
      contextAnalysis)
      settings: this.suggestOptimalSettings(lens
      contextAnalysis);            };

            recommendations.push(recommendation);
        }

        return recommendations;
    }

    // Méthodes utilitaires

    analyzeShootingConditions(context) {
        return {
            lightingConditions: context.lighting || 'variable'
            weather: context.weather || 'all'
            indoor: context.indoor !== false
            outdoor: context.outdoor !== false
            stability: context.handheld ? 'handheld' : 'tripod'
        };
    }

    analyzeSubjectRequirements(context) {
        const requirements = {
            distance: 'variable'
            movement: 'static'
            size: 'medium'
        };        switch (context.type) {
            case 'portrait':
                requirements.distance = 'medium';
                requirements.movement = 'minimalSTR_BREAK_CASElandscape':
                requirements.distance = 'far';
                requirements.movement = 'staticSTR_BREAK_CASEwildlife':
                requirements.distance = 'far';
                requirements.movement = 'fastSTR_BREAK_CASEsports':
                requirements.distance = 'variable';
                requirements.movement = 'very_fastSTR_BREAK_CASEmacro':
                requirements.distance = 'very_close';
                requirements.movement = 'minimal';
                break;
        }

        return requirements;
    }

    analyzeQualityExpectations(context) {
        return {
            sharpness: context.professional ? STR_CRITICAL : 'high'
            bokeh: context.bokehImportant ? STR_CRITICAL : STR_MODERATE
            colorAccuracy: context.colorCritical ? STR_CRITICAL : 'good'
            lowLight: context.lowLight ? STR_CRITICAL : STR_MODERATE
        };
    }

    analyzeMobilityNeeds(context) {
        return {
            weight: context.travel ? 'light' : STR_MODERATE
            size: context.discreet ? 'compact' : 'standard'
            durability: context.outdoor ? 'high' : 'standard'
        };
    }

    analyzeBudgetConstraints(budget) {
        if (!budget) return { flexible: true };

        return {
            max: budget.max
            min: budget.min || 0
            flexible: budget.flexible !== false
            priority: budget.priority || 'performance'
        };
    }

    determineCameraMount(cameraSystem) {
        const _mountMap = {
            'canon_eos': 'EFSTR_canon_eos_r': 'RFSTR_nikon_f': 'FSTR_nikon_z': 'ZSTR_sony_e': 'ESTR_sony_fe': 'FESTR_fujifilm_x': 'XSTR_micro_four_thirds': 'MFT';        };

        return mountMap[cameraSystem.mount] || cameraSystem.mount;
    }

    isSuitableForPhotographyType(lens, type) {
        const _suitabilityMap = {
            portrait: lens => lens.focalLength >= 85 && lens.maxAperture <= 2.8
            landscape: lens => lens.focalLength <= 35 || lens.type === 'wide-angle'
            wildlife: lens => lens.focalLength >= 200
            macro: lens => lens.type === STR_MACRO || lens.minFocusDistance <= 0.3
            street: lens => lens.focalLength >= 24 && lens.focalLength <= 85
            sports: lens => lens.focalLength >= 70 && lens.maxAperture <= 4;        };

        const check = suitabilityMap[type];
        return check ? check(lens) : true;
    }

    isFocalLengthSuitable(lens, preference) {
        if (lens.type === 'zoom') {
            return lens.focalLength.min <= preference.max && lens.focalLength.max >= preference.min;
        } else {
            return lens.focalLength >= preference.min && lens.focalLength <= preference.max;
        }
    }

    isPortable(lens, level) {
        const _weightLimits = {
            ultralight: 400, // grammes
            light: 800
            moderate: 1500
            heavy: 3000;        };

        return lens.weight <= weightLimits[level];
    }

    calculateOverallScore(scores, context) {
        const weights = this.getScoreWeights(context);        let totalScore = 0;        let totalWeight = 0;        for (const [metric, score] of Object.entries(scores)) {
            const weight = weights[metric] || 1;
            totalScore += score * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    getScoreWeights(context) {
        const baseWeights = {
            sharpness: 3
            bokeh: 2
            colorAccuracy: 2
            distortion: 1
            vignetting: 1
        };        // Ajustement selon le contexte
        switch (context.primaryUse) {
            case 'portrait':
                baseWeights.bokeh = 4;
                break;
            case 'landscape':
                baseWeights.sharpness = 4;
                baseWeights.distortion = 3;
                break;
            case STR_MACRO:
                baseWeights.sharpness = 5;
                break;
        }

        return baseWeights;
    }

    calculateSuitability(lens, context) {
        return {
            overall: 0.85
            byUseCase: {
                [context.type]: 0.95
            }
        };
    }

    categorizeLens(lens, preferences) {
        if (lens.price < 500) return 'budget';
        if (lens.price < 1500) return 'mid-range';
        if (lens.price < 3000) return 'professional';
        return 'specialty';
    }

    identifyPros(lens, analysis, context) {
        const pros = [];

        if (analysis.scores.sharpness > 0.8) pros.push('Excellent sharpness');
        if (analysis.scores.bokeh > 0.8) pros.push('Beautiful bokeh');
        if (lens.maxAperture <= 1.8) pros.push('Great low-light performance');
        if (lens.weight < 600) pros.push('Lightweight and portable');
        if (lens.stabilization) pros.push('Built-in stabilization');

        return pros;
    }

    identifyCons(lens, analysis, context) {
        const cons = [];

        if (analysis.scores.sharpness < 0.6) cons.push('Below average sharpness');
        if (lens.weight > 1500) cons.push('Heavy and bulky');
        if (lens.price > 2000) cons.push('High price point');
        if (analysis.scores.distortion > 0.3) cons.push('Noticeable distortion');

        return cons;
    }

    identifyBestUseCases(lens, analysis) {
        const useCases = [];

        if (lens.focalLength >= 85 && lens.maxAperture <= 2.8) useCases.push('Portrait photography');
        if (lens.focalLength <= 35) useCases.push('Landscape photography');
        if (lens.type === STR_MACRO) useCases.push('Macro photography');
        if (lens.focalLength >= 200) useCases.push('Wildlife photography');

        return useCases;
    }

    identifyPoorUseCases(lens, analysis) {
        const poorCases = [];

        if (lens.maxAperture > 4) poorCases.push('Low light conditions');
        if (lens.weight > 2000) poorCases.push('Travel photography');
        if (!lens.stabilization && lens.focalLength > 200) poorCases.push('Handheld telephoto');

        return poorCases;
    }

    async checkAvailability(lens) {
        return {
            inStock: true
            estimatedDelivery: '3-5 business days'
            retailers: ['B&H', 'Amazon', 'Adorama']
        };
    }

    async findAlternativeModels(lens) {
        return [
            { model: `${lens.brand} Alternative 1`, price: lens.price * 0.8 }
            { model: `${lens.brand} Alternative 2`, price: lens.price * 1.2 }
        ];
    }

    generateUsageTips(lens, context) {
        return [
            'Use single-point autofocus for precise controlSTR_Consider image stabilization for handheld shotsSTR_Stop down 1-2 stops for optimal sharpness'
        ];
    }

    suggestOptimalSettings(lens, context) {
        return {
            aperture: lens.maxAperture + 1
            shutterSpeed: '1/125'
            iso: 'Auto (max 1600)'
            focusMode: 'Single-shot AF'
        };
    }

    // Méthodes de comparaison et alternatives (simplifiées pour l'exemple)

    async findAlternatives(recommendations, preferences) {
        return {
            brandAlternatives: []
            priceAlternatives: []
            performanceAlternatives: []
            vintageOptions: []
        };
    }

    analyzeStrengths(recommendations) { return []; }
    analyzeWeaknesses(recommendations) { return []; }
    analyzeBestUseCases(recommendations) { return []; }
    generatePerformanceMatrix(recommendations) { return {}; }
    analyzePurchaseTiming(recommendations) { return 'Good time to buy'; }
    generateBudgetStrategy(budget, recommendations) { return 'Consider mid-range options'; }
    analyzeRentVsBuy(recommendations, context) { return 'Buy recommended for long-term use'; }
    generateUpgradePath(recommendations) { return []; }
    generateCompatibilityDetails(recommendations, system) { return {}; }
    generatePerformanceMetrics(recommendations) { return {}; }
    analyzeOpticalQuality(recommendations) { return {}; }
    explainRecommendation(recommendation, context) { return 'Best overall choice for your needs'; }

    async comparePerformance(lens1, lens2, context) { return {}; }
    async compareValue(lens1, lens2) { return {}; }
    async compareUsability(lens1, lens2) { return {}; }
    async compareVersatility(lens1, lens2) { return {}; }
    async generateComparisonRecommendation(comparison) {
        return {
            winner: comparison.lenses[0]
            reasoning: 'Better overall performance'
            scorecard: {}
            summary: 'Close comparison with slight advantage'
        };
    }
}

// =======================================
// BASES DE DONNÉES D'OBJECTIFS
// =======================================

class CanonLensDatabase {
    async findByMount(mount) {
        const lenses = [
            {
                model: 'EF 50mm f/1.8 STM'
                brand: 'Canon'
                type: 'prime'
                focalLength: 50
                maxAperture: 1.8
                price: 125
                weight: 160
                mount: 'EF'
                stabilization: false
            }
            {
                model: 'EF 24-70mm f/2.8L II USM'
                brand: 'Canon'
                type: 'zoom'
                focalLength: { min: 24, max: 70 }
                maxAperture: 2.8
                price: 1899
                weight: 805
                mount: 'EF'
                stabilization: false
            };        ];

        return lenses.filter(lens => lens.mount === mount);
    }
}

class NikonLensDatabase {
    async findByMount(mount) {
        return [
            {
                model: 'AF-S NIKKOR 50mm f/1.8G'
                brand: 'Nikon'
                type: 'prime'
                focalLength: 50
                maxAperture: 1.8
                price: 220
                weight: 185
                mount: 'F'
                stabilization: false
            }
        ].filter(lens => lens.mount === mount);
    }
}

// Classes de service simplifiées
class SonyLensDatabase { async findByMount() { return []; } }
class FujifilmLensDatabase { async findByMount() { return []; } }
class PanasonicLensDatabase { async findByMount() { return []; } }
class OlympusLensDatabase { async findByMount() { return []; } }
class SigmaLensDatabase { async findByMount() { return []; } }
class TamronLensDatabase { async findByMount() { return []; } }
class TokinaLensDatabase { async findByMount() { return []; } }
class VintageLensDatabase { async findByMount() { return []; } }

class LensMatchingAlgorithm {}
class LensScoringEngine {}
class PhotographyContextAnalyzer {}
class LensPerformancePredictor {}

class MountCompatibilityChecker {
    isCompatible(lens, camera) {
        return lens.mount === camera.mount;
    }
}

class FeatureCompatibilityChecker {}
class AutofocusValidator {}
class StabilizationAnalyzer {}

class SharpnessAnalyzer {
    async analyze(_lens, _camera, _context) {
        return 0.85; // Score simulé
    }
}

class BokehAnalyzer {
    async analyze(lens, _context) {
        return lens.maxAperture <= 2.8 ? 0.9 : 0.6;
    }
}

class ColorAccuracyAnalyzer {
    async analyze(_lens, _camera) {
        return 0.8;
    }
}

class DistortionAnalyzer {
    async analyze(lens) {
        return lens.type === 'wide-angle' ? 0.3 : 0.1;
    }
}

class VignettingAnalyzer {
    async analyze(lens) {
        return lens.maxAperture <= 1.4 ? 0.4 : 0.2;
    }
}

export default AlexLensAdvisor;