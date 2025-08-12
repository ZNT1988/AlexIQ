import React, { createContext, useContext, useState, useMemo } from 'react';

const ChatStateContext = createContext();

export const useChatState = () => {
  const context = useContext(ChatStateContext);
  if (!context) {
    throw new Error('useChatState must be used within a ChatStateProvider');
  }
  return context;
};

export const ChatStateProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  // Actions mémorisées pour éviter les re-renders
  const actions = useMemo(() => ({
    addMessage: (message, type = 'user') => {
      const newMessage = {
        id: Date.now()
        content: message
        type
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, newMessage]);
      return newMessage;
    }
    updateLastMessage: (content) => {
      setChatHistory(prev => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1]
          content
        };
        return updated;
      });
    }
    clearHistory: () => {
      setChatHistory([]);
      setTranscript('');
      setResponse('');
      setError(null);
    }
    setLoading: setIsLoading
    setError
    setTranscript
    setResponse
  }), []);

  // État calculé mémorisé
  const computedState = useMemo(() => ({
    messageCount: chatHistory.length
    lastMessage: chatHistory[chatHistory.length - 1] || null
    hasError: !!error
    isEmpty: chatHistory.length === 0
  }), [chatHistory, error]);

  const value = useMemo(() => ({
    // État
    chatHistory
    isLoading
    error
    transcript
    response
    ...computedState
    // Actions
    ...actions
  }), [chatHistory, isLoading, error, transcript, response, computedState, actions]);

  return (
    <ChatStateContext.Provider value={value}>
      {children}
    </ChatStateContext.Provider>
  );
};