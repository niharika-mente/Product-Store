import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Flex, Heading, HStack, Image, Input,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, Table, Tbody, Td, Text, Th, Thead,
  Tr, useColorModeValue, useDisclosure, useToast, VStack, Badge,
} from '@chakra-ui/react';
import { List } from 'react-window';
import { useProductStore } from '../store/product';

const ROW_HEIGHT = 56;
const VIRTUALIZE_THRESHOLD = 50;

const EMPTY_FORM = { name: '', price: '', image: '', description: '', category: '', stock: '' };

const ProductRow = ({ product: p, trHoverBg, openEdit, handleDelete }) => (
  <Tr _hover={{ bg: trHoverBg }}>
    <Td>
      {p.image
        ? <Image src={p.image} alt={p.name} boxSize="40px" objectFit="cover" borderRadius="md" />
        : <Box boxSize="40px" bg="gray.200" borderRadius="md" />}
    </Td>
    <Td fontWeight="medium" maxW="200px">
      <Text noOfLines={1}>{p.name}</Text>
    </Td>
    <Td>
      {p.category && <Badge colorScheme="purple" fontSize="11px">{p.category}</Badge>}
    </Td>
    <Td isNumeric>${Number(p.price).toFixed(2)}</Td>
    <Td isNumeric>
      <Badge colorScheme={p.stock > 0 ? 'green' : 'red'}>{p.stock ?? '—'}</Badge>
    </Td>
    <Td>
      <HStack spacing={2}>
        <Button size="xs" colorScheme="teal" onClick={() => openEdit(p)}>Edit</Button>
        <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleDelete(p._id, p.name)}>Delete</Button>
      </HStack>
    </Td>
  </Tr>
);

const VirtualRow = ({ index, style, products, trHoverBg, openEdit, handleDelete }) => {
  const p = products[index];
  return (
    <Flex
      key={p._id}
      style={style}
      align="center"
      px={3}
      _hover={{ bg: trHoverBg }}
      borderBottom="1px solid"
      borderColor="transparent"
    >
      <Box w="60px">
        {p.image
          ? <Image src={p.image} alt={p.name} boxSize="40px" objectFit="cover" borderRadius="md" />
          : <Box boxSize="40px" bg="gray.200" borderRadius="md" />}
      </Box>
      <Box flex="2" minW={0}>
        <Text noOfLines={1} fontWeight="medium">{p.name}</Text>
      </Box>
      <Box flex="1">
        {p.category && <Badge colorScheme="purple" fontSize="11px">{p.category}</Badge>}
      </Box>
      <Box flex="1" textAlign="right">${Number(p.price).toFixed(2)}</Box>
      <Box flex="1" textAlign="right">
        <Badge colorScheme={p.stock > 0 ? 'green' : 'red'}>{p.stock ?? '—'}</Badge>
      </Box>
      <Box flex="1" textAlign="right">
        <HStack spacing={2} justify="flex-end">
          <Button size="xs" colorScheme="teal" onClick={() => openEdit(p)}>Edit</Button>
          <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleDelete(p._id, p.name)}>Delete</Button>
        </HStack>
      </Box>
    </Flex>
  );
};

export default function AdminDashboardPage() {
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct } = useProductStore();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const theadBg = useColorModeValue('gray.50', 'gray.700');
  const trHoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    onOpen();
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      price: product.price ?? '',
      image: product.image || '',
      description: product.description || '',
      category: product.category || '',
      stock: product.stock ?? '',
    });
    setEditingId(product._id);
    onOpen();
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.price === '') {
      toast({ title: 'Name and price are required', status: 'warning', duration: 2500, isClosable: true });
      return;
    }
    setLoading(true);
    const payload = { ...form, price: Number(form.price), stock: form.stock !== '' ? Number(form.stock) : undefined };
    const { success, message } = editingId
      ? await updateProduct(editingId, payload)
      : await createProduct(payload);
    setLoading(false);
    toast({ title: message, status: success ? 'success' : 'error', duration: 3000, isClosable: true });
    if (success) { onClose(); fetchProducts(); }
  };

  const handleDelete = async (pid, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    const { success, message } = await deleteProduct(pid);
    toast({ title: message, status: success ? 'success' : 'error', duration: 3000, isClosable: true });
    if (success) fetchProducts();
  };

  return (
    <Container maxW="1200px" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Admin Dashboard</Heading>
        <Button colorScheme="blue" onClick={openAdd}>+ Add Product</Button>
      </Flex>

      <Box bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor} overflow="hidden" shadow="sm">
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg={theadBg}>
              <Tr>
                <Th>Image</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th isNumeric>Price</Th>
                <Th isNumeric>Stock</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            {products.length <= VIRTUALIZE_THRESHOLD && (
              <Tbody>
                {products.length === 0 && (
                  <Tr><Td colSpan={6} textAlign="center" py={10} color="gray.400">No products found.</Td></Tr>
                )}
                {products.map((p) => (
                  <ProductRow key={p._id} product={p} trHoverBg={trHoverBg} openEdit={openEdit} handleDelete={handleDelete} />
                ))}
              </Tbody>
            )}
          </Table>
        </Box>
        {products.length > VIRTUALIZE_THRESHOLD && (
          <Box data-testid="virtualized-product-list">
            <List
              rowComponent={VirtualRow}
              rowCount={products.length}
              rowHeight={ROW_HEIGHT}
              rowProps={{ products, trHoverBg, openEdit, handleDelete }}
              style={{ height: 480, width: '100%' }}
            />
          </Box>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingId ? 'Edit Product' : 'Add Product'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              {[
                { field: 'name', placeholder: 'Product name *', type: 'text' },
                { field: 'price', placeholder: 'Price *', type: 'number' },
                { field: 'image', placeholder: 'Image URL', type: 'text' },
                { field: 'category', placeholder: 'Category', type: 'text' },
                { field: 'stock', placeholder: 'Stock quantity', type: 'number' },
                { field: 'description', placeholder: 'Description', type: 'text' },
              ].map(({ field, placeholder, type }) => (
                <Input
                  key={field}
                  type={type}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="ghost">Cancel</Button>
            <Button colorScheme="blue" onClick={handleSave} isLoading={loading}>
              {editingId ? 'Save Changes' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
