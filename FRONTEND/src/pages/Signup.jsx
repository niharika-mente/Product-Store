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

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: 'Please complete all fields.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to register. Please try again.')
      }

      toast({
        title: 'Account created successfully!',
        description: 'You can now login and start adding premium products.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      })

      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/login')
      }, 1000)
    } catch (error) {
      toast({
        title: 'Registration failed.',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
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
              Premium Sign Up
            </Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')}>
              Create your secure account and unlock premium product management for your store.
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
                <FormControl id="name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    focusBorderColor="cyan.400"
                  />
                </FormControl>

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
                      placeholder="Create a secure password"
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

                <FormControl id="confirmPassword" isRequired>
                  <FormLabel>Confirm password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  loadingText="Creating account"
                  boxShadow="lg"
                >
                  Create Premium Account
                </Button>

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
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="cyan.500" fontWeight="semibold">
              Login now
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  )
}

export default Signup