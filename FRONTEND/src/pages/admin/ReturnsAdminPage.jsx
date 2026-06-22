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
  useColorModeValue,
  Alert,
  AlertIcon,
  Button,
  Select,
  Textarea
} from '@chakra-ui/react';
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import { notify } from '../../utils/toastService';


const STATUS_COLORS = {
  Requested: 'blue',
  'Under Review': 'purple',
  Approved: 'green',
  Rejected: 'red',
  'Refund Initiated': 'teal',
  Completed: 'gray',
};

const ReturnsAdminPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/returns', {
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

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (id, newStatus, adminComments) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/returns/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, adminComments })
      });
      const data = await res.json();
      if (data.success) {
        notify.success('Success', 'Operation successful');
        fetchReturns();
      } else {
        notify.error('Error', 'An error occurred');
      }
    } catch (err) {
      notify.error('Error', 'An error occurred');
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={12} textAlign="center">
        <Spinner size="xl" color="cyan.400" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Admin Panel" },
            { label: "Manage Returns" }
          ]}
        />
        <Heading size="lg" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
          Manage Return Requests
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
              No return requests found.
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
              <HStack justify="space-between" flexWrap="wrap" gap={4}>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">Return ID</Text>
                  <Text fontWeight="semibold" fontSize="sm" fontFamily="mono">{ret._id}</Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">User</Text>
                  <Text fontSize="sm">{ret.userId?.name} ({ret.userId?.email})</Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">Order ID</Text>
                  <Text fontWeight="semibold" fontSize="sm" fontFamily="mono">{ret.orderId?._id || "Unknown"}</Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">Status</Text>
                  <Badge colorScheme={STATUS_COLORS[ret.status]} borderRadius="full" px={3} py={0.5}>
                    {ret.status}
                  </Badge>
                </VStack>
                <VStack align="end" spacing={0}>
                  <Text fontSize="xs" color={textColor} textTransform="uppercase" letterSpacing="wide">Refund Amount</Text>
                  <Text fontWeight="bold" fontSize="lg" color="cyan.500">${ret.refundAmount.toFixed(2)}</Text>
                </VStack>
              </HStack>
            </Box>

            <VStack align="stretch" spacing={0} divider={<Divider />} px={6} py={2}>
              {ret.items.map((item, idx) => (
                <HStack key={idx} py={3} spacing={4}>
                  <Box flex={1}>
                    <Text fontWeight="semibold">{item.name}</Text>
                    <Text fontSize="sm" color={textColor}>Reason: {item.reason} | Condition: {item.condition}</Text>
                  </Box>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="sm" color={textColor}>Qty: {item.quantity}</Text>
                    <Text fontWeight="medium">${(item.quantity * item.price).toFixed(2)}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
            
            <Box px={6} py={4} bg={cardBg} borderTopWidth="1px" borderColor={borderColor}>
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" fontWeight="bold">Admin Actions</Text>
                <HStack align="end" spacing={4}>
                  <Box flex={1}>
                    <Text fontSize="xs" mb={1}>Update Status:</Text>
                    <Select 
                      size="sm" 
                      defaultValue={ret.status} 
                      id={`status-${ret._id}`}
                    >
                      <option value="Requested">Requested</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Refund Initiated">Refund Initiated</option>
                      <option value="Completed">Completed</option>
                    </Select>
                  </Box>
                  <Box flex={2}>
                    <Text fontSize="xs" mb={1}>Comments (Visible to User):</Text>
                    <Textarea 
                      size="sm" 
                      defaultValue={ret.adminComments} 
                      id={`comments-${ret._id}`}
                      placeholder="e.g. Approved, refund will reflect in 3-5 days."
                    />
                  </Box>
                  <Button 
                    size="sm" 
                    colorScheme="cyan" 
                    onClick={() => {
                      const newStatus = document.getElementById(`status-${ret._id}`).value;
                      const adminComments = document.getElementById(`comments-${ret._id}`).value;
                      handleUpdateStatus(ret._id, newStatus, adminComments);
                    }}
                  >
                    Save Changes
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        ))}
      </VStack>
    </Container>
  );
};

export default ReturnsAdminPage;
