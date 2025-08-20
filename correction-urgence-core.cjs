#!/usr/bin/env node

/**
 * CORRECTION D'URGENCE - MODULES CORE
 * 
 * Script de correction manuelle pour les 5 fichiers les plus critiques
 * qui empêchent le fonctionnement de base de l'application
 */

const fs = require('fs');
const path = require('path');

class CorrectionUrgenceCore {
    constructor() {
        this.corrections = {
            total: 0,
            réussies: 0,
            échouées: 0,
            détails: []
        };
        
        // Fichiers critiques à corriger en priorité
        this.fichiersCore = [
            {
                chemin: 'alex-core\\AlexKernel.js',
                priority: 'CRITIQUE',
                description: 'Noyau principal - Variables avec mots réservés'
            },
            {
                chemin: 'alex-core\\UniversalModuleRegistry.js', 
                priority: 'CRITIQUE',
                description: 'Registre modules - Variables réservées'
            },
            {
                chemin: 'alex-core\\LicorneOrchestrator.js',
                priority: 'CRITIQUE', 
                description: 'Orchestrateur - Requires malformés'
            },
            {
                chemin: 'routes\\real-alex.js',
                priority: 'ÉLEVÉE',
                description: 'Route principale API'
            },
            {
                chemin: 'middleware\\errorHandler.js',
                priority: 'ÉLEVÉE',
                description: 'Gestionnaire erreurs global'
            }
        ];
    }

    /**
     * Corriger les variables avec mots réservés
     */
    corrigerMotsRéservés(contenu) {
        let résultat = contenu;
        let corrections = 0;
        
        // Pattern: let + mot réservé + commentaire
        const patterns = [
            { regex: /let\s+true\s*;\s*\/\/\s*Variable auto-déclarée/g, replace: 'let isTrue; // Variable auto-déclarée' },
            { regex: /let\s+false\s*;\s*\/\/\s*Variable auto-déclarée/g, replace: 'let isFalse; // Variable auto-déclarée' },
            { regex: /let\s+continue\s*;\s*\/\/\s*Variable auto-déclarée/g, replace: 'let shouldContinue; // Variable auto-déclarée' },
            { regex: /let\s+return\s*;\s*\/\/\s*Variable auto-déclarée/g, replace: 'let returnValue; // Variable auto-déclarée' },
            { regex: /let\s+function\s*;\s*\/\/\s*Variable auto-déclarée/g, replace: 'let functionRef; // Variable auto-déclarée' },
            { regex: /let\s+class\s*;\s*\/\/\s*Variable auto-déclarée/g, replace: 'let classRef; // Variable auto-déclarée' },
            { regex: /let\s+const\s*;\s*\/\/\s*Variable auto-déclarée/g, replace: 'let constantRef; // Variable auto-déclarée' },
            { regex: /let\s+var\s*;\s*\/\/\s*Variable auto-déclarée/g, replace: 'let variableRef; // Variable auto-déclarée' }
        ];
        
        for (const pattern of patterns) {
            if (pattern.regex.test(résultat)) {
                résultat = résultat.replace(pattern.regex, pattern.replace);
                corrections++;
            }
        }
        
        return { contenu: résultat, corrections };
    }

