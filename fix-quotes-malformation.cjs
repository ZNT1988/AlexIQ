#!/usr/bin/env node

/**
 * CORRECTEUR AUTOMATIQUE - GUILLEMETS MALFORMÉS
 * 
 * Script pour corriger automatiquement les guillemets malformés
 * identifiés dans le scan de syntaxe (35 erreurs, impact ÉLEVÉ)
 */

const fs = require('fs');
const path = require('path');

class FixQuotesMalformation {
    constructor() {
        this.rapport = null;
        this.corrections = {
            total: 0,
            réussies: 0,
            échouées: 0,
            fichiers: new Set(),
            détails: []
        };
        
        // Patterns de correction pour les guillemets
        this.patternsCorrection = [
            // Pattern 1: ';' à la fin des chaînes
            { regex: /(\w+)\s*=\s*(['"])(.*?)\2\s*;\s*['"]\s*;/g, replace: '$1 = $2$3$2;' },
            
            // Pattern 2: Guillemets doubles avec points-virgules
            { regex: /(['"])(.*?)\1\s*;\s*['"]([^'"]*)/g, replace: '$1$2$3$1' },
            
            // Pattern 3: EventEmitter avec guillemet étrange
            { regex: /const\s+(\w+)\s*=\s*require\s*\(\s*["']([^"']*?)["']\s*\)\s*;\s*['"]\s*/g, replace: 'const $1 = require("$2");' },
            
            // Pattern 4: Chaînes avec \' et \" mélangés
            { regex: /(['"])(.*?)\\(['"])(.*?)\s*\\(['"])(.*?)\1/g, replace: '$1$2$4$6$1' },
            
            // Pattern 5: Points-virgules dans les chaînes
            { regex: /(['"])(.*?);['"](.*?)(['"])/g, replace: '$1$2$3$4' },
            
            // Pattern 6: Doubles guillemets étranges
            { regex: /["']["']/g, replace: '"' },
            
            // Pattern 7: Échappement incorrect
            { regex: /\\(['"])/g, replace: '$1' },
            
            // Pattern 8: Espaces avant guillemets de fermeture
            { regex: /([^\\])\s+(['"])\s*;/g, replace: '$1$2;' }
        ];
    }

    /**
     * Charger le rapport d'analyse
     */
    chargerRapport() {
        try {
            const contenu = fs.readFileSync('analyse-patterns-erreurs.json', 'utf8');
            this.rapport = JSON.parse(contenu);
            console.log(`✅ Rapport d'analyse chargé`);
        } catch (erreur) {
            throw new Error(`Impossible de charger le rapport d'analyse: ${erreur.message}`);
        }
    }

    /**
     * Identifier les fichiers avec des guillemets malformés
     */
    identifierFichiers() {
        const pattern = this.rapport.patterns.quotes_malformees;
        if (!pattern || pattern.count === 0) {
            console.log('ℹ️ Aucune erreur de guillemets malformés trouvée');
            return [];
        }
        
        // Déduplication des fichiers
        const fichiersUniques = [...new Set(pattern.files)];
        console.log(`🎯 ${fichiersUniques.length} fichiers avec guillemets malformés identifiés`);
        
        return fichiersUniques;
    }

    /**
     * Corriger un fichier spécifique
     */
    async corrigerFichier(cheminRelatif) {
        const cheminAbsolu = path.join(__dirname, 'backend', cheminRelatif);
        
        try {
            // Lire le contenu original
            if (!fs.existsSync(cheminAbsolu)) {
                throw new Error(`Fichier non trouvé: ${cheminAbsolu}`);
            }
            
            const contenuOriginal = fs.readFileSync(cheminAbsolu, 'utf8');
            let contenuCorrigé = contenuOriginal;
            let modificationsAppliquées = 0;
            
            // Créer une sauvegarde
            const cheminBackup = cheminAbsolu + '.backup-quotes';
            fs.writeFileSync(cheminBackup, contenuOriginal);
            
            // Appliquer chaque pattern de correction
            for (const pattern of this.patternsCorrection) {
                const matches = contenuCorrigé.match(pattern.regex);
                if (matches) {
                    const nouveauContenu = contenuCorrigé.replace(pattern.regex, pattern.replace);
                    if (nouveauContenu !== contenuCorrigé) {
                        contenuCorrigé = nouveauContenu;
                        modificationsAppliquées += matches.length;
                    }
                }
            }
            
            // Corrections spécifiques supplémentaires
            contenuCorrigé = this.correctionsSpécifiques(contenuCorrigé);
            
            // Sauvegarder si des modifications ont été apportées
            if (contenuCorrigé !== contenuOriginal) {
                fs.writeFileSync(cheminAbsolu, contenuCorrigé);
                
                // Tester la syntaxe du fichier corrigé
                const syntaxeValide = await this.testerSyntaxe(cheminAbsolu);
                
                const détail = {
                    fichier: cheminRelatif,
                    modifications: modificationsAppliquées,
                    syntaxeValide: syntaxeValide,
                    taille: {
                        avant: contenuOriginal.length,
                        après: contenuCorrigé.length
                    }
                };
                
                if (syntaxeValide) {
                    this.corrections.réussies++;
                    console.log(`   ✅ ${cheminRelatif} - ${modificationsAppliquées} corrections appliquées`);
                } else {
                    // Restaurer la sauvegarde si la syntaxe est cassée
                    fs.writeFileSync(cheminAbsolu, contenuOriginal);
                    this.corrections.échouées++;
                    console.log(`   ❌ ${cheminRelatif} - Syntaxe cassée, restauration automatique`);
                }
                
                this.corrections.détails.push(détail);
                this.corrections.fichiers.add(cheminRelatif);
                
            } else {
                console.log(`   ℹ️ ${cheminRelatif} - Aucune correction automatique applicable`);
            }
            
        } catch (erreur) {
            console.error(`   ❌ Erreur lors de la correction de ${cheminRelatif}: ${erreur.message}`);
            this.corrections.échouées++;
        }
    }

    /**
     * Corrections spécifiques pour certains patterns courants
     */
    correctionsSpécifiques(contenu) {
        let résultat = contenu;
        
        // Correction 1: EventEmitter avec guillemet étrange à la fin
        résultat = résultat.replace(
            /const\s+EventEmitter\s*=\s*require\s*\(\s*["']events["']\s*\)\s*;\s*["']\s*;?/g,
            'const EventEmitter = require("events");'
        );
        
        // Correction 2: Imports avec guillemets malformés
        résultat = résultat.replace(
            /import\s+(\w+)\s+from\s+["']([^"']*?)["']\s*;\s*['"]\s+import/g,
            'import $1 from "$2";\nimport'
        );
        
        // Correction 3: URLs avec guillemets échappés incorrectement
        résultat = résultat.replace(
            /https?:\\?\/\\?\/?([^'"]*?)\\?['"]['"]/g,
            'https://$1'
        );
        
        // Correction 4: Points-virgules en trop dans les chaînes
        résultat = résultat.replace(
            /(['"])(.*?);(['"]),\s*\\?(['"])/g,
            '$1$2$3$4'
        );
        
        return résultat;
    }

    /**
     * Tester la syntaxe d'un fichier
     */
    async testerSyntaxe(cheminFichier) {
        try {
            const { execSync } = require('child_process');
            execSync(`node --check "${cheminFichier}"`, { stdio: 'pipe', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Générer le rapport de corrections
     */
    générerRapport() {
        const rapport = {
            timestamp: new Date().toISOString(),
            script: 'fix-quotes-malformation.cjs',
            objectif: 'Correction automatique des guillemets malformés',
            résultats: {
                fichiersTraités: this.corrections.fichiers.size,
                correctionsRéussies: this.corrections.réussies,
                correctionsÉchouées: this.corrections.échouées,
                tauxSuccès: this.corrections.fichiers.size > 0 ? 
                    Math.round((this.corrections.réussies / this.corrections.fichiers.size) * 100) : 0
            },
            détails: this.corrections.détails,
            recommandations: [
                this.corrections.échouées > 0 ? 
                    `⚠️ ${this.corrections.échouées} corrections ont échoué - révision manuelle nécessaire` : 
                    '✅ Toutes les corrections automatiques ont réussi',
                
                '🔄 Relancer le scan de syntaxe pour vérifier les améliorations',
                '🧪 Exécuter les tests pour valider les corrections',
                '🚀 Passer au pattern suivant: duplicate_declarations'
            ]
        };
        
        return rapport;
    }

    /**
     * Exécuter la correction automatique
     */
    async exécuter() {
        console.log('🔧 CORRECTION AUTOMATIQUE - GUILLEMETS MALFORMÉS');
        console.log('==================================================');
        
        try {
            // Charger le rapport d'analyse
            this.chargerRapport();
            
            // Identifier les fichiers à corriger
            const fichiers = this.identifierFichiers();
            
            if (fichiers.length === 0) {
                console.log('✅ Aucun fichier à corriger');
                return;
            }
            
            console.log(`🔄 Correction de ${fichiers.length} fichiers...`);
            
            // Corriger chaque fichier
            for (const fichier of fichiers) {
                await this.corrigerFichier(fichier);
                this.corrections.total++;
            }
            
            // Générer le rapport
            const rapport = this.générerRapport();
            const nomFichier = 'rapport-fix-quotes.json';
            fs.writeFileSync(nomFichier, JSON.stringify(rapport, null, 2));
            
            // Afficher le résumé
            console.log('\n📊 RÉSUMÉ DES CORRECTIONS');
            console.log('==========================');
            console.log(`📁 Fichiers traités: ${rapport.résultats.fichiersTraités}`);
            console.log(`✅ Corrections réussies: ${rapport.résultats.correctionsRéussies}`);
            console.log(`❌ Corrections échouées: ${rapport.résultats.correctionsÉchouées}`);
            console.log(`📈 Taux de succès: ${rapport.résultats.tauxSuccès}%`);
            
            console.log('\n💡 PROCHAINES ÉTAPES:');
            rapport.recommandations.forEach(rec => console.log(`   ${rec}`));
            
            console.log(`\n📄 Rapport détaillé: ${nomFichier}`);
            
        } catch (erreur) {
            console.error('❌ Erreur lors de la correction:', erreur.message);
            throw erreur;
        }
    }
}

// Exécution du script
if (require.main === module) {
    const correcteur = new FixQuotesMalformation();
    
    correcteur.exécuter().catch(erreur => {
        console.error('💥 Erreur fatale:', erreur);
        process.exit(1);
    });
}

module.exports = FixQuotesMalformation;