import React, { useState } from 'react';
import {
  Box, Button, Container, FormControl, FormLabel,
  Heading, Input, Text, VStack, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@chakra-ui/react';
import { showErrorToast } from '../utils/toastHelpers';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const innerBg = useColorModeValue('gray.50', 'gray.900');
  const mutedColor = useColorModeValue('gray.600', 'gray.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showErrorToast(toast, 'Email required', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setSubmitted(true);
    } catch (err) {
      showErrorToast(toast, 'Request failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={12}>
      <Box bg={bg} borderRadius="3xl" boxShadow="2xl" p={{ base: 8, md: 12 }}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={2} bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
              Forgot Password
            </Heading>
            <Text fontSize="md" color={mutedColor}>
              Enter your email and we'll send you a reset link.
            </Text>
          </Box>

          {submitted ? (
            <Box bg={innerBg} borderRadius="2xl" p={6} textAlign="center">
              <Text fontSize="lg" fontWeight="semibold" color="green.500" mb={2}>
                Check your inbox
              </Text>
              <Text color={mutedColor}>
                If an account with that email exists, a password reset link has been sent.
                The link expires in 1 hour.
              </Text>
            </Box>
          ) : (
            <Box bg={innerBg} borderRadius="2xl" p={6}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl id="email" isRequired>
                    <FormLabel>Email address</FormLabel>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      focusBorderColor="cyan.400"
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="cyan"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="Sending..."
                  >
                    Send Reset Link
                  </Button>
                </VStack>
              </form>
            </Box>
          )}

          <Text textAlign="center" color={mutedColor}>
            Remember it now?{' '}
            <Link as={RouterLink} to="/login" color="cyan.500" fontWeight="semibold">
              Back to Login
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
