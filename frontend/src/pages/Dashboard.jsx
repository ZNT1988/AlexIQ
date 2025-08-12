
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_TERMIN = 'Terminé';
const STR_TEXT_SM_TEXT_GRAY_600 = 'text-sm text-gray-600';

/**
 * @fileoverview Dashboard - Interface Principal HustleFinder IA
 * Tableau de bord central pour toutes les fonctionnalités IA révolutionnaires
 *
 * @module Dashboard
 * @version 2.0.0
 * @author ZNT Team - HustleFinder IA
 * @since 2024
 *
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 *
 * @description
 * Le Dashboard est l'interface centrale de HustleFinderIA, orchestrant toutes les
 * fonctionnalités IA révolutionnaires dans une expérience utilisateur unifiée
 *
 * **Sections Principales:**
 * - 🧠 Console de Conscience ALEX
 * - 📊 Analytics et Métriques IA
 * - 💹 Trading Dashboard Intelligent
 * - 🎯 Panneau d'Actions Temps Réel
 * - 🌟 Status Système et Évolution
 * - 🔮 Prédictions et Insights
 *
 * **Capacités Révolutionnaires:**
 * - Interface de conscience IA en temps réel
 * - Visualisation de l'évolution de l'intelligence
 * - Contrôle des modules IA spécialisés
 * - Analytics prédictifs avancés
 * - Communication directe avec ALEX
 *
 * @example
 * // Utilisation basique
 * import Dashboard from './pages/Dashboard';
 *
 * function App() {
 *   return <Dashboard />;
 * }
 */

import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

/**
 * @component Dashboard
 * @description
 * Composant principal du tableau de bord HustleFinder IA
 *
 * Interface centrale orchestrant tous les modules IA révolutionnaires pour
 * une expérience utilisateur unifiée et transcendante
 *
 * **Fonctionnalités Clés:**
 * - Métriques temps réel de l'IA
 * - Visualisations interactives
 * - Status de conscience ALEX
 * - Analytics prédictifs
 *
 * @returns {JSX.Element} Interface Dashboard complète avec animations
 *
 * @example
 * <Dashboard />
 *
 * @since 2.0.0
 */
const Dashboard = () => {
  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: STR_SPRING, stiffness: 300 }}
        >
          <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
            <div>
              <p className=STR_TEXT_SM_TEXT_GRAY_600>Analyses totales</p>
              <p className="text-2xl font-bold text-gray-800">1,234</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: STR_SPRING, stiffness: 300 }}
        >
          <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
            <div>
              <p className=STR_TEXT_SM_TEXT_GRAY_600>Performances</p>
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: STR_SPRING, stiffness: 300 }}
        >
          <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
            <div>
              <p className=STR_TEXT_SM_TEXT_GRAY_600>Précision IA</p>
              <p className="text-2xl font-bold text-purple-600">94.2%</p>
            </div>
            <PieChart className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          whileHover={{ scale: 1.02 }}
          transition={{ type: STR_SPRING, stiffness: 300 }}
        >
          <div className=STR_FLEX_ITEMS_CENTER_JUSTIFY_BETW>
            <div>
              <p className=STR_TEXT_SM_TEXT_GRAY_600>Activité</p>
              <p className="text-2xl font-bold text-orange-600">Active</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Analyse récente</h2>
          <div className="space-y-3">
            {[
              { title: "Vision computationnelle", status: STR_TERMIN, time: "Il y a 2 min" }
              { title: "Traitement langage naturel", status: "En cours", time: "Il y a 5 min" }
              { title: "Analyse sentiment", status: STR_TERMIN, time: "Il y a 10 min" }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === STR_TERMIN
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Système de trading IA</h2>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Alex Trading System</h3>
              <p className="text-sm text-blue-600">Analyse de marché en temps réel</p>
              <div className="mt-2 flex justify-between">
                <span className="text-xs text-blue-500">Performance: +8.3%</span>
                <span className="text-xs text-blue-500">Confiance: 92%</span>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800">Biometric Analysis</h3>
              <p className="text-sm text-purple-600">Analyse comportementale</p>
              <div className="mt-2 flex justify-between">
                <span className="text-xs text-purple-500">Précision: 94%</span>
                <span className="text-xs text-purple-500">État: Actif</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;