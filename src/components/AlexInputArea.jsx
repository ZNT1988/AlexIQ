import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff, Upload } from 'lucide-react';

const AlexInputArea = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSendMessage(message);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Note: Voice recording would need real implementation with browser APIs
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            disabled={disabled}
            rows={1}
          />
        </div>
        
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-3 rounded-lg transition-colors ${
            isRecording 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          disabled={disabled}
          title={isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Envoyer le message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      
      {disabled && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Connexion en cours...
        </div>
      )}
    </div>
  );
};

export default AlexInputArea;