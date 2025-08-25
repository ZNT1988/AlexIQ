import React, { createContext, useContext, useState, useCallback, useMemo, useTransition } from 'react';
import { useChatState } from './ChatStateContext.jsx';
import { useVoiceState } from './VoiceStateContext.jsx';
import useOptimizedAPI from '../hooks/useOptimizedAPI.js';
import { useDebouncedCallback } from '../hooks/useDebounce.js';
import ReflectiveThinkingSystem from '../IA/AlexReflectiveThinking.js';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const ModernAIAssistantContext = createContext();

export const useAIAssistant = () => {
  const context = useContext(ModernAIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within a ModernAIAssistantProvider');
  }
  return context;
};

export const ModernAIAssistantProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [reflectiveMode, setReflectiveMode] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [preferences, setPreferences] = useState({
    voice: true
    autoActivate: false
    theme: 'dark'
    language: 'fr'
    reflectiveThinking: true
    responseDepth: 'contextual'
    autoScroll: true
    soundEnabled: false
  });

  // Utilisation des contexts spécialisés
  const chatState = useChatState();
  const voiceState = useVoiceState();
  const api = useOptimizedAPI();

  // Actions principales mémorisées
  const toggleAssistant = useCallback(() => {
    setIsOpen(prev => !prev);
    setIsActive(prev => !prev);
  }, []);

  const toggleReflectiveMode = useCallback(() => {
    setReflectiveMode(prev => !prev);
  }, []);

  // Fonction de traitement de l'input avec debouncing
  const processInputDebounced = useDebouncedCallback(async (input) => {
    if (!input.trim()) return;

    startTransition(() => {
      chatState.setLoading(true);
      chatState.setError(null);
    });

    try {
      // Ajouter le message utilisateur

      // Traitement réfléchi avec Alex si activé
      let finalResponse;
      if (reflectiveMode && preferences.reflectiveThinking) {
        const context = {
          history: chatState.chatHistory.slice(-5)
          userProfile: preferences
          previousProjects: []
        };

        const reflectiveResult = ReflectiveThinkingSystem.processReflectiveInput(input, context);

        // Préparer le contexte enrichi pour l'API
        const enrichedContext = {
          ...context
          reflection: reflectiveResult.reflection
          consciousness: reflectiveResult.consciousness
          depth: reflectiveResult.depth
          contextualConnections: reflectiveResult.contextualConnections
        };

        // Appel API avec contexte enrichi
        const data = await api.chatWithAI(input, 'reflective_chat', {
          ...enrichedContext
          reflectiveInsights: reflectiveResult
        });

        finalResponse = data.response || `💭 ${reflectiveResult.reflection.thought}`;

        // Ajouter des insights réfléchis si nécessaire
        if (!data.response && reflectiveResult.contextualConnections.length > 0) {
          finalResponse += `\n\n🔗 *Connexions*: ${reflectiveResult.contextualConnections.join(', ')}`;
        }
      } else {
        // Mode standard
        const data = await api.chatWithAI(input, 'chat', {
          history: chatState.chatHistory.slice(-3)
        });
        finalResponse = data.response || 'Réponse IA non disponible';
      }

      // Ajouter la réponse
      startTransition(() => {
        chatState.addMessage(finalResponse, 'assistant');
        chatState.setResponse(finalResponse);
        chatState.setLoading(false);
      });

    } catch (error) {
      // Logger fallback - ignore error
    }`;

      startTransition(() => {
        chatState.addMessage(errorMessage, 'error');
        chatState.setResponse(errorMessage);
        chatState.setError(error);
        chatState.setLoading(false);
      });
    }
  }, 300);

  // Fonction de traitement immédiat (sans debounce)
  const processInput = useCallback(async (input, immediate = false) => {
    if (immediate) {
      processInputDebounced.executeNow(input);
    } else {
      processInputDebounced(input);
    }
  }, [processInputDebounced]);

  // Fonction de nettoyage de la mémoire
  const clearMemory = useCallback(() => {
    chatState.clearHistory();
    voiceState.clearTranscript();
    ReflectiveThinkingSystem.clearReflectionHistory();
    api.clearCache();
  }, [chatState, voiceState, api]);

  // Fonction pour obtenir l'historique de réflexion
  const getReflectionHistory = useCallback(() => {
    return ReflectiveThinkingSystem.getReflectionHistory();
  }, []);

  // Gestion des préférences avec validation
  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => ({
      ...prev
      ...newPreferences
    }));
  }, []);

  // État calculé mémorisé
  const computedState = useMemo(() => ({
    isReady: !api.loading && !chatState.isLoading
    hasActiveConversation: chatState.messageCount > 0
    canProcessInput: !api.loading && !chatState.isLoading && !isPending
    status: api.loading || chatState.isLoading || isPending ? 'processing' : 'ready'
  }), [api.loading, chatState.isLoading, chatState.messageCount, isPending]);

  // Valeur du contexte mémorisée
  const value = useMemo(() => ({
    // État principal
    isActive
    isOpen
    reflectiveMode
    preferences
    isPending
    // États calculés
    ...computedState
    // État des sous-contextes
    chat: {
      history: chatState.chatHistory
      isLoading: chatState.isLoading
      error: chatState.error
      response: chatState.response
      messageCount: chatState.messageCount
      lastMessage: chatState.lastMessage
    }
    voice: {
      isListening: voiceState.isListening
      isSupported: voiceState.isSupported
      transcript: voiceState.transcript
      currentTranscript: voiceState.currentTranscript
    }
    api: {
      loading: api.loading
      error: api.error
    }
    // Actions principales
    toggleAssistant
    toggleReflectiveMode
    processInput
    clearMemory
    updatePreferences
    getReflectionHistory
    // Actions déléguées
    startListening: voiceState.startListening
    stopListening: voiceState.stopListening
    setTranscript: chatState.setTranscript
    // Utilitaires API
    cancelRequests: api.cancel
    clearCache: api.clearCache
  }), [
    isActive
    isOpen
    reflectiveMode
    preferences
    isPending
    computedState
    chatState
    voiceState
    api
    toggleAssistant
    toggleReflectiveMode
    processInput
    clearMemory
    updatePreferences
    getReflectionHistory
  ]);

  return (
    <ModernAIAssistantContext.Provider value={value}>
      {children}
    </ModernAIAssistantContext.Provider>
  );
};