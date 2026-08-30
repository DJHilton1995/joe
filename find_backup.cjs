const fs = require('fs');
const path = require('path');

function search(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      search(full);
    } else {
      if (full.endsWith('.js') || full.endsWith('.ts') || full.endsWith('.tsx') || full.includes('App')) {
        try {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes('checkSentinelStatus')) {
            console.log('FOUND IN:', full);
          }
        } catch(e) {}
      }
    }
  }
}

search('node_modules/.vite');
search('dist');
