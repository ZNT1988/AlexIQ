/**
 * Alex Module Registry - Chargeur dynamique des 127 modules authentiques
 * Connecte tous les modules backend au serveur Railway
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  }

  async loadAllModules() {
    console.log('🚀 AlexModuleRegistry: Chargement des 127 modules...');
    
    try {
      const modulesPath = path.join(__dirname, 'backend', 'alex-modules');
      
      // Charger chaque catégorie
      for (const category of ['consciousness', 'core', 'intelligence', 'specialized', 'config']) {
        await this.loadCategory(category, path.join(modulesPath, category));
      }
      
      this.initialized = true;
      console.log(`✅ ${this.modules.size} modules chargés avec succès`);
      
      return {
        success: true,
        totalModules: this.modules.size,
        categories: Object.keys(this.categories).map(cat => ({
          name: cat,
          count: this.categories[cat].length
        }))
      };
      
    } catch (error) {
      console.error('❌ Erreur chargement modules:', error);
      return { success: false, error: error.message };
    }
  }

  async loadCategory(categoryName, categoryPath) {
    try {
      const files = await fs.readdir(categoryPath);
      const jsFiles = files.filter(file => file.endsWith('.js'));
      
      console.log(`📁 Chargement catégorie ${categoryName}: ${jsFiles.length} modules`);
      
      for (const file of jsFiles) {
        await this.loadModule(categoryName, file, path.join(categoryPath, file));
      }
      
    } catch (error) {
      console.error(`❌ Erreur chargement catégorie ${categoryName}:`, error);
    }
  }

  async loadModule(category, filename, filePath) {
    try {
      const moduleName = path.basename(filename, '.js');
      
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
      
      if (ModuleClass) {
        // Instancier le module
        const moduleInstance = new ModuleClass({ moduleName });
        
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
          }
        }
        
        console.log(`✅ Module ${moduleName} chargé (${category})`);
      }
      
    } catch (error) {
      console.error(`❌ Erreur chargement ${filename}:`, error.message);
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