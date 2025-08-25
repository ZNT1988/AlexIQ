# 🚂 Railway Deployment Guide - HustleFinder IA

## 🎯 Déploiement Backend Alex sur Railway

### 📋 Prérequis
1. Compte Railway créé
2. Clés API OpenAI et Anthropic 
3. Git repository connecté

## ⚠️ **PROBLÈME RÉSOLU** - Conflit package.json
**Issue:** Railway était confus par 2 fichiers package.json (root vs backend)
**Solution:** Suppression du backend/package.json conflictuel - Railway utilise maintenant ROOT uniquement

### 🚀 Steps de Déploiement

#### 1️⃣ **Créer un Nouveau Projet Railway**
```bash
# Dans le dashboard Railway
New Project → Deploy from GitHub → HustleFinder IA
```

#### 2️⃣ **Variables d'Environnement** 
Configurer dans Railway Dashboard > Variables :

```env
# Obligatoires
NODE_ENV=production
PORT=3003
HF_OWNER_NAME=Zakaria Housni (ZNT)

# API Keys (remplacer par vraies clés)
CLE_API_OPENAI=sk-proj-...
CLE_API_ANTHROPIC=sk-ant-...
CLE_API_GOOGLE=your_google_key

# Optionnelles
ALEX_MODE=production
CORS_ORIGIN=https://alexiq.site
DB_PATH=./data/production.db
```

#### 3️⃣ **Configuration Automatique**
Les fichiers sont déjà configurés :
- ✅ `railway.json` - Configuration Railway
- ✅ `nixpacks.toml` - Build settings  
- ✅ `railway-start.js` - Script de démarrage robuste
- ✅ `package.json` - Dependencies complètes

#### 4️⃣ **Déploiement**
```bash
git add .
git commit -m "🚂 Railway deployment ready"
git push origin main
```

Railway détectera automatiquement et déploiera !

### 🔍 **Vérification Post-Déploiement**

#### **Health Check**
```bash
curl https://your-app.up.railway.app/api/alex/status
```

**Réponse attendue :**
```json
{
  "ok": true,
  "orchestrator": true,
  "providers": {
    "openai": true,
    "anthropic": true,
    "google": true
  }
}
```

#### **Test Chat Alex**
```bash
curl -X POST https://your-app.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour Alex!"}'
```

#### **Test Capacités Modules**
```bash
curl https://your-app.up.railway.app/api/alex/capabilities
```

**Doit retourner :** `"operational": 127` (tous les modules)

### 🎛️ **Monitoring**

#### **Logs Railway**
```bash
railway logs
```

#### **Endpoints de Monitoring**
- `GET /api/alex/status` - Statut système
- `GET /api/alex/capabilities` - État des 127 modules  
- `GET /api/whoami` - Informations créateur

### 🔧 **Troubleshooting**

#### **Build Failed**
```bash
# Vérifier les logs build
railway logs --deployment
```

#### **Health Check Failed**  
```bash
# Vérifier que le port 3003 est bien configuré
# Vérifier les variables d'environnement
railway variables
```

#### **API Keys Issues**
```bash
# Re-configurer les clés dans Railway Dashboard
# Variables > Add Variable > CLE_API_OPENAI
```

### 🌐 **Domain Custom**

#### **Configurer alexiq.site**
1. Railway Dashboard > Settings > Domains
2. Add Custom Domain : `api.alexiq.site`  
3. Configurer DNS CNAME vers Railway

### 📊 **Architecture Finale**

```
Utilisateur → alexiq.site (Frontend Vercel)
                    ↓ API calls
            api.alexiq.site (Backend Railway)
                    ↓
              Alex 127 Modules ✅
```

### 🎉 **Succès !**

Si tout fonctionne :
- ✅ Health check répond `200 OK`
- ✅ Chat Alex fonctionne 
- ✅ 127/127 modules opérationnels
- ✅ Zakaria Housni (ZNT) reconnu comme créateur

**🚀 Alex est LIVE sur Railway !**