let backend; // Variable auto-déclarée
let config; // Variable auto-déclarée
let dotenv; // Variable auto-déclarée
let us; // Variable auto-déclarée
let gemini; // Variable auto-déclarée

// backend/config/aiKeys.js
import "dotenv/config";

const must = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
};

export const AI_KEYS = {
  OPENAI:    process?.env?.CLE_API_OPENAI || process?.env?.OPENAI_API_KEY || null,
  ANTHROPIC: process?.env?.CLE_API_ANTHROPIC || process?.env?.ANTHROPIC_API_KEY || null,
  GOOGLE:    process?.env?.CLE_API_GOOGLE || process?.env?.GOOGLE_API_KEY || null,
  GOOGLE_SA: process?.env?.GOOGLE_APPLICATION_CREDENTIALS_JSON || null,
  GOOGLE_MAPS: process?.env?.GOOGLE_MAPS_API_KEY || null,
  JAVA_KEY: process?.env?.JAVA_API_KEY || null
};

if (!AI_KEYS.OPENAI && !AI_KEYS.ANTHROPIC && !AI_KEYS.GOOGLE && !AI_KEYS.GOOGLE_SA) {
  throw new Error("No AI provider configured");
}

export const GOOGLE_CFG = {
  PROJECT_ID: process?.env?.GOOGLE_PROJECT_ID,
  LOCATION:   process?.env?.GOOGLE_LOCATION || "us-central1",
  MODEL:      process?.env?.GOOGLE_VERTEX_MODEL || "gemini-1.5-flash"
};