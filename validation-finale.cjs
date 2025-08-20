#!/usr/bin/env node

/**
 * VALIDATION FINALE - ÉTAT POST-INTERVENTION
 * 
 * Script de validation pour mesurer l'impact des corrections
 * et générer un rapport final d'état du projet
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ValidationFinale {
    constructor() {
        this.rapportInitial = null;
        this.résultatsValidation = {
            timestamp: new Date().toISOString(),
            fichiersTestés: 0,
            erreursRestantes: 0,
            correctionsEffectuées: 0,
            améliorationPourcentage: 0,
            détailsParFichier: [],
            recommandationsFinals: []
        };
    }

    /**
     * Charger le rapport initial pour comparaison
     */
    chargerRapportInitial() {
        try {
            const contenu = fs.readFileSync('scan-erreurs-syntaxe.json', 'utf8');
            this.rapportInitial = JSON.parse(contenu);
            console.log(`✅ Rapport initial chargé: ${this.rapportInitial.erreurs.total} erreurs détectées`);
        } catch (erreur) {
            throw new Error(`Impossible de charger le rapport initial: ${erreur.message}`);
        }
    }

    /**
     * Relancer un scan rapide de validation
     */
    async scanValidation() {
        console.log('🔄 Scan de validation en cours...');
        
        const fichiersJS = this.collecterFichiersJS(path.join(__dirname, 'backend'));
        this.résultatsValidation.fichiersTestés = fichiersJS.length;
        
        let erreursRestantes = 0;
        
        for (const fichier of fichiersJS) {
            const cheminRelatif = path.relative(path.join(__dirname, 'backend'), fichier);
            const syntaxeValide = await this.testerSyntaxeFichier(fichier);
            
            this.résultatsValidation.détailsParFichier.push({
                fichier: cheminRelatif,
                syntaxeValide: syntaxeValide,
                étaitErroné: this.fichierÉtaitErroné(cheminRelatif),
                statut: syntaxeValide ? 'OK' : 'ERREUR'
            });
            
            if (!syntaxeValide) {
                erreursRestantes++;
            }
        }
        
        this.résultatsValidation.erreursRestantes = erreursRestantes;
        console.log(`📊 Scan terminé: ${erreursRestantes} erreurs restantes sur ${fichiersJS.length} fichiers`);
    }

    /**
     * Vérifier si un fichier était dans les erreurs initiales
     */
    fichierÉtaitErroné(cheminRelatif) {
        if (!this.rapportInitial) return false;
        
        return this.rapportInitial.erreurs.détails.some(erreur => 
            erreur.fichier.replace(/\\/g, '/') === cheminRelatif.replace(/\\/g, '/')
        );
    }

    /**
     * Collecter récursivement tous les fichiers .js
     */
    collecterFichiersJS(dossier) {
        const fichiers = [];
        
        if (!fs.existsSync(dossier)) return fichiers;
        
        const éléments = fs.readdirSync(dossier);
        
        for (const élément of éléments) {
            const cheminComplet = path.join(dossier, élément);
            const stats = fs.statSync(cheminComplet);
            
            if (stats.isDirectory()) {
                if (!élément.startsWith('.') && 
                    élément !== 'node_modules' && 
                    élément !== 'logs' && 
                    élément !== 'data') {
                    fichiers.push(...this.collecterFichiersJS(cheminComplet));
                }
            } else if (path.extname(élément) === '.js') {
                fichiers.push(cheminComplet);
            }
        }
        
        return fichiers;
    }

    /**
     * Tester la syntaxe d'un fichier
     */
    async testerSyntaxeFichier(cheminFichier) {
        try {
            execSync(`node --check "${cheminFichier}"`, { stdio: 'pipe', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Calculer les améliorations
     */
    calculerAméliorations() {
        if (!this.rapportInitial) return;
        
        const erreursInitiales = this.rapportInitial.erreurs.total;
        const erreursRestantes = this.résultatsValidation.erreursRestantes;
        
        this.résultatsValidation.correctionsEffectuées = erreursInitiales - erreursRestantes;
        this.résultatsValidation.améliorationPourcentage = erreursInitiales > 0 ? 
            Math.round((this.résultatsValidation.correctionsEffectuées / erreursInitiales) * 100) : 0;
        
        console.log(`📈 Améliorations: ${this.résultatsValidation.correctionsEffectuées} erreurs corrigées (${this.résultatsValidation.améliorationPourcentage}%)`);
    }

    /**
     * Générer les recommandations finales
     */
    générerRecommandationsFinales() {
        const recommendations = [];
        const erreursRestantes = this.résultatsValidation.erreursRestantes;
        const totalFichiers = this.résultatsValidation.fichiersTestés;
        const pourcentageCorruption = Math.round((erreursRestantes / totalFichiers) * 100);
        
        // État général
        if (pourcentageCorruption === 0) {
            recommendations.push('🎉 EXCELLENT: Aucune erreur de syntaxe détectée!');
            recommendations.push('✅ Le projet est prêt pour la production');
        } else if (pourcentageCorruption < 10) {
            recommendations.push('🟢 BON: Très peu d\'erreurs restantes');
            recommendations.push('🔧 Corrections finales recommandées avant production');
        } else if (pourcentageCorruption < 30) {
            recommendations.push('🟡 MOYEN: Améliorations significatives mais travail restant');
            recommendations.push('⚠️ Tests supplémentaires requis avant déploiement');
        } else {
            recommendations.push('🔴 CRITIQUE: Trop d\'erreurs persistent');
            recommendations.push('🚨 Intervention manuelle urgente nécessaire');
        }
        
        // Recommandations techniques
        recommendations.push('📋 ACTIONS RECOMMANDÉES:');
        if (erreursRestantes > 0) {
            recommendations.push('  1. Corriger manuellement les erreurs restantes');
            recommendations.push('  2. Implémenter ESLint avec configuration stricte');
            recommendations.push('  3. Ajouter hooks pre-commit pour validation syntaxe');
            recommendations.push('  4. Former l\'équipe aux bonnes pratiques JavaScript');
        } else {
            recommendations.push('  1. Mettre en place monitoring qualité continu');
            recommendations.push('  2. Implémenter tests unitaires complets');
            recommendations.push('  3. Documenter standards de code établis');
            recommendations.push('  4. Automatiser validation dans CI/CD');
        }
        
        // Monitoring
        recommendations.push('📊 MONITORING QUALITÉ:');
        recommendations.push('  • Scan syntaxe quotidien automatisé');
        recommendations.push('  • Dashboard qualité temps réel');
        recommendations.push('  • Alertes sur régression qualité');
        recommendations.push('  • Métriques détection précoce');
        
        this.résultatsValidation.recommandationsFinals = recommendations;
    }

    /**
     * Générer le rapport final complet
     */
    générerRapportFinal() {
        const rapport = {
            ...this.résultatsValidation,
            comparaison: {
                erreursInitiales: this.rapportInitial?.erreurs?.total || 0,
                erreursFinales: this.résultatsValidation.erreursRestantes,
                différence: (this.rapportInitial?.erreurs?.total || 0) - this.résultatsValidation.erreursRestantes
            },
            statistiques: {
                fichiersCorrigés: this.résultatsValidation.détailsParFichier.filter(f => 
                    f.étaitErroné && f.syntaxeValide
                ).length,
                nouveauxProblèmes: this.résultatsValidation.détailsParFichier.filter(f => 
                    !f.étaitErroné && !f.syntaxeValide
                ).length,
                problèmesPersistants: this.résultatsValidation.détailsParFichier.filter(f => 
                    f.étaitErroné && !f.syntaxeValide
                ).length
            }
        };
        
        fs.writeFileSync('rapport-validation-finale.json', JSON.stringify(rapport, null, 2));
        return rapport;
    }

    /**
     * Exécuter la validation finale
     */
    async exécuter() {
        console.log('🎯 VALIDATION FINALE - ÉTAT POST-INTERVENTION');
        console.log('==============================================');
        
        try {
            // Charger rapport initial
            this.chargerRapportInitial();
            
            // Scanner l'état actuel
            await this.scanValidation();
            
            // Calculer améliorations
            this.calculerAméliorations();
            
            // Générer recommandations
            this.générerRecommandationsFinales();
            
            // Créer rapport final
            const rapportFinal = this.générerRapportFinal();
            
            // Afficher résumé
            this.afficherRésumé(rapportFinal);
            
        } catch (erreur) {
            console.error('❌ Erreur lors de la validation:', erreur.message);
            throw erreur;
        }
    }

    /**
     * Afficher le résumé de validation
     */
    afficherRésumé(rapport) {
        console.log('\n📊 RÉSUMÉ DE LA VALIDATION');
        console.log('===========================');
        
        // État général
        const pourcentageCorruption = Math.round((rapport.erreursRestantes / rapport.fichiersTestés) * 100);
        console.log(`📁 Fichiers analysés: ${rapport.fichiersTestés}`);
        console.log(`❌ Erreurs restantes: ${rapport.erreursRestantes} (${pourcentageCorruption}%)`);
        
        // Comparaison avant/après
        console.log('\n📈 COMPARAISON AVANT/APRÈS:');
        console.log(`   Erreurs initiales: ${rapport.comparaison.erreursInitiales}`);
        console.log(`   Erreurs finales: ${rapport.comparaison.erreursFinales}`);
        console.log(`   Corrections: ${rapport.correctionsEffectuées} (${rapport.améliorationPourcentage}%)`);
        
        // Statistiques détaillées
        console.log('\n🔧 DÉTAIL DES CORRECTIONS:');
        console.log(`   ✅ Fichiers corrigés: ${rapport.statistiques.fichiersCorrigés}`);
        console.log(`   ⚠️ Problèmes persistants: ${rapport.statistiques.problèmesPersistants}`);
        console.log(`   🆕 Nouveaux problèmes: ${rapport.statistiques.nouveauxProblèmes}`);
        
        // État final
        console.log('\n🎯 ÉTAT FINAL DU PROJET:');
        if (pourcentageCorruption === 0) {
            console.log('   🎉 PARFAIT - Aucune erreur de syntaxe');
        } else if (pourcentageCorruption < 10) {
            console.log('   🟢 EXCELLENT - Très peu d\'erreurs');
        } else if (pourcentageCorruption < 30) {
            console.log('   🟡 ACCEPTABLE - Améliorations nécessaires');
        } else {
            console.log('   🔴 CRITIQUE - Intervention urgente requise');
        }
        
        // Recommandations
        console.log('\n💡 RECOMMANDATIONS FINALES:');
        rapport.recommandationsFinals.slice(0, 8).forEach(rec => {
            console.log(`   ${rec}`);
        });
        
        console.log(`\n📄 Rapport complet: rapport-validation-finale.json`);
    }
}

// Exécution du script
if (require.main === module) {
    const validateur = new ValidationFinale();
    
    validateur.exécuter().catch(erreur => {
        console.error('💥 Erreur fatale lors de la validation:', erreur);
        process.exit(1);
    });
}

module.exports = ValidationFinale;