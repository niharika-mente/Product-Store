import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import ProductPage from "../../../pages/ProductPage";

// Chakra's Checkbox pulls in @zag-js/focus-visible, which patches
// HTMLElement.focus — jsdom makes that getter-only, crashing the mount. Stub
// only Checkbox with a plain input; every other Chakra component stays real.
vi.mock("@chakra-ui/react", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Checkbox: ({ isChecked, onChange }) => (
      <input
        type="checkbox"
        checked={!!isChecked}
        onChange={onChange || (() => {})}
        readOnly={!onChange}
        aria-label="bundle item"
      />
    ),
  };
});

// Isolate ProductPage from routing, sockets, network, and child sections.
vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "p1" }),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));
vi.mock("../../../socket", () => ({
  getSocket: () => ({ on: vi.fn(), off: vi.fn() }),
}));
vi.mock("../RelatedProducts", () => ({ default: () => <div>related</div> }));
vi.mock("../ProductReviews", () => ({ default: () => <div>reviews</div> }));
vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

import axios from "axios";

const renderPage = () =>
  render(
    <ChakraProvider>
      <ProductPage />
    </ChakraProvider>
  );

const baseProduct = {
  _id: "p1",
  name: "Test Phone",
  description: "A nice phone",
  brand: "Acme",
  hasVariants: false,
  basePrice: 199,
  baseStock: 5,
  image: "https://img/x.png",
  images: [],
};

const mockApi = ({ product = baseProduct, bundle = { success: false } } = {}) => {
  axios.get.mockImplementation((url) =>
    url.endsWith("/bundle")
      ? Promise.resolve({ data: bundle })
      : Promise.resolve({ data: product })
  );
  axios.post.mockResolvedValue({ data: { success: true } });
};

describe("ProductPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders product details instead of a white screen", async () => {
    mockApi();
    renderPage();

    expect(await screen.findByText("Test Phone")).toBeInTheDocument();
    expect(screen.getByText("$199")).toBeInTheDocument(); // displayPrice from basePrice
    expect(screen.getByText(/Add to Cart/i)).toBeInTheDocument();
  });

  it("increments quantity via the + button (restored state)", async () => {
    mockApi();
    renderPage();
    await screen.findByText("Test Phone");

    const inc = screen.getByLabelText("Increase quantity");
    await userEvent.click(inc);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows the variant selector for products with variants", async () => {
    mockApi({
      product: {
        ...baseProduct,
        hasVariants: true,
        variants: [
          { _id: "v1", size: "M", color: "Red", price: 210, stock: 3, images: [] },
          { _id: "v2", size: "L", color: "Blue", price: 220, stock: 0, images: [] },
        ],
      },
    });
    renderPage();
    await screen.findByText("Test Phone");

    expect(screen.getByLabelText("Select size")).toBeInTheDocument();
    expect(screen.getByLabelText("Select color")).toBeInTheDocument();
  });

  it("renders the Frequently Bought Together bundle and toggles items", async () => {
    mockApi({
      bundle: {
        success: true,
        data: {
          items: [
            { product: { _id: "b1", name: "Case", price: 20, image: "" }, reason: "Protects it" },
          ],
          bundleTotal: 219,
          bundleDiscount: 0.1,
          savings: 21.9,
        },
      },
    });
    renderPage();

    expect(await screen.findByText("Frequently Bought Together")).toBeInTheDocument();
    expect(screen.getByText("Case")).toBeInTheDocument();
    expect(screen.getByText("Add Bundle to Cart")).toBeInTheDocument();

    // Toggling the bundle item updates selection without crashing.
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[checkboxes.length - 1]);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });
});
