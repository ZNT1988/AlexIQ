// Anti-fake, non-exécutant: propose un plan basé sur des mesures (ports/CPU/Mem) uniquement.

export default class LicorneOrchestrator {
  constructor({ kernel, adapters = {}, config = {}, logger = console, strictMode = true }) {
    if (!kernel?.metricsCollector?.collect) {
      throw new Error("LicorneOrchestrator: kernel.metricsCollector.collect required");
    }
    this.kernel = kernel;
    this.proc = adapters.proc ?? {};
    this.net = adapters.net ?? {};
    this.config = { metricsTTL: 60000, ...config };
    this.logger = logger;
    this.strictMode = strictMode;
  }

  async snapshot() {
    const now = Date.now();
    const ttl = this.config.metricsTTL;
    const [cpu, mem, procMetrics, modHealth] = await Promise.all([
      this.kernel.metricsCollector.collect('cpu_usage', this.strictMode),
      this.kernel.metricsCollector.collect('memory_usage', this.strictMode),
      this.kernel.metricsCollector.collect('process_metrics', this.strictMode),
      this.kernel.metricsCollector.collect('module_health', this.strictMode)
    ]);
    const items = { cpu, mem, procMetrics, modHealth };
    for (const [name, m] of Object.entries(items)) {
      if (!m || m.status !== "measured") {
        if (this.strictMode) throw new Error(`snapshot: ${name} not measured`);
        this.logger.warn(`[orchestrator] metric ${name} not measured`, m);
      } else if (now - (m.timestamp ?? 0) > ttl) {
        if (this.strictMode) throw new Error(`snapshot: ${name} stale`);
        m.status = "stale"; m.confidence = 0;
      }
    }
    return { ts: now, ...items };
  }

  buildDependencyGraph(moduleStates) {
    const nodes = new Map(); const edges = [];
    for (const s of moduleStates) {
      const id = s.moduleId;
      const deps = s?.health?.details?.deps ?? s?.health?.deps ?? [];
      nodes.set(id, { id, status: s.health?.status ?? "unknown" });
      for (const d of deps) edges.push({ from: d, to: id, type: "hard" });
    }
    return { nodes, edges, source: "module_health.details" };
  }

  async collectModuleRuntime(moduleStates) {
    const out = [];
    for (const s of moduleStates) {
      const moduleId = s.moduleId;
      let pid = null, usage = null, ports = null;
      try { pid = await this.proc.pidOf?.(moduleId) ?? null; } catch { pid = null; }
      if (pid != null) {
        try { usage = await this.proc.usage?.(pid) ?? null; } catch { usage = null; }
        try { ports = await this.net.portsOf?.(pid) ?? null; } catch { ports = null; }
      }
      out.push({
        moduleId, pid,
        cpuUtilization: usage?.cpu ?? null,
        rssBytes: usage?.rssBytes ?? null,
        ports: Array.isArray(ports) ? ports : null,
        source: {
          pid: pid != null ? "proc.adapter" : "unknown",
          usage: usage ? "proc.adapter" : "unknown",
          ports: ports ? "net.adapter" : "unknown"
        }
      });
    }
    return out;
  }

  detectPortConflicts(perModuleRuntime) {
    const map = new Map();
    for (const r of perModuleRuntime) {
      if (!r?.ports) continue;
      for (const p of r.ports) {
        if (!map.has(p)) map.set(p, []);
        map.get(p).push(r.moduleId);
      }
    }
    const conflicts = [];
    for (const [port, mods] of map.entries()) {
      if (mods.length > 1) conflicts.push({ type: "port", port, modules: mods });
    }
    return conflicts;
  }

  detectResourceHotspots(perModuleRuntime) {
    const limits = this.config.limits ?? {};
    const hotspots = [];
    for (const r of perModuleRuntime) {
      if (r.cpuUtilization != null && typeof limits.cpuUtilization === "number" && r.cpuUtilization > limits.cpuUtilization) {
        hotspots.push({ type: "cpu", moduleId: r.moduleId, value: r.cpuUtilization, limit: limits.cpuUtilization });
      }
      if (r.rssBytes != null && typeof limits.rssBytes === "number" && r.rssBytes > limits.rssBytes) {
        hotspots.push({ type: "memory", moduleId: r.moduleId, value: r.rssBytes, limit: limits.rssBytes });
      }
    }
    return hotspots;
  }

