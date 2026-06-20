import {
  Box, Button, Heading, HStack, Image, Text, VStack,
  Badge, Divider, IconButton, useColorModeValue, SimpleGrid, Tooltip
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/product";

const Field = ({ label, value, highlight }) => {
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const bg = useColorModeValue("gray.50", "gray.700");
  const highlightBg = useColorModeValue("green.50", "green.900");

  return (
    <Box px={4} py={3} bg={highlight ? highlightBg : bg} borderRadius="md">
      <Text fontSize="xs" color={labelColor} mb={1} fontWeight="semibold" textTransform="uppercase">
        {label}
      </Text>
      <Text fontWeight="medium">{value ?? "—"}</Text>
    </Box>
  );
};

const ComparePage = () => {
  const { compareList, removeFromCompare, clearCompare } = useProductStore();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  if (compareList.length === 0) {
    return (
      <Box textAlign="center" py={20}>
        <Heading size="lg" mb={4}>No products to compare</Heading>
        <Text mb={6} color="gray.500">Add up to 4 products using the compare button on product cards.</Text>
        <Button as={Link} to="/" colorScheme="teal">Browse Products</Button>
      </Box>
    );
  }

  // Find best price
  const prices = compareList.map(p => p.price).filter(Boolean);
  const bestPrice = Math.min(...prices);

  const fields = [
    { label: "Price", key: "price", render: (p) => `$${p.price}`, highlight: (p) => p.price === bestPrice },
    { label: "Category", key: "category", render: (p) => p.category || "—" },
    { label: "Brand", key: "brand", render: (p) => p.brand || "—" },
    { label: "Stock", key: "stock", render: (p) => p.stock != null ? p.stock : "—", highlight: (p) => p.stock > 0 },
    { label: "Original Price", key: "originalPrice", render: (p) => p.originalPrice ? `$${p.originalPrice}` : "—" },
    { label: "Discount", key: "discount", render: (p) => p.discount ? `${p.discount}%` : "—" },
    { label: "Rating", key: "averageRating", render: (p) => p.averageRating ? `${p.averageRating} ⭐` : "—" },
    { label: "Description", key: "description", render: (p) => p.description || "—" },
  ];

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <Heading size="lg">Compare Products</Heading>
        <HStack>
          <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
            {compareList.length} / 4 products
          </Badge>
          <Button size="sm" colorScheme="red" variant="outline" onClick={clearCompare}>
            Clear All
          </Button>
        </HStack>
      </HStack>

      {/* Product headers */}
      <SimpleGrid columns={compareList.length} spacing={4} mb={4}>
        {compareList.map((product) => (
          <Box
            key={product._id}
            bg={bg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            position="relative"
          >
            <IconButton
              icon={<FaTrash />}
              size="xs"
              colorScheme="red"
              variant="ghost"
              position="absolute"
              top={2}
              right={2}
              onClick={() => removeFromCompare(product._id)}
              aria-label="Remove from compare"
            />
            <Image
              src={product.image}
              alt={product.name}
              h={40}
              w="full"
              objectFit="cover"
            />
            <Box p={3}>
              <Tooltip label={product.name}>
                <Text fontWeight="bold" noOfLines={2} fontSize="sm">
                  <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
                    {product.name}
                  </Link>
                </Text>
              </Tooltip>
              <Text fontWeight="bold" color="teal.500" mt={1}>${product.price}</Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      <Divider mb={4} />

      {/* Comparison rows */}
      <VStack spacing={3} align="stretch">
        {fields.map(({ label, render, highlight }) => (
          <Box key={label}>
            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>
              {label}
            </Text>
            <SimpleGrid columns={compareList.length} spacing={4}>
              {compareList.map((product) => (
                <Field
                  key={product._id}
                  label={label}
                  value={render(product)}
                  highlight={highlight ? highlight(product) : false}
                />
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ComparePage;