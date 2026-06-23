import {
  Badge,
  Button,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useCart } from "../../store/cart";
import { useCurrencyStore } from "../../store/currency";
import { formatPrice } from "../../utils/currency";

const QuickViewModal = ({ isOpen, onClose, product }) => {
  const { addToCart } = useCart();
  const { currency, rates } = useCurrencyStore();

  if (!product) return null;

  const isOutOfStock = !product.stock || product.stock <= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quick View</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Image
              src={product.image}
              alt={product.name}
              borderRadius="md"
              maxH="300px"
              objectFit="cover"
            />

            <Text fontSize="2xl" fontWeight="bold">
              {product.name}
            </Text>

            <Text fontSize="xl" color="teal.500" fontWeight="bold">
              {formatPrice(product.price, currency, rates)}
            </Text>

            {product.category && <Badge colorScheme="blue">{product.category}</Badge>}

            {product.brand && (
              <Text>
                <strong>Brand:</strong> {product.brand}
              </Text>
            )}

            <Text>{product.description || "No description available."}</Text>

            <HStack>
              <Badge colorScheme={isOutOfStock ? "red" : "green"}>
                {isOutOfStock ? "Out of Stock" : `In Stock (${product.stock})`}
              </Badge>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            colorScheme="teal"
            onClick={() => addToCart(product)}
            isDisabled={isOutOfStock}
          >
            Add to Cart
          </Button>

          <Button
            as={Link}
            to={`/product/${product._id}`}
            colorScheme="blue"
            variant="outline"
          >
            View Details
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuickViewModal;
