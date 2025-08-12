import React, { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { Send, Mic, MicOff, Brain, Trash2 } from 'lucide-react';
import { useAIAssistant } from '../../context/ModernAIAssistantContext.jsx';

// Composant Message mémorisé pour éviter les re-renders

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_W_5_H_5 = 'w-5 h-5';
const STR_W_2_H_2_BG_BLUE_500_ROUNDED_FU = 'w-2 h-2 bg-blue-500 rounded-full animate-bounce';

const ChatMessage = memo(({ message, isLastMessage }) => {
  const messageRef = useRef(null);

  // Auto-scroll pour le dernier message
  useEffect(() => {
    if (isLastMessage && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: 'smooth'
        block: 'end'
      });
    }
  }, [isLastMessage]);

  const getMessageStyle = useCallback((type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500 text-white ml-auto';
      case 'assistant':
        return 'bg-gray-100 text-gray-800 mr-auto';
      case 'error':
        return 'bg-red-100 text-red-800 border border-red-200 mr-auto';
      default:
        return 'bg-gray-100 text-gray-800 mr-auto';
    }
  }, []);

  const formatTimestamp = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit'
      minute: '2-digit'
    });
  }, []);

  return (
    <div
      ref={messageRef}
      className={`max-w-[80%] p-3 rounded-lg mb-3 shadow-sm ${getMessageStyle(message.type)}`}
    >
      <div className="flex items-start space-x-2">
        {message.type === 'assistant' && (
          <Brain className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="prose prose-sm max-w-none">
            {message.content.split('\\n').map((line, index) => (
              <p key={index} className="mb-1 last:mb-0 break-words">
                {line}
              </p>
            ))}
          </div>
          <div className="text-xs opacity-60 mt-2">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

// Input zone optimisée avec debouncing
const ChatInput = memo(({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const { voice, startListening, stopListening, reflectiveMode } = useAIAssistant();
  const textareaRef = useRef(null);

  // Auto-resize du textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  // Utiliser le transcript vocal s'il est disponible
  useEffect(() => {
    if (voice.transcript && !voice.isListening) {
      setInput(voice.transcript);
    }
  }, [voice.transcript, voice.isListening]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  }, [input, disabled, onSendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const toggleVoiceRecording = useCallback(() => {
    if (voice.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [voice.isListening, startListening, stopListening]);

  const inputPlaceholder = useMemo(() => {
    if (voice.isListening) return 'Parlez maintenant...';
    if (reflectiveMode) return 'Posez votre question à Alex (mode réfléchi activé)...';
    return 'Tapez votre message...';
  }, [voice.isListening, reflectiveMode]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2 p-4 bg-white border-t">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={inputPlaceholder}
          disabled={disabled}
          className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            voice.isListening
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          rows={1}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
        {voice.isListening && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center space-x-1 text-red-600 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Écoute...</span>
            </div>
          </div>
        )}
      </div>

      {voice.isSupported && (
        <button
          type="button"
          onClick={toggleVoiceRecording}
          disabled={disabled}
          className={`p-3 rounded-lg transition-all ${
            voice.isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={voice.isListening ? 'Arrêter l\\'enregistrement' : 'Commencer l\\'enregistrement vocal'}
        >
          {voice.isListening ? <MicOff className=STR_W_5_H_5 /> : <Mic className=STR_W_5_H_5 />}
        </button>
      )}

      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className={`p-3 rounded-lg transition-all ${
          disabled || !input.trim()
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        title="Envoyer le message"
      >
        <Send className=STR_W_5_H_5 />
      </button>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

// Composant principal optimisé
const OptimizedChatInterface = memo(() => {
  const {
    isOpen
    chat
    reflectiveMode
    canProcessInput
    status
    processInput
    clearMemory
    toggleAssistant
    toggleReflectiveMode
  } = useAIAssistant();

  const messagesContainerRef = useRef(null);

  // Messages mémorisés avec indicateur du dernier message
  const messagesWithLastIndicator = useMemo(() => {
    return chat.history.map((message, index) => ({
      ...message
      isLastMessage: index === chat.history.length - 1
    }));
  }, [chat.history]);

  const handleSendMessage = useCallback(async (message) => {
    await processInput(message, true); // Traitement immédiat
  }, [processInput]);

  const handleClearChat = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer la conversation ?
      ')) {
      clearMemory();
    }
  }, [clearMemory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">Alex - Assistant IA</h2>
              <p className="text-sm opacity-90">
                {reflectiveMode ? 'Mode réfléchi activé'  :
       'Mode standard'}
                {status === 'processing' && ' • Traitement en cours...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleReflectiveMode}
              className={`p-2 rounded-lg transition-all ${
                reflectiveMode
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
              }`}
              title={`${reflectiveMode ? 'Désactiver' : 'Activer'} le mode réfléchi`}
            >
              <Brain className="w-4 h-4" />
            </button>

            <button
              onClick={handleClearChat}
              disabled={chat.messageCount === 0}
              className="p-2 rounded-lg bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Effacer la conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={toggleAssistant}
              className="p-2 rounded-lg bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {chat.messageCount === 0 ?
      (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Bonjour ! Je suis Alex</p>
                <p className="text-sm">
                  {reflectiveMode
                    ? 'Mode réfléchi activé - Je prendrai le temps d\\'analyser vos questions en profondeur.'
                     :
       'Posez-moi vos questions sur l\\'entrepreneuriat et l\\'innovation.'
                  }
                </p>
              </div>
            </div>
          ) : (
            messagesWithLastIndicator.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLastMessage={message.isLastMessage}
              />
            ))
          )}

          {status === 'processing' && (
            <div className="flex items-center space-x-2 text-gray-500 ml-4">
              <div className="flex space-x-1">
                <div className=STR_W_2_H_2_BG_BLUE_500_ROUNDED_FU></div>
                <div className=STR_W_2_H_2_BG_BLUE_500_ROUNDED_FU style={{ animationDelay: '0.1s' }}></div>
                <div className=STR_W_2_H_2_BG_BLUE_500_ROUNDED_FU style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">Alex réfléchit...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={!canProcessInput}
        />
      </div>
    </div>
  );
});

OptimizedChatInterface.displayName = 'OptimizedChatInterface';

export default OptimizedChatInterface;