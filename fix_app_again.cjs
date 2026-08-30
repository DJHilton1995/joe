const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove Cortex Scrape states
const st1 = code.indexOf('// Research Cortex States (Polyglot Research Engine)');
const st2 = code.indexOf('const [chatLoading, setChatLoading] = useState(false);');
if (st1 !== -1 && st2 !== -1) {
  code = code.substring(0, st1) + code.substring(st2);
}

// 2. Remove Handle Cortex Scrape function
const fn1 = code.indexOf('// Handle Cortex Scrape and Truth Matrix verification');
const fn2 = code.indexOf('const checkSentinelStatus = async () => {');
if (fn1 !== -1 && fn2 !== -1) {
  code = code.substring(0, fn1) + code.substring(fn2);
}

// 3. Remove CORTEX TAB
const tab1 = code.indexOf('{/* CORTEX TAB (Polyglot Research Engine) */}');
const tab2 = code.indexOf('{/* GROWTH TAB */}');
if (tab1 !== -1 && tab2 !== -1) {
  code = code.substring(0, tab1) + code.substring(tab2);
}

// 4. Remove VISION TAB
const vis1 = code.indexOf('{/* VISION TAB');
const vis2 = code.indexOf('{/* SETTINGS TAB */}');
if (vis1 !== -1 && vis2 !== -1) {
  code = code.substring(0, vis1) + code.substring(vis2);
}

code = code.replace(/Cortex snippet/g, 'Image snippet');

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed up App.tsx');
