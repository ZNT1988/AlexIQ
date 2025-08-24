// Anti-fake AlexMasterSystem: mesures réelles uniquement.
// Node >= 18

import os from "os";
/* eslint-disable no-undef */

export default class AlexMasterSystem {
  constructor({ logger = console, strictMode = true, ttlMs = 60000 } = {}) {
    this.logger = logger;
    this.strictMode = strictMode;
    this.ttlMs = ttlMs;
  }

  // ---- CPU (process) : mesure sur fenêtre courte, 0..1 normalisé par nb de coeurs
  async measureProcessCpu(windowMs = 400) {
    const startCpu = process.cpuUsage();           // µs user+system depuis start
    const startHr  = process.hrtime.bigint();      // ns
    await new Promise(r => setTimeout(r, windowMs));
    const endCpu = process.cpuUsage(startCpu);     // delta µs sur la fenêtre
    const endHr  = process.hrtime.bigint();        // ns
    const deltaCpuUs = (endCpu.user + endCpu.system);                 // µs
    const elapsedMs  = Number(endHr - startHr) / 1e6;                 // ms
    const cores = os.cpus().length || 1;
    const utilization = Math.min(1, Math.max(0, (deltaCpuUs / 1000 /*→ms*/) / (elapsedMs * cores)));
    return this._ok({ utilization, windowMs, cores }, "process.cpuUsage()");
  }

  // ---- CPU (système) : charge 1/5/15 min + utilisation 1 min / nb coeurs
  getSystemLoad() {
    const [l1, l5, l15] = os.loadavg();           // charge (Linux/macOS)
    const cores = os.cpus().length || 1;
    const utilization = Math.min(1, Math.max(0, l1 / cores));
    return this._ok({ load1min: l1, load5min: l5, load15min: l15, utilization, cores }, "os.loadavg()");
  }

  // ---- Mémoire (process + système)
  getProcessMemory() {
    const m = process.memoryUsage(); // bytes
    return this._ok(
      { rss: m.rss, heapTotal: m.heapTotal, heapUsed: m.heapUsed, external: m.external },
      "process.memoryUsage()"
    );
  }

  getSystemMemory() {
    const total = os.totalmem();
    const free  = os.freemem();
    const used  = total - free;
    const utilization = used / total;
    return this._ok({ total, free, used, utilization }, "os.totalmem()/os.freemem()");
  }

  // ---- Event loop lag (ms)
  async measureEventLoopLag() {
    const start = process.hrtime.bigint();
    await new Promise(r => setImmediate(r));
    const lagMs = Number(process.hrtime.bigint() - start) / 1e6;
    return this._ok({ lagMs }, "setImmediate() hrtime");
  }

  // ---- Santé composite (sans pondérations magiques)
  async getHealth() {
    try {
      const [procCpu, sysLoad, procMem, sysMem, loopLag] = await Promise.all([
        this.measureProcessCpu().catch(e => this._err("process.cpu", e)),
        Promise.resolve(this.getSystemLoad()),
        Promise.resolve(this.getProcessMemory()),
        Promise.resolve(this.getSystemMemory()),
        this.measureEventLoopLag().catch(e => this._err("eventLoopLag", e))
      ]);

      // Statut global: measured si au moins CPU(s)+mem(s) OK
      const parts = [procCpu, sysLoad, procMem, sysMem, loopLag].filter(Boolean);
      const measuredCount = parts.filter(p => p.status === "measured").length;
      const status = measuredCount >= 3 ? "measured" : (this.strictMode ? "error" : "unknown");

      if (status === "error") throw new Error("insufficient_measured_metrics");

      return {
        status,
        timestamp: Date.now(),
        metrics: { procCpu, sysLoad, procMem, sysMem, loopLag }
      };
    } catch (error) {
      if (this.strictMode) throw error;
      this.logger.error("[AlexMasterSystem] health error:", error);
      return { status: "error", error: String(error?.message || error), timestamp: Date.now() };
    }
  }

  // ==== Helpers anti-fake
  _ok(value, source) {
    return { status: "measured", value, source, timestamp: Date.now(), confidence: this._computeConfidence(source) };
  }

  _computeConfidence(source) {
    const now = Date.now();
    const uptime = process.uptime() * 1000; // ms
    
    // Base confidence from system stability and source type
    const memUsage = process.memoryUsage();
    const memoryPressure = memUsage.heapUsed / memUsage.heapTotal;
    const baseConfidence = Math.max(0.6, 1 - memoryPressure * 0.4);
    
    // Source reliability multiplier based on measurement precision
    let sourceMultiplier = baseConfidence;
    if (source.includes('os.') || source.includes('process.')) {
      // System API calls - very reliable
      sourceMultiplier = Math.min(0.98, baseConfidence + 0.15);
    } else if (source.includes('hrtime')) {
      // High precision timing - reliable
      sourceMultiplier = Math.min(0.92, baseConfidence + 0.1);
    }
    
    // Uptime factor - more uptime = more confidence in measurements
    const uptimeHours = uptime / (1000 * 60 * 60);
    const uptimeFactor = Math.min(0.05, uptimeHours * 0.01);
    
    const finalConfidence = Math.min(0.99, sourceMultiplier + uptimeFactor);
    
    return Math.max(0.5, finalConfidence);
  }
  _err(source, error) {
    if (this.strictMode) throw error;
    return { status: "unknown", error: String(error?.message || error), source, timestamp: Date.now(), confidence: 0 };
  }
}