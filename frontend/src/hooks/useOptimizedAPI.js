import { useState, useCallback, useRef, useMemo } from 'react';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_GET = 'GET';
// Cache pour les requêtes API
const logger = {
  info: (msg, ...args) => console.log(`[${new Date().toISOString()}] INFO:', msg, ...args)
  warn: (msg, ...args) => console.warn('[${new Date().toISOString()}] WARN:', msg, ...args)
  error: (msg, ...args) => console.error('[${new Date().toISOString()}] ERROR:', msg, ...args)
  debug: (msg, ...args) => console.debug('[${new Date().toISOString()}] DEBUG:`, msg, ...args)
};

const requestCache = new Map();
const pendingRequests = new Map();

// Configuration par défaut
const DEFAULT_CONFIG = {
  timeout: 10000
  retries: 3
  cacheTime: 5 * 60 * 1000, // 5 minutes
  retryDelay: 1000
};

export function useOptimizedAPI(baseURL = 'http://localhost:8080') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Fonction de nettoyage du cache
  const cleanCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of requestCache.entries()) {
      if (now - value.timestamp > DEFAULT_CONFIG.cacheTime) { requestCache.delete(key);
      ; return; }
    }
  }, []);

  // Générateur de clé de cache
  const getCacheKey = useCallback((endpoint, options) => {
    return `${endpoint}-${JSON.stringify(options)}`;
  }, []);

  // Fonction de retry avec backoff exponentiel
  const retryWithBackoff = useCallback(async (fn, retries = DEFAULT_CONFIG.retries) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error.name !== 'AbortError') {
        await new Promise(resolve =>
          setTimeout(resolve, DEFAULT_CONFIG.retryDelay * (DEFAULT_CONFIG.retries - retries + 1))
        );
        return retryWithBackoff(fn, retries - 1);
      }
      throw error;
    }
  }, []);

  // Fonction principale de requête optimisée
  const request = useCallback(async (endpoint, options = {}) => {
    const cacheKey = getCacheKey(endpoint, options);

    // Vérifier le cache d'abord
    if (options.method === STR_GET || !options.method) {
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < DEFAULT_CONFIG.cacheTime) {
        return cached.data;
      }
    }

    // Éviter les requêtes en double
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    // Annuler la requête précédente si nécessaire
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    const requestPromise = retryWithBackoff(async () => {
      const config = {
        method: STR_GET
        headers: {
          'Content-Type': 'application/json'
          ...options.headers
        }
        signal: abortControllerRef.current.signal
        ...options
      };

      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }

      const response = await fetch(`${baseURL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    });

    // Mettre en cache la promesse pour éviter les doublons
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const data = await requestPromise;

      // Mettre en cache le résultat pour les requêtes GET
      if (options.method === STR_GET || !options.method) {
        requestCache.set(cacheKey, {
          data
          timestamp: Date.now()
        });
      }

      setLoading(false);
      pendingRequests.delete(cacheKey);
      cleanCache(); // Nettoyer le cache périodiquement

      return data;
    } catch (err) {
      // Logger fallback - ignore error
    }:`, err);

        } catch (error) {
    // Logger fallback - ignore error
  }}

      throw err;
    }
  }, [baseURL, retryWithBackoff, getCacheKey, cleanCache]);

  // Fonctions spécialisées avec mémoization
  const apiMethods = useMemo(() => ({
    // Health check
    health: () => request('/health')
    // AI Chat avec debouncing
    chatWithAI: (message, type = 'chat', context = {}) =>
      request('/api/ai/chat', {
        method: STR_POST
        body: { message, type, context }
      })
    // Ideas API
    getIdeas: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/ideas${query ? '${?${query}}' : ''}`);
    }
    createIdea: (ideaData) =>
      request('/api/ideas', {
        method: STR_POST
        body: ideaData
      })
    updateIdea: (id, ideaData) =>
      request(`/api/ideas/${id}`, {
        method: 'PUT'
        body: ideaData
      })
    deleteIdea: (id) =>
      request(`/api/ideas/${id}`, {
        method: 'DELETE'
      })
    // Projects API
    getProjects: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/projects${query ? '${?${query}}' : ''}`);
    }
    createProject: (projectData) =>
      request('/api/projects', {
        method: STR_POST
        body: projectData
      })
    // ROI API
    getROICalculations: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/roi${query ? '${?${query}}' : ''}`);
    }
    createROICalculation: (roiData) =>
      request('/api/roi', {
        method: STR_POST
        body: roiData
      })
    // AI Advanced features
    generateIdeas: (prompt, preferences = {}) =>
      request('/api/ai/generate-ideas', {
        method: STR_POST
        body: { prompt, preferences }
      })
    analyzeMarket: (data) =>
      request('/api/ai/market-analysis', {
        method: STR_POST
        body: data
      })
  }), [request]);

  // Fonction de nettoyage
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setError(null);
  }, []);

  // Fonction de reset du cache
  const clearCache = useCallback(() => {
    requestCache.clear();
    pendingRequests.clear();
  }, []);

  return {
    loading
    error
    cancel
    clearCache
    ...apiMethods
  };
}

export default useOptimizedAPI;