  rankCriticalModules(depGraph) {
    const indegree = new Map();
    for (const nodeId of depGraph.nodes.keys()) indegree.set(nodeId, 0);
    for (const e of depGraph.edges) indegree.set(e.to, (indegree.get(e.to) ?? 0) + 1);
    const ranked = [...indegree.entries()].sort((a, b) => b[1] - a[1]);
    return ranked.map(([moduleId, degree]) => ({ moduleId, indegree: degree }));
  }

  async orchestrateOnce() {
    const started = Date.now();
    const orchId = `licorne_${started}_${process.pid}`;
    try {
      const snap = await this.snapshot();
      const modStates = snap.modHealth.value?.moduleStates ?? [];
      const depGraph = this.buildDependencyGraph(modStates);
      const runtime = await this.collectModuleRuntime(modStates);
      const portConflicts = this.detectPortConflicts(runtime);
      const resourceHotspots = this.detectResourceHotspots(runtime);
      const ranked = this.rankCriticalModules(depGraph);

      const actions = [];
      const rationale = [];

      for (const c of portConflicts) {
        const order = [...c.modules].sort((A, B) => {
          const a = ranked.find(x => x.moduleId === A)?.indegree ?? 0;
          const b = ranked.find(x => x.moduleId === B)?.indegree ?? 0;
          return a - b;
        });
        if (order.length >= 2) {
          actions.push({ type: "suggest_restart", moduleId: order[0], reason: `port_conflict:${c.port}`, source: "net.adapter" });
          rationale.push(`Port ${c.port} utilisé par ${c.modules.join(", ")} (mesuré). Candidat: ${order[0]}.`);
        }
      }

      for (const h of resourceHotspots) {
        actions.push({ type: "suggest_throttle", moduleId: h.moduleId, resource: h.type, observed: h.value, limit: h.limit, source: "proc.adapter" });
        rationale.push(`Hotspot ${h.type} sur ${h.moduleId} (mesuré: ${h.value}, limite: ${h.limit}).`);
      }

      if ((this.config.limits ?? null) == null) {
        rationale.push("Aucune limite de ressources fournie (config.limits). Pas d'optimisation auto proposée.");
      }

      const finished = Date.now();
      const plan = {
        orchestrationId: orchId,
        status: "completed",
        durationMs: finished - started,
        timestamp: finished,
        actions,
        rationale,
        inputs: {
          snapshotTs: snap.ts,
          sources: {
            cpu: snap.cpu?.source, mem: snap.mem?.source, proc: snap.procMetrics?.source,
            moduleHealth: snap.modHealth?.source, runtime: { proc: !!this.proc.usage, net: !!this.net.portsOf }
          }
        },
        confidence: this._computePlanConfidence({ snap, portConflicts, resourceHotspots, runtime }),
      };
      this.logger.info("[licorne] plan ready", { actions: plan.actions.length });
      return plan;
    } catch (err) {
      this.logger.error("[licorne] orchestrateOnce failed", err);
      if (this.strictMode) throw err;
      return { orchestrationId: orchId, status: "error", error: String(err?.message || err), timestamp: Date.now() };
    }
  }

  _computePlanConfidence({ snap, portConflicts, resourceHotspots, runtime }) {
    let score = 0, denom = 0;
    for (const m of [snap.cpu, snap.mem, snap.procMetrics, snap.modHealth]) {
      if (m) { denom++; if (m.status === "measured") score++; }
    }
    denom += 2;
    if (portConflicts.length > 0 && runtime.some(r => Array.isArray(r.ports))) score++;
    if (resourceHotspots.length > 0 && runtime.some(r => r.cpuUtilization != null || r.rssBytes != null)) score++;
    return denom > 0 ? score / denom : 0;
  }
}