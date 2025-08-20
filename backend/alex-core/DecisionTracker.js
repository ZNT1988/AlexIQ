// Enregistre les décisions réelles pour mesurer l'autonomie (zéro heuristique inventée).

export default class DecisionTracker {
  constructor(opts = {}) {
    this.windowMs = opts.windowMs ?? 3600000; // 1h
    this.logger = opts.logger ?? console;
    this.log = [];
  }

  record(decision) {
    const ts = decision.ts ?? Date.now();
    if (!decision?.id || !decision?.type || !decision?.actor) {
      throw new Error("DecisionTracker.record: id,type,actor required");
    }
    this.log.push({ ...decision, ts });
    this._gc(ts);
  }

  _gc(now) {
    const cutoff = now - this.windowMs;
    if (this.log.length > 10000) this.log = this.log.filter(d => d.ts >= cutoff);
  }

  getAutonomyMetrics(nowTs = Date.now()) {
    const cutoff = nowTs - this.windowMs;
    const windowed = this.log.filter(d => d.ts >= cutoff);
    const total = windowed.length;

    const alexDecisions = windowed.filter(d => d.actor === "alex");
    const alexTotal = alexDecisions.length;
    const alexIndependent = alexDecisions.filter(d => d.independent === true).length;

    const successKnown = windowed.filter(d => typeof d.success === "boolean");
    const successTrue = successKnown.filter(d => d.success === true).length;

    const latencies = windowed.map(d => d.latencyMs).filter(v => typeof v === "number").sort((a,b)=>a-b);
    const medianLatency = latencies.length ? latencies[Math.floor((latencies.length-1)/2)] : null;

    return {
      windowMs: this.windowMs,
      counts: { total, alexTotal, alexIndependent, successKnown: successKnown.length },
      ratios: {
        independence: alexTotal > 0 ? alexIndependent / alexTotal : null,
        successRate: successKnown.length > 0 ? successTrue / successKnown.length : null
      },
      medianLatencyMs: medianLatency,
      timestamp: nowTs,
      source: "decision_tracker_log"
    };
  }
}