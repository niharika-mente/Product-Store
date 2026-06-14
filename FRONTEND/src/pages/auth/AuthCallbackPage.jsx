import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Text, VStack } from '@chakra-ui/react';

const AuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    } else {
      navigate('/login');
    }
  }, [navigate, params]);

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
