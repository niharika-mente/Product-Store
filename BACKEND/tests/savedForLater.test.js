import { jest } from '@jest/globals';
import { getSavedItems, addToSavedForLater, removeFromSavedForLater, syncSavedItems } from '../controllers/savedForLater.controller.js';
import SavedForLater from '../models/savedForLater.model.js';

// Mock the model
jest.mock('../models/savedForLater.model.js');

describe('Saved For Later Controller Edge Cases', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { _id: 'user123' },
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getSavedItems', () => {
        it('should return empty array if no saved items doc exists for user', async () => {
            SavedForLater.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await getSavedItems(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
        });

        it('should filter out null products (deleted products) from populated array', async () => {
            SavedForLater.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    products: [
                        { _id: 'prod1', name: 'Valid Product' },
                        null // simulated deleted product
                    ]
                })
            });

            await getSavedItems(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [{ _id: 'prod1', name: 'Valid Product' }]
            });
        });
    });

    describe('addToSavedForLater', () => {
        it('should return 400 if productId is missing', async () => {
            await addToSavedForLater(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should create new document if user has no saved items', async () => {
            req.body.productId = 'prod1';
            SavedForLater.findOne.mockResolvedValue(null);
            
            const mockSave = jest.fn().mockResolvedValue();
            SavedForLater.mockImplementation(() => ({ save: mockSave }));

            await addToSavedForLater(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should not add duplicate product to existing list', async () => {
            req.body.productId = 'prod1';
            const existingDoc = {
                products: ['prod1'],
                save: jest.fn().mockResolvedValue()
            };
            SavedForLater.findOne.mockResolvedValue(existingDoc);

            await addToSavedForLater(req, res, next);

            // It should still return success, but not add duplicate
            expect(existingDoc.products.length).toBe(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('removeFromSavedForLater', () => {
        it('should return 400 if productId is missing', async () => {
            await removeFromSavedForLater(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        });

        it('should gracefully handle removal when user has no saved items doc', async () => {
            req.params.productId = 'prod1';
            SavedForLater.findOne.mockResolvedValue(null);

            await removeFromSavedForLater(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should filter out the product from existing list', async () => {
            req.params.productId = 'prod1';
            const existingDoc = {
                products: [{ toString: () => 'prod1' }, { toString: () => 'prod2' }],
                save: jest.fn().mockResolvedValue()
            };
            SavedForLater.findOne.mockResolvedValue(existingDoc);

            await removeFromSavedForLater(req, res, next);

            expect(existingDoc.products).toHaveLength(1);
            expect(existingDoc.products[0].toString()).toBe('prod2');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('syncSavedItems', () => {
        it('should create new doc with synced items if user has none', async () => {
            req.body.items = ['prod1', 'prod2'];
            SavedForLater.findOne.mockResolvedValue(null);
            
            const mockSave = jest.fn().mockResolvedValue();
            SavedForLater.mockImplementation(() => ({ save: mockSave, products: ['prod1', 'prod2'] }));

            await syncSavedItems(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should merge unique items if user already has saved items', async () => {
            req.body.items = ['prod2', 'prod3'];
            const existingDoc = {
                products: [{ toString: () => 'prod1' }, { toString: () => 'prod2' }],
                save: jest.fn().mockResolvedValue()
            };
            SavedForLater.findOne.mockResolvedValue(existingDoc);

            await syncSavedItems(req, res, next);

            // Should contain prod1, prod2, prod3
            expect(existingDoc.products).toHaveLength(3);
            expect(res.status).toHaveBeenCalledWith(200);
        });
        
        it('should ignore empty items array gracefully', async () => {
            req.body.items = [];
            SavedForLater.findOne.mockResolvedValue({
                products: [{ toString: () => 'prod1' }],
                save: jest.fn().mockResolvedValue()
            });

            await syncSavedItems(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});
