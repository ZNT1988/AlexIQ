# 🛠️ Guide de Dépannage HustleFinderIA Backend

## Démarrage Sécurisé

### Scripts Disponibles

```bash
# Démarrage avec vérifications automatiques (RECOMMANDÉ)
npm run dev                # Mode développement avec checks
npm start                  # Mode production avec checks

# Démarrage forcé (sans vérifications - pour debug uniquement)
npm run dev:force         # Mode développement sans checks
npm run start:force       # Mode production sans checks

# Vérifications manuelles
npm run check             # Vérification pré-démarrage uniquement
npm run health            # Check de santé du serveur en cours
```

### Système de Vérification Automatique

Le système effectue les vérifications suivantes au démarrage :

1. **✅ Fichiers Critiques**
   - Vérification de la présence des modules core
   - Contrôle des routes essentielles
   - Validation des fichiers de configuration

2. **🗑️ Détection de Doublons**
   - Suppression automatique des anciens modules
   - Nettoyage des fichiers obsolètes

3. **⚙️ Configuration**
   - Création automatique du fichier `.env` si manquant
   - Validation des ports et variables d'environnement

4. **🧹 Auto-Correction**
   - Création des dossiers manquants
   - Correction des permissions
   - Nettoyage des caches

## Problèmes Courants et Solutions

### 🚨 Backend ne démarre pas

**Symptômes :**

- Erreur "Cannot find module"
- Erreur de syntaxe
- Port déjà utilisé

**Solutions :**

```bash
# 1. Vérification complète
npm run check

# 2. Si erreur de port
# Modifier le PORT dans .env ou
export PORT=8081 && npm run dev

# 3. Si modules manquants
npm install

# 4. Recovery manuel
curl -X POST http://localhost:8080/api/system/recover
```

### 🤖 Alex ne répond pas

**Symptômes :**

- "Core system not initialized"
- Timeout sur les requêtes AI
- Réponses vides

**Solutions :**

```bash
# 1. Vérifier le statut IA
curl http://localhost:8080/api/ai-system/status

# 2. Activer le système IA
curl -X POST http://localhost:8080/api/ai-system/activate \
  -H "Content-Type: application/json" \
  -d '{"mode":"full"}'

# 3. Test rapide Alex
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Test Alex","type":"chat","model":"alex"}'
```

### 📊 Diagnostics Avancés

**Health Check Détaillé :**

```bash
# Diagnostic complet du système
curl http://localhost:8080/api/health/detailed

# Ou via script
npm run health
```

**Réponse type (healthy) :**

```json
{
  "status": "healthy",
  "uptime": { "formatted": "0h 5m 30s" },
  "checks": {
    "system": { "status": "healthy" },
    "coreModules": { "status": "healthy" },
    "database": { "status": "healthy" }
  },
  "performance": {
    "computeSpeed": 2.3,
    "memoryUsage": { "heapUsed": 45 }
  },
  "recommendations": []
}
```

### 🔧 Recovery Automatique

Si le système détecte des problèmes, il peut s'auto-corriger :

```bash
# Recovery manuel
curl -X POST http://localhost:8080/api/system/recover

# Recovery automatique au démarrage
export AUTO_RECOVER=true
npm run dev
```

### 📝 Variables d'Environnement

Créez un fichier `.env` avec :

```bash
# Port du serveur
PORT=8080

# Environnement
NODE_ENV=development

# Recovery automatique
AUTO_RECOVER=true

# Debugging
DEBUG=true
```

## Codes d'Erreur

| Code                 | Signification     | Action                                |
| -------------------- | ----------------- | ------------------------------------- |
| EADDRINUSE           | Port déjà utilisé | Changer le port ou tuer le processus  |
| MODULE_NOT_FOUND     | Module manquant   | `npm install` ou vérifier les imports |
| CORE_NOT_INITIALIZED | IA non activée    | Activer via `/api/ai-system/activate` |
| DATABASE_ERROR       | Problème BD       | Vérifier SQLite ou config PostgreSQL  |

## Surveillance Continue

### Logs à Surveiller

```bash
# Logs normaux (OK)
✅ AI routes initialized with new HustleFinderCore architecture
✅ Database initialized successfully
✅ 🚀 HustleFinder Backend running on port 8080

# Logs d'alerte
⚠️ Using MOCK authentication for development
⚠️ PostgreSQL not available, falling back to SQLite

# Logs d'erreur (à corriger)
❌ Core system not initialized
❌ Module not found
❌ Database connection failed (sans fallback)
```

### Monitoring Recommandé

1. **Health Check Automatique** (toutes les 5 minutes)

   ```bash
   */5 * * * * curl -f http://localhost:8080/health || echo "Backend DOWN"
   ```

2. **Vérification Alex** (toutes les 10 minutes)
   ```bash
   */10 * * * * curl -X POST http://localhost:8080/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Health check","type":"chat"}' || echo "Alex DOWN"
   ```

## Support et Debug

### Activer le Mode Debug

```bash
export DEBUG=true
npm run dev
```

### Niveaux de Log

- `error` : Erreurs critiques
- `warn` : Avertissements
- `info` : Informations générales
- `debug` : Détails techniques (si DEBUG=true)

### Fichiers de Log

Les logs sont sauvegardés dans :

- `logs/app.log` : Logs généraux
- `logs/error.log` : Erreurs uniquement
- `logs/ai.log` : Logs IA spécifiques

---

## Contacts Support

- **Issues GitHub** : [Créer un ticket](https://github.com/hustlefinder/issues)
- **Documentation** : [Wiki du projet](https://github.com/hustlefinder/wiki)

---

_Mis à jour le : {{ date }}_
_Version du système : 3.0.0_
