import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, RefreshCw, Settings } from 'lucide-react';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT = 'block text-sm font-medium text-gray-700 mb-2';
const STR_MR_2 = 'mr-2';
const STR_TEXT_SM = 'text-sm';
const STR_TEXT_PURPLE_600 = 'text-purple-600';
const STR_ML_2_FONT_SEMIBOLD = 'ml-2 font-semibold';

const Generator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setGeneratedContent(`Contenu généré par l'IA basé sur: "${prompt}"\n\nCeci est un exemple de génération de contenu intelligent utilisant nos algorithmes d'IA avancés. Le système analyse votre demande et produit du contenu contextuel et pertinent.\n\nCaractéristiques générées:\n- Analyse sémantique avancée\n- Cohérence contextuelle\n- Optimisation stylistique\n- Pertinence thématique`);
    setIsGenerating(false);
  };

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Sparkles className="inline w-8 h-8 mr-2 text-purple-600" />
          Générateur IA
        </motion.h1>
        <p className="text-gray-600">
          Générez du contenu intelligent avec notre système d'IA avancé
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          className="space-y-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>

            <div className="space-y-4">
              <div>
                <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>
                  Prompt d'entrée
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Décrivez ce que vous souhaitez générer..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>
                    Créativité
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>Conservatrice</option>
                    <option>Modérée</option>
                    <option>Créative</option>
                    <option>Très créative</option>
                  </select>
                </div>
                <div>
                  <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>
                    Longueur
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>Courte</option>
                    <option>Moyenne</option>
                    <option>Longue</option>
                    <option>Très longue</option>
                  </select>
                </div>
              </div>

              <motion.button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ?
      (
                  <RefreshCw className="inline w-5 h-5 mr-2 animate-spin" />
                )  :
       (
                  <Sparkles className="inline w-5 h-5 mr-2" />
                )}
                {isGenerating ? 'Génération...' : 'Générer du contenu'}
              </motion.button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">
              <Settings className="inline w-5 h-5 mr-2" />
              Paramètres avancés
            </h3>
            <div className="space-y-3">
              <label className=STR_FLEX_ITEMS_CENTER>
                <input type=STR_CHECKBOX className=STR_MR_2 />
                <span className=STR_TEXT_SM>Mode créatif avancé</span>
              </label>
              <label className=STR_FLEX_ITEMS_CENTER>
                <input type=STR_CHECKBOX className=STR_MR_2 defaultChecked />
                <span className=STR_TEXT_SM>Optimisation sémantique</span>
              </label>
              <label className=STR_FLEX_ITEMS_CENTER>
                <input type=STR_CHECKBOX className=STR_MR_2 />
                <span className=STR_TEXT_SM>Analyse contextuelle</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Output Section */}
        <motion.div
          className="space-y-6"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 h-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Résultat généré</h2>
              {generatedContent && (
                <motion.button
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </motion.button>
              )}
            </div>

            <div className="h-80 overflow-y-auto">
              {isGenerating ?
      (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-500">Génération en cours...</p>
                  </div>
                </div>
              )  :
       generatedContent ?
      (
                <motion.div
                  className="prose prose-sm max-w-none"
                  initial={{ opacity :
       0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                    {generatedContent}
                  </pre>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Le contenu généré apparaîtra ici</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Statistiques de génération
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className=STR_TEXT_PURPLE_600>Tokens utilisés:</span>
                <span className=STR_ML_2_FONT_SEMIBOLD>--</span>
              </div>
              <div>
                <span className=STR_TEXT_PURPLE_600>Temps de traitement:</span>
                <span className=STR_ML_2_FONT_SEMIBOLD>--</span>
              </div>
              <div>
                <span className=STR_TEXT_PURPLE_600>Qualité:</span>
                <span className=STR_ML_2_FONT_SEMIBOLD>--</span>
              </div>
              <div>
                <span className=STR_TEXT_PURPLE_600>Originalité:</span>
                <span className=STR_ML_2_FONT_SEMIBOLD>--</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Generator;