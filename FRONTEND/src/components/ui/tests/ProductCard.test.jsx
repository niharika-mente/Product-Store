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
  }),
}));

vi.mock('../../../store/cart', () => ({
  useCart: () => ({
    addToCart: vi.fn(),
  }),
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