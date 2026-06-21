const fs = require('fs');

let hpPath = 'src/pages/HomePage.jsx';
let c = fs.readFileSync(hpPath, 'utf8');

const importRegex = /import \{ notify \} from "\.\.\/utils\/toastService";\r?\n\r?\nconst CrashTest = \(\{ shouldCrash \}\) => \{[\s\S]*?if \(shouldCrash\) \{[\s\S]*?throw new Error\("Simulated Frontend Crash for Demo!"\);[\s\S]*?\}[\s\S]*?return null;[\s\S]*?\};\r?\n/;
c = c.replace(importRegex, '');

const stateRegex = /const \[shouldCrash, setShouldCrash\] = useState\(false\);\r?\n\s*/;
c = c.replace(stateRegex, '');

const buttonsRegex = /<HStack spacing=\{4\}>[\s\S]*?<Button colorScheme="green" onClick=\{[\s\S]*?\}>[\s\S]*?Test Success Toast[\s\S]*?<\/Button>[\s\S]*?<Button colorScheme="orange" onClick=\{[\s\S]*?\}>[\s\S]*?Test Warning Toast[\s\S]*?<\/Button>[\s\S]*?<Button colorScheme="red" onClick=\{[\s\S]*?\}>[\s\S]*?Test Error Boundary[\s\S]*?<\/Button>[\s\S]*?<\/HStack>\r?\n\s*<CrashTest shouldCrash=\{shouldCrash\} \/>\r?\n\s*/;
c = c.replace(buttonsRegex, '');

fs.writeFileSync(hpPath, c);
console.log('Cleaned HomePage');

let walkPath = '../../.gemini/antigravity-ide/brain/ad1ccf9a-1795-4e96-a7e5-f0b93c40c6c7/walkthrough.md';
if (fs.existsSync(walkPath)) {
  let w = fs.readFileSync(walkPath, 'utf8');
  w = w.replace(/!\[Error Boundary and Toast Demo\]\(C:\/Users\/LENOVO\/\.gemini\/antigravity-ide\/brain\/ad1ccf9a-1795-4e96-a7e5-f0b93c40c6c7\/error_boundary_toast_demo_1782011070027\.webp\)\r?\n/g, '');
  fs.writeFileSync(walkPath, w);
  console.log('Cleaned walkthrough');
}
