@echo off
echo.
echo ========================================
echo   🚀 HustleFinderIA ALEX - Démarrage
echo ========================================
echo.

cd /d "%~dp0"

echo 1️⃣ Démarrage du Backend (Port 8081)...
start "HF Backend" cmd /k "cd backend && npm run dev"

echo ⏳ Attente 5 secondes...
timeout /t 5 /nobreak > nul

echo.
echo 2️⃣ Démarrage du Frontend (Port 5173)...
start "HF Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ HustleFinderIA Alex est en cours de démarrage !
echo.
echo 📖 Informations:
echo    • Backend API: http://localhost:8081
echo    • Frontend UI: http://localhost:5173
echo    • Attendre ~10 secondes le démarrage complet
echo.
echo 🌐 Une fois démarré, ouvrez: http://localhost:5173
echo.
pause