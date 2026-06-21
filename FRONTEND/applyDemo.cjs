const fs = require('fs');

// App.jsx
let appPath = 'src/App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace('import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";', 'import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";\nimport { ToastContainer } from "./utils/toastService";');
appContent = appContent.replace('<KeyboardShortcutsModal isOpen={isOpen} onClose={onClose} />', '<KeyboardShortcutsModal isOpen={isOpen} onClose={onClose} />\n        <ToastContainer />');
fs.writeFileSync(appPath, appContent);

// ErrorBoundary.jsx
let ebPath = 'src/components/ui/ErrorBoundary.jsx';
let ebContent = fs.readFileSync(ebPath, 'utf8');
ebContent = ebContent.replace('console.error("ErrorBoundary caught:", error, info.componentStack);', 'console.error("ErrorBoundary caught:", error, info.componentStack);\n    // Sentry.captureException(error, { extra: info });\n    // LogRocket.captureException(error, { extra: info });');
fs.writeFileSync(ebPath, ebContent);

// HomePage.jsx
let hpPath = 'src/pages/HomePage.jsx';
let hpContent = fs.readFileSync(hpPath, 'utf8');
hpContent = hpContent.replace('import FilterPanel from "../components/ui/FilterPanel";', 'import FilterPanel from "../components/ui/FilterPanel";\nimport { notify } from "../utils/toastService";\n\nconst CrashTest = ({ shouldCrash }) => {\n  if (shouldCrash) {\n    throw new Error("Simulated Frontend Crash for Demo!");\n  }\n  return null;\n};\n');
hpContent = hpContent.replace('const [totalProducts, setTotalProducts] = useState(0);', 'const [totalProducts, setTotalProducts] = useState(0);\n  const [shouldCrash, setShouldCrash] = useState(false);');

let buttonsStr = `        <VStack spacing={8}>
          <Text
            fontSize={"30"}
            fontWeight={"bold"}
            bgGradient={"linear(to-r,cyan.400,blue.500)"}
            bgClip={"text"}
            textAlign={"center"}
          >
            Current Products🚀
          </Text>
          <HStack spacing={4}>
            <Button colorScheme="green" onClick={() => notify.success("Success!", "Centralized toast notification triggered!")}>
              Test Success Toast
            </Button>
            <Button colorScheme="orange" onClick={() => notify.warning("Warning!", "Testing the warning notification.")}>
              Test Warning Toast
            </Button>
            <Button colorScheme="red" onClick={() => setShouldCrash(true)}>
              Test Error Boundary
            </Button>
          </HStack>
          <CrashTest shouldCrash={shouldCrash} />`;
          
hpContent = hpContent.replace('        <VStack spacing={8}>\n          <Text\n            fontSize={"30"}\n            fontWeight={"bold"}\n            bgGradient={"linear(to-r,cyan.400,blue.500)"}\n            bgClip={"text"}\n            textAlign={"center"}\n          >\n            Current Products🚀\n          </Text>', buttonsStr);
fs.writeFileSync(hpPath, hpContent);

console.log("Applied demo changes");
