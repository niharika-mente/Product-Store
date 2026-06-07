
import { Box, Button, Heading, HStack, IconButton, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useColorModeValue, useDisclosure, useToast, VStack } from '@chakra-ui/react';
import React from 'react'

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaHeart, FaRegHeart } from "react-icons/fa";

import { useProductStore } from "../../store/product";
import { useCart } from "../../context/CartContext.jsx";
import { useWishlist } from "../../context/WishlistContext.jsx";

const ProductCard = ({ product }) => {
  const [updatedProduct, setUpdatedProduct] = useState(product);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    setUpdatedProduct(product);
  }, [product._id]);

  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");

  const { deleteProduct, updateProduct } = useProductStore()
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, checkInWishlist } = useWishlist();
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Check if product is in wishlist on load
  useEffect(() => {
    const checkWishlist = async () => {
      const inWishlist = await checkInWishlist(product._id);
      setIsInWishlist(inWishlist);
    };
    checkWishlist();
  }, [product._id]);

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your shopping cart.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };


  const handleWishlistToggle = async () => {
    if (isInWishlist) {
      const result = await removeFromWishlist(product._id);
      if (result.success) {
        setIsInWishlist(false);
        toast({
          title: "Removed from Wishlist",
          description: `${product.name} has been removed from your wishlist.`,
          status: "info",
          duration: 2000,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove from wishlist",
          status: "error",
          duration: 2000,
        });
      }
    } else {
      const result = await addToWishlist(product._id);
      if (result.success) {
        setIsInWishlist(true);
        toast({
          title: "Added to Wishlist",
          description: `${product.name} has been added to your wishlist. ❤️`,
          status: "success",
          duration: 2000,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add to wishlist",
          status: "error",
          duration: 2000,
        });
      }
    }
  };


  

  const handleDeleteProduct = async (pid) => {
    const { success, message } = await deleteProduct(pid)
    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: "Product deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateProduct = async (pid, updatedProduct) => {
    const { success, message } = await updateProduct(pid, updatedProduct);
    onClose();
    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: "Product updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      role="group"
      shadow="lg"
      rounded="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-8px)",
        shadow: "2xl",
      }}
      bg={bg}
    >
      <Link to={`/product/${product._id}`}>
        <Image
          src={product.image}
          alt={product.name}
          h={48}
          w='full'
          objectFit='cover'
          transition="transform 0.4s"
          _groupHover={{ transform: "scale(1.05)" }}
          cursor="pointer"
        />
      </Link>

      <Box p={4}>
        <Heading as='h3' size='md' mb={2} noOfLines={1}>
          <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
            <Text _hover={{ color: "cyan.500" }} transition="color 0.2s">
              {product.name}
            </Text>
          </Link>
        </Heading>

        <Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
          ${product.price}
        </Text>

        <HStack spacing={2}>
          {/* Wishlist Heart Button */}
          <IconButton
            icon={isInWishlist ? <FaHeart color="red" /> : <FaRegHeart />}
            onClick={handleWishlistToggle}
            colorScheme={isInWishlist ? "red" : "gray"}
            variant="ghost"
            aria-label='Add to Wishlist'
            transition="all 0.2s"
            _hover={{
              transform: "scale(1.1)",
            }}
          />

          {/* Edit Button */}
          <IconButton
            icon={<FaEdit />}
            onClick={onOpen}
            colorScheme='blue'
            aria-label='Edit Product'
            transition="all 0.2s"
            _hover={{
              transform: "scale(1.1)",
            }}
          />

          {/* Delete Button */}
          <IconButton
            icon={<FaTrash />}
            onClick={() => handleDeleteProduct(product._id)}
            colorScheme='red'
            aria-label='Delete Product'
            transition="all 0.2s"
            _hover={{
              transform: "scale(1.1)",
            }}
          />

          <Button colorScheme='teal' onClick={handleAddToCart} size='sm' flex={1}
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-2px)",
            }}
          >
            Add to Cart
          </Button>
        </HStack>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Update Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder='Product Name'
                name='name'
                value={updatedProduct.name}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
              />
              <Input
                placeholder='Price'
                name='price'
                type='number'
                value={updatedProduct.price}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: Number(e.target.value) })}
              />
              <Input
                placeholder='Image URL'
                name='image'
                value={updatedProduct.image}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, image: e.target.value })}
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={() => handleUpdateProduct(product._id, updatedProduct)}
            >
              Update
            </Button>
            <Button
              variant='ghost'
              onClick={() => {
                onClose();
                setUpdatedProduct(product);
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductCard;