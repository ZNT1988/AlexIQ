#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class AuthenticModuleAnalyzer {
    constructor() {
        this.authenticModules = {
            infrastructure: [],
            services: [],
            intelligent: [],
            utilities: [],
            monitoring: [],
            routes: []
        };
        this.basePath = process.cwd();
    }

    // Critères pour modules authentiques
    isAuthentic(filePath, content) {
        // Exclure node_modules et tests
        if (filePath.includes('node_modules') || filePath.includes('/tests/') || filePath.includes('.test.')) {
            return false;
        }

        // Vérifications de base
        if (this.hasMathRandom(content)) return false;
        if (this.hasSimulateFunctions(content)) return false;
        if (this.hasPlaceholders(content)) return false;
        if (this.hasMagicNumbers(content)) return false;
        if (!this.isFunctional(content)) return false;

        return true;
    }

    hasMathRandom(content) {
        return /Math\.random\(\)/.test(content);
    }

    hasSimulateFunctions(content) {
        return /simulate[A-Z][a-zA-Z]*\s*\(/.test(content);
    }

    hasPlaceholders(content) {
        const patterns = [
            /TODO:/i,
            /FIXME:/i,
            /placeholder/i,
            /\[TODO\]/i,
            /\[FIXME\]/i,
            /\/\/ TODO/i,
            /\/\/ FIXME/i
        ];
        return patterns.some(pattern => pattern.test(content));
    }

    hasMagicNumbers(content) {
        // Recherche des scores hardcodés suspects
        const suspiciousPatterns = [
            /score:\s*0\.[0-9]{2,}/,
            /confidence:\s*0\.[0-9]{2,}/,
            /accuracy:\s*0\.[0-9]{2,}/,
            /probability:\s*0\.[0-9]{2,}/
        ];
        return suspiciousPatterns.some(pattern => pattern.test(content));
    }

    isFunctional(content) {
        // Vérifie si le module a du code fonctionnel réel
        const functionalPatterns = [
            /class\s+[A-Z][a-zA-Z]*\s*{/,
            /function\s+[a-zA-Z][a-zA-Z0-9]*\s*\(/,
            /const\s+[a-zA-Z][a-zA-Z0-9]*\s*=\s*[^;]+;/,
            /module\.exports\s*=/,
            /export\s+(default\s+)?/,
            /app\.(get|post|put|delete)/,
            /router\.(get|post|put|delete)/
        ];
        
        return functionalPatterns.some(pattern => pattern.test(content));
    }

    categorizeModule(filePath, content) {
        const fileName = path.basename(filePath, '.js');
        const dirPath = path.dirname(filePath);

        // Infrastructure
        if (dirPath.includes('/config/') || 
            fileName.includes('server') || 
            fileName.includes('cluster') ||
            fileName.includes('middleware')) {
            return 'infrastructure';
        }

        // Services
        if (dirPath.includes('/services/') || 
            dirPath.includes('/cache/') ||
            fileName.includes('Cache') ||
            fileName.includes('Manager')) {
            return 'services';
        }

        // Routes
        if (dirPath.includes('/routes/') || dirPath.includes('/api/')) {
            return 'routes';
        }

        // Monitoring & Sécurité
        if (dirPath.includes('/monitoring/') || 
            dirPath.includes('/security/') ||
            dirPath.includes('/diagnostics/') ||
            fileName.includes('Monitor') ||
            fileName.includes('Security')) {
            return 'monitoring';
        }

        // Utilitaires
        if (dirPath.includes('/utils/') || 
            dirPath.includes('/tools/') ||
            fileName.includes('Helper') ||
            fileName.includes('Util')) {
            return 'utilities';
        }

        // Modules intelligents (alex-modules, consciousness, intelligence, etc.)
        if (dirPath.includes('/alex-modules/') || 
            dirPath.includes('/consciousness/') ||
            dirPath.includes('/intelligence/') ||
            dirPath.includes('/specialized/') ||
            dirPath.includes('/core/') ||
            fileName.includes('Alex') ||
            fileName.includes('Intelligence') ||
            fileName.includes('Core')) {
            return 'intelligent';
        }

        return 'utilities'; // Par défaut
    }

    getMainFunctions(content) {
        const functions = [];
        
        // Classes
        const classMatches = content.match(/class\s+([A-Z][a-zA-Z]*)\s*{/g);
        if (classMatches) {
            classMatches.forEach(match => {
                const className = match.match(/class\s+([A-Z][a-zA-Z]*)/)[1];
                functions.push(`Class: ${className}`);
            });
        }

        // Functions
        const functionMatches = content.match(/(?:async\s+)?function\s+([a-zA-Z][a-zA-Z0-9]*)\s*\(/g);
        if (functionMatches) {
            functionMatches.forEach(match => {
                const funcName = match.match(/function\s+([a-zA-Z][a-zA-Z0-9]*)/)[1];
                functions.push(`Function: ${funcName}`);
            });
        }

        // Arrow functions
        const arrowMatches = content.match(/const\s+([a-zA-Z][a-zA-Z0-9]*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g);
        if (arrowMatches) {
            arrowMatches.forEach(match => {
                const funcName = match.match(/const\s+([a-zA-Z][a-zA-Z0-9]*)/)[1];
                functions.push(`Arrow: ${funcName}`);
            });
        }

        // Methods
        const methodMatches = content.match(/(?:async\s+)?([a-zA-Z][a-zA-Z0-9]*)\s*\([^)]*\)\s*{/g);
        if (methodMatches) {
            methodMatches.slice(0, 3).forEach(match => { // Limite à 3 pour éviter trop de bruit
                const methodName = match.match(/([a-zA-Z][a-zA-Z0-9]*)\s*\(/)[1];
                if (!['if', 'for', 'while', 'function', 'class'].includes(methodName)) {
                    functions.push(`Method: ${methodName}`);
                }
            });
        }

        return functions.slice(0, 5); // Max 5 functions
    }

    canBenefitFromAI(content) {
        const aiPatterns = [
            /analyze/i,
            /predict/i,
            /recommend/i,
            /optimize/i,
            /intelligent/i,
            /smart/i,
            /decision/i,
            /learning/i,
            /cognitive/i,
            /neural/i,
            /algorithm/i,
            /machine/i,
            /ai/i,
            /llm/i,
            /gpt/i,
            /claude/i,
            /anthropic/i,
            /openai/i
        ];
        
        return aiPatterns.some(pattern => pattern.test(content));
    }

    analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            if (!this.isAuthentic(filePath, content)) {
                return null;
            }

            const category = this.categorizeModule(filePath, content);
            const functions = this.getMainFunctions(content);
            const canBenefitAI = this.canBenefitFromAI(content);

            return {
                path: filePath.replace(this.basePath, '').replace(/\\/g, '/'),
                functions: functions,
                canBenefitFromAI: canBenefitAI,
                size: content.length
            };
        } catch (error) {
            console.error(`Erreur lecture ${filePath}:`, error.message);
            return null;
        }
    }

    scanDirectory(dirPath) {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    // Skip node_modules et certains dossiers
                    if (!entry.name.includes('node_modules') && 
                        !entry.name.startsWith('.') &&
                        !entry.name.includes('dist') &&
                        !entry.name.includes('build')) {
                        this.scanDirectory(fullPath);
                    }
                } else if (entry.name.endsWith('.js') && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
                    const moduleInfo = this.analyzeFile(fullPath);
                    if (moduleInfo) {
                        const category = this.categorizeModule(fullPath, fs.readFileSync(fullPath, 'utf8'));
                        this.authenticModules[category].push(moduleInfo);
                    }
                }
            }
        } catch (error) {
            console.error(`Erreur scan ${dirPath}:`, error.message);
        }
    }

    generateReport() {
        let totalModules = 0;
        Object.values(this.authenticModules).forEach(category => {
            totalModules += category.length;
        });

        console.log(`\n🎯 ANALYSE COMPLÈTE DES MODULES AUTHENTIQUES`);
        console.log(`═══════════════════════════════════════════════`);
        console.log(`📊 Total modules authentiques trouvés: ${totalModules}`);
        console.log(`🕒 Analyse effectuée le: ${new Date().toLocaleString()}`);

        Object.entries(this.authenticModules).forEach(([categoryName, modules]) => {
            if (modules.length > 0) {
                console.log(`\n📁 ${categoryName.toUpperCase()} (${modules.length} modules)`);
                console.log(`${'─'.repeat(50)}`);
                
                modules.forEach((module, index) => {
                    console.log(`\n${index + 1}. ${module.path}`);
                    console.log(`   📋 Fonctions: ${module.functions.slice(0, 3).join(', ') || 'Aucune détectée'}`);
                    console.log(`   🤖 Peut bénéficier d'IA: ${module.canBenefitFromAI ? '✅ Oui' : '❌ Non'}`);
                    console.log(`   📏 Taille: ${module.size} caractères`);
                });
            }
        });

        return {
            totalModules,
            breakdown: Object.fromEntries(
                Object.entries(this.authenticModules).map(([key, value]) => [key, value.length])
            ),
            modules: this.authenticModules
        };
    }

    saveDetailedReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalModules: 0,
            categories: {}
        };

        Object.entries(this.authenticModules).forEach(([categoryName, modules]) => {
            report.totalModules += modules.length;
            report.categories[categoryName] = {
                count: modules.length,
                modules: modules.map(module => ({
                    path: module.path,
                    functions: module.functions,
                    canBenefitFromAI: module.canBenefitFromAI,
                    size: module.size
                }))
            };
        });

        fs.writeFileSync('MODULES-AUTHENTIQUES-FINAL-171.json', JSON.stringify(report, null, 2));
        console.log(`\n💾 Rapport détaillé sauvegardé: MODULES-AUTHENTIQUES-FINAL-171.json`);

        return report;
    }

    run() {
        console.log('🔍 Démarrage de l\'analyse des modules authentiques...');
        
        // Scanner les dossiers principaux
        const foldersToScan = [
            path.join(this.basePath, 'backend'),
            path.join(this.basePath, 'frontend/src'),
            path.join(this.basePath, 'config'),
            path.join(this.basePath, 'scripts'),
            path.join(this.basePath, 'monitoring')
        ];

        foldersToScan.forEach(folder => {
            if (fs.existsSync(folder)) {
                console.log(`📂 Scan du dossier: ${folder}`);
                this.scanDirectory(folder);
            }
        });

        const report = this.generateReport();
        this.saveDetailedReport();

        return report;
    }
}

// Exécution
if (require.main === module) {
    const analyzer = new AuthenticModuleAnalyzer();
    analyzer.run();
}

module.exports = AuthenticModuleAnalyzer;