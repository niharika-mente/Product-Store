import React, { useEffect, useState, useCallback } from 'react';
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
import Pagination from './Pagination';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const StarRating = ({ value, onChange, readonly = false, size = 'md' }) => {
    const [hovered, setHovered] = useState(0);
    const filledColor = useColorModeValue('yellow.400', 'yellow.300');
    const emptyColor = useColorModeValue('gray.300', 'gray.600');
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

const RatingSummary = ({ reviews, filterStar, onFilterChange, distribution, averageRating, totalReviews }) => {
    const labelColor = useColorModeValue('gray.600', 'gray.400');
    const barBg = useColorModeValue('gray.100', 'gray.700');
    const barFill = useColorModeValue('yellow.400', 'yellow.300');
    const cardBg = useColorModeValue('gray.50', 'gray.700');
    const borderCol = useColorModeValue('gray.200', 'gray.600');
    const activeRowBg = useColorModeValue('yellow.50', 'yellow.900');
    const hoverRowBg = useColorModeValue('gray.50', 'gray.600');

    const totalCount = totalReviews ?? reviews.length;
    if (totalCount === 0) return null;

    const rounded = averageRating ?? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10;

    const dist = distribution
        ? [5, 4, 3, 2, 1].map((star) => ({ star, count: distribution[star] ?? 0 }))
        : [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));

    return (
        <Box p={5} bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor={borderCol} mb={6}>
            <Flex gap={8} align="center" flexDir={{ base: 'column', sm: 'row' }}>
                <VStack spacing={1} minW="100px" align="center">
                    <Text fontSize="5xl" fontWeight="extrabold" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text" lineHeight={1}>
                        {rounded}
                    </Text>
                    <StarRating value={Math.round(rounded)} readonly size="sm" />
                    <Text fontSize="xs" color={labelColor}>
                        {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
                    </Text>
                </VStack>
                <VStack spacing={1} flex={1} w="full" align="stretch">
                    {dist.map(({ star, count }) => {
                        const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
                        const isActive = filterStar === star;
                        return (
                            <HStack
                                key={star} spacing={2}
                                as="button" type="button" onClick={() => onFilterChange(star)}
                                borderRadius="md" px={1}
                                bg={isActive ? activeRowBg : 'transparent'}
                                border="1px solid"
                                borderColor={isActive ? 'yellow.400' : 'transparent'}
                                transition="all 0.2s"
                                _hover={{ bg: hoverRowBg, cursor: 'pointer' }}
                                w="full"
                            >
                                <Text fontSize="xs" color={labelColor} minW="14px" textAlign="right">{star}★</Text>
                                <Box flex={1} bg={barBg} borderRadius="full" h="8px" overflow="hidden">
                                    <Box w={`${pct}%`} h="full" bg={isActive ? 'yellow.500' : barFill} borderRadius="full" transition="width 0.5s ease" />
                                </Box>
                                <Text fontSize="xs" color={labelColor} w="24px" textAlign="right">{count}</Text>
                            </HStack>
                        );
                    })}
                </VStack>
            </Flex>
        </Box>
    );
};

const ReviewCard = ({ review, onReviewUpdated }) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderCol = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const nameColor = useColorModeValue('gray.800', 'white');
    const [isEditing, setIsEditing] = useState(false);
    const [editRating, setEditRating] = useState(review.rating);
    const [editComment, setEditComment] = useState(review.comment);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const handleEdit = () => {
        setEditRating(review.rating);
        setEditComment(review.comment);
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/api/products/${review.product}/reviews/${review._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
                body: JSON.stringify({ rating: editRating, comment: editComment }),
            });
            const data = await res.json();
            if (!data.success) {
                // ✅ FIXED: added id
                toast({ id: 'review-update-error', title: 'Error', description: data.message, status: 'error', duration: 3000, isClosable: true });
            } else {
                // ✅ FIXED: added id
                toast({ id: 'review-update-success', title: 'Review updated!', status: 'success', duration: 2000, isClosable: true });
                setIsEditing(false);
                onReviewUpdated();
            }
        } catch {
            // ✅ FIXED: added id
            toast({ id: 'review-update-network-error', title: 'Network error', status: 'error', duration: 3000, isClosable: true });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/api/products/${review.product}/reviews/${review._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            });
            const data = await res.json();
            if (!data.success) {
                // ✅ FIXED: added id
                toast({ id: 'review-delete-error', title: 'Error', description: data.message, status: 'error', duration: 3000, isClosable: true });
            } else {
                // ✅ FIXED: added id
                toast({ id: 'review-delete-success', title: 'Review deleted', status: 'info', duration: 2000, isClosable: true });
                onReviewUpdated();
            }
        } catch {
            // ✅ FIXED: added id
            toast({ id: 'review-delete-network-error', title: 'Network error', status: 'error', duration: 3000, isClosable: true });
        } finally {
            setSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    const avatarColors = ['blue', 'cyan', 'teal', 'purple', 'pink'];
    const colorIndex = review.userName.charCodeAt(0) % avatarColors.length;
    const avatarScheme = avatarColors[colorIndex];
    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    return (
        <Box p={5} bg={bg} borderRadius="xl" borderWidth="1px" borderColor={borderCol} transition="all 0.2s" _hover={{ boxShadow: 'md', borderColor: 'blue.200' }}>
            <Flex justify="space-between" align="flex-start" mb={3} gap={3} flexWrap="wrap">
                <HStack spacing={3}>
                    <Avatar name={review.userName} size="sm" colorScheme={avatarScheme} bgGradient={`linear(to-br, ${avatarScheme}.400, ${avatarScheme}.600)`} color="white" />
                    <Box>
                        <Text fontWeight="bold" fontSize="sm" color={nameColor}>{review.userName}</Text>
                        <Text fontSize="xs" color={textColor}>{formattedDate}</Text>
                    </Box>
                </HStack>
                <HStack spacing={2}>
                    <StarRating value={review.rating} readonly size="sm" />
                    <Badge colorScheme={review.rating >= 4 ? 'green' : review.rating === 3 ? 'yellow' : 'red'} variant="subtle" fontSize="xs" px={2} borderRadius="full">
                        {ratingLabels[review.rating]}
                    </Badge>
                </HStack>
            </Flex>

            {!isEditing && !showDeleteConfirm && (
                <>
                    <Text fontSize="sm" color={textColor} lineHeight="tall" mb={3}>{review.comment}</Text>
                    <HStack justify="flex-end" spacing={2}>
                        <Button size="xs" variant="outline" colorScheme="blue" onClick={handleEdit}>Edit</Button>
                        <Button size="xs" variant="outline" colorScheme="red" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
                    </HStack>
                </>
            )}

            {isEditing && (
                <VStack spacing={3} mt={3} align="stretch">
                    <StarRating value={editRating} onChange={setEditRating} size="sm" />
                    <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} resize="vertical" maxLength={500} size="sm" focusBorderColor="blue.400" />
                    <HStack justify="flex-end">
                        <Button size="xs" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button size="xs" colorScheme="blue" onClick={handleUpdate} isLoading={submitting}>Save</Button>
                    </HStack>
                </VStack>
            )}

            {showDeleteConfirm && (
                <VStack spacing={3} mt={3} align="stretch">
                    <Text fontSize="sm" color="red.400" fontWeight="semibold">Are you sure you want to delete this review?</Text>
                    <HStack justify="flex-end">
                        <Button size="xs" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                        <Button size="xs" colorScheme="red" onClick={handleDelete} isLoading={submitting}>Confirm Delete</Button>
                    </HStack>
                </VStack>
            )}
        </Box>
    );
};

