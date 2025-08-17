#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const services = [
  "backend/services/openai.js",
  "backend/services/anthropic.js",
  "backend/services/google.js"
];

let ok = true;
for (const s of services) {
  if (!fs.existsSync(s)) { console.log(`❌ Manquant: ${s}`); ok = false; continue; }
  const src = fs.readFileSync(s, "utf8");
  if (/Authorization:\s*`Bearer\s*\$\{AI_KEYS\.OPENAI\}`/.test(src)) {
    console.log("✅ OpenAI headers OK");
  } else if (s.includes("openai")) { console.log("⚠️ OpenAI headers à vérifier"); ok = false; }
  if (/['"]x-api-key['"]\s*:\s*AI_KEYS\.ANTHROPIC/.test(src)) {
    console.log("✅ Anthropic headers OK");
  } else if (s.includes("anthropic")) { console.log("⚠️ Anthropic headers à vérifier"); ok = false; }
  if (/aiplatform\.googleapis\.com/.test(src)) {
    console.log("✅ Vertex (Gemini) endpoint OK");
  } else if (s.includes("google")) { console.log("⚠️ Vertex endpoint à vérifier"); ok = false; }
}
process.exit(ok ? 0 : 1);