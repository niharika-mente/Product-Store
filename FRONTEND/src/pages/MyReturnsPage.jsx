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
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import Breadcrumbs from "../components/ui/Breadcrumbs";

const STATUS_COLORS = {
  Requested: 'blue',
  'Under Review': 'purple',
  Approved: 'green',
  Rejected: 'red',
  'Refund Initiated': 'teal',
  Completed: 'gray',
};

const MyReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/returns/my-returns', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.message || 'Failed to load returns');
        } else {
          setReturns(data.returns);
        }
      } catch {
        setError('Network error — please try again');
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

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
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "My Profile", href: "/profile" },
            { label: "My Returns" }
          ]}
        />
        <Heading size="lg" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
          My Returns
        </Heading>

        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {!error && returns.length === 0 && (
          <Box bg={bg} p={10} borderRadius="xl" boxShadow="md" textAlign="center">
            <Text fontSize="lg" color={textColor}>
              You haven't requested any returns yet.
            </Text>
          </Box>
        )}

        {returns.map((ret) => (
          <Box
            key={ret._id}
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
                    Return ID
                  </Text>
                  <Text fontWeight="semibold" fontSize="sm" fontFamily="mono">
                    {ret._id}
                  </Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">
                    Order ID
                  </Text>
                  <Text fontWeight="semibold" fontSize="sm" fontFamily="mono">
                    {ret.orderId?._id || "Unknown"}
                  </Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">
                    Date
                  </Text>
                  <Text fontSize="sm">
                    {new Date(ret.createdAt).toLocaleDateString()}
                  </Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">
                    Status
                  </Text>
                  <Badge colorScheme={STATUS_COLORS[ret.status]} borderRadius="full" px={3} py={0.5}>
                    {ret.status}
                  </Badge>
                </VStack>
              </HStack>
            </Box>

            <VStack align="stretch" spacing={0} divider={<Divider />} px={6} py={2}>
              {ret.items.map((item, idx) => (
                <HStack key={idx} py={3} spacing={4}>
                  <Box flex={1}>
                    <Text fontWeight="semibold">{item.name}</Text>
                    <Text fontSize="sm" color={textColor}>
                      Reason: {item.reason} | Condition: {item.condition}
                    </Text>
                  </Box>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="sm" color={textColor}>Qty: {item.quantity}</Text>
                    <Text fontWeight="medium">${(item.quantity * item.price).toFixed(2)}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
            
            {(ret.adminComments || ret.refundAmount > 0) && (
              <Box px={6} py={4} bg={cardBg} borderTopWidth="1px" borderColor={borderColor}>
                <HStack justify="space-between">
                  {ret.adminComments ? (
                    <Box>
                      <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">Admin Note</Text>
                      <Text fontSize="sm">{ret.adminComments}</Text>
                    </Box>
                  ) : <Box />}
                  <VStack align="end" spacing={0}>
                    <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">Expected Refund</Text>
                    <Text fontWeight="bold" fontSize="lg" color="cyan.500">${ret.refundAmount.toFixed(2)}</Text>
                  </VStack>
                </HStack>
              </Box>
            )}
          </Box>
        ))}
      </VStack>
    </Container>
  );
};

export default MyReturnsPage;
