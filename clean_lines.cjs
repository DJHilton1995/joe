const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const lines = code.split('\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('// Research Cortex States (Polyglot Research Engine)')) {
    skip = true;
  }
  if (skip && line.includes('const [chatLoading, setChatLoading] = useState(false);')) {
    skip = false;
  }
  
  if (line.includes('// Handle Cortex Scrape and Truth Matrix verification')) {
    skip = true;
  }
  if (skip && line.includes('const checkSentinelStatus = async () => {')) {
    skip = false;
  }

  if (line.includes('{/* CORTEX TAB (Polyglot Research Engine) */}')) {
    skip = true;
  }
  if (skip && line.includes('{/* GROWTH TAB */}')) {
    skip = false;
  }

  if (line.includes('{/* VISION TAB (Visual Render Subsystem) */}')) {
    skip = true;
  }
  if (skip && line.includes('{/* SETTINGS TAB */}')) {
    skip = false;
  }

  if (!skip) {
    newLines.push(line);
  }
}

code = newLines.join('\n');
fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx cleaned line by line');
