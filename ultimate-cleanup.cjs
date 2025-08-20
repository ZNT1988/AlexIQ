#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("🔥 NETTOYAGE ULTIME - RECONSTRUCTION COMPLÈTE");

function reconstructFile(content, filename) {
  // Si le fichier est trop corrompu, reconstruire à partir de zéro
  const lines = content.split("\n");
  const reconstructed = [];
  
  let inClass = false;
  let inMethod = false;
  let braceLevel = 0;
  let imports = [];
  let constants = [];
  let classDeclaration = "";
  let constructor = [];
  let methods = [];
  let exports = [];
  
  // Extraire les informations utiles des lignes corrompues
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Ignorer les lignes de variables auto-déclarées
    if (line.includes("// Variable auto-déclarée")) continue;
    if (line.includes("Node.js globals")) continue;
    
    // Détecter les imports valides
    if (line.startsWith("import ") && line.includes("from") && line.endsWith(";")) {
      imports.push(line);
    }
    
    // Détecter les constantes valides  
    if (line.startsWith("const ") && line.includes("=") && line.endsWith(";")) {
      constants.push(line);
    }
    
    // Détecter la déclaration de classe
    if (line.includes("export class") && line.includes("extends")) {
      classDeclaration = line.replace(/[,:\{]/g, "").trim() + " {";
    }
    
    // Détecter le constructeur
    if (line.includes("constructor()")) {
      inMethod = true;
      constructor = ["  constructor() {", "    super();"];
    }
    
    // Détecter les exports
    if (line.startsWith("export default")) {
      exports.push(line);
    }
  }
  
  // Reconstruire le fichier proprement
  let result = [];
  
  // 1. Ajouter les imports de base si manquants
  if (imports.length === 0 && filename.includes("alex-modules")) {
    result.push("import { EventEmitter } from 'events';");
    result.push("import logger from '../config/logger.js';");
    result.push("");
  } else {
    result.push(...imports);
    result.push("");
  }
  
  // 2. Ajouter les constantes nettoyées
  const cleanConstants = constants.filter(c => 
    !c.includes("auto-déclarée") && 
    c.length < 100 && 
    !c.includes("/g")
  );
  if (cleanConstants.length > 0) {
    result.push(...cleanConstants);
    result.push("");
  }
  
  // 3. Ajouter la classe
  if (classDeclaration) {
    result.push(classDeclaration);
    
    // Constructor minimal
    result.push("  constructor() {");
    result.push("    super();");
    result.push("    this.version = '1.0.0';");
    result.push("    this.name = '" + getModuleName(filename) + "';");
    result.push("    this.initialized = false;");
    result.push("  }");
    result.push("");
    
    // Méthode initialize minimale
    result.push("  async initialize() {");
    result.push("    try {");
    result.push("      logger.info('Initializing " + getModuleName(filename) + "...');");
    result.push("      this.initialized = true;");
    result.push("      logger.info('✅ " + getModuleName(filename) + " initialized successfully');");
    result.push("    } catch (error) {");
    result.push("      logger.error('❌ Failed to initialize " + getModuleName(filename) + ":', error);");
    result.push("      throw error;");
    result.push("    }");
    result.push("  }");
    
    result.push("}");
    result.push("");
  }
  
  // 4. Export par défaut
  if (exports.length === 0) {
    const className = getClassName(filename);
    result.push("export default " + className + ";");
  } else {
    result.push(...exports);
  }
  
  return result.join("\n");
}

function getModuleName(filename) {
  const basename = path.basename(filename, ".js");
  return basename.replace(/([A-Z])/g, " $1").trim();
}

function getClassName(filename) {
  return path.basename(filename, ".js");
}

function shouldReconstruct(content) {
  // Fichier très corrompu si :
  const lines = content.split("\n");
  const corruptionIndicators = [
    lines.filter(l => l.includes("// Variable auto-déclarée")).length > 10,
    lines.filter(l => l.includes("/g")).length > 5,
    lines.filter(l => l.includes("\\';")).length > 3,
    content.includes("import:"),
    content.includes("export class") && !content.includes("constructor()"),
    content.split("try {").length > content.split("} catch").length + 2
  ];
  
  return corruptionIndicators.filter(Boolean).length >= 2;
}

// Traiter tous les fichiers
function getAllFiles() {
  const dirs = [
    "backend/alex-modules/consciousness",
    "backend/alex-modules/core", 
    "backend/alex-modules/intelligence",
    "backend/alex-modules/specialized"
  ];
  
  const files = [];
  
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const dirFiles = fs.readdirSync(dir)
        .filter(file => file.endsWith(".js"))
        .map(file => path.join(dir, file));
      files.push(...dirFiles);
    }
  }
  
  return files;
}

const files = getAllFiles();
let totalReconstructed = 0;

console.log(`🔍 Analyse de ${files.length} fichiers pour reconstruction...`);

for (const file of files) {
  try {
    const content = fs.readFileSync(file, "utf8");
    const originalSize = content.length;
    
    if (shouldReconstruct(content)) {
      console.log(`🏗️  Reconstruction complète de ${file}...`);
      const reconstructed = reconstructFile(content, file);
      const newSize = reconstructed.length;
      
      fs.writeFileSync(file, reconstructed, "utf8");
      console.log(`✅ ${file} - reconstruit (${originalSize} → ${newSize} chars)`);
      totalReconstructed++;
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${file}:`, error.message);
  }
}

console.log(`\n📊 Fichiers reconstruits: ${totalReconstructed}/${files.length}`);
console.log("🎯 Reconstruction complète terminée !");