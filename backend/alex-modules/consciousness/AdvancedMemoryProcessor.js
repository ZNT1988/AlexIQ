/**
 * AdvancedMemoryProcessor - Anti-crash version
 */

import { EventEmitter } from "events";
import { safeMemorySnapshot } from "../../helpers/memory.js";

export default class AdvancedMemoryProcessor extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.moduleName = opts.moduleName || "AdvancedMemoryProcessor";
    this.memoryProvider = opts.memoryProvider ?? null; // peut être null
    this.isInitialized = false;
  }

  getMemoryUsage() {
    if (this.memoryProvider?.getMemoryUsage) {
      try { 
        return this.memoryProvider.getMemoryUsage(); 
      } catch (e) {
        console.warn(`MemoryProvider failed, using fallback:`, e.message);
      }
    }
    return safeMemorySnapshot();
  }

  async initialize() {
    try {
      const snap = this.getMemoryUsage();
      if (!snap.ok) {
        console.warn("AdvancedMemoryProcessor fallback:", snap.error);
      }
      
      this.isInitialized = true;
      console.log(`✅ ${this.moduleName} initialized successfully`);
      return true;
    } catch (error) {
      console.warn(`⚠️ ${this.moduleName} initialization warning:`, error.message);
      this.isInitialized = true; // Continue anyway
      return true;
    }
  }

  async processMemory(data, options = {}) {
    if (!this.isInitialized) {
      throw new Error('AdvancedMemoryProcessor not initialized');
    }

    try {
      const memorySnapshot = this.getMemoryUsage();
      
      return {
        success: true,
        data: data,
        memoryUsage: memorySnapshot,
        processedAt: new Date().toISOString(),
        options: options
      };
    } catch (error) {
      console.error('Memory processing failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  async getStatus() {
    const memorySnapshot = this.getMemoryUsage();
    
    return {
      module: this.moduleName,
      initialized: this.isInitialized,
      memorySnapshot: memorySnapshot,
      timestamp: new Date().toISOString()
    };
  }
}

// Export both ways for compatibility
export { AdvancedMemoryProcessor };