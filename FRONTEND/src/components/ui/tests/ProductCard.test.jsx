import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ProductCard from "../ProductCard";

vi.mock("react-router-dom", () => ({
  Link: ({ children }) => <a>{children}</a>,
}));

vi.mock("../../../store/product", () => ({
  useProductStore: () => ({
    deleteProduct: vi.fn(),
    updateProduct: vi.fn(),
    addToCompare: vi.fn(),
    compareList: [],
    isSubmitting: false,
    isDeleting: false,
    restockProduct: vi.fn(),
  }),
}));

vi.mock("../../../context/WishlistContext.jsx", () => ({
  useWishlist: () => ({
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
    checkInWishlist: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock("../../../store/cart", () => ({
  useCartStore: () => ({
    addToCart: vi.fn(),
  }),
}));

vi.mock("../QuickAddModal", () => ({
  default: ({ isOpen }) =>
    isOpen ? <div>Quick Add Modal</div> : null,
}));

vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => vi.fn(),
  };
});

const mockProduct = {
  _id: "123",
  name: "Test Product",
  price: 99,
  image: "test.jpg",
  stock: 10,
  tags: [],
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders product price", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/\$99(\.00)?/)).toBeInTheDocument();
  });

  it("renders Add to Cart button", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  it("renders Quick Add button", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Quick Add")).toBeInTheDocument();
  });

  it("opens Quick Add modal", async () => {
    const user = userEvent.setup();

    render(<ProductCard product={mockProduct} />);

    await user.click(screen.getByText("Quick Add"));

    expect(screen.getByText("Quick Add Modal")).toBeInTheDocument();
  });

    it("disables Add to Cart button when product is out of stock", () => {
      render(
        <ProductCard
          product={{
            ...mockProduct,
            stock: 0,
          }}
        />
      );

      const addToCartButton = screen.getByRole("button", {
        name: `Add ${mockProduct.name} to cart`,
      });

      expect(addToCartButton).toBeDisabled();
      expect(addToCartButton).toHaveTextContent("Out of Stock");
    });
  });
