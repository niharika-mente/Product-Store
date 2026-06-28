import React, { useEffect, useState } from "react";
import { IconButton, useColorModeValue } from "@chakra-ui/react";
import { LuArrowUp } from "react-icons/lu";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const buttonBg = useColorModeValue("blue.500", "cyan.400");
  const buttonHoverBg = useColorModeValue("blue.600", "cyan.500");

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <IconButton
      aria-label="Scroll to top"
      icon={<LuArrowUp />}
      onClick={handleScrollToTop}
      position="fixed"
      bottom={3}
      right={3}
      zIndex={1000}
      rounded="full"
      size="lg"
      color="white"
      bg={buttonBg}
      boxShadow="lg"
      _hover={{
        bg: buttonHoverBg,
        transform: "translateY(-2px)",
      }}
      _active={{
        transform: "translateY(0)",
      }}
    />
  );
};

export default ScrollToTop;
