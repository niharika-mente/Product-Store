import {
  Box,
  Text,
  VStack,
  HStack,
  Link,
  useColorModeValue,
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
      <VStack gap={5}>
        {/* Brand */}
        <VStack gap={1}>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            bgGradient="linear(to-r, cyan.400, blue.500)"
            bgClip="text"
            transition="all 0.3s"
            _hover={{
            transform: "scale(1.05)",
}}>
            Product Store 🛒
          </Text>

          <Text
            color="gray.500"
            textAlign="center"
            maxW="500px"
          >
            Discover, manage and showcase products with ease.
          </Text>
        </VStack>

        {/* Navigation */}
        <HStack gap={6}>
          <Link
  as={RouterLink}
  to="/"
  px={4}
  py={2}
  borderRadius="md"
  transition="all 0.2s"
  _hover={{
    bg: "blue.50",
    textDecoration: "none",
    transform: "translateY(-2px)",
  }}
>
  Home
</Link>

          <Link
  as={RouterLink}
  to="/create"
  px={4}
  py={2}
  borderRadius="md"
  transition="all 0.2s"
  _hover={{
    bg: "blue.50",
    textDecoration: "none",
    transform: "translateY(-2px)",
  }}
>
  Create Product
</Link>
        </HStack>

        {/* Social Links */}
        <HStack gap={5}>
          <Link
  href="https://github.com/niharika-mente"
  isExternal
  fontSize="xl"
  transition="all 0.2s"
  _hover={{
    transform: "scale(1.2)",
    color: "blue.500",
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
    transform: "scale(1.2)",
    color: "blue.500",
  }}
>
            <FaLinkedin />
          </Link>
        </HStack>

        <Text
          fontSize="sm"
          color="gray.400"
          textAlign="center"
        >
            Designed for seamless product management.
        </Text>
      </VStack>
    </Box>
  );
};

export default Footer;