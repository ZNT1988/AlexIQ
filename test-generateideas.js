// Test simple de generateIdeas
import AlexInfiniteCreator from "./backend/alex-modules/consciousness/AlexInfiniteCreator.js";

console.log("🧪 Test generateIdeas");
console.log("====================");

console.log("AlexInfiniteCreator imported:", !!AlexInfiniteCreator);
console.log("generateIdeas method exists:", typeof AlexInfiniteCreator.generateIdeas);

if (typeof AlexInfiniteCreator.generateIdeas === "function") {
  console.log("✅ generateIdeas is available!");
  
  // Test simple
  try {
    const result = await AlexInfiniteCreator.generateIdeas("test", { quantity: 1 });
    console.log("✅ Test successful:", result);
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
} else {
  console.log("❌ generateIdeas method missing!");
  console.log("Available methods:", Object.getOwnPropertyNames(AlexInfiniteCreator));
}