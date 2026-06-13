// import React, { useEffect, useState } from 'react';
// import {
//   Box, Heading, Text, SimpleGrid, Image, VStack, Button, useToast,
//   useColorModeValue, Container, Spinner
// } from '@chakra-ui/react';
// import { Link } from 'react-router-dom';
// import { useWishlist } from '../context/WishlistContext';

// const WishlistPage = () => {
//   const { wishlist, loading, removeFromWishlist, fetchWishlist } = useWishlist();
//   const toast = useToast();
//   const bgColor = useColorModeValue("white", "gray.800");

//   useEffect(() => {
//     fetchWishlist();
//   }, []);

//   const handleRemove = async (productId, productName) => {
//     await removeFromWishlist(productId);
//     toast({
//       title: "Removed",
//       description: `${productName} removed from wishlist`,
//       status: "info",
//       duration: 2000,
//     });
//   };

//   if (loading) {
//     return (
//       <Container centerContent py={10}>
//         <Spinner size="xl" />
//       </Container>
//     );
//   }

//   return (
//     <Container maxW="1140px" py={8}>
//       <Heading mb={6} textAlign="center">My Wishlist ❤️</Heading>

//       {wishlist.length === 0 ? (
//         <Box textAlign="center" py={10}>
//           <Text fontSize="lg" color="gray.500">Your wishlist is empty 😢</Text>
//           <Link to="/">
//             <Button colorScheme="blue" mt={4}>Browse Products</Button>
//           </Link>
//         </Box>
//       ) : (
//         <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
//           {wishlist.map((product) => (
//             <Box
//               key={product._id}
//               bg={bgColor}
//               shadow="md"
//               rounded="lg"
//               overflow="hidden"
//               transition="all 0.3s"
//               _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
//             >
//               <Image
//                 src={product.image}
//                 alt={product.name}
//                 h="200px"
//                 w="full"
//                 objectFit="cover"
//               />
//               <VStack p={4} align="start" spacing={2}>
//                 <Link to={`/product/${product._id}`}>
//                   <Text fontWeight="bold" fontSize="lg" _hover={{ color: "cyan.500" }}>
//                     {product.name}
//                   </Text>
//                 </Link>
//                 <Text fontWeight="bold" color="teal.500">${product.price}</Text>
//                 <Button
//                   size="sm"
//                   colorScheme="red"
//                   variant="outline"
//                   onClick={() => handleRemove(product._id, product.name)}
//                   w="full"
//                 >
//                   Remove
//                 </Button>
//               </VStack>
//             </Box>
//           ))}
//         </SimpleGrid>
//       )}
//     </Container>
//   );
// };

// export default WishlistPage;

import React, { useEffect } from 'react';
import {
  Box, Heading, Text, SimpleGrid, Image, VStack, Button, useToast,
  useColorModeValue, Container, Spinner, HStack
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { ArrowBackIcon } from '@chakra-ui/icons';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist, fetchWishlist } = useWishlist();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (productId, productName) => {
    await removeFromWishlist(productId);
    toast({
      title: "Removed",
      description: `${productName} removed from wishlist`,
      status: "info",
      duration: 2000,
    });
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="1140px" py={8}>
      {/* ✅ Header with Back Button */}
      <HStack mb={6} spacing={4} alignItems="center">
        <Button
          leftIcon={<ArrowBackIcon />}
          colorScheme="gray"
          variant="outline"
          onClick={handleGoBack}
          size="sm"
        >
          Go Back
        </Button>
        <Heading flex={1} textAlign="center" mr={16}>
          My Wishlist ❤️
        </Heading>
      </HStack>

      {wishlist.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500">Your wishlist is empty 😢</Text>
          <Link to="/">
            <Button colorScheme="blue" mt={4}>Browse Products</Button>
          </Link>
        </Box>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {wishlist.map((product) => (
              <Box
                key={product._id}
                bg={bgColor}
                shadow="md"
                rounded="lg"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  h="200px"
                  w="full"
                  objectFit="cover"
                />
                <VStack p={4} align="start" spacing={2}>
                  <Link to={`/product/${product._id}`}>
                    <Text fontWeight="bold" fontSize="lg" _hover={{ color: "cyan.500" }}>
                      {product.name}
                    </Text>
                  </Link>
                  <Text fontWeight="bold" color="teal.500">${product.price}</Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleRemove(product._id, product.name)}
                    w="full"
                  >
                    Remove
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
};

export default WishlistPage;