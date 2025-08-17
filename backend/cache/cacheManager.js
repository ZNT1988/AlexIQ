import FallbackCache from './FallbackCache.js';

const cache = new FallbackCache();

export function getRedisCache() {
  return cache;
}

export default cache;