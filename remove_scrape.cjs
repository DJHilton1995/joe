const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find and remove handleCortexScrapeSubmit
const scrapeStart = code.indexOf('// Handle Cortex Scrape and Truth Matrix');
const scrapeEnd = code.indexOf('const checkSentinelStatus = async () => {');
if (scrapeStart !== -1 && scrapeEnd !== -1) {
  code = code.substring(0, scrapeStart) + code.substring(scrapeEnd);
}

// Remove any remaining cortexUrl, cortexLang, cortexLoading, etc state variables that might have been missed
code = code.replace(/const \[cortexResult, setCortexResult\].*?;/s, ''); // The /s allows . to match newlines

fs.writeFileSync('src/App.tsx', code);
console.log('Cleaned up scrape function in App.tsx');
