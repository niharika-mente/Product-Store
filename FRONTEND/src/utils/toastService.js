import { createStandaloneToast } from '@chakra-ui/react';

// Create the standalone toast system
const { ToastContainer, toast } = createStandaloneToast();

export { ToastContainer };

export const notify = {
  success: (title, description = '') => {
    toast({
      title,
      description,
      status: 'success',
      duration: 4000,
      isClosable: true,
      position: 'top-right',
    });
  },
  error: (title, description = '') => {
    toast({
      title,
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  },
  warning: (title, description = '') => {
    toast({
      title,
      description,
      status: 'warning',
      duration: 4000,
      isClosable: true,
      position: 'top-right',
    });
  },
  info: (title, description = '') => {
    toast({
      title,
      description,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  },
};
