// backend/config/aiKeys.js
import 'dotenv/config';

const must = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
};

export const AI_KEYS = {
  OPENAI:    process.env.CLE_API_OPENAI || process.env.OPENAI_API_KEY || must('CLE_API_OPENAI'),
  ANTHROPIC: process.env.CLE_API_ANTHROPIC || process.env.ANTHROPIC_API_KEY || must('CLE_API_ANTHROPIC'),
  GOOGLE:    process.env.CLE_API_GOOGLE || process.env.GOOGLE_API_KEY || null,
  GOOGLE_SA: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || null
};

export const GOOGLE_CFG = {
  PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
  LOCATION:   process.env.GOOGLE_LOCATION || 'us-central1',
  MODEL:      process.env.GOOGLE_VERTEX_MODEL || 'gemini-1.5-flash'
};