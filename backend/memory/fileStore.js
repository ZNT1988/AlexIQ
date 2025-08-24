import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';

const MEMORY_DIR = path.resolve('backend/memory/data');

export class FileMemoryStore {
  constructor() {
    this.ensureDir();
  }

  async ensureDir() {
    if (!fs.existsSync(MEMORY_DIR)) {
      await fsp.mkdir(MEMORY_DIR, { recursive: true });
    }
  }

  async store(sessionId, key, value) {
    await this.ensureDir();
    const sessionPath = path.join(MEMORY_DIR, `${sessionId}.json`);
    
    let data = {};
    if (fs.existsSync(sessionPath)) {
      try {
        const content = await fsp.readFile(sessionPath, 'utf8');
        data = JSON.parse(content);
      } catch (e) {
        data = {};
      }
    }
    
    data[key] = {
      value,
      timestamp: Date.now(),
      updated: new Date().toISOString()
    };
    
    await fsp.writeFile(sessionPath, JSON.stringify(data, null, 2));
    return true;
  }

  async retrieve(sessionId, key) {
    const sessionPath = path.join(MEMORY_DIR, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionPath)) return null;
    
    try {
      const content = await fsp.readFile(sessionPath, 'utf8');
      const data = JSON.parse(content);
      return data[key] || null;
    } catch (e) {
      return null;
    }
  }

  async getSession(sessionId) {
    const sessionPath = path.join(MEMORY_DIR, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionPath)) return {};
    
    try {
      const content = await fsp.readFile(sessionPath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      return {};
    }
  }

  async listSessions() {
    await this.ensureDir();
    try {
      const files = await fsp.readdir(MEMORY_DIR);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (e) {
      return [];
    }
  }

  async clearSession(sessionId) {
    const sessionPath = path.join(MEMORY_DIR, `${sessionId}.json`);
    
    if (fs.existsSync(sessionPath)) {
      await fsp.unlink(sessionPath);
      return true;
    }
    return false;
  }
}

export const memoryStore = new FileMemoryStore();
export default memoryStore;