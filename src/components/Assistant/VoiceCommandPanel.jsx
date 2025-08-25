import React, { useState } from 'react';
import { Mic, MicOff, Settings } from 'lucide-react';

const VoiceCommandPanel = ({ onCommand, onToggleListening, isListening, isProcessing }) => {
  const [lastCommand, setLastCommand] = useState('');

  const toggleVoiceRecognition = () => {
    onToggleListening();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleVoiceRecognition}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              disabled={isProcessing}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>

            <div>
              <h3 className="text-lg font-semibold text-white">
                {isListening ? 'Écoute en cours...' : 'Assistant Vocal'}
              </h3>
              <p className="text-gray-400 text-sm">
                {isProcessing ? 'Traitement...' : 'Cliquez pour parler'}
              </p>
            </div>
          </div>

          <button
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Paramètres vocaux"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {lastCommand && (
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-white text-sm">Dernière commande: "{lastCommand}"</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Conseils d'utilisation
        </h4>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• Parlez clairement et à un rythme normal</p>
          <p>• Utilisez des phrases complètes et précises</p>
          <p>• Évitez les bruits de fond</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandPanel;