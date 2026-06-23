import Coupon from '../models/coupon.model.js';

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
    }

    const total = Number(orderTotal) || 0;
    if (total < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required`,
      });
    }

    const discount =
      coupon.type === 'percentage'
        ? (total * coupon.value) / 100
        : Math.min(coupon.value, total);

    res.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: Math.round(discount * 100) / 100,
        finalTotal: Math.round((total - discount) * 100) / 100,
      },
    });
  } catch (err) {
    console.error('[Coupon] validate error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
};

// Admin: create coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrderAmount, maxUses, expiresAt } = req.body;
    if (!code || !type || value === undefined) {
      return res.status(400).json({ success: false, message: 'code, type, and value are required' });
    }
    if (type === 'percentage' && (value <= 0 || value > 100)) {
      return res.status(400).json({ success: false, message: 'Percentage must be between 1 and 100' });
    }
    const coupon = await Coupon.create({ code, type, value, minOrderAmount, maxUses, expiresAt });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    console.error('[Coupon] create error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create coupon' });
  }
};

// Admin: list all coupons
export const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
};

// Admin: deactivate coupon
export const deactivateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndUpdate(
      { code: req.params.code.toUpperCase() },
      { isActive: false },
      { new: true }
    );
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to deactivate coupon' });
  }
};
