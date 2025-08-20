#!/usr/bin/env node

/**
 * SCAN COMPLET DES ERREURS DE SYNTAXE - HustleFinderIA
 * 
 * Script automatisé pour détecter et catégoriser toutes les erreurs de syntaxe
 * dans le projet HustleFinderIA (4267+ fichiers JavaScript)
 * 
 * Fonctionnalités:
 * - Scan récursif du dossier backend/
 * - Test syntaxe avec node --check
 * - Catégorisation des erreurs par type
 * - Identification des fichiers les plus corrompus
 * - Rapport détaillé avec statistiques
 * - Sauvegarde JSON du rapport
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ScanSyntaxeComplet {
    constructor() {
        this.baseDir = path.join(__dirname, 'backend');
        this.rapport = {
            timestamp: new Date().toISOString(),
            configuration: {
                baseDirectory: this.baseDir,
                fileExtensions: ['.js'],
                scanMethod: 'node --check'
            },
            statistiques: {
                totalFichiersScannés: 0,
                fichiersAvecErreurs: 0,
                fichiersSansErreurs: 0,
                pourcentageCorruption: 0
            },
            erreurs: {
                total: 0,
                parType: {
                    'SyntaxError': 0,
                    'ReferenceError': 0,
                    'TypeError': 0,
                    'ImportExportError': 0,
                    'StringMalformation': 0,
                    'ObjectArraySyntax': 0,
                    'FunctionDefinition': 0,
                    'UnexpectedToken': 0,
                    'AutresErreurs': 0
                },
                détails: []
            },
            fichiersProblématiques: {
                top10Corrompus: [],
                parSévérité: {
                    critique: [],
                    élevée: [],
                    modérée: [],
                    faible: []
                }
            },
            recommandations: []
        };
        this.fichiersJS = [];
    }

    /**
     * Point d'entrée principal du scan
     */
    async lancerScan() {
        console.log('🔍 DÉBUT DU SCAN COMPLET DE SYNTAXE');
        console.log('=====================================');
        
        try {
            // Étape 1: Collecter tous les fichiers JS
            console.log('📂 Collecte des fichiers JavaScript...');
            this.collecterFichiersJS(this.baseDir);
            
            // Étape 2: Scanner chaque fichier
            console.log(`🔄 Scan de ${this.fichiersJS.length} fichiers...`);
            await this.scannerTousFichiers();
            
            // Étape 3: Analyser et catégoriser les résultats
            console.log('📊 Analyse des résultats...');
            this.analyserRésultats();
            
            // Étape 4: Générer les recommandations
            this.générerRecommandations();
            
            // Étape 5: Sauvegarder le rapport
            console.log('💾 Sauvegarde du rapport...');
            this.sauvegarderRapport();
            
            // Étape 6: Afficher le résumé
            this.afficherRésumé();
            
        } catch (erreur) {
            console.error('❌ Erreur lors du scan:', erreur.message);
            throw erreur;
        }
    }

    /**
     * Collecte récursivement tous les fichiers .js
     */
    collecterFichiersJS(dossier) {
        if (!fs.existsSync(dossier)) {
            console.warn(`⚠️ Dossier non trouvé: ${dossier}`);
            return;
        }

        const éléments = fs.readdirSync(dossier);
        
        for (const élément of éléments) {
            const cheminComplet = path.join(dossier, élément);
            const stats = fs.statSync(cheminComplet);
            
            if (stats.isDirectory()) {
                // Ignorer node_modules et autres dossiers système
                if (!élément.startsWith('.') && 
                    élément !== 'node_modules' && 
                    élément !== 'logs' && 
                    élément !== 'data') {
                    this.collecterFichiersJS(cheminComplet);
                }
            } else if (path.extname(élément) === '.js') {
                this.fichiersJS.push(cheminComplet);
            }
        }
    }

    /**
     * Scanner tous les fichiers collectés
     */
    async scannerTousFichiers() {
        const totalFichiers = this.fichiersJS.length;
        let compteur = 0;
        
        for (const fichier of this.fichiersJS) {
            compteur++;
            
            // Afficher le progrès
            if (compteur % 50 === 0 || compteur === totalFichiers) {
                console.log(`   Progrès: ${compteur}/${totalFichiers} (${Math.round(compteur/totalFichiers*100)}%)`);
            }
            
            await this.scannerFichier(fichier);
        }
        
        this.rapport.statistiques.totalFichiersScannés = totalFichiers;
    }

    /**
     * Scanner un fichier individuel
     */
    async scannerFichier(cheminFichier) {
        const cheminRelatif = path.relative(this.baseDir, cheminFichier);
        
        try {
            // Test de syntaxe avec node --check
            execSync(`node --check "${cheminFichier}"`, { 
                stdio: 'pipe',
                timeout: 10000 // 10 secondes max par fichier
            });
            
            // Aucune erreur trouvée
            this.rapport.statistiques.fichiersSansErreurs++;
            
        } catch (erreur) {
            // Erreur de syntaxe détectée
            this.rapport.statistiques.fichiersAvecErreurs++;
            this.rapport.erreurs.total++;
            
            const détailErreur = this.analyserErreur(erreur.stderr.toString(), cheminRelatif, cheminFichier);
            this.rapport.erreurs.détails.push(détailErreur);
            
            // Compter par type
            this.rapport.erreurs.parType[détailErreur.type]++;
        }
    }

    /**
     * Analyser et catégoriser une erreur
     */
    analyserErreur(messageErreur, cheminRelatif, cheminAbsolu) {
        const ligneErreur = this.extraireLigneErreur(messageErreur);
        const typeErreur = this.catégoriserErreur(messageErreur);
        const sévérité = this.évaluerSévérité(messageErreur, typeErreur);
        
        return {
            fichier: cheminRelatif,
            cheminAbsolu: cheminAbsolu,
            type: typeErreur,
            sévérité: sévérité,
            ligne: ligneErreur,
            message: messageErreur.trim(),
            messageSimple: this.simplifierMessage(messageErreur),
            taille: this.obtenirTailleFichier(cheminAbsolu)
        };
    }

    /**
     * Catégoriser le type d'erreur
     */
    catégoriserErreur(message) {
        const msgLower = message.toLowerCase();
        
        if (msgLower.includes('syntaxerror')) {
            if (msgLower.includes('unexpected token')) return 'UnexpectedToken';
            if (msgLower.includes('string') || msgLower.includes('template')) return 'StringMalformation';
            if (msgLower.includes('object') || msgLower.includes('array') || msgLower.includes('{') || msgLower.includes('[')) return 'ObjectArraySyntax';
            if (msgLower.includes('function') || msgLower.includes('=>')) return 'FunctionDefinition';
            return 'SyntaxError';
        }
        
        if (msgLower.includes('referenceerror')) return 'ReferenceError';
        if (msgLower.includes('typeerror')) return 'TypeError';
        if (msgLower.includes('import') || msgLower.includes('export') || msgLower.includes('module')) return 'ImportExportError';
        
        return 'AutresErreurs';
    }

    /**
     * Évaluer la sévérité d'une erreur
     */
    évaluerSévérité(message, type) {
        const msgLower = message.toLowerCase();
        
        // Erreurs critiques qui cassent complètement le fichier
        if (msgLower.includes('unexpected end of file') || 
            msgLower.includes('missing }') || 
            msgLower.includes('missing ]') || 
            msgLower.includes('missing )')) {
            return 'critique';
        }
        
        // Erreurs élevées
        if (type === 'SyntaxError' || type === 'UnexpectedToken') {
            return 'élevée';
        }
        
        // Erreurs modérées
        if (type === 'ReferenceError' || type === 'ImportExportError') {
            return 'modérée';
        }
        
        // Erreurs faibles
        return 'faible';
    }

    /**
     * Extraire le numéro de ligne de l'erreur
     */
    extraireLigneErreur(message) {
        const match = message.match(/:(\d+):/);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Simplifier le message d'erreur
     */
    simplifierMessage(message) {
        const lignes = message.split('\n');
        return lignes[0].replace(/^.*?:\d+:\d+:\s*/, '').trim();
    }

    /**
     * Obtenir la taille du fichier
     */
    obtenirTailleFichier(chemin) {
        try {
            const stats = fs.statSync(chemin);
            return stats.size;
        } catch {
            return 0;
        }
    }

    /**
     * Analyser les résultats et générer les statistiques
     */
    analyserRésultats() {
        const stats = this.rapport.statistiques;
        
        // Calculer le pourcentage de corruption
        if (stats.totalFichiersScannés > 0) {
            stats.pourcentageCorruption = Math.round(
                (stats.fichiersAvecErreurs / stats.totalFichiersScannés) * 100
            );
        }
        
        // Trier les erreurs par sévérité et fichier
        this.rapport.erreurs.détails.sort((a, b) => {
            const sévérités = { 'critique': 4, 'élevée': 3, 'modérée': 2, 'faible': 1 };
            return sévérités[b.sévérité] - sévérités[a.sévérité];
        });
        
        // Regrouper par fichier pour identifier les plus corrompus
        const erreursParFichier = {};
        this.rapport.erreurs.détails.forEach(erreur => {
            if (!erreursParFichier[erreur.fichier]) {
                erreursParFichier[erreur.fichier] = [];
            }
            erreursParFichier[erreur.fichier].push(erreur);
        });
        
        // Top 10 des fichiers les plus corrompus
        const fichiersTriés = Object.entries(erreursParFichier)
            .map(([fichier, erreurs]) => ({
                fichier,
                nombreErreurs: erreurs.length,
                sévéritéMax: this.obtenirSévéritéMax(erreurs),
                erreurs: erreurs
            }))
            .sort((a, b) => {
                const sévérités = { 'critique': 4, 'élevée': 3, 'modérée': 2, 'faible': 1 };
                if (sévérités[b.sévéritéMax] !== sévérités[a.sévéritéMax]) {
                    return sévérités[b.sévéritéMax] - sévérités[a.sévéritéMax];
                }
                return b.nombreErreurs - a.nombreErreurs;
            });
        
        this.rapport.fichiersProblématiques.top10Corrompus = fichiersTriés.slice(0, 10);
        
        // Regrouper par sévérité
        this.rapport.erreurs.détails.forEach(erreur => {
            this.rapport.fichiersProblématiques.parSévérité[erreur.sévérité].push(erreur);
        });
    }

    /**
     * Obtenir la sévérité maximale d'un groupe d'erreurs
     */
    obtenirSévéritéMax(erreurs) {
        const sévérités = { 'critique': 4, 'élevée': 3, 'modérée': 2, 'faible': 1 };
        let maxSév = 0;
        let résultat = 'faible';
        
        erreurs.forEach(erreur => {
            if (sévérités[erreur.sévérité] > maxSév) {
                maxSév = sévérités[erreur.sévérité];
                résultat = erreur.sévérité;
            }
        });
        
        return résultat;
    }

    /**
     * Générer les recommandations
     */
    générerRecommandations() {
        const stats = this.rapport.statistiques;
        const erreurs = this.rapport.erreurs;
        
        this.rapport.recommandations = [
            `📊 ÉTAT DU PROJET: ${stats.pourcentageCorruption}% de fichiers corrompus (${stats.fichiersAvecErreurs}/${stats.totalFichiersScannés})`,
            
            // Recommandations basées sur le taux de corruption
            stats.pourcentageCorruption > 75 ? 
                "🚨 CRITIQUE: Refactoring complet nécessaire" :
            stats.pourcentageCorruption > 50 ? 
                "⚠️ URGENT: Correction massive requise" :
            stats.pourcentageCorruption > 25 ? 
                "🔧 IMPORTANT: Plan de correction systématique" :
                "✅ ACCEPTABLE: Corrections ponctuelles suffisantes",
            
            // Recommandations par type d'erreur
            erreurs.parType.SyntaxError > erreurs.total * 0.4 ? 
                "🔍 Prioriser la correction des erreurs de syntaxe de base" : null,
            
            erreurs.parType.UnexpectedToken > erreurs.total * 0.3 ? 
                "🔧 Focus sur les tokens inattendus (accolades, parenthèses)" : null,
            
            erreurs.parType.StringMalformation > erreurs.total * 0.2 ? 
                "📝 Corriger les chaînes de caractères malformées" : null,
            
            // Plan d'action
            "🎯 PLAN D'ACTION RECOMMANDÉ:",
            "   1. Traiter d'abord les erreurs CRITIQUES",
            "   2. Corriger les fichiers du Top 10",
            "   3. Automatiser les corrections répétitives",
            "   4. Mettre en place des tests de syntaxe",
            "   5. Configurer des hooks de pre-commit"
        ].filter(Boolean);
    }

    /**
     * Sauvegarder le rapport en JSON
     */
    sauvegarderRapport() {
        const nomFichier = 'scan-erreurs-syntaxe.json';
        const contenu = JSON.stringify(this.rapport, null, 2);
        
        fs.writeFileSync(nomFichier, contenu, 'utf8');
        console.log(`📄 Rapport sauvegardé: ${nomFichier}`);
    }

    /**
     * Afficher le résumé des résultats
     */
    afficherRésumé() {
        const stats = this.rapport.statistiques;
        const erreurs = this.rapport.erreurs;
        
        console.log('\n🎯 RÉSUMÉ DU SCAN DE SYNTAXE');
        console.log('=====================================');
        console.log(`📂 Fichiers scannés: ${stats.totalFichiersScannés}`);
        console.log(`❌ Fichiers avec erreurs: ${stats.fichiersAvecErreurs}`);
        console.log(`✅ Fichiers sans erreurs: ${stats.fichiersSansErreurs}`);
        console.log(`📊 Taux de corruption: ${stats.pourcentageCorruption}%`);
        console.log(`🔢 Total erreurs: ${erreurs.total}`);
        
        console.log('\n📈 RÉPARTITION PAR TYPE:');
        console.log('-------------------------');
        Object.entries(erreurs.parType).forEach(([type, count]) => {
            if (count > 0) {
                const pourcentage = Math.round((count / erreurs.total) * 100);
                console.log(`   ${type}: ${count} (${pourcentage}%)`);
            }
        });
        
        console.log('\n🔥 TOP 5 FICHIERS LES PLUS CORROMPUS:');
        console.log('-------------------------------------');
        this.rapport.fichiersProblématiques.top10Corrompus.slice(0, 5).forEach((fichier, index) => {
            console.log(`   ${index + 1}. ${fichier.fichier} (${fichier.nombreErreurs} erreurs, sévérité: ${fichier.sévéritéMax})`);
        });
        
        console.log('\n💡 RECOMMANDATIONS:');
        console.log('-------------------');
        this.rapport.recommandations.forEach(rec => {
            console.log(`   ${rec}`);
        });
        
        console.log('\n✨ Scan terminé avec succès!');
        console.log(`📄 Rapport détaillé disponible dans: scan-erreurs-syntaxe.json`);
    }
}

// Exécution du script
if (require.main === module) {
    const scanner = new ScanSyntaxeComplet();
    
    scanner.lancerScan().catch(erreur => {
        console.error('💥 Erreur fatale:', erreur);
        process.exit(1);
    });
}

module.exports = ScanSyntaxeComplet;