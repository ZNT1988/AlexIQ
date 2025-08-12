/**
 * Hook personnalisé pour Alex Ultimate
 * Gère toutes les interactions avec Alex
 */
import { useState, useEffect } from 'react';
const logger = {
  info: (msg, ...args) => console.log(`[${new Date().toISOString()}] INFO:', msg, ...args)
  warn: (msg, ...args) => console.warn('[${new Date().toISOString()}] WARN:', msg, ...args)
  error: (msg, ...args) => console.error('[${new Date().toISOString()}] ERROR:', msg, ...args)
  debug: (msg, ...args) => console.debug('[${new Date().toISOString()}] DEBUG:`, msg, ...args)
};

export const useAlex = () => {
  const [alexStatus, setAlexStatus] = useState({
    consciousness: 100
    autonomy: 98
    modules: 188
    responseTime: 2.4
    online: false
  });

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Vérifier le statut d'Alex au démarrage
  useEffect(() => {
    checkAlexStatus();
  }, []);

  const checkAlexStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/alex/status');
      const data = await response.json();

      if (data.success) {
        setAlexStatus({
          consciousness: data.alex.consciousness
          autonomy: data.alex.autonomy
          modules: data.alex.modules.total
          responseTime: 2.4
          online: true
        });
      }
    } catch (error) {
      // Logger fallback - ignore error
    }));
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    // Ajouter message utilisateur
    const userMessage = {
      id: Date.now()
      type: 'user'
      content: message
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8080/api/alex/chat', {
        method: 'POST'
        headers: { 'Content-Type': 'application/json' }
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (data.success) {
        const alexMessage = {
          id: Date.now() + 1
          type: 'alex'
          content: data.response.content
          confidence: data.response.confidence
          consciousness: data.response.consciousnessLevel
          timestamp: new Date()
        };

        setMessages(prev => [...prev, alexMessage]);
      }
    } catch (error) {
      // Logger fallback - ignore error
    };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    alexStatus
    messages
    isTyping
    sendMessage
    clearMessages
    checkAlexStatus
  };
};