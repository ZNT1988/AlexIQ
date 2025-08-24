import React, { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

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
          content: data.output,
          provider: data.provider 
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
    <div className="app">
      <header className="header">
        <h1>Chat IA Simple</h1>
        <p>Propulsé par OpenAI, Anthropic, ou Google selon configuration</p>
      </header>

      <main className="main">
        <div className="conversation">
          {conversation.length === 0 && (
            <div className="welcome">
              <p>💬 Interface de chat direct avec les APIs IA</p>
              <p>🔧 Backend: Node.js + Express</p>
              <p>🤖 IA: Selon clés configurées</p>
            </div>
          )}
          
          {conversation.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.content}
                {msg.provider && (
                  <small className="provider">via {msg.provider}</small>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing">Réflexion...</div>
              </div>
            </div>
          )}
        </div>

        <div className="input-area">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            disabled={loading}
            rows="3"
          />
          <button onClick={sendMessage} disabled={loading || !message.trim()}>
            Envoyer
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;