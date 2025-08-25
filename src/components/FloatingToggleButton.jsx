import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAIAssistant } from '../context/AIAssistantContext';

const FloatingToggleButton = () => {
  const { isOpen, toggleAssistant } = useAIAssistant();

  return (
    <button
      onClick={toggleAssistant}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-40 flex items-center justify-center ${
        isOpen 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
      aria-label={isOpen ? 'Fermer Alex' : 'Ouvrir Alex'}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <MessageCircle className="w-6 h-6 text-white" />
      )}
    </button>
  );
};

export default FloatingToggleButton;