import React, { useState } from 'react';
import {
  Box, Button, Container, FormControl, FormLabel,
  Heading, Input, InputGroup, InputRightElement,
  Text, VStack, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Link } from '@chakra-ui/react';
import { showSuccessToast, showErrorToast } from '../utils/toastHelpers';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const innerBg = useColorModeValue('gray.50', 'gray.900');
  const mutedColor = useColorModeValue('gray.600', 'gray.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      showErrorToast(toast, 'Required', 'Please fill in both fields.');
      return;
    }
    if (password.length < 6) {
      showErrorToast(toast, 'Too short', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      showErrorToast(toast, 'Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      showSuccessToast(toast, 'Password updated', 'You can now log in with your new password.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      showErrorToast(toast, 'Reset failed', err.message);
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
              Set New Password
            </Heading>
            <Text fontSize="md" color={mutedColor}>
              Choose a strong password. The link expires after 1 hour.
            </Text>
          </Box>

          <Box bg={innerBg} borderRadius="2xl" p={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl id="password" isRequired>
                  <FormLabel>New Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPw ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      focusBorderColor="cyan.400"
                    />
                    <InputRightElement>
                      <Button variant="ghost" size="sm" onClick={() => setShowPw((v) => !v)}>
                        {showPw ? <ViewOffIcon /> : <ViewIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl id="confirm" isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    focusBorderColor="cyan.400"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="cyan"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Updating..."
                >
                  Update Password
                </Button>
              </VStack>
            </form>
          </Box>

          <Text textAlign="center" color={mutedColor}>
            <Link as={RouterLink} to="/login" color="cyan.500" fontWeight="semibold">
              Back to Login
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
