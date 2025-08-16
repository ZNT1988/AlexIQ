// services/google-vertex.js — Gemini via Vertex AI (service account)
import { GoogleAuth } from "google-auth-library";

// Supporte JSON direct OU Base64 (au cas où la plateforme n'accepte pas le multi-ligne)
let CREDS;
try {
  CREDS = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    : JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_B64 || "", "base64").toString("utf8"));
} catch (error) {
  console.warn("⚠️ Google Vertex AI credentials not configured properly, using fallback");
  CREDS = null;
}

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID || CREDS?.project_id;
const LOCATION   = process.env.GOOGLE_LOCATION   || "us-central1";
const MODEL      = process.env.GOOGLE_VERTEX_MODEL || "gemini-1.5-flash";

let auth = null;
if (CREDS) {
  auth = new GoogleAuth({
    credentials: CREDS,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"]
  });
}

export async function callGemini(prompt) {
  if (!CREDS || !auth || !PROJECT_ID) {
    return "Google Vertex AI non configuré - Service account manquant";
  }

  try {
    const client = await auth.getClient();
    const url =
      `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}` +
      `/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

    const { data } = await client.request({
      url,
      method: "POST",
      data: { contents: [{ role: "user", parts: [{ text: String(prompt ?? "") }] }] }
    });

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Pas de réponse Gemini";
  } catch (error) {
    console.error("❌ Erreur Google Vertex AI:", error.message);
    return `Erreur Gemini Vertex - ${error.message}`;
  }
}