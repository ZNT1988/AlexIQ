#!/usr/bin/env node

/**
 * ANALYSE APPROFONDIE DES PATTERNS D'ERREURS
 * 
 * Analyse le rapport de scan de syntaxe pour identifier les patterns
 * récurrents et générer des recommandations de correction automatisée
 */

const fs = require('fs');
const path = require('path');

class AnalysePatternsErreurs {
    constructor() {
        this.rapport = null;
        this.patterns = {
            'let true/continue/false': {
                count: 0,
                files: [],
                description: 'Variables déclarées avec des mots réservés',
                solution: 'Renommer ces variables avec des noms valides'
            },
            'quotes_malformees': {
                count: 0,
                files: [],
                description: 'Guillemets malformés avec caractères étranges',
                solution: 'Remplacer par des guillemets standards'
            },
            'import_export_syntax': {
                count: 0,
                files: [],
                description: 'Erreurs de syntaxe import/export',
                solution: 'Corriger la syntaxe des imports/exports'
            },
            'missing_commas': {
                count: 0,
                files: [],
                description: 'Virgules manquantes dans objets/tableaux',
                solution: 'Ajouter les virgules manquantes'
            },
            'object_malformation': {
                count: 0,
                files: [],
                description: 'Objets JavaScript malformés',
                solution: 'Corriger la structure des objets'
            },
            'function_malformation': {
                count: 0,
                files: [],
                description: 'Fonctions malformées',
                solution: 'Corriger la syntaxe des fonctions'
            },
            'comment_syntax': {
                count: 0,
                files: [],
                description: 'Commentaires mal fermés ou malformés',
                solution: 'Corriger la syntaxe des commentaires'
            },
            'duplicate_declarations': {
                count: 0,
                files: [],
                description: 'Déclarations en double',
                solution: 'Supprimer les déclarations dupliquées'
            },
            'illegal_return': {
                count: 0,
                files: [],
                description: 'Instructions return hors fonction',
                solution: 'Encapsuler dans une fonction ou supprimer'
            }
        };
        this.priorités = [];
    }

    /**
     * Charger et analyser le rapport de scan
     */
    chargerRapport() {
        try {
            const contenu = fs.readFileSync('scan-erreurs-syntaxe.json', 'utf8');
            this.rapport = JSON.parse(contenu);
            console.log(`✅ Rapport chargé: ${this.rapport.erreurs.total} erreurs à analyser`);
        } catch (erreur) {
            throw new Error(`Impossible de charger le rapport: ${erreur.message}`);
        }
    }

    /**
     * Analyser les patterns d'erreurs
     */
    analyserPatterns() {
        console.log('🔍 Analyse des patterns d\'erreurs...');
        
        for (const erreur of this.rapport.erreurs.détails) {
            this.identifierPattern(erreur);
        }
        
        // Trier les patterns par fréquence
        const patternsTriés = Object.entries(this.patterns)
            .sort(([,a], [,b]) => b.count - a.count)
            .filter(([,pattern]) => pattern.count > 0);
        
        console.log(`📊 ${patternsTriés.length} patterns identifiés`);
        
        return patternsTriés;
    }

