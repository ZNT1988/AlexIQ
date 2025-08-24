/**
 * Utility function for confidence calculation used across all modules
 * Prevents conflicts from multiple declarations
 */
export function computeConfidence(ts, ttlMs = 60000, weight = 1) {
  const age = Date.now() - (ts || 0);
  const f = Math.max(0.1, 1 - age / ttlMs);
  return Math.max(0.1, Math.min(1, f * weight));
}