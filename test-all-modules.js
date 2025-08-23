#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const baseDir = './backend/alex-modules';

async function getAllModules() {
  const modules = [];
  
  async function scanDir(dir) {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await scanDir(fullPath);
      } else if (item.endsWith('.js') && !item.startsWith('_')) {
        modules.push(fullPath);
      }
    }
  }
  
  await scanDir(baseDir);
  return modules;
}

async function testModule(modulePath) {
  try {
    const module = await import(modulePath);
    const exports = Object.keys(module);
    
    if (exports.length === 0) {
      return { status: '⚠️ VIDE', exports: [], error: 'Aucun export' };
    }
    
    // Test si contient des classes
    const classes = exports.filter(name => {
      try {
        return typeof module[name] === 'function' && module[name].prototype;
      } catch {
        return false;
      }
    });
    
    return { 
      status: '✅ OK', 
      exports, 
      classes,
      hasClasses: classes.length > 0
    };
  } catch (error) {
    return { 
      status: '❌ ERREUR', 
      error: error.message.substring(0, 100)
    };
  }
}

async function main() {
  console.log('🔍 AUDIT COMPLET DES MODULES ALEX\n');
  
  const modules = await getAllModules();
  console.log(`📁 ${modules.length} modules détectés\n`);
  
  const results = {
    working: [],
    broken: [],
    empty: []
  };
  
  for (const modulePath of modules) {
    const relativePath = modulePath.replace('./backend/alex-modules/', '');
    const result = await testModule(modulePath);
    
    console.log(`${result.status} ${relativePath}`);
    if (result.error) {
      console.log(`   └─ ${result.error}`);
    }
    if (result.exports?.length) {
      console.log(`   └─ Exports: ${result.exports.join(', ')}`);
    }
    
    if (result.status === '✅ OK' && result.hasClasses) {
      results.working.push({ path: relativePath, ...result });
    } else if (result.status === '❌ ERREUR') {
      results.broken.push({ path: relativePath, error: result.error });
    } else {
      results.empty.push({ path: relativePath });
    }
  }
  
  console.log('\n📊 RÉSULTATS:');
  console.log(`✅ Modules fonctionnels: ${results.working.length}`);
  console.log(`❌ Modules cassés: ${results.broken.length}`);
  console.log(`⚠️ Modules vides: ${results.empty.length}`);
  
  if (results.working.length > 0) {
    console.log('\n🎯 MODULES UTILISABLES:');
    results.working.forEach(m => {
      console.log(`  • ${m.path} - Classes: ${m.classes.join(', ')}`);
    });
  }
  
  return results;
}

main().catch(console.error);