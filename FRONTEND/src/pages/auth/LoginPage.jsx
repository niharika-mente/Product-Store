import { useState } from 'react';
import {
  Container, VStack, Heading, Input, Button, Text, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Login successful', status: 'success', duration: 3000, isClosable: true });
      navigate('/');
    } catch (err) {
      toast({ title: 'Login failed', description: err.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack as="form" onSubmit={handleSubmit} spacing={5} p={8} bg={bg} borderRadius="xl" boxShadow="xl">
        <Heading size="lg">Sign In</Heading>
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>Sign In</Button>
        <Text fontSize="sm" color={textColor}>
          Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--chakra-colors-blue-500)' }}>Register</Link>
        </Text>
      </VStack>
    </Container>
  );
};

export default LoginPage;
