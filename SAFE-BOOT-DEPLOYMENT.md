# 🚀 Safe Boot Deployment Guide - Résolution OOM Railway

## ✅ Solution Complète Implémentée

### 1. Backend Railway - Safe Boot (server-safe.mjs)
- ✅ Server ultra-minimal sans Express (0 dépendances externes)
- ✅ Health check répond immédiatement (jamais de 502)
- ✅ Lazy-loading des modules lourds avec protection OOM
- ✅ Memory monitoring intégré
- ✅ Graceful shutdown

### 2. Frontend Vercel - API URL Fixée
- ✅ Configuration automatique: `https://api.alexiq.site` en production
- ✅ Proxy Vite corrigé pour development
- ✅ Error handling robuste

## 🛡️ Variables d'Environnement Railway

```bash
# COPIER-COLLER dans Railway Dashboard → Environment Variables
ALEX_BOOT_MODE=minimal
ALEX_ENABLE_NEUROCORE=false
ALEX_ENABLE_EVOLUTION=false  
ALEX_ENABLE_BACKGROUND=false
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=1024 --trace-gc
PORT=3000
API_BASE_URL=https://api.alexiq.site
```

## 🔧 Commande de Start Railway

**Start Command:** `node server-safe.mjs`

## 🌐 Variables d'Environnement Vercel

```bash
# COPIER-COLLER dans Vercel Dashboard → Environment Variables
VITE_API_BASE_URL=https://api.alexiq.site
NODE_ENV=production
```

## ⚡ Tests de Validation

Après déploiement, ces endpoints doivent répondre immédiatement:

```bash
# Health check principal
curl https://api.alexiq.site/health

# API health check  
curl https://api.alexiq.site/api/health

# Stats mémoire
curl https://api.alexiq.site/admin/memory
```

**Réponse attendue /health:**
```json
{
  "ok": true,
  "mode": "minimal",
  "uptime": 123.45,
  "memory": { "heapUsed": 7, "heapTotal": 9, "rss": 47 },
  "modules": {
    "neurocore": "disabled",
    "evolution": "disabled", 
    "background": "disabled"
  }
}
```

## 📈 Activation Progressive des Modules

**Étape 1: Validation Safe Boot**
```bash
curl https://api.alexiq.site/health
# Doit retourner 200 OK instantané
```

**Étape 2: Activer NeuroCore (après stabilisation)**
```bash
# Dans Railway Dashboard
ALEX_ENABLE_NEUROCORE=true
# Redeploy et surveiller memory avec /admin/memory
```

**Étape 3: Activation complète (après validation)**
```bash
ALEX_ENABLE_EVOLUTION=true
ALEX_ENABLE_BACKGROUND=true
```

## 🚨 Plan de Rollback

Si déploiement échoue:
1. `ALEX_BOOT_MODE=minimal`
2. `ALEX_ENABLE_*=false`  
3. Redeploy → API répond instantanément

## 🔍 Debug et Monitoring

```bash
# Vérifier réponse API
curl -i https://api.alexiq.site/health

# Monitoring mémoire
curl https://api.alexiq.site/admin/memory

# Activer modules lourds manuellement
curl -X POST https://api.alexiq.site/admin/enable-neuro
```

## 📁 Fichiers Créés/Modifiés

### Backend
- `server-safe.mjs` - Safe boot server principal
- `RAILWAY-SAFE-BOOT.md` - Documentation Railway

### Frontend  
- `src/lib/api.ts` - Configuration API corrigée
- `src/services/api.js` - Template literals fixés
- `vite.config.js` - Proxy pointant vers Railway
- `VERCEL-CONFIG.md` - Documentation Vercel

## 🎯 Résultats Attendus

- ✅ Plus de 502 sur https://api.alexiq.site/health
- ✅ Backend Railway qui ne crash pas au boot
- ✅ Frontend Vercel qui pointe correctement vers l'API
- ✅ Possibilité d'activer les modules lourds après boot
- ✅ Monitoring mémoire en temps réel

## 🚀 Prochaines Étapes

1. **Déployer server-safe.mjs sur Railway** avec les variables d'env
2. **Redéployer le frontend Vercel** avec les nouvelles configs
3. **Valider les endpoints** health
4. **Activer progressivement** NeuroCore puis Evolution
5. **Intégrer les vrais providers AI** (OpenAI, Anthropic) après stabilisation