    /**
     * Corriger les requires concaténés
     */
    corrigerRequiresConcaténés(contenu) {
        let résultat = contenu;
        let corrections = 0;
        
        // Pattern spécifique pour EventEmitter + config + sqlite3
        const patternComplex = /const\s+EventEmitter\s*=\s*require\s*\(\s*["']events["']\s*\)\s*;\s*['"]\s*const\s+config\s*=\s*require\s*\(\s*["']([^"']*?)["']\s*\)\s*;\s*['"]\s*\/g\s*const\s+sqlite3\s*=\s*require\s*\(\s*["']sqlite3["']\s*\)\.verbose\(\)\s*;\s*['"]/;
        
        if (patternComplex.test(résultat)) {
            résultat = résultat.replace(patternComplex, 
                `const EventEmitter = require("events");
const config = require("$1");
const sqlite3 = require("sqlite3").verbose();`);
            corrections++;
        }
        
        // Pattern général pour requires avec guillemets étranges
        résultat = résultat.replace(/const\s+(\w+)\s*=\s*require\s*\(\s*["']([^"']*?)["']\s*\)\s*;\s*['"]\s*/g, 'const $1 = require("$2");');
        
        return { contenu: résultat, corrections };
    }

    /**
     * Corriger les objets malformés
     */
    corrigerObjetsmalformés(contenu) {
        let résultat = contenu;
        let corrections = 0;
        
        // Pattern: const task = "{"
        résultat = résultat.replace(/const\s+(\w+)\s*=\s*['"]\{['"]\s*;/g, 'const $1 = {');
        
        // Pattern: status: "pending","
        résultat = résultat.replace(/(\w+):\s*["']([^"']*?)["']\s*,\s*["']\s*/g, '$1: "$2",');
        
        // Pattern: }"; au lieu de }
        résultat = résultat.replace(/\}\s*['"]\s*;/g, '};');
        
        return { contenu: résultat, corrections };
    }

    /**
     * Corriger les tableaux malformés
     */
    corrigerTableauxMalformés(contenu) {
        let résultat = contenu;
        let corrections = 0;
        
        // Pattern: const array = "["
        résultat = résultat.replace(/const\s+(\w+)\s*=\s*['"]\[['"]\s*;/g, 'const $1 = [');
        
        // Pattern: ]"; au lieu de ]
        résultat = résultat.replace(/\]\s*['"]\s*;/g, '];');
        
        return { contenu: résultat, corrections };
    }

    /**
     * Corriger les chaînes avec guillemets étranges
     */
    corrigerGuillemetsÉtranges(contenu) {
        let résultat = contenu;
        let corrections = 0;
        
        // Nettoyer les doubles guillemets
        résultat = résultat.replace(/['"]{2,}/g, '"');
        
        // Corriger les échappements incorrects
        résultat = résultat.replace(/\\['"]/g, '"');
        
        // Corriger les points-virgules dans les chaînes
        résultat = résultat.replace(/(['"]);(['"]),/g, '$1$2,');
        
        return { contenu: résultat, corrections };
    }

    /**
     * Corriger un fichier spécifique
     */
    async corrigerFichier(fichierInfo) {
        const cheminAbsolu = path.join(__dirname, 'backend', fichierInfo.chemin);
        console.log(`\n🔧 Correction de ${fichierInfo.chemin} (${fichierInfo.priority})`);
        
        try {
            if (!fs.existsSync(cheminAbsolu)) {
                throw new Error(`Fichier non trouvé: ${cheminAbsolu}`);
            }
            
            const contenuOriginal = fs.readFileSync(cheminAbsolu, 'utf8');
            let contenuCorrigé = contenuOriginal;
            let totalCorrections = 0;
            
            // Créer sauvegarde
            const cheminBackup = cheminAbsolu + '.backup-urgence';
            fs.writeFileSync(cheminBackup, contenuOriginal);
            console.log(`   💾 Sauvegarde créée: ${path.basename(cheminBackup)}`);
            
            // Appliquer toutes les corrections
            const corrections = [
                this.corrigerMotsRéservés(contenuCorrigé),
                this.corrigerRequiresConcaténés(contenuCorrigé),
                this.corrigerObjetsmalformés(contenuCorrigé),
                this.corrigerTableauxMalformés(contenuCorrigé),
                this.corrigerGuillemetsÉtranges(contenuCorrigé)
            ];
            
            contenuCorrigé = corrections.reduce((acc, correction, index) => {
                const nouveauContenu = index === 0 ? correction.contenu : 
                    corrections[index - 1].contenu === acc ? correction.contenu : acc;
                totalCorrections += correction.corrections;
                return nouveauContenu;
            }, contenuCorrigé);
            
            // Sauvegarder les modifications
            if (contenuCorrigé !== contenuOriginal) {
                fs.writeFileSync(cheminAbsolu, contenuCorrigé);
                console.log(`   ✏️ ${totalCorrections} corrections appliquées`);
                
                // Tester la syntaxe
                const syntaxeValide = await this.testerSyntaxe(cheminAbsolu);
                
                if (syntaxeValide) {
                    console.log(`   ✅ Syntaxe valide après correction`);
                    this.corrections.réussies++;
                } else {
                    console.log(`   ❌ Syntaxe toujours invalide, restauration...`);
                    fs.writeFileSync(cheminAbsolu, contenuOriginal);
                    this.corrections.échouées++;
                }
                
                this.corrections.détails.push({
                    fichier: fichierInfo.chemin,
                    corrections: totalCorrections,
                    syntaxeValide: syntaxeValide,
                    taille: {
                        avant: contenuOriginal.length,
                        après: contenuCorrigé.length
                    }
                });
                
            } else {
                console.log(`   ℹ️ Aucune correction applicable automatiquement`);
            }
            
        } catch (erreur) {
            console.error(`   ❌ Erreur: ${erreur.message}`);
            this.corrections.échouées++;
        }
    }

    /**
     * Tester la syntaxe d'un fichier
     */
    async testerSyntaxe(cheminFichier) {
        try {
            const { execSync } = require('child_process');
            execSync(`node --check "${cheminFichier}"`, { stdio: 'pipe', timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Exécuter la correction d'urgence
     */
    async exécuter() {
        console.log('🚨 CORRECTION D\'URGENCE - MODULES CORE');
        console.log('=======================================');
        console.log('⚠️ Cette correction traite les erreurs les plus critiques');
        console.log('⚠️ Les sauvegardes seront créées automatiquement\n');
        
        // Traiter chaque fichier critique
        for (const fichier of this.fichiersCore) {
            await this.corrigerFichier(fichier);
            this.corrections.total++;
            
            // Petite pause entre les fichiers
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Générer le rapport final
        this.générerRapportUrgence();
    }

    /**
     * Générer le rapport de correction d'urgence
     */
    générerRapportUrgence() {
        const rapport = {
            timestamp: new Date().toISOString(),
            type: 'CORRECTION_URGENCE_CORE',
            résultats: {
                fichiersTraités: this.corrections.total,
                correctionsRéussies: this.corrections.réussies,
                correctionsÉchouées: this.corrections.échouées,
                tauxSuccès: this.corrections.total > 0 ? 
                    Math.round((this.corrections.réussies / this.corrections.total) * 100) : 0
            },
            détails: this.corrections.détails,
            prochainesTouches: [
                'Relancer le scan de syntaxe complet',
                'Tester le démarrage de l\'application', 
                'Vérifier les fonctionnalités core',
                'Corriger les fichiers secondaires',
                'Implémenter la validation continue'
            ]
        };
        
        fs.writeFileSync('rapport-correction-urgence.json', JSON.stringify(rapport, null, 2));
        
        // Affichage du résumé
        console.log('\n🎯 RÉSUMÉ CORRECTION D\'URGENCE');
        console.log('==============================');
        console.log(`📁 Fichiers traités: ${rapport.résultats.fichiersTraités}`);
        console.log(`✅ Corrections réussies: ${rapport.résultats.correctionsRéussies}`);
        console.log(`❌ Corrections échouées: ${rapport.résultats.correctionsÉchouées}`);
        console.log(`📈 Taux de succès: ${rapport.résultats.tauxSuccès}%`);
        
        if (rapport.résultats.correctionsRéussies > 0) {
            console.log('\n🎉 Quelques fichiers core ont été corrigés avec succès!');
            console.log('📋 Prochaines étapes:');
            rapport.prochainesTouches.forEach((étape, i) => {
                console.log(`   ${i + 1}. ${étape}`);
            });
        } else {
            console.log('\n⚠️ Aucune correction automatique n\'a réussi.');
            console.log('👨‍💻 Intervention manuelle nécessaire pour ces fichiers.');
        }
        
        console.log(`\n📄 Rapport détaillé: rapport-correction-urgence.json`);
    }
}

// Exécution du script
if (require.main === module) {
    const correcteur = new CorrectionUrgenceCore();
    
    correcteur.exécuter().catch(erreur => {
        console.error('💥 Erreur fatale lors de la correction d\'urgence:', erreur);
        process.exit(1);
    });
}

module.exports = CorrectionUrgenceCore;