// UniversalModuleRegistry: Anti-fake registre des modules réels uniquement.
// Node >= 18

export default class UniversalModuleRegistry {
  constructor({ logger = console, strictMode = true } = {}) {
    this.logger = logger;
    this.strictMode = strictMode;
    this.registry = new Map();
    this.loadedModules = new Map();
    this.stats = { registered: 0, loaded: 0, failed: 0 };
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return true;
    try {
      // Enregistrement des modules réels existants uniquement
      await this.registerRealModules();
      this.isInitialized = true;
      this.logger.info(`UniversalModuleRegistry initialized: ${this.stats.registered} modules`);
      return true;
    } catch (error) {
      this.logger.error("Failed to initialize UniversalModuleRegistry:", error);
      if (this.strictMode) throw error;
      return false;
    }
  }

  async registerRealModules() {
    // Modules alex-core réels vérifiés
    const realModules = [
      { name: "AlexKernel", category: "core", path: "./AlexKernel.js" },
      { name: "AlexMasterSystem", category: "core", path: "./AlexMasterSystem.js" },
      { name: "LicorneOrchestrator", category: "core", path: "./LicorneOrchestrator.js" },
      { name: "DecisionTracker", category: "core", path: "./DecisionTracker.js" }
    ];

    for (const mod of realModules) {
      this.registerModule(mod.name, mod.category, { loadPath: mod.path });
    }
  }

  registerModule(name, category, options = {}) {
    if (this.registry.has(name)) {
      if (this.strictMode) throw new Error(`Module ${name} already registered`);
      return false;
    }

    const entry = {
      name,
      category,
      status: "registered",
      loadPath: options.loadPath || `./modules/${name}.js`,
      instance: null,
      loaded: false,
      failed: false,
      loadTime: null,
      dependencies: options.dependencies || [],
      registeredAt: Date.now(),
      ...options
    };

    this.registry.set(name, entry);
    this.stats.registered++;
    return true;
  }

  async loadModule(name) {
    const entry = this.registry.get(name);
    if (!entry) {
      throw new Error(`Module ${name} not registered`);
    }

    if (entry.loaded) return entry.instance;

    try {
      const startTime = Date.now();
      const moduleClass = await import(entry.loadPath);
      entry.instance = new (moduleClass.default || moduleClass)();
      entry.loaded = true;
      entry.loadTime = Date.now() - startTime;
      entry.status = "loaded";
      
      this.loadedModules.set(name, entry.instance);
      this.stats.loaded++;
      
      this.logger.info(`Module ${name} loaded in ${entry.loadTime}ms`);
      return entry.instance;
    } catch (error) {
      entry.failed = true;
      entry.status = "failed";
      entry.error = error.message;
      this.stats.failed++;
      
      this.logger.error(`Failed to load module ${name}:`, error);
      if (this.strictMode) throw error;
      return null;
    }
  }

  getModule(name) {
    return this.loadedModules.get(name) || null;
  }

  hasModule(name) {
    return this.registry.has(name);
  }

  listModules(category = null) {
    const modules = Array.from(this.registry.values());
    return category ? modules.filter(m => m.category === category) : modules;
  }

  getStats() {
    return { ...this.stats, total: this.registry.size };
  }

  async healthCheck() {
    const results = { healthy: 0, failed: 0, total: this.registry.size };
    
    for (const [name, entry] of this.registry) {
      if (entry.loaded && entry.instance) {
        try {
          if (typeof entry.instance.healthCheck === "function") {
            await entry.instance.healthCheck();
          }
          results.healthy++;
        } catch (error) {
          results.failed++;
          this.logger.warn(`Health check failed for ${name}:`, error);
        }
      }
    }
    
    return results;
  }
}