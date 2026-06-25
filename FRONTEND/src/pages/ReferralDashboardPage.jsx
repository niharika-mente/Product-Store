import { useEffect, useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Spinner,
  HStack,
  Divider,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  InputGroup,
  InputRightElement,
  Tooltip,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import Breadcrumbs from "../components/ui/Breadcrumbs";

const STATUS_COLORS = {
  rewarded: 'green',
  qualified: 'teal',
  registered: 'yellow',
  pending: 'gray',
  rejected: 'red',
};

const ReferralDashboardPage = () => {
  const [data, setData] = useState(null);
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [dashRes, linkRes] = await Promise.all([
          fetch('/api/referrals/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/referrals/link', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const dashData = await dashRes.json();
        const linkJson = await linkRes.json();

        if (dashData.success && linkJson.success) {
          setData(dashData.data);
          setLinkData(linkJson.data);
        } else {
          setError('Failed to load referral data.');
        }
      } catch {
        setError('Network error — please try again');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleCopy = () => {
    if (linkData?.url) {
      navigator.clipboard.writeText(linkData.url);
      setCopied(true);
      toast({ title: 'Referral link copied!', status: 'success', duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform) => {
    if (!linkData?.url) return;
    const url = encodeURIComponent(linkData.url);
    const text = encodeURIComponent('Join me on ShopMart and get amazing rewards!');
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'email': shareUrl = `mailto:?subject=${text}&body=${url}`; break;
    }
    window.open(shareUrl, '_blank');
  };

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
            { label: "My Account", href: "/profile" },
            { label: "Referral Program" }
          ]}
        />
        <HStack justify="space-between" align="center">
          <Heading size="lg" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
            Affiliate & Referral Program
          </Heading>
        </HStack>

        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <GridItem>
            <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <Stat>
                <StatLabel color={textColor}>Total Referrals</StatLabel>
                <StatNumber>{data?.stats?.total || 0}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <Stat>
                <StatLabel color={textColor}>Successful</StatLabel>
                <StatNumber color="green.500">{data?.stats?.successful || 0}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <Stat>
                <StatLabel color={textColor}>Pending</StatLabel>
                <StatNumber color="yellow.500">{data?.stats?.pending || 0}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg={bg} p={5} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
              <Stat>
                <StatLabel color={textColor}>Store Credits Earned</StatLabel>
                <StatNumber color="cyan.500">${data?.totalEarned?.toFixed(2) || '0.00'}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
        </Grid>

        {/* Share Section */}
        <Box bg={bg} p={8} borderRadius="xl" boxShadow="md" borderWidth="1px" borderColor={borderColor} textAlign="center">
          <Heading size="md" mb={4}>Share Your Referral Link</Heading>
          <Text color={textColor} mb={6}>Invite your friends and earn rewards when they complete their first purchase!</Text>
          
          <Container maxW="md">
            <InputGroup size="lg" mb={4}>
              <Input 
                value={linkData?.url || ''} 
                isReadOnly 
                pr="4.5rem" 
                bg={cardBg}
                borderColor="cyan.500"
                focusBorderColor="cyan.500"
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleCopy} colorScheme="cyan">
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            
            <HStack justify="center" spacing={4}>
              <Button size="sm" colorScheme="whatsapp" onClick={() => handleShare('whatsapp')}>WhatsApp</Button>
              <Button size="sm" colorScheme="twitter" onClick={() => handleShare('twitter')}>Twitter</Button>
              <Button size="sm" colorScheme="facebook" onClick={() => handleShare('facebook')}>Facebook</Button>
            </HStack>
          </Container>
        </Box>

        {/* History Table */}
        <Box bg={bg} borderRadius="xl" boxShadow="md" borderWidth="1px" borderColor={borderColor} overflow="hidden">
          <Box px={6} py={4} bg={cardBg} borderBottomWidth="1px" borderColor={borderColor}>
            <Heading size="sm">Referral History</Heading>
          </Box>
          
          {data?.referrals?.length === 0 ? (
            <Box p={8} textAlign="center">
              <Text color={textColor}>You haven't referred anyone yet. Start sharing your link!</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th isNumeric>Reward</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data?.referrals?.map(ref => (
                    <Tr key={ref.id}>
                      <Td>{new Date(ref.date).toLocaleDateString()}</Td>
                      <Td>
                        <Badge colorScheme={STATUS_COLORS[ref.status] || 'gray'}>
                          {ref.status}
                        </Badge>
                      </Td>
                      <Td isNumeric>${ref.reward.toFixed(2)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default ReferralDashboardPage;
