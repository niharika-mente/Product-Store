import React, { useEffect, useState } from 'react';
import {
  Box, Container, Grid, GridItem, Heading, Stat, StatLabel,
  StatNumber, StatHelpText, Text, useColorModeValue, Spinner, Center,
} from '@chakra-ui/react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const API = import.meta.env.VITE_API_URL ?? '';

function authHeader() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJSON(path) {
  const res = await fetch(`${API}${path}`, { headers: authHeader() });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

const StatCard = ({ label, value, help }) => {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <Box bg={bg} borderRadius="2xl" boxShadow="md" p={6}>
      <Stat>
        <StatLabel fontSize="sm" color="gray.500">{label}</StatLabel>
        <StatNumber fontSize="3xl">{value}</StatNumber>
        {help && <StatHelpText>{help}</StatHelpText>}
      </Stat>
    </Box>
  );
};

const ChartCard = ({ title, children }) => {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <Box bg={bg} borderRadius="2xl" boxShadow="md" p={6}>
      <Text fontWeight="semibold" mb={4} fontSize="md">{title}</Text>
      {children}
    </Box>
  );
};

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pageBg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    (async () => {
      try {
        const [s, r, tp, ug] = await Promise.all([
          fetchJSON('/api/admin/analytics/summary'),
          fetchJSON('/api/admin/analytics/revenue'),
          fetchJSON('/api/admin/analytics/top-products'),
          fetchJSON('/api/admin/analytics/user-growth'),
        ]);
        setSummary(s);
        setRevenue(r);
        setTopProducts(tp);
        setUserGrowth(ug);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Center minH="60vh"><Spinner size="xl" color="cyan.400" /></Center>;
  if (error) return <Center minH="60vh"><Text color="red.400">{error}</Text></Center>;

  return (
    <Box bg={pageBg} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Heading size="lg" mb={8} bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
          Admin Dashboard
        </Heading>

        {/* Summary cards */}
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }} gap={5} mb={8}>
          <GridItem>
            <StatCard
              label="Total Revenue"
              value={`$${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              help="Completed orders only"
            />
          </GridItem>
          <GridItem>
            <StatCard label="Total Orders" value={summary.totalOrders.toLocaleString()} />
          </GridItem>
          <GridItem>
            <StatCard label="Registered Users" value={summary.totalUsers.toLocaleString()} />
          </GridItem>
          <GridItem>
            <StatCard label="Active Products" value={summary.totalProducts.toLocaleString()} />
          </GridItem>
        </Grid>

        {/* Charts row 1 */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2,1fr)' }} gap={5} mb={5}>
          <GridItem>
            <ChartCard title="Monthly Revenue (last 6 months)">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#0bc5ea" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </GridItem>

          <GridItem>
            <ChartCard title="New Users (last 6 months)">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="newUsers" stroke="#68d391" strokeWidth={2} dot={{ r: 3 }} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </GridItem>
        </Grid>

        {/* Top products */}
        <ChartCard title="Top 5 Products by Units Sold">
          {topProducts.length === 0 ? (
            <Text color="gray.400" fontSize="sm">No completed orders yet.</Text>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={130} />
                <Tooltip />
                <Legend />
                <Bar dataKey="unitsSold" fill="#0bc5ea" name="Units Sold" radius={[0, 4, 4, 0]} />
                <Bar dataKey="revenue" fill="#9f7aea" name="Revenue ($)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;
