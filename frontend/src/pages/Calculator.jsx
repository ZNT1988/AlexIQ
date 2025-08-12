import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, TrendingUp, PieChart, BarChart3 } from 'lucide-react';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_FR_FR = 'fr-FR';
const STR_SPACE_Y_6 = 'space-y-6';
const STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT = 'block text-sm font-medium text-gray-700 mb-2';
const Calculator = () => {
  const [investment, setInvestment] = useState(10000);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [timeframe, setTimeframe] = useState(12);
  const [results, setResults] = useState(null);

  const calculateROI = () => {
    const riskMultipliers = {
      low: { min: 0.05
      max: 0.15
      volatility: 0.1 }
      medium: { min: 0.08
      max: 0.25
      volatility: 0.15 }
      high: { min: 0.12
      max: 0.40
      volatility: 0.25 }
    };

    const risk = riskMultipliers[riskLevel];
    const baseReturn = (risk.min + risk.max) / 2;
    const projectedReturn = investment * (1 + baseReturn * (timeframe / 12));
    const profit = projectedReturn - investment;
    const roi = ((profit / investment) * 100);

    setResults({
      initialInvestment: investment
      projectedValue: projectedReturn
      profit: profit
      roi: roi
      monthlyReturn: profit / timeframe
      riskScore: risk.volatility * 100
    });
  };

  return (
    <motion.div
      className="p-6 max-w-6xl mx-auto"
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
          <CalcIcon className="inline w-8 h-8 mr-2 text-blue-600" />
          Calculateur d'Investissement IA
        </motion.h1>
        <p className="text-gray-600">
          Analysez vos investissements avec notre algorithme prédictif avancé
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          className=STR_SPACE_Y_6
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Paramètres d'investissement</h2>

            <div className=STR_SPACE_Y_6>
              <div>
                <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>
                  Montant initial (€)
                </label>
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="100"
                  step="100"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Min: 100€</span>
                  <span>Recommandé: 1,000€+</span>
                </div>
              </div>

              <div>
                <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>
                  Niveau de risque
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Faible risque (5-15% annuel)</option>
                  <option value="medium">Risque modéré (8-25% annuel)</option>
                  <option value="high">Risque élevé (12-40% annuel)</option>
                </select>
              </div>

              <div>
                <label className=STR_BLOCK_TEXT_SM_FONT_MEDIUM_TEXT>
                  Période d'investissement (mois)
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={timeframe}
                  onChange={(e) => setTimeframe(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 mois</span>
                  <span className=STR_FONT_SEMIBOLD>{timeframe} mois</span>
                  <span>5 ans</span>
                </div>
              </div>

              <motion.button
                onClick={calculateROI}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TrendingUp className="inline w-5 h-5 mr-2" />
                Calculer les projections
              </motion.button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Stratégies recommandées</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">DCA (Dollar Cost Averaging)</h4>
                <p className="text-sm text-blue-600">Investissement régulier pour lisser la volatilité</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">Portefeuille diversifié</h4>
                <p className="text-sm text-green-600">Répartition optimale des risques</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800">IA Trading</h4>
                <p className="text-sm text-purple-600">Algorithmes automatisés adaptatifs</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div
          className=STR_SPACE_Y_6
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {results ?
      (
            <>
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-6">Projections calculées</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div
                    className="p-4 bg-blue-50 rounded-lg"
                    initial={{ scale :
       0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <PieChart className="w-6 h-6 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-800">
                      €{results.projectedValue.toLocaleString(STR_FR_FR, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm text-blue-600">Valeur projetée</div>
                  </motion.div>

                  <motion.div
                    className="p-4 bg-green-50 rounded-lg"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-green-800">
                      +€{results.profit.toLocaleString(STR_FR_FR, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm text-green-600">Profit estimé</div>
                  </motion.div>

                  <motion.div
                    className="p-4 bg-purple-50 rounded-lg"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-purple-800">
                      {results.roi.toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-600">ROI total</div>
                  </motion.div>

                  <motion.div
                    className="p-4 bg-orange-50 rounded-lg"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <CalcIcon className="w-6 h-6 text-orange-600 mb-2" />
                    <div className="text-2xl font-bold text-orange-800">
                      €{results.monthlyReturn.toLocaleString(STR_FR_FR, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm text-orange-600">Profit mensuel</div>
                  </motion.div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Analyse détaillée</h3>
                  <div className="space-y-2 text-sm">
                    <div className=STR_FLEX_JUSTIFY_BETWEEN>
                      <span>Investissement initial:</span>
                      <span className=STR_FONT_SEMIBOLD>€{results.initialInvestment.toLocaleString(STR_FR_FR)}</span>
                    </div>
                    <div className=STR_FLEX_JUSTIFY_BETWEEN>
                      <span>Période:</span>
                      <span className=STR_FONT_SEMIBOLD>{timeframe} mois</span>
                    </div>
                    <div className=STR_FLEX_JUSTIFY_BETWEEN>
                      <span>Score de risque:</span>
                      <span className=STR_FONT_SEMIBOLD>{results.riskScore.toFixed(1)}/100</span>
                    </div>
                    <div className=STR_FLEX_JUSTIFY_BETWEEN>
                      <span>ROI annualisé:</span>
                      <span className="font-semibold text-green-600">
                        {((results.roi / timeframe) * 12).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  Recommandations IA
                </h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• Diversifiez votre portefeuille pour optimiser le ratio risque/rendement</p>
                  <p>• Considérez un investissement progressif (DCA) pour réduire la volatilité</p>
                  <p>• Surveillez les indicateurs de marché et ajustez votre stratégie</p>
                  <p>• Maintenez une réserve de liquidités pour les opportunités</p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 h-96 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <CalcIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Calculateur prêt</p>
                <p className="text-sm">Entrez vos paramètres et cliquez sur "Calculer" pour voir les projections</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Calculator;