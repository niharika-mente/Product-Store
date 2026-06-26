import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from '../ProductCard';

vi.mock('react-router-dom', () => ({
  Link: ({ children }) => <a>{children}</a>,
}));

vi.mock('../../../store/product', () => ({
  useProductStore: () => ({
    deleteProduct: vi.fn(),
    updateProduct: vi.fn(),
    restockProduct: vi.fn(),
    addToCompare: vi.fn(),
    compareList: [],
    isSubmitting: false,
    isDeleting: false,
  }),
}));

vi.mock('../../../context/WishlistContext.jsx', () => ({
  useWishlist: () => ({
    addToWishlist: vi.fn().mockResolvedValue({ success: true }),
    removeFromWishlist: vi.fn().mockResolvedValue({ success: true }),
    checkInWishlist: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock('../../../store/cart', () => ({
  useCartStore: () => ({
    addToCart: vi.fn(() => ({ status: 'success' })),
  }),
}));

vi.mock('../../../store/currency', () => ({
  useCurrencyStore: () => ({
    currency: 'USD',
    rates: {},
  }),
}));

vi.mock('../../../utils/currency', () => ({
  formatPrice: vi.fn(() => '$99'),
}));

vi.mock('../QuickViewModal', () => ({
  default: () => null,
}));

vi.mock('../../../utils/toastHelpers', () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
  showInfoToast: vi.fn(),
  showWarningToast: vi.fn(),
}));

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
  };
});

const mockProduct = {
  _id: '123',
  name: 'Test Product',
  price: 99,
  image: 'test.jpg',
  stock: 10,
};

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('renders Add to Cart button', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });
});