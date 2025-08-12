import React, { createContext, useContext, useState } from 'react';
import ReflectiveThinkingSystem from '../IA/AlexReflectiveThinking.js';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_POST = 'POST';
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const AIAssistantContext = createContext();

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
};

export const AIAssistantProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [reflectiveMode, setReflectiveMode] = useState(true);
  const [preferences, setPreferences] = useState({
    voice: true
    autoActivate: false
    theme: 'dark'
    language: 'fr'
    reflectiveThinking: true
    responseDepth: 'contextual'
  });

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    setIsActive(!isActive);
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processInput = async (input) => {
    setLoading(true);
    try {
      // Ajouter l'input à l'historique
      const newHistoryEntry = { input, timestamp: new Date().toISOString(), type: 'user' };
      const updatedHistory = [...chatHistory, newHistoryEntry];
      setChatHistory(updatedHistory);

      // Traitement réfléchi avec Alex
      let finalResponse;
      if (reflectiveMode && preferences.reflectiveThinking) {
        const context = {
          history: updatedHistory.slice(-5), // Derniers 5 échanges
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

        // Call backend API avec contexte enrichi
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        const response = await fetch(`${apiUrl}/api/ai/chat`, {
          method: STR_POST
          headers: {
            'Content-Type': STR_JSON_CONTENT
          }
          body: JSON.stringify({
            message: input
            type: 'reflective_chat'
            context: enrichedContext
            reflectiveInsights: reflectiveResult
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        finalResponse = data.response || `Réflexion Alex: ${reflectiveResult.reflection.thought}`;

        // Ajouter des insights réfléchis si l'API ne répond pas
        if (!data.response) {
          finalResponse += `\n\n💭 *Réflexion contextuelle*: ${reflectiveResult.reflection.thought}`;
          if (reflectiveResult.contextualConnections.length > 0) {
            finalResponse += `\n🔗 *Connexions*: ${reflectiveResult.contextualConnections.join(', ')}`;
          }
        }
      } else {
        // Mode standard
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        const response = await fetch(`${apiUrl}/api/ai/chat`, {
          method: STR_POST
          headers: {
            'Content-Type': STR_JSON_CONTENT
          }
          body: JSON.stringify({
            message: input
            type: 'chat'
            context: { history: updatedHistory.slice(-3) }
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        finalResponse = data.response || 'Réponse IA non disponible';
      }

      // Ajouter la réponse à l'historique
      const responseEntry = {
        input: finalResponse
        timestamp: new Date().toISOString()
        type: 'assistant'
      };
      setChatHistory(prev => [...prev, responseEntry]);
      setResponse(finalResponse);

    } catch (error) {
      // Logger fallback - ignore error
    }`;
      setResponse(errorMessage);

      // Ajouter l'erreur à l'historique
      const errorEntry = {
        input: errorMessage
        timestamp: new Date().toISOString()
        type: 'error'
      };
      setChatHistory(prev => [...prev, errorEntry]);
    } finally {
      setLoading(false);
    }
  };

  const clearMemory = () => {
    setTranscript('');
    setResponse('');
    setChatHistory([]);
    ReflectiveThinkingSystem.clearReflectionHistory();
  };

  const toggleReflectiveMode = () => {
    setReflectiveMode(!reflectiveMode);
  };

  const getReflectionHistory = () => {
    return ReflectiveThinkingSystem.getReflectionHistory();
  };

  const value = {
    isActive
      isOpen
      isListening
      transcript
      response
      loading
      chatHistory
      reflectiveMode
      preferences
      setPreferences
      toggleAssistant
      startListening
      stopListening
      processInput
      clearMemory
      setTranscript
      setChatHistory
      toggleReflectiveMode
      getReflectionHistory
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};