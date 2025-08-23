import React, { useState, useEffect, useRef } from 'react';
import { Brain, MessageSquare, Send, Mic, MicOff } from 'lucide-react';

const AssistantDashboard = () => {
  const [conversation, setConversation] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const sendMessage = async (text = message) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();
      
      if (data.output) {
        const aiMessage = { 
          role: 'assistant', 
          content: data.output 
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

  const toggleVoiceRecognition = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-bold">Assistant IA</h1>
          </div>
          <button
            onClick={toggleVoiceRecognition}
            className={`p-2 rounded-lg ${
              isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
      </div>

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
                <MessageSquare className="w-4 h-4 mr-2 mt-1" />
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <Brain className="w-4 h-4 mr-2" />
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
            placeholder="Demandez quelque chose..."
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

export default AssistantDashboard;