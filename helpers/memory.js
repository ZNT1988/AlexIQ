/**
 * Memory utilities for safe memory monitoring and profiling
 * Prevents OOM crashes during module loading
 */

/**
 * Safe memory snapshot with fallback to process.memoryUsage()
 * @returns {Object} Memory statistics
 */
export function safeMemorySnapshot() {
  try {
    const processMemory = process.memoryUsage();
    
    return {
      // Process memory in MB
      rss: Math.round(processMemory.rss / 1024 / 1024),
      heapTotal: Math.round(processMemory.heapTotal / 1024 / 1024),
      heapUsed: Math.round(processMemory.heapUsed / 1024 / 1024),
      external: Math.round(processMemory.external / 1024 / 1024),
      
      // Calculated ratios
      heapUsedRatio: processMemory.heapUsed / processMemory.heapTotal,
      memoryPressure: processMemory.rss / (1024 * 1024 * 1024), // GB
      
      // Safe normalized values (0-1)
      heap: Math.min(1, processMemory.heapUsed / processMemory.heapTotal),
      system: Math.min(1, processMemory.rss / (512 * 1024 * 1024)), // Assume 512MB baseline
      
      // Timestamps
      timestamp: new Date().toISOString(),
      uptimeMs: process.uptime() * 1000
    };
  } catch (error) {
    console.warn('Memory snapshot failed, using fallback:', error.message);
    
    // Fallback values
    return {
      rss: 50,
      heapTotal: 30,
      heapUsed: 20,
      external: 5,
      heapUsedRatio: 0.6,
      memoryPressure: 0.05,
      heap: 0.6,
      system: 0.4,
      timestamp: new Date().toISOString(),
      uptimeMs: process.uptime() * 1000,
      fallback: true
    };
  }
}

/**
 * Memory profiling logger
 * @param {string} tag - Tag for this memory checkpoint
 * @param {Object} previousSnapshot - Previous memory snapshot for comparison
 * @returns {Object} Current memory snapshot
 */
export function logMemory(tag, previousSnapshot = null) {
  const snapshot = safeMemorySnapshot();
  
  let logMessage = `📊 MEM[${tag}] RSS:${snapshot.rss}MB Heap:${snapshot.heapUsed}/${snapshot.heapTotal}MB`;
  
  if (previousSnapshot && !previousSnapshot.fallback) {
    const rssDiff = snapshot.rss - previousSnapshot.rss;
    const heapDiff = snapshot.heapUsed - previousSnapshot.heapUsed;
    
    logMessage += ` (Δ RSS:${rssDiff > 0 ? '+' : ''}${rssDiff}MB, Heap:${heapDiff > 0 ? '+' : ''}${heapDiff}MB)`;
  }
  
  // Warning for high memory usage
  if (snapshot.heapUsedRatio > 0.8) {
    logMessage += ' ⚠️ HIGH_HEAP';
  }
  
  if (snapshot.memoryPressure > 0.5) {
    logMessage += ' 🔴 HIGH_RSS';
  }
  
  console.log(logMessage);
  return snapshot;
}

/**
 * Check if memory usage is safe to continue loading modules
 * @returns {Object} Safety check result
 */
export function checkMemorySafety() {
  const snapshot = safeMemorySnapshot();
  
  const warnings = [];
  let safe = true;
  
  if (snapshot.heapUsedRatio > 0.85) {
    warnings.push('heap_critical');
    safe = false;
  } else if (snapshot.heapUsedRatio > 0.75) {
    warnings.push('heap_high');
  }
  
  if (snapshot.memoryPressure > 0.8) {
    warnings.push('rss_critical');
    safe = false;
  } else if (snapshot.memoryPressure > 0.6) {
    warnings.push('rss_high');
  }
  
  return {
    safe,
    warnings,
    snapshot,
    recommendation: safe ? 'continue' : 'pause_loading'
  };
}

/**
 * Force garbage collection if available
 */
export function forceGarbageCollection() {
  if (global.gc && typeof global.gc === 'function') {
    try {
      const beforeMemory = safeMemorySnapshot();
      global.gc();
      const afterMemory = safeMemorySnapshot();
      
      const heapFreed = beforeMemory.heapUsed - afterMemory.heapUsed;
      console.log(`🗑️ GC freed ${heapFreed}MB heap memory`);
      
      return { success: true, freedMB: heapFreed };
    } catch (error) {
      console.warn('Garbage collection failed:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'gc_not_available' };
}

/**
 * Memory-safe delay utility
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise}
 */
export function memoryAwareDelay(ms = 100) {
  return new Promise(resolve => {
    const safety = checkMemorySafety();
    
    // Longer delay if memory is under pressure
    const adjustedDelay = safety.safe ? ms : ms * 2;
    
    setTimeout(resolve, adjustedDelay);
  });
}

/**
 * Get memory usage for external libraries safely
 * @param {Object} systemMetrics - Optional system metrics object
 * @returns {Object} Memory usage data
 */
export function getMemoryUsage(systemMetrics = null) {
  try {
    // Try to use provided systemMetrics first
    if (systemMetrics && typeof systemMetrics.getMemoryUsage === 'function') {
      return systemMetrics.getMemoryUsage();
    }
    
    // Fallback to our safe snapshot
    const snapshot = safeMemorySnapshot();
    
    return {
      heap: snapshot.heap,
      system: snapshot.system,
      external: snapshot.external / 100, // Normalize to 0-1 range
      rss: snapshot.rss,
      heapUsed: snapshot.heapUsed,
      heapTotal: snapshot.heapTotal,
      timestamp: snapshot.timestamp,
      source: 'safe_fallback'
    };
  } catch (error) {
    console.warn('getMemoryUsage fallback failed:', error.message);
    
    // Ultimate fallback
    return {
      heap: 0.5,
      system: 0.4,
      external: 0.1,
      rss: 100,
      heapUsed: 50,
      heapTotal: 100,
      timestamp: new Date().toISOString(),
      source: 'emergency_fallback'
    };
  }
}

/**
 * Monitor memory during async operations
 * @param {Function} asyncOperation - Async function to monitor
 * @param {string} operationName - Name for logging
 * @returns {Promise} Operation result with memory stats
 */
export async function monitorMemoryDuring(asyncOperation, operationName = 'operation') {
  const startMemory = logMemory(`${operationName}_start`);
  
  try {
    const result = await asyncOperation();
    const endMemory = logMemory(`${operationName}_end`, startMemory);
    
    return {
      result,
      memoryStats: {
        start: startMemory,
        end: endMemory,
        heapGrowth: endMemory.heapUsed - startMemory.heapUsed,
        rssGrowth: endMemory.rss - startMemory.rss
      }
    };
  } catch (error) {
    logMemory(`${operationName}_error`, startMemory);
    throw error;
  }
}