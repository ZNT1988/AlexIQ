// backend/services/google.js — Gemini via Vertex AI (service account)
import { GoogleAuth } from "google-auth-library";
import { AI_KEYS, GOOGLE_CFG } from "../config/aiKeys.js";

const CREDS = AI_KEYS.GOOGLE_SA ? JSON.parse(AI_KEYS.GOOGLE_SA) : null;
if (!CREDS) throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON");

const auth = new GoogleAuth({
  credentials: CREDS,
  scopes: [API_URL_1]
});

export async function callGemini(prompt) {
  const client = await auth.getClient();
  const url =
    `https://${GOOGLE_CFG.LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CFG.PROJECT_ID}` +
    `/locations/${GOOGLE_CFG.LOCATION}/publishers/google/models/${GOOGLE_CFG.MODEL}:generateContent`;

  const { data } = await client.request({
    url,
    method: "POST",
    data: { contents: [{ role: "user", parts: [{ text: String(prompt ?? "") }] }] }
  });

  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}