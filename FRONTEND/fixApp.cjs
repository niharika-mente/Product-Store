const fs = require('fs');

let appPath = 'src/App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');

// Ensure we only replace once to avoid duplicates if it was already added
if (!appContent.includes('import { ToastContainer }')) {
  appContent = appContent.replace('import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";', 'import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";\nimport { ToastContainer } from "./utils/toastService";');
}

if (!appContent.includes('<ToastContainer />')) {
  appContent = appContent.replace('<KeyboardShortcutsModal isOpen={isOpen} onClose={onClose} />', '<KeyboardShortcutsModal isOpen={isOpen} onClose={onClose} />\n        <ToastContainer />');
}

fs.writeFileSync(appPath, appContent);
