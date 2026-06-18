import {
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader, AlertDialogOverlay, Box, Button, Heading, HStack,
  IconButton, Image, Input, ModalOverlay, ModalHeader, ModalBody, ModalFooter, Modal, ModalCloseButton, ModalContent,
  Text, useColorModeValue,
  useDisclosure, useToast, VStack
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaHeart, FaRegHeart } from "react-icons/fa";
import { useProductStore } from "../../store/product";
import { useCart } from "../../store/cart";
import { useWishlist } from "../../context/WishlistContext.jsx";
import { FaBalanceScale } from "react-icons/fa";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from "../../utils/toastHelpers";

const ProductCard = ({ product }) => {
  const [updatedProduct, setUpdatedProduct] = useState(product);
  const [imagePreview, setImagePreview] = useState(product.image);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) setUpdatedProduct(product);
  }, [product]);

  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const optionalLabelColor = useColorModeValue("gray.600", "gray.300");

const { deleteProduct, updateProduct, addToCompare, compareList = [], isSubmitting, isDeleting } = useProductStore();
  const isInCompare = compareList.some((p) => p._id === product._id);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, checkInWishlist } = useWishlist();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();

  const isOutOfStock = product.stock != null && product.stock === 0;

  useEffect(() => {
    const checkWishlist = async () => {
      const inWishlist = await checkInWishlist(product._id);
      setIsInWishlist(inWishlist);
    };
    checkWishlist();
  }, [product._id, checkInWishlist]);

  useEffect(() => {
    setUpdatedProduct(product);
    setImagePreview(product.image);
  }, [product]);

  useEffect(() => {
    const url = imagePreview;
    return () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [imagePreview]);

  const handleModalOpen = () => {
    setUpdatedProduct(product);
    setImagePreview(product.image);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpen();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUpdatedProduct({ ...updatedProduct, imageFile: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const { status } = addToCart(product);
    if (status === 'capped') {
      showWarningToast(
        toast,
        "Stock limit reached",
        `Only ${product.stock} unit(s) of ${product.name} are available.`
      );
      return;
    }
    if (status === 'out_of_stock') return;
    showSuccessToast(
      toast,
      "Added to Cart",
      `${product.name} has been added to your shopping cart.`
    );
  };

  const handleWishlistToggle = async () => {
    if (isInWishlist) {
      const result = await removeFromWishlist(product._id);
      if (result.success) {
        setIsInWishlist(false);
        showInfoToast(
          toast,
          "Removed from Wishlist",
          `${product.name} has been removed from your wishlist.`
        );
      } else {
        showErrorToast(toast, "Error", result.message || "Failed to remove from wishlist");
      }
    } else {
      const result = await addToWishlist(product._id);
      if (result.success) {
        setIsInWishlist(true);
        showSuccessToast(
          toast,
          "Added to Wishlist",
          `${product.name} has been added to your wishlist. ❤️`
        );
      } else {
        showErrorToast(toast, "Error", result.message || "Failed to add to wishlist");
      }
    }
  };

  const handleDeleteProduct = async () => {
    onDeleteClose();
    const { success, message } = await deleteProduct(product._id);
    if (!success) {
      showErrorToast(toast, "Error", message);
    } else {
      showSuccessToast(toast, "Success", "Product deleted successfully");
    }
  };

  const handleUpdateProduct = async (pid, updatedProduct) => {
    const { success, message } = await updateProduct(pid, updatedProduct);
    onClose();
    if (!success) {
      showErrorToast(toast, "Error", message);
    } else {
      showSuccessToast(toast, "Success", "Product updated successfully");
    }
  };

  return (
    <Box
      className="product-card"
      tabIndex={0}
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
      _focus={{
        boxShadow: "outline",
        transform: "translateY(-8px)",
        outline: "none",
      }}
      bg={bg}
    >
      <Link to={`/product/${product._id}`} tabIndex="-1" aria-hidden="true">
        <Image
          src={product.image}
          alt={product.name}
          h={48}
          w="full"
          objectFit="cover"
          transition="transform 0.4s"
          _groupHover={{ transform: "scale(1.05)" }}
          cursor="pointer"
        />
      </Link>

      <Box p={4}>
        <Heading as="h3" size="md" mb={2} noOfLines={1}>
          <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
            <Text _hover={{ color: "cyan.500" }} transition="color 0.2s">
              {product.name}
            </Text>
          </Link>
        </Heading>

        <Text fontWeight="bold" fontSize="xl" color={textColor} mb={4}>
          ${product.price}
        </Text>

        <HStack spacing={2}>
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

          <IconButton
            icon={<FaEdit />}
            onClick={handleModalOpen}
            colorScheme="blue"
            aria-label={`Edit ${product.name}`}
            transition="all 0.2s"
            _hover={{ transform: "scale(1.1)" }}
          />
          <IconButton
            icon={<FaTrash />}
            onClick={onDeleteOpen}
            colorScheme="red"
            aria-label={`Delete ${product.name}`}
            transition="all 0.2s"
            _hover={{ transform: "scale(1.1)" }}
          />
          <IconButton
            icon={<FaBalanceScale />}
            onClick={() => addToCompare(product)}
            colorScheme={isInCompare ? "purple" : "gray"}
            aria-label="Add to compare"
            isDisabled={!isInCompare && compareList.length >= 2}
            title={isInCompare ? "Added to compare" : compareList.length >= 2 ? "Remove one to compare" : "Add to compare"}
            transition="all 0.2s"
            _hover={{ transform: "scale(1.1)" }}
          />
          <Button
            colorScheme="teal"
            onClick={handleAddToCart}
            size="sm"
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
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Product
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteProduct}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
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
                placeholder="Product Name"
                name="name"
                aria-label="Product Name"
                value={updatedProduct.name}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
              />
              <Input
                placeholder="Price"
                name="price"
                type="number"
                aria-label="Price"
                value={updatedProduct.price}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: Number(e.target.value) })}
              />

              <Box w="full">
                <Text fontSize="sm" mb={1} color="gray.500">
                  Upload a new image or paste a URL
                </Text>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  aria-label="Upload product image"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  p={1}
                />
              </Box>

              <Input
                placeholder="Or paste an Image URL"
                name="image"
                aria-label="Image URL"
                value={updatedProduct.imageFile ? "" : updatedProduct.image}
                onChange={(e) => {
                  setUpdatedProduct({ ...updatedProduct, image: e.target.value, imageFile: null });
                  setImagePreview(e.target.value || product.image);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />

              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  maxH="150px"
                  objectFit="contain"
                  rounded="md"
                  border="1px solid"
                  borderColor="gray.200"
                  w="full"
                />
              )}

              <Text fontSize="sm" fontWeight="bold" alignSelf="start" color={optionalLabelColor} mt={2}>
                Optional Details
              </Text>

              <Input
                placeholder="Description (optional)"
                name="description"
                aria-label="Description"
                value={updatedProduct.description || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
              />

              <Input
                placeholder="Category (optional)"
                name="category"
                aria-label="Category"
                value={updatedProduct.category || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: e.target.value })}
              />

              <Input
                placeholder="Brand (optional)"
                name="brand"
                aria-label="Brand"
                value={updatedProduct.brand || ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, brand: e.target.value })}
              />

              <Input
                placeholder="Stock Quantity (optional)"
                name="stock"
                type="number"
                aria-label="Stock Quantity"
                value={updatedProduct.stock ?? ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, stock: e.target.value === '' ? '' : Number(e.target.value) })}
              />

              <Input
                placeholder="Original Price (optional)"
                name="originalPrice"
                type="number"
                aria-label="Original Price"
                value={updatedProduct.originalPrice ?? ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, originalPrice: e.target.value === '' ? '' : Number(e.target.value) })}
              />

              <Input
                placeholder="Discount % (optional)"
                name="discount"
                type="number"
                aria-label="Discount Percentage"
                value={updatedProduct.discount ?? ''}
                onChange={(e) => setUpdatedProduct({ ...updatedProduct, discount: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleUpdateProduct(product._id, updatedProduct)}
              isLoading={isSubmitting}
              loadingText="Updating..."
            >
              Update
            </Button>
            <Button
              variant="ghost"
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
