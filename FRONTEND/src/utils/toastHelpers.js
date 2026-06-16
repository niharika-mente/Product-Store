export const showSuccessToast = (toast, title, description = "") =>
  toast({
    title,
    description,
    status: "success",
    duration: 3000,
    isClosable: true,
  });

export const showErrorToast = (toast, title, description = "") =>
  toast({
    title,
    description,
    status: "error",
    duration: 3000,
    isClosable: true,
  });

export const showWarningToast = (toast, title, description = "") =>
  toast({
    title,
    description,
    status: "warning",
    duration: 3000,
    isClosable: true,
  });

export const showInfoToast = (toast, title, description = "") =>
  toast({
    title,
    description,
    status: "info",
    duration: 3000,
    isClosable: true,
  });
