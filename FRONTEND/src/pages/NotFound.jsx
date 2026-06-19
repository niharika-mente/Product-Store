// FRONTEND/src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Box, Heading, Text, Button, VStack, Container } from '@chakra-ui/react';

const NotFound = () => {
  return (
    <Container maxW="container.xl" py={10}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minH="70vh"
        textAlign="center"
      >
        {/* Animated 404 Number */}
        <Box
          fontSize={{ base: "120px", md: "180px" }}
          fontWeight="bold"
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          color="transparent"
          mb={4}
        >
          404
        </Box>

        {/* Icon */}
        <Box fontSize="80px" mb={4}>
          🔍
        </Box>

        {/* Title */}
        <Heading
          as="h1"
          size={{ base: "xl", md: "2xl" }}
          color="gray.800"
          mb={4}
        >
          Page Not Found
        </Heading>

        {/* Description */}
        <Text fontSize="lg" color="gray.600" mb={6} maxW="500px">
          Oops! The page you are looking for doesn't exist or has been moved.
        </Text>

        {/* Tip Box - Matching your product card style */}
        <Box
          bg="blue.50"
          p={4}
          borderRadius="lg"
          mb={8}
          maxW="400px"
          border="1px solid"
          borderColor="blue.200"
        >
          <Text color="blue.700" fontSize="sm">
            💡 <strong>Tip:</strong> Go back to home and explore our products!
          </Text>
        </Box>

        {/* Button - Matching your "Add Product" button style */}
        <Link to="/">
          <Button
            colorScheme="blue"
            size="lg"
            px={8}
            py={6}
            fontSize="md"
            fontWeight="semibold"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            transition="all 0.3s ease"
          >
            ← Back to Home
          </Button>
        </Link>

        {/* Suggested Links - Optional */}
        <VStack spacing={2} mt={10}>
          <Text fontSize="sm" color="gray.500">
            Try these valid pages:
          </Text>
          <Box display="flex" gap={4} flexWrap="wrap" justifyContent="center">
            <Link to="/">
              <Text color="blue.500" fontSize="sm" _hover={{ textDecoration: "underline" }}>
                Home Page
              </Text>
            </Link>
            <Link to="/create">
              <Text color="blue.500" fontSize="sm" _hover={{ textDecoration: "underline" }}>
                Create Product
              </Text>
            </Link>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default NotFound;