const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/Cortex/g, 'Brain');
code = code.replace(/cortex/g, 'brain');
fs.writeFileSync('server.ts', code);
console.log('Cortex replaced with Brain in server.ts');
