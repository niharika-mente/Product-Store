import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import Navbar from "../Navbar";
import { useCartStore } from "../../../store/cart";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/" }),
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'cart.title': 'Shopping Cart',
        'cart.empty': 'Your cart is empty',
        'cart.total': 'Total Amount',
        'common.search': 'Search',
        'nav.addProduct': 'Add Product',
        'cart.openCart': 'Open shopping cart',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock Zustand store for cart
vi.mock("../../../store/cart", () => ({
  useCartStore: vi.fn(),
}));

// Mock Zustand store for products
vi.mock("../../../store/product", () => ({
  useProductStore: () => ({
    searchQuery: "",
    setSearchQuery: vi.fn(),
    products: [],
    fetchProducts: vi.fn(),
    compareList: [],
  }),
}));

// Mock WishlistContext
vi.mock("../../../context/WishlistContext.jsx", () => ({
  useWishlist: () => ({
    wishlistCount: 0,
    clearWishlist: vi.fn(),
  }),
}));

// Mock currency store
vi.mock("../../../store/currency", () => ({
  useCurrencyStore: () => ({
    currency: "USD",
    rates: { USD: 1, EUR: 0.85, INR: 75 },
    setCurrency: vi.fn(),
  }),
}));

// Mock AuthContext
vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    isLoggedIn: false,
    logout: vi.fn(),
    user: null,
  }),
}));

describe("Navbar - Cart Drawer Empty State", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNavbar = () => {
    return render(
      <ChakraProvider>
        <Navbar />
      </ChakraProvider>
    );
  };

  it("renders the premium empty cart illustration when cart is empty", async () => {
    const user = userEvent.setup();
    // Mock empty cart
    vi.mocked(useCartStore).mockReturnValue({
      cart: { items: [] },
      removeFromCart: vi.fn(),
      emptyCart: vi.fn(),
    });

    renderNavbar();

    // Click the open cart button to open the Drawer
    const cartButton = screen.getByRole("button", { name: /open shopping cart/i });
    await user.click(cartButton);

    // Verify illustration is rendered
    const illustration = screen.getByTestId("empty-cart-illustration");
    expect(illustration).toBeInTheDocument();
  });

  it("renders the empty heading and subtext correctly inside the drawer", async () => {
    const user = userEvent.setup();
    // Mock empty cart
    vi.mocked(useCartStore).mockReturnValue({
      cart: { items: [] },
      removeFromCart: vi.fn(),
      emptyCart: vi.fn(),
    });

    renderNavbar();

    // Open drawer
    const cartButton = screen.getByRole("button", { name: /open shopping cart/i });
    await user.click(cartButton);

    // Check heading
    const heading = screen.getByText("Your cart is empty");
    expect(heading).toBeInTheDocument();

    // Check subtext
    const subtext = screen.getByText("Looks like you haven't added anything yet");
    expect(subtext).toBeInTheDocument();
  });

  it("does not render empty state elements and renders cart items when cart has items", async () => {
    const user = userEvent.setup();
    const mockItems = [
      {
        _id: "prod-1",
        productId: "prod-1",
        name: "Premium Keyboard",
        price: 150,
        quantity: 1,
      },
    ];

    // Mock cart with items
    vi.mocked(useCartStore).mockReturnValue({
      cart: { items: mockItems },
      removeFromCart: vi.fn(),
      emptyCart: vi.fn(),
    });

    renderNavbar();

    // Open drawer
    const cartButton = screen.getByRole("button", { name: /open shopping cart/i });
    await user.click(cartButton);

    // Empty illustration and text should NOT be present
    expect(screen.queryByTestId("empty-cart-illustration")).not.toBeInTheDocument();
    expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
    expect(screen.queryByText("Looks like you haven't added anything yet")).not.toBeInTheDocument();

    // Cart items should render
    expect(screen.getByText("Premium Keyboard")).toBeInTheDocument();
    expect(screen.getByText(/1 × \$150/)).toBeInTheDocument();
  });
});

describe("Navbar - Visibility of standard elements", () => {
  beforeEach(() => {
    vi.mocked(useCartStore).mockReturnValue({
      cart: { items: [] },
      removeFromCart: vi.fn(),
      emptyCart: vi.fn(),
    });
  });

  it("renders the logo and links to home page", () => {
    render(
      <ChakraProvider>
        <Navbar />
      </ChakraProvider>
    );

    const logo = screen.getByText("Product Store 🛒");
    expect(logo).toBeInTheDocument();
    expect(logo.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders search bar and other action buttons", () => {
    render(
      <ChakraProvider>
        <Navbar />
      </ChakraProvider>
    );

    // Verify search input
    const searchInput = screen.getByPlaceholderText("Search");
    expect(searchInput).toBeInTheDocument();

    // Verify buttons are there
    expect(screen.getByLabelText("Add Product")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open shopping cart/i })).toBeInTheDocument();
  });
});
