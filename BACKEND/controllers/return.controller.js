import ReturnRequest from '../models/returnRequest.model.js';
import Order from '../models/order.model.js';

// @desc    Initiate a return request
// @route   POST /api/returns
// @access  Private
export const createReturnRequest = async (req, res) => {
  try {
    const { orderId, items } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items selected for return' });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.deliveryStatus !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
    }

    if (!order.deliveryDate) {
      return res.status(400).json({ success: false, message: 'Order delivery date is unknown, cannot verify eligibility' });
    }

    const daysSinceDelivery = (new Date() - new Date(order.deliveryDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 30) {
      return res.status(400).json({ success: false, message: 'Return window of 30 days has expired' });
    }

    // Check if a return request already exists for these items
    const existingReturns = await ReturnRequest.find({ orderId });
    for (const returnReq of existingReturns) {
      for (const reqItem of returnReq.items) {
        if (items.some(i => i.productId === reqItem.productId.toString())) {
          // Simplified validation: doesn't check exact quantities to avoid complex partial returns for now,
          // but prevents returning the same product twice.
          return res.status(400).json({ success: false, message: 'A return request already exists for one or more of these items.' });
        }
      }
    }

    // Calculate refund amount
    let refundAmount = 0;
    for (const item of items) {
      // Find the item in the original order to ensure the price is accurate
      const orderItem = order.items.find(i => i.product.toString() === item.productId);
      if (!orderItem) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found in this order` });
      }
      if (item.quantity > orderItem.quantity) {
        return res.status(400).json({ success: false, message: `Cannot return more quantity than ordered for product ${item.productId}` });
      }
      refundAmount += orderItem.price * item.quantity;
    }

    const newReturnRequest = new ReturnRequest({
      orderId,
      userId,
      items,
      refundAmount,
    });

    await newReturnRequest.save();

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully',
      returnRequest: newReturnRequest,
    });
  } catch (error) {
    console.error('Create Return Request Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get all return requests for logged in user
// @route   GET /api/returns/my-returns
// @access  Private
export const getMyReturnRequests = async (req, res) => {
  try {
    const returns = await ReturnRequest.find({ userId: req.user._id })
      .populate('orderId')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, returns });
  } catch (error) {
    console.error('Get My Returns Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get all return requests (Admin)
// @route   GET /api/returns
// @access  Private/Admin
// Bounds for offset-based pagination. The cap stops a single request from
// loading the whole collection into memory (the OOM / DoS vector), even when
// no pagination params are supplied or a huge limit is requested.
const RETURNS_DEFAULT_LIMIT = 20;
const RETURNS_MAX_LIMIT = 100;

export const getAllReturnRequests = async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    // Gracefully coerce missing / zero / negative / non-numeric values.
    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = RETURNS_DEFAULT_LIMIT;
    if (limit > RETURNS_MAX_LIMIT) limit = RETURNS_MAX_LIMIT;

    const skip = (page - 1) * limit;

    const [returns, totalReturns] = await Promise.all([
      ReturnRequest.find({})
        .populate('userId', 'name email')
        .populate('orderId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReturnRequest.countDocuments({}),
    ]);

    res.json({
      success: true,
      returns,
      pagination: {
        page,
        limit,
        totalReturns,
        totalPages: Math.ceil(totalReturns / limit),
      },
    });
  } catch (error) {
    console.error('Get All Returns Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Update return request status (Admin)
// @route   PUT /api/returns/:id/status
// @access  Private/Admin
export const updateReturnStatus = async (req, res) => {
  try {
    const { status, adminComments } = req.body;
    const returnReq = await ReturnRequest.findById(req.params.id);

    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    const validStatuses = ["Requested", "Under Review", "Approved", "Rejected", "Refund Initiated", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    returnReq.status = status;
    if (adminComments !== undefined) {
      returnReq.adminComments = adminComments;
    }

    // Optional: Add logic here to interact with Stripe or Payment Gateway for 'Refund Initiated'
    // if (status === 'Refund Initiated') { ... }

    await returnReq.save();

    res.json({
      success: true,
      message: 'Return request status updated',
      returnRequest: returnReq,
    });
  } catch (error) {
    console.error('Update Return Status Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
