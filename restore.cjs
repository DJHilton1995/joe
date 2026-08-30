const { execSync } = require('child_process');
execSync('git checkout src/App.tsx');
console.log('Restored App.tsx');
