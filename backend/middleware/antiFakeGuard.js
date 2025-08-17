// Middleware/garde pour vérifier que la réponse IA est bien dynamique.
// - Si provider/meta manquent OU contenu ressemble à du statique → log WARN + tag headers.
export function validateAiResponse(res, payload) {
  try {
    const content = String(payload?.content ?? "");
    const provider = payload?.meta?.provider || payload?.provider || "unknown";
    const model = payload?.meta?.model || payload?.model || "unknown";
    let isSuspicious = false;

    // Règles simples de suspicion (tu peux en ajouter)
    const badPhrases = [
      /je suis (une|un) ia/i,
      /hello[,!]/i,
      /réponse statique/i,
      /default answer/i,
      /fake ai/i
    ];
    if (!content) isSuspicious = true;
    if (provider === "autonomous" && content.trim().length < 10) isSuspicious = true;
    if (badPhrases.some(rx => rx.test(content))) isSuspicious = true;

    // Tag headers pour traçabilité
    res.setHeader("X-AI-Provider", provider);
    res.setHeader("X-AI-Model", model);
    res.setHeader("X-AI-Suspect", isSuspicious ? "1" : "0");

    if (isSuspicious) {
      console.warn("[ANTI-FAKE] Réponse suspecte", { provider, model, preview: content.slice(0,120) });
    }
  } catch (e) {
    console.warn("[ANTI-FAKE] Guard error:", e?.message || e);
  }
}