    /**
     * Identifier le pattern d'une erreur spécifique
     */
    identifierPattern(erreur) {
        const message = erreur.message.toLowerCase();
        const messageSimple = erreur.messageSimple.toLowerCase();
        
        // Pattern: mots réservés utilisés comme variables
        if (message.includes('unexpected strict mode reserved word') ||
            message.includes('let true') || message.includes('let continue') ||
            message.includes('let false') || message.includes('let return')) {
            this.patterns['let true/continue/false'].count++;
            this.patterns['let true/continue/false'].files.push(erreur.fichier);
        }
        
        // Pattern: guillemets malformés
        else if (message.includes('invalid or unexpected token') &&
                (erreur.message.includes('";"') || erreur.message.includes('\\"') ||
                 erreur.message.includes("';'") || erreur.message.includes("\\'"))) {
            this.patterns['quotes_malformees'].count++;
            this.patterns['quotes_malformees'].files.push(erreur.fichier);
        }
        
        // Pattern: problèmes import/export
        else if (message.includes('unexpected identifier') && 
                (erreur.message.includes('import') || erreur.message.includes('sqlite3') ||
                 erreur.message.includes('from') || erreur.message.includes('require'))) {
            this.patterns['import_export_syntax'].count++;
            this.patterns['import_export_syntax'].files.push(erreur.fichier);
        }
        
        // Pattern: virgules manquantes
        else if (message.includes('unexpected token') && erreur.message.includes(',')) {
            this.patterns['missing_commas'].count++;
            this.patterns['missing_commas'].files.push(erreur.fichier);
        }
        
        // Pattern: objets malformés
        else if (message.includes('unexpected identifier') && 
                (erreur.message.includes('name:') || erreur.message.includes('memoryUsage:') ||
                 erreur.message.includes('microsoft:'))) {
            this.patterns['object_malformation'].count++;
            this.patterns['object_malformation'].files.push(erreur.fichier);
        }
        
        // Pattern: accolades mal fermées
        else if (message.includes('unexpected token \'}\'')) {
            this.patterns['function_malformation'].count++;
            this.patterns['function_malformation'].files.push(erreur.fichier);
        }
        
        // Pattern: commentaires malformés
        else if (message.includes('unexpected token \'*\'')) {
            this.patterns['comment_syntax'].count++;
            this.patterns['comment_syntax'].files.push(erreur.fichier);
        }
        
        // Pattern: déclarations en double
        else if (message.includes('has already been declared')) {
            this.patterns['duplicate_declarations'].count++;
            this.patterns['duplicate_declarations'].files.push(erreur.fichier);
        }
        
        // Pattern: return illegal
        else if (message.includes('illegal return statement')) {
            this.patterns['illegal_return'].count++;
            this.patterns['illegal_return'].files.push(erreur.fichier);
        }
    }

    /**
     * Générer les priorités de correction
     */
    générerPriorités(patternsTriés) {
        console.log('🎯 Génération des priorités...');
        
        this.priorités = patternsTriés.map(([nom, pattern], index) => {
            const impact = this.calculerImpact(pattern);
            const difficulté = this.évaluerDifficulté(nom);
            const urgence = this.calculerUrgence(pattern, impact);
            
            return {
                rang: index + 1,
                pattern: nom,
                description: pattern.description,
                solution: pattern.solution,
                count: pattern.count,
                impact: impact,
                difficulté: difficulté,
                urgence: urgence,
                score: this.calculerScore(impact, difficulté, urgence),
                fichiers: [...new Set(pattern.files)].slice(0, 10), // Top 10 fichiers uniques
                automatisable: this.estAutomatisable(nom)
            };
        });
        
        // Retrier par score de priorité
        this.priorités.sort((a, b) => b.score - a.score);
    }

    /**
     * Calculer l'impact d'un pattern
     */
    calculerImpact(pattern) {
        const ratio = pattern.count / this.rapport.erreurs.total;
        if (ratio > 0.3) return 'CRITIQUE';
        if (ratio > 0.15) return 'ÉLEVÉ';
        if (ratio > 0.05) return 'MODÉRÉ';
        return 'FAIBLE';
    }

    /**
     * Évaluer la difficulté de correction
     */
    évaluerDifficulté(nomPattern) {
        const difficultés = {
            'let true/continue/false': 'FACILE',
            'quotes_malformees': 'FACILE',
            'missing_commas': 'FACILE',
            'duplicate_declarations': 'FACILE',
            'comment_syntax': 'FACILE',
            'illegal_return': 'MOYEN',
            'import_export_syntax': 'MOYEN',
            'object_malformation': 'DIFFICILE',
            'function_malformation': 'DIFFICILE'
        };
        return difficultés[nomPattern] || 'MOYEN';
    }

