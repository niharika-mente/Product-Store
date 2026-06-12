import React, { useEffect, useState } from 'react';
import {
    Box, Button, Divider, Heading, HStack, Input, Text,
    Textarea, useColorModeValue, useToast, VStack
} from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const StarRating = ({ value, onChange, readonly = false }) => {
    const [hovered, setHovered] = useState(0);
    const filled = useColorModeValue('yellow.400', 'yellow.300');
    const empty = useColorModeValue('gray.300', 'gray.600');

    return (
        <HStack spacing={1}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Box
                    key={star}
                    as={readonly ? 'span' : 'button'}
                    onClick={!readonly ? () => onChange(star) : undefined}
                    onMouseEnter={!readonly ? () => setHovered(star) : undefined}
                    onMouseLeave={!readonly ? () => setHovered(0) : undefined}
                    cursor={readonly ? 'default' : 'pointer'}
                    color={(hovered || value) >= star ? filled : empty}
                    fontSize={readonly ? 'md' : 'xl'}
                    transition="color 0.15s"
                    aria-label={readonly ? undefined : `Rate ${star} out of 5`}
                >
                    <FaStar />
                </Box>
            ))}
        </HStack>
    );
};

const ReviewCard = ({ review }) => {
    const bg = useColorModeValue('gray.50', 'gray.700');
    const border = useColorModeValue('gray.200', 'gray.600');
    const textColor = useColorModeValue('gray.600', 'gray.400');

    const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <Box p={4} bg={bg} borderRadius="lg" borderWidth="1px" borderColor={border}>
            <HStack justify="space-between" mb={2} flexWrap="wrap" gap={2}>
                <Text fontWeight="bold">{review.userName}</Text>
                <HStack spacing={2}>
                    <StarRating value={review.rating} readonly />
                    <Text fontSize="sm" color={textColor}>{formattedDate}</Text>
                </HStack>
            </HStack>
            <Text fontSize="sm" color={textColor} lineHeight="tall">{review.comment}</Text>
        </Box>
    );
};

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ userName: '', rating: 0, comment: '' });

    const bg = useColorModeValue('white', 'gray.800');
    const border = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const toast = useToast();

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/products/${productId}/reviews`);
            if (!res.ok) {
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
         }
            const data = await res.json();
            if (data.success) setReviews(data.data);
        } catch (err) {
            // silently fail — reviews are non-critical
            console.error("Failed to fetch reviews:", err);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const handleSubmit = async () => {
        if (!form.userName.trim()) {
            return toast({ title: 'Please enter your name', status: 'warning', isClosable: true, duration: 3000 });
        }
        if (form.rating === 0) {
            return toast({ title: 'Please select a star rating', status: 'warning', isClosable: true, duration: 3000 });
        }
        if (!form.comment.trim()) {
            return toast({ title: 'Please write a comment', status: 'warning', isClosable: true, duration: 3000 });
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API}/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
                if (!res.ok) {
                throw new Error(`Server error: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            if (!data.success) {
                toast({ title: 'Error', description: data.message, status: 'error', isClosable: true, duration: 3000 });
            } else {
                toast({ title: 'Review submitted!', status: 'success', isClosable: true, duration: 3000 });
                setForm({ userName: '', rating: 0, comment: '' });
                fetchReviews();
            }
        } catch (err) {
              console.error("Failed to submit review:", err);

              let message;
               if (err instanceof TypeError) {
               message = "Network error — please check your connection";
               }
                else if (err.message) {
                message = err.message;
                }
                 else {
                message = "Network error. Please try again.";
            }

            toast({ title: "Error", description: message, status: "error", isClosable: true, duration: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box mt={16}>
            <Divider mb={8} />
            <Heading as="h2" size="lg" mb={6}>
                Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
            </Heading>

            <HStack align="flex-start" spacing={10} flexDir={{ base: 'column', lg: 'row' }}>

                {/* Review List */}
                <Box flex={1} w="full">
                    {loading ? (
                        <Text color={textColor}>Loading reviews...</Text>
                    ) : reviews.length === 0 ? (
                        <Box
                            p={6}
                            borderWidth="1px"
                            borderStyle="dashed"
                            borderColor={border}
                            borderRadius="lg"
                            textAlign="center"
                        >
                            <Text color={textColor} fontSize="sm">
                                No reviews yet. Be the first to share your thoughts!
                            </Text>
                        </Box>
                    ) : (
                        <VStack spacing={3} align="stretch">
                            {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
                        </VStack>
                    )}
                </Box>

                {/* Submit Form */}
                <Box
                    w={{ base: 'full', lg: '380px' }}
                    flexShrink={0}
                    p={6}
                    bg={bg}
                    borderWidth="1px"
                    borderColor={border}
                    borderRadius="xl"
                    boxShadow="sm"
                >
                    <Heading as="h3" size="md" mb={4}>Write a Review</Heading>

                    <VStack spacing={4} align="stretch">
                        <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={1}>Your Name</Text>
                            <Input
                                placeholder="Enter your name"
                                value={form.userName}
                                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                                maxLength={50}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={2}>Rating</Text>
                            <StarRating
                                value={form.rating}
                                onChange={(val) => setForm({ ...form, rating: val })}
                            />
                            {form.rating > 0 && (
                                <Text fontSize="xs" color={textColor} mt={1}>
                                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                                </Text>
                            )}
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={1}>Comment</Text>
                            <Textarea
                                placeholder="Share your experience with this product..."
                                value={form.comment}
                                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                                rows={4}
                                resize="vertical"
                                maxLength={500}
                            />
                            <Text fontSize="xs" color={textColor} textAlign="right" mt={1}>
                                {form.comment.length}/500
                            </Text>
                        </Box>

                        <Button
                            colorScheme="blue"
                            onClick={handleSubmit}
                            isLoading={submitting}
                            loadingText="Submitting..."
                            w="full"
                        >
                            Submit Review
                        </Button>
                    </VStack>
                </Box>
            </HStack>
        </Box>
    );
};

export default ProductReviews;
