import React, { useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../utils/toastHelpers";
import { useSavedForLaterStore } from "../store/savedForLater";

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email || !password) {
      showWarningToast(toast, 'Email and password are required.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.')
      }

      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data.user))

      // Sync local saved items with the backend profile
      await useSavedForLaterStore.getState().syncWithBackend();

      showSuccessToast(
        toast,
        'Login successful!',
        'Welcome back. Redirecting to your dashboard.'
      )

      setTimeout(() => {
        navigate('/')
      }, 800)
    } catch (error) {
      showErrorToast(toast, 'Login failed.', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={12}>
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="3xl"
        boxShadow="2xl"
        p={{ base: 8, md: 12 }}
      >
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={2} bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
              Welcome Back
            </Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')}>
              Sign in to continue managing your store and accessing premium product features.
            </Text>
          </Box>

          <Box
            bg={useColorModeValue('gray.50', 'gray.900')}
            borderRadius="2xl"
            p={6}
            boxShadow="sm"
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
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

                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      focusBorderColor="cyan.400"
                    />
                    <InputRightElement>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="cyan"
                  size="lg"
                  isLoading={loading}
                  loadingText="Logging in"
                  boxShadow="lg"
                >
                  Login to your account
                </Button>

                <Text textAlign="right" fontSize="sm">
                  <Link as={RouterLink} to="/forgot-password" color="cyan.500">
                    Forgot password?
                  </Link>
                </Text>

                <Stack spacing={3} mt={4}>
                  <Button
                    variant="outline"
                    colorScheme="red"
                    width="100%"
                    onClick={() => {
                      window.location.href = '/api/auth/google';
                    }}
                  >
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    width="100%"
                    onClick={() => {
                      window.location.href = '/api/auth/github';
                    }}
                  >
                    Continue with GitHub
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>

          <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.300')}>
            Need a new account?{' '}
            <Link as={RouterLink} to="/signup" color="cyan.500" fontWeight="semibold">
              Sign up now
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}

export default Login
