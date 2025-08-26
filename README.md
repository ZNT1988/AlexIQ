# HustleFinder IA - AlexIQ

Intelligence Artificielle authentique pour HustleFinder avec 127 modules fonctionnels.

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Démarrage développement
npm run dev

# Production Railway
npm start
```

## 📊 Performance & Memory Flags

### Variables d'Environnement Recommandées

Pour éviter les crashes OOM (Out Of Memory) durant le chargement des 127 modules :

#### Production Railway/Render
```bash
NODE_OPTIONS="--max-old-space-size=16384"
```

#### Développement Local  
```bash
NODE_OPTIONS="--max-old-space-size=16384 --expose-gc"
```

#### Debugging Mémoire
```bash
NODE_OPTIONS="--max-old-space-size=2048 --expose-gc --inspect"
```

### Configuration Railway CRITIQUE
Dans Railway Dashboard > Variables:
- `NODE_OPTIONS` = `--max-old-space-size=1536 --enable-source-maps --expose-gc`
- `NODE_ENV` = `production`
- `ALEX_DISABLE_MODULES` = `AlexNeuralEvolution,AlexProcessingOptimizer`

### Configuration Render CRITIQUE  
Dans Render Dashboard > Environment:
- `NODE_OPTIONS` = `--max-old-space-size=1536 --enable-source-maps --expose-gc`
- `NODE_ENV` = `production`
- `ALEX_DISABLE_MODULES` = `AlexNeuralEvolution,AlexProcessingOptimizer`

## 🧠 Système de Modules

### Architecture de Chargement STABILISÉE
- **Chargement séquentiel**: 1 seul module à la fois (p-limit=1) 
- **Watchdog mémoire**: Seuils RSS<1200MB, Heap<800MB
- **Disable suspects**: ALEX_DISABLE_MODULES env var
- **Force GC**: --expose-gc après chaque module + catégorie
- **Profiling détaillé**: Memory tracking temps réel

### Catégories de Modules
- **consciousness**: 28 modules (BusinessBuilderAI, MoodPredictor, etc.)
- **core**: 8 modules (AlexAutonomousCore, NeuroCore, etc.)
- **intelligence**: 24 modules (EmotionalIntelligence, LanguageProcessor, etc.)
- **specialized**: 10+ modules (MemoryPalace, APIManager, etc.)
- **config**: Modules de configuration

### Modules Authentiques (Exemples)
- **MemoryPalace**: Stockage JSON persistant, associations par similarité
- **LanguageProcessor**: NLP FR/EN, sentiment analysis, extraction keywords
- **MoodPredictor**: 4 composants d'analyse (historique, temporel, contextuel, comportemental)
- **BusinessBuilderAI**: Génération d'idées business connectées aux données utilisateur

## 🔧 Monitoring Mémoire

### Logs de Profiling
Le système log automatiquement:
```
📊 MEM[registry_start] RSS:45MB Heap:25/78MB
📊 MEM[category_consciousness_start] RSS:52MB Heap:32/78MB (Δ RSS:+7MB, Heap:+7MB)
```

### APIs de Monitoring
- `GET /api/alex/status` - Stats modules + mémoire système
- `GET /api/modules/stats` - Statistiques détaillées chargement
- `GET /api/modules/memory` - Profil mémoire complet

## 🛠️ Développement

### Structure Projet
```
/backend/alex-modules/
  ├── consciousness/     # Modules de conscience IA
  ├── core/             # Modules système core
  ├── intelligence/     # Modules d'intelligence
  ├── specialized/      # Modules spécialisés
  └── config/           # Modules configuration

/helpers/
  └── memory.js         # Utilitaires mémoire sécurisés

/frontend/              # Interface React + Vite
```

### Helpers Mémoire
```javascript
import { safeMemorySnapshot, logMemory, checkMemorySafety } from './helpers/memory.js';

// Snapshot sécurisé
const snapshot = safeMemorySnapshot();

// Profiling avec logs
const memory = logMemory('operation_start');

// Vérification sécurité
const safety = checkMemorySafety();
if (!safety.safe) {
  // Pause loading ou force GC
}
```

## 🚨 Troubleshooting

### Erreur OOM
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```
**Solution**: Augmenter `--max-old-space-size=1536` ou plus

### Module Loading Fails
```
❌ Erreur chargement modules: Cannot read properties of undefined
```
**Solution**: Vérifier helpers/memory.js et fallbacks dans AdvancedMemoryProcessor

### High Memory Usage
```
⚠️ Memory pressure detected after consciousness, forcing GC...
```
**Solution**: Normal - le système s'autorégule avec GC forcée

## 📱 Interface Frontend

Interface React moderne avec:
- **Layout**: Sidebar (Accueil, Chat Alex, Dashboard, Communauté, Paramètres)
- **Auth**: JWT simple login/register
- **Dashboard**: Stats modules réels, mémoire process, uptime
- **i18n**: Support FR/EN
- **Responsive**: Tailwind CSS + composants propres
- **Build**: Vercel compatible (history fallback)

## 🔗 APIs Principales

### Modules
- `GET /api/modules/list` - Liste tous les modules
- `POST /api/modules/execute/:module/:method` - Exécution module
- `GET /api/modules/categories` - Stats par catégorie

### System
- `GET /api/alex/status` - Status système complet
- `POST /api/alex/feedback` - Feedback utilisateur

## 📈 Performance Tips

1. **Mémoire**: Utiliser les NODE_OPTIONS appropriées
2. **Chargement**: Le système limite automatiquement la concurrence
3. **Monitoring**: Surveiller les logs de profiling mémoire
4. **Production**: Railway/Render avec 1.5GB+ RAM recommandé

## 🔐 Sécurité

- Pas de crypto.randomBytes ou données fake
- Fallbacks sécurisés pour tous les appels système
- Validation stricte des paramètres modules
- Logs détaillés sans exposition données sensibles

---

**🤖 Generated with Claude Code + AlexIQ System**