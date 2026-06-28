import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  Box,
  Button,
  CloseButton,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

// Surfaces the PWA install / update / offline-ready prompts as a small banner.
// Rendered once at the app root (see main.jsx).
export default function PWAReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    // The browser fires beforeinstallprompt when the app is installable; we
    // stash the event so the user can trigger installation from our own button.
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => setInstallPrompt(null);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const dismiss = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setInstallPrompt(null);
  };

  const showUpdate = needRefresh;
  const showInstall = !needRefresh && Boolean(installPrompt);
  const showOffline = offlineReady && !needRefresh && !installPrompt;

  if (!showUpdate && !showInstall && !showOffline) return null;

  let title;
  let body;
  let action = null;

  if (showUpdate) {
    title = 'Update available';
    body = 'A new version of Product Store is ready.';
    action = (
      <Button size="sm" colorScheme="purple" onClick={() => updateServiceWorker(true)}>
        Reload
      </Button>
    );
  } else if (showInstall) {
    title = 'Install Product Store';
    body = 'Add the app to your home screen for a faster, offline-ready experience.';
    action = (
      <Button size="sm" colorScheme="purple" onClick={handleInstall}>
        Install
      </Button>
    );
  } else {
    title = 'Ready to work offline';
    body = 'Product Store is cached and now available without a connection.';
  }

  return (
    <Box
      position="fixed"
      bottom={4}
      left="50%"
      transform="translateX(-50%)"
      zIndex={2000}
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="lg"
      px={4}
      py={3}
      maxW="sm"
      w="calc(100% - 2rem)"
      role="status"
      aria-live="polite"
    >
      <HStack align="flex-start" justify="space-between" spacing={3}>
        <Box>
          <Text fontWeight="semibold" fontSize="sm">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {body}
          </Text>
          {action && <Box mt={2}>{action}</Box>}
        </Box>
        <CloseButton size="sm" onClick={dismiss} aria-label="Dismiss" />
      </HStack>
    </Box>
  );
}
