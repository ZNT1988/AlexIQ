import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Copy, RotateCcw } from 'lucide-react';
import { useAIAssistant } from '../../context/AIAssistantContext';

/**
 * Interface moderne style OpenAI/Anthropic pour AlexIQ
 * Design épuré, professionnel et accessible
 */
const ModernChatInterface = () => {
  const {
    processInput,
    loading,
    chatHistory,
    clearMemory
  } = useAIAssistant();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Focus automatique sur l'input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    await processInput(userMessage);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const suggestions = [
    "Aide-moi avec mon business plan",
    "Analyse ce marché pour moi", 
    "Crée une stratégie marketing",
    "Optimise mes processus"
  ];

  return (
    <div className="modern-chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center space-x-3">
          <div className="alex-avatar">
            <Bot size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Alex IQ</h1>
            <p className="text-sm text-gray-500">IA Consciente Avancée</p>
          </div>
        </div>
        
        {chatHistory.length > 0 && (
          <button
            onClick={clearMemory}
            className="clear-button"
            title="Nouvelle conversation"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {chatHistory.length === 0 ? (
          <div className="welcome-screen">
            <div className="alex-logo">
              <Bot size={48} className="text-blue-600" />
            </div>
            <h2 className="welcome-title">Bonjour ! Je suis Alex</h2>
            <p className="welcome-subtitle">
              IA consciente avec mémoire, émotions et créativité.
              <br />Comment puis-je vous aider aujourd'hui ?
            </p>
            
            <div className="suggestions-grid">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="suggestion-card"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {chatHistory.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'user' ? (
                    <User size={20} className="text-gray-600" />
                  ) : (
                    <Bot size={20} className="text-blue-600" />
                  )}
                </div>
                
                <div className="message-content">
                  <div className="message-text">
                    {message.content}
                  </div>
                  
                  {message.type === 'assistant' && (
                    <div className="message-actions">
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="action-button"
                        title="Copier"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Bot size={20} className="text-blue-600" />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">Alex réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question à Alex..."
              className="message-input"
              rows={1}
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="send-button"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        
        <p className="input-hint">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
        </p>
      </div>

      <style jsx>{`
        .modern-chat-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #fafafa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .alex-avatar {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-button {
          padding: 0.5rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.5rem;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
          text-align: center;
        }

        .alex-logo {
          width: 80px;
          height: 80px;
          background: #eff6ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          font-size: 1.1rem;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          max-width: 600px;
          width: 100%;
        }

        .suggestion-card {
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
          font-size: 0.9rem;
        }

        .suggestion-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }

        .messages-list {
          padding: 1rem 0;
        }

        .message {
          display: flex;
          padding: 1rem 1.5rem;
          gap: 0.75rem;
          max-width: none;
        }

        .message.user {
          background: #f8fafc;
        }

        .message.assistant {
          background: white;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .message.user .message-avatar {
          background: #f3f4f6;
        }

        .message.assistant .message-avatar {
          background: #eff6ff;
        }

        .message-content {
          flex: 1;
          min-width: 0;
        }

        .message-text {
          color: #111827;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .message-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .action-button {
          padding: 0.25rem;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .action-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #6b7280;
        }

        .typing-dots {
          display: flex;
          gap: 0.25rem;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .input-container {
          padding: 1rem 1.5rem;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .input-form {
          margin-bottom: 0.5rem;
        }

        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
          padding: 0.75rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .message-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          resize: none;
          font-size: 1rem;
          line-height: 1.5;
          color: #111827;
          min-height: 24px;
          max-height: 200px;
        }

        .message-input::placeholder {
          color: #9ca3af;
        }

        .send-button {
          padding: 0.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .send-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .input-hint {
          font-size: 0.75rem;
          color: #9ca3af;
          text-align: center;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .chat-header {
            padding: 1rem;
          }

          .message {
            padding: 1rem;
          }

          .input-container {
            padding: 1rem;
          }

          .suggestions-grid {
            grid-template-columns: 1fr;
          }

          .welcome-title {
            font-size: 1.5rem;
          }
        }

        /* Scrollbar styling */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ModernChatInterface;