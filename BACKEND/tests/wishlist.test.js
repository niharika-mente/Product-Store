import { jest } from "@jest/globals";

const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockFindById = jest.fn();

jest.unstable_mockModule("../models/Wishlist.model.js", () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

jest.unstable_mockModule("../models/product.model.js", () => ({
  default: {
    findById: mockFindById,
  },
}));

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = await import("../controllers/WishlistController.controller.js");

describe("Wishlist Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("getWishlist", () => {
    it("returns empty products when wishlist does not exist", async () => {
        mockFindOne.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
        });

        await getWishlist(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ products: [] });
    });

    it("returns wishlist when found", async () => {
      const wishlist = {
        products: [{ _id: "p1" }],
      };

      mockFindOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(wishlist),
      });

      await getWishlist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(wishlist);
    });
  });

  describe("addToWishlist", () => {
    it("returns 404 when product does not exist", async () => {
      req.body.productId = "bad-id";

      mockFindById.mockResolvedValue(null);

      await addToWishlist(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("creates wishlist if none exists", async () => {
      req.body.productId = "p1";

      mockFindById.mockResolvedValue({ _id: "p1" });
      mockFindOne.mockResolvedValue(null);

      const wishlist = {
        products: ["p1"],
        populate: jest.fn().mockResolvedValue(),
      };

      mockCreate.mockResolvedValue(wishlist);

      await addToWishlist(req, res, next);

      expect(mockCreate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("adds product to existing wishlist", async () => {
      req.body.productId = "p2";

      mockFindById.mockResolvedValue({ _id: "p2" });

      const wishlist = {
        products: [],
        save: jest.fn().mockResolvedValue(),
        populate: jest.fn().mockResolvedValue(),
      };

      mockFindOne.mockResolvedValue(wishlist);

      await addToWishlist(req, res, next);

      expect(wishlist.products).toContain("p2");
      expect(wishlist.save).toHaveBeenCalled();
    });

    it("does not duplicate existing product", async () => {
      req.body.productId = "p1";

      mockFindById.mockResolvedValue({ _id: "p1" });

      const wishlist = {
        products: ["p1"],
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue(),
      };

      mockFindOne.mockResolvedValue(wishlist);

      await addToWishlist(req, res, next);

      expect(wishlist.save).not.toHaveBeenCalled();
    });
  });

  describe("removeFromWishlist", () => {
    it("returns 404 when wishlist does not exist", async () => {
      req.params.productId = "p1";

      mockFindOne.mockResolvedValue(null);

      await removeFromWishlist(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("removes product successfully", async () => {
      req.params.productId = "p1";

      const wishlist = {
        products: [
          { toString: () => "p1" },
          { toString: () => "p2" },
        ],
        save: jest.fn().mockResolvedValue(),
        populate: jest.fn().mockResolvedValue(),
      };

      mockFindOne.mockResolvedValue(wishlist);

      await removeFromWishlist(req, res, next);

      expect(wishlist.products).toHaveLength(1);
      expect(wishlist.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});