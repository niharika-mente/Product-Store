import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
  LinkBox,
  LinkOverlay,
  Container,
  useColorModeValue,
} from "@chakra-ui/react";

import { useRecentlyViewed } from "../../store/product";

const RecentlyViewedCarousel = () => {
  const { recentlyViewed } = useRecentlyViewed();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.250", "gray.700");
  const titleColor = useColorModeValue("gray.800", "white");
  const priceColor = useColorModeValue("gray.600", "gray.300");

  if (!recentlyViewed.length) {
    return null;
  }

  return (
        <Container maxW="container.xl" py={12}>
            <Box mt={12} borderTop="1px solid" borderColor={borderColor} pt={10}>
            <Heading
                as="h3"
                size={{ base: "md", md: "lg" }}
                mb={6}
                bgGradient="linear(to-r, cyan.400, blue.500)"
                bgClip="text"
            >
                Recently Viewed
            </Heading>

            <Flex
                gap={6}
                overflowX="auto"
                pb={2}
            >
                {recentlyViewed.map((product) => (
                <LinkBox
                    key={product._id}
                    minW={{ base: "160px", md: "220px" }}
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    bg={cardBg}
                    borderColor={borderColor}
                    transition="all 0.3s"
                    _hover={{
                    transform: "translateY(-4px)",
                    shadow: "md",
                    }}
                >
                    <Image 
                    src={product.image} 
                    alt={product.name} 
                    h={{ base: "24", md: "28" }} 
                    w="full" 
                    objectFit="cover" 
                    fallbackSrc="https://via.placeholder.com/150"
                    />
                    <Box p={3}>
                    <Heading size="xs" my={2}>
                        <LinkOverlay as={RouterLink} to={`/product/${product._id}`} color={titleColor} _hover={{ color: "cyan.500" }}>
                        {product.name}
                        </LinkOverlay>
                    </Heading>
                    <Text fontSize="sm" fontWeight="bold" color={priceColor}>
                        ${product.price}
                    </Text>
                    </Box>
                </LinkBox>
                ))}
            </Flex>
            </Box>
        </Container>

  );
};

export default RecentlyViewedCarousel;