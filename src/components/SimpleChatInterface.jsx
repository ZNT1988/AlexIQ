import React, { useState, useEffect, useRef } from 'react';
import './SimpleChatInterface.css';

const SimpleChatInterface = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message };
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (data.output) {
        const aiMessage = { 
          role: 'assistant', 
          content: data.output
        };
        setConversation(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { 
          role: 'error', 
          content: `Erreur: ${data.message || 'Réponse invalide'}` 
        };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { 
        role: 'error', 
        content: `Erreur de connexion: ${error.message}` 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="simple-chat-container">
      {/* Header simple */}
      <div className="chat-header">
        <div className="alex-title">
          <div className="alex-logo">A</div>
          <div>
            <h1>Alex</h1>
            <p>Intelligence artificielle</p>
          </div>
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="chat-messages">
        {conversation.length === 0 && (
          <div className="welcome-message">
            <div className="alex-avatar-large">A</div>
            <h2>Bonjour ! Je suis Alex</h2>
            <p>Comment puis-je vous aider aujourd'hui ?</p>
            <div className="quick-suggestions">
              <button onClick={() => setMessage("Peux-tu te présenter ?")}>
                Présente-toi
              </button>
              <button onClick={() => setMessage("Quelles sont tes capacités ?")}>
                Tes capacités
              </button>
              <button onClick={() => setMessage("Aide-moi avec une idée business")}>
                Idée business
              </button>
            </div>
          </div>
        )}

        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? 'U' : msg.role === 'error' ? '!' : 'A'}
            </div>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-avatar">A</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            disabled={loading}
            rows="1"
            className="chat-input"
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !message.trim()}
            className="send-button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatInterface;