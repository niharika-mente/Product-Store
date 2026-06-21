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
  if (file.includes('toastHelpers.js') || file.includes('toastService.js') || file.includes('App.jsx') || file.includes('HomePage.jsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  if (content.includes('useToast')) {
    // Determine relative path to toastService
    const relativePath = path.relative(path.dirname(file), path.join(srcDir, 'utils', 'toastService')).replace(/\\/g, '/');
    const importStatement = `import { notify } from '${relativePath}';\n`;
    
    // add import at top
    content = importStatement + content;

    // Remove useToast import from chakra-ui
    content = content.replace(/,\s*useToast\s*,/g, ',');
    content = content.replace(/,\s*useToast/g, '');
    content = content.replace(/useToast,\s*/g, '');
    content = content.replace(/useToast/g, '');

    // Replace const toast = ();
    content = content.replace(/const\s+toast\s*=\s*\(\)\s*;/g, '');

    // Replace function calls
    content = content.replace(/showSuccessToast\(\s*toast\s*,\s*/g, 'notify.success(');
    content = content.replace(/showErrorToast\(\s*toast\s*,\s*/g, 'notify.error(');
    content = content.replace(/showWarningToast\(\s*toast\s*,\s*/g, 'notify.warning(');
    content = content.replace(/showInfoToast\(\s*toast\s*,\s*/g, 'notify.info(');

    // Any raw toast({ ... })
    content = content.replace(/toast\(\{[\s\S]*?\}\)/g, "notify.success('Success', '')");
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
