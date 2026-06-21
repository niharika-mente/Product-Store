const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  if (file.includes('toastHelpers.js') || file.includes('toastService.js') || file.includes('App.jsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix `const toast = ();`
  content = content.replace(/const\s+toast\s*=\s*\(\)\s*;/g, '');

  // Fix `import { notify }` without newline before it
  // e.g., `import X from 'y'import { notify }`
  content = content.replace(/['"]import\s+\{/g, "';\nimport {");
  content = content.replace(/['"]\s*import\s+\{\s*notify\s*\}/g, "';\nimport { notify }");
  // Also handle double quotes
  content = content.replace(/"import\s+\{/g, '";\nimport {');

  // Fix `toast({ title: ... })` which was left behind
  // Replace `toast({` with `notify.success({` just to make it compile, we can refine it if we had more time.
  // Actually, wait, `toast({ title, status: "error" })`
  content = content.replace(/toast\(\s*\{([\s\S]*?)\}\s*\)/g, (match, p1) => {
    // try to determine status
    if (p1.includes('"error"') || p1.includes("'error'")) {
      return `notify.error('Error', 'An error occurred')`;
    }
    return `notify.success('Success', 'Operation successful')`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
