import { describe, it, expect, beforeEach, vi } from "vitest";
import { useProductStore } from "./product";

const makeProduct = (id) => ({ _id: id, name: `P${id}`, price: 1 });

const mockPage = (page, items, totalPages = 3, totalProducts = 30) => ({
  ok: true,
  json: async () => ({
    success: true,
    data: items,
    currentPage: page,
    totalPages,
    totalProducts,
    limit: 10,
  }),
});

describe("useProductStore.fetchProducts — infinite scroll", () => {
  beforeEach(() => {
    useProductStore.setState({
      products: [],
      productCache: {},
      catalogKey: null,
      catalogPage: 1,
      catalogTotalPages: 1,
      catalogTotalProducts: 0,
      isLoading: false,
    });
    vi.unstubAllGlobals();
  });

  it("replaces the list and records catalog state on a fresh fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockPage(1, [makeProduct("a"), makeProduct("b")])));

    const res = await useProductStore.getState().fetchProducts({ page: 1, listKey: "k1" });

    expect(res.success).toBe(true);
    const s = useProductStore.getState();
    expect(s.products.map((p) => p._id)).toEqual(["a", "b"]);
    expect(s.catalogKey).toBe("k1");
    expect(s.catalogPage).toBe(1);
    expect(s.catalogTotalPages).toBe(3);
    expect(s.catalogTotalProducts).toBe(30);
  });

  it("appends the next page without duplicating existing items", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockPage(1, [makeProduct("a"), makeProduct("b")])));
    await useProductStore.getState().fetchProducts({ page: 1, listKey: "k1" });

    // Page 2 deliberately re-includes "b" to prove de-duplication.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockPage(2, [makeProduct("b"), makeProduct("c")])));
    await useProductStore.getState().fetchProducts({ page: 2, append: true, listKey: "k1" });

    const s = useProductStore.getState();
    expect(s.products.map((p) => p._id)).toEqual(["a", "b", "c"]);
    expect(s.catalogPage).toBe(2);
  });

  it("does not raise the global loading flag while appending", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockPage(1, [makeProduct("a")])));
    await useProductStore.getState().fetchProducts({ page: 1, listKey: "k1" });

    let loadingDuringAppend = false;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => {
      loadingDuringAppend = useProductStore.getState().isLoading;
      return mockPage(2, [makeProduct("b")]);
    }));
    await useProductStore.getState().fetchProducts({ page: 2, append: true, listKey: "k1" });

    expect(loadingDuringAppend).toBe(false);
  });
});
