import React, { useCallback, useEffect, useState } from "react";
import {
  Box, Button, Container, Divider, Flex, FormControl, FormLabel,
  Heading, HStack, IconButton, Input, Spinner, Tab, TabList,
  TabPanel, TabPanels, Tabs, Text, useColorModeValue, useToast, VStack,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, useDisclosure, Badge, Avatar,
} from "@chakra-ui/react";
import { FaEdit, FaTrash, FaStar, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

const EMPTY_ADDRESS = {
  label: "Home", fullName: "", phone: "", line1: "", line2: "",
  city: "", state: "", postalCode: "", country: "", isDefault: false,
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", avatar: "" });
  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDRESS);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [addrSaving, setAddrSaving] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const readOnlyBg = useColorModeValue("gray.50", "gray.700");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/user/profile");
      setProfile(data.data);
      setProfileForm({ name: data.data.name || "", phone: data.data.phone || "", avatar: data.data.avatar || "" });
      setAddresses(data.data.addresses || []);
    } catch {
      toast({ title: "Failed to load profile", status: "error", isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, [navigate, fetchProfile]);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/user/profile", profileForm);
      setProfile(data.data);
      toast({ title: "Profile updated", status: "success", isClosable: true });
    } catch {
      toast({ title: "Failed to update profile", status: "error", isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setAddrForm(EMPTY_ADDRESS);
    setEditingAddrId(null);
    onOpen();
  };

  const openEditModal = (addr) => {
    setAddrForm({ ...addr });
    setEditingAddrId(addr._id);
    onOpen();
  };

  const handleAddrSave = async () => {
    const { fullName, line1, city, postalCode, country } = addrForm;
    if (!fullName || !line1 || !city || !postalCode || !country) {
      toast({ title: "Please fill required fields", status: "warning", isClosable: true });
      return;
    }
    setAddrSaving(true);
    try {
      let res;
      if (editingAddrId) {
        res = await api.put(`/user/addresses/${editingAddrId}`, addrForm);
      } else {
        res = await api.post("/user/addresses", addrForm);
      }
      setAddresses(res.data.data);
      toast({ title: editingAddrId ? "Address updated" : "Address added", status: "success", isClosable: true });
      onClose();
    } catch {
      toast({ title: "Failed to save address", status: "error", isClosable: true });
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddr = async (id) => {
    try {
      const { data } = await api.delete(`/user/addresses/${id}`);
      setAddresses(data.data);
      toast({ title: "Address removed", status: "info", isClosable: true });
    } catch {
      toast({ title: "Failed to delete address", status: "error", isClosable: true });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const { data } = await api.patch(`/user/addresses/${id}/default`);
      setAddresses(data.data);
    } catch {
      toast({ title: "Failed to set default", status: "error", isClosable: true });
    }
  };

  if (loading) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6} size="xl">My Profile</Heading>

      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>Profile Info</Tab>
          <Tab>Address Book</Tab>
        </TabList>

        <TabPanels>
          {/* ── Profile Info Tab ── */}
          <TabPanel px={0} pt={6}>
            <Box bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="xl" p={6}>
              <Flex align="center" gap={6} mb={6} direction={{ base: "column", sm: "row" }}>
                <Avatar size="xl" name={profile?.name} src={profileForm.avatar || undefined} />
                <Box flex={1}>
                  <Text fontWeight="bold" fontSize="lg">{profile?.name}</Text>
                  <Text color={labelColor} fontSize="sm">{profile?.email}</Text>
                  <Badge mt={1} colorScheme="purple" fontSize="xs">{profile?.provider || "local"}</Badge>
                </Box>
              </Flex>

              <Divider mb={6} />

              <VStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Full Name</FormLabel>
                  <Input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Email <Text as="span" color={labelColor}>(read-only)</Text></FormLabel>
                  <Input value={profile?.email || ""} isReadOnly bg={readOnlyBg} />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Phone Number</FormLabel>
                  <Input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Avatar URL</FormLabel>
                  <Input value={profileForm.avatar} onChange={e => setProfileForm(p => ({ ...p, avatar: e.target.value }))} placeholder="https://..." />
                </FormControl>

                <Button colorScheme="blue" w="full" onClick={handleProfileSave} isLoading={saving} loadingText="Saving...">
                  Save Changes
                </Button>
              </VStack>
            </Box>
          </TabPanel>

          {/* ── Address Book Tab ── */}
          <TabPanel px={0} pt={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Saved Addresses</Heading>
              <Button size="sm" colorScheme="blue" onClick={openAddModal}>+ Add Address</Button>
            </Flex>

            {addresses.length === 0 ? (
              <Box bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="xl" p={10} textAlign="center">
                <Text color={labelColor}>No saved addresses yet.</Text>
                <Button mt={4} colorScheme="blue" size="sm" onClick={openAddModal}>Add your first address</Button>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {addresses.map(addr => (
                  <Box key={addr._id} bg={cardBg} borderWidth="1px" borderColor={addr.isDefault ? "blue.400" : border} borderRadius="xl" p={5}>
                    <Flex justify="space-between" align="flex-start">
                      <Box>
                        <HStack mb={1}>
                          <Badge colorScheme={addr.isDefault ? "blue" : "gray"}>{addr.label || "Home"}</Badge>
                          {addr.isDefault && <Badge colorScheme="green">Default</Badge>}
                        </HStack>
                        <Text fontWeight="semibold">{addr.fullName}</Text>
                        {addr.phone && <Text fontSize="sm" color={labelColor}>{addr.phone}</Text>}
                        <Text fontSize="sm">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</Text>
                        <Text fontSize="sm">{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postalCode}</Text>
                        <Text fontSize="sm">{addr.country}</Text>
                      </Box>

                      <HStack spacing={1}>
                        {!addr.isDefault && (
                          <IconButton
                            size="sm" variant="ghost" icon={<FaRegStar />} colorScheme="yellow"
                            aria-label="Set as default" title="Set as default"
                            onClick={() => handleSetDefault(addr._id)}
                          />
                        )}
                        {addr.isDefault && (
                          <IconButton size="sm" variant="ghost" icon={<FaStar />} colorScheme="yellow" aria-label="Default address" isDisabled />
                        )}
                        <IconButton size="sm" variant="ghost" icon={<FaEdit />} colorScheme="blue" aria-label="Edit" onClick={() => openEditModal(addr)} />
                        <IconButton size="sm" variant="ghost" icon={<FaTrash />} colorScheme="red" aria-label="Delete" onClick={() => handleDeleteAddr(addr._id)} />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* ── Add / Edit Address Modal ── */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingAddrId ? "Edit Address" : "Add New Address"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <HStack w="full">
                <FormControl>
                  <FormLabel fontSize="sm">Label</FormLabel>
                  <Input value={addrForm.label} onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))} placeholder="Home / Work / Other" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Full Name</FormLabel>
                  <Input value={addrForm.fullName} onChange={e => setAddrForm(p => ({ ...p, fullName: e.target.value }))} />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontSize="sm">Phone</FormLabel>
                <Input value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Address Line 1</FormLabel>
                <Input value={addrForm.line1} onChange={e => setAddrForm(p => ({ ...p, line1: e.target.value }))} placeholder="Street address, P.O. box" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Address Line 2</FormLabel>
                <Input value={addrForm.line2} onChange={e => setAddrForm(p => ({ ...p, line2: e.target.value }))} placeholder="Apt, suite, unit, floor (optional)" />
              </FormControl>

              <HStack w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">City</FormLabel>
                  <Input value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">State / Province</FormLabel>
                  <Input value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))} />
                </FormControl>
              </HStack>

              <HStack w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Postal Code</FormLabel>
                  <Input value={addrForm.postalCode} onChange={e => setAddrForm(p => ({ ...p, postalCode: e.target.value }))} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Country</FormLabel>
                  <Input value={addrForm.country} onChange={e => setAddrForm(p => ({ ...p, country: e.target.value }))} />
                </FormControl>
              </HStack>

              <FormControl display="flex" alignItems="center" gap={3}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addrForm.isDefault}
                  onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                />
                <FormLabel htmlFor="isDefault" mb={0} fontSize="sm">Set as default address</FormLabel>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddrSave} isLoading={addrSaving} loadingText="Saving...">
              {editingAddrId ? "Update" : "Add Address"}
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
