import fs from 'fs';

const filePath = 'backend/alex-modules/specialized/AlexAutonomousCore.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Correction simple et directe...');

// Ne corrige que les patterns les plus critiques
content = content.replace(/(\w+): ([^,{}]+)\n\s+(\w+):/g, '$1: $2,\n      $3:');
content = content.replace(/STR_ALEX_AUTONOMOUS/g, "'Alex Autonomous'");
content = content.replace(/STR_AUTONOMOUS/g, "'autonomous'");

// Fix broken method calls
content = content.replace(/async initialize\('[^']+'\)/g, 'async initialize()');
content = content.replace(/async awakenAutonomousConsciousness\('[^']+'\)/g, 'async awakenAutonomousConsciousness()');
content = content.replace(/async processAutonomousMessage\([^)]*\)/g, 'async processAutonomousMessage(message, userId, sessionContext)');

fs.writeFileSync(filePath, content);
console.log('✅ Corrections de base appliquées');