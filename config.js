import "dotenv/config";

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;

if (!OPENAI_KEY || !ANTHROPIC_KEY || !GOOGLE_KEY) {
  console.warn("⚠️ Certaines clés API sont manquantes - mode développement");
}

export { OPENAI_KEY, ANTHROPIC_KEY, GOOGLE_KEY };