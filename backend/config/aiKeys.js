export const AI_KEYS = {
  OPENAI:    process.env.CLE_API_OPENAI || process.env.OPENAI_API_KEY || null,
  ANTHROPIC: process.env.CLE_API_ANTHROPIC || process.env.ANTHROPIC_API_KEY || null,
  GOOGLE:    process.env.CLE_API_GOOGLE || process.env.GOOGLE_API_KEY || null,
  GOOGLE_SA: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || null,
  GOOGLE_MAPS: process.env.GOOGLE_MAPS_API_KEY || null,
  JAVA_KEY:  process.env.JAVA_API_KEY || null
};

if (!AI_KEYS.OPENAI && !AI_KEYS.ANTHROPIC && !AI_KEYS.GOOGLE && !AI_KEYS.GOOGLE_SA) {
  console.warn('[aiKeys] No AI provider configured yet');
}

export default AI_KEYS;