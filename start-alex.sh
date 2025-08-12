#!/bin/bash

echo ""
echo "========================================"
echo "  🚀 HustleFinderIA ALEX - Démarrage"
echo "========================================"
echo ""

# Couleurs pour le terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

echo -e "${BLUE}1️⃣ Démarrage du Backend (Port 8081)...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo -e "${YELLOW}⏳ Attente 5 secondes...${NC}"
sleep 5

echo ""
echo -e "${BLUE}2️⃣ Démarrage du Frontend (Port 5173)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ HustleFinderIA Alex est en cours de démarrage !${NC}"
echo ""
echo "📖 Informations:"
echo "   • Backend API: http://localhost:8081"
echo "   • Frontend UI: http://localhost:5173"
echo "   • Attendre ~10 secondes le démarrage complet"
echo ""
echo -e "${GREEN}🌐 Une fois démarré, ouvrez: http://localhost:5173${NC}"
echo ""

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt des processus..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Processus arrêtés"
    exit 0
}

# Intercepter Ctrl+C
trap cleanup SIGINT SIGTERM

echo "Pressez Ctrl+C pour arrêter les serveurs..."
wait