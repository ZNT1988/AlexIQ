/**
 * Alex Module Registry - Chargeur dynamique des 127 modules authentiques
 * Connecte tous les modules backend au serveur Railway
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';
import { logMemory, checkMemorySafety, memoryAwareDelay, forceGarbageCollection } from './helpers/memory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Modules désactivés via env vars pour éviter OOM crashes
const DISABLED = new Set(
  (process.env.ALEX_DISABLE_MODULES || "").split(",").map(s => s.trim()).filter(Boolean)
);

class AlexModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.categories = {
      consciousness: [],
      core: [],
      intelligence: [],
      specialized: [],
      config: []
    };
    this.initialized = false;
    
    // SÉRIEL pour éviter OOM - plus de concurrency
    this.limit = pLimit(1); // Chargement séquentiel strict
    this.loadingStats = {
      total: 0,
      loaded: 0,
      failed: 0,
      memorySnapshots: []
    };
  }

  async loadAllModules() {
    console.log('🚀 AlexModuleRegistry: Chargement des 127 modules...');
    
    try {
      // Initial memory snapshot
      const startMemory = logMemory('registry_start');
      this.loadingStats.memorySnapshots.push({ phase: 'start', snapshot: startMemory });
      
      const modulesPath = path.join(__dirname, 'backend', 'alex-modules');
      
      // WATCHDOG initial
      console.log(`🎯 Disabled modules: ${Array.from(DISABLED).join(', ') || 'none'}`);
      
      // Charger chaque catégorie avec profiling mémoire STRICTE
      for (const category of ['consciousness', 'core', 'intelligence', 'specialized', 'config']) {
        const categoryMemory = logMemory(`category_${category}_start`);
        console.log(`📁 START category ${category} - Memory: ${JSON.stringify(this.getMemory())}`);
        
        await this.loadCategory(category, path.join(modulesPath, category));
        
        // FORCE GC après chaque catégorie
        if (global.gc) {
          global.gc();
          console.log(`♻️ GC forced after ${category}`);
        }
        
        const afterCategoryMemory = logMemory(`category_${category}_end`, categoryMemory);
        this.loadingStats.memorySnapshots.push({ 
          phase: `category_${category}`, 
          snapshot: afterCategoryMemory 
        });
        
        // Check memory safety and pause if needed
        const mem = this.getMemory();
        console.log(`📊 END category ${category} - Memory: ${JSON.stringify(mem)}`);
        
        if (mem.rss > 1400 || mem.heapUsed > 1000) { // Stricter limits
          console.log(`🚨 CRITICAL Memory after ${category}, forcing aggressive GC...`);
          forceGarbageCollection();
          if (global.gc) global.gc(); // Double GC
          await memoryAwareDelay(2000); // Longer pause
        } else {
          await memoryAwareDelay(200); // Pause between categories
        }
      }
      
      this.initialized = true;
      
      // Final memory snapshot
      const endMemory = logMemory('registry_complete', startMemory);
      this.loadingStats.memorySnapshots.push({ phase: 'complete', snapshot: endMemory });
      
      const totalMemoryGrowth = endMemory.heapUsed - startMemory.heapUsed;
      
      // Résumé final
      const totalAttempted = this.loadingStats.total;
      const totalLoaded = this.loadingStats.loaded;
      const totalFailed = this.loadingStats.failed;
      const successRate = totalAttempted > 0 ? ((totalLoaded / totalAttempted) * 100).toFixed(1) : 0;
      
      console.log(`🧩 Résumé modules: ${totalLoaded}/${totalAttempted} OK (${successRate}%), ${totalFailed} erreurs`);
      console.log(`📊 Croissance mémoire: +${totalMemoryGrowth}MB heap`);
      
      return {
        success: true,
        totalModules: this.modules.size,
        totalAttempted,
        totalLoaded,
        totalFailed,
        successRate: parseFloat(successRate),
        memoryGrowth: totalMemoryGrowth,
        loadingStats: this.loadingStats,
        categories: Object.keys(this.categories).map(cat => ({
          name: cat,
          count: this.categories[cat].length
        }))
      };
      
    } catch (error) {
      console.error('❌ Erreur chargement modules:', error);
      logMemory('registry_error');
      return { success: false, error: error.message };
    }
  }

  async loadCategory(categoryName, categoryPath) {
    try {
      const files = await fs.readdir(categoryPath);
      const jsFiles = files.filter(file => file.endsWith('.js'));
      
      console.log(`📁 Chargement catégorie ${categoryName}: ${jsFiles.length} modules`);
      this.loadingStats.total += jsFiles.length;
      
      // Load modules with concurrency limit
      const loadPromises = jsFiles.map(file => 
        this.limit(() => this.safeLoadModule(categoryName, file, path.join(categoryPath, file)))
      );
      
      // Wait for all modules in this category to load
      await Promise.allSettled(loadPromises);
      
    } catch (error) {
      console.error(`❌ Erreur chargement catégorie ${categoryName}:`, error);
    }
  }

  async safeLoadModule(category, filename, filePath) {
    const moduleName = path.basename(filename, '.js');
    
    // Check si module disabled
    if (DISABLED.has(moduleName)) {
      console.warn(`⏭️ Skip module (disabled): ${moduleName}`);
      this.loadingStats.loaded++; // Count as success but skipped
      return { skipped: true, name: moduleName };
    }
    
    try {
      // Watchdog mémoire AVANT chargement
      const mem = this.getMemory();
      if (mem.rss > 1200 || mem.heapUsed > 800) { // MB limits
        console.warn(`🚨 Memory HIGH before ${moduleName}: RSS=${mem.rss}MB, Heap=${mem.heapUsed}MB`);
        forceGarbageCollection(); // Force GC avant
        await memoryAwareDelay(500);
      }
      
      // Memory snapshot before loading module
      const beforeMemory = logMemory(`module_${moduleName}_start`);
      
      const result = await this.loadModule(category, filename, filePath);
      
      // FORCE GC après chaque module
      if (global.gc) {
        global.gc();
      }
      
      // Memory snapshot after loading module
      const afterMemory = logMemory(`module_${moduleName}_end`, beforeMemory);
      
      if (result && !result.skipped) {
        this.loadingStats.loaded++;
      } else {
        this.loadingStats.failed++;
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Erreur chargement ${filename}:`, error.message);
      this.loadingStats.failed++;
      logMemory(`module_${moduleName}_error`);
      return null;
    }
  }

  getMemory() {
    const { rss, heapUsed, heapTotal } = process.memoryUsage();
    return {
      rss: Math.round(rss / 1024 / 1024),
      heapUsed: Math.round(heapUsed / 1024 / 1024),
      heapTotal: Math.round(heapTotal / 1024 / 1024)
    };
  }

  async loadModule(category, filename, filePath) {
    const moduleName = path.basename(filename, '.js');
    
    try {
      // Convert Windows path to file:// URL for ES6 import
      const fileUrl = process.platform === 'win32' 
        ? `file:///${filePath.replace(/\\/g, '/')}`
        : filePath;
      
      // Import dynamique du module
      const moduleFile = await import(fileUrl);
      
      // Chercher la classe principale (première export ou export par défaut)
      const ModuleClass = moduleFile.default || 
                         moduleFile[moduleName] || 
                         Object.values(moduleFile).find(exp => typeof exp === 'function');
      
      if (!ModuleClass) {
        console.warn(`⚠️ Pas de classe trouvée dans ${moduleName}`);
        return false;
      }

      // Instancier le module avec options spéciales pour certains modules
      const moduleOptions = { 
        moduleName,
        memoryProvider: global.AlexMemory ?? null // Pour AdvancedMemoryProcessor
      };
      
      const moduleInstance = new ModuleClass(moduleOptions);
      
      // L'enregistrer
      this.modules.set(moduleName, {
        instance: moduleInstance,
        category,
        filename,
        initialized: false
      });
      
      this.categories[category].push(moduleName);
      
      // Initialiser si possible
      if (typeof moduleInstance.initialize === 'function') {
        try {
          await moduleInstance.initialize();
          this.modules.get(moduleName).initialized = true;
        } catch (initError) {
          console.warn(`⚠️ Initialisation ${moduleName} échouée:`, initError.message);
          // Continue anyway - module is loaded but not initialized
        }
      } else {
        // Mark as initialized if no initialize method
        this.modules.get(moduleName).initialized = true;
      }
      
      console.log(`✅ Module ${moduleName} chargé (${category})`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erreur chargement ${moduleName}:`, error.message);
      return false;
    }
  }

  getModule(name) {
    return this.modules.get(name)?.instance;
  }

  getModuleInfo(name) {
    return this.modules.get(name);
  }

  getAllModules() {
    return Array.from(this.modules.entries()).map(([name, info]) => ({
      name,
      category: info.category,
      initialized: info.initialized,
      methods: this.getModuleMethods(info.instance)
    }));
  }

  getModuleMethods(instance) {
    if (!instance) return [];
    
    const methods = [];
    const proto = Object.getPrototypeOf(instance);
    const names = Object.getOwnPropertyNames(proto);
    
    for (const name of names) {
      if (name !== 'constructor' && typeof instance[name] === 'function') {
        methods.push(name);
      }
    }
    
    return methods;
  }

  getCategoryStats() {
    const stats = {};
    
    for (const [category, modules] of Object.entries(this.categories)) {
      const initializedCount = modules.filter(name => 
        this.modules.get(name)?.initialized
      ).length;
      
      stats[category] = {
        total: modules.length,
        initialized: initializedCount,
        modules: modules
      };
    }
    
    return stats;
  }

  getLoadingStats() {
    return {
      ...this.loadingStats,
      successRate: this.loadingStats.total > 0 ? 
        (this.loadingStats.loaded / this.loadingStats.total) * 100 : 0,
      memoryProfile: this.loadingStats.memorySnapshots.map(({ phase, snapshot }) => ({
        phase,
        heapUsed: snapshot.heapUsed,
        rss: snapshot.rss,
        timestamp: snapshot.timestamp
      }))
    };
  }

  async executeModule(moduleName, methodName, ...args) {
    const moduleInfo = this.modules.get(moduleName);
    
    if (!moduleInfo) {
      throw new Error(`Module ${moduleName} non trouvé`);
    }

    const { instance } = moduleInfo;
    
    if (typeof instance[methodName] !== 'function') {
      throw new Error(`Méthode ${methodName} non trouvée dans ${moduleName}`);
    }

    try {
      const result = await instance[methodName](...args);
      
      return {
        success: true,
        module: moduleName,
        method: methodName,
        result,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        module: moduleName,
        method: methodName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton
const alexRegistry = new AlexModuleRegistry();
export default alexRegistry;