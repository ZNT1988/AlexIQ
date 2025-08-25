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

    const currentMessage = message.trim();
    const userMessage = { role: 'user', content: currentMessage };
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      
      // Détecter si c'est une demande d'image
      const isImageRequest = (
        currentMessage.toLowerCase().includes('génère') || 
        currentMessage.toLowerCase().includes('crée') || 
        currentMessage.toLowerCase().includes('dessine') ||
        currentMessage.toLowerCase().includes('illustre')
      ) && currentMessage.toLowerCase().includes('image');

      let response, data;

      if (isImageRequest) {
        // Requête d'image DALL-E
        console.log('🎨 Demande d\'image détectée:', currentMessage);
        response = await fetch(`${apiBaseUrl}/api/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: currentMessage })
        });
        
        data = await response.json();
        
        if (data.success && data.imageUrl) {
          const aiMessage = { 
            role: 'assistant', 
            content: `🎨 Voici votre image générée par DALL-E 3 !`,
            imageUrl: data.imageUrl,
            isImage: true,
            prompt: currentMessage
          };
          setConversation(prev => [...prev, aiMessage]);
        } else {
          const errorMessage = { 
            role: 'error', 
            content: `Erreur génération image: ${data.message || data.error || 'Impossible de générer l\'image'}` 
          };
          setConversation(prev => [...prev, errorMessage]);
        }
      } else {
        // Requête de chat normale
        response = await fetch(`${apiBaseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: currentMessage })
        });

        data = await response.json();
        
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
      }
    } catch (error) {
      console.error('Erreur:', error);
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
              <button onClick={() => setMessage("Génère une image d'un entrepreneur")}>
                🎨 Génère une image
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
              {msg.isImage && msg.imageUrl && (
                <div className="generated-image">
                  <img 
                    src={msg.imageUrl} 
                    alt={msg.prompt || "Image générée par Alex"} 
                    className="alex-generated-image"
                    onLoad={() => scrollToBottom()}
                  />
                  <p className="image-caption">
                    🎨 Généré par Alex avec DALL-E 3
                  </p>
                </div>
              )}
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
      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message... (ou demandez: 'génère une image de...')"
            disabled={loading}
            rows="1"
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !message.trim()}
            className="send-button"
          >
            {loading ? '⏳' : '→'}
          </button>
        </div>
        <div className="input-help">
          💬 Tapez votre message ou 🎨 demandez "génère une image de..."
        </div>
      </div>
    </div>
  );
};

export default SimpleChatInterface;