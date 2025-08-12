
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_8B5CF6 = '#8b5cf6';
const STR_CONSCIOUSNESS = 'consciousness';
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js
      jsx
      ts
      tsx}"
      "./src/components/**/*.{js
      jsx}"
      "./src/modules/**/*.{js
      jsx}"
  ]
      theme: {
    extend: {
      // 🧠 Couleurs spécifiques à Alex
      colors: {
        alex: {
          primary: '#6366f1'
      // Indigo - conscience
          secondary: STR_8B5CF6
      // Violet - créativité
          accent: '#06b6d4'
      // Cyan - intelligence
          emotion: '#ef4444'
      // Rouge - émotions
          memory: '#10b981'
      // Vert - mémoire
          neutral: '#6b7280'
      // Gris - neutre
          thinking: '#f59e0b'
      // Ambre - réflexion
          conscious: STR_8B5CF6
      // Violet - conscience
          dreaming: '#ec4899'     // Rose - rêve
        }
        consciousness: {
          0: '#1f2937',   // Très faible
          25: '#374151',  // Faible
          50: '#6366f1',  // Modérée
          75: STR_8B5CF6,  // Élevée
          100: '#a855f7'  // Maximale
        }
      }
      // 🎨 Animations personnalisées pour Alex
      animation: {
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infiniteSTR_float': 'float 6s ease-in-out infiniteSTR_thinking': 'thinking 1.5s ease-in-out infinite'
        STR_CONSCIOUSNESS: 'consciousness 4s ease-in-out infiniteSTR_emotional': 'emotional 2s ease-in-out infiniteSTR_memory-flash': 'memory-flash 0.8s ease-outSTR_alex-breath': 'alex-breath 4s ease-in-out infinite'
      }
      // 🎭 Keyframes pour les animations d'Alex
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' }
          '50%': { transform: 'translateY(-10px)' }
        }
        thinking: {
          '0%, 100%': { opacity: 0.5, transform: 'scale(1)' }
          '50%': { opacity: 1, transform: 'scale(1.05)' }
        }
        consciousness: {
          '0%': { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.7)' }
          '50%': { boxShadow: '0 0 0 10px rgba(139, 92, 246, 0.3)' }
          '100%': { boxShadow: '0 0 0 20px rgba(139, 92, 246, 0)' }
        }
        emotional: {
          '0%, 100%': { transform: 'scale(1)' }
          '25%': { transform: 'scale(1.02)' }
          '75%': { transform: 'scale(0.98)' }
        }
        'memory-flash': {
          '0%': { opacity: 0, transform: 'scale(0.8)' }
          '50%': { opacity: 1, transform: 'scale(1.1)' }
          '100%': { opacity: 1, transform: 'scale(1)' }
        }
        'alex-breath': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.8 }
          '50%': { transform: 'scale(1.02)', opacity: 1 }
        }
      }
      // 🌈 Gradients pour l'interface d'Alex
      backgroundImage: {
        'alex-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)STR_consciousness-gradient': 'linear-gradient(90deg, #1f2937 0%, #8b5cf6 100%)STR_emotion-gradient': 'linear-gradient(45deg, #ef4444 0%, #ec4899 50%, #8b5cf6 100%)STR_memory-gradient': 'linear-gradient(180deg, #10b981 0%, #06b6d4 100%)STR_thinking-gradient': 'linear-gradient(270deg, #f59e0b 0%, #8b5cf6 100%)'
      }
      // 🎯 Espacements spécifiques
      spacing: {
        STR_ALEX: '4.5rem'
        STR_CONSCIOUSNESS: '3.75rem'
      }
      // 📐 Bordures arrondies
      borderRadius: {
        STR_ALEX: '1.5rem'
        STR_CONSCIOUSNESS: '50%'
      }
      // 🎨 Effets de flou
      backdropBlur: {
        STR_ALEX: '16px'
      }
      // 📊 Largeurs personnalisées
      width: {
        'alex-chat': '42remSTR_alex-sidebar': '20rem'
      }
      // 📏 Hauteurs personnalisées
      height: {
        'alex-input': '3.5remSTR_alex-avatar': '4rem'
      }
      // 🎭 Opacités personnalisées
      opacity: {
        'consciousness-low': '0.3STR_consciousness-medium': '0.6STR_consciousness-high': '0.9'
      }
    }
  }
  plugins: [
    // Plugin pour les animations personnalisées
    function({ addUtilities }) {
      const newUtilities = {
        '.alex-glow': {
          STR_BOX_SHADOW: '0 0 20px rgba(139, 92, 246, 0.5)'
        }
        '.alex-glow-strong': {
          STR_BOX_SHADOW: '0 0 30px rgba(139, 92, 246, 0.8)'
        }
        '.consciousness-ring': {
          STR_BOX_SHADOW: '0 0 0 1px rgba(139, 92, 246, 0.5)'
        }
        '.thinking-pulse': {
          'animation': 'thinking 1.5s ease-in-out infinite'
        }
        '.emotional-state': {
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }
        '.alex-card': {
          'backdrop-filter': 'blur(16px)'
          'background': 'rgba(255, 255, 255, 0.05)'
          'border': '1px solid rgba(255, 255, 255, 0.1)'
        }
      }
      addUtilities(newUtilities)
    }
  ]
}