    /**
     * Calculer l'urgence
     */
    calculerUrgence(pattern, impact) {
        const fichiersCore = pattern.files.filter(f => 
            f.includes('alex-core') || f.includes('AlexKernel') || f.includes('server')
        );
        
        if (fichiersCore.length > 0 && impact === 'CRITIQUE') return 'IMMÉDIATE';
        if (impact === 'CRITIQUE') return 'TRÈS ÉLEVÉE';
        if (impact === 'ÉLEVÉ') return 'ÉLEVÉE';
        return 'NORMALE';
    }

    /**
     * Calculer le score de priorité
     */
    calculerScore(impact, difficulté, urgence) {
        const scoresImpact = { 'CRITIQUE': 100, 'ÉLEVÉ': 75, 'MODÉRÉ': 50, 'FAIBLE': 25 };
        const scoresDifficulté = { 'FACILE': 30, 'MOYEN': 20, 'DIFFICILE': 10 };
        const scoresUrgence = { 'IMMÉDIATE': 50, 'TRÈS ÉLEVÉE': 40, 'ÉLEVÉE': 30, 'NORMALE': 20 };
        
        return scoresImpact[impact] + scoresDifficulté[difficulté] + scoresUrgence[urgence];
    }

    /**
     * Déterminer si un pattern est automatisable
     */
    estAutomatisable(nomPattern) {
        const automatisables = [
            'let true/continue/false',
            'quotes_malformees',
            'missing_commas',
            'duplicate_declarations',
            'comment_syntax'
        ];
        return automatisables.includes(nomPattern);
    }

    /**
     * Générer le rapport d'analyse
     */
    générerRapportAnalyse() {
        const rapportAnalyse = {
            timestamp: new Date().toISOString(),
            source: 'scan-erreurs-syntaxe.json',
            résumé: {
                totalErreurs: this.rapport.erreurs.total,
                patternsIdentifiés: Object.values(this.patterns).filter(p => p.count > 0).length,
                erreursAutomatisables: this.priorités.filter(p => p.automatisable).reduce((sum, p) => sum + p.count, 0),
                pourcentageAutomatisable: 0
            },
            patterns: this.patterns,
            priorités: this.priorités,
            recommandations: this.générerRecommandations(),
            planAction: this.générerPlanAction()
        };
        
        // Calculer le pourcentage automatisable
        rapportAnalyse.résumé.pourcentageAutomatisable = Math.round(
            (rapportAnalyse.résumé.erreursAutomatisables / this.rapport.erreurs.total) * 100
        );
        
        return rapportAnalyse;
    }

    /**
     * Générer les recommandations
     */
    générerRecommandations() {
        const recommendations = [
            `🤖 ${Math.round((this.priorités.filter(p => p.automatisable).reduce((sum, p) => sum + p.count, 0) / this.rapport.erreurs.total) * 100)}% des erreurs sont automatisables`,
            
            `🎯 Prioriser les corrections dans cet ordre:`,
            ...this.priorités.slice(0, 5).map((p, i) => 
                `   ${i+1}. ${p.pattern} (${p.count} erreurs, impact ${p.impact})`
            ),
            
            `🚀 Scripts de correction automatique recommandés:`,
            ...this.priorités.filter(p => p.automatisable).slice(0, 3).map(p => 
                `   - Script pour: ${p.description}`
            ),
            
            `⚡ Gains estimés:`,
            `   - Correction automatique: ${this.priorités.filter(p => p.automatisable).reduce((sum, p) => sum + p.count, 0)} erreurs`,
            `   - Temps économisé: ~${Math.round(this.priorités.filter(p => p.automatisable).reduce((sum, p) => sum + p.count, 0) * 2)} minutes`,
            
            `🔧 Actions immédiates suggérées:`,
            `   1. Créer script fix-reserved-words.js`,
            `   2. Créer script fix-quotes-malformation.js`, 
            `   3. Implémenter validation syntax pre-commit`,
            `   4. Configurer ESLint avec règles strictes`
        ];
        
        return recommendations;
    }

