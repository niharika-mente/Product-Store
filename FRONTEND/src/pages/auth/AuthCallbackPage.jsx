import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner, Text, VStack } from '@chakra-ui/react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('authUser', JSON.stringify(data.data));
          navigate('/');
        } else {
          navigate('/login');
        }
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

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
