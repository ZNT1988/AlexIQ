import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour debouncer les valeurs et éviter les requêtes trop fréquentes
 * @param {any} value - Valeur à debouncer
 * @param {number} delay - Délai en millisecondes
 * @returns {any} - Valeur debouncée
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour debouncer les fonctions/callbacks
 * @param {Function} callback - Fonction à debouncer
 * @param {number} delay - Délai en millisecondes
 * @returns {Function} - Fonction debouncée
 */
export function useDebouncedCallback(callback, delay = 300) {
  const timeoutRef = useRef();
  const callbackRef = useRef(callback);

  // Mettre à jour la référence du callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook avancé pour debouncer avec possibilité d'annulation et d'exécution immédiate
 * @param {Function} callback - Fonction à débouncer
 * @param {number} delay - Délai en millisecondes
 * @returns {Object} - Objet avec les méthodes de contrôle
 */
export function useAdvancedDebounce(callback, delay = 300) {
  const timeoutRef = useRef();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const executeImmediately = useCallback((...args) => {
    cancelDebounce();
    callbackRef.current(...args);
  }, [cancelDebounce]);

  const isPending = useCallback(() => {
    return timeoutRef.current !== undefined;
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedCallback
    cancel: cancelDebounce
    executeNow: executeImmediately
    isPending
  };
}

export default useDebounce;