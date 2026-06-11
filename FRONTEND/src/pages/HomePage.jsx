import { Container, Text, VStack, Box, SimpleGrid } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { useProductStore } from '../store/product';
import ProductCard from '../components/ui/ProductCard';
import Footer from "../components/ui/footer";

const HomePage = () => {
  const { t } = useTranslation();
  const { fetchProducts, products } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <>
      <Container maxW='container.xl' py={12}>
        <VStack spacing={8}>
          <VStack gap={2}>
            <Text
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="extrabold"
              bgGradient="linear(to-r, cyan.400, blue.500)"
              bgClip="text"
              textAlign="center"
            >
              {t('products.title')} 🚀
            </Text>

            <Text color="gray.500" textAlign="center" maxW="600px">
              {t('products.subtitle')}
            </Text>

            <Box
              display="inline-block"
              bg="blue.500"
              color="white"
              px={6}
              py={3}
              borderRadius="xl"
              minW="140px"
              textAlign="center"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-3px)",
                boxShadow: "lg",
              }}
            >
              <Text fontSize="sm">{t('products.productsCount')}</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {products.length}
              </Text>
            </Box>
          </VStack>

          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
              lg: 3
            }}
            spacing={10}
            w={"full"}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </SimpleGrid>

          {products.length === 0 && (
            <VStack gap={4} py={12}>
              <Text fontSize="6xl">📪</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {t('products.noProducts')}
              </Text>
              <Text color="gray.500" textAlign="center">
                {t('products.noProductsDesc')}
              </Text>
              <Link to="/create">
                <Text
                  color="blue.500"
                  fontWeight="bold"
                  display="inline-block"
                  transition="all 0.2s"
                  _hover={{
                    color: "blue.600",
                    transform: "translateY(-2px)",
                  }}
                >
                  {t('products.createProduct')} ✨
                </Text>
              </Link>
            </VStack>
          )}
        </VStack>
      </Container>
      <Footer />
    </>
  );
};

export default HomePage;