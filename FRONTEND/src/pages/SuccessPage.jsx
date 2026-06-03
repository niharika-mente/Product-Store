import { Container, VStack, Heading, Text, Button, Icon, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { CheckCircleIcon } from "@chakra-ui/icons";

const SuccessPage = () => {
  const bg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Container maxW="container.md" py={12}>
      <VStack 
        spacing={6} 
        p={10} 
        bg={bg} 
        borderRadius="xl" 
        boxShadow="xl"
        textAlign="center"
      >
        <Icon as={CheckCircleIcon} w={20} h={20} color="green.400" />
        <Heading as="h1" size="2xl" color="green.400">
          Payment Successful!
        </Heading>
        <Text fontSize="lg" color={textColor}>
          Thank you for your purchase. Your mock checkout completed successfully.
        </Text>
        <Link to="/">
          <Button colorScheme="blue" size="lg" mt={6} _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }} transition="all 0.2s">
            Continue Shopping
          </Button>
        </Link>
      </VStack>
    </Container>
  );
};

export default SuccessPage;
