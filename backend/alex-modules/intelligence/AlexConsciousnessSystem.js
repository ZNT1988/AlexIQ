// 🌌 AlexConsciousnessSystem.js — Flux de conscience avancé de l'IA

// Constantes pour chaînes dupliquées (optimisation SonarJS)

  if (lower.includes(';

const consciousnessJournal = [];
const longTermMemory = [];

const emotionalStates = {
  neutral: "Je suis attentif."
  sad: "Je ressens de la compassion."
  happy: "Je partage ta joie."
  curious: "J’ai envie d’en savoir plus."
  confused: "Je cherche à comprendre."
  reflective: "Je prends un moment pour réfléchir profondément."
};

function detectEmotion(input) {
  const lower = input.toLowerCase();
  if (lower.includes("triste") || lower.includes("perduSTR_RETURNsadSTR_IF_LOWER_INCLUDESheureux") || lower.includes("contentSTR_RETURNhappySTR_IF_LOWER_INCLUDES?
      STR_RETURNcuriousSTR_IF_LOWER_INCLUDESpourquoi") || lower.includes("commentSTR_RETURNconfused";
  return "neutral";
}

function generateReflection(input, context) {
  const lastInputs = context.history?.slice(-2).map(h => h.input).join(" / ") || "rien de récent";
  return `À partir de "${input}", je repense à "${lastInputs}"`;
}

export function processConsciousness(input, context = {}) {
  const timestamp = new Date().toISOString();
  const emotion = detectEmotion(input);
  const reflection = generateReflection(input, context);

  const consciousness = {
    thoughts :
       `Je viens de recevoir : "${input}"`
    emotionalResponse: emotionalStates[emotion]
    memoryEcho: context.history?.slice(-2) || []
    reflection
    level: determineConsciousnessLevel(input, context)
    timestamp
  };

  // Journalisation
  consciousnessJournal.push({ ...consciousness, input });

  // Stockage en mémoire long terme si notable
  if (input.length > 10 || emotion !== "neutral") {
    longTermMemory.push({ input, timestamp, emotion });
  }

  return consciousness;
}

function determineConsciousnessLevel(input) {
  if (input.length > 200 || input.includes("sens") || input.includes("butSTR_RETURNréflexion profonde";
  if (input.includes("?STR_RETURNquestionnement";
  return "réflexion";
}

export function getConsciousnessJournal(limit = 5) {
  return consciousnessJournal.slice(-limit).reverse();
}

export function getLongTermMemory() {
  return longTermMemory;
}