const ReviewForm = ({ productId, onReviewAdded }) => {
    const [form, setForm] = useState({ rating: 0, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const bg = useColorModeValue('white', 'gray.800');
    const borderCol = useColorModeValue('gray.200', 'gray.700');
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const subLabelColor = useColorModeValue('gray.500', 'gray.400');
    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const toast = useToast();

    const handleSubmit = async () => {
        if (form.rating === 0) {
            // ✅ FIXED: added id
            return toast({
                id: 'review-rating-required',
                title: 'Rating required',
                description: 'Please select a star rating.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
        }
        if (!form.comment.trim()) {
            // ✅ FIXED: added id
            return toast({
                id: 'review-comment-required',
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
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);

            const data = await res.json();

            if (!data.success) {
                // ✅ FIXED: added id
                toast({
                    id: 'review-submit-error',
                    title: 'Could not submit review',
                    description: data.message,
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                    position: 'top-right',
                });
            } else {
                // ✅ FIXED: added id
                toast({
                    id: 'review-submit-success',
                    title: 'Review submitted!',
                    description: 'Thanks for sharing your feedback.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
                setForm({ rating: 0, comment: '' });
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
            // ✅ FIXED: added id
            toast({
                id: 'review-submit-catch-error',
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
        <Box p={6} bg={bg} borderWidth="1px" borderColor={borderCol} borderRadius="xl" boxShadow="sm" position={{ lg: 'sticky' }} top={{ lg: '100px' }}>
            <HStack spacing={2} mb={5}>
                <Box p={2} bgGradient="linear(to-br, cyan.400, blue.500)" borderRadius="lg" color="white" fontSize="sm">
                    <FaPen />
                </Box>
                <Heading as="h3" size="md">Write a Review</Heading>
            </HStack>

            <VStack spacing={4} align="stretch">
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>Your Rating</Text>
                    <StarRating value={form.rating} onChange={(val) => setForm({ ...form, rating: val })} size="lg" />
                    <Text fontSize="xs" color={subLabelColor} mt={1} minH="16px">
                        {form.rating > 0 ? ratingLabels[form.rating] : 'Click to rate'}
                    </Text>
                </Box>
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>Your Review</Text>
                    <Textarea
                        placeholder="What did you like or dislike about this product?"
                        value={form.comment}
                        onChange={(e) => setForm({ ...form, comment: e.target.value })}
                        rows={4} resize="vertical" maxLength={500} focusBorderColor="blue.400"
                    />
                    <Text fontSize="xs" color={subLabelColor} textAlign="right" mt={1}>{form.comment.length} / 500</Text>
                </Box>
                <Button
                    bgGradient="linear(to-r, cyan.400, blue.500)" color="white"
                    _hover={{ bgGradient: 'linear(to-r, cyan.500, blue.600)', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s"
                    onClick={handleSubmit} isLoading={submitting} loadingText="Submitting..." w="full" size="lg"
                >
                    Submit Review
                </Button>
            </VStack>
        </Box>
    );
};

const LIMIT = 5;

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [distribution, setDistribution] = useState(null);
    const [filterStar, setFilterStar] = useState(null);
    const [sortOrder, setSortOrder] = useState('newest');
    const textColor = useColorModeValue('gray.500', 'gray.400');

    useEffect(() => {
        setFilterStar(null);
        setSortOrder('newest');
        setPage(1);
    }, [productId]);

    const buildQuery = useCallback(() => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(LIMIT));
        params.set('sort', sortOrder);
        if (filterStar) params.set('star', String(filterStar));
        return params.toString();
    }, [page, sortOrder, filterStar]);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/products/${productId}/reviews?${buildQuery()}`);
            if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.data);
                setTotalPages(data.totalPages);
                setTotalReviews(data.totalReviews);
                setAverageRating(data.averageRating);
                setDistribution(data.distribution);
            }
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setLoading(false);
        }
    }, [productId, buildQuery]);

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId, fetchReviews]);

    const handleFilterChange = (star) => {
        setFilterStar((prev) => (prev === star ? null : star));
        setPage(1);
    };

    const handleSortChange = (order) => {
        if (order !== sortOrder) {
            setSortOrder(order);
            setPage(1);
        }
    };

    return (
        <Box mt={16}>
            <Divider mb={8} />
            <HStack spacing={3} mb={6} align="baseline">
                <Heading as="h2" size="md">Customer Reviews</Heading>
                {totalReviews > 0 && (
                    <Badge bgGradient="linear(to-r, cyan.400, blue.500)" color="white" fontSize="sm" px={3} py={1} borderRadius="full">
                        {totalReviews}
                    </Badge>
                )}
            </HStack>

            {!loading && totalReviews > 0 && (
                <RatingSummary
                    reviews={reviews} filterStar={filterStar} onFilterChange={handleFilterChange}
                    distribution={distribution} averageRating={averageRating} totalReviews={totalReviews}
                />
            )}

            <Flex align="flex-start" gap={10} flexDir={{ base: 'column', lg: 'row' }}>
                <Box flex={1} w="full">
                    {loading ? (
                        <Text color={textColor} fontSize="sm">Loading reviews...</Text>
                    ) : totalReviews === 0 ? (
                        <VStack spacing={4} py={12} w="full">
                            <Image src="/no-reviews.svg" alt="No reviews" width={{ base: "180px", md: "240px", lg: "300px" }} objectFit="contain" />
                            <Text fontSize="xl" fontWeight="bold">No reviews yet</Text>
                            <Text color={textColor} textAlign="center">Be the first to share your thoughts on this product!</Text>
                        </VStack>
                    ) : (
                        <VStack spacing={4} align="stretch">
                            <HStack mb={2} justify="flex-end">
                                <Button size="xs" variant={sortOrder === 'newest' ? 'solid' : 'outline'} colorScheme="blue" onClick={() => handleSortChange('newest')}>Newest</Button>
                                <Button size="xs" variant={sortOrder === 'highest' ? 'solid' : 'outline'} colorScheme="blue" onClick={() => handleSortChange('highest')}>Highest Rated</Button>
                                <Button size="xs" variant={sortOrder === 'lowest' ? 'solid' : 'outline'} colorScheme="blue" onClick={() => handleSortChange('lowest')}>Lowest Rated</Button>
                            </HStack>
                            {filterStar && (
                                <HStack>
                                    <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                                        Showing {filterStar}★ reviews ({totalReviews})
                                    </Badge>
                                    <Button size="xs" variant="ghost" onClick={() => { setFilterStar(null); setPage(1); }}>Clear filter</Button>
                                </HStack>
                            )}
                            {reviews.map((r) => (
                                <ReviewCard key={r._id} review={r} onReviewUpdated={fetchReviews} />
                            ))}
                            {totalPages > 1 && (
                                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                            )}
                        </VStack>
                    )}
                </Box>
                <Box w={{ base: 'full', lg: '380px' }} flexShrink={0}>
                    <ReviewForm productId={productId} onReviewAdded={fetchReviews} />
                </Box>
            </Flex>
        </Box>
    );
};

export default ProductReviews;