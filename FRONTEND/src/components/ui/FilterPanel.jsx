import React, { useState, useEffect } from 'react';
import {
  Box, VStack, Text, RangeSlider, RangeSliderTrack,
  RangeSliderFilledTrack, RangeSliderThumb, Select,
  Checkbox, Button, useColorModeValue, Divider,
  HStack, CheckboxGroup, Stack, Badge
} from '@chakra-ui/react';
import { useProductStore } from '../../store/product';

const FilterPanel = ({ filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const { fetchCategories, products } = useProductStore();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetchCategories();
      if (res.success) setCategories(res.data);
    };
    loadCategories();
  }, [fetchCategories]);

  // Extract unique brands dynamically from products
  useEffect(() => {
    const uniqueBrands = [...new Set(
      products.map(p => p.brand).filter(Boolean)
    )];
    setBrands(uniqueBrands);
  }, [products]);

  const handleApply = () => setFilters(localFilters);

  const handleReset = () => {
    const defaultFilters = {
      minPrice: 0,
      maxPrice: 5000,
      brand: '',
      minRating: 0,
      inStock: false,
      categories: []
    };
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const handleCategoryChange = (cat) => {
    const current = localFilters.categories || [];
    const updated = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    setLocalFilters({ ...localFilters, categories: updated });
  };

  const handleBrandChange = (brand) => {
    const current = localFilters.brand;
    // Toggle brand — if same clicked, deselect
    const updated = current === brand ? '' : brand;
    setLocalFilters({ ...localFilters, brand: updated });
  };

  const activeFilterCount = [
    (localFilters.categories || []).length > 0,
    localFilters.brand !== '',
    localFilters.minPrice > 0 || localFilters.maxPrice < 5000,
    localFilters.minRating > 0,
    localFilters.inStock
  ].filter(Boolean).length;

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
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="bold">Filters</Text>
        {activeFilterCount > 0 && (
          <Badge colorScheme="blue" borderRadius="full" px={2}>
            {activeFilterCount} active
          </Badge>
        )}
      </HStack>
      <Divider mb={4} />

      <VStack spacing={6} align="stretch">

        {/* Category Filter */}
        {categories.length > 0 && (
          <Box>
            <Text fontWeight="medium" fontSize="sm" mb={2}>Category</Text>
            <Stack spacing={2}>
              {categories.map(cat => (
                <Checkbox
                  key={cat}
                  colorScheme="blue"
                  isChecked={(localFilters.categories || []).includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                >
                  <Text fontSize="sm">{cat}</Text>
                </Checkbox>
              ))}
            </Stack>
          </Box>
        )}

        <Divider />

        {/* Brand Filter */}
        {brands.length > 0 && (
          <Box>
            <Text fontWeight="medium" fontSize="sm" mb={2}>Brand</Text>
            <Stack spacing={2}>
              {brands.map(brand => (
                <Checkbox
                  key={brand}
                  colorScheme="blue"
                  isChecked={localFilters.brand === brand}
                  onChange={() => handleBrandChange(brand)}
                >
                  <Text fontSize="sm">{brand}</Text>
                </Checkbox>
              ))}
            </Stack>
          </Box>
        )}

        <Divider />

        {/* Price Range */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="medium" fontSize="sm">Price Range</Text>
            <Text fontSize="xs" color="gray.500">
              ${localFilters.minPrice} - ${localFilters.maxPrice}
            </Text>
          </HStack>
          <RangeSlider
            min={0} max={5000} step={10}
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

        {/* Rating Filter */}
        <Box>
          <Text fontWeight="medium" fontSize="sm" mb={2}>Minimum Rating</Text>
          <Select
            size="sm"
            value={localFilters.minRating}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, minRating: Number(e.target.value) })
            }
          >
            <option value={0}>Any Rating</option>
            <option value={1}>1+ Stars</option>
            <option value={2}>2+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={5}>5 Stars</option>
          </Select>
        </Box>

        {/* In Stock */}
        <Box>
          <Checkbox
            colorScheme="blue"
            isChecked={localFilters.inStock}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, inStock: e.target.checked })
            }
          >
            <Text fontSize="sm">In Stock Only</Text>
          </Checkbox>
        </Box>

        <Divider />

        <VStack spacing={3}>
          <Button colorScheme="blue" w="full" onClick={handleApply}>
            Apply Filters
          </Button>
          <Button variant="outline" w="full" onClick={handleReset}>
            Clear Filters
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default FilterPanel;