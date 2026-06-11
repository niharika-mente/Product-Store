import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Text, VStack } from '@chakra-ui/react';
import { useAuthStore } from '../../store/auth';

const AuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      setAuth(token, null);
      useAuthStore.getState().fetchMe().then(() => {
        navigate('/');
      });
    } else {
      navigate('/login');
    }
  }, []);

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
