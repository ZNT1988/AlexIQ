import React from 'react';
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

const MessageRenderer = ({
  message,
  onCopy,
  isBot = false,
  showActions = true,
  showTimestamp = true
}) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      onCopy?.(message.id);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  return (
    <div className={`group relative ${isBot ? 'ml-0 mr-12' : 'ml-12 mr-0'}`}>
      <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start space-x-3 ${isBot ? '' : 'space-x-reverse'}`}>
        
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBot ? 'bg-blue-500' : 'bg-blue-600'
        }`}>
          {isBot ? (
            <Bot className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-gray-50 rounded-bl-md'
              : 'bg-blue-600 text-white rounded-br-md'
          }`}>
            <div className={`text-sm leading-relaxed ${isBot ? 'text-gray-900' : 'text-white'}`}>
              {message.content}
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copier"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="J'aime"
              >
                <ThumbsUp className="w-4 h-4 text-gray-500" />
              </button>

              <button
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Je n'aime pas"
              >
                <ThumbsDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}

          {showTimestamp && message.timestamp && (
            <div className={`text-xs text-gray-400 mt-2 ${isBot ? 'text-left' : 'text-right'}`}>
              {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageRenderer;