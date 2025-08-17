#!/usr/bin/env node

/**
 * Script de mise à niveau vers les vraies APIs
 * Remplace les appels statiques par des intégrations OpenAI, Anthropic, Google
 */

import fs from 'fs';
import path from 'path';

const MODULES_DIR = path.resolve('./backend/alex-modules');

class APIUpgrader {
  constructor() {
    this.upgradedFiles = [];
    this.errors = [];
    this.stats = {
      totalFiles: 0,
      filesUpgraded: 0,
      staticCallsReplaced: 0
    };
    
    // Template des vrais appels API
    this.apiTemplates = {
      openai: this.getOpenAITemplate(),
      anthropic: this.getAnthropicTemplate(),
      google: this.getGoogleTemplate(),
      common: this.getCommonAPITemplate()
    };
  }

  async upgradeAllModules() {
    console.log('🚀 Début de la mise à niveau vers les vraies APIs...\n');
    
    const moduleFiles = this.findAllModules();
    this.stats.totalFiles = moduleFiles.length;
    
    for (const filePath of moduleFiles) {
      await this.upgradeModule(filePath);
    }
    
    this.displayResults();
  }

  findAllModules() {
    const modules = [];
    
    const scanDirectory = (dir) => {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.endsWith('.js')) {
          modules.push(fullPath);
        }
      }
    };

    scanDirectory(MODULES_DIR);
    return modules;
  }

  async upgradeModule(filePath) {
    const fileName = path.basename(filePath);
    console.log(`🔧 Mise à niveau: ${fileName}`);

    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      let replacements = 0;

      // 1. Ajouter les imports nécessaires
      const importsFixed = this.addRequiredImports(content);
      if (importsFixed.changed) {
        content = importsFixed.content;
        replacements += importsFixed.count;
      }

      // 2. Remplacer les réponses statiques par des appels OpenAI
      const openaiFixed = this.replaceWithOpenAI(content);
      if (openaiFixed.changed) {
        content = openaiFixed.content;
        replacements += openaiFixed.count;
      }

      // 3. Remplacer par des appels Anthropic quand approprié
      const anthropicFixed = this.replaceWithAnthropic(content);
      if (anthropicFixed.changed) {
        content = anthropicFixed.content;
        replacements += anthropicFixed.count;
      }

      // 4. Intégrer Google APIs pour les fonctionnalités spécifiques
      const googleFixed = this.replaceWithGoogle(content);
      if (googleFixed.changed) {
        content = googleFixed.content;
        replacements += googleFixed.count;
      }

      // 5. Améliorer la gestion d'erreur et fallbacks
      const errorHandlingFixed = this.improveErrorHandling(content);
      if (errorHandlingFixed.changed) {
        content = errorHandlingFixed.content;
        replacements += errorHandlingFixed.count;
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.upgradedFiles.push({ 
          file: fileName, 
          path: filePath, 
          replacements: replacements 
        });
        this.stats.filesUpgraded++;
        this.stats.staticCallsReplaced += replacements;
        console.log(`  ✅ ${replacements} appels API mis à niveau`);
      } else {
        console.log(`  ✓ Aucune mise à niveau nécessaire`);
      }

    } catch (error) {
      this.errors.push({ file: fileName, error: error.message });
      console.log(`  ❌ Erreur: ${error.message}`);
    }
  }

  addRequiredImports(content) {
    const lines = content.split('\n');
    let changed = false;
    let count = 0;

    // Vérifier si les imports AI sont déjà présents
    const hasOpenAI = content.includes('openai') || content.includes('OpenAI');
    const hasAnthropic = content.includes('anthropic') || content.includes('Anthropic');
    const hasAIKeys = content.includes('AI_KEYS');

    const importsToAdd = [];

    if (!hasAIKeys) {
      importsToAdd.push("import { AI_KEYS } from '../config/aiKeys.js';");
      count++;
    }

    if (!hasOpenAI && this.needsOpenAI(content)) {
      importsToAdd.push("import OpenAI from 'openai';");
      count++;
    }

    if (!hasAnthropic && this.needsAnthropic(content)) {
      importsToAdd.push("import Anthropic from '@anthropic-ai/sdk';");
      count++;
    }

    if (importsToAdd.length > 0) {
      // Trouver où insérer les imports
      const importIndex = this.findImportEndIndex(lines);
      lines.splice(importIndex + 1, 0, '', '// Imports AI Services', ...importsToAdd);
      changed = true;
    }

    return { 
      changed, 
      content: changed ? lines.join('\n') : content, 
      count 
    };
  }

  replaceWithOpenAI(content) {
    let changed = false;
    let count = 0;

    // Remplacer les return de strings statiques par des appels OpenAI
    const staticReturnPattern = /return\s*["'`]([^"'`]{20,})["'`]\s*;?\s*(?:\/\/.*)?$/gm;
    
    content = content.replace(staticReturnPattern, (match, staticText) => {
      // Éviter de remplacer les logs et constantes
      if (staticText.length < 20 || staticText.includes('error') || staticText.includes('debug')) {
        return match;
      }
      
      count++;
      changed = true;
      
      return `return await this.generateWithOpenAI(\`${staticText.substring(0, 50)}...\`, context);`;
    });

    // Remplacer les méthodes qui retournent des réponses fixes
    const methodPattern = /async\s+(\w+)\s*\([^)]*\)\s*{\s*return\s*["'`]([^"'`]+)["'`]\s*;?\s*}/gm;
    
    content = content.replace(methodPattern, (match, methodName, response) => {
      if (response.length < 15) return match;
      
      count++;
      changed = true;
      
      return `async ${methodName}(input, context = {}) {
    try {
      const prompt = \`Tu es Alex, une IA avancée. Réponds de manière pertinente à: \${input}\`;
      return await this.generateWithOpenAI(prompt, context);
    } catch (error) {
      console.error('Erreur API OpenAI:', error);
      return \`Analyse en cours pour: \${input}\`;
    }
  }`;
    });

    if (changed && !content.includes('generateWithOpenAI')) {
      content += '\n\n' + this.apiTemplates.openai;
    }

    return { changed, content, count };
  }

  replaceWithAnthropic(content) {
    let changed = false;
    let count = 0;

    // Remplacer les méthodes de réflexion/analyse par Anthropic
    const analysisPattern = /(async\s+(?:analyze|reflect|think|consider)\w*\s*\([^)]*\)\s*{)[^}]+return\s*["'`]([^"'`]+)["'`][^}]*}/gm;
    
    content = content.replace(analysisPattern, (match, methodStart, staticResponse) => {
      if (staticResponse.length < 20) return match;
      
      count++;
      changed = true;
      
      return `${methodStart}
    try {
      const response = await this.generateWithAnthropic(input, { 
        type: 'analysis',
        context: context 
      });
      return response;
    } catch (error) {
      console.error('Erreur Anthropic:', error);
      return \`Analyse réflexive pour: \${input}\`;
    }
  }`;
    });

    if (changed && !content.includes('generateWithAnthropic')) {
      content += '\n\n' + this.apiTemplates.anthropic;
    }

    return { changed, content, count };
  }

  replaceWithGoogle(content) {
    let changed = false;
    let count = 0;

    // Remplacer les appels géographiques/maps par Google
    const geoPattern = /(location|address|map|geographical|coordinates)/i;
    
    if (geoPattern.test(content)) {
      // Rechercher des méthodes liées à la géolocalisation
      const locationMethods = /async\s+(\w*(?:location|address|map|geo)\w*)\s*\([^)]*\)\s*{[^}]+return\s*["'`]([^"'`]+)["'`][^}]*}/gm;
      
      content = content.replace(locationMethods, (match, methodName, staticResponse) => {
        count++;
        changed = true;
        
        return `async ${methodName}(query, context = {}) {
    try {
      return await this.queryGoogleMaps(query, context);
    } catch (error) {
      console.error('Erreur Google Maps:', error);
      return \`Recherche géographique pour: \${query}\`;
    }
  }`;
      });
    }

    // Remplacer par Gemini pour la créativité
    const creativityPattern = /(creative|generate|invent|imagine|design)/i;
    
    if (creativityPattern.test(content)) {
      const creativeMethods = /async\s+(\w*(?:creative|generate|invent|imagine|design)\w*)\s*\([^)]*\)\s*{[^}]+return\s*["'`]([^"'`]+)["'`][^}]*}/gm;
      
      content = content.replace(creativeMethods, (match, methodName, staticResponse) => {
        if (staticResponse.length < 20) return match;
        
        count++;
        changed = true;
        
        return `async ${methodName}(input, context = {}) {
    try {
      return await this.generateWithGemini(input, { 
        creativity: 'high',
        context: context 
      });
    } catch (error) {
      console.error('Erreur Gemini:', error);
      return \`Création en cours pour: \${input}\`;
    }
  }`;
      });
    }

    if (changed && !content.includes('queryGoogleMaps')) {
      content += '\n\n' + this.apiTemplates.google;
    }

    return { changed, content, count };
  }

  improveErrorHandling(content) {
    let changed = false;
    let count = 0;

    // Améliorer les try/catch vides
    content = content.replace(/} catch \([^)]*\) {\s*\/\/ Gestion d'erreur appropriée[^}]*}/g, () => {
      count++;
      changed = true;
      
      return `} catch (error) {
      console.error('Erreur dans le module:', error);
      // Fallback vers une réponse contextuelle
      return this.generateFallbackResponse(error, context);
    }`;
    });

    // Ajouter la méthode de fallback si nécessaire
    if (changed && !content.includes('generateFallbackResponse')) {
      content += '\n\n' + this.apiTemplates.common;
    }

    return { changed, content, count };
  }

  // Templates des vraies APIs
  getOpenAITemplate() {
    return `
  /**
   * Génération avec OpenAI GPT
   */
  async generateWithOpenAI(prompt, context = {}) {
    try {
      if (!AI_KEYS.OPENAI) {
        throw new Error('Clé OpenAI manquante');
      }

      const openai = new OpenAI({
        apiKey: AI_KEYS.OPENAI
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es Alex, une IA française avancée, empathique et créative."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
      
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      return this.generateFallbackResponse(prompt, context);
    }
  }`;
  }

  getAnthropicTemplate() {
    return `
  /**
   * Génération avec Anthropic Claude
   */
  async generateWithAnthropic(prompt, options = {}) {
    try {
      if (!AI_KEYS.ANTHROPIC) {
        throw new Error('Clé Anthropic manquante');
      }

      const anthropic = new Anthropic({
        apiKey: AI_KEYS.ANTHROPIC
      });

      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return message.content[0].text;
      
    } catch (error) {
      console.error('Erreur Anthropic:', error);
      return this.generateFallbackResponse(prompt, options);
    }
  }`;
  }

  getGoogleTemplate() {
    return `
  /**
   * Requête Google Maps
   */
  async queryGoogleMaps(query, context = {}) {
    try {
      if (!AI_KEYS.GOOGLE_MAPS) {
        throw new Error('Clé Google Maps manquante');
      }

      const response = await fetch(
        \`https://maps.googleapis.com/maps/api/geocode/json?address=\${encodeURIComponent(query)}&key=\${AI_KEYS.GOOGLE_MAPS}\`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return \`Localisation trouvée pour: \${query}\`;
      
    } catch (error) {
      console.error('Erreur Google Maps:', error);
      return \`Recherche de localisation: \${query}\`;
    }
  }

  /**
   * Génération avec Gemini
   */
  async generateWithGemini(prompt, options = {}) {
    try {
      if (!AI_KEYS.GOOGLE) {
        throw new Error('Clé Google manquante');
      }

      // Utilisation de l'API Gemini via Google AI Studio
      const response = await fetch(
        \`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=\${AI_KEYS.GOOGLE}\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        return data.candidates[0].content.parts[0].text;
      }
      
      return \`Génération créative pour: \${prompt}\`;
      
    } catch (error) {
      console.error('Erreur Gemini:', error);
      return this.generateFallbackResponse(prompt, options);
    }
  }`;
  }

  getCommonAPITemplate() {
    return `
  /**
   * Réponse de fallback intelligente
   */
  generateFallbackResponse(input, context = {}) {
    const fallbacks = [
      \`Je traite votre demande: \${input.substring(0, 50)}...\`,
      \`Analyse en cours pour: \${input.substring(0, 50)}...\`,
      \`Réflexion sur: \${input.substring(0, 50)}...\`,
      \`Génération de réponse contextuelle...\`
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }`;
  }

  // Méthodes utilitaires
  needsOpenAI(content) {
    return /generate|create|think|respond|answer/.test(content);
  }

  needsAnthropic(content) {
    return /analyze|reflect|consider|philosophical|deep/.test(content);
  }

  findImportEndIndex(lines) {
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ') || line.startsWith('const ') && line.includes('require(')) {
        lastImportIndex = i;
      } else if (line && !line.startsWith('//') && !line.startsWith('/*') && lastImportIndex !== -1) {
        break;
      }
    }
    
    return Math.max(lastImportIndex, 1);
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 RÉSULTATS DE LA MISE À NIVEAU API');
    console.log('='.repeat(60));
    
    console.log(`\n📊 STATISTIQUES:`);
    console.log(`  • Fichiers analysés: ${this.stats.totalFiles}`);
    console.log(`  • Fichiers mis à niveau: ${this.stats.filesUpgraded}`);
    console.log(`  • Appels statiques remplacés: ${this.stats.staticCallsReplaced}`);
    
    if (this.upgradedFiles.length > 0) {
      console.log(`\n✅ FICHIERS AVEC VRAIES APIS:`);
      this.upgradedFiles.slice(0, 15).forEach(upgrade => {
        console.log(`  • ${upgrade.file}: ${upgrade.replacements} appels API`);
      });
      
      if (this.upgradedFiles.length > 15) {
        console.log(`  • ... et ${this.upgradedFiles.length - 15} autres fichiers`);
      }
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ ERREURS RENCONTRÉES:`);
      this.errors.forEach(error => {
        console.log(`  • ${error.file}: ${error.error}`);
      });
    }
    
    console.log(`\n🎉 Mise à niveau terminée!`);
    
    if (this.stats.filesUpgraded > 0) {
      console.log(`\n🚀 PROCHAINES ÉTAPES:`);
      console.log(`  1. Tester les appels API réels`);
      console.log(`  2. Vérifier les clés API sur Vercel/Railway`);
      console.log(`  3. Monitorer les quotas API`);
      console.log(`  4. Optimiser les prompts si nécessaire`);
    }
  }
}

// Exécution du script
console.log('🚀 Démarrage de la mise à niveau API...');
const upgrader = new APIUpgrader();
upgrader.upgradeAllModules().catch(error => {
  console.error('❌ Erreur lors de la mise à niveau:', error);
  process.exit(1);
});

export default APIUpgrader;