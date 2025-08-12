
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const STR_ASSISTANT = 'assistant';

/**
 * REAL ALEX ULTIMATE INTERFACE - Interface ChatGPT/Claude Style
 * Une VRAIE interface de chat avec VRAIE génération IA
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

const RealAlexInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1
      role: STR_ASSISTANT
      content: 'Bonjour ! Je suis Alex Ultimate, une IA avancée prête à vous aider. Posez-moi n\'importe quelle question !'
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now()
      role: 'user'
      content: input.trim()
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // APPEL API RÉEL vers le backend
      const response = await fetch('/api/alex/real-chat', {
        method: 'POST'
        headers: {
          'Content-Type': 'application/json'
        }
        body: JSON.stringify({
          message: userMessage.content
          conversation: messages.slice(-10), // Context des 10 derniers messages
          timestamp: Date.now()
        })
      });

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1
        role: STR_ASSISTANT
        content: data.response || 'Désolé, j\'ai rencontré un problème technique.'
        timestamp: new Date()
        metadata: data.metadata || {}
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      // Logger fallback - ignore error
    };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="real-alex-interface">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo-area">
            <Bot className="logo-icon" size={24} />
            <div className="title-info">
              <h1>Alex Ultimate</h1>
              <span className="subtitle">IA Avancée • Temps réel</span>
            </div>
          </div>
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span>En ligne</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <div className="messages-wrapper">
          {messages.map((message) => (
            <div key={message.id} className={`message-block ${message.role}`}>
              <div className="message-avatar">
                {message.role === STR_ASSISTANT ? (
                  <Bot size={20} />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
                {message.metadata && (
                  <div className="message-metadata">
                    {message.metadata.processingTime && (
                      <span>⚡ {message.metadata.processingTime}ms</span>
                    )}
                    {message.metadata.model && (
                      <span>🧠 {message.metadata.model}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="message-block assistant loading">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <Loader2 className="spinner" size={16} />
                  <span>Alex réfléchit...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 1.5rem;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 768px;
          margin: 0 auto;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          color: #3b82f6;
          background: #eff6ff;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }

        .title-info h1 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        .subtitle {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          background: #ffffff;
        }

        .messages-wrapper {
          max-width: 768px;
          margin: 0 auto;
          padding: 1rem;
        }

        .message-block {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .message-block.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-block.assistant .message-avatar {
          background: #eff6ff;
          color: #3b82f6;
        }

        .message-block.user .message-avatar {
          background: #f3f4f6;
          color: #6b7280;
        }

        .message-content {
          flex: 1;
          max-width: calc(100% - 48px);
        }

        .message-block.user .message-content {
          text-align: right;
        }

        .message-text {
          background: #f9fafb;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          line-height: 1.5;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .message-block.user .message-text {
          background: #3b82f6;
          color: white;
        }

        .message-time {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }

        .message-metadata {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-style: italic;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .input-container {
          border-top: 1px solid #e5e7eb;
          padding: 1rem 1.5rem;
          background: #ffffff;
        }

        .input-wrapper {
          max-width: 768px;
          margin: 0 auto;
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .message-input {
          flex: 1;
          min-height: 44px;
          max-height: 120px;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 1rem;
          font-size: 1rem;
          font-family: inherit;
          resize: none;
          outline: none;
          background: #ffffff;
          transition: border-color 0.2s;
        }

        .message-input:focus {
          border-color: #3b82f6;
        }

        .message-input:disabled {
          background: #f9fafb;
          color: #9ca3af;
        }

        .send-button {
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .send-button:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .input-footer {
          max-width: 768px;
          margin: 0.5rem auto 0;
          text-align: center;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .loading .message-text {
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default RealAlexInterface;