import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    HStack,
    Input,
    Text,
    Textarea,
    useColorModeValue,
    useToast,
    VStack,
    Badge,
    Avatar,
    Image,
} from '@chakra-ui/react';
import { FaStar, FaPen } from 'react-icons/fa';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const StarRating = ({ value, onChange, readonly = false, size = 'md' }) => {
    const [hovered, setHovered] = useState(0);

    const filledColor = useColorModeValue('yellow.400', 'yellow.300');
    const emptyColor  = useColorModeValue('gray.300', 'gray.600');

    const fontSize = size === 'sm' ? '14px' : size === 'lg' ? '24px' : '20px';

    return (
        <HStack spacing={1}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Box
                    key={star}
                    as={readonly ? 'span' : 'button'}
                    type={readonly ? undefined : 'button'}
                    onClick={!readonly ? () => onChange(star) : undefined}
                    onMouseEnter={!readonly ? () => setHovered(star) : undefined}
                    onMouseLeave={!readonly ? () => setHovered(0) : undefined}
                    cursor={readonly ? 'default' : 'pointer'}
                    color={(hovered || value) >= star ? filledColor : emptyColor}
                    fontSize={fontSize}
                    transition="color 0.15s, transform 0.1s"
                    _hover={!readonly ? { transform: 'scale(1.2)' } : undefined}
                    aria-label={readonly ? undefined : `Rate ${star} out of 5`}
                >
                    <FaStar />
                </Box>
            ))}
        </HStack>
    );
};

const RatingSummary = ({ reviews }) => {
    const labelColor = useColorModeValue('gray.600', 'gray.400');
    const barBg      = useColorModeValue('gray.100', 'gray.700');
    const barFill    = useColorModeValue('yellow.400', 'yellow.300');
    const cardBg     = useColorModeValue('gray.50', 'gray.700');
    const borderCol  = useColorModeValue('gray.200', 'gray.600');

    if (reviews.length === 0) return null;

    const avg     = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const rounded = Math.round(avg * 10) / 10;

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    return (
        <Box
            p={5}
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderCol}
            mb={6}
        >
            <Flex gap={8} align="center" flexDir={{ base: 'column', sm: 'row' }}>
                {/* Big average number */}
                <VStack spacing={1} minW="100px" align="center">
                    <Text
                        fontSize="5xl"
                        fontWeight="extrabold"
                        bgGradient="linear(to-r, cyan.400, blue.500)"
                        bgClip="text"
                        lineHeight={1}
                    >
                        {rounded}
                    </Text>
                    <StarRating value={Math.round(rounded)} readonly size="sm" />
                    <Text fontSize="xs" color={labelColor}>
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </Text>
                </VStack>

                {/* Distribution bars */}
                <VStack spacing={1} flex={1} w="full" align="stretch">
                    {distribution.map(({ star, count }) => {
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                            <HStack key={star} spacing={2}>
                                <Text fontSize="xs" color={labelColor} w="8px">
                                    {star}
                                </Text>
                                <Box flex={1} bg={barBg} borderRadius="full" h="8px" overflow="hidden">
                                    <Box
                                        w={`${pct}%`}
                                        h="full"
                                        bg={barFill}
                                        borderRadius="full"
                                        transition="width 0.5s ease"
                                    />
                                </Box>
                                <Text fontSize="xs" color={labelColor} w="24px" textAlign="right">
                                    {count}
                                </Text>
                            </HStack>
                        );
                    })}
                </VStack>
            </Flex>
        </Box>
    );
};

const ReviewCard = ({ review }) => {
    const bg        = useColorModeValue('white', 'gray.800');
    const borderCol = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const nameColor = useColorModeValue('gray.800', 'white');

    const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    
    const avatarColors = ['blue', 'cyan', 'teal', 'purple', 'pink'];
    const colorIndex   = review.userName.charCodeAt(0) % avatarColors.length;
    const avatarScheme = avatarColors[colorIndex];

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    return (
        <Box
            p={5}
            bg={bg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderCol}
            transition="all 0.2s"
            _hover={{ boxShadow: 'md', borderColor: 'blue.200' }}
        >
            <Flex justify="space-between" align="flex-start" mb={3} gap={3} flexWrap="wrap">
                <HStack spacing={3}>
                    <Avatar
                        name={review.userName}
                        size="sm"
                        colorScheme={avatarScheme}
                        bgGradient={`linear(to-br, ${avatarScheme}.400, ${avatarScheme}.600)`}
                        color="white"
                    />
                    <Box>
                        <Text fontWeight="bold" fontSize="sm" color={nameColor}>
                            {review.userName}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                            {formattedDate}
                        </Text>
                    </Box>
                </HStack>

                <HStack spacing={2}>
                    <StarRating value={review.rating} readonly size="sm" />
                    <Badge
                        colorScheme={review.rating >= 4 ? 'green' : review.rating === 3 ? 'yellow' : 'red'}
                        variant="subtle"
                        fontSize="xs"
                        px={2}
                        borderRadius="full"
                    >
                        {ratingLabels[review.rating]}
                    </Badge>
                </HStack>
            </Flex>

            <Text fontSize="sm" color={textColor} lineHeight="tall">
                {review.comment}
            </Text>
        </Box>
    );
};

