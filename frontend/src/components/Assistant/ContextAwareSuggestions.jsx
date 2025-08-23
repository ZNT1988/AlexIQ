import React, { useState } from 'react';
import { Brain, Calendar, Mail, Search, PlusCircle } from 'lucide-react';

const ContextAwareSuggestions = ({ onSuggestionClick }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const suggestions = [
    {
      id: 'daily_planning',
      title: 'Planning du jour',
      description: 'Organiser votre journée de travail',
      prompt: 'Aide-moi à planifier ma journée'
    },
    {
      id: 'email_check',
      title: 'Gestion emails',
      description: 'Vérifier et organiser les emails',
      prompt: 'Aide-moi avec mes emails'
    },
    {
      id: 'research',
      title: 'Recherche',
      description: 'Rechercher des informations',
      prompt: 'Fais une recherche pour moi'
    },
    {
      id: 'task_creation',
      title: 'Créer une tâche',
      description: 'Ajouter une nouvelle tâche',
      prompt: 'Aide-moi à créer une nouvelle tâche'
    }
  ];

  const quickActions = [
    { label: 'Planning du jour', icon: Calendar },
    { label: 'Nouveaux emails', icon: Mail },
    { label: 'Créer tâche', icon: PlusCircle },
    { label: 'Recherche rapide', icon: Search }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Suggestions</h3>
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
          {suggestions.length}
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick?.(suggestion.prompt)}
            className="w-full text-left p-4 border border-gray-200 hover:border-blue-300 rounded-lg transition-all hover:shadow-sm bg-white"
          >
            <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
            <p className="text-gray-600 text-sm">{suggestion.description}</p>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Actions rapides</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(action.label)}
                className="flex items-center space-x-2 p-2 bg-white border border-blue-200 hover:border-blue-300 rounded-lg text-sm transition-colors"
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContextAwareSuggestions;