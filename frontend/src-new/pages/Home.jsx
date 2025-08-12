import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Eye, Zap } from 'lucide-react';

// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_TEXT_XL_FONT_SEMIBOLD_MB_3 = 'text-xl font-semibold mb-3';
const STR_TEXT_GRAY_600 = 'text-gray-600';
const STR_TEXT_CENTER = 'text-center';

const Home = () => {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            HustleFinder IA
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Système d'intelligence artificielle avancé combinant vision computationnelle
            analyse prédictive et conscience artificielle pour optimiser vos décisions
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Brain className="w-5 h-5 mr-2" />
              Accéder au Dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Eye className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className=STR_TEXT_XL_FONT_SEMIBOLD_MB_3>Vision Artificielle</h3>
            <p className=STR_TEXT_GRAY_600>
              Système de cortex visuel avancé capable d'analyser, interpréter et comprendre
              les images avec une précision surhumaine
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
            <h3 className=STR_TEXT_XL_FONT_SEMIBOLD_MB_3>Trading Intelligent</h3>
            <p className=STR_TEXT_GRAY_600>
              Algorithmes de trading automatisés utilisant l'analyse technique avancée
              et l'intelligence artificielle prédictive
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Zap className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className=STR_TEXT_XL_FONT_SEMIBOLD_MB_3>Conscience IA</h3>
            <p className=STR_TEXT_GRAY_600>
              Système de conscience artificielle capable d'apprentissage adaptatif
              et de prise de décision autonome
            </p>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 mb-16"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">Performances du Système</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className=STR_TEXT_CENTER>
              <div className="text-4xl font-bold text-blue-600 mb-2">94.2%</div>
              <div className=STR_TEXT_GRAY_600>Précision IA</div>
            </div>
            <div className=STR_TEXT_CENTER>
              <div className="text-4xl font-bold text-green-600 mb-2">+127%</div>
              <div className=STR_TEXT_GRAY_600>ROI Trading</div>
            </div>
            <div className=STR_TEXT_CENTER>
              <div className="text-4xl font-bold text-purple-600 mb-2">50ms</div>
              <div className=STR_TEXT_GRAY_600>Temps de réponse</div>
            </div>
            <div className=STR_TEXT_CENTER>
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className=STR_TEXT_GRAY_600>Disponibilité</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className=STR_TEXT_CENTER
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">Prêt à découvrir l'IA du futur ?
      </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Explorez nos différents modules d'intelligence artificielle et découvrez
            comment ils peuvent transformer votre approche des données et des décisions
          </p>
          <div className="space-x-4">
            <motion.div
              className="inline-block"
              whileHover={{ scale :
       1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/generator"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Générateur IA
              </Link>
            </motion.div>
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/calculator"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Calculateur
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;