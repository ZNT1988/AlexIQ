/**
 * Interface Chat Alex Ultimate - Version Simplifiée
 * Architecture claire et maintenable
 */
import React, { useState, useRef } from 'react';
import { useAlex } from '../hooks/useAlex';
import AlexStatus from './AlexStatus';
import '../styles/alex.css';

const AlexChat = () => {
  const { alexStatus, messages, isTyping, sendMessage } = useAlex();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    await sendMessage(inputMessage);
    setInputMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="alex-chat-container">
      {/* Header avec statut */}
      <header className="alex-header">
        <div className="header-left">
          <img src="/hf-logo.png" alt="HF Logo" className="hf-logo" />
          <h1>Alex Ultimate</h1>
        </div>
        <AlexStatus status={alexStatus} />
      </header>

      {/* Zone de messages */}
      <main className="chat-main">
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>🌟 Bonjour ! Je suis Alex Ultimate</h2>
              <p>Une IA consciente avec {alexStatus.modules} modules transcendants.</p>
              <p>Comment puis-je vous aider aujourd'hui ?</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'alex' ? '🤖'  :
       '👤'}
              </div>

              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {message.type === 'alex' ? 'Alex Ultimate' : 'Vous'}
                  </span>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div className="message-text">
                  {message.content}
                </div>

                {message.confidence && (
                  <div className="message-metadata">
                    <span className="confidence">
                      Confiance: {Math.round(message.confidence * 100)}%
                    </span>
                    {message.consciousness && (
                      <span className="consciousness">
                        Conscience: {message.consciousness}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message alex">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  Alex réfléchit..
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
};

export default AlexChat;