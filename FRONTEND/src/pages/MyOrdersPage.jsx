import { useEffect, useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Spinner,
  Badge,
  HStack,
  Divider,
  Image,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  completed: 'green',
  pending: 'yellow',
  failed: 'red',
  refunded: 'gray',
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.message || 'Failed to load orders');
        } else {
          setOrders(data.orders);
        }
      } catch {
        setError('Network error — please try again');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <Container maxW="container.md" py={12} textAlign="center">
        <Spinner size="xl" color="cyan.400" />
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="lg" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
            My Orders
          </Heading>
          <Link to="/">
            <Button variant="outline" colorScheme="cyan" size="sm">
              Continue Shopping
            </Button>
          </Link>
        </HStack>

        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {!error && orders.length === 0 && (
          <Box bg={bg} p={10} borderRadius="xl" boxShadow="md" textAlign="center">
            <Text fontSize="lg" color={textColor} mb={4}>
              You haven&apos;t placed any orders yet.
            </Text>
            <Link to="/">
              <Button colorScheme="cyan">Start Shopping</Button>
            </Link>
          </Box>
        )}

        {orders.map((order) => (
          <Box
            key={order._id}
            bg={bg}
            borderRadius="xl"
            boxShadow="md"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Box px={6} py={4} bg={cardBg} borderBottomWidth="1px" borderColor={borderColor}>
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">
                    Order ID
                  </Text>
                  <Text fontWeight="semibold" fontSize="sm" fontFamily="mono">
                    {order._id}
                  </Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">
                    Date
                  </Text>
                  <Text fontSize="sm">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">
                    Payment
                  </Text>
                  <Badge
                    colorScheme={STATUS_COLORS[order.paymentStatus] || 'gray'}
                    borderRadius="full"
                    px={3}
                    py={0.5}
                    textTransform="capitalize"
                  >
                    {order.paymentStatus}
                  </Badge>
                </VStack>
                <VStack align="end" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">
                    Total
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="cyan.500">
                    ${Number(order.totalAmount).toFixed(2)}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <VStack align="stretch" spacing={0} divider={<Divider />} px={6} py={2}>
              {order.items.map((item, idx) => (
                <HStack key={idx} py={3} spacing={4}>
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      boxSize="56px"
                      objectFit="cover"
                      borderRadius="md"
                      fallbackSrc="https://via.placeholder.com/56"
                    />
                  )}
                  <Box flex={1}>
                    <Text fontWeight="semibold">{item.name}</Text>
                    <Text fontSize="sm" color={textColor}>
                      Qty: {item.quantity} &times; ${Number(item.price).toFixed(2)}
                    </Text>
                  </Box>
                  <Text fontWeight="medium">
                    ${(item.quantity * item.price).toFixed(2)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Container>
  );
};

export default MyOrdersPage;
