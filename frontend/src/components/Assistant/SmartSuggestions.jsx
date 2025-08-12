// Système de Suggestions Intelligentes - HustleFinderIA
// Suggestions contextuelles et prédictives pour améliorer l'UX

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Clock, Users, Search, Zap, TrendingUp, MessageSquare, Target, Lightbulb, CheckCircle, Star, ArrowRight, Sparkles } from 'lucide-react';

const SmartSuggestions = ({ onSuggestionClick, context = {}, userActivity = {} }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [smartActions, setSmartActions] = useState([]);
  const [quickCommands, setQuickCommands] = useState([]);
  const [contextualHelp, setContextualHelp] = useState([]);

  useEffect(() => {
    generateSmartSuggestions();
    generateQuickCommands();
    generateContextualHelp();
  }, [context, userActivity]);

  const generateSmartSuggestions = () => {
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const suggestions = [];

    // Suggestions basées sur l'heure
    if (currentHour >= 9 && currentHour <= 11) {
      suggestions.push({
        id: 'morning_planning'
        icon: Calendar
        title: "Planifier ma journée"
        description: "Organiser les tâches et réunions du jour"
        prompt: "Aide-moi à planifier ma journée de travail"
        priority: STR_HIGH
        category: STR_PRODUCTIVITY
        color: 'blue'
      });
    }

    if (currentHour >= 14 && currentHour <= 16) {
      suggestions.push({
        id: 'afternoon_focus'
        icon: Target
        title: "Optimiser mon après-midi"
        description: "Prioriser les tâches importantes"
        prompt: "Comment optimiser ma productivité cet après-midi ?"
        priority: STR_MEDIUM
        category: STR_PRODUCTIVITY
        color: 'purple'
      });
    }

    // Suggestions basées sur le jour de la semaine
    if (dayOfWeek === 1) { // Lundi
      suggestions.push({
        id: 'week_planning'
        icon: TrendingUp
        title: "Planification hebdomadaire"
        description: "Définir les objectifs de la semaine"
        prompt: "Aide-moi à planifier ma semaine de travail"
        priority: STR_HIGH
        category: 'planning'
        color: 'green'
      });
    }

    if (dayOfWeek === 5) { // Vendredi
      suggestions.push({
        id: 'week_review'
        icon: CheckCircle
        title: "Bilan de la semaine"
        description: "Faire le point sur les accomplissements"
        prompt: "Faisons le bilan de ma semaine de travail"
        priority: STR_MEDIUM
        category: 'review'
        color: 'orange'
      });
    }

    // Suggestions contextuelles
    if (context.lastAction === 'email') {
      suggestions.push({
        id: 'email_followup'
        icon: Mail
        title: "Suivi d'emails"
        description: "Gérer les emails en attente de réponse"
        prompt: "Aide-moi avec le suivi de mes emails importants"
        priority: STR_MEDIUM
        category: 'communication'
        color: 'blue'
      });
    }

    if (context.upcomingMeetings > 0) {
      suggestions.push({
        id: 'meeting_prep'
        icon: Users
        title: "Préparer mes réunions"
        description: "Préparer l'agenda et les documents"
        prompt: "Aide-moi à préparer mes prochaines réunions"
        priority: STR_HIGH
        category: 'meetings'
        color: 'indigo'
      });
    }

    // Suggestions basées sur l'activité utilisateur
    if (userActivity.tasksCompleted > 5) {
      suggestions.push({
        id: 'productivity_boost'
        icon: Zap
        title: "Booster ma productivité"
        description: "Vous êtes productif ! Optimisons encore plus"
        prompt: "Comment puis-je être encore plus productif ?"
        priority: STR_MEDIUM
        category: 'optimization'
        color: 'yellow'
      });
    }

    setSuggestions(suggestions.slice(0, 6)); // Limiter à 6 suggestions
  };

  const generateQuickCommands = () => {
    const commands = [
      {
        id: 'schedule_meeting'
        icon: Calendar
        text: "Programmer une réunion"
        shortcut: "⌘ + M"
        category: 'calendar'
      }
      {
        id: 'check_email'
        icon: Mail
        text: "Vérifier mes emails"
        shortcut: "⌘ + E"
        category: 'email'
      }
      {
        id: 'create_task'
        icon: CheckCircle
        text: "Créer une tâche"
        shortcut: "⌘ + T"
        category: 'tasks'
      }
      {
        id: 'search_info'
        icon: Search
        text: "Rechercher des infos"
        shortcut: "⌘ + F"
        category: 'research'
      }
      {
        id: 'generate_idea'
        icon: Lightbulb
        text: "Générer une idée"
        shortcut: "⌘ + I"
        category: 'creativity'
      }
      {
        id: 'optimize_schedule'
        icon: Clock
        text: "Optimiser mon planning"
        shortcut: "⌘ + O"
        category: STR_PRODUCTIVITY
      }
    ];

    setQuickCommands(commands);
  };

  const generateContextualHelp = () => {
    const help = [
      {
        id: 'voice_commands'
        title: "Commandes vocales"
        description: "Utilisez le bouton micro pour des commandes mains-libres"
        example: "Dites 'Planifie une réunion demain à 14h'"
        icon: MessageSquare
      }
      {
        id: 'smart_scheduling'
        title: "Planification intelligente"
        description: "L'IA trouve automatiquement les meilleurs créneaux"
        example: "Demandez 'Trouve un créneau d'1h cette semaine'"
        icon: Calendar
      }
      {
        id: 'email_management'
        title: "Gestion d'emails"
        description: "Rédaction et priorisation automatiques"
        example: "Dites 'Rédige une réponse professionnelle'"
        icon: Mail
      }
      {
        id: 'research_assistant'
        title: "Assistant de recherche"
        description: "Recherche et synthèse d'informations"
        example: "Demandez 'Recherche sur l'IA quantique'"
        icon: Search
      }
    ];

    setContextualHelp(help);
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick(suggestion.prompt);
  };

  const handleQuickCommandClick = (command) => {
    const prompts = {
      schedule_meeting: "Je veux programmer une nouvelle réunion"
      check_email: "Peux-tu vérifier mes nouveaux emails ?"
      create_task: "Aide-moi à créer une nouvelle tâche"
      search_info: "Je veux faire une recherche d'informations"
      generate_idea: "Génère-moi une nouvelle idée business"
      optimize_schedule: "Optimise mon planning de la journée"
    };

    onSuggestionClick(prompts[command.id]);
  };

  return (
    <div className="space-y-6">

      {/* Suggestions intelligentes principales */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Suggestions pour vous</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {suggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <motion.button
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`p-4 text-left border-2 border-gray-200 hover:border-${suggestion.color}-300 rounded-xl transition-all group hover:shadow-lg bg-white`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 bg-${suggestion.color}-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-${suggestion.color}-200 transition-colors`}>
                        <Icon className={`w-5 h-5 text-${suggestion.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{suggestion.title}</h4>
                          {suggestion.priority === STR_HIGH && (
                            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 bg-${suggestion.color}-100 text-${suggestion.color}-700 rounded-full capitalize`}>
                            {suggestion.category}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Commandes rapides */}
      <div>
        <h3 className=STR_TEXT_LG_FONT_SEMIBOLD_TEXT_GRA>Commandes rapides</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickCommands.map((command) => {
            const Icon = command.icon;
            return (
              <motion.button
                key={command.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickCommandClick(command)}
                className="p-4 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all group"
              >
                <Icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600 mx-auto mb-2 transition-colors" />
                <p className="text-xs font-medium text-gray-900 text-center mb-1">
                  {command.text}
                </p>
                <p className="text-xs text-gray-500 text-center">
                  {command.shortcut}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Aide contextuelle */}
      <div>
        <h3 className=STR_TEXT_LG_FONT_SEMIBOLD_TEXT_GRA>💡 Conseils d'utilisation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contextualHelp.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                    <p className="text-xs text-blue-700 italic">
                      💬 {tip.example}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Suggestions basées sur l'historique */}
      <div>
        <h3 className=STR_TEXT_LG_FONT_SEMIBOLD_TEXT_GRA>📈 Basé sur votre activité</h3>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Votre productivité aujourd'hui</h4>
              <p className="text-sm text-gray-600">
                {userActivity.tasksCompleted || 0} tâches terminées •
                {userActivity.meetingsAttended || 0} réunions •
                {userActivity.emailsProcessed || 0} emails traités
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSuggestionClick("Montre-moi un résumé de ma productivité aujourd'hui")}
              className="text-xs bg-white border border-green-300 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
            >
              📊 Voir mes statistiques
            </button>
            <button
              onClick={() => onSuggestionClick("Comment puis-je améliorer ma productivité demain ?")}
              className="text-xs bg-white border border-blue-300 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
            >
              🚀 Optimiser demain
            </button>
            <button
              onClick={() => onSuggestionClick("Planifie ma journée de demain")}
              className="text-xs bg-white border border-purple-300 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors"
            >
              📅 Planifier demain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestions;