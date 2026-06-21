import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Flex, Image, Heading, Text, Button,
  Spinner, Alert, AlertIcon, VStack, HStack, useColorModeValue,
  useToast, Badge, Divider, Icon, Grid, GridItem, SimpleGrid, Checkbox
} from '@chakra-ui/react';
import { FaArrowLeft, FaShoppingCart, FaCheckCircle, FaTruck, FaShieldAlt, FaUndo, FaInfoCircle, FaGift, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCart } from '../store/cart.js';
import { useRecentlyViewed } from "../store/product";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import RelatedProducts from '../components/ui/RelatedProducts';
import ProductReviews from '../components/ui/ProductReviews';

const API = ( import.meta.env.VITE_API_URL || "" ).replace( /\/$/, "" );

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [bundleData, setBundleData] = useState(null);
  const [selectedBundleItems, setSelectedBundleItems] = useState([]);
  const [activeImg, setActiveImg] = useState(0);

  const { addToCart, addBundleToCart } = useCart();

  const { addRecentlyViewed } = useRecentlyViewed();
  const toast = useToast();

  const textColor = useColorModeValue("gray.700", "gray.300");
  const priceColor = useColorModeValue("blue.600", "blue.300");
  const borderCol = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const featureBg = useColorModeValue("gray.50", "gray.700");
  const infoColor = useColorModeValue("gray.700", "gray.300");

  const LOW_STOCK_THRESHOLD = 5;
  const hasStock = product && product.stock !== undefined && product.stock !== null;
  const isOutOfStock = hasStock && product.stock === 0;
  const isLowStock = hasStock && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  const maxQty = hasStock && product.stock > 0 ? Math.min(product.stock, 10) : 10;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API}/api/products/${id}`;
        const res = await fetch(url);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Product not found. It may have been deleted or the link is invalid.");
          } else if (res.status === 500) {
            throw new Error("Server error. Please try again later.");
          } else {
            throw new Error(`HTTP ${res.status}: Failed to fetch product`);
          }
        }

        const data = await res.json();

        if (data.success) {
          setProduct(data.data);
          setActiveImg(0);
          addRecentlyViewed(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch product details");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, addRecentlyViewed]);

  useEffect(() => {
    if (!id) return;
    const fetchBundle = async () => {
      try {
        const res = await fetch(`${API}/api/products/${id}/bundle`);
        if (!res.ok) {
           console.error("Failed to fetch bundle, status:", res.status);
           setBundleData(null);
           return;
        }
        const data = await res.json();
        if (data.success && data.data && data.data.items.length > 0) {
          setBundleData(data.data);
          setSelectedBundleItems(data.data.items.map(i => i.product._id));
        }
      } catch (err) {
        console.error("Error fetching bundle:", err);
        setBundleData(null);
      }
    };
    fetchBundle();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    const { status, added } = addToCart(product, quantity);
    if (added === 0) {
      toast({
        title: "Stock limit reached",
        description: `You already have the maximum available stock of ${product.name} in your cart.`,
        status: "warning",
        duration: 2500,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    if (status === 'capped') {
      toast({
        title: "Stock limit reached",
        description: `Only ${added} item${added !== 1 ? 's were' : ' was'} added — you've reached the available stock for ${product.name}.`,
        status: "warning",
        duration: 2500,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    toast({
      title: "Added to Cart",
      description: `${added} x ${product.name} added to your cart.`,
      status: "success",
      duration: 2500,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleAddBundleToCart = () => {
    const isFullBundle = selectedBundleItems.length === bundleData.items.length;
    const discount = isFullBundle ? bundleData.bundleDiscount : 0;
    const allItems = [product, ...bundleData.items
      .filter(i => selectedBundleItems.includes(i.product._id))
      .map(i => i.product)];
    const { addedCount, skippedCount } = addBundleToCart(allItems, discount);

    if (addedCount > 0) {
      toast({
        title: "Bundle Added!",
        description: `${addedCount} item${addedCount !== 1 ? 's' : ''} added to your cart.`,
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (skippedCount > 0) {
      toast({
        title: "Stock limit reached",
        description: `${skippedCount} item${skippedCount !== 1 ? 's' : ''} couldn't be added due to stock limits.`,
        status: "warning",
        duration: 3500,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const toggleBundleItem = (productId) => {
    setSelectedBundleItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <Flex minH="70vh" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
        <Text color={textColor} fontSize="lg">Loading product details...</Text>
      </Flex>
    );
  }

  if (error || !product) {
    return (
      <Container maxW="container.md" py={20}>
        <Alert status="error" borderRadius="lg" variant="left-accent" p={6}>
          <AlertIcon boxSize={6} />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold" fontSize="lg">Error Loading Product</Text>
            <Text fontSize="sm">{error || "Product not found or has been removed."}</Text>
          </VStack>
        </Alert>
        <Button
          as={RouterLink}
          to="/"
          mt={6}
          colorScheme="blue"
          leftIcon={<FaArrowLeft />}
          size="lg"
        >
          Back to Products
        </Button>
      </Container>
    );
  }

const allImages = [product?.image, ...(product?.images || [])].filter(Boolean);

  return (
    <>
      <Container maxW="container.xl" py={8}>
        <Breadcrumbs currentPage={product?.name || "Product Details"} />

        <Button
          as={RouterLink}
          to="/"
          variant="ghost"
          leftIcon={<FaArrowLeft />}
          mb={6}
          size="sm"
          _hover={{ bg: featureBg }}
        >
          Back to Products
        </Button>

        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={12}
          mb={16}
        >
          {/* Product Image Section */}
          <GridItem>
            <Box position="sticky" top="100px">
              <Box
                w="full" h={{ base: "400px", md: "550px" }}
                overflow="hidden" borderRadius="2xl"
                border="1px solid" borderColor={borderCol}
                boxShadow="2xl" bg={cardBg} position="relative"
                transition="all 0.3s" _hover={{ boxShadow: "dark-lg" }}
              >
                <Image
                  src={allImages[activeImg]}
                  alt={`${product.name} image ${activeImg + 1}`}
                  objectFit="contain" w="full" h="full" p={4}
                  fallbackSrc="https://via.placeholder.com/600x600?text=Product+Image"
                />
                {allImages.length > 1 && (
                  <>
                    <Button
                      position="absolute" left={2} top="50%" transform="translateY(-50%)"
                      size="sm" borderRadius="full" zIndex={1}
                      onClick={() => setActiveImg((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      aria-label="Previous image"
                    ><Icon as={FaChevronLeft} /></Button>
                    <Button
                      position="absolute" right={2} top="50%" transform="translateY(-50%)"
                      size="sm" borderRadius="full" zIndex={1}
                      onClick={() => setActiveImg((prev) => (prev + 1) % allImages.length)}
                      aria-label="Next image"
                    ><Icon as={FaChevronRight} /></Button>
                  </>
                )}
              </Box>
              {allImages.length > 1 && (
                <HStack spacing={2} mt={3} justify="center" flexWrap="wrap">
                  {allImages.map((img, idx) => (
                    <Box
                      key={idx} as="button" onClick={() => setActiveImg(idx)}
                      borderRadius="md" overflow="hidden" border="2px solid"
                      borderColor={activeImg === idx ? "blue.400" : borderCol}
                      w="60px" h="60px" transition="all 0.2s"
                      _hover={{ borderColor: "blue.300" }}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} objectFit="cover" w="full" h="full" />
                    </Box>
                  ))}
                </HStack>
              )}
            </Box>
          </GridItem>

          {/* Product Details Section */}
          <GridItem>
            <VStack align="stretch" spacing={6}>
              {/* Product Title */}
              <Box>
                {/* Stock Badge - Only show if stock data exists */}
                {product.stock !== undefined && product.stock !== null && (
                  <>
                    <Badge
                      colorScheme={product.stock === 0 ? "red" : isLowStock ? "orange" : "green"}
                      fontSize="sm"
                      mb={2}
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {product.stock === 0
                        ? "Out of Stock"
                        : isLowStock
                        ? `Low Stock — Only ${product.stock} left!`
                        : `In Stock (${product.stock} available)`}
                    </Badge>
                    {isLowStock && (
                      <Alert status="warning" borderRadius="md" mb={3} py={2} px={3}>
                        <AlertIcon />
                        <Text fontSize="sm" fontWeight="medium">
                          Hurry! Only <strong>{product.stock}</strong> item{product.stock !== 1 ? "s" : ""} left in stock — order soon before it sells out.
                        </Text>
                      </Alert>
                    )}
                  </>
                )}

                <Heading
                  as="h1"
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  fontWeight="extrabold"
                  lineHeight="1.2"
                  mb={2}
                >
                  {product.name}
                </Heading>

                {/* Average Rating */}
                {product.reviewCount > 0 && (
                  <HStack spacing={2} mt={2}>
                    {[1,2,3,4,5].map(s => (
                      <Box key={s} as="span" color={s <= Math.round(product.averageRating) ? 'yellow.400' : 'gray.300'} fontSize="sm">
                        ★
                      </Box>
                    ))}
                    <Text fontSize="sm" color={infoColor}>
                      {product.averageRating} ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                    </Text>
                  </HStack>
                )}

                {/* Category & Brand - Only show if exists */}
                <HStack spacing={3} mt={2} flexWrap="wrap">
                  {product.category && (
                    <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                      {product.category}
                    </Badge>
                  )}
                  {product.brand && (
                    <Text fontSize="sm" color={textColor}>
                      Brand: <Text as="span" fontWeight="bold">{product.brand}</Text>
                    </Text>
                  )}
                </HStack>
              </Box>

              {/* Price */}
              <HStack spacing={4} align="baseline" flexWrap="wrap">
                <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="bold" color={priceColor}>
                  ${product.price}
                </Text>

                {/* Show original price and discount only if data exists */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <Text fontSize="lg" color={textColor} textDecoration="line-through">
                      ${product.originalPrice}
                    </Text>
                    <Badge colorScheme="red" fontSize="md" px={2} py={1}>
                      {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </HStack>

              <Divider />

              {/* Description */}
              <Box>
                <Heading as="h3" size="md" mb={3}>
                  Product Description
                </Heading>
                {product.description && product.description.trim() ? (
                  <Text fontSize="md" color={textColor} lineHeight="tall" whiteSpace="pre-wrap">
                    {product.description}
                  </Text>
                ) : (
                  <Box
                    p={4}
                    bg={featureBg}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={borderCol}
                    borderStyle="dashed"
                  >
                    <HStack spacing={2} color={infoColor}>
                      <Icon as={FaInfoCircle} />
                      <Text fontSize="sm">
                        No detailed description available for this product yet. Check back later for more information.
                      </Text>
                    </HStack>
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Quantity Selector */}
              <Box>
                <Text fontWeight="semibold" mb={2}>Quantity</Text>
                <HStack spacing={3}>
                  <Button
                    size="md"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    isDisabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                  >
                    -
                  </Button>
                  <Text fontSize="xl" fontWeight="bold" minW="50px" textAlign="center">
                    {quantity}
                  </Text>
                  <Button
                    size="md"
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    isDisabled={quantity >= maxQty || isOutOfStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </Button>
                </HStack>
              </Box>

              {/* Add to Cart Button */}
              <Button
                colorScheme="blue"
                size="lg"
                fontSize="lg"
                h="60px"
                onClick={handleAddToCart}
                leftIcon={<FaShoppingCart />}
                isDisabled={isOutOfStock}
                boxShadow="lg"
                _hover={{
                  transform: isOutOfStock ? "none" : "translateY(-3px)",
                  boxShadow: isOutOfStock ? "lg" : "2xl",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
              >
                {isOutOfStock ? "Out of Stock" : `Add ${quantity > 1 ? `${quantity} items` : ''} to Cart`}
              </Button>

              {/* Features Grid */}
              <SimpleGrid columns={2} spacing={4} mt={4}>
                <FeatureBox
                  icon={FaTruck}
                  title="Free Delivery"
                  desc="On orders over $50"
                  bg={featureBg}
                />
                <FeatureBox
                  icon={FaShieldAlt}
                  title="Secure Payment"
                  desc="100% protected"
                  bg={featureBg}
                />
                <FeatureBox
                  icon={FaUndo}
                  title="Easy Returns"
                  desc="30-day guarantee"
                  bg={featureBg}
                />
                <FeatureBox
                  icon={FaCheckCircle}
                  title="Verified Quality"
                  desc="Premium standard"
                  bg={featureBg}
                />
              </SimpleGrid>
            </VStack>
          </GridItem>
        </Grid>

        {/* Frequently Bought Together */}
        {bundleData && bundleData.items.length > 0 && (
          <Box mb={16}>
            <Divider mb={8} />
            <Flex align="center" gap={3} mb={6}>
              <Icon as={FaGift} boxSize={6} color="blue.500" />
              <Heading as="h2" size="lg" fontWeight="bold">
                Frequently Bought Together
              </Heading>
            </Flex>

            <Box
              border="1px solid"
              borderColor={borderCol}
              borderRadius="2xl"
              p={6}
              bg={cardBg}
              boxShadow="lg"
            >
              <VStack align="stretch" spacing={4}>
                <HStack spacing={4}>
                  <Checkbox
                    isChecked
                    isDisabled
                    size="lg"
                    colorScheme="blue"
                  />
                  <Image
                    src={product.image}
                    alt={product.name}
                    boxSize="60px"
                    objectFit="cover"
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/60"
                  />
                  <Box flex={1}>
                    <Text fontWeight="semibold">{product.name}</Text>
                    <Text fontSize="sm" color={textColor}>${product.price}</Text>
                  </Box>
                </HStack>

                {bundleData.items.map((ci) => (
                  <HStack key={ci.product._id} spacing={4}>
                    <Checkbox
                      isChecked={selectedBundleItems.includes(ci.product._id)}
                      onChange={() => toggleBundleItem(ci.product._id)}
                      size="lg"
                      colorScheme="blue"
                    />
                    <Image
                      src={ci.product.image}
                      alt={ci.product.name}
                      boxSize="60px"
                      objectFit="cover"
                      borderRadius="md"
                      fallbackSrc="https://via.placeholder.com/60"
                    />
                    <Box flex={1}>
                      <Text fontWeight="semibold">{ci.product.name}</Text>
                      <Text fontSize="sm" color={textColor}>${ci.product.price}</Text>
                      {ci.reason && (
                        <Text fontSize="xs" color="blue.400" fontStyle="italic">
                          {ci.reason}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                ))}
              </VStack>

              <Divider my={6} />

              <Flex
                direction={{ base: "column", md: "row" }}
                align={{ base: "stretch", md: "center" }}
                justify="space-between"
                gap={4}
              >
                <Box>
                  <Text fontSize="sm" color={textColor}>
                    Bundle Total:{' '}
                    <Text as="span" textDecoration="line-through" color="gray.400">
                      ${bundleData.bundleTotal}
                    </Text>
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    ${(() => {
                      const selectedTotal = [product, ...bundleData.items
                        .filter(i => selectedBundleItems.includes(i.product._id))
                        .map(i => i.product)]
                        .reduce((sum, p) => sum + p.price, 0);
                      const isFullBundle = selectedBundleItems.length === bundleData.items.length;
                      const discount = isFullBundle
                        ? bundleData.bundleDiscount
                        : 0;
                      return (selectedTotal * (1 - discount)).toFixed(2);
                    })()}
                  </Text>
                  {selectedBundleItems.length === bundleData.items.length && (
                    <Text fontSize="sm" color="green.500" fontWeight="medium">
                      Save ${bundleData.savings} ({Math.round(bundleData.bundleDiscount * 100)}% off)
                    </Text>
                  )}
                </Box>
                <Button
                  colorScheme="green"
                  size="lg"
                  leftIcon={<FaShoppingCart />}
                  onClick={handleAddBundleToCart}
                  isDisabled={selectedBundleItems.length === 0}
                  boxShadow="lg"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                >
                  Add Bundle to Cart
                </Button>
              </Flex>
            </Box>
          </Box>
        )}

        {/* Reviews Section */}
        <ProductReviews productId={id} />

        {/* Related Products Section */}
        <RelatedProducts productId={id} />
      </Container>
    </>
  );
};

// Feature Box Component
const FeatureBox = ({ icon, title, desc, bg }) => {
  const textColor = useColorModeValue("gray.700", "gray.300");

  return (
    <HStack
      p={4}
      bg={bg}
      borderRadius="lg"
      spacing={3}
      border="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.600")}
    >
      <Icon as={icon} boxSize={6} color="blue.500" />
      <Box>
        <Text fontWeight="bold" fontSize="sm">{title}</Text>
        <Text fontSize="xs" color={textColor}>{desc}</Text>
      </Box>
    </HStack>
  );
};

export default ProductPage;
