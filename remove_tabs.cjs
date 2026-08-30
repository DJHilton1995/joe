const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find and remove CORTEX TAB
const cortexStart = code.indexOf('{/* CORTEX TAB (Polyglot Research Engine) */}');
const cortexEnd = code.indexOf('{/* GROWTH TAB */}');
if (cortexStart !== -1 && cortexEnd !== -1) {
  code = code.substring(0, cortexStart) + code.substring(cortexEnd);
}

// Find and remove VISION TAB
const visionStart = code.indexOf('{/* VISION TAB (Visual Cortex Render Subsystem) */}');
const visionEnd = code.indexOf('{/* SETTINGS TAB */}');
if (visionStart !== -1 && visionEnd !== -1) {
  code = code.substring(0, visionStart) + code.substring(visionEnd);
}

// Find and remove any state related to Cortex
// We can just regex replace the useStates
code = code.replace(/const \[cortexUrl, setCortexUrl\] = useState[^\n]+\n/g, '');
code = code.replace(/const \[cortexLang, setCortexLang\] = useState[^\n]+\n/g, '');
code = code.replace(/const \[cortexLoading, setCortexLoading\] = useState[^\n]+\n/g, '');
code = code.replace(/const \[cortexPacingSecondsLeft, setCortexPacingSecondsLeft\] = useState[^\n]+\n/g, '');
// For multi-line cortexResult:
const resStart = code.indexOf('const [cortexResult, setCortexResult] = useState<{');
if (resStart !== -1) {
  const resEnd = code.indexOf('}>({', resStart);
  if (resEnd !== -1) {
    const endSemi = code.indexOf(';', resEnd);
    if (endSemi !== -1) {
      code = code.substring(0, resStart) + code.substring(endSemi + 1);
    }
  }
}

// Visual cortex attachments in chat
const visAttachStart = code.indexOf('{/* Visual Cortex Attachment Shelf */}');
if (visAttachStart !== -1) {
  const visAttachEnd = code.indexOf('</div>', visAttachStart);
  const nextDiv = code.indexOf('</div>', visAttachEnd + 6);
  if (nextDiv !== -1) {
      // Just replacing it with standard image preview
      const replacement = `
            {/* Image Preview Shelf */}
            {imagePreview && (
              <div className="absolute -top-16 left-0 bg-stone-900 border border-stone-800 p-2 rounded-xl shadow-lg flex items-center gap-3 animate-fadeIn">
                  <img src={imagePreview} className="w-12 h-12 object-cover rounded-lg border border-stone-800" alt="Attachment" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-[#00ffd2] bg-[#00ffd2]/10 border border-[#00ffd2]/30 rounded px-1 py-0.2">Image Payload</span>
                  </div>
              </div>
            )}`;
      const replaceStart = code.lastIndexOf('{imagePreview && (', visAttachStart);
      if (replaceStart !== -1) {
          const replaceEnd = code.indexOf(')}', replaceStart + 20) + 2;
          code = code.substring(0, replaceStart) + replacement + code.substring(replaceEnd);
      }
  }
}

fs.writeFileSync('src/App.tsx', code);
console.log('Cleaned up tabs in App.tsx');
