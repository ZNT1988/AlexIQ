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
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-white shadow-lg">
      {/* Header Alex */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alex IQ</h1>
            <p className="text-blue-100">Assistant IA Authentique</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Railway Optimized</div>
            <div className="text-xs opacity-50">Tous modules actifs</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {conversation.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Bonjour ! Je suis Alex</h2>
            <p className="text-gray-500 max-w-md">
              Assistant IA avec plus de 118 modules spécialisés. 
              Posez-moi n'importe quelle question pour commencer !
            </p>
          </div>
        )}
        
        {conversation.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-3 rounded-lg shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : msg.role === 'error'
                ? 'bg-red-100 border border-red-200 text-red-800'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}>
              <div className="flex items-start">
                {msg.role === 'user' ? <User className="w-4 h-4 mr-2 mt-1" /> : <Bot className="w-4 h-4 mr-2 mt-1" />}
                <div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.image && (
                    <div className="mt-2">
                      <img 
                        src={msg.image} 
                        alt="Generated image" 
                        className="max-w-full h-auto rounded-lg border border-gray-300"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}
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
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Bot className="w-4 h-4 mr-2 text-blue-600" />
                <div className="flex items-center space-x-1">
                  <div className="animate-bounce w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="animate-bounce w-2 h-2 bg-blue-600 rounded-full" style={{animationDelay: '0.1s'}}></div>
                  <div className="animate-bounce w-2 h-2 bg-blue-600 rounded-full" style={{animationDelay: '0.2s'}}></div>
                  <span className="ml-2 text-gray-600">Alex réfléchit...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
            placeholder="Posez votre question à Alex..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AlexUltimateInterface;