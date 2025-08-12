
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_DEVELOPMENT = 'development';

// Gestionnaire de Conversations - HustleFinderIA
// Système avancé de gestion des conversations avec persistance et mémoire contextuelle

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Archive, Download, Clock, SortAsc, Calendar, Brain, Pin, Eye, Plus, MoreVertical, Hash, TrendingUp, RefreshCw } from 'lucide-react';
const logger = {
  info: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.log('[INFO]', ...args)
  warn: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.warn('[WARN]', ...args)
  error: (...args) => console.error('[ERROR]', ...args)
  debug: (...args) => process.env.NODE_ENV === STR_DEVELOPMENT && console.debug('[DEBUG]', ...args)
};

const ConversationManager = ({
  onSelectConversation
  onNewConversation
  currentConversationId
  onDeleteConversation
  onArchiveConversation
}) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [conversationStats, setConversationStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [folders, setFolders] = useState([]);
  const searchTimeoutRef = useRef(null);

  // Filtres disponibles
  const filters = [
    { id: 'allSTR_LABELToutes', icon: MessageSquare, count: 0 }
    { id: 'starredSTR_LABELFavorites', icon: Star, count: 0 }
    { id: 'pinnedSTR_LABELÉpinglées', icon: Pin, count: 0 }
    { id: 'unreadSTR_LABELNon lues', icon: Eye, count: 0 }
    { id: 'todaySTR_LABELAujourd\'hui', icon: Calendar, count: 0 }
    { id: 'this_weekSTR_LABELCette semaine', icon: Clock, count: 0 }
  ];

  // Options de tri
  const sortOptions = [
    { id: 'recentSTR_LABELPlus récent', icon: Clock }
    { id: 'oldestSTR_LABELPlus ancien', icon: Clock }
    { id: 'alphabeticalSTR_LABELAlphabétique', icon: SortAsc }
    { id: 'lengthSTR_LABELPar longueur', icon: TrendingUp }
    { id: 'importanceSTR_LABELPar importance', icon: Star }
  ];

  useEffect(() => {
    loadConversations();
    loadTags();
    loadFolders();
  }, []);

  useEffect(() => {
    filterAndSortConversations();
  }, [conversations, searchQuery, selectedFilter, sortBy, showArchived]);

  useEffect(() => {
    updateConversationStats();
  }, [conversations]);

  // Chargement des conversations depuis le stockage
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      // Chargement depuis localStorage avec fallback vers API
      const localConversations = localStorage.getItem(STR_HUSTLEFINDER_CONVERSATIONS);
      let conversationData = [];

      if (localConversations) {
        conversationData = JSON.parse(localConversations);
      } else {
        // Fallback vers l'API
        const response = await fetch('/api/assistant/conversations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          conversationData = data.conversations || [];
        }
      }

      // Enrichissement des données de conversation
      const enrichedConversations = conversationData.map(conv => ({
        ...conv
        wordCount: calculateWordCount(conv.messages)
        sentiment: analyzeSentiment(conv.messages)
        topics: extractTopics(conv.messages)
        lastActivity: new Date(conv.updatedAt || conv.timestamp)
        importance: calculateImportance(conv)
      }));

      setConversations(enrichedConversations);
    } catch (error) {
      // Logger fallback - ignore error
    } catch (error) {
    // Logger fallback - ignore error
  }} finally {
      setIsLoading(false);
    }
  };

  // Chargement des tags
  const loadTags = () => {
    const savedTags = localStorage.getItem('conversation_tags');
    if (savedTags) {
      setTags(JSON.parse(savedTags));
    }
  };

  // Chargement des dossiers
  const loadFolders = () => {
    const savedFolders = localStorage.getItem('conversation_folders');
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    }
  };

  // Filtrage et tri des conversations
  const filterAndSortConversations = useCallback(() => {
    let filtered = [...conversations];

    // Filtrage par statut archivé
    if (!showArchived) {
      filtered = filtered.filter(conv => !conv.archived);
    }

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(query) ||
        conv.preview?
      .toLowerCase().includes(query) ||
        conv.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        conv.messages?.some(msg => msg.content.toLowerCase().includes(query))
      );
    }

    // Filtrage par catégorie
    switch (selectedFilter) {
      case 'starred' :
      
        filtered = filtered.filter(conv => conv.starred);
        break;
      case 'pinned':
        filtered = filtered.filter(conv => conv.pinned);
        break;
      case 'unread':
        filtered = filtered.filter(conv => conv.unread);
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(conv =>
          new Date(conv.lastActivity) >= today
        );
        break;
      case 'this_week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(conv =>
          new Date(conv.lastActivity) >= weekAgo
        );
        break;
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        case 'oldest':
          return new Date(a.lastActivity) - new Date(b.lastActivity);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'length':
          return b.wordCount - a.wordCount;
        case 'importance':
          return b.importance - a.importance;
        default:
          return 0;
      }
    });

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, selectedFilter, sortBy, showArchived]);

  // Calcul des statistiques
  const updateConversationStats = () => {
    const stats = {
      total: conversations.length
      starred: conversations.filter(c => c.starred).length
      pinned: conversations.filter(c => c.pinned).length
      unread: conversations.filter(c => c.unread).length
      archived: conversations.filter(c => c.archived).length
      today: conversations.filter(c => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(c.lastActivity) >= today;
      }).length
      thisWeek: conversations.filter(c => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(c.lastActivity) >= weekAgo;
      }).length
    };

    setConversationStats(stats);
  };

  // Analyse de sentiment simple
  const analyzeSentiment = (messages) => {
    const positiveWords = ['bon', 'bien', 'excellent', 'parfait', 'merci', 'super'];
    const negativeWords = ['problème', 'erreur', 'mauvais', 'difficile', 'impossible'];

    let positiveCount = 0;
    let negativeCount = 0;

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      positiveWords.forEach(word => {
        if (content.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (content.includes(word)) negativeCount++;
      });
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  // Extraction des sujets
  const extractTopics = (messages) => {
    const topicWords = new Map();

    messages.forEach(msg => {
      if (msg.type === 'user') { const words = msg.content.toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 4 && !isCommonWord(word));

        words.forEach(word => {
          topicWords.set(word, (topicWords.get(word) || 0) + 1);
        ; return; });
      }
    });

    return Array.from(topicWords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((_) => word);
  };

  // Mots communs à ignorer
  const isCommonWord = (word) => {
    const common = ['pour', 'avec', 'dans', 'tout', 'mais', 'donc', 'cette', 'vous', 'elle', 'nous'];
    return common.includes(word);
  };

  // Calcul du nombre de mots
  const calculateWordCount = (messages) => {
    return messages.reduce((total, msg) => {
      return total + msg.content.split(/\s+/).length;
    }, 0);
  };

  // Calcul de l'importance
  const calculateImportance = (conv) => {
    let score = 0;
    if (conv.starred) score += 3;
    if (conv.pinned) score += 2;
    if (conv.messages?
      .length > 10) score += 2;
    if (conv.wordCount > 500) score += 1;
    return score;
  };

  // Gestion de la recherche avec debounce
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Analytics de recherche
      if (query.trim()) {
        trackSearchQuery(query);
      }
    }, 500);
  };

  // Suivi des requêtes de recherche
  const trackSearchQuery = (query) => {
    const searches = JSON.parse(localStorage.getItem('search_queries') || '[]');
    searches.unshift({ query, timestamp :
       new Date() });
    localStorage.setItem('search_queries', JSON.stringify(searches.slice(0, 50)));
  };

  // Actions sur les conversations
  const handleConversationAction = (action, conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    switch (action) {
      case 'star':
        updateConversation(conversationId, { starred: !conversation.starred });
        break;
      case 'pin':
        updateConversation(conversationId, { pinned: !conversation.pinned });
        break;
      case 'archive':
        updateConversation(conversationId, { archived: true });
        onArchiveConversation && onArchiveConversation(conversationId);
        break;
      case 'delete':
        deleteConversation(conversationId);
        break;
      case 'mark_read':
        updateConversation(conversationId, { unread: false });
        break;
    }
  };

  // Mise à jour d'une conversation
  const updateConversation = (id, updates) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id
          ? { ...conv, ...updates, updatedAt: new Date().toISOString() }
          : conv
      )
    );

    // Sauvegarde dans localStorage
    const updated = conversations.map(conv =>
      conv.id === id ? { ...conv, ...updates } : conv
    );
    localStorage.setItem(STR_HUSTLEFINDER_CONVERSATIONS, JSON.stringify(updated));
  };

  // Suppression d'une conversation
  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));

    const updated = conversations.filter(conv => conv.id !== id);
    localStorage.setItem(STR_HUSTLEFINDER_CONVERSATIONS, JSON.stringify(updated));

    onDeleteConversation && onDeleteConversation(id);
  };

  // Export des conversations
  const exportConversations = (format = 'json') => {
    const data = selectedConversations.size > 0
      ? conversations.filter(c => selectedConversations.has(c.id))
      : filteredConversations;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversations-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Formatage de la date relative
  const formatRelativeDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours';
    if (days < 30) return 'Il y a ${Math.floor(days / 7)} semaines`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  // Rendu du sentiment avec emoji
  const renderSentiment = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-gray-600">Chargement des conversations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">

      {/* Header avec recherche et actions */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
            Conversations
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {filteredConversations.length}
            </span>
          </h2>

          <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
            <button
              onClick={() => onNewConversation && onNewConversation()}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle</span>
            </button>

            {selectedConversations.size > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="hidden sm:inline">{selectedConversations.size}</span>
              </button>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher dans les conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtres et tri */}
        <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => {
              const Icon = filter.icon;
              const count = conversationStats[filter.id] || 0;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{filter.label}</span>
                  {count > 0 && (
                    <span className="bg-gray-300 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions groupées */}
      <AnimatePresence>
        {showBulkActions && selectedConversations.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-50 border-b border-yellow-200 p-3"
          >
            <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
              <span className="text-sm text-yellow-800">
                {selectedConversations.size} conversation(s) sélectionnée(s)
              </span>

              <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
                <button
                  onClick={() => exportConversations()}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Exporter
                </button>

                <button
                  onClick={() => {
                    selectedConversations.forEach(id => handleConversationAction('archive', id));
                    setSelectedConversations(new Set());
                  }}
                  className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                >
                  <Archive className="w-4 h-4 inline mr-1" />
                  Archiver
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ?
      (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Aucune conversation trouvée</p>
            <p className="text-sm">
              {searchQuery ? 'Essayez avec d\'autres mots-clés'  :
       'Commencez une nouvelle conversation'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            <AnimatePresence>
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                    currentConversationId === conversation.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
                  }`}
                  onClick={() => onSelectConversation && onSelectConversation(conversation)}
                >
                  <div className="flex items-start space-x-3">

                    {/* Checkbox de sélection */}
                    <input
                      type="checkbox"
                      checked={selectedConversations.has(conversation.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newSelected = new Set(selectedConversations);
                        if (e.target.checked) {
                          newSelected.add(conversation.id);
                        } else {
                          newSelected.delete(conversation.id);
                        }
                        setSelectedConversations(newSelected);
                      }}
                      className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    />

                    {/* Indicateurs visuels */}
                    <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                      {conversation.pinned && <Pin className="w-3 h-3 text-orange-500" />}
                      {conversation.starred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                      {conversation.unread && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      <span className="text-xs">{renderSentiment(conversation.sentiment)}</span>
                    </div>

                    {/* Contenu de la conversation */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.title}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatRelativeDate(conversation.lastActivity)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {conversation.preview || 'Aucun aperçu disponible'}
                      </p>

                      {/* Métadonnées */}
                      <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{conversation.messages?
      .length || 0} messages</span>
                          <span>•</span>
                          <span>{conversation.wordCount} mots</span>
                          {conversation.importance > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {conversation.importance}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Tags */}
                        {conversation.tags && conversation.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {conversation.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                              >
                                <Hash className="w-2 h-2 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sujets extraits */}
                      {conversation.topics && conversation.topics.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Brain className="w-3 h-3 text-purple-500" />
                          <span className="text-xs text-purple-600">
                            {conversation.topics.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Menu d'actions */}
                    <div className="opacity-0 group-hover :
      opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Afficher menu contextuel
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer avec statistiques */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Total: {conversationStats.total}</span>
            <span>Aujourd'hui: {conversationStats.today}</span>
            <span>Cette semaine: {conversationStats.thisWeek}</span>
          </div>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center space-x-1 hover:text-gray-700"
          >
            <Archive className="w-3 h-3" />
            <span>{showArchived ? 'Masquer' : 'Voir'} archivées</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationManager;