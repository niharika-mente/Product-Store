const fs = require('fs');

let c = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');

const regex1 = /import \{ notify \} from "\.\.\/utils\/toastService";[\s\S]*?const CrashTest = \(\{ shouldCrash \}\) => \{[\s\S]*?if \(shouldCrash\) \{[\s\S]*?throw new Error\("Simulated Frontend Crash for Demo!"\);[\s\S]*?\}[\s\S]*?return null;[\s\S]*?\};/g;

// match twice
let matches = c.match(regex1);
if (matches && matches.length > 1) {
  // replace the first occurrence
  c = c.replace(matches[0], '');
}

const regex2 = /const \[shouldCrash, setShouldCrash\] = useState\(false\);/g;
let matches2 = c.match(regex2);
if (matches2 && matches2.length > 1) {
  c = c.replace(matches2[0], '');
}

fs.writeFileSync('src/pages/HomePage.jsx', c);
console.log('Fixed HomePage');
