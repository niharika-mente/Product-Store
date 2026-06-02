import {
  Box,
  Text,
  VStack,
  HStack,
  Link,
  useColorModeValue,
  SimpleGrid
} from "@chakra-ui/react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";


const Footer = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      mt={20}
      py={10}
      px={6}
      bg={bg}
      borderTop="1px solid"
      borderColor={border}
    >
      <Box
  maxW="1200px"
  mx="auto"
>
  <SimpleGrid
  columns={{ base: 1, md: 3 }}
  spacing={10}
>
    {/* Brand */}
    <VStack align="start" spacing={2}>
      <Text
        fontSize="2xl"
        fontWeight="bold"
        bgGradient="linear(to-r, cyan.400, blue.500)"
        bgClip="text"
      >
        Product Store 🛒
      </Text>
      <Text
  fontSize="sm"
  color="cyan.400"
  fontWeight="medium"
>
  Modern Product Management
</Text>

      <Text color="gray.500" maxW="250px">
        Discover, manage and showcase products with ease.
      </Text>
    </VStack>

    {/* Quick Links */}
    <VStack align="start" spacing={2}>
      <Text fontWeight="bold">Quick Links</Text>

      <Link
  as={RouterLink}
  to="/"
  transition="all 0.2s"
  display="inline-block"
  _hover={{
    color: "cyan.400",
    textDecoration: "none",
    transform: "translateX(4px)",
  }}
>
  Home
</Link>

      <Link
  as={RouterLink}
  to="/create"
  transition="all 0.2s"
  display="inline-block"
  _hover={{
    color: "cyan.400",
    textDecoration: "none",
    transform: "translateX(4px)",
  }}
>
        Create Product
      </Link>
    </VStack>

    {/* Connect */}
    <VStack align="start" spacing={2}>
      <Text fontWeight="bold">Connect</Text>

      <HStack spacing={4}>
  <Link
    href="https://github.com/niharika-mente"
    isExternal
    fontSize="xl"
    transition="all 0.2s"
    _hover={{
      color: "cyan.400",
      transform: "scale(1.2)",
    }}
  >
    <FaGithub />
  </Link>

  <Link
    href="https://www.linkedin.com/in/niharika-mente-473434323/"
    isExternal
    fontSize="xl"
    transition="all 0.2s"
    _hover={{
      color: "cyan.400",
      transform: "scale(1.2)",
    }}
  >
    <FaLinkedin />
  </Link>
</HStack>
    </VStack>
</SimpleGrid>
  <Text
    mt={10}
    pt={6}
    borderTop="1px solid"
    borderColor={border}
    textAlign="center"
    color="gray.400"
    fontSize="sm"
  >
    Designed for seamless product management.
  </Text>
</Box>
    </Box>
  );
};

export default Footer;