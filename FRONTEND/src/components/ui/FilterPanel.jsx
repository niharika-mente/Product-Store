import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Input,
  Select,
  Checkbox,
  Button,
  useColorModeValue,
  Divider,
  HStack,
  Badge,
  Wrap,
  WrapItem,
  Skeleton
} from '@chakra-ui/react';
import { useProductStore } from '../../store/product';

const FilterPanel = ({ filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const { fetchTags } = useProductStore();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tagActiveBg = useColorModeValue('purple.500', 'purple.400');
  const tagInactiveBg = useColorModeValue('gray.100', 'gray.700');
  const tagActiveColor = 'white';
  const tagInactiveColor = useColorModeValue('gray.700', 'gray.200');

  useEffect(() => {
    const loadTags = async () => {
      setTagsLoading(true);
      const result = await fetchTags();
      if (result.success) setAvailableTags(result.data);
      setTagsLoading(false);
    };
    loadTags();
  }, [fetchTags]);

  const handleApply = () => {
    setFilters(localFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      minPrice: 0,
      maxPrice: 5000,
      brand: '',
      minRating: 0,
      inStock: false,
      tags: []
    };
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const toggleTag = (tag) => {
    const current = localFilters.tags || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    setLocalFilters({ ...localFilters, tags: updated });
  };

  return (
    <Box
      p={5}
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      shadow="sm"
      w="full"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Filters
      </Text>
      <Divider mb={4} />

      <VStack spacing={6} align="stretch">
        {/* Price Range Filter */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="medium" fontSize="sm">Price Range</Text>
            <Text fontSize="xs" color="gray.500">
              ${localFilters.minPrice} - ${localFilters.maxPrice}
            </Text>
          </HStack>
          <RangeSlider
            min={0}
            max={5000}
            step={10}
            value={[localFilters.minPrice, localFilters.maxPrice]}
            onChange={(val) =>
              setLocalFilters({ ...localFilters, minPrice: val[0], maxPrice: val[1] })
            }
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack bg="blue.500" />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
        </Box>

        {/* Brand Filter */}
        <Box>
          <Text fontWeight="medium" fontSize="sm" mb={2}>Brand</Text>
          <Input
            placeholder="e.g. Apple, Samsung"
            size="sm"
            value={localFilters.brand}
            onChange={(e) => setLocalFilters({ ...localFilters, brand: e.target.value })}
          />
        </Box>

        {/* Rating Filter */}
        <Box>
          <Text fontWeight="medium" fontSize="sm" mb={2}>Minimum Rating</Text>
          <Select
            size="sm"
            value={localFilters.minRating}
            onChange={(e) => setLocalFilters({ ...localFilters, minRating: Number(e.target.value) })}
          >
            <option value={0}>Any Rating</option>
            <option value={1}>1+ Stars</option>
            <option value={2}>2+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={5}>5 Stars</option>
          </Select>
        </Box>

        {/* Availability Filter */}
        <Box>
          <Checkbox
            colorScheme="blue"
            isChecked={localFilters.inStock}
            onChange={(e) => setLocalFilters({ ...localFilters, inStock: e.target.checked })}
          >
            <Text fontSize="sm">In Stock Only</Text>
          </Checkbox>
        </Box>

        {/* Tags Filter */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="medium" fontSize="sm">Tags</Text>
            {(localFilters.tags || []).length > 0 && (
              <Text
                fontSize="xs"
                color="purple.500"
                cursor="pointer"
                onClick={() => setLocalFilters({ ...localFilters, tags: [] })}
              >
                Clear tags
              </Text>
            )}
          </HStack>
          {tagsLoading ? (
            <VStack align="stretch" spacing={2}>
              <Skeleton height="24px" borderRadius="full" />
              <Skeleton height="24px" borderRadius="full" />
            </VStack>
          ) : availableTags.length === 0 ? (
            <Text fontSize="xs" color="gray.400">No tags available</Text>
          ) : (
            <Wrap spacing={2}>
              {availableTags.map(tag => {
                const isSelected = (localFilters.tags || []).includes(tag);
                return (
                  <WrapItem key={tag}>
                    <Badge
                      px={2}
                      py={1}
                      borderRadius="full"
                      cursor="pointer"
                      bg={isSelected ? tagActiveBg : tagInactiveBg}
                      color={isSelected ? tagActiveColor : tagInactiveColor}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      onClick={() => toggleTag(tag)}
                      transition="all 0.15s"
                      _hover={{ opacity: 0.8 }}
                      fontSize="xs"
                    >
                      {tag}
                    </Badge>
                  </WrapItem>
                );
              })}
            </Wrap>
          )}
        </Box>

        <Divider />

        <VStack spacing={3}>
          <Button colorScheme="blue" w="full" onClick={handleApply}>
            Apply Filters
          </Button>
          <Button variant="outline" w="full" onClick={handleReset}>
            Reset
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default FilterPanel;