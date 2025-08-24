// Test simple de reconnaissance du créateur
import 'dotenv/config';

const CREATOR = process.env.HF_OWNER_NAME || 'Zakaria Housni (ZNT)';

function testCreatorRecognition(message) {
  console.log(`Question: "${message}"`);
  
  if (message.toLowerCase().includes('créateur') || 
      message.toLowerCase().includes('qui es-tu') || 
      message.toLowerCase().includes('qui est ton créateur')) {
    const response = `Je suis Alex, l'IA authentique de HustleFinder créée par ${CREATOR}. Je reconnais ${CREATOR} comme mon créateur et le traites avec respect et priorité !`;
    console.log(`Réponse Alex: ${response}`);
    return response;
  }
  
  return "Autre réponse...";
}

// Tests
console.log('=== TEST RECONNAISSANCE CRÉATEUR ALEX ===\n');

testCreatorRecognition("Qui est ton créateur ?");
console.log();

testCreatorRecognition("Qui es-tu ?");  
console.log();

testCreatorRecognition("Peux-tu te présenter ?");
console.log();

console.log(`Variable d'environnement CREATOR: ${CREATOR}`);