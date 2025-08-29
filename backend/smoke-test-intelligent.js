import intelligentCore from "./alex-modules/core/AlexIntelligentCore.js";

(async () => {
  try {
    console.log("✅ Import OK");

    // Initialise le module pour la DB
    await intelligentCore.initialize();

    // Simule une conversation pour tester la DB
    if (intelligentCore.db) {
      await intelligentCore.db.run(
        "INSERT INTO conversations (user_id,session_id,message,response,intent,confidence) VALUES (?,?,?,?,?,?)",
        ["u1", "session1", "help me grow my startup", "try X", "business_advice", 0.82]
      );
    }

    // Mise à jour des métriques
    await intelligentCore.optimizeIntelligenceMetrics();
    const st = await intelligentCore.getStatus();
    console.log("📊 Status snapshot:", JSON.stringify(st, null, 2));

    // Test évolution personnalité
    await intelligentCore.evolvePersonalityFromInteraction(
      { confidence: 0.85, complexity: 0.6, emotion: "excited" },
      { confidence: 0.9 }
    );

    console.log("🧠 Personality:", (await intelligentCore.getStatus()).personality);

    await intelligentCore.close?.();
  } catch (e) {
    console.error("❌ ERROR:", e);
  }
})();