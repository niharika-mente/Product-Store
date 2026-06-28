import { jest } from '@jest/globals';
import { errorHandler, AppError, notFoundHandler } from '../middleware/errorMiddleware.js';

describe('Error Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      path: '/api/test',
      method: 'GET',
      requestId: 'test-request-id-123'
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack trace in development environment', () => {
      process.env.NODE_ENV = 'development';

      const error = new Error('Test Error');
      error.statusCode = 500;

      errorHandler(error, mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test Error',
        requestId: 'test-request-id-123',
        stack: error.stack
      });
    });

    it('should NOT include stack trace in production environment', () => {
      process.env.NODE_ENV = 'production';

      const error = new Error('Production Error');
      error.statusCode = 500;

      errorHandler(error, mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Production Error',
        requestId: 'test-request-id-123',
        stack: undefined
      });
    });

    it('should handle AppError correctly', () => {
      const error = new AppError('App specific error', 404);

      errorHandler(error, mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'App specific error'
        })
      );
    });

    it('should handle Mongoose ValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        field1: { message: 'Field 1 is required' },
        field2: { message: 'Field 2 is invalid' }
      };

      errorHandler(error, mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Field 1 is required, Field 2 is invalid'
        })
      );
    });

    it('should handle Mongoose duplicate key error (11000)', () => {
      const error = new Error('Duplicate key error');
      error.code = 11000;
      error.keyPattern = { email: 1 };

      errorHandler(error, mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message:
            'Duplicate field value: email. Please use another value.'
        })
      );
    });

    it('should handle Mongoose CastError', () => {
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';
      error.path = '_id';
      error.value = 'invalid_id_123';

      errorHandler(error, mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid _id: invalid_id_123'
        })
      );
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 JSON for /api routes', () => {
      mockRequest.path = '/api/unknown';
      mockRequest.method = 'POST';

      notFoundHandler(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'API route not found: POST /api/unknown',
        requestId: 'test-request-id-123'
      });

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() for non-API routes', () => {
      mockRequest.path = '/frontend-route';

      notFoundHandler(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should include requestId in API error responses', () => {
      mockRequest.path = '/api/missing-route';
      mockRequest.requestId = 'req-456';

      notFoundHandler(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'API route not found: GET /api/missing-route',
        requestId: 'req-456'
      });
    });
  });
});