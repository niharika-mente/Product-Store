import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getSummary = async (req, res) => {
  try {
    const [revenueResult, totalOrders, totalUsers, totalProducts] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ paymentStatus: 'completed' }),
      User.countDocuments(),
      Product.countDocuments({ isDeleted: { $ne: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: revenueResult[0]?.total ?? 0,
        totalOrders,
        totalUsers,
        totalProducts,
      },
    });
  } catch (err) {
    console.error('[Analytics] Summary error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const since = monthsAgo(5);
    const rows = await Order.aggregate([
      { $match: { paymentStatus: 'completed', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const data = rows.map(r => ({
      month: `${MONTHS[r._id.month - 1]} ${r._id.year}`,
      revenue: r.revenue,
      orders: r.orders,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('[Analytics] Revenue error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue data' });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const rows = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Analytics] Top products error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch top products' });
  }
};

export const getUserGrowth = async (req, res) => {
  try {
    const since = monthsAgo(5);
    const rows = await User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const data = rows.map(r => ({
      month: `${MONTHS[r._id.month - 1]} ${r._id.year}`,
      newUsers: r.newUsers,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('[Analytics] User growth error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user growth' });
  }
};