// Review submission form
const ReviewForm = ({ productId, onReviewAdded }) => {
    const [form, setForm]           = useState({ userName: '', rating: 0, comment: '' });
    const [submitting, setSubmitting] = useState(false);

    const bg        = useColorModeValue('white', 'gray.800');
    const borderCol = useColorModeValue('gray.200', 'gray.700');
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const subLabelColor = useColorModeValue('gray.500', 'gray.400');
    const ratingLabels  = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    const toast = useToast();


    const handleSubmit = async () => {
        if (!form.userName.trim()) {
            return toast({
                title: 'Name required',
                description: 'Please enter your name before submitting.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
        }
        if (form.rating === 0) {
            return toast({
                title: 'Rating required',
                description: 'Please select a star rating.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
        }
        if (!form.comment.trim()) {
            return toast({
                title: 'Comment required',
                description: 'Please write a comment before submitting.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API}/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            
            if (!res.ok) {
                throw new Error(`Server error: ${res.status} ${res.statusText}`);
            }
            
            const data = await res.json();

            if (!data.success) {
                toast({
                    title: 'Could not submit review',
                    description: data.message,
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                    position: 'top-right',
                });
            } else {
                toast({
                    title: 'Review submitted!',
                    description: 'Thanks for sharing your feedback.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
                setForm({ userName: '', rating: 0, comment: '' });
                onReviewAdded();
            }
        } catch (err) {
            console.error("Failed to submit review:", err);

            let message;
            if (err instanceof TypeError) {
                message = "Network error — please check your connection";
            } else if (err.message && err.message.startsWith("Server error:")) {
                message = "Something went wrong on our end. Please try again later.";
            } else {
                message = "Failed to submit review. Please try again.";
            }

            toast({
                title: "Error",
                description: message,
                status: "error",
                isClosable: true,
                duration: 3000,
                position: 'top-right',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box
            p={6}
            bg={bg}
            borderWidth="1px"
            borderColor={borderCol}
            borderRadius="xl"
            boxShadow="sm"
            position={{ lg: 'sticky' }}
            top={{ lg: '100px' }}
        >
            {/* Form header with gradient accent */}
            <HStack spacing={2} mb={5}>
                <Box
                    p={2}
                    bgGradient="linear(to-br, cyan.400, blue.500)"
                    borderRadius="lg"
                    color="white"
                    fontSize="sm"
                >
                    <FaPen />
                </Box>
                <Heading as="h3" size="md">
                    Write a Review
                </Heading>
            </HStack>

            <VStack spacing={4} align="stretch">
                {/* Name field */}
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
                        Your Name
                    </Text>
                    <Input
                        placeholder="e.g. John Doe"
                        value={form.userName}
                        onChange={(e) => setForm({ ...form, userName: e.target.value })}
                        maxLength={50}
                        focusBorderColor="blue.400"
                    />
                </Box>

                {/* Star rating */}
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>
                        Your Rating
                    </Text>
                    <StarRating
                        value={form.rating}
                        onChange={(val) => setForm({ ...form, rating: val })}
                        size="lg"
                    />
                    <Text fontSize="xs" color={subLabelColor} mt={1} minH="16px">
                        {form.rating > 0 ? ratingLabels[form.rating] : 'Click to rate'}
                    </Text>
                </Box>

                {/* Comment */}
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
                        Your Review
                    </Text>
                    <Textarea
                        placeholder="What did you like or dislike about this product?"
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        rows={4}
                        resize="vertical"
                        maxLength={500}
                        focusBorderColor="blue.400"
                    />
                    <Text fontSize="xs" color={subLabelColor} textAlign="right" mt={1}>
                        {form.comment.length} / 500
                    </Text>
                </Box>

                <Button
                    bgGradient="linear(to-r, cyan.400, blue.500)"
                    color="white"
                    _hover={{
                        bgGradient: 'linear(to-r, cyan.500, blue.600)',
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s"
                    onClick={handleSubmit}
                    isLoading={submitting}
                    loadingText="Submitting..."
                    w="full"
                    size="lg"
                >
                    Submit Review
                </Button>
            </VStack>
        </Box>
    );
};

// Main exported component
const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const textColor = useColorModeValue('gray.500', 'gray.400');


    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/api/products/${productId}/reviews`);
            if (!res.ok) {
                throw new Error(`Server error: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            if (data.success) setReviews(data.data);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
            // Reviews are non-critical; silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    return (
        <Box mt={16}>
            <Divider mb={8} />

            {/* Section heading */}
            <HStack spacing={3} mb={6} align="baseline">
                <Heading as="h2" size="md">
                    Customer Reviews
                </Heading>
                {reviews.length > 0 && (
                    <Badge
                        bgGradient="linear(to-r, cyan.400, blue.500)"
                        color="white"
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                    >
                        {reviews.length}
                    </Badge>
                )}
            </HStack>

            {/* Rating summary bar (only when there are reviews) */}
            {!loading && reviews.length > 0 && <RatingSummary reviews={reviews} />}

            {/* Two-column layout: review list + form */}
            <Flex
                align="flex-start"
                gap={10}
                flexDir={{ base: 'column', lg: 'row' }}
            >
                {/* Review list */}
                <Box flex={1} w="full">
                    {loading ? (
                        <Text color={textColor} fontSize="sm">
                            Loading reviews...
                        </Text>
                    ) : reviews.length === 0 ? (
                        <VStack spacing={4} py={12} w="full">
                            <Image
                                src="/no-reviews.svg"
                                alt="No reviews"
                                width={{ base: "180px", md: "240px", lg: "300px" }}
                                objectFit="contain"
                            />

                            <Text fontSize="xl" fontWeight="bold">
                                No reviews yet
                            </Text>

                            <Text color={textColor} textAlign="center">
                                Be the first to share your thoughts on this product!
                            </Text>
                        </VStack>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            {reviews.map((r) => (
                                <ReviewCard key={r._id} review={r} />
                            ))}
                        </VStack>
                    )}
                </Box>

                {/* Submit form */}
                <Box w={{ base: 'full', lg: '380px' }} flexShrink={0}>
                    <ReviewForm productId={productId} onReviewAdded={fetchReviews} />
                </Box>
            </Flex>
        </Box>
    );
};

export default ProductReviews;
