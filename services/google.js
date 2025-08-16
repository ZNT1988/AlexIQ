// Import du service Vertex AI
import { callGemini } from "./google-vertex.js";

// Export pour compatibilité
export async function callGoogle(prompt) {
  return await callGemini(prompt);
}