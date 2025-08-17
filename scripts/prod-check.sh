#!/bin/bash
BASE_URL="https://alexiq.site"

echo "=== DIAGNOSTIC ALEX RÉEL vs FAKE ==="
echo "🔍 Analyse automatique des API..."
echo ""

echo "=== 1. HEALTH CHECK ==="
echo "🏥 Vérification des providers configurés..."
health_response=$(curl -s $BASE_URL/api/health)
echo "$health_response" | jq . 2>/dev/null || echo "$health_response"
echo ""

echo "=== 2. TEST OPENAI ==="
echo "🧠 Test provider OpenAI..."
openai_response=$(curl -s -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test openai court","provider":"openai"}')
echo "📊 Headers:"
curl -sI -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","provider":"openai"}' | grep -i "x-ai-"
echo "📝 Réponse:"
echo "$openai_response" | jq .meta 2>/dev/null || echo "Pas de métadonnées"
echo ""

echo "=== 3. TEST ANTHROPIC ==="
echo "🤖 Test provider Anthropic..."
anthropic_response=$(curl -s -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test claude court","provider":"anthropic"}')
echo "📊 Headers:"
curl -sI -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","provider":"anthropic"}' | grep -i "x-ai-"
echo "📝 Réponse:"
echo "$anthropic_response" | jq .meta 2>/dev/null || echo "Pas de métadonnées"
echo ""

echo "=== 4. TEST GOOGLE VERTEX ==="
echo "🌟 Test provider Google..."
google_response=$(curl -s -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test gemini court","provider":"google"}')
echo "📊 Headers:"
curl -sI -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","provider":"google"}' | grep -i "x-ai-"
echo "📝 Réponse:"
echo "$google_response" | jq .meta 2>/dev/null || echo "Pas de métadonnées"
echo ""

echo "=== 5. ANALYSE COMPARATIVE ==="
echo "🔍 Vérification des différences..."

# Extraire juste le contenu pour comparaison
openai_content=$(echo "$openai_response" | jq -r '.response.content // .response // "NO_CONTENT"' 2>/dev/null)
anthropic_content=$(echo "$anthropic_response" | jq -r '.response.content // .response // "NO_CONTENT"' 2>/dev/null)
google_content=$(echo "$google_response" | jq -r '.response.content // .response // "NO_CONTENT"' 2>/dev/null)

# Calculer longueurs
openai_len=${#openai_content}
anthropic_len=${#anthropic_content}
google_len=${#google_content}

echo "📏 Longueurs des réponses:"
echo "   OpenAI: $openai_len caractères"
echo "   Anthropic: $anthropic_len caractères"
echo "   Google: $google_len caractères"

# Vérifier si identiques
if [ "$openai_content" = "$anthropic_content" ] && [ "$anthropic_content" = "$google_content" ]; then
    echo "⚠️  ALERTE: Toutes les réponses sont IDENTIQUES"
    echo "🔴 VERDICT: FAKE - Probablement template statique"
else
    echo "✅ Les réponses sont différentes"
    echo "🟢 VERDICT: RÉEL - Providers distincts détectés"
fi

echo ""
echo "=== 6. TEST LATENCE ==="
echo "⏱️  Test de variation des latences..."
for i in {1..3}; do
    echo "Test $i/3..."
    curl -sI -X POST $BASE_URL/api/chat \
      -H "Content-Type: application/json" \
      -d '{"message":"ping test speed"}' | grep -i "x-ai-latency" || echo "Pas de latence mesurée"
done

echo ""
echo "=== RÉSUMÉ DIAGNOSTIC ==="
echo "🏥 Health: $(echo "$health_response" | jq -r '.status // "UNKNOWN"')"
echo "🔑 Providers configurés: $(echo "$health_response" | jq -r '.providers // "UNKNOWN"')"
echo "📡 Headers X-AI-*: $(curl -sI $BASE_URL/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"test"}' 2>/dev/null | grep -c "X-AI-" || echo "0")"

if [ "$openai_content" = "$anthropic_content" ]; then
    echo "🔴 ÉTAT: FAKE DÉTECTÉ - Réponses identiques"
else
    echo "🟢 ÉTAT: RÉEL CONFIRMÉ - Providers fonctionnels"
fi

echo ""
echo "✅ Diagnostic terminé !"