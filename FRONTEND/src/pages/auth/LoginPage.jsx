import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Container, Heading, Text, Input, Button, VStack, HStack,
  useColorModeValue, useToast, Divider, InputGroup, InputRightElement,
  Alert, AlertIcon
} from '@chakra-ui/react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuthStore } from '../../store/auth';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Welcome back!', status: 'success', duration: 2000 });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={20}>
      <Box bg={cardBg} p={8} borderRadius="2xl" borderWidth="1px" borderColor={borderCol} boxShadow="lg">
        <VStack spacing={6}>
          <Heading size="lg">Sign In</Heading>
          <Text color="gray.500" fontSize="sm">Welcome back to Product Store</Text>

          {error && (
            <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <InputGroup>
                <Input
                  placeholder="Password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                    {show ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>
                Sign In
              </Button>
            </VStack>
          </form>

          <HStack width="full">
            <Divider />
            <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">or continue with</Text>
            <Divider />
          </HStack>

          <HStack spacing={4} width="full">
            <Button as="a" href={`${API}/api/auth/google`} width="full" leftIcon={<FaGoogle />} colorScheme="red" variant="outline">
              Google
            </Button>
            <Button as="a" href={`${API}/api/auth/github`} width="full" leftIcon={<FaGithub />} colorScheme="gray" variant="outline">
              GitHub
            </Button>
          </HStack>

          <Text fontSize="sm">
            Don't have an account?{' '}
            <Text as={RouterLink} to="/register" color="blue.500" fontWeight="semibold">
              Sign up
            </Text>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};

export default LoginPage;
