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

  // Remove useToast from chakra-ui imports
  content = content.replace(/,\s*useToast/g, '');
  content = content.replace(/useToast,\s*/g, '');
  content = content.replace(/useToast/g, '');

  // Add notify import
  if (originalContent.includes('const toast = useToast()') || originalContent.includes('const toast = useToast();')) {
    // Determine relative path to toastService
    const relativePath = path.relative(path.dirname(file), path.join(srcDir, 'utils', 'toastService')).replace(/\\/g, '/');
    const importStatement = `import { notify } from '${relativePath}';\n`;
    
    // add import at top (after last import)
    const importMatch = content.match(/^import.*$/gm);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + '\n' + importStatement);
    } else {
      content = importStatement + content;
    }

    // Remove const toast = useToast();
    content = content.replace(/const toast = useToast\(\);?/g, '');

    // Replace toast({ ... }) with notify.success(...) or notify.error(...)
    // This is complex for regex, so we do basic string replacement for common patterns
    // Assuming toastHelpers were used, we replace showSuccessToast(toast, ...) with notify.success(...)
    content = content.replace(/showSuccessToast\(toast,\s*/g, 'notify.success(');
    content = content.replace(/showErrorToast\(toast,\s*/g, 'notify.error(');
    content = content.replace(/showWarningToast\(toast,\s*/g, 'notify.warning(');
    content = content.replace(/showInfoToast\(toast,\s*/g, 'notify.info(');
    
    // What if they didn't use toastHelpers?
    // We can replace basic toast({ title, status: 'error' }) by hand or let standard ones be.
    // The PR says "Replaced scattered notification implementations throughout the application with the centralized toast utility".
    // I will replace toast({ title: X, status: 'error', description: Y }) with notify.error(X, Y).
    // Actually, it's safer to just replace show*Toast since we deleted toastHelpers.js.
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
