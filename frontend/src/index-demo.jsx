import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ERROR = 'error';

// Simple Chat avec Alex

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_ALEX = 'alex';
const STR_20PX = '20px';
const STR_1PX_SOLID_0F3460 = '1px solid #0f3460';
const STR_CENTER = 'center';
const STR_4FC3F7 = '#4fc3f7';
const STR_AAA = '#aaa';
const STR_14PX = '14px';
const STR_2D3748 = '#2d3748';

const AlexChat = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { type: 'user', content: message, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8082/api/ai/chat', {
        method: 'POST'
        headers: {
          'Content-Type': 'application/json'
        }
        body: JSON.stringify({
          message: message
          type: 'chat'
          model: STR_ALEX
        })
      });

      const data = await response.json();

      if (data.response) {
        // Parse the response if it's a JSON string
        let alexResponse;
        try {
          const parsed = JSON.parse(data.response);
          alexResponse = parsed.content || parsed.message || data.response;
        } catch {
          alexResponse = data.response;
        }

        const botMessage = {
          type: STR_ALEX
          content: alexResponse
          timestamp: new Date()
          personality: data.metadata?
      .personality || 'Alex'
        };
        setConversation(prev => [...prev, botMessage]);
      }
    } catch (error) {
      // Logger fallback - ignore error
    };
      setConversation(prev => [...prev, errorMessage]);
    }

    setMessage('');
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      display :
       STR_FLEX
      flexDirection: 'column'
      height: '100vh'
      backgroundColor: '#1a1a2e'
      color: STR_WHITE
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: STR_20PX
        backgroundColor: '#16213e'
        borderBottom: STR_1PX_SOLID_0F3460
        textAlign: STR_CENTER
      }}>
        <h1 style={{ margin: 0, color: STR_4FC3F7 }}>🤖 Alex Ultimate Chat</h1>
        <p style={{ margin: '5px 0 0 0', color: STR_AAA, fontSize: STR_14PX }}>
          Conversation avec l'IA business révolutionnaire
        </p>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1
        padding: STR_20PX
        overflowY: 'auto'
        display: STR_FLEX
        flexDirection: 'column'
        gap: '15px'
      }}>
        {conversation.length === 0 && (
          <div style={{
            textAlign: STR_CENTER
            color: '#888'
            marginTop: '50px'
          }}>
            <h2>👋 Bonjour ! Je suis Alex</h2>
            <p>Votre assistant IA spécialisé dans l'entrepreneuriat et l'innovation.</p>
            <p>Commencez une conversation en tapant votre message ci-dessous !</p>
          </div>
        )}

        {conversation.map((msg, index) => (
          <div key={index} style={{
            display: STR_FLEX
            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
            marginBottom: '10px'
          }}>
            <div style={{
              maxWidth: '70%'
              padding: '12px 16px'
              borderRadius: '18px'
              backgroundColor: msg.type === 'user' ? STR_4FC3F7 :
                             msg.type === STR_ERROR ? '#f44336' : STR_2D3748
              color: STR_WHITE
              wordWrap: 'break-word'
            }}>
              {msg.type === STR_ALEX && (
                <div style={{ fontSize: '12px', color: STR_AAA, marginBottom: '5px' }}>
                  🤖 {msg.personality || 'Alex'}
                </div>
              )}
              <div>{msg.content}</div>
              <div style={{
                fontSize: '11px'
                color: '#ccc'
                marginTop: '5px'
                textAlign: 'right'
              }}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: STR_FLEX, justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px'
              borderRadius: '18px'
              backgroundColor: STR_2D3748
              color: STR_AAA
            }}>
              <span>Alex réfléchit</span>
              <span className="blinking-cursor">...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: STR_20PX
        backgroundColor: '#16213e'
        borderTop: STR_1PX_SOLID_0F3460
        display: STR_FLEX
        gap: '10px'
        alignItems: STR_CENTER
      }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message à Alex..."
          disabled={loading}
          style={{
            flex: 1
            padding: '12px'
            borderRadius: STR_20PX
            border: STR_1PX_SOLID_0F3460
            backgroundColor: STR_2D3748
            color: STR_WHITE
            resize: 'none'
            minHeight: '44px'
            fontSize: STR_14PX
          }}
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !message.trim()}
          style={{
            padding: '12px 20px'
            borderRadius: STR_20PX
            border: 'none'
            backgroundColor: loading ? '#666' : STR_4FC3F7
            color: STR_WHITE
            cursor: loading ? 'not-allowed' : 'pointer'
            fontSize: STR_14PX
            minWidth: '80px'
          }}
        >
          {loading ? '...' : '💬 Envoyer'}
        </button>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AlexChat />);