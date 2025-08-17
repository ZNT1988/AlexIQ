import React, { createContext, useContext, useState } from 'react';

// Constantes pour chaînes dupliquées
const STR_POST = 'POST';
const STR_JSON_CONTENT = 'application/json';
const STR_DEVELOPMENT = 'development';

const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args),
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
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
    voice: true,
    autoActivate: false,
    theme: 'dark',
    language: 'fr',
    reflectiveThinking: true,
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
      const newHistoryEntry = { content: input, timestamp: new Date().toISOString(), type: 'user' };
      const updatedHistory = [...chatHistory, newHistoryEntry];
      setChatHistory(updatedHistory);
      
      // Appel API simplifié (mode réfléchi désactivé temporairement)
      let finalResponse;
      {
        // Mode standard
        const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        
        const requestBody = {
          message: input,
          provider: 'anthropic'
        };
        
        const response = await fetch(`${apiUrl}/chat`, {
          method: STR_POST,
          headers: {
            'Content-Type': STR_JSON_CONTENT
          },
          body: JSON.stringify(requestBody)
        });
        
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        finalResponse = data.response || 'Réponse IA non disponible';
        
      }

      // Ajouter la réponse à l'historique
      const responseEntry = {
        content: finalResponse,
        timestamp: new Date().toISOString(),
        type: 'assistant'
      };
      setChatHistory(prev => [...prev, responseEntry]);
      setResponse(finalResponse);

    } catch (error) {
      logger.error('AI Processing Error:', error);
      const errorMessage = `Erreur lors du traitement IA: ${error.message}`;
      setResponse(errorMessage);

      // Ajouter l'erreur à l'historique
      const errorEntry = {
        content: errorMessage,
        timestamp: new Date().toISOString(),
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
  };

  const toggleReflectiveMode = () => {
    setReflectiveMode(!reflectiveMode);
  };

  const getReflectionHistory = () => {
    return chatHistory.filter(entry => entry.type === 'assistant');
  };

  const value = {
    isActive,
    isOpen,
    isListening,
    transcript,
    response,
    loading,
    chatHistory,
    reflectiveMode,
    preferences,
    setPreferences,
    toggleAssistant,
    startListening,
    stopListening,
    processInput,
    clearMemory,
    setTranscript,
    setChatHistory,
    toggleReflectiveMode,
    getReflectionHistory
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};