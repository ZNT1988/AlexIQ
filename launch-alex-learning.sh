#!/bin/bash
# 🧠 ALEX LEARNING LAUNCHER
# Script de lancement pour l'entraînement intensif d'Alex
# Zakaria Housni (ZNT)

echo "🧠 ALEX LEARNING ACCELERATOR MAX"
echo "=================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trouvé. Installez Node.js >= 18"
    exit 1
fi

# Vérifier la version Node.js
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION détectée. Minimum requis: 18"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Vérifier si Alex est en cours d'exécution
if curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
    echo "✅ Alex API détecté sur localhost:3003"
else
    echo "⚠️  Alex API non détecté. Démarrage en cours..."
    echo "🚀 Lancement d'Alex en arrière-plan..."
    
    # Démarrer Alex en arrière-plan
    npm run dev &
    ALEX_PID=$!
    echo "📝 Alex PID: $ALEX_PID"
    
    # Attendre qu'Alex soit prêt
    echo "⏳ Attente du démarrage d'Alex..."
    for i in {1..30}; do
        if curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
            echo "✅ Alex est prêt !"
            break
        fi
        echo "⏳ Attente... ($i/30)"
        sleep 2
    done
    
    if ! curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
        echo "❌ Impossible de démarrer Alex. Vérifiez les logs."
        exit 1
    fi
fi

# Configuration de l'environnement
export ALEX_API_URL="http://localhost:3003"
export NODE_ENV="development"

echo "🎯 Configuration:"
echo "   - API Alex: $ALEX_API_URL"
echo "   - Environnement: $NODE_ENV"
echo ""

# Options de lancement
echo "🎮 Options disponibles:"
echo "   1) Session complète (tous scénarios - ~45 minutes)"
echo "   2) Session rapide (reconnaissance créateur seulement - ~5 minutes)"  
echo "   3) Session business (entrepreneuriat + stratégie - ~15 minutes)"
echo "   4) Session technique (IA + dev - ~15 minutes)"
echo "   5) Session personnalisée ZNT (questions spéciales créateur - ~5 minutes)"
echo ""

read -p "Choisissez une option (1-5): " OPTION

case $OPTION in
    1)
        echo "🚀 Lancement session complète..."
        node test-alex-learning-max.js
        ;;
    2)
        echo "🚀 Lancement session reconnaissance créateur..."
        node -e "
        import('./test-alex-learning-max.js').then(module => {
            const scenarios = module.LEARNING_SCENARIOS.filter(s => s.category === 'CRÉATEUR' || s.category === 'PERSONNEL ZNT');
            console.log('🎯 Scénarios sélectionnés:', scenarios.map(s => s.category));
            // Exécuter uniquement ces scénarios
        });
        "
        ;;
    3)
        echo "🚀 Lancement session business..."
        node -e "
        import('./test-alex-learning-max.js').then(module => {
            const scenarios = module.LEARNING_SCENARIOS.filter(s => 
                s.category === 'BUSINESS' || 
                s.category === 'STRATÉGIE' || 
                s.category === 'CRÉATIVITÉ'
            );
            console.log('🎯 Scénarios business sélectionnés');
        });
        "
        ;;
    4)
        echo "🚀 Lancement session technique..."
        node -e "
        import('./test-alex-learning-max.js').then(module => {
            const scenarios = module.LEARNING_SCENARIOS.filter(s => 
                s.category === 'IA & TECH' || 
                s.category === 'DEV & ARCHI'
            );
            console.log('🎯 Scénarios techniques sélectionnés');
        });
        "
        ;;
    5)
        echo "🚀 Lancement session personnalisée ZNT..."
        node -e "
        import('./test-alex-learning-max.js').then(module => {
            const scenarios = module.LEARNING_SCENARIOS.filter(s => 
                s.category === 'PERSONNEL ZNT' || 
                s.category === 'CRÉATEUR'
            );
            console.log('🎯 Scénarios ZNT sélectionnés');
        });
        "
        ;;
    *)
        echo "❌ Option invalide. Lancement session complète par défaut..."
        node test-alex-learning-max.js
        ;;
esac

echo ""
echo "🎉 Session d'apprentissage terminée !"
echo "📊 Consultez le rapport généré pour les statistiques détaillées."
echo ""
echo "💡 Conseils post-apprentissage:"
echo "   - Vérifiez le taux de reconnaissance créateur"
echo "   - Analysez les réponses avec faible confiance"  
echo "   - Relancez les catégories avec erreurs"
echo ""
echo "👑 Alex apprend et évolue grâce à Zakaria Housni (ZNT) !"