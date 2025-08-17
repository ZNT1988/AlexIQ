import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Copy, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

const ChatGPTInterface = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    // Message d'accueil d'Alex
    if (conversation.length === 0) {
      setTimeout(() => {
        setConversation([{
          type: 'assistant',
          content: "Bonjour ! Je suis Alex, votre assistant IA nouvelle génération. Je dispose de 75+ modules d'intelligence et je peux vous aider avec vos projets entrepreneuriaux, créatifs et bien plus encore. Comment puis-je vous accompagner aujourd'hui ?",
          timestamp: new Date(),
          id: Date.now()
        }]);
      }, 500);
    }
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: message.trim(),
      timestamp: new Date(),
      id: Date.now()
    };

    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Connexion au backend Alex local
      const response = await fetch('http://localhost:3003/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: 'user_' + Date.now(),
          context: {
            conversationHistory: conversation.slice(-5),
            frontend: 'chatgpt_interface',
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();

      if (data.response) {
        const alexResponse = {
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          id: Date.now(),
          metadata: {
            responseTime: data.confidence ? Math.round(data.confidence * 1000) + 'ms' : '500ms',
            version: data.source || 'Alex Palier 3',
            source: data.source || 'Alex_Palier3',
            palier: data.palier3 ? '3' : data.palier2 ? '2' : '1'
          },
          intent: data.domain || 'conversation',
          capabilities: ['conversation', 'empathy', 'intelligence'],
          palierInfo: {
            palier2: data.palier2,
            palier3: data.palier3,
            confidence: data.confidence
          }
        };

        setConversation(prev => [...prev, alexResponse]);
      } else {
        throw new Error(data.error || 'Erreur de communication avec Alex');
      }
    } catch (error) {
      
      // Message d'erreur avec suggestion
      const errorMessage = {
        type: 'assistant',
        content: `Je rencontre actuellement des difficultés de connexion avec mes modules avancés. Cela peut être dû à:\n\n• Problème de connectivité réseau temporaire\n• Modules d'IA en cours d'initialisation\n• Maintenance du système en cours\n\nVeuillez réessayer dans quelques instants. Mes capacités d'IA avancée (Palier 3) incluent l'analyse émotionnelle et la créativité !`,
        timestamp: new Date(),
        id: Date.now(),
        isError: true
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const formatMessage = (content) => {
    // Format avancé pour les messages (markdown-like) - Sécurisé
    return content.split('\n').map((line, index) => {
      // Échapper les caractères HTML dangereux
      const escapedLine = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
      
      // Appliquer le formatage markdown de façon sécurisée
      let formattedLine = escapedLine
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
      
      return (
        <div key={index} className="mb-1" dangerouslySetInnerHTML={{ __html: formattedLine || '<br />' }} />
      );
    });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Style ChatGPT */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Alex</h1>
                <p className="text-xs text-gray-500">Assistant IA Avancé</p>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {conversation.length > 1 ? `${Math.floor((conversation.length - 1) / 2)} messages` : 'Nouvelle conversation'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {conversation.map((msg) => (
              <div key={msg.id} className="group">
                <div className="flex space-x-4">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.type === 'user'
                      ? 'bg-gray-700'
                      : msg.isError
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-purple-500 to-blue-600'
                  }`}>
                    {msg.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-gray-900">
                        {msg.type === 'user' ? 'Vous' : 'Alex'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className={`prose prose-sm max-w-none ${
                      msg.isError ? 'text-red-700' : 'text-gray-800'
                    }`}>
                      {formatMessage(msg.content)}
                    </div>

                    {/* Actions */}
                    {msg.type === 'assistant' && (
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyMessage(msg.content)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                          title="Copier"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                          title="Bonne réponse"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button 
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                          title="Mauvaise réponse"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Metadata pour Alex */}
                    {msg.type === 'assistant' && msg.metadata && !msg.isError && (
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>Temps de réponse: {msg.metadata.responseTime}ms</div>
                        {msg.capabilities && (
                          <div>Modules utilisés: {msg.capabilities.join(', ')}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="group">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-gray-900">Alex</span>
                      <span className="text-xs text-gray-500">en train d'écrire...</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Style ChatGPT */}
      <div className="border-t border-gray-200 bg-white sticky bottom-0">
        <div className="max-w-3xl mx-auto p-4">
          <div className="relative flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écrivez votre message..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  rows={1}
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px'
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  className={`absolute right-2 bottom-2 p-2 rounded-md transition-colors ${
                    message.trim() && !isLoading
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Alex peut commettre des erreurs. Vérifiez les informations importantes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGPTInterface;