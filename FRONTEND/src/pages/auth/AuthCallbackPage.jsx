import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Text, VStack, Button, Alert, AlertIcon } from '@chakra-ui/react';

const AuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleAuth = () => {
    setError(null);
    const token = params.get('token');
    if (!token) {
      setError('No authentication token found. Please try signing in again.');
      return;
    }

    localStorage.setItem('authToken', token);

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('authUser', JSON.stringify(data.data));
          navigate('/');
        } else {
          setError(data.message || 'Authentication failed. Please try signing in again.');
        }
      })
      .catch(() => {
        setError('A network error occurred. Please check your connection and try again.');
      });
  };

  useEffect(() => {
    handleAuth();
  }, []);

  if (error) {
    return (
      <Container maxW="md" py={20}>
        <VStack spacing={4}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
          <Button colorScheme="blue" width="full" onClick={handleAuth}>
            Retry
          </Button>
          <Button variant="ghost" width="full" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={20}>
      <VStack spacing={4}>
        <Spinner size="xl" />
        <Text>Completing sign in...</Text>
      </VStack>
    </Container>
  );
};

export default AuthCallbackPage;
