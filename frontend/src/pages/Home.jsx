import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

/**
 * Page d'accueil - Redirection automatique vers AlexIQ Ultimate
 */
const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection après un délai pour permettre l'animation
    const timer = setTimeout(() => {
      navigate('/AlexChat', { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
      
      {/* Effet de particules en arrière-plan */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="text-center text-white z-10 max-w-2xl mx-auto px-6">
        {/* Logo animé */}
        <motion.div
          className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 relative"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <motion.div 
            className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          
          {/* Effet de pulsation */}
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Titre animé */}
        <motion.h1 
          className="text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AlexIQ
          </span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p 
          className="text-2xl text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          L'Intelligence Artificielle la plus avancée au monde
        </motion.p>

        {/* Description */}
        <motion.div 
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="flex items-center justify-center space-x-3 text-lg">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="text-blue-300">Powered by Claude 3.5 Sonnet & GPT-4</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-lg">
            <Brain className="w-6 h-6 text-purple-400" />
            <span className="text-purple-300">Capacités de raisonnement surhumaines</span>
          </div>
        </motion.div>

        {/* Indicateur de chargement */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <div className="text-lg text-gray-400 animate-pulse">
            Initialisation du système...
          </div>
          
          {/* Barre de progression */}
          <div className="w-80 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 2, duration: 2.5, ease: "easeInOut" }}
            />
          </div>

          <motion.div
            className="text-sm text-gray-500 space-y-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div>Chargement des modules IA...</div>
            <div>Connexion aux serveurs...</div>
            <div>Interface prête dans quelques secondes</div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;