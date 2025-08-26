// backend/helpers/memory.js
export function safeMemorySnapshot() {
  try {
    const m = process.memoryUsage();
    return { 
      ok: true, 
      heapUsed: m.heapUsed, 
      heapTotal: m.heapTotal, 
      rss: m.rss, 
      external: m.external, 
      ts: Date.now() 
    };
  } catch (e) {
    return { 
      ok: false, 
      error: String(e), 
      ts: Date.now() 
    };
  }
}