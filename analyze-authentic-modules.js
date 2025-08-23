#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

const BACKEND_PATH = './backend';
const FAKE_PATTERNS = [
    /Math\.random\(\)/gi,
    /simulate[A-Z][a-zA-Z]+\(/gi,
    /placeholder|TODO|FIXME/gi,
    /return [\d\.]+;?\s*\/\/ fake/gi,
    /return ["'][^"']*fake[^"']*["']/gi,
    /\/\*\s*fake/gi,
    /\/\/\s*fake/gi
];

const AUTHENTIC_INDICATORS = [
    /process\.(memoryUsage|cpuUsage|hrtime|uptime)\(/gi,
    /os\.(loadavg|freemem|totalmem|cpus|uptime)\(/gi,
    /performance\.(now|mark|measure)\(/gi,
    /Date\.now\(\)/gi,
    /fetch\(/gi,
    /require\(['"][^'"]*googleapis/gi,
    /require\(['"][^'"]*openai/gi,
    /require\(['"][^'"]*anthropic/gi,
    /import.*from.*['"]fs['"]|require\(['"]fs['"]|import.*fs/gi,
    /import.*from.*['"]path['"]|require\(['"]path['"]|import.*path/gi,
    /new\s+(Map|Set|WeakMap|WeakSet)/gi
];

async function analyzeFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        const analysis = {
            path: filePath,
            authentic: true,
            fakePatterns: [],
            authenticIndicators: [],
            hasRealAPIs: false,
            hasSystemMetrics: false,
            size: content.length
        };

        // Check for fake patterns
        for (const pattern of FAKE_PATTERNS) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                analysis.fakePatterns.push({
                    pattern: pattern.source,
                    matches: matches.slice(0, 3) // Limit to first 3 matches
                });
                analysis.authentic = false;
            }
        }

        // Check for authentic indicators
        for (const pattern of AUTHENTIC_INDICATORS) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                analysis.authenticIndicators.push({
                    pattern: pattern.source,
                    matches: matches.slice(0, 3)
                });
            }
        }

        // Check for real APIs
        if (content.includes('openai') || content.includes('anthropic') || content.includes('googleapis') || 
            content.includes('fetch(') || content.includes('axios.')) {
            analysis.hasRealAPIs = true;
        }

        // Check for system metrics
        if (content.includes('process.') || content.includes('os.') || content.includes('performance.')) {
            analysis.hasSystemMetrics = true;
        }

        // Additional authenticity checks
        if (analysis.authenticIndicators.length >= 3 && analysis.fakePatterns.length === 0) {
            analysis.authentic = true;
        }

        return analysis;
    } catch (error) {
        return {
            path: filePath,
            authentic: false,
            error: error.message
        };
    }
}

async function findJSFiles(dir) {
    const files = [];
    
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.includes('node_modules')) {
            const subFiles = await findJSFiles(fullPath);
            files.push(...subFiles);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
            files.push(fullPath);
        }
    }
    
    return files;
}

async function main() {
    console.log('🔍 Analysing modules for authenticity...\n');
    
    const jsFiles = await findJSFiles(BACKEND_PATH);
    const results = {
        authentic: [],
        fake: [],
        errors: [],
        summary: {
            total: jsFiles.length,
            authentic: 0,
            fake: 0,
            errors: 0
        }
    };
    
    for (const file of jsFiles) {
        const analysis = await analyzeFile(file);
        
        if (analysis.error) {
            results.errors.push(analysis);
            results.summary.errors++;
        } else if (analysis.authentic) {
            results.authentic.push(analysis);
            results.summary.authentic++;
        } else {
            results.fake.push(analysis);
            results.summary.fake++;
        }
    }
    
    // Sort authentic modules by quality indicators
    results.authentic.sort((a, b) => {
        const scoreA = (a.authenticIndicators?.length || 0) + (a.hasRealAPIs ? 2 : 0) + (a.hasSystemMetrics ? 2 : 0);
        const scoreB = (b.authenticIndicators?.length || 0) + (b.hasRealAPIs ? 2 : 0) + (b.hasSystemMetrics ? 2 : 0);
        return scoreB - scoreA;
    });
    
    console.log('📊 ANALYSIS RESULTS:\n');
    console.log(`Total modules analyzed: ${results.summary.total}`);
    console.log(`✅ Authentic modules: ${results.summary.authentic}`);
    console.log(`❌ Fake/simulation modules: ${results.summary.fake}`);
    console.log(`🚨 Analysis errors: ${results.summary.errors}\n`);
    
    console.log('🟢 TOP AUTHENTIC MODULES:\n');
    results.authentic.slice(0, 20).forEach((module, index) => {
        const score = (module.authenticIndicators?.length || 0) + (module.hasRealAPIs ? 2 : 0) + (module.hasSystemMetrics ? 2 : 0);
        console.log(`${index + 1}. ${path.relative('./backend', module.path)} (score: ${score})`);
        if (module.hasRealAPIs) console.log(`   📡 Has real APIs`);
        if (module.hasSystemMetrics) console.log(`   📊 Has system metrics`);
        if (module.authenticIndicators.length > 0) {
            console.log(`   🔧 Authentic patterns: ${module.authenticIndicators.length}`);
        }
        console.log('');
    });
    
    if (results.fake.length > 0) {
        console.log('🔴 MODULES WITH FAKE PATTERNS:\n');
        results.fake.slice(0, 10).forEach((module, index) => {
            console.log(`${index + 1}. ${path.relative('./backend', module.path)}`);
            if (module.fakePatterns) {
                module.fakePatterns.forEach(pattern => {
                    console.log(`   ❌ ${pattern.pattern}: ${pattern.matches?.join(', ')}`);
                });
            }
            console.log('');
        });
    }
    
    // Save detailed report
    await fs.writeFile('./authentic-modules-report.json', JSON.stringify(results, null, 2));
    console.log('📋 Detailed report saved to: authentic-modules-report.json');
}

main().catch(console.error);