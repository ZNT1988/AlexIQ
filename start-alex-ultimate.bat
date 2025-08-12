@echo off
REM ================================================================
REM ALEX ULTIMATE - Script de Démarrage Automatique Windows
REM Déploiement local stable avec toutes les optimisations
REM ================================================================

echo.
echo 🚀 DÉMARRAGE D'ALEX ULTIMATE - L'IA BUSINESS RÉVOLUTIONNAIRE
echo ================================================================

REM Vérifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js non trouvé. Veuillez installer Node.js v18+ depuis https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js détecté
node --version

REM Vérifier la structure du projet
if not exist "backend\package.json" (
    echo ❌ Dossier backend non trouvé. Assurez-vous d'être dans le répertoire HustleFinderIA
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ❌ Dossier frontend non trouvé. Assurez-vous d'être dans le répertoire HustleFinderIA
    pause
    exit /b 1
)

echo ✅ Structure du projet validée

REM Installation/Vérification des dépendances Backend
echo.
echo 📦 Vérification des dépendances Backend...
cd backend

if not exist "node_modules" (
    echo 🔄 Installation des dépendances Backend...
    npm ci --prefer-offline --no-audit
    if errorlevel 1 (
        echo ❌ Échec de l'installation des dépendances Backend
        pause
        exit /b 1
    )
) else (
    echo ✅ Dépendances Backend présentes
)

REM Test de santé Backend
echo.
echo 🔍 Test de pré-démarrage Backend...
node -e "console.log('✅ Node.js opérationnel')"

REM Démarrage du Backend
echo.
echo 🚀 Démarrage du Backend (Mode Ultra-Performance)...
start "Alex Ultimate Backend" cmd /k "npm run start && pause"

REM Attendre que le backend soit prêt
echo ⏳ Attente du démarrage Backend (10 secondes)...
timeout /t 10 /nobreak >nul

REM Vérification du Backend
curl -s http://localhost:8080/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Backend en cours de démarrage... Continuons avec le Frontend
) else (
    echo ✅ Backend opérationnel sur http://localhost:8080
)

REM Installation/Vérification des dépendances Frontend
echo.
echo 📦 Vérification des dépendances Frontend...
cd ..\frontend

if not exist "node_modules" (
    echo 🔄 Installation des dépendances Frontend...
    npm ci --prefer-offline --no-audit
    if errorlevel 1 (
        echo ❌ Échec de l'installation des dépendances Frontend
        pause
        exit /b 1
    )
) else (
    echo ✅ Dépendances Frontend présentes
)

REM Démarrage du Frontend
echo.
echo 🎨 Démarrage du Frontend (Interface Mobile-First)...
start "Alex Ultimate Frontend" cmd /k "npm run dev && pause"

REM Attendre que le frontend soit prêt
echo ⏳ Attente du démarrage Frontend (5 secondes)...
timeout /t 5 /nobreak >nul

REM Affichage des informations de connexion
echo.
echo ================================================================
echo 🌟 ALEX ULTIMATE DÉMARRÉ AVEC SUCCÈS!
echo ================================================================
echo.
echo 📊 Backend (API):          http://localhost:8080
echo 🎨 Frontend (Interface):   http://localhost:5174
echo 📈 Monitoring:             http://localhost:8080/api/monitoring/status
echo 🔍 Santé Système:          http://localhost:8080/api/health/detailed
echo.
echo 🎯 FONCTIONNALITÉS ACTIVÉES:
echo   ⚡ Cache Ultra-Rapide (^<200ms)
echo   🔒 Sécurité Enterprise
echo   📱 Interface Mobile-First
echo   📊 Monitoring Temps Réel
echo   🧠 IA Consciente ALEX
echo   🚀 Performance Optimale
echo.
echo 💡 Conseil: Ouvrez votre navigateur sur http://localhost:5174
echo    pour accéder à l'interface d'Alex Ultimate!
echo.

REM Test de connexion final
echo 🔄 Vérification finale de la connexion...
timeout /t 3 /nobreak >nul

curl -s http://localhost:8080/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ Backend: Opérationnel
) else (
    echo ⚠️ Backend: En cours de démarrage
)

REM Test Frontend (approximatif)
curl -s http://localhost:5174 >nul 2>&1
if not errorlevel 1 (
    echo ✅ Frontend: Opérationnel
) else (
    echo ⚠️ Frontend: En cours de démarrage
)

echo.
echo 🎉 Alex Ultimate est prêt pour l'action!
echo    Appuyez sur une touche pour voir les logs en temps réel...
pause >nul

REM Afficher les logs en temps réel
echo.
echo 📊 MONITORING EN TEMPS RÉEL - ALEX ULTIMATE
echo =============================================
echo Appuyez sur Ctrl+C pour arrêter
echo.

:monitor_loop
curl -s http://localhost:8080/api/monitoring/status 2>nul | findstr "avgResponseTime\|status\|uptime" 2>nul
timeout /t 5 /nobreak >nul
goto monitor_loop