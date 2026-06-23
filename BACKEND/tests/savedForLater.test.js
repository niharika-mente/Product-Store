import { jest } from '@jest/globals';

const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule('../models/savedForLater.model.js', () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

const { getSavedItems, addToSavedForLater, removeFromSavedForLater, syncSavedItems } = await import('../controllers/savedForLater.controller.js');

function mockResolvedDoc(overrides = {}) {
  return {
    _id: 'doc123',
    user: 'user123',
    products: [],
    ...overrides,
    populate: jest.fn().mockResolvedValue({ ...overrides, products: overrides.products || [] }),
    save: jest.fn().mockResolvedValue(),
  };
}

describe('Saved For Later Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: 'user123' }, body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getSavedItems', () => {
    it('should return empty products if no saved items doc exists', async () => {
      mockFindOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      mockCreate.mockResolvedValue(mockResolvedDoc({ products: [] }));
      await getSavedItems(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ products: [] }),
      });
    });

    it('should filter out null (deleted) products', async () => {
      mockFindOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(
          mockResolvedDoc({ products: [{ _id: 'p1', name: 'Valid' }, null] })
        ),
      });
      await getSavedItems(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          products: [{ _id: 'p1', name: 'Valid' }],
        }),
      });
    });
  });

  describe('addToSavedForLater', () => {
    it('should 400 if productId missing', async () => {
      await addToSavedForLater(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should create new doc if none exists', async () => {
      req.body.productId = 'p1';
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockResolvedDoc({ products: ['p1'] }));
      await addToSavedForLater(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });
    });

    it('should not duplicate', async () => {
      req.body.productId = 'p1';
      const doc = { products: ['p1'], save: jest.fn(), populate: jest.fn().mockResolvedValue({ products: ['p1'] }) };
      mockFindOne.mockResolvedValue(doc);
      await addToSavedForLater(req, res, next);
      expect(doc.products).toHaveLength(1);
    });
  });

  describe('removeFromSavedForLater', () => {
    it('should 400 if productId missing', async () => {
      await removeFromSavedForLater(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should 404 if no saved list', async () => {
      req.params.productId = 'p1';
      mockFindOne.mockResolvedValue(null);
      await removeFromSavedForLater(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should remove product', async () => {
      req.params.productId = 'p1';
      const doc = {
        products: [{ toString: () => 'p1' }, { toString: () => 'p2' }],
        save: jest.fn().mockResolvedValue(),
        populate: jest.fn().mockImplementation(function () {
          this.products = this.products.filter(p => p.toString() !== 'p1');
          return Promise.resolve(this);
        }),
      };
      mockFindOne.mockResolvedValue(doc);
      await removeFromSavedForLater(req, res, next);
      expect(doc.products).toHaveLength(1);
    });
  });

  describe('syncSavedItems', () => {
    it('should create new doc and merge items', async () => {
      req.body.items = ['p1', 'p2'];
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockResolvedDoc({ products: [] }));
      await syncSavedItems(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should merge unique items into existing', async () => {
      req.body.items = ['p2', 'p3'];
      const doc = {
        products: [{ toString: () => 'p1' }, { toString: () => 'p2' }],
        save: jest.fn().mockResolvedValue(),
        populate: jest.fn().mockResolvedValue({ products: ['p1', 'p2', 'p3'] }),
      };
      mockFindOne.mockResolvedValue(doc);
      await syncSavedItems(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle empty items array', async () => {
      req.body.items = [];
      const doc = {
        products: [{ toString: () => 'p1' }],
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({ products: [{ toString: () => 'p1' }] }),
      };
      mockFindOne.mockResolvedValue(doc);
      await syncSavedItems(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
