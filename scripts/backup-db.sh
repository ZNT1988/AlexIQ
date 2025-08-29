#!/bin/bash

# 💾 BACKUP AUTOMATIQUE DES BASES SQLITE
# Script de sauvegarde automatique avec rotation

set -euo pipefail

# Configuration
BACKUP_DIR="/var/backups/alex"
DATA_DIR="$(dirname "$0")/../backend/data"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d%H%M)

# Créer le répertoire de backup
mkdir -p "$BACKUP_DIR"

echo "🔄 Démarrage backup SQLite - $(date)"

# Fonction de backup pour une base
backup_db() {
    local db_file="$1"
    local db_name="$2"
    
    if [[ -f "$DATA_DIR/$db_file" ]]; then
        echo "📀 Backup $db_name..."
        sqlite3 "$DATA_DIR/$db_file" ".backup $BACKUP_DIR/${db_name}-${DATE}.db"
        
        # Vérifier l'intégrité
        if sqlite3 "$BACKUP_DIR/${db_name}-${DATE}.db" "PRAGMA integrity_check;" | grep -q "ok"; then
            echo "✅ Backup $db_name OK ($(du -h "$BACKUP_DIR/${db_name}-${DATE}.db" | cut -f1))"
        else
            echo "❌ Erreur intégrité backup $db_name"
            rm -f "$BACKUP_DIR/${db_name}-${DATE}.db"
            exit 1
        fi
    else
        echo "⚠️  Base $db_name non trouvée: $DATA_DIR/$db_file"
    fi
}

# Backup de chaque base
backup_db "alex_intelligent_core.db" "intelligent"
backup_db "alexauthenticcore_learning.db" "authentic" 
backup_db "autonomy_core.db" "autonomy"

# Nettoyage des anciens backups
echo "🧹 Nettoyage backups > $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -name "*.db" -type f -mtime +$RETENTION_DAYS -delete

# Statistiques
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*-${DATE}.db" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo "📊 Backup terminé:"
echo "   - Bases sauvées: $BACKUP_COUNT"
echo "   - Taille totale: $TOTAL_SIZE"
echo "   - Rétention: $RETENTION_DAYS jours"

# Optionnel: envoyer vers un stockage distant
# rsync -az "$BACKUP_DIR/" user@backup-server:/alex-backups/
# rclone copy "$BACKUP_DIR/" remote:alex-backups/

echo "✅ Backup complet - $(date)"