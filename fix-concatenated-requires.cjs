#!/usr/bin/env node

/**
 * CORRECTEUR SPÉCIALISÉ - REQUIRES CONCATÉNÉS
 * 
 * Script pour corriger les lignes de require malformées avec des guillemets étranges
 * et des concaténations incorrectes
 */

const fs = require('fs');
const path = require('path');

class FixConcatenatedRequires {
    constructor() {
        this.corrections = {
            total: 0,
            réussies: 0,
            échouées: 0,
            fichiers: new Set(),
            détails: []
        };
    }

    /**
     * Corriger les requires concaténés dans un fichier
     */
    async corrigerFichier(cheminRelatif) {
        const cheminAbsolu = path.join(__dirname, 'backend', cheminRelatif);
        
        try {
            if (!fs.existsSync(cheminAbsolu)) {
                throw new Error(`Fichier non trouvé: ${cheminAbsolu}`);
            }
            
            const contenuOriginal = fs.readFileSync(cheminAbsolu, 'utf8');
            let contenuCorrigé = contenuOriginal;
            let modificationsAppliquées = 0;
            
            // Créer une sauvegarde
            const cheminBackup = cheminAbsolu + '.backup-requires';
            fs.writeFileSync(cheminBackup, contenuOriginal);
            
            // Pattern 1: EventEmitter concaténé
            const patternEventEmitter = /const\s+EventEmitter\s*=\s*require\s*\(\s*["']events["']\s*\)\s*;\s*['"]\s*const\s+config\s*=\s*require\s*\(\s*["']([^"']*?)["']\s*\)\s*;\s*['"]\s*\/g\s*const\s+sqlite3\s*=\s*require\s*\(\s*["']sqlite3["']\s*\)\.verbose\(\)\s*;\s*["']/g;
            
            if (patternEventEmitter.test(contenuCorrigé)) {
                contenuCorrigé = contenuCorrigé.replace(patternEventEmitter, 
                    `const EventEmitter = require("events");
const config = require("$1");
const sqlite3 = require("sqlite3").verbose();`);
                modificationsAppliquées++;
            }
            
            // Pattern 2: Imports concaténés
            const patternImports = /import\s+(\w+)\s+from\s+["']([^"']*?)["']\s*;\s*['"]\s+import\s+(\w+)\s+from\s+["']([^"']*?)["']\s*;\s*["']/g;
            if (patternImports.test(contenuCorrigé)) {
                contenuCorrigé = contenuCorrigé.replace(patternImports, 
                    'import $1 from "$2";\nimport $3 from "$4";');
                modificationsAppliquées++;
            }
            
            // Pattern 3: URLs avec guillemets étranges
            const patternURLs = /const\s+API_URL_\d+\s*=\s*['"][,'\\]*\s*(https?:\/\/[^'"]*?)\s*['";\\,\s]*/g;
            const urlsMatches = contenuCorrigé.match(/const\s+API_URL_\d+\s*=\s*[^;]+/g);
            if (urlsMatches) {
                urlsMatches.forEach(match => {
                    const urlMatch = match.match(/(https?:\/\/[^'";\s]+)/);
                    if (urlMatch) {
                        const cleanURL = urlMatch[1].replace(/[\\'"]/g, '');
                        const varName = match.match(/const\s+(API_URL_\d+)/)[1];
                        contenuCorrigé = contenuCorrigé.replace(match, `const ${varName} = '${cleanURL}';`);
                        modificationsAppliquées++;
                    }
                });
            }
            
            // Pattern 4: Guillemets de fin de ligne étranges
            contenuCorrigé = contenuCorrigé.replace(/;\s*['"]\s*$/gm, ';');
            
            // Pattern 5: Nettoyer les caractères d'échappement étranges
            contenuCorrigé = contenuCorrigé.replace(/\\['"]/g, '"');
            contenuCorrigé = contenuCorrigé.replace(/['"]{2,}/g, '"');
            
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
     * Exécuter la correction
     */
    async exécuter() {
        console.log('🔧 CORRECTION SPÉCIALISÉE - REQUIRES CONCATÉNÉS');
        console.log('================================================');
        
        // Liste des fichiers prioritaires à corriger
        const fichiersÀCorriger = [
            'alex-core\\LicorneOrchestrator.js',
            'alex-modules\\consciousness\\AlexHyperIntelligence.js',
            'alex-modules\\consciousness\\AlexKnowledgeGraph.js',
            'alex-modules\\consciousness\\AlexInfiniteCreator.js'
        ];
        
        console.log(`🔄 Correction de ${fichiersÀCorriger.length} fichiers prioritaires...`);
        
        for (const fichier of fichiersÀCorriger) {
            await this.corrigerFichier(fichier);
            this.corrections.total++;
        }
        
        // Afficher le résumé
        console.log('\n📊 RÉSUMÉ DES CORRECTIONS');
        console.log('==========================');
        console.log(`📁 Fichiers traités: ${this.corrections.fichiers.size}`);
        console.log(`✅ Corrections réussies: ${this.corrections.réussies}`);
        console.log(`❌ Corrections échouées: ${this.corrections.échouées}`);
        
        if (this.corrections.réussies > 0) {
            console.log('\n🎉 Quelques corrections ont réussi! Relancez le scan pour voir les améliorations.');
        }
    }
}

// Exécution du script
if (require.main === module) {
    const correcteur = new FixConcatenatedRequires();
    
    correcteur.exécuter().catch(erreur => {
        console.error('💥 Erreur fatale:', erreur);
        process.exit(1);
    });
}

module.exports = FixConcatenatedRequires;