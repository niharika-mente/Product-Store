import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import AdminDashboardPage from "./AdminDashboardPage";

vi.mock("../store/product", () => ({
  useProductStore: vi.fn(),
}));

import { useProductStore } from "../store/product";

const makeProducts = (n) =>
  Array.from({ length: n }, (_, i) => ({
    _id: String(i),
    name: `Product ${i}`,
    price: 10,
    stock: 5,
  }));

const renderPage = () =>
  render(
    <ChakraProvider>
      <AdminDashboardPage />
    </ChakraProvider>
  );

describe("AdminDashboardPage virtualization", () => {
  it("renders a normal table for small lists", () => {
    useProductStore.mockReturnValue({
      products: makeProducts(5),
      fetchProducts: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
    });
    renderPage();
    expect(screen.getByText("Product 0")).toBeInTheDocument();
    expect(screen.queryByTestId("virtualized-product-list")).not.toBeInTheDocument();
  });

  it("renders the virtualized list for large lists", () => {
    useProductStore.mockReturnValue({
      products: makeProducts(120),
      fetchProducts: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
    });
    renderPage();
    expect(screen.getByTestId("virtualized-product-list")).toBeInTheDocument();
  });
});