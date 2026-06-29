import {
  Box,
  Text,
  VStack,
  HStack,
  Link,
  useColorModeValue,
  SimpleGrid,
  Input,
  Button,
  useToast,
} from "@chakra-ui/react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import api from "../../utils/axios";

const Footer = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast({
        id: "newsletter-email-required",
        title: "Email is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/newsletter/subscribe", {
        email,
      });

      toast({
        id: "newsletter-success",
        title: res.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEmail("");
    } catch (error) {
      toast({
        id: "newsletter-error",
        title: error?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      mt={20}
      py={10}
      px={6}
      bg={bg}
      borderTop="1px solid"
      borderColor={border}
    >
      <Box maxW="1200px" mx="auto">
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10}>
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
            <Text fontSize="sm" color="cyan.400" fontWeight="medium">
              Modern Product Management
            </Text>

            <Text color={labelColor} maxW="250px">
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
                aria-label="GitHub Repository"
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
                aria-label="LinkedIn Profile"
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
          {/* Newsletter */}
          <VStack align="start" spacing={3}>
            <Text fontWeight="bold">Newsletter</Text>

            <Text color={labelColor} fontSize="sm">
              Subscribe and get 10% off your first order.
            </Text>

            <Input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              colorScheme="cyan"
              onClick={handleSubscribe}
              isLoading={loading}
              width="100%"
            >
              Subscribe
            </Button>
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
