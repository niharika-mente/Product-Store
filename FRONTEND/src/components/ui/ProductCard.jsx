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
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const optionalLabelColor = useColorModeValue("gray.600", "gray.300");

  const { deleteProduct, updateProduct } = useProductStore();
  const { addToCart } = useCart();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();

  const isOutOfStock = product.stock != null && product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const result = addToCart(product);
    if (result === 'capped') {
      toast({
        title: "Stock limit reached",
        description: `Only ${product.stock} unit(s) of ${product.name} are available.`,
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }
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
      toast({ title: "Error", description: message, status: "error", duration: 3000, isClosable: true });
    } else {
      toast({ title: "Success", description: "Product deleted successfully", status: "success", duration: 3000, isClosable: true });
    }
  };

  const handleUpdateProduct = async (pid, updatedProduct) => {
    const { success, message } = await updateProduct(pid, updatedProduct);
    onClose();
    if (!success) {
      toast({ title: "Error", description: message, status: "error", duration: 3000, isClosable: true });
    } else {
      toast({ title: "Success", description: "Product updated successfully", status: "success", duration: 3000, isClosable: true });
    }
  };

  return (
    <Box
      role="group"
      shadow="lg"
      rounded="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
      bg={bg}
    >
      <Link to={`/product/${product._id}`} tabIndex="-1" aria-hidden="true">
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
            aria-label={`Edit ${product.name}`}
            transition="all 0.2s"
            _hover={{ transform: "scale(1.1)" }}
          />
          <IconButton
            icon={<FaTrash />}
            onClick={onDeleteOpen}
            colorScheme='red'
            aria-label={`Delete ${product.name}`}
            transition="all 0.2s"
            _hover={{ transform: "scale(1.1)" }}
          />
          <Button
            colorScheme='teal'
            onClick={handleAddToCart}
            size='sm'
            flex={1}
            isDisabled={isOutOfStock}
            aria-label={`Add ${product.name} to cart`}
            transition="all 0.2s"
            _hover={{ transform: isOutOfStock ? "none" : "translateY(-2px)" }}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </HStack>
      </Box>

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
              <Button ref={cancelRef} onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme='red' onClick={handleDeleteProduct} ml={3}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

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
                aria-label="Product Name"
                value={updatedProduct.name}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
              />
              <Input
                placeholder='Price'
                name='price'
                type='number'
                aria-label="Price"
                value={updatedProduct.price}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: Number(e.target.value) })}
              />
              <Input
                placeholder='Image URL'
                name='image'
                aria-label="Image URL"
                value={updatedProduct.image}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, image: e.target.value })}
              />

              <Text fontSize="sm" fontWeight="bold" alignSelf="start" color={optionalLabelColor} mt={2}>
                Optional Details
              </Text>

              <Input
                placeholder='Description (optional)'
                name='description'
                aria-label="Description"
                value={updatedProduct.description || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
              />

              <Input
                placeholder='Category (optional)'
                name='category'
                aria-label="Category"
                value={updatedProduct.category || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: e.target.value })}
              />

              <Input
                placeholder='Brand (optional)'
                name='brand'
                aria-label="Brand"
                value={updatedProduct.brand || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, brand: e.target.value })}
              />

              <Input
                placeholder='Stock Quantity (optional)'
                name='stock'
                type='number'
                aria-label="Stock Quantity"
                value={updatedProduct.stock ?? ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, stock: Number(e.target.value) })}
              />

              <Input
                placeholder='Original Price (optional)'
                name='originalPrice'
                type='number'
                aria-label="Original Price"
                value={updatedProduct.originalPrice ?? ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, originalPrice: Number(e.target.value) })}
              />

              <Input
                placeholder='Discount % (optional)'
                name='discount'
                type='number'
                aria-label="Discount Percentage"
                value={updatedProduct.discount ?? ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, discount: Number(e.target.value) })}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => handleUpdateProduct(product._id, updatedProduct)}>
              Update
            </Button>
            <Button variant='ghost' onClick={() => { onClose(); setUpdatedProduct(product); }}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductCard;
