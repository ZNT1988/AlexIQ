const fs = require('fs');
const path = require('path');

function countFunctions(content) {
    const functionMatches = content.match(/function\s+\w+\s*\(|=>\s*{|\w+\s*\([^)]*\)\s*{/g) || [];
    return functionMatches.length;
}

function analyzeCodeQuality(content) {
    return {
        complexity: calculateComplexity(content),
        testCoverage: detectTestCoverage(content),
        documentation: calculateDocumentationRatio(content)
    };
}

function calculateComplexity(content) {
    const conditionals = (content.match(/if|while|for|switch/g) || []).length;
    const functions = (content.match(/function|=>/g) || []).length;
    return (conditionals + functions) / content.split('\n').length;
}

function detectTestCoverage(content) {
    const hasTests = content.includes('test(') || content.includes('describe(');
    return hasTests ? 1 : 0;
}

function calculateDocumentationRatio(content) {
    const comments = (content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
    const lines = content.split('\n').length;
    return comments / lines;
}

function analyzeDirectory(directory) {
    let totalFunctions = 0;
    const stats = {
        fileCount: 0,
        functionsByFile: {},
        qualityMetrics: {},
        suggestions: []
    };

    try {
        const files = fs.readdirSync(directory, { withFileTypes: true });
        
        for (const file of files) {
            const fullPath = path.join(directory, file.name);
            
            if (file.isDirectory() && !file.name.includes('node_modules')) {
                const subDirStats = analyzeDirectory(fullPath);
                totalFunctions += subDirStats.totalFunctions;
                Object.assign(stats.functionsByFile, subDirStats.functionsByFile);
                Object.assign(stats.qualityMetrics, subDirStats.qualityMetrics);
                stats.suggestions = [...stats.suggestions, ...subDirStats.suggestions];
                stats.fileCount += subDirStats.fileCount;
            } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const functionCount = countFunctions(content);
                const quality = analyzeCodeQuality(content);
                
                stats.functionsByFile[fullPath] = functionCount;
                stats.qualityMetrics[fullPath] = quality;
                stats.fileCount++;
                totalFunctions += functionCount;
                
                if (quality.complexity > 0.2) {
                    stats.suggestions.push(`${file.name}: Complexité élevée - Considérer la refactorisation`);
                }
                if (quality.testCoverage === 0) {
                    stats.suggestions.push(`${file.name}: Pas de tests détectés`);
                }
                if (quality.documentation < 0.1) {
                    stats.suggestions.push(`${file.name}: Documentation insuffisante`);
                }
            }
        }
    } catch (error) {
        console.error(`Erreur lors de l'analyse du dossier ${directory}:`, error);
    }

    stats.totalFunctions = totalFunctions;
    return stats;
}

function saveAnalysis(analysis, outputPath) {
    const report = [
        '# Analyse HustleFinderIA',
        `Date: ${new Date().toLocaleString()}`,
        '\n## 📊 Résumé global',
        `Nombre total de fichiers JS/JSX: ${analysis.fileCount}`,
        `Nombre total de fonctions: ${analysis.totalFunctions}`,
        '\n## 📈 Métriques de qualité par fichier',
        ...Object.entries(analysis.qualityMetrics).map(([file, metrics]) => (
            `\n### ${path.relative(projectRoot, file)}:
            - Complexité: ${metrics.complexity.toFixed(2)}
            - Couverture de tests: ${metrics.testCoverage ? '✅' : '❌'}
            - Ratio de documentation: ${(metrics.documentation * 100).toFixed(1)}%`
        )),
        '\n## 🎯 Suggestions d\'amélioration',
        ...analysis.suggestions.map(suggestion => `- ${suggestion}`)
    ].join('\n');

    fs.writeFileSync(outputPath, report, 'utf8');
    console.log(`\n✅ Rapport sauvegardé dans: ${outputPath}`);
}

// Point d'entrée principal
const projectRoot = path.resolve(__dirname, '..');
console.log('🔍 Analyse du code HustleFinderIA en cours...\n');

const analysis = analyzeDirectory(projectRoot);
const outputPath = path.join(projectRoot, 'analyse_hf.md');
saveAnalysis(analysis, outputPath);