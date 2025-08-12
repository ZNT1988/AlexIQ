
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

// Rendu Avancé des Messages - HustleFinderIA
// Composant pour affichage sophistiqué des messages avec formatage intelligent

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Share, MoreHorizontal, Edit3, RotateCcw, Download, Volume2, VolumeX, User, Bot, Zap, Code, Star, Bookmark } from 'lucide-react';
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const MessageRenderer = ({
  message
  onAction
  onReact
  onEdit
  onCopy
  onRegenerate
  isBot = false
  showActions = true
  showTimestamp = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || []);
  const messageRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Détection du type de contenu
  const detectContentType = (content) => {
    if (content.includes('```')) return 'code';
    if (content.match(/\b(https?:\/\/[^\s]+)\b/g)) return 'link';
    if (content.match(/\b\d{4}-\d{2}-\d{2}\b/)) return 'date';
    if (content.match(/\b\d{1,2}:\d{2}\b/)) return 'time';
    if (content.length > 500) return 'long';
    return 'text';
  };

  // Formatage intelligent du contenu
  const formatContent = (content) => {
    let formatted = content;

    // Formatage des liens
    formatted = formatted.replace(
      /\b(https?:\/\/[^\s]+)\b/g
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">$1</a>'
    );

    // Formatage du code inline
    formatted = formatted.replace(
      /'([^']+)`/g
      '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
    );

    // Formatage du texte en gras
    formatted = formatted.replace(
      /\*\*([^*]+)\*\*/g
      '<strong class="font-semibold">$1</strong>'
    );

    // Formatage du texte en italique
    formatted = formatted.replace(
      /\*([^*]+)\*/g
      '<em class="italic">$1</em>'
    );

    // Formatage des dates
    formatted = formatted.replace(
      /\b(\d{4}-\d{2}-\d{2})\b/g
      '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">📅 $1</span>'
    );

    // Formatage des heures
    formatted = formatted.replace(
      /\b(\d{1,2}:\d{2})\b/g
      '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">🕐 $1</span>'
    );

    return formatted;
  };

  // Extraction des blocs de code
  const extractCodeBlocks = (content) => {
    const codeBlocks = [];
    const codeRegex = /``'(\w+)?
      \n([\s\S]*?)'``/g;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      codeBlocks.push({
        language :
       match[1] || 'text'
        code: match[2].trim()
        fullMatch: match[0]
      });
    }

    return codeBlocks;
  };

  // Synthèse vocale
  const speakMessage = () => {
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      speechSynthesis.speak(utterance);
    }
  };

  // Copie vers le presse-papiers
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      onCopy && onCopy(message.id);
      // Toast notification ici
    } catch (error) {
      try {
      logger.error('Failed to copy message:', error);

      } catch (error) {
    // Logger fallback - ignore error
  }}
  };

  // Gestion des réactions
  const handleReaction = (type) => {
    const existingReaction = reactions.find(r => r.type === type);
    let newReactions;

    if (existingReaction) {
      newReactions = reactions.filter(r => r.type !== type);
    } else {
      newReactions = [...reactions, { type, count: 1, timestamp: new Date() }];
    }

    setReactions(newReactions);
    onReact && onReact(message.id, type);
  };

  // Export du message
  const exportMessage = () => {
    const messageData = {
      content: message.content
      timestamp: message.timestamp
      type: message.type
      author: isBot ? 'Assistant IA' : 'Utilisateur'
    };

    const blob = new Blob([JSON.stringify(messageData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${message.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const contentType = detectContentType(message.content);
  const codeBlocks = contentType === 'code' ? extractCodeBlocks(message.content) : [];
  const isLongMessage = message.content.length > 300;

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group relative ${isBot ? 'ml-0 mr-12' : 'ml-12 mr-0'}`}
    >
      <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start space-x-3 ${isBot ? '' : 'space-x-reverse'}`}>

        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBot
            ? 'bg-gradient-to-r from-blue-500 to-purple-600'
            : 'bg-blue-600'
        }`}>
          {isBot ? (
            <Bot className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Contenu du message */}
        <div className="flex-1 min-w-0">
          <div className={`relative rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-gray-50 rounded-bl-md'
              : 'bg-blue-600 text-white rounded-br-md'
          } ${isLongMessage && !isExpanded ? 'max-h-32 overflow-hidden' : ''}`}>

            {/* Métadonnées du message */}
            {message.intent && isBot && (
              <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-200">
                <Zap className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">
                  Intention: {message.intent}
                </span>
                {message.confidence && (
                  <span className="text-xs text-gray-500">
                    ({Math.round(message.confidence * 100)}%)
                  </span>
                )}
              </div>
            )}

            {/* Contenu principal */}
            <div className="space-y-3">
              {codeBlocks.length > 0 ?
      (
                // Rendu des blocs de code
                <div className="space-y-3">
                  {codeBlocks.map((block, index) => (
                    <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between bg-gray-800 px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <Code className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-300 font-mono uppercase">
                            {block.language}
                          </span>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(block.code)}
                          className="text-xs text-gray-400 hover :
      text-white px-2 py-1 rounded"
                        >
                          Copier
                        </button>
                      </div>
                      <pre className="p-3 text-sm text-gray-100 overflow-x-auto">
                        <code>{block.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                // Rendu du texte normal
                <div
                  className={`text-sm leading-relaxed ${isBot ? 'text-gray-900' : 'text-white'}`}
                  dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                />
              )}

              {/* Actions intégrées */}
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => onAction && onAction(action)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Bouton d'expansion pour longs messages */}
              {isLongMessage && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`text-xs ${isBot ? 'text-blue-600' : 'text-blue-200'} hover:underline mt-2`}
                >
                  {isExpanded ? 'Réduire' : 'Voir plus...'}
                </button>
              )}
            </div>

            {/* Overlay de fondu pour longs messages */}
            {isLongMessage && !isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Réactions */}
          {reactions.length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              {reactions.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-xs transition-colors"
                >
                  <span>{reaction.type === 'like' ? '👍' : reaction.type === 'dislike' ? '👎' : '❤️'}</span>
                  <span className="text-gray-600">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Actions du message */}
          {showActions && (
            <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copier"
              >
                <Copy className=STR_W_4_H_4_TEXT_GRAY_500 />
              </button>

              {isBot && (
                <>
                  <button
                    onClick={speakMessage}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Lire à voix haute"
                  >
                    {isReading ? (
                      <VolumeX className=STR_W_4_H_4_TEXT_GRAY_500 />
                    ) : (
                      <Volume2 className=STR_W_4_H_4_TEXT_GRAY_500 />
                    )}
                  </button>

                  <button
                    onClick={() => onRegenerate && onRegenerate(message.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Régénérer"
                  >
                    <RotateCcw className=STR_W_4_H_4_TEXT_GRAY_500 />
                  </button>
                </>
              )}

              <button
                onClick={() => handleReaction('like')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="J'aime"
              >
                <ThumbsUp className=STR_W_4_H_4_TEXT_GRAY_500 />
              </button>

              <button
                onClick={() => handleReaction('dislike')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Je n'aime pas"
              >
                <ThumbsDown className=STR_W_4_H_4_TEXT_GRAY_500 />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Plus d'actions"
                >
                  <MoreHorizontal className=STR_W_4_H_4_TEXT_GRAY_500 />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-40"
                    >
                      <button
                        onClick={() => { exportMessage(); setShowMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Download className=STR_W_4_H_4 />
                        <span>Exporter</span>
                      </button>

                      <button
                        onClick={() => { /* Share logic */; setShowMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Share className=STR_W_4_H_4 />
                        <span>Partager</span>
                      </button>

                      {!isBot && (
                        <button
                          onClick={() => { onEdit && onEdit(message); setShowMenu(false); }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Edit3 className=STR_W_4_H_4 />
                          <span>Modifier</span>
                        </button>
                      )}

                      <hr className="my-1" />

                      <button
                        onClick={() => { /* Mark as important */; setShowMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Star className=STR_W_4_H_4 />
                        <span>Marquer important</span>
                      </button>

                      <button
                        onClick={() => { /* Add to favorites */; setShowMenu(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Bookmark className=STR_W_4_H_4 />
                        <span>Ajouter aux favoris</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Timestamp */}
          {showTimestamp && (
            <div className={`text-xs text-gray-400 mt-2 ${isBot ? 'text-left' : 'text-right'}`}>
              {message.timestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit'
                minute: '2-digit'
              })}
              {message.edited && (
                <span className="ml-1 italic">(modifié)</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageRenderer;