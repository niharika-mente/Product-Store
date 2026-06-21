import React from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
    // Sentry.captureException(error, { extra: info });
    // LogRocket.captureException(error, { extra: info });
    
    // ==========================================
    // Centralized Error Logging Integration
    // ==========================================
    // 
    // Sentry.captureException(error, { extra: info });
    // LogRocket.captureException(error, { extra: info });
    // ==========================================
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
  }
}

// Functional fallback UI — uses hooks so it must live outside the class
const ErrorFallback = ({ error, onReset }) => {
  const labelColor  = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("red.200", "red.700");
  const codeBg      = useColorModeValue("red.50", "gray.800");

  return (
    <Container maxW="container.sm" py={20}>
      <VStack spacing={6} textAlign="center">
        <Text fontSize="6xl">⚠️</Text>

        <Heading
          as="h1"
          size="xl"
          bgGradient="linear(to-r, red.400, orange.400)"
          bgClip="text"
        >
          Something went wrong
        </Heading>

        <Text color={labelColor} maxW="400px">
          An unexpected error occurred. You can try going back to the home page.
        </Text>

        {error?.message && (
          <Box
            w="full"
            p={4}
            bg={codeBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Text fontSize="sm" fontFamily="mono" color="red.500" wordBreak="break-word">
              {error.message}
            </Text>
          </Box>
        )}

        <Button
          colorScheme="blue"
          onClick={onReset}
          size="lg"
          _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          transition="all 0.2s"
        >
          Back to Home
        </Button>
      </VStack>
    </Container>
  );
};

export default ErrorBoundary;