    /**
     * Générer le plan d'action
     */
    générerPlanAction() {
        return {
            phase1_automatique: {
                description: "Corrections automatiques (1-2 heures)",
                patterns: this.priorités.filter(p => p.automatisable && p.urgence !== 'NORMALE').slice(0, 3),
                estiméTempo: "2 heures",
                gains: "60-80% des erreurs"
            },
            phase2_semiAuto: {
                description: "Corrections semi-automatiques (2-4 heures)",
                patterns: this.priorités.filter(p => !p.automatisable && p.difficulté !== 'DIFFICILE').slice(0, 3),
                estiméTempo: "4 heures", 
                gains: "15-20% des erreurs"
            },
            phase3_manuelle: {
                description: "Corrections manuelles (4-8 heures)",
                patterns: this.priorités.filter(p => p.difficulté === 'DIFFICILE'),
                estiméTempo: "8 heures",
                gains: "10-15% des erreurs"
            },
            validation: {
                description: "Tests et validation (1-2 heures)",
                actions: ["Tests unitaires", "Tests d'intégration", "Validation syntaxe", "Déploiement"],
                estiméTempo: "2 heures"
            }
        };
    }

    /**
     * Exécuter l'analyse complète
     */
    async exécuter() {
        console.log('🎯 ANALYSE PATTERNS ERREURS - HUSTLEFINDERIA');
        console.log('==============================================');
        
        try {
            // Charger le rapport
            this.chargerRapport();
            
            // Analyser les patterns
            const patternsTriés = this.analyserPatterns();
            
            // Générer les priorités
            this.générerPriorités(patternsTriés);
            
            // Générer le rapport final
            const rapportFinal = this.générerRapportAnalyse();
            
            // Sauvegarder
            const nomFichier = 'analyse-patterns-erreurs.json';
            fs.writeFileSync(nomFichier, JSON.stringify(rapportFinal, null, 2));
            
            // Afficher le résumé
            this.afficherRésumé(rapportFinal);
            
            console.log(`\n📄 Analyse complète sauvegardée: ${nomFichier}`);
            
        } catch (erreur) {
            console.error('❌ Erreur lors de l\'analyse:', erreur.message);
            throw erreur;
        }
    }

    /**
     * Afficher le résumé de l'analyse
     */
    afficherRésumé(rapport) {
        console.log('\n📊 RÉSUMÉ DE L\'ANALYSE');
        console.log('========================');
        console.log(`🔢 Total erreurs: ${rapport.résumé.totalErreurs}`);
        console.log(`🎯 Patterns identifiés: ${rapport.résumé.patternsIdentifiés}`);
        console.log(`🤖 Erreurs automatisables: ${rapport.résumé.erreursAutomatisables} (${rapport.résumé.pourcentageAutomatisable}%)`);
        
        console.log('\n🏆 TOP 5 PRIORITÉS:');
        console.log('-------------------');
        rapport.priorités.slice(0, 5).forEach((p, i) => {
            const auto = p.automatisable ? '🤖' : '👨‍💻';
            console.log(`${i+1}. ${auto} ${p.pattern}: ${p.count} erreurs (${p.impact}, ${p.urgence})`);
        });
        
        console.log('\n⚡ PLAN D\'ACTION RECOMMANDÉ:');
        console.log('-----------------------------');
        Object.entries(rapport.planAction).forEach(([phase, details]) => {
            console.log(`📋 ${phase.toUpperCase()}: ${details.description}`);
            console.log(`   ⏱️ Temps estimé: ${details.estiméTempo}`);
            if (details.gains) console.log(`   📈 Gains: ${details.gains}`);
        });
        
        console.log('\n💡 RECOMMANDATIONS CLÉS:');
        console.log('-------------------------');
        rapport.recommandations.slice(0, 8).forEach(rec => {
            console.log(`   ${rec}`);
        });
    }
}

// Exécution du script
if (require.main === module) {
    const analyseur = new AnalysePatternsErreurs();
    
    analyseur.exécuter().catch(erreur => {
        console.error('💥 Erreur fatale:', erreur);
        process.exit(1);
    });
}

module.exports = AnalysePatternsErreurs;