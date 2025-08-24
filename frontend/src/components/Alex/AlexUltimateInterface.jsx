import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = await response.json();
      
      if (data.output) {
        const aiMessage = { 
          role: 'assistant', 
          content: data.output,
          provider: data.provider 
        };
        setConversation(prev => [...prev, aiMessage]);
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
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : msg.role === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}>
              <div className="flex items-start">
                {msg.role === 'user' ? <User className="w-4 h-4 mr-2 mt-1" /> : <Bot className="w-4 h-4 mr-2 mt-1" />}
                <div>
                  <p className="text-sm">{msg.content}</p>
                  {msg.provider && (
                    <p className="text-xs mt-1 opacity-75">via {msg.provider}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                <div className="animate-pulse">Réflexion...</div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlexUltimateInterface;