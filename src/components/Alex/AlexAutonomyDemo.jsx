import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AlexAutonomyDemo = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    apiConnection: 'unknown',
    chatAvailable: false
  });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    checkSystemHealth();
    const welcomeMessage = {
      type: 'system',
      content: 'Interface de chat IA - Connecté aux APIs réelles OpenAI, Anthropic, ou Google selon configuration.',
      timestamp: new Date()
    };
    setConversation([welcomeMessage]);
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setSystemStatus({
        apiConnection: data.ok ? 'connected' : 'disconnected',
        chatAvailable: data.ok
      });
    } catch (error) {
      setSystemStatus({
        apiConnection: 'error',
        chatAvailable: false
      });
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = await response.json();
      
      if (data.output) {
        const aiMessage = {
          type: 'ai',
          content: data.output,
          provider: data.provider,
          timestamp: new Date()
        };
        setConversation(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          type: 'error',
          content: data.message || 'Erreur de réponse',
          timestamp: new Date()
        };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: 'error',
        content: `Erreur: ${error.message}`,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Interface Chat IA
        </h1>
        
        <div className="flex justify-center space-x-4 mb-6">
          <div className={`px-3 py-1 rounded text-sm ${
            systemStatus.apiConnection === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : systemStatus.apiConnection === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            API: {systemStatus.apiConnection}
          </div>
          <div className={`px-3 py-1 rounded text-sm ${
            systemStatus.chatAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            Chat: {systemStatus.chatAvailable ? 'Disponible' : 'Indisponible'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="h-96 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          {conversation.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-blue-500 text-white ml-12' 
                  : msg.type === 'error'
                  ? 'bg-red-500 text-white mr-12'
                  : 'bg-gray-200 text-gray-800 mr-12'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.provider && (
                <div className="text-xs opacity-75 mt-1">via {msg.provider}</div>
              )}
              <div className="text-xs opacity-75 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-200 text-gray-800 mr-12 mb-4 p-3 rounded-lg"
            >
              <div className="flex items-center">
                <div className="animate-pulse">Traitement...</div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || !systemStatus.chatAvailable}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim() || !systemStatus.chatAvailable}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlexAutonomyDemo;