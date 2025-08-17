/**
 * @fileoverview Database Configuration - PostgreSQL avec fallback SQLite
 * Configuration hybride avec fallback automatique SQLite pour développement
 */

import pg from "pg";
import { fileURLToPath } from "url";
import path from "path";

// Import SQLite fallback functions
import {
  initializeDatabase as initSQLite,
  testConnection as testSQLite,
  query as querySQLite,
  withTransaction as withTransactionSQLite,
  closeDatabase as closeSQLite
} from "./database-sqlite.js";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration PostgreSQL
const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000 // Return an error after 2 seconds if connection could not be established
};

// Pool de connexions PostgreSQL
let pool = null;
let isConnected = false;
let usingSQLiteFallback = false;

// Initialize PostgreSQL pool
if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "sqlite") {
  try {
    pool = new Pool(config);
    
    pool.on("error", (err) => {
      console.error("PostgreSQL pool error:", err.message);
      process.exit(-1);
    });
    
    // Test connection
    pool.connect((err, client, release) => {
      if (err) {
        console.error("PostgreSQL connection failed, falling back to SQLite:", err.message);
        usingSQLiteFallback = true;
        initSQLite();
      } else {
        isConnected = true;
        release();
      }
    });
  } catch (error) {
    console.error("Error initializing PostgreSQL pool:", error.message);
    usingSQLiteFallback = true;
  }
} else {
  console.log("🔄 Using SQLite database (development mode)");
  usingSQLiteFallback = true;
}

/**
 * Execute a database query with automatic fallback
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function query(text, params = []) {
  if (usingSQLiteFallback) {
    return await querySQLite(text, params);
  }
  
  if (!pool) {
    throw new Error("Database not initialized");
  }
  
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    return res;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
}

/**
 * Execute a transaction with automatic fallback
 * @param {Function} callback - Transaction callback
 * @returns {Promise<any>} Transaction result
 */
export async function withTransaction(callback) {
  if (usingSQLiteFallback) {
    return await withTransactionSQLite(callback);
  }
  
  if (!pool) {
    throw new Error("Database not initialized");
  }
  
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
export async function testConnection() {
  if (usingSQLiteFallback) {
    return await testSQLite();
  }
  
  if (!pool) {
    return false;
  }
  
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error.message);
    return false;
  }
}

/**
 * Initialize database (create tables if needed)
 * @returns {Promise<void>}
 */
export async function initializeDatabase() {
  if (usingSQLiteFallback) {
    return await initSQLite();
  }
  
  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS ideas (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100),
        implementation_difficulty INTEGER CHECK (implementation_difficulty BETWEEN 1 AND 10),
        market_potential INTEGER CHECK (market_potential BETWEEN 1 AND 10),
        tags JSONB DEFAULT '[]'::jsonb,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        priority INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    throw error;
  }
}

/**
 * Close database connection
 * @returns {Promise<void>}
 */
export async function closeDatabase() {
  if (usingSQLiteFallback) {
    return await closeSQLite();
  }
  
  if (pool) {
    await pool.end();
  }
}

export { isConnected, usingSQLiteFallback };