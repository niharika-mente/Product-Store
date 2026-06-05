import {
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader, AlertDialogOverlay, Box, Button, Heading, HStack,
  IconButton, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, Text, useColorModeValue,
  useDisclosure, useToast, VStack
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useProductStore } from "../../store/product";
import { useCart } from "../../store/cart";

const ProductCard = ({ product }) => {
  const [updatedProduct, setUpdatedProduct] = useState(product);

  useEffect(() => {
    setUpdatedProduct(product);
  }, [product._id]);

  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");

  const { deleteProduct, updateProduct } = useProductStore();
  const { addToCart } = useCart();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();

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

  const handleDeleteProduct = async () => {
    onDeleteClose();
    const { success, message } = await deleteProduct(product._id);
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
          <IconButton
            icon={<FaEdit />}
            onClick={onOpen}
            colorScheme='blue'
            aria-label='Edit Product'
            transition="all 0.2s"
            _hover={{ transform: "scale(1.1)" }}
          />

          <IconButton
            icon={<FaTrash />}
            onClick={onDeleteOpen}
            colorScheme='red'
            aria-label='Delete Product'
            transition="all 0.2s"
            _hover={{ transform: "scale(1.1)" }}
          />

          <Button
            colorScheme='teal'
            onClick={handleAddToCart}
            size='sm'
            flex={1}
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)" }}
          >
            Add to Cart
          </Button>
        </HStack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Product
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleDeleteProduct} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Product Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="90vh">
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
              
              <Text fontSize="sm" fontWeight="bold" alignSelf="start" color="gray.500" mt={2}>
                Optional Details
              </Text>
              
              <Input
                placeholder='Description (optional)'
                name='description'
                value={updatedProduct.description || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
              />
              
              <Input
                placeholder='Category (optional)'
                name='category'
                value={updatedProduct.category || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: e.target.value })}
              />
              
              <Input
                placeholder='Brand (optional)'
                name='brand'
                value={updatedProduct.brand || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, brand: e.target.value })}
              />
              
              <Input
                placeholder='Stock Quantity (optional)'
                name='stock'
                type='number'
                value={updatedProduct.stock || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, stock: Number(e.target.value) })}
              />
              
              <Input
                placeholder='Original Price (optional)'
                name='originalPrice'
                type='number'
                value={updatedProduct.originalPrice || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, originalPrice: Number(e.target.value) })}
              />
              
              <Input
                placeholder='Discount % (optional)'
                name='discount'
                type='number'
                value={updatedProduct.discount || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, discount: Number(e.target.value) })}
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
