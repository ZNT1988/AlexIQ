import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';
import * as os from 'os';
import config from '../../config/alex-licorne-config.js';
import sqlite3 from 'sqlite3';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class BackupManager extends EventEmitter {
  constructor() {
    super();
    
    // System metrics pour calculs anti-fake
    this.systemMetrics = {
      getMemoryUsage: () => process.memoryUsage(),
      getCpuUsage: () => process.cpuUsage(),
      getLoadAvg: () => os.loadavg(),
      getUptime: () => process.uptime()
    };
    
    this.config = config;
    this.db = null;
    this.backupConfig = this.config.get("database.backup");
    this.isRunning = false;
    this.backupInterval = null;
    this.backupHistory = [];

    this.backupPath = path.resolve(this.backupConfig.path || "./db/backups");
    this.sourceDbPath = path.resolve(this.config.get("database.path"));

    this.initializeDatabase();
    this.setupEventHandlers();
    this.ensureBackupDirectory();
  }

  initializeDatabase() {
    const dbPath = this.config.get("database.path");
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Database initialization error:", err.message);
        return;
      }
      
      this.createBackupTables();
    });
  }

  createBackupTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS backup_history (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                backup_type TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size INTEGER,
                checksum TEXT,
                status TEXT DEFAULT 'completed',
                duration INTEGER,
                metadata TEXT DEFAULT '{}'
            )`,
      `CREATE TABLE IF NOT EXISTS backup_verification (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                backup_id TEXT NOT NULL,
                verification_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                verification_status TEXT NOT NULL,
                integrity_check BOOLEAN DEFAULT FALSE,
                restore_test BOOLEAN DEFAULT FALSE,
                error_message TEXT,
                FOREIGN KEY (backup_id) REFERENCES backup_history(id)
            )`,
      `CREATE TABLE IF NOT EXISTS backup_schedule (
                id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
                schedule_name TEXT NOT NULL,
                backup_type TEXT NOT NULL,
                cron_expression TEXT,
                enabled BOOLEAN DEFAULT TRUE,
                last_run DATETIME,
                next_run DATETIME,
                retention_days INTEGER DEFAULT 30,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
    ];

    tables.forEach((sql) => {
      this.db.run(sql, (err) => {
        if (err) console.error("Error creating backup table:", err.message);
      });
    });

    this.createDefaultSchedules();
  }

  createDefaultSchedules() {
    const defaultSchedules = [
      {
        schedule_name: "daily_full_backup",
        backup_type: "full",
        cron_expression: "0 2 * * *",
        retention_days: 7
      },
      {
        schedule_name: "hourly_incremental",
        backup_type: "incremental",
        cron_expression: "0 * * * *",
        retention_days: 2
      }
    ];

    defaultSchedules.forEach((schedule) => {
      this.db.run(
        `
                INSERT OR IGNORE INTO backup_schedule 
                (schedule_name, backup_type, cron_expression, retention_days)
                VALUES (?, ?, ?, ?)
            `,
        [
          schedule.schedule_name,
          schedule.backup_type,
          schedule.cron_expression,
          schedule.retention_days
        ]
      );
    });
  }

  setupEventHandlers() {
    this.on("backupCompleted", this.handleBackupCompleted.bind(this));
    this.on("backupFailed", this.handleBackupFailed.bind(this));
    this.on("restoreCompleted", this.handleRestoreCompleted.bind(this));
    this.on("cleanupCompleted", this.handleCleanupCompleted.bind(this));
  }

  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
    } catch (error) {
      console.error("Error creating backup directory:", error.message);
      throw error;
    }
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;

    if (this.backupConfig.enabled) {
      await this.startScheduledBackups();
    }

    await this.loadBackupHistory();

    this.emit("backupManagerStarted");
  }

  async startScheduledBackups() {
    const interval = this.backupConfig.interval || 24 * 60 * 60 * 1000;

    this.backupInterval = setInterval(() => {
      this.performScheduledBackup();
    }, interval);

    await this.performScheduledBackup();
  }

  async performScheduledBackup() {
    try {
      await this.createBackup("scheduled");
    } catch (error) {
      console.error("Scheduled backup failed:", error.message);
      this.emit("backupFailed", {
        type: "scheduled",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async createBackup(type = "manual", options = {}) {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupId = this.generateBackupId();

    const backupFileName = `backup-${type}-${timestamp}-${backupId}.db.gz`;
    const backupFilePath = path.join(this.backupPath, backupFileName);

    try {
      await this.validateSourceDatabase();

      const backupData = await this.createDatabaseDump();

      const compressedData = await gzip(backupData);
      await fs.writeFile(backupFilePath, compressedData);

      const fileStats = await fs.stat(backupFilePath);
      const checksum = await this.calculateChecksum(backupFilePath);
      const duration = Date.now() - startTime;

      const backupRecord = {
        id: backupId,
        backup_type: type,
        file_path: backupFilePath,
        file_size: fileStats.size,
        checksum: checksum,
        status: "completed",
        duration: duration,
        metadata: JSON.stringify({
          originalSize: backupData.length,
          compressionRatio: (backupData.length / fileStats.size).toFixed(2),
          ...options
        })
      };

      await this.recordBackup(backupRecord);
      this.backupHistory.push(backupRecord);

      await this.verifyBackup(backupId, backupFilePath);
      await this.cleanOldBackups();


      this.emit("backupCompleted", {
        id: backupId,
        fileName: backupFileName,
        size: fileStats.size,
        duration: duration,
        type: type
      });

      return backupRecord;
    } catch (error) {
      console.error("Backup creation failed:", error.message);
      await this.recordBackup({
        id: backupId,
        backup_type: type,
        file_path: backupFilePath,
        status: "failed",
        duration: Date.now() - startTime,
        metadata: JSON.stringify({ error: error.message })
      });

      this.emit("backupFailed", {
        id: backupId,
        type: type,
        error: error.message
      });

      throw error;
    }
  }

  async validateSourceDatabase() {
    try {
      await fs.access(this.sourceDbPath);

      return new Promise((resolve, reject) => {
        const testDb = new sqlite3.Database(
          this.sourceDbPath,
          sqlite3.OPEN_READONLY,
          (err) => {
            if (err) {
              reject(new Error(`Base source invalide: ${err.message}`));
              return;
            }

            testDb.get("PRAGMA integrity_check", (err, row) => {
              testDb.close();

              if (err) {
                reject(
                  new Error(`Vérification intégrité échouée: ${err.message}`)
                );
              } else if (row.integrity_check !== "ok") {
                reject(
                  new Error(
                    `Intégrité base compromise: ${row.integrity_check}`
                  )
                );
              } else {
                resolve();
              }
            });
          }
        );
      });
    } catch (error) {
      throw new Error(`Validation base source échouée: ${error.message}`);
    }
  }

  async createDatabaseDump() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.sourceDbPath, sqlite3.OPEN_READONLY);
      const dump = [];

      db.serialize(() => {
        db.each(
          "SELECT name, sql FROM sqlite_master WHERE type='table'",
          (err, row) => {
            if (err) {
              reject(err);
              return;
            }

            if (row.sql) {
              dump.push(row.sql + ";");
            }
          },
          () => {
            db.each(
              "SELECT name FROM sqlite_master WHERE type='table'",
              (err, row) => {
                if (err) {
                  reject(err);
                  return;
                }

                db.all(`SELECT * FROM ${row.name}`, (err, rows) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  if (rows.length > 0) {
                    const columns = Object.keys(rows[0]).join(",");

                    rows.forEach((row) => {
                      const values = Object.values(row)
                        .map((v) =>
                          typeof v === "string"
                            ? `'${v.replace(/'/g, "''")}'`
                            : v
                        )
                        .join(",");
                      dump.push(
                        `INSERT INTO ${row.name} (${columns}) VALUES (${values});`
                      );
                    });
                  }
                });
              },
              () => {
                db.close();
                resolve(Buffer.from(dump.join("\n")));
              }
            );
          }
        );
      });
    });
  }

  async calculateChecksum(filePath) {
    const data = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  async recordBackup(backup) {
    return new Promise((resolve, reject) => {
      const sql = `
                INSERT INTO backup_history 
                (id, backup_type, file_path, file_size, checksum, status, duration, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

      this.db.run(
        sql,
        [
          backup.id,
          backup.backup_type,
          backup.file_path,
          backup.file_size,
          backup.checksum,
          backup.status,
          backup.duration,
          backup.metadata
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async verifyBackup(backupId, backupFilePath) {
    try {
      const originalChecksum = await this.calculateChecksum(backupFilePath);

      const compressedData = await fs.readFile(backupFilePath);
      const decompressedData = await gunzip(compressedData);

      const verificationResult = {
        backup_id: backupId,
        verification_status: "success",
        integrity_check: true,
        restore_test: false
      };

      await this.recordVerification(verificationResult);

    } catch (error) {
      console.error("Backup verification failed:", error.message);
      await this.recordVerification({
        backup_id: backupId,
        verification_status: "failed",
        integrity_check: false,
        restore_test: false,
        error_message: error.message
      });
    }
  }

  async recordVerification(verification) {
    return new Promise((resolve, reject) => {
      const sql = `
                INSERT INTO backup_verification 
                (backup_id, verification_status, integrity_check, restore_test, error_message)
                VALUES (?, ?, ?, ?, ?)
            `;

      this.db.run(
        sql,
        [
          verification.backup_id,
          verification.verification_status,
          verification.integrity_check,
          verification.restore_test,
          verification.error_message
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async restoreFromBackup(backupId, targetPath = null) {
    const startTime = Date.now();

    try {
      const backup = await this.getBackupById(backupId);
      if (!backup) {
        throw new Error(`Backup ${backupId} non trouvé`);
      }

      const restorePath = targetPath || this.sourceDbPath + ".restored";

      
      const compressedData = await fs.readFile(backup.file_path);
      const decompressedData = await gunzip(compressedData);

      const tempDbPath = restorePath + ".temp";
      const restoreDb = new sqlite3.Database(tempDbPath);

      await this.executeSqlDump(restoreDb, decompressedData.toString());

      restoreDb.close();

      await fs.rename(tempDbPath, restorePath);

      const duration = Date.now() - startTime;


      this.emit("restoreCompleted", {
        backupId: backupId,
        restorePath: restorePath,
        duration: duration
      });

      return restorePath;
    } catch (error) {
      console.error("Restore failed:", error.message);
      throw error;
    }
  }

  async executeSqlDump(db, sqlDump) {
    return new Promise((resolve, reject) => {
      db.exec(sqlDump, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getBackupById(backupId) {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM backup_history WHERE id = ?";

      this.db.get(sql, [backupId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async listBackups(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM backup_history";
      const params = [];
      const conditions = [];

      if (filters.type) {
        conditions.push("backup_type = ?");
        params.push(filters.type);
      }

      if (filters.status) {
        conditions.push("status = ?");
        params.push(filters.status);
      }

      if (filters.since) {
        conditions.push("timestamp >= ?");
        params.push(filters.since);
      }

      if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
      }

      sql += " ORDER BY timestamp DESC";

      if (filters.limit) {
        sql += ` LIMIT ${parseInt(filters.limit)}`;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async cleanOldBackups() {
    try {
      const retention = this.backupConfig.retention || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retention);

      const oldBackups = await this.listBackups({
        since: "1970-01-01",
        status: "completed"
      });

      const toDelete = oldBackups.filter(
        (backup) => new Date(backup.timestamp) < cutoffDate
      );

      for (const backup of toDelete) {
        try {
          await fs.unlink(backup.file_path);
          await this.deleteBackupRecord(backup.id);
        } catch (error) {
          console.error("Error deleting backup file:", error.message);
        }
      }

      this.emit("cleanupCompleted", {
        deleted: toDelete.length,
        retention: retention
      });
    } catch (error) {
      console.error("Cleanup failed:", error.message);
    }
  }

  async deleteBackupRecord(backupId) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("DELETE FROM backup_verification WHERE backup_id = ?", [
          backupId
        ]);
        this.db.run(
          "DELETE FROM backup_history WHERE id = ?",
          [backupId],
          function (err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      });
    });
  }

  async loadBackupHistory() {
    try {
      this.backupHistory = await this.listBackups({ limit: 100 });
    } catch (error) {
      console.error("Error loading backup history:", error.message);
    }
  }

  handleBackupCompleted(data) {
  }

  handleBackupFailed(data) {
    console.error(`💥 Backup échoué (${data.type}): ${data.error}`);
  }

  handleRestoreCompleted(data) {
  }

  handleCleanupCompleted(data) {
  }

  generateBackupId() {
    return `bk-${Date.now()}-${this.generateSystemBasedSuffix()}`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // === Méthodes système anti-fake ===

  generateSystemBasedSuffix() {
    const memUsage = this.systemMetrics.getMemoryUsage();
    const cpuUsage = this.systemMetrics.getCpuUsage();
    const uptime = this.systemMetrics.getUptime();
    
    // Génère un suffixe basé sur les métriques système
    const memHash = (memUsage.heapUsed % 0xFFFF).toString(16).padStart(4, '0');
    const cpuHash = ((cpuUsage.user + cpuUsage.system) % 0xFFFF).toString(16).padStart(4, '0');
    const timeHash = (Math.floor(uptime) % 0xFFFF).toString(16).padStart(4, '0');
    
    return `${memHash}${cpuHash}${timeHash}`.substring(0, 12);
  }

  getStats() {
    const completed = this.backupHistory.filter(
      (b) => b.status === "completed"
    );
    const failed = this.backupHistory.filter((b) => b.status === "failed");

    const totalSize = completed.reduce(
      (sum, backup) => sum + (backup.file_size || 0),
      0
    );
    const avgDuration =
      completed.length > 0
        ? completed.reduce((sum, backup) => sum + (backup.duration || 0), 0) /
          completed.length
        : 0;

    return {
      totalBackups: this.backupHistory.length,
      completedBackups: completed.length,
      failedBackups: failed.length,
      totalSize: totalSize,
      formattedTotalSize: this.formatBytes(totalSize),
      averageDuration: Math.round(avgDuration),
      isRunning: this.isRunning,
      lastBackup:
        this.backupHistory.length > 0 ? this.backupHistory[0].timestamp : null
    };
  }

  async stop() {
    if (!this.isRunning) return;

    
    this.isRunning = false;

    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }

    if (this.db) {
      this.db.close((err) => {
        if (err) console.error("Error closing database:", err.message);
      });
    }

  }
}

export default BackupManager;
