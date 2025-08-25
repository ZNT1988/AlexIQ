import React from 'react';
import { Calendar, Mail, Search, CheckCircle, Clock, Lightbulb } from 'lucide-react';

const SmartSuggestions = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      id: 'daily_planning',
      icon: Calendar,
      title: 'Planifier ma journée',
      description: 'Organiser les tâches du jour',
      prompt: 'Aide-moi à planifier ma journée'
    },
    {
      id: 'email_check',
      icon: Mail,
      title: 'Vérifier mes emails',
      description: 'Consulter les nouveaux messages',
      prompt: 'Aide-moi avec mes emails'
    },
    {
      id: 'research',
      icon: Search,
      title: 'Faire une recherche',
      description: 'Trouver des informations',
      prompt: 'Je veux faire une recherche'
    },
    {
      id: 'create_task',
      icon: CheckCircle,
      title: 'Créer une tâche',
      description: 'Ajouter une nouvelle tâche',
      prompt: 'Aide-moi à créer une tâche'
    }
  ];

  const quickCommands = [
    { icon: Calendar, text: 'Calendrier' },
    { icon: Mail, text: 'Emails' },
    { icon: CheckCircle, text: 'Tâches' },
    { icon: Search, text: 'Recherche' },
    { icon: Lightbulb, text: 'Idées' },
    { icon: Clock, text: 'Planning' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={suggestion.id}
                onClick={() => onSuggestionClick(suggestion.prompt)}
                className="p-4 text-left border border-gray-200 hover:border-blue-300 rounded-lg transition-all hover:shadow-sm bg-white"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickCommands.map((command, index) => {
            const Icon = command.icon;
            return (
              <button
                key={index}
                onClick={() => onSuggestionClick(command.text)}
                className="p-3 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all text-center"
              >
                <Icon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-900">{command.text}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Conseils d'utilisation</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Utilisez des phrases complètes pour de meilleurs résultats</p>
          <p>• Soyez spécifique dans vos demandes</p>
          <p>• N'hésitez pas à poser des questions de suivi</p>
        </div>
      </div>
    </div>
  );
};

export default SmartSuggestions;