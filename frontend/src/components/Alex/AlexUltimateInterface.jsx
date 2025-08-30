import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import '../../styles/theme.css';

const AlexUltimateInterface = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      // Détection demande d'image
      const isImageRequest = /génère|créé|fais|dessine|image|photo|picture|draw/i.test(userMessage.content) && 
                            /chat|chaton|mignon|cute|cat|animal|dessin|art/i.test(userMessage.content);
      
      if (isImageRequest) {
        const { generateImage } = await import('../../lib/api.ts');
        const data = await generateImage(userMessage.content, {
          size: "1024x1024",
          style: "realistic"
        });
        
        if (data.image_url) {
          const aiMessage = { 
            role: 'assistant', 
            content: `Voici votre image générée !`,
            image: data.image_url,
            provider: 'Alex + DALL-E'
          };
          setConversation(prev => [...prev, aiMessage]);
        } else {
          throw new Error('Image generation failed');
        }
      } else {
        // Chat normal avec Alex
        const { chat } = await import('../../lib/api.ts');
        const data = await chat({ message: userMessage.content });
        
        if (data.output) {
          const aiMessage = { 
            role: 'assistant', 
            content: data.output,
            provider: data.provider || 'Alex IQ'
          };
          setConversation(prev => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      const errorMessage = { 
        role: 'error', 
        content: `Erreur: ${error.message}` 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-badge" />
          <div>
            <h1>Alex IQ</h1>
            <small>Assistant IA Authentique • Safe Boot</small>
          </div>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <span className="tag">Railway Optimized</span>
          <span className="tag">Tous modules actifs (progressif)</span>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <div>
            <h2 className="hero-title">Bonjour — je suis <span className="hero-accent">Alex</span></h2>
            <p className="hero-desc">IA authentique. 0% fake. 100% logique dynamique. Interface premium.</p>
          </div>
          <div className="tag">v1 • Design Suite</div>
        </div>
      </section>

      <main className="panel">
        <div className="messages">
          {conversation.length === 0 && (
            <div className="bubble ai">
              🤖 Assistant IA avec plus de 118 modules spécialisés. Posez-moi n'importe quelle question pour commencer !
            </div>
          )}
          
          {conversation.map((msg, index) => (
            <div key={index} className={`bubble ${msg.role}`}>
              {msg.content}
              {msg.image && (
                <div style={{marginTop: '12px'}}>
                  <img 
                    src={msg.image} 
                    alt="Generated image" 
                    style={{maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--border)'}}
                  />
                </div>
              )}
              {msg.provider && (
                <div style={{fontSize: '11px', marginTop: '6px', color: 'var(--muted)'}}>via {msg.provider}</div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="bubble ai">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div style={{display: 'flex', gap: '3px'}}>
                  <div className="animate-bounce" style={{width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%'}}></div>
                  <div className="animate-bounce" style={{width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%', animationDelay: '0.1s'}}></div>
                  <div className="animate-bounce" style={{width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%', animationDelay: '0.2s'}}></div>
                </div>
                <span style={{color: 'var(--muted)'}}>Alex réfléchit...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="composer">
          <div className="composer-inner">
            <input
              placeholder="Écris un message à Alex…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
              disabled={loading}
            />
            <button 
              className="btn" 
              onClick={sendMessage}
              disabled={loading || !message.trim()}
            >
              Envoyer
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlexUltimateInterface;