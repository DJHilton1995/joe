const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove handleCortexScrapeSubmit
code = code.replace(/\/\/ Handle Cortex Scrape and Truth Matrix verification[\s\S]*?const checkSentinelStatus = async \(\) => {/, 'const checkSentinelStatus = async () => {');

// Remove CORTEX TAB and VISION TAB
code = code.replace(/\{\/\* CORTEX TAB[\s\S]*?\{\/\* GROWTH TAB/, '{/* GROWTH TAB');
code = code.replace(/\{\/\* VISION TAB[\s\S]*?\{\/\* SETTINGS TAB/, '{/* SETTINGS TAB');

// Replace remaining 'Cortex' with 'Processing' or 'Brain'
code = code.replace(/Visual Cortex Render Subsystem/g, 'Visual Render Subsystem');
code = code.replace(/VISUAL CORTEX SUBMODULE PROCESSED/g, 'VISUAL SUBMODULE PROCESSED');
code = code.replace(/Visual Cortex Attachment Shelf/g, 'Visual Attachment Shelf');
code = code.replace(/Visual Cortex Submodule successfully loaded inline\./g, 'Visual centers successfully loaded inline.');
code = code.replace(/Visual Cortex matches strictly image assets\./g, 'Visual centers matches strictly image assets.');
code = code.replace(/Visual Cortex paired with uploaded sensor asset:/g, 'Visual centers paired with uploaded sensor asset:');
code = code.replace(/Visual Cortex/g, 'Visual Processing');
code = code.replace(/CORTEX_LINKED/g, 'VISUAL_LINKED');
code = code.replace(/VISUAL_CORTEX/g, 'VISUAL_PROCESSING');
code = code.replace(/cortexUrl/g, 'brainUrl');
code = code.replace(/cortexLang/g, 'brainLang');
code = code.replace(/cortexLoading/g, 'brainLoading');
code = code.replace(/cortexPacingSecondsLeft/g, 'brainPacingSecondsLeft');

fs.writeFileSync('src/App.tsx', code);
console.log("Node replace done");
