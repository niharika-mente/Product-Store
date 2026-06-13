import { useState } from 'react';
import {
  Container, VStack, Heading, Input, Button, Text, useColorModeValue, useToast,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast({ title: 'Registration successful', status: 'success', duration: 3000, isClosable: true });
      navigate('/');
    } catch (err) {
      toast({ title: 'Registration failed', description: err.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack as="form" onSubmit={handleSubmit} spacing={5} p={8} bg={bg} borderRadius="xl" boxShadow="xl">
        <Heading size="lg">Create Account</Heading>
        <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input placeholder="Password (min 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>Register</Button>
        <Text fontSize="sm" color={textColor}>
          Already have an account? <Link to="/login" style={{ color: 'var(--chakra-colors-blue-500)' }}>Sign In</Link>
        </Text>
      </VStack>
    </Container>
  );
};

export default RegisterPage;
