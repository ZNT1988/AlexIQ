// Suggestions Contextuelles Intelligentes - HustleFinderIA
// Système de suggestions adaptatives basées sur le contexte et l'historique

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Mail, Search, Users, TrendingUp, Target, Zap, Brain, Star, ArrowRight, Filter, Sparkles, BarChart3, MessageSquare, CheckCircle, Briefcase, Settings, PlusCircle, RefreshCw } from 'lucide-react';

const ContextAwareSuggestions = ({
  context = {}
      userActivity = {}
      conversationHistory = []
      currentTime = new Date()
      onSuggestionClick
      onCustomSuggestion
}) => {
  const [suggestions
      setSuggestions] = useState([]);
  const [filteredSuggestions
      setFilteredSuggestions] = useState([]);
  const [selectedCategory
      setSelectedCategory] = useState('all');
  const [showAdvanced
      setShowAdvanced] = useState(false);
  const [userPreferences
      setUserPreferences] = useState({});
  const [recentActions, setRecentActions] = useState([]);

  // Catégories de suggestions
  const categories = [
    { id: 'allSTR_LABELToutes', icon: Sparkles, color: 'purple' }
    { id: 'productivitySTR_LABELProductivité', icon: Zap, color: 'yellow' }
    { id: 'calendarSTR_LABELCalendrier', icon: Calendar, color: 'blue' }
    { id: 'communicationSTR_LABELCommunication', icon: MessageSquare, color: 'green' }
    { id: 'researchSTR_LABELRecherche', icon: Search, color: 'orange' }
    { id: 'analysisSTR_LABELAnalyse', icon: BarChart3, color: 'indigo' }
    { id: 'automationSTR_LABELAutomatisation', icon: Settings, color: 'gray' }
  ];

  useEffect(() => {
    generateContextualSuggestions();
    loadUserPreferences();
    trackUserActivity();
  }, [context, userActivity, conversationHistory, currentTime]);

  useEffect(() => {
    filterSuggestions();
  }, [suggestions, selectedCategory]);

  // Génération des suggestions basées sur le contexte
  const generateContextualSuggestions = () => {
    const newSuggestions = [];
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Suggestions temporelles
    if (hour >= 8 && hour <= 10 && !isWeekend) {
      newSuggestions.push({
        id: 'morning_routine'
        category: STR_PRODUCTIVITY
        priority: STR_HIGH
        title: 'Routine matinale'
        description: 'Planifier et optimiser votre début de journée'
        prompt: 'Aide-moi à organiser ma matinée pour être plus productif'
        icon: Clock
        color: 'blueSTR_CONFIDENCE_0_9_CONTEXTtemporal'
        keywords: ['planning', 'matinée', 'productivité']
      });
    }

    if (hour >= 12 && hour <= 14) {
      newSuggestions.push({
        id: 'lunch_planning'
        category: STR_PRODUCTIVITY
        priority: STR_MEDIUM
        title: 'Pause déjeuner productive'
        description: 'Optimiser votre pause pour l\'après-midi'
        prompt: 'Suggère-moi des activités productives pour ma pause déjeuner'
        icon: Target
        color: 'greenSTR_CONFIDENCE_0_7_CONTEXTtemporal'
      });
    }

    if (hour >= 17 && hour <= 19) {
      newSuggestions.push({
        id: 'end_day_review'
        category: STR_PRODUCTIVITY
        priority: STR_HIGH
        title: 'Bilan de journée'
        description: 'Faire le point sur les accomplissements du jour'
        prompt: 'Aide-moi à faire le bilan de ma journée de travail'
        icon: CheckCircle
        color: 'purple'
        confidence: 0.8
        context: 'temporal'
      });
    }

    // Suggestions basées sur l'activité récente
    if (context.lastAction === 'email_read') {
      newSuggestions.push({
        id: 'email_followup'
        category: 'communication'
        priority: STR_HIGH
        title: 'Suivi d\'emails'
        description: 'Organiser les réponses et actions nécessaires'
        prompt: 'Aide-moi à prioriser et répondre à mes emails importants'
        icon: Mail
        color: 'blueSTR_CONFIDENCE_0_9_CONTEXTactivity'
      });
    }

    if (context.upcomingMeetings > 0) {
      newSuggestions.push({
        id: 'meeting_prep'
        category: 'calendar'
        priority: STR_HIGH
        title: 'Préparation de réunions'
        description: 'Préparer efficacement vos prochaines réunions'
        prompt: 'Aide-moi à préparer mes prochaines réunions avec un agenda détaillé'
        icon: Users
        color: 'indigo'
        confidence: 0.95
        context: 'calendar'
      });
    }

    // Suggestions basées sur l'historique des conversations
    const recentTopics = extractTopicsFromHistory(conversationHistory);
    recentTopics.forEach(topic => {
      if (topic.frequency > 2) {
        newSuggestions.push({
          id: `followup_${topic.name}'
          category: 'research'
          priority: STR_MEDIUM
          title: 'Approfondissement: ${topic.name}'
          description: 'Continuer l'exploration du sujet ${topic.name}'
          prompt: 'Donne-moi plus d'informations sur ${topic.name} et les dernières nouveautés`
          icon: Search
          color: 'orange'
          confidence: 0.6
          context: 'history'
          relatedTopic: topic.name
        });
      }
    });

    // Suggestions basées sur la productivité
    if (userActivity.tasksCompleted > 5) {
      newSuggestions.push({
        id: 'productivity_boost'
        category: STR_PRODUCTIVITY
        priority: STR_MEDIUM
        title: 'Optimisation avancée'
        description: 'Vous êtes productif ! Allons plus loin'
        prompt: 'Comment puis-je automatiser davantage mes tâches répétitives ?'
        icon: Zap
        color: 'yellow'
        confidence: 0.8
        context: 'performance'
      });
    }

    // Suggestions de jour de la semaine
    if (dayOfWeek === 1) {
      newSuggestions.push({
        id: 'week_planning'
        category: STR_PRODUCTIVITY
        priority: STR_HIGH
        title: 'Planification hebdomadaire'
        description: 'Structurer votre semaine pour le succès'
        prompt: 'Aide-moi à planifier ma semaine de travail avec des objectifs clairs'
        icon: Calendar
        color: 'blueSTR_CONFIDENCE_0_9_CONTEXTweekly'
      });
    }

    if (dayOfWeek === 5) {
      newSuggestions.push({
        id: 'week_review'
        category: 'analysis'
        priority: STR_MEDIUM
        title: 'Analyse de la semaine'
        description: 'Évaluer les progrès et planifier la suite'
        prompt: 'Faisons le bilan de ma semaine et planifions les améliorations'
        icon: TrendingUp
        color: 'green'
        confidence: 0.8
        context: 'weekly'
      });
    }

    // Suggestions d'automatisation
    if (detectRepetitiveTasks(userActivity)) {
      newSuggestions.push({
        id: 'automation_setup'
        category: 'automation'
        priority: STR_MEDIUM
        title: 'Automatisation intelligente'
        description: 'Identifier et automatiser les tâches répétitives'
        prompt: 'Quelles tâches puis-je automatiser pour gagner du temps ?'
        icon: Settings
        color: 'graySTR_CONFIDENCE_0_7_CONTEXTautomation'
      });
    }

    // Suggestions de recherche intelligente
    if (context.currentProject) {
      newSuggestions.push({
        id: 'project_research'
        category: 'research'
        priority: STR_MEDIUM
        title: 'Recherche projet'
        description: `Informations pour ${context.currentProject}'
        prompt: 'Recherche les dernières informations et tendances pour le projet ${context.currentProject}`
        icon: Briefcase
        color: 'indigo'
        confidence: 0.8
        context: 'project'
      });
    }

    // Suggestions personnalisées basées sur les préférences
    if (userPreferences.preferredWorkStyle === 'analytical') {
      newSuggestions.push({
        id: 'data_analysis'
        category: 'analysis'
        priority: STR_MEDIUM
        title: 'Analyse de données'
        description: 'Exploiter les données pour des insights'
        prompt: 'Aide-moi à analyser mes données de performance et identifier des patterns'
        icon: BarChart3
        color: 'blueSTR_CONFIDENCE_0_7_CONTEXTpreference'
      });
    }

    setSuggestions(newSuggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.confidence - a.confidence;
    }));
  };

  // Extraction des sujets de l'historique
  const extractTopicsFromHistory = (history) => {
    const topicMap = new Map();

    history.forEach(message => {
      if (message.type === 'user') { const words = message.content.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 4 && !isCommonWord(word)) {
            const count = topicMap.get(word) || 0;
            topicMap.set(word, count + 1);
          ; return; }
        });
      }
    });

    return Array.from(topicMap.entries())
      .map(([name, frequency]) => ({ name, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  };

  // Détection des tâches répétitives
  const detectRepetitiveTasks = (activity) => {
    return activity.repeatedActions && activity.repeatedActions.length > 3;
  };

  // Mots communs à ignorer
  const isCommonWord = (word) => {
    const commonWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'entre'];
    return commonWords.includes(word);
  };

  // Filtrage des suggestions
  const filterSuggestions = () => {
    if (selectedCategory === 'all') {
      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions(suggestions.filter(s => s.category === selectedCategory));
    }
  };

  // Chargement des préférences utilisateur
  const loadUserPreferences = () => {
    const saved = localStorage.getItem('user_preferences');
    if (saved) {
      setUserPreferences(JSON.parse(saved));
    }
  };

  // Suivi de l'activité utilisateur
  const trackUserActivity = () => {
    const activity = {
      timestamp: new Date()
      context: context
      suggestionsShown: suggestions.length
    };

    setRecentActions(prev => [activity, ...prev.slice(0, 9)]);
  };

  // Gestion du clic sur suggestion
  const handleSuggestionClick = (suggestion) => {
    // Enregistrer l'utilisation de la suggestion
    const usage = {
      suggestionId: suggestion.id
      timestamp: new Date()
      context: suggestion.context
    };

    const savedUsage = JSON.parse(localStorage.getItem('suggestion_usage') || '[]');
    localStorage.setItem('suggestion_usage', JSON.stringify([usage, ...savedUsage.slice(0, 99)]));

    onSuggestionClick(suggestion.prompt);
  };

  // Suggestions personnalisées calculées
  const personalizedSuggestions = useMemo(() => {
    return filteredSuggestions.map(suggestion => ({
      ...suggestion
      relevanceScore: calculateRelevanceScore(suggestion)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [filteredSuggestions, context, userActivity]);

  // Calcul du score de pertinence
  const calculateRelevanceScore = (suggestion) => {
    let score = suggestion.confidence;

    // Bonus pour priorité élevée
    if (suggestion.priority === STR_HIGH) score += 0.2;
    if (suggestion.priority === STR_MEDIUM) score += 0.1;

    // Bonus pour contexte temporel
    if (suggestion.context === 'temporal') score += 0.15;

    // Bonus pour activité récente
    if (suggestion.context === 'activity') score += 0.1;

    return Math.min(score, 1);
  };

  return (
    <div className="space-y-6">

      {/* Header avec filtres */}
      <div className="flex items-center justify-between">
        <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
          <Brain className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Suggestions intelligentes</h3>
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
            {personalizedSuggestions.length}
          </span>
        </div>

        <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <Filter className="w-4 h-4" />
            <span>Avancé</span>
          </button>

          <button
            onClick={generateContextualSuggestions}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ?
      '${bg-${category.color}-100 text-${category.color}-700 border border-${category.color}-300}'
                   :
       'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Suggestions principales */}
      <div className="space-y-4">
        <AnimatePresence>
          {personalizedSuggestions.slice(0, showAdvanced ? 12 : 6).map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left p-4 border-2 border-gray-200 hover:border-${suggestion.color}-300 rounded-xl transition-all group-hover:shadow-lg bg-white`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-${suggestion.color}-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-${suggestion.color}-200 transition-colors`}>
                      <Icon className={`w-6 h-6 text-${suggestion.color}-600`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                        <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
                          {suggestion.priority === STR_HIGH && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className={`text-xs px-2 py-1 bg-${suggestion.color}-100 text-${suggestion.color}-700 rounded-full`}>
                            {Math.round(suggestion.relevanceScore * 100)}%
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">{suggestion.description}</p>

                      <div className="flex items-center justify-between">
                        <div className=STR_FLEX_ITEMS_CENTER_SPACE_X_2>
                          <span className={'text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize'}>
                            {suggestion.category}
                          </span>
                          {suggestion.context && (
                            <span className="text-xs text-gray-500">
                              {suggestion.context}
                            </span>
                          )}
                        </div>

                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Suggestions rapides */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-blue-600" />
          Actions rapides
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Planning du jour', action: 'show_today_schedule', icon: Calendar }
            { label: 'Nouveaux emails', action: 'check_emails', icon: Mail }
            { label: 'Créer tâche', action: 'create_task', icon: PlusCircle }
            { label: 'Recherche rapide', action: 'quick_search', icon: Search }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => onSuggestionClick(action.label)}
                className="flex items-center space-x-2 p-2 bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-sm transition-colors"
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Métriques de suggestions */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-50 rounded-xl p-4"
        >
          <h4 className="font-semibold text-gray-900 mb-3">Analyse des suggestions</h4>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{suggestions.length}</div>
              <div className=STR_TEXT_SM_TEXT_GRAY_600>Générées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {suggestions.filter(s => s.priority === STR_HIGH).length}
              </div>
              <div className=STR_TEXT_SM_TEXT_GRAY_600>Priorité haute</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(suggestions.reduce((acc, s) => acc + s.confidence, 0) / suggestions.length * 100)}%
              </div>
              <div className=STR_TEXT_SM_TEXT_GRAY_600>Confiance moyenne</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContextAwareSuggestions;