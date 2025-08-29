# 🚀 DEPLOYMENT GUIDE - Alex HustleFinder AI

## Production Architecture

```
🌐 Internet
    ↓ (HTTPS)
🔒 Caddy (Reverse Proxy + TLS)
    ↓ (HTTP)
🖥️  PM2 (Process Manager)
    ↓
🤖 Alex Backend (Node.js)
    ↓
🗄️  SQLite Databases
```

## 🏗️ Infrastructure Setup

### 1. Prérequis système
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# Install SQLite3
sudo apt install -y sqlite3
```

### 2. Utilisateur système
```bash
# Créer utilisateur alex
sudo adduser --system --group --home /var/www/alex alex
sudo mkdir -p /var/www/alex /var/log/alex /var/backups/alex
sudo chown -R alex:alex /var/www/alex /var/log/alex /var/backups/alex
```

### 3. Déploiement du code
```bash
# Clone repository
sudo -u alex git clone https://github.com/znt1988/alexiq.git /var/www/alex
cd /var/www/alex
sudo -u alex npm ci
```

### 4. Configuration environnement
```bash
# Copier et configurer .env
sudo -u alex cp .env.example .env
sudo -u alex nano .env  # Configurer les clés API
```

### 5. Services systemd
```bash
# Installer les services
sudo cp systemd/*.service /etc/systemd/system/
sudo cp systemd/*.timer /etc/systemd/system/
sudo systemctl daemon-reload

# Activer et démarrer
sudo systemctl enable alex-backend.service
sudo systemctl enable alex-backup.timer
sudo systemctl start alex-backend.service
sudo systemctl start alex-backup.timer
```

### 6. Configuration Caddy
```bash
# Installer la configuration
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 🔧 Configuration détaillée

### Variables d'environnement (.env)
```bash
# Identity
HF_OWNER_NAME="Votre Nom"

# AI Providers (par priorité)
CLE_API_OPENAI=sk-xxx
CLE_API_ANTHROPIC=xxx
CLE_API_GOOGLE=xxx

# Google Services
GOOGLE_MAPS_API_KEY=xxx
GOOGLE_PROJECT_ID=xxx
GOOGLE_LOCATION=europe-west9
```

### PM2 Configuration (ecosystem.config.js)
- ✅ Production: Port 3000
- ✅ Staging: Port 3001  
- ✅ Logs: `/var/log/alex/`
- ✅ Auto-restart: 512M memory limit
- ✅ Worker process pour tâches async

### Caddy Configuration
- ✅ TLS automatique Let's Encrypt
- ✅ Rate limiting: 100 req/min par IP
- ✅ Headers sécurité (HSTS, XSS Protection)
- ✅ CORS configuré
- ✅ Health checks automatiques
- ✅ Logs JSON structurés

## 🏥 Monitoring & Health Checks

### Health Check Endpoint
```bash
curl http://localhost:3000/health
```

Retourne:
```json
{
  "status": "healthy",
  "health": {
    "score": 100,
    "modulesInitialized": "4/4"
  },
  "modules": {
    "ownerIdentity": {"initialized": true},
    "alexAuthenticCore": {"initialized": true},
    "alexIntelligentCore": {"initialized": true},
    "autonomyCore": {"initialized": true}
  }
}
```

### Vérification services
```bash
# Status backend
sudo systemctl status alex-backend

# Status backup timer
sudo systemctl status alex-backup.timer

# Logs en temps réel
sudo journalctl -f -u alex-backend

# PM2 status
sudo -u alex pm2 status
sudo -u alex pm2 logs
```

## 💾 Backup & Recovery

### Backup automatique
- ✅ Timer systemd: quotidien à 3h
- ✅ Rétention: 7 jours
- ✅ Vérification intégrité SQLite
- ✅ Logs détaillés

### Commandes backup
```bash
# Backup manuel
sudo -u alex /var/www/alex/scripts/backup-db.sh

# Vérifier backups
ls -la /var/backups/alex/

# Restaurer backup
cp /var/backups/alex/intelligent-20250829.db /var/www/alex/backend/data/alex_intelligent_core.db
sudo chown alex:alex /var/www/alex/backend/data/*.db
```

## 🚀 CI/CD Pipeline

### GitHub Actions
- ✅ Tests automatiques sur PR
- ✅ Smoke tests obligatoires
- ✅ Déploiement staging automatique
- ✅ Déploiement production sur main
- ✅ Health checks post-déploiement
- ✅ Backup automatique après déploiement

### Secrets requis
```
STAGING_HOST=dell.local
STAGING_USER=alex
STAGING_SSH_KEY=xxx

TOUR_A_HOST=tour-a.local
TOUR_B_HOST=tour-b.local
PROD_USER=alex
PROD_SSH_KEY=xxx
```

## 🔒 Sécurité

### Hardening systemd
- ✅ NoNewPrivileges
- ✅ ProtectSystem=strict
- ✅ PrivateTmp
- ✅ ReadWritePaths limités

### Caddy Security Headers
- ✅ HSTS
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin

### Network Security
- ✅ Rate limiting par IP
- ✅ CORS configuré
- ✅ Backend non exposé (localhost only)

## 🎯 Architecture "Petit Cloud Perso"

```
📡 Tour A (Production)
├── alex-backend (PM2)
├── caddy (reverse proxy)
└── backup quotidien

📡 Tour B (Production Mirror) 
├── alex-backend (PM2)
├── caddy (reverse proxy)
└── backup quotidien

💻 Dell (Staging)
├── alex-backend (PM2, port 3001)
├── tests automatiques
└── validation pré-prod
```

## 🚦 Commandes de déploiement

### Production
```bash
# Via PM2 ecosystem
cd /var/www/alex
git pull origin main
npm ci
pm2 reload ecosystem.config.js --env production

# Via systemd
sudo systemctl restart alex-backend
```

### Staging  
```bash
cd /var/www/alex-staging
git pull origin develop
npm ci
node backend/run-all-smoke-tests.js
pm2 reload ecosystem.config.js --env staging
```

---

## ✅ Checklist déploiement

- [ ] Node.js 18+ installé
- [ ] PM2 installé globalement  
- [ ] Caddy installé et configuré
- [ ] Utilisateur alex créé
- [ ] Repository cloné dans /var/www/alex
- [ ] .env configuré avec clés API
- [ ] Services systemd activés
- [ ] Health check OK (score 100%)
- [ ] Backup timer actif
- [ ] GitHub Actions configuré
- [ ] DNS pointant vers serveur
- [ ] Certificat TLS automatique
- [ ] Tests smoke passent 100%